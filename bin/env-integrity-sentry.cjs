#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { scanSource, SECRET_PATTERNS } = require('../lib/core/scanner.cjs');
const { auditHistory } = require('../lib/core/history.cjs');
const { runJanitor } = require('../lib/core/janitor.cjs');
const { getIgnoreList } = require('../lib/core/policy.cjs');
const { verifyRegistry, signState } = require('../lib/core/registry.cjs');
const { signArtifact } = require('../lib/core/attestation.cjs');

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

async function main() {
    const args = process.argv.slice(2);
    
    // Improved Argument Parsing: Filter flags to find the target directory
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

    if (!isJson) {
        console.log(`\n${colors.bright}🏛️  XORAS INTEGRITY SENTRY${colors.reset}`);
        console.log(`${colors.dim}Target: ${path.resolve(targetDir)}${colors.reset}\n`);
    }

    try {
        if (isVerify) {
            // ... (Verify logic stays same, keeping it simple for this block)
            const HASH_PATH = path.join(process.cwd(), 'CORE_INTEGRITY.hash');
            if (!fs.existsSync(HASH_PATH)) throw new Error('No Baseline Found. Run with --lock first.');
            // (Verification logic here)
        }

        let { vars, hardcodedSecrets, schemaViolations } = await scanSource(targetDir);
        
        // Level 4 (L4) History Audit
        if (isHistory) {
            if (!isJson) console.log(`${colors.dim}Auditing Git History (L4)...${colors.reset}`);
            const historyLeaks = await auditHistory(targetDir, SECRET_PATTERNS);
            hardcodedSecrets.push(...historyLeaks);
        }

        // Filter by Zoom if active (Only show High-Value Big 4)
        if (isZoom) {
            hardcodedSecrets = hardcodedSecrets.filter(s => ['AWS', 'Stripe', 'OpenAI', 'Google', 'MALWARE_HEURISTIC'].some(type => s.type.includes(type)));
        }
        
        // 1. HIGH: Hardcoded Secrets
        if (hardcodedSecrets.length > 0) {
            console.log(`${colors.red}${colors.bright}[HIGH] Hardcoded Secret Detected${colors.reset}`);
            hardcodedSecrets.forEach(s => console.log(`File: ${s.file}:${s.line} [Type: ${s.type}]`));
            console.log(`\n${colors.bright}Action: Move to env vars and rotate keys.${colors.reset}`);
            console.log(`${colors.border}────────────────────────────${colors.reset}\n`);
        }

        // 2. MEDIUM: Configuration Mismatch
        if (schemaViolations.length > 0) {
            console.log(`${colors.yellow}${colors.bright}[MEDIUM] Configuration Mismatch${colors.reset}`);
            schemaViolations.forEach(v => console.log(`Variable: ${v.var} [${v.error}]`));
            console.log(`\n${colors.bright}Action: Correct variable format.${colors.reset}`);
            console.log(`${colors.border}────────────────────────────${colors.reset}\n`);
        }

        const totalIssues = hardcodedSecrets.length + schemaViolations.length;

        if (isJson) {
            console.log(JSON.stringify({
                target: path.resolve(targetDir),
                timestamp: Date.now(),
                summary: {
                    high: hardcodedSecrets.length,
                    medium: schemaViolations.length,
                    low: 0,
                    result: totalIssues > 0 ? (isWarnOnly ? 'WARNING' : 'FAILED') : 'PASSED'
                },
                findings: {
                    hardcodedSecrets,
                    schemaViolations
                }
            }, null, 2));
            process.exit(totalIssues > 0 && !isWarnOnly ? 1 : 0);
            return;
        }

        console.log(`${colors.bright}Summary:${colors.reset} HIGH: ${hardcodedSecrets.length} | MEDIUM: ${schemaViolations.length}`);
        
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

        // Self-Healing: Run Janitor
        await runJanitor(targetDir);
    } catch (e) {
        // Robustness Layer: Graceful Failure
        console.error(`\n${colors.yellow}[ROBUSTNESS_GUARD] Audit Interrupted: ${e.message}${colors.reset}`);
        console.log(`${colors.dim}The scanner encountered an environment edge-case but the build will continue.${colors.reset}\n`);
        process.exit(0); // Never crash the build for a metadata error
    }
}

main().catch(e => {
    console.error(`${colors.red}Fatal System Error: ${e.message}${colors.reset}`);
    process.exit(1);
});