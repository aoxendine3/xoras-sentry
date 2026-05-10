const api = require('../src/root.ts');
const trpc = require('../src/trpc.ts');
const appRouter = api.appRouter || api.default?.appRouter;
const createTRPCContext = trpc.createTRPCContext || trpc.default?.createTRPCContext;
const assert = require('assert');

/**
 * XORAS // API SANDBOX TEST
 * Nuance: Verifying tRPC procedure routing and Zod validation without a server.
 */

async function runApiTest() {
  console.log('[SANDBOX] Testing API Handshake Logic...');

  // 1. Mock Context (Logged Out)
  const ctxPublic = await createTRPCContext({ 
    req: { headers: new Map() } 
  });

  // 2. Test Public Procedure (getStats)
  const caller = appRouter.createCaller(ctxPublic);
  const stats = await caller.audit.getStats();
  
  assert.strictEqual(typeof stats.totalBreachCostAvoided, 'string');
  console.log('✅ Public Audit Stats Verified.');

  // 3. Test Protected Procedure (Unauthorized)
  try {
    await caller.audit.generateManifest({ entity: 'Test', domain: 'test.com' });
    throw new Error('UNAUTHORIZED_ACCESS_ALLOWED');
  } catch (error) {
    assert.strictEqual(error.code, 'UNAUTHORIZED');
    console.log('✅ Protected Procedure (Unauthorized) Verified.');
  }

  // 4. Mock Context (Logged In)
  const ctxAuth = await createTRPCContext({
    req: { 
      headers: new Map([
        ['x-user-id', 'user_123'],
        ['x-user-role', 'ADMIN']
      ]) 
    }
  });

  // 5. Test Protected Procedure (Authorized)
  const authCaller = appRouter.createCaller(ctxAuth);
  const manifest = await authCaller.audit.generateManifest({ 
    entity: 'XORAS_CORP', 
    domain: 'xoras.com' 
  });

  assert.strictEqual(manifest.status, 'VERIFIED_OPERATIONAL');
  assert.ok(manifest.id.startsWith('XORAS-'));
  console.log('✅ Protected Procedure (Authorized) Verified.');

  console.log('--- API SANDBOX COMPLETE: NOMINAL ---');
}

if (require.main === module) {
  runApiTest().catch(err => {
    console.error('❌ API SANDBOX FAILURE:', err.message);
    process.exit(1);
  });
}

module.exports = { runApiTest };
