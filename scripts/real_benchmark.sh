#!/bin/bash
echo "# XORAS REAL-LIFE METAL BENCHMARK (NO SIMULATIONS)" > /Users/ajoxendine68/.gemini/antigravity/brain/3a229c88-64b4-4b23-9f5f-4872841b7a3f/REAL_LIFE_BENCHMARKS.md
echo "**Timestamp:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> /Users/ajoxendine68/.gemini/antigravity/brain/3a229c88-64b4-4b23-9f5f-4872841b7a3f/REAL_LIFE_BENCHMARKS.md
echo "---" >> /Users/ajoxendine68/.gemini/antigravity/brain/3a229c88-64b4-4b23-9f5f-4872841b7a3f/REAL_LIFE_BENCHMARKS.md

echo "## 1. CURRENT SYSTEM STATE (MAC METAL)" >> /Users/ajoxendine68/.gemini/antigravity/brain/3a229c88-64b4-4b23-9f5f-4872841b7a3f/REAL_LIFE_BENCHMARKS.md
echo "\`\`\`text" >> /Users/ajoxendine68/.gemini/antigravity/brain/3a229c88-64b4-4b23-9f5f-4872841b7a3f/REAL_LIFE_BENCHMARKS.md
top -l 1 | head -n 10 >> /Users/ajoxendine68/.gemini/antigravity/brain/3a229c88-64b4-4b23-9f5f-4872841b7a3f/REAL_LIFE_BENCHMARKS.md
echo "\`\`\`" >> /Users/ajoxendine68/.gemini/antigravity/brain/3a229c88-64b4-4b23-9f5f-4872841b7a3f/REAL_LIFE_BENCHMARKS.md

echo "## 2. FLUID MEMORY I/O LATENCY (REAL DISK WRITE/READ)" >> /Users/ajoxendine68/.gemini/antigravity/brain/3a229c88-64b4-4b23-9f5f-4872841b7a3f/REAL_LIFE_BENCHMARKS.md
echo "\`\`\`text" >> /Users/ajoxendine68/.gemini/antigravity/brain/3a229c88-64b4-4b23-9f5f-4872841b7a3f/REAL_LIFE_BENCHMARKS.md
echo "Testing raw write speed to Xoras_Workspace (simulating heavy vector dump)..." >> /Users/ajoxendine68/.gemini/antigravity/brain/3a229c88-64b4-4b23-9f5f-4872841b7a3f/REAL_LIFE_BENCHMARKS.md
dd if=/dev/zero of=/Users/ajoxendine68/Desktop/Xoras_Workspace/test_memory.tmp bs=1m count=500 2>> /Users/ajoxendine68/.gemini/antigravity/brain/3a229c88-64b4-4b23-9f5f-4872841b7a3f/REAL_LIFE_BENCHMARKS.md
echo "Testing raw read speed (simulating context retrieval)..." >> /Users/ajoxendine68/.gemini/antigravity/brain/3a229c88-64b4-4b23-9f5f-4872841b7a3f/REAL_LIFE_BENCHMARKS.md
dd if=/Users/ajoxendine68/Desktop/Xoras_Workspace/test_memory.tmp of=/dev/null bs=1m 2>> /Users/ajoxendine68/.gemini/antigravity/brain/3a229c88-64b4-4b23-9f5f-4872841b7a3f/REAL_LIFE_BENCHMARKS.md
rm -f /Users/ajoxendine68/Desktop/Xoras_Workspace/test_memory.tmp
echo "\`\`\`" >> /Users/ajoxendine68/.gemini/antigravity/brain/3a229c88-64b4-4b23-9f5f-4872841b7a3f/REAL_LIFE_BENCHMARKS.md

echo "## 3. ACTIVE SWARM PROCESSES" >> /Users/ajoxendine68/.gemini/antigravity/brain/3a229c88-64b4-4b23-9f5f-4872841b7a3f/REAL_LIFE_BENCHMARKS.md
echo "\`\`\`text" >> /Users/ajoxendine68/.gemini/antigravity/brain/3a229c88-64b4-4b23-9f5f-4872841b7a3f/REAL_LIFE_BENCHMARKS.md
ps aux | grep -E "ollama|python|agent_speak|antigravity" | grep -v grep | head -n 15 >> /Users/ajoxendine68/.gemini/antigravity/brain/3a229c88-64b4-4b23-9f5f-4872841b7a3f/REAL_LIFE_BENCHMARKS.md
echo "\`\`\`" >> /Users/ajoxendine68/.gemini/antigravity/brain/3a229c88-64b4-4b23-9f5f-4872841b7a3f/REAL_LIFE_BENCHMARKS.md
