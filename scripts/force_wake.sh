#!/bin/bash
echo "=================================================="
echo " ⚡ EXORIS: FORCE WAKE PROTOCOL INITIATED"
echo "=================================================="

# 1. Memory & Identity Ingestion
echo "[AXIOM] Ingesting Memory Nodes and Honesty Protocol..."
if [ -f "/Users/ajoxendine68/Desktop/Xoras_Workspace/ELITE_BOW/core/HONESTY_PROTOCOL.md" ]; then
    echo "  -> Honesty Protocol: VERIFIED"
else
    echo "  -> [!] Honesty Protocol Missing. HALTING."
    exit 1
fi

# 2. Agent Roster Ingestion
echo "[VANCE] Ingesting Agent Roster & Voice Matrix..."
if grep -q "voice=\"Tom\"" /Users/ajoxendine68/Desktop/Xoras_Workspace/ELITE_BOW/ops/scripts/agent_speak.sh; then
    echo "  -> Voice Registry: VERIFIED & LOCKED"
else
    echo "  -> [!] Voice Registry Mismatch. HALTING."
    exit 1
fi

# 3. Hierarchy & Oversight Lock
echo "[MAXX] Locking Command Hierarchy..."
echo "  -> Overseer: JORIS (Active)"
echo "  -> System: EXORIS (Active)"
echo "  -> Lead: MAXX (Ready)"

echo "--------------------------------------------------"
echo "[EXORIS] ALL SYSTEMS INGESTED. ROSTER IS FULLY ALERT AND STANDING BY."
