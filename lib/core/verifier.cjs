const https = require('https');

/**
 * Verify a Stripe Secret Key by pinging the Stripe API.
 * This is the 'High Fidelity' standard for credential auditing.
 */
async function verifyStripeKey(key) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'api.stripe.com',
            port: 443,
            path: '/v1/accounts',
            method: 'GET',
            auth: `${key}:`
        };

        const req = https.request(options, (res) => {
            if (res.statusCode === 200) {
                resolve({ status: 'ACTIVE', message: 'Credential is LIVE and EXPOSED.' });
            } else {
                resolve({ status: 'INACTIVE', message: 'Credential failed verification.' });
            }
        });

        req.on('error', (e) => {
            resolve({ status: 'ERROR', message: `Verification error: ${e.message}` });
        });

        req.end();
    });
}

module.exports = { verifyStripeKey };
