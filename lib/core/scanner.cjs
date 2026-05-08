const fs = require('fs');
const path = require('path');
const readline = require('readline');
const acorn = require('acorn');
const walk = require('acorn-walk');
const { getIgnoreList } = require('./policy.cjs');

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_LINE_LENGTH = 5000;         // 5KB line limit
const MAX_FILE_COUNT = 5000;
const MAX_DEPTH = 20;
const MAX_SCAN_TIME = 200;            // 200ms per file limit
const MAX_FINDINGS = 1000;             // Findings ceiling

// Non-global patterns for stateless test() optimization
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
function deepAudit(content, vars) {
    try {
        const ast = acorn.parse(content, { ecmaVersion: 'latest', sourceType: 'module', allowImportExportEverywhere: true });
        walk.simple(ast, {
            MemberExpression(node) {
                if (node.object.type === 'MemberExpression' && node.object.object.name === 'process' && node.object.property.name === 'env') {
                    if (node.property.type === 'Identifier') vars.add(node.property.name);
                    if (node.property.type === 'Literal') vars.add(node.property.value);
                }
            },
            VariableDeclarator(node) {
                if (node.id.type === 'ObjectPattern' && node.init && node.init.type === 'MemberExpression' && node.init.object.name === 'process' && node.init.property.name === 'env') {
                    node.id.properties.forEach(prop => {
                        if (prop.key.type === 'Identifier') vars.add(prop.key.name);
                    });
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
    if (depth > MAX_DEPTH || fileCount > MAX_FILE_COUNT) return { vars, hardcodedSecrets };
    
    const resolvedDir = path.resolve(dir);
    if (resolvedDir !== workspaceRoot && !resolvedDir.startsWith(workspaceRoot + path.sep)) {
        return { vars, hardcodedSecrets };
    }

    const ignored = getIgnoreList(resolvedDir);
    const files = fs.readdirSync(resolvedDir);

    for (const file of files) {
        if (ignored.includes(file)) continue;
        const fullPath = path.join(resolvedDir, file);
        const stats = fs.lstatSync(fullPath);

        if (stats.isSymbolicLink()) continue;
        if (stats.isDirectory()) {
            const allowed = ['src', 'xoras', 'bin', 'lib'];
            if (!allowed.includes(file) && depth === 0) continue;
            if (['node_modules', 'dist', 'build', '.next', '.git', '.cache', 'coverage', 'sandbox', 'infra', 'tests', 'out'].includes(file)) continue;
            await scanSource(fullPath, vars, hardcodedSecrets, depth + 1, workspaceRoot);
        } else if (file.match(/\.(tsx|jsx|js|ts|mjs|cjs)$/)) {
            if (stats.size > MAX_FILE_SIZE) continue;
            fileCount++;

            const content = fs.readFileSync(fullPath, 'utf8');
            const relativePath = path.relative(workspaceRoot, fullPath);
            const startTime = Date.now();
            
            // 1. Structural Audit (High Fidelity)
            const astSuccess = deepAudit(content, vars);

            // 2. Optimized Scan Loop
            const lines = content.split(/\r?\n/);
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.length > MAX_LINE_LENGTH) continue;
                if (Date.now() - startTime > MAX_SCAN_TIME) break; // Timeout Guard
                if (hardcodedSecrets.length >= MAX_FINDINGS) break; // Findings Cap

                if (!astSuccess) {
                    const envRegex = /process\.env(?:\.([A-Z_][A-Z0-9_]*)|\[['"]([A-Z_][A-Z0-9_]*)['"]\])/g;
                    let match;
                    while ((match = envRegex.exec(line)) !== null) {
                        vars.add(match[1] || match[2]);
                    }
                }

                for (const pattern of SECRET_PATTERNS) {
                    if (pattern.regex.test(line)) {
                        hardcodedSecrets.push({ file: relativePath, type: pattern.name, line: i + 1 });
                        break; 
                    }
                }
            }
        }
    }
    return { vars, hardcodedSecrets };
}

module.exports = { scanSource };
