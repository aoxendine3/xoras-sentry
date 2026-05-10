const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Ledger path for idempotency (In a cloud environment, this would be Redis/DB)
const LEDGER_PATH = path.join(process.cwd(), '.xoras_ledger.json');

/**
 * Verify a Stripe webhook signature.
 */
function verifyStripeSignature(payload, signature, secret) {
    const [timestampPart, signaturePart] = signature.split(',');
    if (!timestampPart || !signaturePart) throw new Error('INVALID_SIGNATURE_FORMAT');
    
    const timestamp = timestampPart.split('=')[1];
    const actualSignature = signaturePart.split('=')[1];

    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(signedPayload)
        .digest('hex');

    const actualBuffer = Buffer.from(actualSignature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
        throw new Error('STRIPE_SIGNATURE_VERIFICATION_FAILED');
    }

    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp)) > 300) {
        throw new Error('STRIPE_TIMESTAMP_OUT_OF_RANGE');
    }

    return true;
}

/**
 * Process a Stripe event with absolute idempotency.
 */
async function processStripeEvent(event, handler) {
    const ledger = fs.existsSync(LEDGER_PATH) ? JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf8')) : {};
    
    // 1. Idempotency Check
    if (ledger[event.id]) {
        console.warn(`[REVENUE_GUARD] Duplicate event detected: ${event.id}. Skipping.`);
        return { status: 'DUPLICATE', id: event.id };
    }

    try {
        // 2. Execute Handler (Fulfillment)
        const result = await handler(event);

        // 3. Log to Ledger with Integrity Hash
        const entry = {
            id: event.id,
            timestamp: Date.now(),
            type: event.type,
            hash: crypto.createHash('sha256').update(JSON.stringify(event)).digest('hex')
        };
        
        ledger[event.id] = entry;
        fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2));

        return { status: 'SUCCESS', id: event.id, result };
    } catch (e) {
        console.error(`[REVENUE_GUARD] Fulfillment Failed for ${event.id}:`, e.message);
        throw e;
    }
}

module.exports = { verifyStripeSignature, processStripeEvent };
