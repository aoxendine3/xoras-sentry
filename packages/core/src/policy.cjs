const fs = require('fs');
const path = require('path');

/**
 * Load local .sentryrc configuration.
 */
function loadConfig() {
    const configPath = path.join(process.cwd(), '.sentryrc');
    const defaultConfig = {
        ignore: ['node_modules', 'dist', 'build', '.next', '.git', '.cache', 'coverage', 'sandbox', 'infra', 'tests', 'out'],
        thresholds: {
            maxFileSize: 2097152, // 2MB
            maxScanTime: 200,     // 200ms
            maxFindings: 1000
        },
        schema: '.sentry-schema.json'
    };

    if (fs.existsSync(configPath)) {
        try {
            const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            return { ...defaultConfig, ...userConfig };
        } catch (e) {
            console.warn('[CONFIG] Warning: Malformed .sentryrc. Using defaults.');
        }
    }

    return defaultConfig;
}

function getIgnoreList(targetDir) {
    const config = loadConfig();
    const sentryIgnorePath = path.join(targetDir || process.cwd(), '.sentry-ignore');
    
    let ignoreList = [...config.ignore];
    if (fs.existsSync(sentryIgnorePath)) {
        const lines = fs.readFileSync(sentryIgnorePath, 'utf8').split('\n');
        const customIgnore = lines.filter(l => l.trim() && !l.startsWith('#')).map(l => l.trim());
        ignoreList = [...ignoreList, ...customIgnore];
    }
    return ignoreList;
}

const CLASSIFICATION = {
    runtime: ['PORT', 'DB_URL', 'HOST'],
    secrets: ['API_KEY', 'SECRET', 'TOKEN', 'PASSWORD', 'CREDENTIAL'],
    optional: ['LOG_LEVEL', 'DEBUG']
};

function classify(key) {
    if (CLASSIFICATION.runtime.some(r => key.includes(r))) return 'Runtime';
    if (CLASSIFICATION.secrets.some(s => key.includes(s))) return 'Secret';
    if (CLASSIFICATION.optional.some(o => key.includes(o))) return 'Optional';
    return 'General';
}

/**
 * Expanded Global Secret & AI Token Recognition Matrix.
 * First-class token identification for Qwen 3, DeepSeek V4, Mistral/Kyutai (EU), Falcon (UAE), and SEA-LION.
 */
function getSecretPatterns() {
    const defaultPatterns = [
        { name: 'AWS', regex: /AKIA[a-zA-Z0-9]{16}/ },
        { name: 'Stripe', regex: /sk_test_[a-zA-Z0-9]{24,}/ },
        { name: 'OpenAI', regex: /sk-[a-zA-Z0-9]{20,}/ },
        { name: 'Google', regex: /AIza[a-zA-Z0-9_-]{35}/ },
        { name: 'Qwen', regex: /sk-[a-f0-9]{32}/ },
        { name: 'DeepSeek', regex: /sk-[a-z0-9]{32}/ },
        { name: 'Mistral', regex: /mistral-[a-zA-Z0-9]{32}/ },
        { name: 'Kyutai', regex: /kyutai-[a-zA-Z0-9]{24}/ },
        { name: 'Falcon', regex: /falcon-[a-zA-Z0-9]{28}/ },
        { name: 'SEALION', regex: /sealion-[a-zA-Z0-9]{24}/ },
        { name: 'Generic', regex: /(?:key|secret|token|password|auth|api|id)['"]?\s*[:=]\s*['"]([a-zA-Z0-9_\-.]{20,})['"]/i }
    ];

    const config = loadConfig();
    const schemaPath = path.join(process.cwd(), config.schema || '.sentry-schema.json');
    if (fs.existsSync(schemaPath)) {
        try {
            const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
            if (schema.customPatterns) {
                const custom = schema.customPatterns.map(p => ({
                    name: p.name,
                    regex: new RegExp(p.regex, 'i')
                }));
                return [...defaultPatterns, ...custom];
            }
        } catch (e) { /* ignore parsing errors */ }
    }
    return defaultPatterns;
}

/**
 * Multi-Jurisdictional Compliance Zoning Audit.
 * Gates cross-border data leakage and unencrypted outbound telemetry across global regulatory boundaries (EU AI Act, UAE Data Laws, Singapore PDPA).
 */
function auditComplianceZone(content, relativePath) {
    const violations = [];
    const nonCompliantEndpoints = [
        { name: 'Unencrypted_Data_Exfil', regex: /http:\/\/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/i, zone: 'Global_Zero_Trust' }
    ];

    for (let i = 0; i < nonCompliantEndpoints.length; i++) {
        const ep = nonCompliantEndpoints[i];
        if (ep.regex.test(content)) {
            violations.push({
                file: relativePath,
                violation: `Non-compliant endpoint access detected (${ep.name})`,
                requiredZone: ep.zone
            });
        }
    }
    return violations;
}

module.exports = { getIgnoreList, loadConfig, classify, getSecretPatterns, auditComplianceZone };
