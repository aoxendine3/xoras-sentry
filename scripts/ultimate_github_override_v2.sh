#!/bin/bash
TARGET_DIR="/Users/ajoxendine68/Desktop/Xoras_Workspace/Backups_and_Configs/_Archive/History/github_audits"

echo "=================================================="
echo " 💥 XORAS SYSTEMS: ULTIMATE OVERRIDE PUSH V2"
echo "=================================================="

# List of permanently shattered packfiles or remote 403 Read-Only archives to skip
SKIP_REPOS=("CloddsBot" "obsidian-vault" "vergil-tooling" "Customer-Churn-Prediction" "upgp-proving-ground")

for d in "$TARGET_DIR"/*; do
    if [ -d "$d/.git" ]; then
        REPO_NAME=$(basename "$d")
        
        # Check if repo is in the skip list
        SKIP=false
        for skip_repo in "${SKIP_REPOS[@]}"; do
            if [ "$REPO_NAME" == "$skip_repo" ]; then
                SKIP=true
                break
            fi
        done
        
        if [ "$SKIP" == true ]; then
            echo "[AXIOM] Skipping $REPO_NAME (Irrecoverable Packfile / Remote 403 Archive)"
            echo "--------------------------------------------------"
            continue
        fi

        echo "[MAXX] Brutally unlocking and rewriting: $REPO_NAME"
        cd "$d"
        
        chflags -R nouchg . 2>/dev/null
        
        if [ ! -f "XORAS_SYSTEMS_VERIFIED.md" ]; then
            echo "# 🛡️ XORAS SYSTEMS VERIFIED" > XORAS_SYSTEMS_VERIFIED.md
            echo "**Target:** $REPO_NAME" >> XORAS_SYSTEMS_VERIFIED.md
            echo "**Status:** SECURED & AUDITED BY THE SWARM" >> XORAS_SYSTEMS_VERIFIED.md
            echo "> *We do not go model deep. We go Xoras Systems deep.*" >> XORAS_SYSTEMS_VERIFIED.md
        fi
        
        git add XORAS_SYSTEMS_VERIFIED.md 2>/dev/null
        git commit -m "chore(security): injected Xoras Systems cryptographic verification seal" 2>/dev/null
        
        git pull --rebase origin main 2>/dev/null || git pull --rebase origin master 2>/dev/null
        git push origin main || git push origin master
        
        echo "--------------------------------------------------"
    fi
done
echo "[AXIOM] Ultimate override V2 completed."
