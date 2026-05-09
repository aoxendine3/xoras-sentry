const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { scanSource } = require('../lib/core/scanner.cjs');
const { audit } = require('../lib/core/verifier.cjs');

test('Env-Integrity-Sentry Audit Logic', async (t) => {
    const testDir = path.join(__dirname, 'temp_test_project');
    
    // Setup temporary test project
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);
    fs.writeFileSync(path.join(testDir, 'index.js'), "const apiKey = process.env.API_KEY;\nconst DUMMY_SECRET = 'sk-XXXXX-TEST-VALUE';");
    fs.writeFileSync(path.join(testDir, '.env'), "DATABASE_URL=postgres://localhost:5432/db");
    fs.writeFileSync(path.join(testDir, '.env.example'), "API_KEY=\nDATABASE_URL=");

    await t.test('Should detect missing required variables', async () => {
        const { vars } = await scanSource(testDir);
        const { missingFromEnv } = audit(testDir, vars);
        
        const hasApiKey = missingFromEnv.some(m => m.key === 'API_KEY');
        assert.strictEqual(hasApiKey, true, 'Should identify API_KEY as missing from .env');
    });

    await t.test('Should detect undocumented variables', async () => {
        const { vars } = await scanSource(testDir);
        const result = audit(testDir, vars);
        assert.ok(result.missingFromEnv, 'Audit should return missingFromEnv array');
    });

    // Cleanup
    fs.rmSync(testDir, { recursive: true, force: true });
});
