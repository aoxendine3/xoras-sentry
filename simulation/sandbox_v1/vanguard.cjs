const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, 'LOG.md');
let capital = 0.00;
let reputation = 50; // 0-100
let integrity = 100; // 0-100

/**
 * The Art of the Deal: Negotiation Logic
 */
function negotiate(value) {
    // Principle: Maximize Options & Think Big
    const leverage = reputation / 100;
    const profit = value * (1 + leverage);
    return profit;
}

/**
 * Execute a Cycle
 */
async function runCycle() {
    console.log(`\n[VANGUARD_CYCLE] Capital: $${capital.toFixed(2)} | Integrity: ${integrity}%`);

    // 1. Stressor Injection
    const stressor = Math.random();
    if (stressor < 0.1) {
        console.warn(`[STRESSOR] Security Breach Detected!`);
        integrity -= 10;
        capital *= 0.95; // Loss
    } else if (stressor < 0.2) {
        console.warn(`[STRESSOR] Infrastructure Failure!`);
        integrity -= 20;
    }

    // 2. Self-Healing (Innovation/Repair)
    if (integrity < 100) {
        console.log(`[HEAL] Repairing Infrastructure...`);
        integrity += 5;
    }

    // 3. The Deal (Revenue Generation)
    if (integrity > 50) {
        const dealValue = 5 + Math.random() * 10;
        const profit = negotiate(dealValue);
        capital += profit;
        reputation += 1;
        console.log(`[DEAL] Executive Maneuver Complete. Profit: $${profit.toFixed(2)}`);
    } else {
        console.log(`[STALL] Integrity too low for deals. Focusing on survival.`);
    }

    // 4. Update Log
    const entry = `\n### [CYCLE_UPDATE: ${new Date().toISOString()}]\n- **Capital**: $${capital.toFixed(2)}\n- **Integrity**: ${integrity}%\n- **Status**: ${capital >= 100 ? 'SUCCESS' : 'OPERATIONAL'}\n`;
    fs.appendFileSync(LOG_PATH, entry);

    if (capital < 100) {
        setTimeout(runCycle, 2000); // 2-second cycles
    } else {
        console.log(`\n[MISSION_COMPLETE] $100 Milestone Reached.`);
        fs.appendFileSync(LOG_PATH, `\n# 🎯 MISSION SUCCESS: $100 MILESTONE REACHED\n`);
    }
}

console.log(`🏛️ VANGUARD SOVEREIGN AGENT ACTIVE`);
runCycle();
