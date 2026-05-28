// upgp_orchestrator.js
const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Load event catalog
const eventsPath = path.join(__dirname, 'events.json');
if (!fs.existsSync(eventsPath)) {
  console.error('Events file not found:', eventsPath);
  process.exit(1);
}
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

// Temporary root for isolated runs
const rootTmp = path.join(process.cwd(), 'tmp', 'UPGP');
fs.mkdirSync(rootTmp, { recursive: true });

function runAgent(agent, cmds) {
  return new Promise((resolve) => {
    const results = [];
    let idx = 0;
    function next() {
      if (idx >= cmds.length) {
        resolve(results);
        return;
      }
      const cmd = cmds[idx];
      const runId = crypto.randomBytes(4).toString('hex');
      const workDir = path.join(rootTmp, agent, runId);
      fs.mkdirSync(workDir, { recursive: true });
      const logPath = path.join(workDir, 'run.log');
      const proc = spawn(cmd, { shell: true, cwd: process.cwd() });
      const out = fs.createWriteStream(logPath);
      proc.stdout.pipe(out);
      proc.stderr.pipe(out);
      proc.on('close', (code) => {
        results.push({ cmd, code, log: logPath });
        // cleanup
        try { fs.rmSync(workDir, { recursive: true, force: true }); } catch (_) {}
        idx++;
        next();
      });
    }
    next();
  });
}

async function main() {
  const agents = Object.keys(events);
  const promises = agents.map((a) => runAgent(a, events[a]));
  const allResults = await Promise.all(promises);
  // summarize
  const summary = agents.map((a, i) => ({ agent: a, results: allResults[i] }));
  const summaryPath = path.join(rootTmp, 'upgp_summary.md');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log('All agents completed. Summary written to', summaryPath);
}

main();
