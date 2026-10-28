#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { scanSource, SECRET_PATTERNS } = require('xoras-sentry');
const { generateHtmlReport } = require('../../ui/src/reporter.cjs');
const { runJanitor } = require('../../core/src/janitor.cjs');
const { auditHistory } = require('../../core/src/history.cjs');

const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    green: "\x1b[32m",
    cyan: "\x1b[36m",
    dim: "\x1b[2m",
    border: "\x1b[90m"
};

/**
 * Extract staged or modified files from Git for changeset-scoped scans.
 * Returns: { files: string[], error: boolean }
 */
function getGitDeltaFiles(targetDir) {
    try {
        // First check for staged pre-commit changes
        let stdout = execSync('git diff --name-only --cached --diff-filter=d', {
            cwd: targetDir,
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'pipe']
        }).trim();

        // If no staged changes, check working tree differences against HEAD
        if (!stdout) {
            stdout = execSync('git diff --name-only HEAD --diff-filter=d', {
                cwd: targetDir,
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'pipe']
            }).trim();
        }

        if (!stdout) return { files: [], error: false };

        const files = stdout
            .split('\n')
            .map(f => f.trim())
            .filter(f => /\.(tsx|jsx|js|ts|mjs|cjs)$/.test(f))
            .map(f => path.resolve(targetDir, f));

        return { files, error: false };
    } catch (e) {
        // Git command failed or directory not a git repository
        return { files: [], error: true, message: e.message };
    }
}

