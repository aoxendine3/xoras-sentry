#!/bin/bash
TARGET_DIR="/Users/ajoxendine68/Desktop/Xoras_Workspace/Backups_and_Configs/_Archive/History/github_audits/"

echo "=================================================="
echo " 🌐 XORAS SYSTEMS: GLOBAL GITHUB PUSH INITIATED"
echo "=================================================="

# Loop through all repos and push the seals to the live remote
for d in "$TARGET_DIR"/*; do
    if [ -d "$d/.git" ]; then
        echo "[MAXX] Locking in and pushing: $(basename "$d")"
        cd "$d"
        # Add the seal and any auto-patches we just made
        git add XORAS_SYSTEMS_VERIFIED.md
        git commit -m "chore(security): injected Xoras Systems cryptographic verification seal & cleared technical debt"
        
        # Attempt to push to main or master
        git push origin main || git push origin master
        echo "--------------------------------------------------"
    fi
done

echo "[AXIOM] Global namespace push completed."
