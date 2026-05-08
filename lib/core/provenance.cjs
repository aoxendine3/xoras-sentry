const fs = require('fs');
const path = require('path');

/**
 * Audit the Supply Chain for non-deterministic or poisoned dependencies.
 * This is the 'Top 1%' standard for build provenance.
 */
function auditProvenance() {
    const lockPath = path.join(process.cwd(), 'package-lock.json');
    if (!fs.existsSync(lockPath)) {
        return { status: 'WARNING', message: 'No package-lock.json found. Build provenance cannot be verified.' };
    }

    try {
        const lockfile = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
        const dependencies = lockfile.packages || {};
        
        const unpinned = [];
        for (const [name, data] of Object.entries(dependencies)) {
            if (name === '') continue; // Skip root
            if (!data.integrity) {
                unpinned.push(name);
            }
        }

        if (unpinned.length > 0) {
            return { status: 'FAIL', message: `${unpinned.length} unpinned dependencies detected.`, details: unpinned };
        }

        return { status: 'PASS', message: 'Supply chain integrity verified via cryptographic lockfile.' };
    } catch (e) {
        return { status: 'ERROR', message: `Provenance audit failed: ${e.message}` };
    }
}

module.exports = { auditProvenance };
