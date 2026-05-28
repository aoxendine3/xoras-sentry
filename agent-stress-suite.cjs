// agent-stress-suite.cjs
// Ultimate Agent Stress Test Suite v2.0
// This script orchestrates 10 agents across 5 test vectors.
// It logs detailed execution to /tmp/stress-test-full.log
// and produces a summary markdown report at /tmp/stress-test-report.md

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const LOG_FILE = '/tmp/stress-test-full.log';
const REPORT_FILE = '/tmp/stress-test-report.md';

// Simple logger that appends timestamps
function log(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, line);
  console.log(message);
}

// Load the events configuration (the same structure as previous events.json)
const CONFIG_PATH = path.resolve(__dirname, 'events.json');
let config;
try {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
} catch (e) {
  log(`❌ Failed to load config at ${CONFIG_PATH}: ${e.message}`);
  process.exit(1);
}

const agents = Object.keys(config.agents);
log(`🚀 Starting Ultimate Agent Stress Test Suite v2.0`);
log(`Agents (${agents.length}): ${agents.join(', ')}`);
log(`Test Vectors: ${config.eventsPerAgent} events per agent`);

// Helper to run a single command with timeout and recoverable flag
function runCommand(cmd, opts) {
  const { recoverable = true, timeout = 30, expectedCode = 0 } = opts;
  return new Promise((resolve) => {
    const start = Date.now();
    const proc = exec(cmd, { timeout: timeout * 1000 }, (error, stdout, stderr) => {
      const duration = ((Date.now() - start) / 1000).toFixed(2);
      const actualCode = error ? (error.code || 1) : 0;
      const result = {
        cmd,
        code: actualCode,
        expectedCode,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        duration,
        recoverable,
      };
      resolve(result);
    });
  });
}

async function executeAgent(agentName, events) {
  log(`🔧 Agent ${agentName} – starting ${events.length} events`);
  const results = [];
  for (const ev of events) {
    const attempt = await runCommand(ev.cmd, ev);
    results.push(attempt);
    // Retry logic for recoverable failures
    const targetCode = ev.expectedCode || 0;
    if (attempt.code !== targetCode && ev.recoverable) {
      let retries = config.maxRetries || 3;
      while (retries > 0 && attempt.code !== targetCode) {
        log(`⚠️ ${agentName}: retrying "${ev.cmd}" (remaining attempts: ${retries})`);
        const retryResult = await runCommand(ev.cmd, ev);
        results.push(retryResult);
        if (retryResult.code === targetCode) break;
        retries--;
        await new Promise(r => setTimeout(r, config.baseDelayMs || 800));
      }
    }
  }
  return results;
}

(async () => {
  // Global setup/teardown if present
  if (Array.isArray(config.globalSetup)) {
    for (const cmd of config.globalSetup) await runCommand(cmd, { recoverable: true, timeout: 30 });
  }

  const allAgentResults = {};
  for (const agent of agents) {
    const events = config.agents[agent];
    const res = await executeAgent(agent, events);
    allAgentResults[agent] = res;
  }

  if (Array.isArray(config.globalTeardown)) {
    for (const cmd of config.globalTeardown) await runCommand(cmd, { recoverable: true, timeout: 30 });
  }

  // Build markdown report
  let report = `# Ultimate Agent Stress Test Report\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n\n`;
  report += `## Summary\n\n`;
  report += `| Agent | Passed | Failed | Total |\n`;
  report += `|------|--------|--------|-------|\n`;
  for (const [agent, results] of Object.entries(allAgentResults)) {
    const passed = results.filter(r => r.code === (r.expectedCode || 0)).length;
    const failed = results.length - passed;
    report += `| ${agent} | ${passed} | ${failed} | ${results.length} |\n`;
  }
  report += `\n---\n\n`;
  report += `## Detailed Results\n\n`;
  for (const [agent, results] of Object.entries(allAgentResults)) {
    report += `### ${agent}\n`;
    report += `\n| # | Command | Exit Code | Duration (s) | Recoverable |\n`;
    report += `|---|---------|-----------|--------------|-------------|\n`;
    results.forEach((r, i) => {
      const safeCmd = r.cmd.replace(/\|/g, '\\\\|');
      report += `| ${i + 1} | ${safeCmd} | ${r.code} | ${r.duration} | ${r.recoverable} |\n`;
    });
    report += `\n`;
  }

  fs.writeFileSync(REPORT_FILE, report);
  log(`✅ Report written to ${REPORT_FILE}`);
})();
