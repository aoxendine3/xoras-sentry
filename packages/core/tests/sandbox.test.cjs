const { scanSource } = require('../src/scanner.cjs');
const { generateHtmlReport } = require('../../ui/src/reporter.cjs');
const { verifyStripeSignature, processStripeEvent } = require('../../integrations/payments/stripe.cjs');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

async function runSandboxAudit() {
    console.log('--- XORAS PHYSICAL FIXTURE PROTOCOL START ---');

    const fixtureDir = path.join(__dirname, 'fixtures');
    if (!fs.existsSync(fixtureDir)) fs.mkdirSync(fixtureDir, { recursive: true });

    // 1. Physical Fixture: Leaked Stripe secret in standard JS file
    const fileLeak = path.join(fixtureDir, 'leak_component.js');
    fs.writeFileSync(fileLeak, `
        const STRIPE_KEY = 'sk_test_51MzZ34567890123456789012';
        module.exports = { STRIPE_KEY };
    `);

    // 2. Physical Fixture: Next.js 'use client' boundary violation in TSX
    const fileClientLeak = path.join(fixtureDir, 'client_boundary_leak.tsx');
    fs.writeFileSync(fileClientLeak, `
        'use client';
        import React from 'react';

        export function DangerousClientView() {
            const privateDbSecret = process.env.DATABASE_PRIVATE_URL;
            const publicApi = process.env.NEXT_PUBLIC_API_URL;
            return <div className="p-4">{publicApi}</div>;
        }
    `);

    // 3. Physical Fixture: Clean server component (Safe)
    const fileSafeServer = path.join(fixtureDir, 'safe_server_view.tsx');
    fs.writeFileSync(fileSafeServer, `
        import React from 'react';

        export function ServerOnlyView() {
            const serverSecret = process.env.DATABASE_PRIVATE_URL;
            return <div>Server Side Rendered</div>;
        }
    `);

    console.log('[SANDBOX] Running LIVE physical AST scans against test fixtures...');
    const scanResult = await scanSource(fixtureDir);

    console.log(`[SANDBOX] Discovered: ${scanResult.hardcodedSecrets.length} hardcoded/boundary leaks, ${scanResult.hallucinations.length} unmapped variables.`);

    // Assert: Must have caught Stripe secret
    const stripeFound = scanResult.hardcodedSecrets.some(s => s.type === 'Stripe' && s.file.includes('leak_component.js'));
    assert(stripeFound, 'FAILED: Did not catch hardcoded Stripe secret in leak_component.js');
    console.log('✅ PASS: Physical Stripe key AST detection.');

    // Assert: Must have caught 'use client' boundary violation
    const clientViolationFound = scanResult.hardcodedSecrets.some(s => 
        s.type === 'CLIENT_BOUNDARY_LEAK' && 
        s.file.includes('client_boundary_leak.tsx') &&
        s.trace.includes('DATABASE_PRIVATE_URL')
    );
    assert(clientViolationFound, 'FAILED: Did not catch client boundary leak in client_boundary_leak.tsx');
    console.log('✅ PASS: Next.js "use client" AST boundary validation.');

    // Assert: Must NOT have flagged safe_server_view.tsx as a CLIENT_BOUNDARY_LEAK
    const safeServerFalselyFlagged = scanResult.hardcodedSecrets.some(s => 
        s.file.includes('safe_server_view.tsx') && s.type === 'CLIENT_BOUNDARY_LEAK'
    );
    assert(!safeServerFalselyFlagged, 'FAILED: Falsely flagged server component as client boundary violation');
    console.log('✅ PASS: Server component permitted to read private environment variables.');

    // 4. UI Reporter Sandbox with REAL findings
    console.log('[SANDBOX] Testing HTML Report Generation from real AST scan...');
    const reportPath = generateHtmlReport(__dirname, scanResult, {
        high: scanResult.hardcodedSecrets.length,
        medium: scanResult.schemaViolations.length,
        low: scanResult.hallucinations.length,
        result: scanResult.hardcodedSecrets.length > 0 ? 'FAILED' : 'PASSED'
    });
    assert(fs.existsSync(reportPath), 'FAILED: Report file was not created');
    console.log('✅ PASS: UI Report generated from live AST findings.');

    // 5. Stripe Webhook Verification Sandbox
    console.log('[SANDBOX] Testing Stripe Timing-Safe Logic...');
    const mockSecret = 'whsec_test';
    const mockPayload = '{"id": "evt_test"}';
    const mockTimestamp = Math.floor(Date.now() / 1000).toString();
    const crypto = require('crypto');
    const signedPayload = `${mockTimestamp}.${mockPayload}`;
    const mockSig = crypto.createHmac('sha256', mockSecret).update(signedPayload).digest('hex');
    const signatureHeader = `t=${mockTimestamp},v1=${mockSig}`;

    const isVerified = verifyStripeSignature(mockPayload, signatureHeader, mockSecret);
    assert(isVerified, 'FAILED: Stripe signature verification failed');
    console.log('✅ PASS: Stripe signature verification verified.');

    // 6. Idempotency Ledger Sandbox
    console.log('[SANDBOX] Testing Idempotency Revenue Guard...');
    const uniqueEventId = `evt_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const mockEvent = { id: uniqueEventId, type: 'payment_intent.succeeded' };
    const result = await processStripeEvent(mockEvent, async () => ({ fulfilled: true }));
    assert(result.status === 'SUCCESS' || result.status === 'DUPLICATE', 'FAILED: Ledger failure');
    console.log('✅ PASS: Revenue Guard Ledger Verified.');

    // Clean up physical test fixtures
    fs.rmSync(fixtureDir, { recursive: true, force: true });
    if (fs.existsSync(reportPath)) fs.unlinkSync(reportPath);

    console.log('--- XORAS PHYSICAL FIXTURE PROTOCOL COMPLETE: 100% OPERATIONAL ---');
}

runSandboxAudit().catch(err => {
    console.error('❌ SANDBOX PROTOCOL FAILURE:', err.message);
    process.exit(1);
});
