const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const KEY_PATH = path.join(process.cwd(), '.attestation_key.pem');

// Attempt to load the compiled native Secure Enclave bridge
let enclaveBridge = null;
try {
    enclaveBridge = require('../build/Release/enclave_bridge.node');
} catch (e) {
    // Graceful fallback for non-macOS or non-compiled runs
}

/**
 * Machine Attestation Protocol
 * Ensures audit reports are signed and non-repudiable.
 */
function generateAttestationKey() {
    if (fs.existsSync(KEY_PATH)) return;

    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    fs.writeFileSync(KEY_PATH, privateKey);
    fs.writeFileSync(KEY_PATH + '.pub', publicKey);
    console.log('[ATTESTATION] Machine Identity Generated.');
}

function signArtifact(data) {
    if (enclaveBridge) {
        try {
            // Attempt to ensure key is generated in Secure Enclave
            try {
                enclaveBridge.generateKey();
            } catch (e) {
                // Key already registered or TouchID cancelled
            }

            const dataStr = JSON.stringify(data);
            const sha256Hash = crypto.createHash('sha256').update(dataStr).digest();
            const signature = enclaveBridge.sign(sha256Hash).toString('hex');

            return {
                artifact: data,
                signature,
                timestamp: Date.now(),
                agent: 'XORAS_SECURE_ENCLAVE_V2'
            };
        } catch (err) {
            // Fallback to standard RSA if biometric validation fails or is cancelled
        }
    }

    if (!fs.existsSync(KEY_PATH)) generateAttestationKey();

    const privateKey = fs.readFileSync(KEY_PATH, 'utf8');
    const signer = crypto.createSign('SHA256');
    signer.update(JSON.stringify(data));
    signer.end();

    const signature = signer.sign(privateKey, 'hex');
    return {
        artifact: data,
        signature,
        timestamp: Date.now(),
        agent: 'XORAS_ATTESTATION_V1'
    };
}

module.exports = { signArtifact };
