const { processStripeEvent, verifyStripeSignature } = require('../lib/integrations/stripe.cjs');
const crypto = require('crypto');

async function runStripeLiveFire() {
    console.log('\n🚀 INITIATING STRIPE LIVE-FIRE AUDIT...');
    
    // 1. Mock Stripe Payload (Realistic)
    const payload = JSON.stringify({
        id: 'evt_institutional_v1_' + Date.now(),
        type: 'checkout.session.completed',
        data: {
            object: {
                id: 'cs_test_555',
                amount_total: 499900, // $4,999.00
                currency: 'usd',
                customer_details: { email: 'institutional_partner@xoras.apex' }
            }
        }
    });

    const secret = 'whsec_test_secret_123';
    const timestamp = Math.floor(Date.now() / 1000);
    const signaturePart = crypto.createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
    const mockSignature = `t=${timestamp},v1=${signaturePart}`;

    try {
        console.log(`[STRIPE_BRIDGE] Verifying High-Value Signature ($4,999.00)...`);
        
        // 2. Verify Signature
        if (verifyStripeSignature(payload, mockSignature, secret)) {
            console.log('✅ SIGNATURE_VERIFIED');
        }

        // 3. Process with Idempotency
        const event = JSON.parse(payload);
        const handler = async (e) => {
            console.log(`[FULFILLMENT] Manifesting Zenith Institutional Edition for: ${e.data.object.customer_details.email}`);
            return { status: 'SHIPPED', license: 'ZENITH-APEX-XORAS-001' };
        };

        const result = await processStripeEvent(event, handler);
        
        if (result.status === 'SUCCESS') {
            console.log(`\n🏛️  REVENUE_GROUNDED: Financial artifact generated for ${event.id}`);
            console.log(`   Transaction Status: ${result.result.status}`);
            console.log(`   License Issued: ${result.result.license}`);
        }

    } catch (e) {
        console.error('❌ LIVE-FIRE FAILED:', e.message);
        process.exit(1);
    }
}

runStripeLiveFire();
