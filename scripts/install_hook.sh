#!/bin/bash
# XORAS Pre-Commit Hook Installer
# Standard L5 Integrity Baseline

set -e

HOOK_SRC=".git/hooks/pre-commit"
HOOK_DEST=".git/hooks/pre-commit"

echo "🔒 XORAS: Initiating Local Git Pre-Commit Hook Installer..."

# Check if .git exists
if [ ! -d ".git" ]; then
    echo "🚨 ERROR: .git directory not found. Please run this script from the repository root."
    exit 1
fi

# Ensure pre-commit hook is executable
if [ -f "$HOOK_SRC" ]; then
    chmod +x "$HOOK_SRC"
    echo "🛡️  XORAS: Hook execution permissions verified."
else
    echo "🚨 ERROR: Pre-commit hook script not found at $HOOK_SRC"
    exit 1
fi

echo "✅ XORAS: Pre-commit integrity validation successfully integrated."
exit 0
