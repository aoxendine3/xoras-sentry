#!/bin/bash

# run-stress-test.sh
# Wrapper for the Ultimate Agent Stress Test Suite v2.0

# Ensure the script aborts on any error
set -e

# Paths
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
NODE_SCRIPT="$SCRIPT_DIR/agent-stress-suite.js"
LOG_FILE="/tmp/stress-test-full.log"
REPORT_FILE="/tmp/stress-test-report.md"

# Clean previous logs (optional)
rm -f "$LOG_FILE" "$REPORT_FILE"

echo "═══════════════════════════════════════════════════════════"
echo "Running Ultimate Agent Stress Test Suite v2.0"
echo "═══════════════════════════════════════════════════════════"

echo "Executing orchestrator..."
node "$SCRIPT_DIR/agent-stress-suite.cjs"

# After execution, display the report if it exists
if [[ -f "$REPORT_FILE" ]]; then
  echo "\n---\nReport Summary:\n"
  cat "$REPORT_FILE"
else
  echo "\n⚠️ Report not found at $REPORT_FILE"
fi

# Cleanup (optional – keep logs for later analysis)
# rm -f "$LOG_FILE" "$REPORT_FILE"

echo "\n✅ Stress test completed. Logs at $LOG_FILE, report at $REPORT_FILE"
