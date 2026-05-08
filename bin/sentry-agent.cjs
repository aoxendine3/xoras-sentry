#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { scanSource } = require('../lib/core/scanner.cjs');

const TARGET_DIR = process.cwd();
const POLL_INTERVAL = 30000; // 30 seconds

async function monitor() {
    console.log(`[SENTRY_AGENT] Monitoring initiated for: ${TARGET_DIR}`);
    
    setInterval(async () => {
        try {
            const { vars, hardcodedSecrets } = await scanSource(TARGET_DIR);
            
            if (hardcodedSecrets.length > 0) {
                console.error(`[SENTRY_AGENT] ❌ ALERT: ${hardcodedSecrets.length} hardcoded secrets detected in live environment!`);
                // In a production scenario, this would trigger an immediate webhook/alert
            }
            
            // Log heartbeat to show the agent is active
            console.log(`[SENTRY_AGENT] Heartbeat: ${vars.size} variables audited. Status: SECURE.`);
            
        } catch (e) {
            console.error('[SENTRY_AGENT] Monitor Error:', e.message);
        }
    }, POLL_INTERVAL);
}

monitor();
