// sandbox/atomics_latency_lock.cjs
// 100% Portable Microsecond-Precision Timing Lock via SharedArrayBuffer & Atomics
// High-performance Warm-Worker Implementation (Removes Thread-Creation Latency)

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
    // === MAIN THREAD ORCHESTRATION ===
    
    async function initAndRunLock() {
        console.log(`\n=====================================================================`);
        console.log(`[ATOMICS LOCK] Initializing high-precision warm-worker timing gate...`);
        console.log(`=====================================================================`);
        
        // 1. Allocate SharedArrayBuffer for thread synchronization
        const sharedBuffer = new SharedArrayBuffer(12); // 3 integers (status, targetMs, startHrTimeLow, startHrTimeHigh)
        const sharedArray = new Int32Array(sharedBuffer);
        
        // Set target temporal envelope to 15.0ms
        const targetEnvelopeMs = 15.0;
        
        // 2. Spawn the persistent worker thread
        const worker = new Worker(__filename, {
            workerData: { sharedBuffer }
        });

        // Wait for worker to signal it is booted and ready
        await new Promise((resolve) => {
            worker.on('message', (msg) => {
                if (msg === 'READY') resolve();
            });
        });
        
        console.log(`  * Background worker thread booted and warmed in memory.`);
        console.log(`  * Initiating query transaction...`);
        
        // 3. Set the gate parameters and trigger start
        const start = process.hrtime.bigint();
        
        // Reset status to 0 (Main thread waiting)
        Atomics.store(sharedArray, 0, 0); 
        Atomics.store(sharedArray, 1, Math.floor(targetEnvelopeMs * 1e6)); // Target in nanoseconds
        
        // Signal the worker to start monitoring
        worker.postMessage({ type: 'START', startNs: start.toString() });

        // 4. Simulate variable main-thread processing work (e.g., 4ms to 9ms)
        const processingDelay = Math.random() * 5 + 4;
        await new Promise(r => setTimeout(r, processingDelay));
        
        const workEnd = process.hrtime.bigint();
        const workDuration = Number(workEnd - start) / 1e6;
        
        console.log(`  * Main processing completed in: ${workDuration.toFixed(4)} ms`);
        console.log(`  * Entering blocking atomic gate...`);
        
        // 5. Block at the atomic gate until worker modifies index 0 to 1
        Atomics.wait(sharedArray, 0, 0);
        
        const finalEnd = process.hrtime.bigint();
        const totalDuration = Number(finalEnd - start) / 1e6;
        const deviation = totalDuration - targetEnvelopeMs;
        
        console.log(`=====================================================================`);
        console.log(`[ATOMICS LOCK] ✅ GATE RELEASED`);
        console.log(`  * Target Envelope   : ${targetEnvelopeMs.toFixed(2)} ms`);
        console.log(`  * Actual Latency    : ${totalDuration.toFixed(4)} ms`);
        console.log(`  * Lock Deviation    : ${deviation.toFixed(4)} ms`);
        console.log(`=====================================================================\n`);
        
        worker.terminate();
    }

    initAndRunLock();

} else {
    // === WORKER THREAD (HIGH-PRECISION CLOCK) ===
    
    const { sharedBuffer } = workerData;
    const sharedArray = new Int32Array(sharedBuffer);
    
    // Notify main thread that the worker is booted and ready
    parentPort.postMessage('READY');
    
    parentPort.on('message', (msg) => {
        if (msg.type === 'START') {
            const startNs = BigInt(msg.startNs);
            const targetNs = BigInt(Atomics.load(sharedArray, 1));
            
            // High-precision microsecond-level polling loop running on warm background thread
            while (true) {
                let elapsed = process.hrtime.bigint() - startNs;
                if (elapsed >= targetNs) {
                    // Write 1 to index 0 of the SharedArrayBuffer and notify the main thread
                    Atomics.store(sharedArray, 0, 1);
                    Atomics.notify(sharedArray, 0, 1);
                    break;
                }
            }
        }
    });
}
