const fs = require('fs');
const path = require('path');
const os = require('os');
const acorn = require('acorn');
const walk = require('acorn-walk');
let esbuild = null;
try {
    esbuild = require('esbuild');
} catch (e) {
    // Soft fallback if not present
}

const { getIgnoreList, loadConfig, getSecretPatterns, auditComplianceZone } = require('./policy.cjs');
const { auditEntropy } = require('./entropy.cjs');
const { scanMalware } = require('./malware.cjs');
const { getTrace } = require('./tracer.cjs');

const CONFIG = loadConfig();
const MAX_FILE_SIZE = CONFIG.thresholds.maxFileSize;
const MAX_FILE_COUNT = 5000;
const MAX_DEPTH = 20;

// Resource limits
const MEMORY_THRESHOLD = 0.98;

// Load configuration schema for validation
const SCHEMA_PATH = path.join(process.cwd(), CONFIG.schema || '.sentry-schema.json');
const SCHEMA = fs.existsSync(SCHEMA_PATH) ? JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8')).schemas : {};

const SECRET_PATTERNS = getSecretPatterns();

/**
 * Check if code contains 'use client' directive
 */
function checkUseClient(content, ast) {
    // 1. AST body directives check
    if (ast && ast.body) {
        for (let i = 0; i < Math.min(ast.body.length, 10); i++) {
            const node = ast.body[i];
            if (node.type === 'ExpressionStatement' && node.expression.type === 'Literal') {
                if (node.expression.value === 'use client' || node.directive === 'use client') {
                    return true;
                }
            }
        }
    }
    // 2. Fallback regex for directives stripped or moved before first statement
    const firstLines = content.split('\n').slice(0, 15).join('\n');
    return /^\s*['"]use client['"]/m.test(firstLines);
}

/**
 * Perform a deep structural audit of a file using AST analysis.
 */
function deepAudit(content, vars, hardcodedSecrets, relativePath, patterns = SECRET_PATTERNS) {
    const ext = path.extname(relativePath).toLowerCase();
    let parseableContent = content;

    // Pre-transpile TypeScript and JSX to standard JavaScript AST
    if (['.ts', '.tsx', '.jsx'].includes(ext)) {
        if (!esbuild) {
            // If scanning TSX/TS without esbuild, fail-closed on type-annotated files
            if (content.includes('interface ') || content.includes(': ') || content.includes('<')) {
                throw new Error(`esbuild is required to safely parse TypeScript and JSX files: ${relativePath}`);
            }
        } else {
            try {
                const loader = ext === '.tsx' ? 'tsx' : ext === '.ts' ? 'ts' : 'jsx';
                const result = esbuild.transformSync(content, {
                    loader,
                    format: 'esm',
                    target: 'esnext'
                });
                parseableContent = result.code;
            } catch (err) {
                // If esbuild throws a syntax error, let it bubble up for fail-closed visibility
                throw new Error(`Failed to compile ${relativePath} for AST scanning: ${err.message}`);
            }
        }
    }

    const combinedRegex = new RegExp(patterns.map(p => p.regex.source).join('|'), 'i');
    const hasPotentialSecret = combinedRegex.test(parseableContent);
    const hasProcessEnv = parseableContent.includes('process.env');
    const hasUseClient = checkUseClient(content, null);

    if (!hasPotentialSecret && !hasProcessEnv && !hasUseClient) {
        return true;
    }

    const ast = acorn.parse(parseableContent, { 
        ecmaVersion: 'latest', 
        sourceType: 'module', 
        allowImportExportEverywhere: true, 
        locations: true 
    });

    const isClientComponent = checkUseClient(content, ast);
    
    walk.simple(ast, {
        Property(node) {
            const defaultSafeKeys = ['key', 'name', 'type', 'algorithm', 'side'];
            const ignoreList = getIgnoreList(path.dirname(relativePath));
            
            if (node.key.type === 'Identifier' && (defaultSafeKeys.includes(node.key.name) || ignoreList.includes(node.key.name))) return;
            if (node.key.type === 'Literal' && (defaultSafeKeys.includes(node.key.value) || ignoreList.includes(node.key.value))) return;

            if (node.value.type === 'Literal' && typeof node.value.value === 'string') {
                for (const pattern of patterns) {
                    if (pattern.regex.test(node.value.value)) {
                        hardcodedSecrets.push({ 
                            file: relativePath, 
                            type: pattern.name, 
                            line: node.value.loc?.start.line || 0,
                            trace: getTrace(node.value, content.split('\n')[(node.value.loc?.start.line || 1) - 1] || '')
                        });
                    }
                }
            }
        },
        Literal(node) {
            if (typeof node.value === 'string') {
                for (const pattern of patterns) {
                    if (pattern.regex.test(node.value)) {
                        if (!hardcodedSecrets.some(s => s.file === relativePath && s.line === (node.loc?.start.line || 0))) {
                            hardcodedSecrets.push({ 
                                file: relativePath, 
                                type: pattern.name, 
                                line: node.loc?.start.line || 0,
                                trace: getTrace(node, content.split('\n')[(node.loc?.start.line || 1) - 1] || '')
                            });
                        }
                    }
                }
            }
        },
        // Handles process.env.KEY and process.env['KEY']
        MemberExpression(node) {
            if (node.object.type === 'MemberExpression' && node.object.object.name === 'process' && node.object.property.name === 'env') {
                let varName = null;
                if (node.computed) {
                    if (node.property.type === 'Literal' && typeof node.property.value === 'string') {
                        varName = node.property.value;
                    }
                } else {
                    if (node.property.type === 'Identifier') {
                        varName = node.property.name;
                    }
                }
                
                const lineNum = node.loc?.start.line || 0;
                const lineContent = content.split('\n')[lineNum > 0 ? lineNum - 1 : 0] || '';

                if (varName) {
                    vars.set(varName, { file: relativePath, line: lineNum, trace: getTrace(node, lineContent) });

                    if (isClientComponent && !varName.startsWith('NEXT_PUBLIC_')) {
                        hardcodedSecrets.push({
                            file: relativePath,
                            type: 'CLIENT_BOUNDARY_LEAK',
                            line: lineNum,
                            trace: `Client component ('use client') exposed server environment variable: process.env.${varName}. Must be prefixed with NEXT_PUBLIC_.`
                        });
                    }
                }
            }
        },
        // Handles destructuring: const { STRIPE_KEY, OTHER: aliased } = process.env;
        VariableDeclarator(node) {
            if (node.init && node.init.type === 'MemberExpression') {
                if (node.init.object.name === 'process' && node.init.property.name === 'env') {
                    if (node.id.type === 'ObjectPattern') {
                        const lineNum = node.loc?.start.line || 0;
                        const lineContent = content.split('\n')[lineNum > 0 ? lineNum - 1 : 0] || '';
                        
                        node.id.properties.forEach(prop => {
                            const varName = prop.key ? (prop.key.name || prop.key.value) : null;
                            if (varName && typeof varName === 'string') {
                                vars.set(varName, { file: relativePath, line: lineNum, trace: getTrace(prop, lineContent) });
                                if (isClientComponent && !varName.startsWith('NEXT_PUBLIC_')) {
                                    hardcodedSecrets.push({
                                        file: relativePath,
                                        type: 'CLIENT_BOUNDARY_LEAK',
                                        line: lineNum,
                                        trace: `Client component ('use client') destructured server environment variable: { ${varName} } from process.env.`
                                    });
                                }
                            }
                        });
                    }
                }
            }
        }
    });

    return true;
}

/**
 * Scan a single file or a collection of explicit files directly.
 */
async function scanFile(fullPath, workspaceRoot, vars, hardcodedSecrets, patterns, counters) {
    const stats = fs.lstatSync(fullPath);
    if (stats.isSymbolicLink() || stats.isDirectory()) return;
    if (stats.size > MAX_FILE_SIZE) return;

    counters.fileCount++;
    const content = fs.readFileSync(fullPath, 'utf8');
    const relativePath = path.relative(workspaceRoot, fullPath);

    deepAudit(content, vars, hardcodedSecrets, relativePath, patterns);
    auditEntropy(content, relativePath, hardcodedSecrets);
    scanMalware(content, relativePath, hardcodedSecrets);

    const complianceViolations = auditComplianceZone(content, relativePath);
    for (let j = 0; j < complianceViolations.length; j++) {
        const v = complianceViolations[j];
        hardcodedSecrets.push({
            file: v.file,
            type: 'COMPLIANCE_VIOLATION',
            line: 1,
            trace: `Required: ${v.requiredZone} // Found: ${v.violation}`
        });
    }
}

/**
 * Scan source directory or an explicit list of target files.
 * Counters are scoped per invocation to prevent global bleed across runs.
 */
async function scanSource(dirOrFiles, vars = new Map(), hardcodedSecrets = [], depth = 0, root = null, counters = { fileCount: 0 }) {
    const patterns = getSecretPatterns();
    const workspaceRoot = root || (Array.isArray(dirOrFiles) ? process.cwd() : path.resolve(dirOrFiles));

    if (Array.isArray(dirOrFiles)) {
        for (const filePath of dirOrFiles) {
            const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(workspaceRoot, filePath);
            if (fs.existsSync(absolutePath)) {
                await scanFile(absolutePath, workspaceRoot, vars, hardcodedSecrets, patterns, counters);
            }
        }
    } else {
        if (depth > MAX_DEPTH || counters.fileCount > MAX_FILE_COUNT) return { vars, hardcodedSecrets, schemaViolations: [] };

        const freeMem = os.freemem() / os.totalmem();
        if (freeMem < (1 - MEMORY_THRESHOLD)) {
            await new Promise(r => setTimeout(r, 100));
        }

        const resolvedDir = path.resolve(dirOrFiles);
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
                await scanSource(fullPath, vars, hardcodedSecrets, depth + 1, workspaceRoot, counters);
            } else if (file.match(/\.(tsx|jsx|js|ts|mjs|cjs)$/)) {
                await scanFile(fullPath, workspaceRoot, vars, hardcodedSecrets, patterns, counters);
            }
        }
    }

    const schemaViolations = [];
    const hallucinations = [];

    const SYSTEM_VARS = ['LANG', 'LC_ALL', 'PATH', 'PWD', 'HOME', 'USER', 'SHELL', 'TERM', 'SHLVL', '_'];
    vars.forEach((meta, v) => {
        if (SYSTEM_VARS.includes(v)) return;
        
        if (SCHEMA[v]) {
            const rule = SCHEMA[v];
            const value = process.env[v];
            if (rule.required && !value) schemaViolations.push({ var: v, error: `Missing Required Value`, trace: meta.trace });
            if (value) {
                // Support both camelCase and snake_case schema definitions
                const minLen = rule.minLength || rule.min_length;
                const prefix = rule.prefix;
                if (minLen && value.length < minLen) schemaViolations.push({ var: v, error: `Too Short (min ${minLen})`, trace: meta.trace });
                if (prefix && !value.startsWith(prefix)) schemaViolations.push({ var: v, error: `Prefix Mismatch (expected ${prefix})`, trace: meta.trace });
                if (rule.regex && !new RegExp(rule.regex).test(value)) schemaViolations.push({ var: v, error: `Format Mismatch`, trace: meta.trace });
            }
        } else {
            hallucinations.push({ var: v, file: meta.file, line: meta.line, trace: meta.trace });
        }
    });

    return { vars, hardcodedSecrets, schemaViolations, hallucinations };
}

module.exports = { scanSource, SECRET_PATTERNS, deepAudit };
