const fs = require('fs');
const path = require('path');

const SNAPSHOT_DIR = '/Users/ajoxendine68/Documents/GitHub/XORAS_INTEGRITY_CORE_UPGRADE_SNAPSHOT';
const rawData = fs.readFileSync(path.join(SNAPSHOT_DIR, 'snapshot-audit-clean.json'), 'utf8');
const jsonStart = rawData.indexOf('{');
const AUDIT_DATA = JSON.parse(rawData.substring(jsonStart));
const ENV_PATH = path.join(SNAPSHOT_DIR, '.env.local');

const findings = AUDIT_DATA.findings.hardcodedSecrets;
let envContent = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : '# XORAS_VAULT (v1.0)\n';

console.log(`🚀 INITIATING SURGICAL HARDENING: ${findings.length} Finding(s)`);

findings.forEach((finding, index) => {
    const filePath = path.join(SNAPSHOT_DIR, finding.file);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const targetLine = lines[finding.line - 1];

    // Extraction Logic: Find the secret string
    const match = targetLine.match(/['"](.*?)['"]/);
    if (match) {
        const secret = match[1];
        const envKey = `${finding.file.split(/[/\.]/)[0].toUpperCase()}_${finding.type.toUpperCase()}_${index}`;
        
        // 1. Vaulting
        if (!envContent.includes(envKey)) {
            envContent += `${envKey}="${secret}"\n`;
        }

        // 2. Code Modernization
        const replacement = targetLine.replace(/['"](.*?)['"]/, `process.env.${envKey}`);
        lines[finding.line - 1] = replacement;

        // 3. Fail-Fast Guard (only once per file)
        if (!content.includes('process.env') && !content.includes('Error("Missing Required')) {
            lines.unshift(`if (!process.env.${envKey}) throw new Error("Missing Required Environment Credentials: ${envKey}");\n`);
        }

        fs.writeFileSync(filePath, lines.join('\n'));
        console.log(`✅ HARDENED: ${finding.file}:${finding.line} -> ${envKey}`);
    }
});

fs.writeFileSync(ENV_PATH, envContent);
console.log('\n🏛️  HARDENING COMPLETE. .env.local UPDATED.');
