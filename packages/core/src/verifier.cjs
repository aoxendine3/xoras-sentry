const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { classify } = require('./policy.cjs');

function getHash(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
}

function parseEnv(filePath) {
// ... (keep parseEnv and audit)
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    const env = {};
    lines.forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            let value = (match[2] || '').split(/\s+#/)[0].trim();
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            env[match[1]] = value;
        }
    });
    return env;
}

function audit(dir, sourceVars) {
  const envPath = path.join(dir, '.env');
  const examplePath = path.join(dir, '.env.example');
  
  const current = fs.existsSync(envPath) ? parseEnv(envPath) : {};
  const example = fs.existsSync(examplePath) ? parseEnv(examplePath) : {};

  const missingFromEnv = [];
  const missingFromAll = [];

  for (const key in example) {
    if (!(key in current)) {
      missingFromEnv.push({ key, type: classify(key), class: 'expected but unset' });
    }
  }

  for (const key of sourceVars) {
    if (!(key in current) && !(key in example)) {
      missingFromAll.push({ key, type: classify(key), class: 'undocumented risk' });
    }
  }

  return { missingFromEnv, missingFromAll, activeEnv: current, exampleEnv: example };
}

function auditRuntime(lockPath) {
    if (!fs.existsSync(lockPath)) return { success: false, reason: 'LOCK_MISSING' };
    
    const lockContent = fs.readFileSync(lockPath, 'utf8');
    const lockMap = new Map();
    lockContent.split(/\r?\n/).filter(l => l.trim()).forEach(line => {
        const [hash, fileName] = line.split(/\s+/);
        lockMap.set(path.resolve(fileName), hash);
    });

    const runtimeModules = Object.keys(require.cache);
    const violations = [];

    runtimeModules.forEach(modPath => {
        if (modPath.includes('node_modules') || !modPath.startsWith(process.cwd())) return;

        const currentHash = getHash(modPath);
        const expectedHash = lockMap.get(modPath);

        if (expectedHash && currentHash !== expectedHash) {
            violations.push({ file: path.relative(process.cwd(), modPath), expected: expectedHash, actual: currentHash });
        }
    });

    return { success: violations.length === 0, violations };
}

const https = require('https');

/**
 * Verify a Stripe Secret Key by pinging the Stripe API.
 * This is the 'High Fidelity' standard for credential auditing.
 */
async function verifyStripeKey(key) {
// ... (rest of the file)
    return new Promise((resolve) => {
        const options = {
            hostname: 'api.stripe.com',
            port: 443,
            path: '/v1/accounts',
            method: 'GET',
            auth: `${key}:`
        };

        const req = https.request(options, (res) => {
            if (res.statusCode === 200) {
                resolve({ status: 'ACTIVE', message: 'Credential is LIVE and EXPOSED.' });
            } else {
                resolve({ status: 'INACTIVE', message: 'Credential failed verification.' });
            }
        });

        req.on('error', (e) => {
            resolve({ status: 'ERROR', message: `Verification error: ${e.message}` });
        });

        req.end();
    });
}

module.exports = { verifyStripeKey, parseEnv, audit, getHash, auditRuntime };