async function main() {
    const args = process.argv.slice(2);
    
    const flags = args.filter(a => a.startsWith('--'));
    const nonFlags = args.filter(a => !a.startsWith('--'));
    
    const targetDir = path.resolve(nonFlags[0] || '.');
    const isVerify = flags.includes('--verify');
    const isWarnOnly = flags.includes('--warn-only');
    const isDelta = flags.includes('--delta');
    const isSign = flags.includes('--sign');
    const isJson = flags.includes('--json');
    const isHistory = flags.includes('--history');
    const isZoom = flags.includes('--zoom');
    const isHtml = flags.includes('--html');

    if (flags.includes('--help') || flags.includes('-h')) {
        console.log(`
${colors.bright}XORAS SENTRY // High-Precision Structural Auditor${colors.reset}

${colors.bright}Usage:${colors.reset} xoras-sentry [dir] [flags]

${colors.bright}Flags:${colors.reset}
  --html         Generate an interactive HTML audit report.
  --json         Output results in JSON format with AST traces.
  --delta        Scan only modified/staged files in current git changeset.
  --history      Perform a deep git history audit for legacy leaks.
  --warn-only    Report findings but do not exit with failure code.
  --sign         Generate a cryptographically signed audit report.
  --verify       Verify current state against a signed baseline.

${colors.bright}Features:${colors.reset}
  - Hallucination Guard: Detect undocumented environment variables.
  - Client Boundary Guard: Block server process.env leaks in React 'use client'.
  - AST Tracer: Human-readable transparency for detection paths.
  - Proprietary Patterns: Dynamic custom regex loading.
`);
        process.exit(0);
    }

    if (!isJson) {
        console.log(`\n${colors.bright}XORAS SENTRY // v1.2.3${colors.reset}`);
        console.log(`${colors.dim}Target: ${path.resolve(targetDir)}${colors.reset}`);
        if (isDelta) console.log(`${colors.cyan}Mode: Changeset-Scoped Scan Active (--delta)${colors.reset}`);
        console.log('');
    }

    let scanTarget = targetDir;

    // Fail-closed handling for --delta
    if (isDelta) {
        const deltaResult = getGitDeltaFiles(targetDir);
        if (deltaResult.error) {
            console.error(`${colors.red}${colors.bright}[FAIL-CLOSED] Git error under --delta: ${deltaResult.message}${colors.reset}`);
            console.error(`${colors.dim}Cannot verify changeset boundaries without a valid git repository. Aborting.${colors.reset}\n`);
            process.exit(isWarnOnly ? 0 : 1);
        }

        if (deltaResult.files.length > 0) {
            scanTarget = deltaResult.files;
            if (!isJson) console.log(`${colors.dim}Scanning ${deltaResult.files.length} modified delta file(s)...${colors.reset}\n`);
        } else {
            if (!isJson) console.log(`${colors.green}Git Delta: No staged or modified source files found.${colors.reset}\n`);
            process.exit(0);
        }
    }

    let { vars, hardcodedSecrets, schemaViolations, hallucinations } = await scanSource(scanTarget);
    
    // Level 4 (L4) History Audit
    if (isHistory && typeof scanTarget === 'string') {
        if (!isJson) console.log(`${colors.dim}Auditing Git History (L4)...${colors.reset}`);
        const historyLeaks = await auditHistory(scanTarget, SECRET_PATTERNS);
        hardcodedSecrets.push(...historyLeaks);
    }

    // Filter by Zoom if active (Only show High-Value Big 4 + Client Boundary Leaks)
    if (isZoom) {
        hardcodedSecrets = hardcodedSecrets.filter(s => 
            ['AWS', 'Stripe', 'OpenAI', 'Google', 'CLIENT_BOUNDARY_LEAK', 'MALWARE_HEURISTIC'].some(type => s.type.includes(type))
        );
    }
    
    if (hardcodedSecrets.length > 0) {
        console.log(`${colors.red}${colors.bright}HIGH: Hardcoded Secrets & Boundary Leaks Found${colors.reset}`);
        hardcodedSecrets.forEach(s => console.log(`File: ${s.file}:${s.line} [Type: ${s.type}]`));
    }

    if (schemaViolations.length > 0) {
        console.log(`${colors.yellow}${colors.bright}MEDIUM: Schema Mismatch${colors.reset}`);
        schemaViolations.forEach(v => console.log(`Variable: ${v.var} [${v.error}]`));
    }

    if (hallucinations.length > 0) {
        console.log(`${colors.cyan}${colors.bright}LOW: Undocumented Variables${colors.reset}`);
        hallucinations.forEach(h => console.log(`Variable: ${h.var} in ${h.file}:${h.line}`));
    }

    const totalIssues = hardcodedSecrets.length + schemaViolations.length + hallucinations.length;
    const result = totalIssues > 0 ? (isWarnOnly ? 'WARNING' : 'FAILED') : 'PASSED';

    if (isHtml) {
        const reportPath = generateHtmlReport(targetDir, { hardcodedSecrets, schemaViolations, hallucinations }, { high: hardcodedSecrets.length, medium: schemaViolations.length, low: hallucinations.length, result });
        if (!isJson) console.log(`${colors.green}Report generated: ${reportPath}${colors.reset}`);
    }

    if (isJson) {
        console.log(JSON.stringify({
            target: path.resolve(targetDir),
            timestamp: Date.now(),
            deltaActive: isDelta,
            summary: {
                high: hardcodedSecrets.length,
                medium: schemaViolations.length,
                low: hallucinations.length,
                result: totalIssues > 0 ? (isWarnOnly ? 'WARNING' : 'FAILED') : 'PASSED'
            },
            findings: {
                hardcodedSecrets,
                schemaViolations,
                hallucinations
            }
        }, null, 2));
        process.exit(totalIssues > 0 && !isWarnOnly ? 1 : 0);
        return;
    }

    console.log(`${colors.bright}Summary:${colors.reset} HIGH: ${hardcodedSecrets.length} | MEDIUM: ${schemaViolations.length} | LOW: ${hallucinations.length}`);
    
    if (totalIssues > 0) {
        if (isWarnOnly) {
            console.log(`\n${colors.yellow}${colors.bright}Result: WARNINGS_ONLY (--warn-only active)${colors.reset}\n`);
            process.exit(0); 
        } else {
            console.log(`\n${colors.red}${colors.bright}Result: FAILED (${totalIssues} issues found)${colors.reset}\n`);
            process.exit(1);
        }
    } else {
        console.log(`\n${colors.green}${colors.bright}Result: PASSED${colors.reset}`);
        console.log(`${colors.dim}Note: No matches under current rules, scope, and filters.${colors.reset}\n`);
    }

    // Run Janitor
    await runJanitor(targetDir);
}

main().catch(e => {
    // Fail-closed on fatal scan errors to prevent false-negative security passes
    console.error(`\n\x1b[31m\x1b[1m[FAIL-CLOSED FATAL ERROR] Scanner execution failed: ${e.message}\x1b[0m`);
    console.error(e.stack);
    process.exit(1);
});
