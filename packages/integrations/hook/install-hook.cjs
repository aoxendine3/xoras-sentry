#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const GIT_DIR = path.join(process.cwd(), '.git');
const HOOKS_DIR = path.join(GIT_DIR, 'hooks');
const HOOK_FILE = path.join(HOOKS_DIR, 'pre-commit');

console.log('Installing XORAS SENTRY Pre-commit Hook...');

if (!fs.existsSync(GIT_DIR)) {
    console.error('Error: Not a git repository.');
    process.exit(1);
}

const hookContent = `#!/bin/sh
# XORAS SENTRY Pre-commit Hook
echo "Running XORAS SENTRY Security Audit..."
npx xoras-sentry . --delta
if [ $? -ne 0 ]; then
    echo "❌ Security Audit Failed. Commit aborted."
    exit 1
fi
`;

fs.writeFileSync(HOOK_FILE, hookContent);
fs.chmodSync(HOOK_FILE, '755');

console.log('✅ Pre-commit hook installed successfully.');
console.log('Location:', HOOK_FILE);
