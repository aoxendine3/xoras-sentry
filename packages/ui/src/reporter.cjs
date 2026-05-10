const fs = require('fs');
const path = require('path');

function generateHtmlReport(targetDir, findings, summary) {
    const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>XORAS SENTRY Audit Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 1000px; margin: 40px auto; padding: 0 20px; background: #f4f7f6; }
        .header { border-bottom: 3px solid #2c3e50; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
        .summary { display: flex; gap: 20px; margin-bottom: 30px; }
        .card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); flex: 1; text-align: center; border-bottom: 5px solid #ddd; }
        .card.high { border-bottom-color: #e74c3c; }
        .card.medium { border-bottom-color: #f39c12; }
        .card.low { border-bottom-color: #3498db; }
        .card h3 { margin: 0; font-size: 0.8rem; color: #7f8c8d; text-transform: uppercase; letter-spacing: 1px; }
        .card p { margin: 15px 0 0; font-size: 2.5rem; font-weight: 800; color: #2c3e50; }
        .section-title { font-size: 1.5rem; color: #2c3e50; border-left: 5px solid #2c3e50; padding-left: 15px; margin: 40px 0 20px; }
        .finding { background: white; padding: 20px; border-radius: 10px; border-left: 5px solid #e74c3c; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.03); }
        .finding.medium { border-left-color: #f39c12; }
        .finding.low { border-left-color: #3498db; }
        .finding .path { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-weight: 600; color: #2c3e50; }
        .finding .trace { background: #f8f9fa; padding: 10px; margin-top: 10px; border-radius: 4px; font-size: 0.85rem; border: 1px solid #eee; }
        .finding .type { display: inline-block; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; padding: 3px 8px; border-radius: 12px; margin-bottom: 8px; }
        .type.high { background: #ffd7d7; color: #c0392b; }
        .type.medium { background: #fff3cd; color: #856404; }
        .type.low { background: #d1ecf1; color: #0c5460; }
        .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.8rem; color: #95a5a6; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1 style="margin:0; font-size: 2rem;">XORAS SENTRY</h1>
            <p style="margin:5px 0 0; color: #7f8c8d;">Institutional Integrity Audit Report</p>
        </div>
        <div style="text-align: right;">
            <p style="margin:0; font-weight: bold;">${summary.result}</p>
            <p style="margin:0; font-size: 0.8rem;">${new Date().toLocaleDateString()}</p>
        </div>
    </div>

    <div class="summary">
        <div class="card high">
            <h3>Hardcoded</h3>
            <p>${summary.high}</p>
        </div>
        <div class="card medium">
            <h3>Mismatches</h3>
            <p>${summary.medium}</p>
        </div>
        <div class="card low">
            <h3>Hallucinations</h3>
            <p>${summary.low}</p>
        </div>
    </div>

    <h2 class="section-title">Critical Findings (Hardcoded Secrets)</h2>
    ${findings.hardcodedSecrets.length === 0 ? '<p>No critical leaks detected.</p>' : findings.hardcodedSecrets.map(s => `
        <div class="finding">
            <span class="type high">${s.type}</span>
            <div class="path">${s.file}:${s.line}</div>
            <div class="trace">
                <strong>AST TRACE:</strong> ${s.trace.description}<br>
                <code style="display:block; margin-top:5px; color: #e83e8c;">${s.trace.context}</code>
            </div>
        </div>
    `).join('')}

    <h2 class="section-title">Hallucination Detection (Undocumented Variables)</h2>
    ${findings.hallucinations.length === 0 ? '<p>No hallucinations detected.</p>' : findings.hallucinations.map(h => `
        <div class="finding low">
            <span class="type low">POTENTIAL HALLUCINATION</span>
            <div class="path">${h.file}:${h.line}</div>
            <p style="margin: 10px 0;">The variable <strong>${h.var}</strong> is used in the source but is missing from the <code>.sentry-schema.json</code> definition.</p>
            <div class="trace">
                <strong>AST TRACE:</strong> ${h.trace.description}<br>
                <code style="display:block; margin-top:5px; color: #007bff;">${h.trace.context}</code>
            </div>
        </div>
    `).join('')}

    <div class="footer">
        XORAS SENTRY v1.2.0 | Transparency Layer Enabled | Local-First Security Baseline
    </div>
</body>
</html>
`;
    const reportPath = path.join(process.cwd(), 'audit-report.html');
    fs.writeFileSync(reportPath, template);
    return reportPath;
}

module.exports = { generateHtmlReport };
