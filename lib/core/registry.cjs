const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REGISTRY_PATH = path.join(process.cwd(), '.integrity_registry.json');

/**
 * Integrity Registry
 * An append-only ledger for project health history.
 */
function logIntegrityEvent(hash, signer) {
    let registry = [];
    if (fs.existsSync(REGISTRY_PATH)) {
        try {
            registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
        } catch (e) {
            console.error('[REGISTRY] Warning: Registry corrupted. Re-initializing.');
        }
    }

    const prevEntry = registry[registry.length - 1];
    const prevHash = prevEntry ? prevEntry.current_hash : '00000000000000000000000000000000';

    const entry = {
        timestamp: Date.now(),
        prev_hash: prevHash,
        current_hash: hash,
        signer: signer || 'SYSTEM',
        id: crypto.randomBytes(8).toString('hex')
    };

    // Chain validation: Entry is linked to previous
    registry.push(entry);
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
    console.log(`[REGISTRY] Integrity Event Logged: ${entry.id}`);
}

function verifyChain() {
    if (!fs.existsSync(REGISTRY_PATH)) return true;
    const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
    
    for (let i = 1; i < registry.length; i++) {
        if (registry[i].prev_hash !== registry[i-1].current_hash) {
            return false; // Chain broken
        }
    }
    return true;
}

module.exports = { logIntegrityEvent, verifyChain };
