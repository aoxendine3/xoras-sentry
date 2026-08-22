#!/bin/bash

echo "==============================================="
echo " 🦅 XORAS SWARM: INITIATING AUTOMATED DAEMONS"
echo "==============================================="

# 1. Ambient Cryptography (Continuous Security)
nohup python3 /Users/ajoxendine68/Desktop/Xoras_Workspace/xoras-sentry/scripts/xoras_ambient_crypto_daemon.py > /tmp/ambient_crypto.log 2>&1 &
echo "[+] Ambient Cryptography Daemon launched."

# 2. Axiom Math & Humanizer Stress Test (Maturation)
# We will run the triad stress test in the background to keep the models cooking
nohup python3 /Users/ajoxendine68/Desktop/Xoras_Workspace/memory/learning/gyms/triad_stress_test.py > /tmp/triad_sweat_bg.log 2>&1 &
echo "[+] Triad Math & Maturation Dojo launched."

# 3. Autonomous RevOps Funnel
nohup python3 /Users/ajoxendine68/Desktop/Xoras_Workspace/xoras-sentry/scripts/autonomous_revops.py > /tmp/revops_bg.log 2>&1 &
echo "[+] Autonomous RevOps Pipeline launched."

echo "==============================================="
echo " All systems running. Background maturation active."
echo "==============================================="
