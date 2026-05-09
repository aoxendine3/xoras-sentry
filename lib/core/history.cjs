const { spawn } = require('child_process');
const path = require('path');
const readline = require('readline');

/**
 * Audit Git history for hardcoded secrets in diffs (Streaming version).
 */
async function auditHistory(targetDir, patterns) {
    return new Promise((resolve) => {
        const findings = [];
        const gitLog = spawn('git', ['log', '-p', '-n', '100'], { cwd: targetDir });
        const rl = readline.createInterface({ input: gitLog.stdout });

        let currentCommit = '';
        let currentFile = '';

        rl.on('line', (line) => {
            if (line.startsWith('commit ')) {
                currentCommit = line.substring(7, 14);
            } else if (line.startsWith('+++ b/')) {
                currentFile = line.substring(6);
            } else if (line.startsWith('+') && !line.startsWith('+++')) {
                const addedContent = line.substring(1);
                patterns.forEach(pattern => {
                    if (pattern.regex.test(addedContent)) {
                        findings.push({
                            file: currentFile,
                            commit: currentCommit,
                            type: pattern.name,
                            line: 'HISTORY'
                        });
                    }
                });
            }
        });

        rl.on('close', () => {
            resolve(findings);
        });

        gitLog.on('error', (e) => {
            console.warn(`[L4_HISTORY] Warning: Could not audit history: ${e.message}`);
            resolve([]);
        });
    });
}

module.exports = { auditHistory };
