#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const IGNORE_FILE = path.join(process.cwd(), '.sentry-ignore');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('XORAS SENTRY // .sentry-ignore Rule Builder');
console.log('--------------------------------------------');

function ask() {
    rl.question('Enter a file path, directory, or pattern to ignore (or "exit" to finish): ', (answer) => {
        if (answer.toLowerCase() === 'exit') {
            console.log('✅ .sentry-ignore updated.');
            rl.close();
            return;
        }

        if (answer.trim()) {
            fs.appendFileSync(IGNORE_FILE, answer.trim() + '\n');
            console.log(`Added: ${answer.trim()}`);
        }
        ask();
    });
}

if (!fs.existsSync(IGNORE_FILE)) {
    fs.writeFileSync(IGNORE_FILE, '# XORAS SENTRY Ignore Rules\nnode_modules\n.git\n');
}

ask();
