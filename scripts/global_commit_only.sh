#!/bin/bash
TARGET_DIR="/Users/ajoxendine68/Desktop/Xoras_Workspace/Backups_and_Configs/_Archive/History/github_audits/"

echo "=================================================="
echo " 🌐 XORAS SYSTEMS: GLOBAL COMMIT SEQUENCE"
echo "=================================================="

for d in "$TARGET_DIR"/*; do
    if [ -d "$d/.git" ]; then
        echo "[MAXX] Committing seal to: $(basename "$d")"
        cd "$d"
        git add XORAS_SYSTEMS_VERIFIED.md 2>/dev/null
        git commit -m "chore(security): injected Xoras Systems cryptographic verification seal" 2>/dev/null
    fi
done
echo "[AXIOM] Local commit sequence completed."
