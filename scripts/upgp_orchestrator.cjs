// upgp_orchestrator.cjs
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const eventsPath = path.join(__dirname, 'events.json');
if (!fs.existsSync(eventsPath)) {
  console.error('Events file not found:', eventsPath);
  process.exit(1);
}
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

const rootTmp = path.join(process.cwd(), 'tmp', 'UPGP');
fs.mkdirSync(rootTmp, { recursive: true });

function runAgent(agent, cmds) {
  // Load configuration for retries and delays
  const defaultConfig = { maxRetries: 2, baseDelayMs: 500 };
  const configPath = path.join(__dirname, 'upgp_config.json');
  let config = defaultConfig;
  if (fs.existsSync(configPath)) {
    try {
      config = { ...defaultConfig, ...JSON.parse(fs.readFileSync(configPath, 'utf8')) };
    } catch (e) {
      console.warn('Failed to parse upgp_config.json, using defaults');
    }
  }

  return new Promise((resolve) => {
    const results = [];
    let idx = 0;
    async function executeWithRetry(command, entry = null, attempt = 0) {
      const runId = crypto.randomBytes(4).toString('hex');
      const workDir = path.join(rootTmp, agent, runId);
      fs.mkdirSync(workDir, { recursive: true });
      const logPath = path.join(workDir, 'run.log');
      const out = fs.createWriteStream(logPath);
      // Apply dryRun prefix if enabled
      let execCmd = command;
      if (config.dryRun) {
        execCmd = `echo "[dry-run]" && ${command}`;
      }
      // Pass timeout via environment variable (default 30s)
      const env = { ...process.env, CMD_TIMEOUT: ((entry && entry.timeout) || 30).toString() };
      const proc = spawn(execCmd, { shell: true, cwd: process.cwd(), env });
      proc.stdout.pipe(out);
      proc.stderr.pipe(out);
      return new Promise((res) => {
        proc.on('close', (code) => {
          // Cleanup work dir after execution
          try { fs.rmSync(workDir, { recursive: true, force: true }); } catch (_) {}
          if (code !== 0 && attempt < config.maxRetries) {
            const delay = config.baseDelayMs * Math.pow(2, attempt);
            console.log(`Retrying command "${command}" (attempt ${attempt + 1}) after ${delay}ms`);
            setTimeout(() => {
              executeWithRetry(command, entry, attempt + 1).then(res);
            }, delay);
          } else {
            res({ command, code, log: logPath });
          }
        });
      });
    }

    async function next() {
      if (idx >= cmds.length) {
        resolve(results);
        return;
      }
      const entry = cmds[idx];
      // Support both string commands and object definitions
      const command = typeof entry === 'string' ? entry : entry.cmd;
      const recoverable = typeof entry === 'object' ? !!entry.recoverable : true;
      const setup = typeof entry === 'object' && Array.isArray(entry.setup) ? entry.setup : [];
      const teardown = typeof entry === 'object' && Array.isArray(entry.teardown) ? entry.teardown : [];

      // Run optional setup steps sequentially
      for (const s of setup) {
        await executeWithRetry(s);
      }

      const result = await executeWithRetry(command);
      results.push(result);

      // Run optional teardown steps regardless of success/failure
      for (const t of teardown) {
        await executeWithRetry(t);
      }

      idx++;
      next();
    }
    next();
  });
}

async function main() {
  const agents = Object.keys(events.agents);
  const promises = agents.map((a) => runAgent(a, events.agents[a]));
  const allResults = await Promise.all(promises);
  const summary = agents.map((a, i) => ({ agent: a, results: allResults[i] }));
  const summaryPath = path.join(rootTmp, 'upgp_summary.md');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log('All agents completed. Summary written to', summaryPath);
}

main();
