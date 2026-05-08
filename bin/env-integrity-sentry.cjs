#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const { colors, t } = require('../lib/utils.cjs');
const { scanSource } = require('../lib/core/scanner.cjs');
const { getHash, parseEnv, audit, auditRuntime } = require('../lib/core/verifier.cjs');
const { initiateSwarm } = require('../lib/core/swarm.cjs');
const { transmitReport } = require('../lib/core/collector.cjs');

const isVerify = process.argv.includes('--verify');
const isNoVerify = process.argv.includes('--no-verify');
const isSwarm = process.argv.includes('--swarm');
const isRuntime = process.argv.includes('--runtime');
const isLock = process.argv.includes('--lock');
const uploadIdx = process.argv.indexOf('--upload');
const uploadUrl = uploadIdx !== -1 ? process.argv[uploadIdx + 1] : null;

const passIdx = process.argv.indexOf('--password');
const lockPassword = passIdx !== -1 ? process.argv[passIdx + 1] : null;

// Modern hardware resistance targets (configurable)
const PBKDF2_ITERATIONS = parseInt(process.env.INTEGRITY_SENTRY_ITERATIONS) || 600000;
const crypto = require('crypto');

/**
 * Context-Aware Isolation Check
 * Detects if Production variables are leaking into non-production shells.
 */
function verifyEnvironmentIsolation(vars) {
    const isProductionContext = process.env.NODE_ENV === 'production';
    const prodPatterns = [/PROD_/, /LIVE_/, /STRIPE_LIVE/, /AWS_PRODUCTION/];
    const leaks = [];

    if (!isProductionContext) {
        vars.forEach(v => {
            if (prodPatterns.some(p => p.test(v))) {
                leaks.push(v);
            }
        });
    }
    return leaks;
}

async function generateLock() {
    const files = [
        'bin/env-integrity-sentry.cjs',
        'lib/core/scanner.cjs',
        'lib/core/verifier.cjs',
        'lib/core/swarm.cjs',
        'lib/core/policy.cjs',
        'lib/core/collector.cjs',
        'lib/utils.cjs'
    ];
    const lockPath = path.join(process.cwd(), 'integrity.lock');
    const lockData = {
        timestamp: new Date().toISOString(),
        files: files.map(f => {
            const fullPath = path.join(process.cwd(), f);
            return fs.existsSync(fullPath) ? { path: f, hash: getHash(fullPath) } : null;
        }).filter(Boolean)
    };

    if (lockPassword) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(lockPassword, salt, PBKDF2_ITERATIONS, 64, 'sha512').toString('hex');
        lockData.governance = { hash, salt, iterations: PBKDF2_ITERATIONS };
    }

    fs.writeFileSync(lockPath, JSON.stringify(lockData, null, 2));
    console.log(`${colors.green}✅ Integrity lock generated${lockPassword ? ' with Governance Password' : ''}.${colors.reset}`);
    process.exit(0);
}

async function verifyLock() {
    const lockPath = path.join(process.cwd(), 'integrity.lock');
    if (!fs.existsSync(lockPath)) {
        console.error(`${colors.red}Error: integrity.lock missing.${colors.reset}`);
        process.exit(1);
    }
    const lockContent = fs.readFileSync(lockPath, 'utf8');
    const lines = lockContent.split(/\r?\n/).filter(l => l.trim());
    let failed = false;

    lines.forEach(line => {
        const [expectedHash, fileName] = line.split(/\s+/);
        const currentHash = getHash(path.join(process.cwd(), fileName));
        if (currentHash !== expectedHash) {
            console.error(`${colors.red}❌ ${t('integrity_failure', { file: fileName })}${colors.reset}`);
            failed = true;
        } else {
            console.log(`${colors.cyan}✅ ${t('integrity_verified')} ${fileName}${colors.reset}`);
        }
    });

    if (failed) process.exit(2); // Integrity Failure
    console.log(`\n${colors.cyan}${t('lock_verified') || 'Integrity lock verified.'}${colors.reset}`);
    process.exit(0);
}

if (isLock) generateLock();
if (isVerify) verifyLock();

async function verifyRuntime() {
    console.log(`${colors.dim}--- RUNTIME INTEGRITY AUDIT ---${colors.reset}`);
    const lockPath = path.join(process.cwd(), 'integrity.lock');
    const result = audit(path.resolve('.'), new Set()); // Warm up scanner
    const runtimeAudit = auditRuntime(lockPath);
    
    if (runtimeAudit.reason === 'LOCK_MISSING') {
        console.error(`${colors.red}Error: integrity.lock missing. Run with --lock to generate.${colors.reset}`);
        process.exit(1);
    }

    if (!runtimeAudit.success) {
        console.error(`${colors.red}❌ Runtime Integrity Violation Detected!${colors.reset}`);
        runtimeAudit.violations.forEach(v => {
            console.log(`  [-] ${v.file}`);
            console.log(`      Expected: ${v.expected}`);
            console.log(`      Actual:   ${v.actual}`);
        });
        process.exit(3); // Configuration Drift
    }

    console.log(`${colors.green}✅ All active modules verifiably secured.${colors.reset}`);
    process.exit(0);
}

