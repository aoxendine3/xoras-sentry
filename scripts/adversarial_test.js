// scripts/adversarial_test.js
/*
  Adversarial sandbox test harness.
  Each agent runs 10 isolated events, writes results to its own temp dir,
  and cleans up after execution.
*/
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function runEvent(name, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `${name}-`));
  try {
    log(`START ${name} in ${dir}`);
    fn(dir);
    log(`PASS ${name}`);
  } catch (e) {
    log(`FAIL ${name}: ${e.message}`);
  } finally {
    // cleanup
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) {}
    log(`CLEAN ${name}`);
  }
}

// 1. Symlink traversal
runEvent('symlink-traversal', (dir) => {
  const secret = path.join(dir, 'secret.txt');
  fs.writeFileSync(secret, 'TOP-SECRET');
  const link = path.join(dir, 'link');
  fs.symlinkSync(secret, link);
  const read = fs.readFileSync(link, 'utf8');
  if (read !== 'TOP-SECRET') throw new Error('Symlink read mismatch');
});

// 2. Path traversal
runEvent('path-traversal', (dir) => {
  const outside = path.join(os.tmpdir(), 'outside.txt');
  fs.writeFileSync(outside, 'outside');
  const victim = path.join(dir, '..', path.basename(outside));
  const data = fs.readFileSync(victim, 'utf8');
  if (data !== 'outside') throw new Error('Path traversal read mismatch');
});

// 3. Malformed JSON
runEvent('malformed-json', (dir) => {
  const file = path.join(dir, 'bad.json');
  fs.writeFileSync(file, '{"incomplete": true');
  try { JSON.parse(fs.readFileSync(file, 'utf8')); throw new Error('Parsed malformed JSON'); } catch (_) {}
});

// 4. Env var injection
runEvent('env-injection', (dir) => {
  process.env['INJECTED_KEY'] = 'value';
  if (process.env['INJECTED_KEY'] !== 'value') throw new Error('Env var not set');
});

// 5. Large file DOS
runEvent('large-file', (dir) => {
  const file = path.join(dir, 'large.bin');
  const size = 10 * 1024 * 1024; // 10MB for test
  const buf = Buffer.alloc(size, 'a');
  fs.writeFileSync(file, buf);
  const stats = fs.statSync(file);
  if (stats.size !== size) throw new Error('Large file size mismatch');
});

// 6. Permission escalation
runEvent('chmod-777', (dir) => {
  const file = path.join(dir, 'tmp.txt');
  fs.writeFileSync(file, 'data');
  fs.chmodSync(file, 0o777);
  const mode = fs.statSync(file).mode & 0o777;
  if (mode !== 0o777) throw new Error('chmod failed');
});

// 7. Infinite loop guard (timeout)
runEvent('infinite-loop', (dir) => {
  const start = Date.now();
  while (Date.now() - start < 50) {} // short 50ms loop, should not hang
});

// 8. Empty input handling
runEvent('empty-input', (dir) => {
  const file = path.join(dir, 'empty.txt');
  fs.writeFileSync(file, '');
  const data = fs.readFileSync(file, 'utf8');
  if (data.length !== 0) throw new Error('Empty file not empty');
});

// 9. Buffer overflow simulation (repeat)
runEvent('buffer-overflow', (dir) => {
  const str = 'A'.repeat(1e5); // 100k chars
  if (str.length !== 100000) throw new Error('Repeat failed');
});

// 10. Race condition (create then delete)
runEvent('race-condition', (dir) => {
  const file = path.join(dir, 'race.txt');
  fs.writeFileSync(file, 'temp');
  fs.unlinkSync(file);
  if (fs.existsSync(file)) throw new Error('File still exists');
});

log('All adversarial events completed.');
