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

module.exports = { getIgnoreList, loadConfig };
