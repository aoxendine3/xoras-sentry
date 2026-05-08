/**
 * Telemetry Collector
 * Purpose: Secure, redacted transmission of audit summaries for CI/CD monitoring.
 */
const http = require('http');
const https = require('https');

/**
 * Transmit a redacted audit report to a central telemetry server.
 * This ensures no sensitive environment variable keys or file paths are leaked.
 */
async function transmitReport(url, report, token = null) {
    return new Promise((resolve, reject) => {
        // Redact findings: Only transmit metadata and counts
        const payload = JSON.stringify({
            timestamp: new Date().toISOString(),
            status: report.summary.unexpected_missing === 0 && report.summary.secrets === 0 ? 'PASS' : 'FAIL',
            summary: {
                missing_count: report.summary.unexpected_missing,
                secrets_count: report.summary.secrets,
                orphans_count: report.summary.orphans
            },
            context: {
                platform: process.platform,
                node_version: process.version
            }
        });

        const lib = url.startsWith('https') ? https : http;
        const headers = {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
            'X-Sentry-Tool': 'integrity-sentry-core'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const req = lib.request(url, {
            method: 'POST',
            headers: headers
        }, (res) => {
            if (res.statusCode === 200 || res.statusCode === 201) {
                resolve({ success: true, status: res.statusCode });
            } else {
                resolve({ success: false, status: res.statusCode });
            }
        });

        req.on('error', (e) => reject(e));
        req.write(payload);
        req.end();
    });
}

module.exports = { transmitReport };