if (isRuntime) {
    verifyRuntime();
    return;
}

function upload(url, data) {
    return new Promise((resolve) => {
        const payload = JSON.stringify(data);
        const lib = url.startsWith('https') ? https : http;
        const req = lib.request(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
        }, (res) => {
            if (res.statusCode === 200) console.log(`${colors.cyan}Result uploaded.${colors.reset}`);
            resolve();
        });
        req.on('error', () => resolve());
        req.write(payload);
        req.end();
    });
}

async function run() {
    const targetDir = process.argv.filter(a => !a.startsWith('--'))[2] ? path.resolve(process.argv.filter(a => !a.startsWith('--'))[2]) : process.cwd();

    if (isSwarm) {
        await initiateSwarm(targetDir);
        return;
    }

    if (!isNoVerify) {
        // Run verification before audit unless bypassed
        const lockPath = path.join(process.cwd(), 'integrity.lock');
        if (fs.existsSync(lockPath)) {
            const lockContent = fs.readFileSync(lockPath, 'utf8');
            const lines = lockContent.split(/\r?\n/).filter(l => l.trim());
            for (const line of lines) {
                const [expectedHash, fileName] = line.split(/\s+/);
                const currentHash = getHash(path.join(process.cwd(), fileName));
                if (currentHash !== expectedHash) {
                    console.error(`${colors.red}❌ ${t('integrity_failure', { file: fileName })}${colors.reset}`);
                    process.exit(2);
                }
            }
        }
    }

    const { vars, hardcodedSecrets } = await scanSource(targetDir);
    
    // Check for Environment Isolation Violations
    const isolationLeaks = verifyEnvironmentIsolation(vars);
    if (isolationLeaks.length > 0) {
        console.warn(`\n${colors.yellow}⚠️  ISOLATION WARNING: Production variables detected in non-production context:${colors.reset}`);
        isolationLeaks.forEach(l => console.warn(` - ${l}`));
    }

    if (hardcodedSecrets.length > 0) {
        console.error('\n❌ CRITICAL: HARDCODED SECRETS DETECTED:');
        hardcodedSecrets.forEach(l => console.error(` - ${l.file} [Type: ${l.type}]`));
        process.exit(1);
    }
    const { missingFromEnv, missingFromAll, activeEnv, exampleEnv } = audit(targetDir, vars);
    
    // Filter framework and internal noise
    const filteredMissingFromAll = missingFromAll.filter(m => 
        !m.key.startsWith('NEXT_') && 
        !m.key.startsWith('__NEXT_') && 
        !m.key.startsWith('AWS_SDK_') &&
        !m.key.startsWith('CIRCLE_') &&
        !['NODE_ENV', 'C', 'PORT', 'HOST'].includes(m.key)
    );

    const orphans = Object.keys(activeEnv).filter(key => !vars.has(key) && !(key in exampleEnv));

    if (missingFromEnv.length > 0) {
        console.log(`\n${colors.yellow}${t('expected_but_unset')}${colors.reset}`);
        missingFromEnv.forEach(m => console.log(`- ${m.key} [${m.type}]`));
    }

    if (filteredMissingFromAll.length > 0) {
        console.log(`\n${colors.red}${t('undocumented_risks')}${colors.reset}`);
        filteredMissingFromAll.forEach(m => console.log(`- ${m.key} [${m.type}]`));
    }

    const totalMissing = missingFromEnv.length + filteredMissingFromAll.length;
    const isDrifted = totalMissing > 0 || hardcodedSecrets.length > 0 || orphans.length > 0;

    if (totalMissing > 0) {
        console.log(`\n${colors.red}${t('audit_failed', { count: totalMissing })}${colors.reset}`);
    }
    
    if (orphans.length > 0) {
        console.log(`\n${colors.yellow}Orphaned Variables (In .env but not in code):${colors.reset}`);
        orphans.forEach(o => console.log(`- ${o}`));
    }

    if (isDrifted) {
        if (totalMissing === 0) console.log(`\n${colors.yellow}Integrity Caution: Orphans or Secrets detected.${colors.reset}`);
    } else {
        console.log(`\n${colors.green}${t('audit_passed')}${colors.reset}`);
    }

    const result = {
        timestamp: new Date().toISOString(),
        summary: { unexpected_missing: totalMissing, secrets: hardcodedSecrets.length, orphans: orphans.length },
        findings: { missingFromEnv, missingFromAll, hardcodedSecrets, orphans }
    };

    // Save report for dashboard telemetry
    fs.writeFileSync(path.join(__dirname, '../audit_report.json'), JSON.stringify(result, null, 2));

    if (process.argv.includes('--report')) {
        console.log(`\n${colors.dim}--- JSON REPORT ---${colors.reset}`);
        console.log(JSON.stringify(result, null, 2));
    }

    if (uploadUrl) {
        try {
            await transmitReport(uploadUrl, result);
            console.log(`${colors.cyan}Audit report transmitted to telemetry server.${colors.reset}`);
        } catch (e) {
            console.error(`${colors.red}Telemetry transmission failed: ${e.message}${colors.reset}`);
        }
    }

    process.exit(isDrifted ? 1 : 0);
}

run();