const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, 'LOG_IMPERIAL.md');
let capital = 0.00;
let reputation = 50;
let integrity = 100;
const GOAL = 1000000;

fs.writeFileSync(LOG_PATH, `# 🏛️ IMPERIAL VANGUARD SIMULATION [v2.0]\n**Goal**: $1,000,000 | **Difficulty**: 10x\n\n`);

/**
 * High-Frequency Negotiation
 */
function negotiate(value) {
    const leverage = reputation / 500; // Harder to gain leverage
    return value * (1 + leverage);
}

async function runCycle() {
    // 1. Extreme Stressor Injection (50% Combined Risk)
    const stressor = Math.random();
    if (stressor < 0.25) { // 25% Breach
        integrity -= 15;
        capital *= 0.90; // 10% Capital Loss
    } else if (stressor < 0.50) { // 25% Infra Failure
        integrity -= 25;
    }

    // 2. Imperial Repair (Innovation)
    if (integrity < 100) {
        integrity += 10; // Faster repair to survive 10x difficulty
    }

    // 3. Imperial Deals
    if (integrity > 40) {
        // Base value scaled for $1M goal
        const dealValue = 500 + Math.random() * 2000; 
        const profit = negotiate(dealValue);
        capital += profit;
        reputation += 0.5;
    }

    // 4. Update Log every 10 cycles (to prevent file bloat)
    if (Math.floor(capital / 1000) % 10 === 0) {
        const entry = `\n### [IMPERIAL_MILESTONE: $${Math.floor(capital)}]\n- **Integrity**: ${integrity}%\n- **Status**: ADVANCING\n`;
        fs.appendFileSync(LOG_PATH, entry);
    }

    if (capital < GOAL) {
        if (capital % 10000 < 2000) console.log(`[IMPERIAL] Capital: $${Math.floor(capital)} | Integrity: ${integrity}%`);
        setImmediate(runCycle); // Max speed
    } else {
        console.log(`\n[IMPERIAL_COMPLETE] $1,000,000 SECURED.`);
        fs.appendFileSync(LOG_PATH, `\n# 🏁 IMPERIAL FINALITY: $1,000,000 ACHIEVED\n`);
    }
}

console.log(`🏛️ IMPERIAL VANGUARD ACTIVE. TARGET: $1,000,000`);
runCycle();
