const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const acorn = require('acorn');
const walk = require('acorn-walk');
let esbuild = null;
try {
    esbuild = require('esbuild');
} catch (e) {
    // Graceful fallback if esbuild is not yet installed
}

const { getIgnoreList, loadConfig, getSecretPatterns, auditComplianceZone } = require('./policy.cjs');
const { auditEntropy } = require('./entropy.cjs');
const { scanMalware } = require('./malware.cjs');
const { getTrace } = require('./tracer.cjs');

const CONFIG = loadConfig();
const MAX_FILE_SIZE = CONFIG.thresholds.maxFileSize;
const MAX_LINE_LENGTH = 5000;
const MAX_FILE_COUNT = 5000;
const MAX_DEPTH = 20;
const MAX_SCAN_TIME = CONFIG.thresholds.maxScanTime;
const MAX_FINDINGS = CONFIG.thresholds.maxFindings;

// Resource limits
const MEMORY_THRESHOLD = 0.98;

// Load configuration schema for validation
const SCHEMA_PATH = path.join(process.cwd(), CONFIG.schema || '.sentry-schema.json');
const SCHEMA = fs.existsSync(SCHEMA_PATH) ? JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8')).schemas : {};

const SECRET_PATTERNS = getSecretPatterns();

let fileCount = 0;

/**
 * Perform a deep structural audit of a file using AST analysis.
 * Enforces:
 * 1. Hardcoded credential and secret pattern recognition
 * 2. Next.js React App Router 'use client' boundary validation
 * 3. Dynamic and static process.env variable collection
 */
function deepAudit(content, vars, hardcodedSecrets, relativePath, patterns = SECRET_PATTERNS) {
    try {
        const ext = path.extname(relativePath).toLowerCase();
        let parseableContent = content;

        // Step 1: Pre-transpile TypeScript and JSX to standard JavaScript AST if needed
        if (['.ts', '.tsx', '.jsx'].includes(ext) && esbuild) {
            try {
                const loader = ext === '.tsx' ? 'tsx' : ext === '.ts' ? 'ts' : 'jsx';
                const result = esbuild.transformSync(content, {
                    loader,
                    format: 'esm',
                    target: 'esnext'
                });
                parseableContent = result.code;
            } catch (err) {
                // If esbuild fails, fall back to parsing original content
                parseableContent = content;
            }
        }

        const combinedRegex = new RegExp(patterns.map(p => p.regex.source).join('|'), 'i');
        const hasPotentialSecret = combinedRegex.test(parseableContent);
        const hasProcessEnv = parseableContent.includes('process.env');
        const hasUseClient = parseableContent.includes('use client') || content.includes('use client');

        if (!hasPotentialSecret && !hasProcessEnv && !hasUseClient) {
            return true;
        }

        const ast = acorn.parse(parseableContent, { 
            ecmaVersion: 'latest', 
            sourceType: 'module', 
            allowImportExportEverywhere: true, 
            locations: true 
        });

        // Step 2: Detect Next.js 'use client' directive at file root scope
        let isClientComponent = false;
        if (ast.body && ast.body.length > 0) {
            for (let i = 0; i < Math.min(ast.body.length, 5); i++) {
                const node = ast.body[i];
                if (node.type === 'ExpressionStatement' && node.expression.type === 'Literal') {
                    if (node.expression.value === 'use client' || node.directive === 'use client') {
                        isClientComponent = true;
                        break;
                    }
                }
            }
        }
        
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

                        // Next.js 'use client' boundary validation rule
                        if (isClientComponent && !varName.startsWith('NEXT_PUBLIC_')) {
                            hardcodedSecrets.push({
                                file: relativePath,
                                type: 'CLIENT_BOUNDARY_LEAK',
                                line: lineNum,
                                trace: `Client component ('use client') exposed server environment variable: process.env.${varName}. Must be prefixed with NEXT_PUBLIC_.`
                            });
                        }
                    }

                    if (node.property.type === 'TemplateLiteral') {
                        let resolved = '';
                        let possible = true;
                        const expressions = node.property.expressions;
                        const quasis = node.property.quasis;
                        for (let i = 0; i < quasis.length; i++) {
                            resolved += quasis[i].value.cooked;
                            if (i < expressions.length) {
                                const expr = expressions[i];
                                if (expr.type === 'Literal' && typeof expr.value === 'string') resolved += expr.value;
                                else { possible = false; break; }
                            }
                        }
                        if (possible && resolved) {
                            vars.set(resolved, { file: relativePath, line: lineNum, trace: getTrace(node, lineContent) });
                            if (isClientComponent && !resolved.startsWith('NEXT_PUBLIC_')) {
                                hardcodedSecrets.push({
                                    file: relativePath,
                                    type: 'CLIENT_BOUNDARY_LEAK',
                                    line: lineNum,
                                    trace: `Client component ('use client') exposed server environment variable: process.env.${resolved}. Must be prefixed with NEXT_PUBLIC_.`
                                });
                            }
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

/**
 * Scan a single file or a collection of explicit files directly.
 */
async function scanFile(fullPath, workspaceRoot, vars, hardcodedSecrets, patterns) {
    const stats = fs.lstatSync(fullPath);
    if (stats.isSymbolicLink() || stats.isDirectory()) return;
    if (stats.size > MAX_FILE_SIZE) return;

    fileCount++;
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
 */
async function scanSource(dirOrFiles, vars = new Map(), hardcodedSecrets = [], depth = 0, root = null) {
    const patterns = getSecretPatterns();
    const workspaceRoot = root || (Array.isArray(dirOrFiles) ? process.cwd() : path.resolve(dirOrFiles));

    // Support explicit array of files (e.g. from --delta git changeset)
    if (Array.isArray(dirOrFiles)) {
        for (const filePath of dirOrFiles) {
            const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(workspaceRoot, filePath);
            if (fs.existsSync(absolutePath)) {
                await scanFile(absolutePath, workspaceRoot, vars, hardcodedSecrets, patterns);
            }
        }
    } else {
        if (depth > MAX_DEPTH || fileCount > MAX_FILE_COUNT) return { vars, hardcodedSecrets, schemaViolations: [] };

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
                await scanSource(fullPath, vars, hardcodedSecrets, depth + 1, workspaceRoot);
            } else if (file.match(/\.(tsx|jsx|js|ts|mjs|cjs)$/)) {
                await scanFile(fullPath, workspaceRoot, vars, hardcodedSecrets, patterns);
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
                if (rule.min_length && value.length < rule.min_length) schemaViolations.push({ var: v, error: `Too Short`, trace: meta.trace });
                if (rule.regex && !new RegExp(rule.regex).test(value)) schemaViolations.push({ var: v, error: `Format Mismatch`, trace: meta.trace });
            }
        } else {
            hallucinations.push({ var: v, file: meta.file, line: meta.line, trace: meta.trace });
        }
    });

    return { vars, hardcodedSecrets, schemaViolations, hallucinations };
}

module.exports = { scanSource, SECRET_PATTERNS, deepAudit };
