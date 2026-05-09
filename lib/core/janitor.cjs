const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Autonomous Janitor: Prune system bloat and maintain zero-footprint.
 */
async function runJanitor(targetDir) {
    const findings = [];
    try {
        // 1. Prune Node Modules in subdirectories (Heavy Bloat)
        // Only run this if we are in a deep cleanup mode
        // execSync('find . -name "node_modules" -type d -prune -exec rm -rf "{}" +', { cwd: targetDir });

        // 2. Truncate Massive Ledgers (> 10MB)
        const ledgerPath = path.join(targetDir, 'src/data/ledger.json');
        if (fs.existsSync(ledgerPath)) {
            const stats = fs.statSync(ledgerPath);
            if (stats.size > 10 * 1024 * 1024) {
                fs.writeFileSync(ledgerPath, '[]'); // Safe Reset
                findings.push(`[JANITOR] Truncated massive ledger: ${ledgerPath}`);
            }
        }

        // 3. Prune Old Audit Artifacts
        const files = fs.readdirSync(targetDir);
        files.forEach(file => {
            if (file.includes('audit') || file.includes('report') || (file.startsWith('snapshot-') && file.endsWith('.json'))) {
                fs.unlinkSync(path.join(targetDir, file));
                findings.push(`[JANITOR] Pruned artifact: ${file}`);
            }
        });

    } catch (e) {
        // console.warn(`[JANITOR] Warning: Cleanup interrupted: ${e.message}`);
    }
    return findings;
}

module.exports = { runJanitor };
