const { spawnSync } = require('child_process');
const path = require('path');

/**
 * Differential Scanner
 * Only audit what has changed to reduce CI latency.
 */
function getChangedFiles(baseBranch = 'main') {
    try {
        const result = spawnSync('git', ['diff', '--name-only', baseBranch], { encoding: 'utf8' });
        if (result.status !== 0) return null; // Not a git repo or no changes

        return result.stdout.split('\n')
            .filter(f => f.length > 0)
            .map(f => path.join(process.cwd(), f));
    } catch (e) {
        return null;
    }
}

module.exports = { getChangedFiles };
