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

function getIgnoreList(dir) {
    const config = loadConfig();
    return config.ignore;
}

module.exports = { getIgnoreList, loadConfig };
