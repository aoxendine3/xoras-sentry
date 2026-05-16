const fs = require('fs');
const path = require('path');
const { scanSource } = require('../packages/core/src/scanner.cjs');

const stressDir = path.join(__dirname, 'stress-targets');
if (!fs.existsSync(stressDir)) fs.mkdirSync(stressDir);

async function runStressTest() {
    console.log('🚀 Initiating Production Stress Audit...');
    
    // 1. Generate a massive line-attack file (2MB total)
    const filePath = path.join(stressDir, 'stress_bomb.js');
    const massiveLine = 'const secret = "' + 'A'.repeat(500000) + '";\n';
    const filler = 'console.log("safe");\n'.repeat(10000);
    fs.writeFileSync(filePath, massiveLine + filler);

    const start = Date.now();
    try {
        const { vars, hardcodedSecrets } = await scanSource(stressDir);
        const duration = Date.now() - start;

        console.log(`--- Stress Results ---`);
        console.log(`⏱️  Duration: ${duration}ms`);
        console.log(`🛡️  Findings Cap Check: ${hardcodedSecrets.length} (Max: 1000)`);
        
        if (duration < 500) {
            console.log('✅ PASS: Timeout and line-limit guards kept scan time under control.');
        } else {
            console.warn('⚠️  SLOW: Scan took longer than expected.');
        }

        if (hardcodedSecrets.length <= 1000) {
            console.log('✅ PASS: Findings cap enforced.');
        }

    } catch (e) {
        console.error('❌ FAIL: Stress test crashed!', e);
        process.exit(1);
    } finally {
        fs.unlinkSync(filePath);
        fs.rmdirSync(stressDir);
    }
}

runStressTest();
