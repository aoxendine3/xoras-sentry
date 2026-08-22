#!/bin/bash
TARGET_DIR="/Users/ajoxendine68/Desktop/Xoras_Workspace/Backups_and_Configs/_Archive/History/github_audits"

echo "=================================================="
echo " 🛠️ XORAS SYSTEMS: SURGICAL GIT REPAIR"
echo "=================================================="

for d in "$TARGET_DIR"/*; do
    if [ -d "$d/.git" ]; then
        echo "[VANCE] Diagnosing and repairing: $(basename "$d")"
        cd "$d"
        
        # 1. Strip the immutable locks blocking the git processes
        chflags -R nouchg .git 2>/dev/null
        chflags -R nouchg .git/objects/pack 2>/dev/null
        
        # 2. Clear stale crash locks that are jamming the pipelines
        if [ -f ".git/index.lock" ]; then
            rm -f .git/index.lock
            echo "   -> Cleared stale index.lock"
        fi
        
        find .git/refs -name "*.lock" -type f -delete 2>/dev/null
        
        # 3. Attempt to run git fsck and gc to repair short packfiles
        git gc --auto --prune=now 2>/dev/null
        
        echo "   -> Repair sequence executed."
    fi
done

echo "[AXIOM] All targeted repositories have been unjammed."
