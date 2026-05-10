const fs = require('fs');
const path = require('path');
const assert = require('assert');

/**
 * XORAS // WEB HUB SANDBOX TEST
 * Nuance: Verifying existence of institutional routes and edge middleware configuration.
 */

async function runWebTest() {
  console.log('[SANDBOX] Testing Web Hub Structural Integrity...');

  const webRoot = path.join(__dirname, '../');

  // 1. Verify App Directory Structure
  const requiredFiles = [
    'src/app/page.tsx',
    'src/app/layout.tsx',
    'src/middleware.ts',
    'next.config.ts'
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(webRoot, file))) {
      throw new Error(`WEB_ASSET_MISSING: ${file}`);
    }
  }
  console.log('✅ Core Web Assets Verified.');

  // 2. Verify Edge Runtime Configuration
  const pageContent = fs.readFileSync(path.join(webRoot, 'src/middleware.ts'), 'utf-8');
  assert.ok(pageContent.includes("runtime = 'edge'"));
  console.log('✅ Edge Middleware Runtime Verified.');

  console.log('--- WEB SANDBOX COMPLETE: NOMINAL ---');
}

if (require.main === module) {
  runWebTest().catch(err => {
    console.error('❌ WEB SANDBOX FAILURE:', err.message);
    process.exit(1);
  });
}

module.exports = { runWebTest };
