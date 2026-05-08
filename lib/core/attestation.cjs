const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const KEY_PATH = path.join(process.cwd(), '.attestation_key.pem');

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
