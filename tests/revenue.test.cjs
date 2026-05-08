const { processStripeEvent } = require('../lib/integrations/stripe.cjs');
const fs = require('fs');
const path = require('path');

const LEDGER_PATH = path.join(process.cwd(), '.integrity_ledger.json');

async function testRevenueIntegrity() {
    console.log('🚀 Starting Revenue Integrity Audit...');
    
    // Cleanup old ledger
    if (fs.existsSync(LEDGER_PATH)) fs.unlinkSync(LEDGER_PATH);

    const mockEvent = {
        id: 'evt_test_123',
        type: 'checkout.session.completed',
        data: { object: { customer: 'cus_999' } }
    };

    const mockHandler = async (e) => {
        return `Delivered product to ${e.data.object.customer}`;
    };

    try {
        // First Pass: Should succeed
        const res1 = await processStripeEvent(mockEvent, mockHandler);
        console.log(`✅ First Pass: ${res1.status}`);

        // Second Pass: Should be blocked by Idempotency
        const res2 = await processStripeEvent(mockEvent, mockHandler);
        console.log(`✅ Second Pass: ${res2.status}`);

        if (res1.status === 'SUCCESS' && res2.status === 'DUPLICATE') {
            console.log('\n🏛️ REVENUE INTEGRITY VERIFIED: Deterministic Finality achieved.');
        } else {
            throw new Error('Idempotency failure!');
        }

    } catch (e) {
        console.error('❌ Audit Failed:', e.message);
        process.exit(1);
    } finally {
        if (fs.existsSync(LEDGER_PATH)) fs.unlinkSync(LEDGER_PATH);
    }
}

testRevenueIntegrity();
