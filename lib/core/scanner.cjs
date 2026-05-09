const fs = require('fs');
const path = require('path');
const os = require('os');
const acorn = require('acorn');
const walk = require('acorn-walk');
const { getIgnoreList, loadConfig } = require('./policy.cjs');
const { auditEntropy } = require('./entropy.cjs');
const { scanMalware } = require('./malware.cjs');

const CONFIG = loadConfig();
const MAX_FILE_SIZE = CONFIG.thresholds.maxFileSize;
const MAX_LINE_LENGTH = 5000;
const MAX_FILE_COUNT = 5000;
const MAX_DEPTH = 20;
const MAX_SCAN_TIME = CONFIG.thresholds.maxScanTime;
const MAX_FINDINGS = CONFIG.thresholds.maxFindings;

// Hardware Guard: Throttle if memory pressure is high
const MEMORY_THRESHOLD = 0.98; // 98% total memory (Throttles when < 2% free)

// Load configuration schema for validation
const SCHEMA_PATH = path.join(process.cwd(), CONFIG.schema || '.sentry-schema.json');
const SCHEMA = fs.existsSync(SCHEMA_PATH) ? JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8')).schemas : {};

// Patterns for credential detection (stateless optimization)
const SECRET_PATTERNS = [
    { name: 'AWS', regex: /AKIA[a-zA-Z0-9]{16}/ },
    { name: 'Stripe', regex: /sk_live_[a-zA-Z0-9]{24,}/ },
    { name: 'OpenAI', regex: /sk-[a-zA-Z0-9]{20,}/ },
    { name: 'Google', regex: /AIza[a-zA-Z0-9_-]{35}/ },
    { name: 'Generic', regex: /(?:key|secret|token|password|auth|api|id)['"]?\s*[:=]\s*['"]([a-zA-Z0-9_\-\.]{20,})['"]/i }
];

let fileCount = 0;

/**
 * Perform a deep structural audit of a file using AST analysis.
 */
function deepAudit(content, vars, hardcodedSecrets, relativePath) {
    try {
        const ast = acorn.parse(content, { 
            ecmaVersion: 'latest', 
            sourceType: 'module', 
            allowImportExportEverywhere: true, 
            locations: true 
        });
        
        walk.simple(ast, {
            Property(node) {
                const defaultSafeKeys = ['key', 'name', 'type', 'algorithm', 'side'];
                const ignoreList = getIgnoreList(path.dirname(relativePath));
                
                if (node.key.type === 'Identifier' && (defaultSafeKeys.includes(node.key.name) || ignoreList.includes(node.key.name))) return;
                if (node.key.type === 'Literal' && (defaultSafeKeys.includes(node.key.value) || ignoreList.includes(node.key.value))) return;

                if (node.value.type === 'Literal' && typeof node.value.value === 'string') {
                    for (const pattern of SECRET_PATTERNS) {
                        if (pattern.regex.test(node.value.value)) {
                            hardcodedSecrets.push({ file: relativePath, type: pattern.name, line: node.value.loc?.start.line || 0 });
                        }
                    }
                }
            },
            Literal(node) {
                if (typeof node.value === 'string') {
                    for (const pattern of SECRET_PATTERNS) {
                        if (pattern.regex.test(node.value)) {
                            if (!hardcodedSecrets.some(s => s.file === relativePath && s.line === (node.loc?.start.line || 0))) {
                                hardcodedSecrets.push({ file: relativePath, type: pattern.name, line: node.loc?.start.line || 0 });
                            }
                        }
                    }
                }
            },
            MemberExpression(node) {
                if (node.object.type === 'MemberExpression' && node.object.object.name === 'process' && node.object.property.name === 'env') {
                    if (node.property.type === 'Identifier') vars.add(node.property.name);
                    if (node.property.type === 'Literal') vars.add(node.property.value);
                    if (node.property.type === 'TemplateLiteral') {
                        // Resolve simple template literals (e.g. `API_KEY` or `${'STRIPE'}_KEY`)
                        let resolved = '';
                        let possible = true;
                        
                        const expressions = node.property.expressions;
                        const quasis = node.property.quasis;
                        
                        for (let i = 0; i < quasis.length; i++) {
                            resolved += quasis[i].value.cooked;
                            if (i < expressions.length) {
                                const expr = expressions[i];
                                if (expr.type === 'Literal' && typeof expr.value === 'string') {
                                    resolved += expr.value;
                                } else {
                                    possible = false;
                                    break;
                                }
                            }
                        }
                        
                        if (possible && resolved) {
                            vars.add(resolved);
                        }
                    }
                }
            }
        });
    } catch (e) {
        return false;
    }
    return true;
}

async function scanSource(dir, vars = new Set(), hardcodedSecrets = [], depth = 0, root = null) {
    const workspaceRoot = root || path.resolve(dir);
    if (depth > MAX_DEPTH || fileCount > MAX_FILE_COUNT) return { vars, hardcodedSecrets, schemaViolations: [] };
    
    // Hardware Guard: Resource Throttling
    const freeMem = os.freemem() / os.totalmem();
    if (freeMem < (1 - MEMORY_THRESHOLD)) {
        console.warn(`[HARDWARE_GUARD] High Memory Pressure Detected. Throttling...`);
        await new Promise(r => setTimeout(r, 100)); // Pause to let GC work
    }

    const resolvedDir = path.resolve(dir);
    const ignored = getIgnoreList(resolvedDir);
    const files = fs.readdirSync(resolvedDir);

    for (const file of files) {
        if (ignored.includes(file)) continue;
        const fullPath = path.join(resolvedDir, file);
        const stats = fs.lstatSync(fullPath);

        if (stats.isSymbolicLink()) continue;
        if (stats.isDirectory()) {
            const personalFolders = ['Desktop', 'Documents', 'Downloads', 'Pictures', 'Music', 'Movies', 'Library'];
            if (personalFolders.includes(file) && depth === 0 && !fullPath.includes('GitHub')) {
                 continue;
            }
            const standardIgnore = ['node_modules', 'dist', 'build', '.next', '.git', '.cache', 'coverage', 'sandbox', 'infra', 'tests', 'out'];
            if (standardIgnore.includes(file) && depth > 0) continue;
            await scanSource(fullPath, vars, hardcodedSecrets, depth + 1, workspaceRoot);
        } else if (file.match(/\.(tsx|jsx|js|ts|mjs|cjs)$/)) {
            if (stats.size > MAX_FILE_SIZE) continue;
            fileCount++;

            const content = fs.readFileSync(fullPath, 'utf8');
            const relativePath = path.relative(workspaceRoot, fullPath);
            
            deepAudit(content, vars, hardcodedSecrets, relativePath);
            auditEntropy(content, relativePath, hardcodedSecrets);
            scanMalware(content, relativePath, hardcodedSecrets);
        }
    }

    const schemaViolations = [];
    vars.forEach(v => {
        if (SCHEMA[v]) {
            const rule = SCHEMA[v];
            const value = process.env[v];
            if (value) {
                if (rule.prefix && !value.startsWith(rule.prefix)) schemaViolations.push({ var: v, error: `Invalid Prefix (Expected ${rule.prefix})` });
                if (rule.minLength && value.length < rule.minLength) schemaViolations.push({ var: v, error: `Too Short (Min: ${rule.minLength})` });
                if (rule.regex && !new RegExp(rule.regex).test(value)) schemaViolations.push({ var: v, error: `Format Mismatch` });
            }
        }
    });

    return { vars, hardcodedSecrets, schemaViolations };
}

module.exports = { scanSource, SECRET_PATTERNS };
