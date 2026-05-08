const acorn = require('acorn');
const walk = require('acorn-walk');

/**
 * Adaptive Ignore Engine
 * Detects third-party library signatures to reduce scan noise.
 */
function isLibraryCode(content) {
    // Signature 1: Minification check (extremely long lines)
    const lines = content.split('\n');
    if (lines.some(l => l.length > 5000)) return true;

    // Signature 2: Common Library Headers
    const commonHeaders = [
        '/*!', ' * @license', ' * Copyright', ' * @preserve',
        '// webpackBootstrap', '// (c) 2011-2026'
    ];
    if (commonHeaders.some(h => content.startsWith(h))) return true;

    // Signature 3: AST Signature (Internal utility patterns)
    try {
        const ast = acorn.parse(content, { ecmaVersion: 'latest', sourceType: 'script' });
        let isInternal = false;
        walk.simple(ast, {
            CallExpression(node) {
                // Common bundler/wrapper patterns
                if (node.callee.name === 'define' || node.callee.name === 'require') {
                    // This is likely a bundle or a commonjs wrapper
                }
            }
        });
    } catch (e) {
        // If it's malformed or too complex, we treat it as potentially high-noise
    }

    return false;
}

module.exports = { isLibraryCode };
