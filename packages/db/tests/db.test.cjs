const schema = require('../src/schema.ts');
const auditLogs = schema.auditLogs || schema.default?.auditLogs;
const { getTableName } = require('drizzle-orm');
const assert = require('assert');

/**
 * XORAS // DATABASE SANDBOX TEST
 * Nuance: Verifying Drizzle schema integrity and type inference.
 */

async function runDbTest() {
  console.log('[SANDBOX] Testing Database Schema Integrity...');

  // 1. Verify Table Definition
  assert.strictEqual(getTableName(auditLogs), 'audit_logs');
  console.log('✅ Audit Logs Table Schema Verified.');

  // 2. Verify Column Types
  const { getTableColumns } = require('drizzle-orm');
  const columns = getTableColumns(auditLogs);
  assert.ok(columns.entityName);
  assert.ok(columns.metrics);
  console.log('✅ Schema Column Definitions Verified.');

  // 3. Verify Type Inference (Simulated)
  // In a real TS environment, this would be checked by tsc.
  // Here we verify the structure of the schema object.
  assert.strictEqual(typeof auditLogs.id, 'object');
  
  console.log('--- DB SANDBOX COMPLETE: NOMINAL ---');
}

if (require.main === module) {
  runDbTest().catch(err => {
    console.error('❌ DB SANDBOX FAILURE:', err.message);
    process.exit(1);
  });
}

module.exports = { runDbTest };
