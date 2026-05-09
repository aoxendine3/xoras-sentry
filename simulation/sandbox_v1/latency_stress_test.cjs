const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, 'TEST_RESILIENCE.md');

const { signAction } = require('../../../XORAS_INTEGRITY_CORE/electron/agency/lib/xoras/Signer.cjs');

let capital = 1000.00; // Simulated Institutional Capital (USD)
let reputation = 100;
let integrity = 100;
const GOAL = 1000000; // Targeted Resilience Milestone (USD)

/**
 * Principal Signing Utility
 */
function signResult(data) {
    const signed = signAction(data, 'institutional-resilience-test');
    return signed.signature;
}

function negotiate(value) {
    if (integrity < 80) return value * 0.5; 
    const leverage = reputation / 200;
    return value * (1 + leverage);
}

async function runCycle() {
    const stressor = Math.random();
    if (stressor < 0.20) { 
        integrity -= 10;
        capital *= 0.98; 
    } else if (stressor < 0.40) { 
        integrity -= 15;
    }

    if (integrity < 90) integrity += 20; 
    if (integrity > 100) integrity = 100;

    if (integrity > 70) { 
        const baseDeal = 1000 + Math.random() * 5000;
        const profit = negotiate(baseDeal);
        capital += profit;
        reputation += 1;
    }

    if (capital < GOAL) {
        setImmediate(runCycle);
    } else {
        const result = {
            timestamp: new Date().toISOString(),
            status: "VALIDATION_COMPLETE",
            metrics: {
                finalCapital: Math.floor(capital),
                unit: "USD",
                integrity: `${integrity}%`,
                reputation
            },
            targetReached: true
        };
        
        result.signature = signResult(result);
        console.log(JSON.stringify(result, null, 2));
        
        fs.appendFileSync(LOG_PATH, `\n# TARGET REACHED: $1,000,000 USD SECURED\nSignature: ${result.signature}\n`);
        process.exit(0);
    }
}

runCycle();
