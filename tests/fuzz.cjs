const fs = require('fs');
const path = require('path');
const { scanSource } = require('../packages/core/src/scanner.cjs');

const fuzzDir = path.join(__dirname, 'fuzz-sandbox');
if (!fs.existsSync(fuzzDir)) fs.mkdirSync(fuzzDir);

async function runFuzzAudit() {
    console.log('🚀 INITIATING PATHOLOGICAL FUZZING...');

    try {
        // 1. Binary Blob File
        const binaryFile = path.join(fuzzDir, 'poison.bin');
        fs.writeFileSync(binaryFile, Buffer.from([0x00, 0xFF, 0xDE, 0xAD, 0xBE, 0xEF]));
        
        // 2. Encoding Bomb (UTF-16)
        const utf16File = path.join(fuzzDir, 'encoding_bomb.js');
        const content = Buffer.from('console.log("fail");', 'utf16le');
        fs.writeFileSync(utf16File, content);

        // 3. Massive Null-Padded File
        const nullFile = path.join(fuzzDir, 'null_bomb.js');
        fs.writeFileSync(nullFile, '\0'.repeat(10000));

        console.log('[FUZZ] Scanning Pathological Payloads...');
        const start = Date.now();
        await scanSource(fuzzDir);
        const duration = Date.now() - start;

        console.log(`✅ PASS: Engine survived pathological fuzzing in ${duration}ms.`);

    } catch (e) {
        console.error('❌ FUZZ CRASH:', e.message);
        process.exit(1);
    } finally {
        // Cleanup
        if (fs.existsSync(fuzzDir)) fs.rmSync(fuzzDir, { recursive: true, force: true });
        console.log('🏛️  FUZZING COMPLETE.');
    }
}

runFuzzAudit();
