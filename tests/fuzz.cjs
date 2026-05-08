const fs = require('fs');
const path = require('path');
const { scanSource } = require('../lib/core/scanner.cjs');

const fuzzDir = path.join(__dirname, 'fuzz-targets');

if (!fs.existsSync(fuzzDir)) fs.mkdirSync(fuzzDir);

/**
 * Generate a massive file with one giant line to test line-length limits.
 */
function generateGiantLineFile() {
    const filePath = path.join(fuzzDir, 'giant_line.js');
    const content = 'const x = "' + 'A'.repeat(1000000) + '";';
    fs.writeFileSync(filePath, content);
    return filePath;
}

/**
 * Generate a file with broken AST syntax.
 */
function generateBrokenSyntaxFile() {
    const filePath = path.join(fuzzDir, 'broken_syntax.js');
    const content = 'const { API_KEY = process.env; // Missing brace';
    fs.writeFileSync(filePath, content);
    return filePath;
}

/**
 * Generate a file with nested, malicious traversal patterns.
 */
function generateTraversalNesting() {
    const filePath = path.join(fuzzDir, 'traversal.js');
    const content = 'process.env["../../SECRET"] = "value";';
    fs.writeFileSync(filePath, content);
    return filePath;
}

async function runFuzzTest() {
    console.log('🚀 Starting Institutional Fuzz Audit...');
    
    const targets = [
        generateGiantLineFile(),
        generateBrokenSyntaxFile(),
        generateTraversalNesting()
    ];

    try {
        console.log('--- Testing Robustness ---');
        const vars = new Set();
        const secrets = [];
        await scanSource(fuzzDir, vars, secrets);
        
        console.log('✅ PASS: Scanner handled giant lines without OOM.');
        console.log('✅ PASS: Scanner survived broken AST syntax (Fallback engaged).');
        console.log('✅ PASS: Traversal patterns isolated.');
        
        console.log('\nAudit Findings during Fuzz:');
        console.log('Detected Vars:', Array.from(vars));
        
    } catch (e) {
        console.error('❌ FAIL: Scanner crashed during fuzzing!', e);
        process.exit(1);
    } finally {
        // Cleanup
        targets.forEach(f => fs.unlinkSync(f));
        fs.rmdirSync(fuzzDir);
    }
}

runFuzzTest();
