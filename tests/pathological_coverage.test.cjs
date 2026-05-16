const assert = require('node:assert');
const test = require('node:test');
const fs = require('fs');
const path = require('path');
const { scanSource } = require('../packages/core/src/scanner.cjs');

const TEST_DIR = path.resolve('./tests/sandbox_stress');

test.before(() => {
    if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true });
    fs.mkdirSync(TEST_DIR, { recursive: true });
});

test('B: Baseline - Standard Detection', async () => {
    const filePath = path.join(TEST_DIR, 'baseline.js');
    fs.writeFileSync(filePath, 'const key = "sk_test_123456789012345678901234";');
    const { hardcodedSecrets } = await scanSource(TEST_DIR);
    assert.strictEqual(hardcodedSecrets.length, 1, 'Should detect standard Stripe key');
});

test('A: Autonomous - Symlink Attack Mitigation', async () => {
    const linkPath = path.join(TEST_DIR, 'loop_link');
    try {
        fs.symlinkSync(TEST_DIR, linkPath); // Create a recursive loop
    } catch (e) {
        // Skip if symlinks are not supported by OS/Permissions
        return;
    }
    
    const { hardcodedSecrets } = await scanSource(TEST_DIR);
    // If it doesn't hang/crash, it passed the depth/symlink guard
    assert.ok(true, 'Symlink loop did not crash the scanner');
});

test('C: Coverage - AST Shadowing (Aliasing)', async () => {
    const filePath = path.join(TEST_DIR, 'aliasing.js');
    fs.writeFileSync(filePath, `
        const p = process;
        const e = p.env;
        const key = e.STRIPE_KEY;
    `);
    const { vars } = await scanSource(TEST_DIR);
    // Current limitation: Simple AST only tracks process.env.X
    // This test documents the boundary of the current engine.
    assert.ok(vars.has('STRIPE_KEY') === false, 'Documented limitation: Complex aliasing requires deeper data-flow analysis');
});

test('C: Coverage - Malformed/Binary Input', async () => {
    const filePath = path.join(TEST_DIR, 'malformed.js');
    fs.writeFileSync(filePath, Buffer.from([0x00, 0xff, 0xde, 0xad, 0xbe, 0xef]));
    try {
        await scanSource(TEST_DIR);
        assert.ok(true, 'Binary input did not crash the scanner');
    } catch (e) {
        assert.fail('Scanner crashed on binary input');
    }
});

test('C: Coverage - Deep Nesting Guard', async () => {
    let currentDir = TEST_DIR;
    for (let i = 0; i < 25; i++) {
        currentDir = path.join(currentDir, `depth_${i}`);
        fs.mkdirSync(currentDir, { recursive: true });
    }
    fs.writeFileSync(path.join(currentDir, 'deep.js'), 'const k = "sk_test_123456789012345678901234";');
    
    const { hardcodedSecrets } = await scanSource(TEST_DIR);
    // Max depth is 20, so deep.js should be ignored
    assert.strictEqual(hardcodedSecrets.length, 1, 'Should only detect 1 secret (from baseline.js), ignoring files deeper than 20 levels');
});

test.after(() => {
    // fs.rmSync(TEST_DIR, { recursive: true });
});
