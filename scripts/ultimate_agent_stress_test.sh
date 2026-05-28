#!/bin/bash

# ULTIMATE AGENT STRESS TEST EXECUTION WRAPPER
# Runs the full v2.0 suite and captures all metrics

set -e

echo "═══════════════════════════════════════════════════════════"
echo "ULTIMATE AGENT STRESS TEST SUITE v2.0"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Agents: 10 (XORAS, Nova, Vance, Aurelius, Evan, Clara, Dr. Jeremy, LEX CORE, Prism, Atlas)"
echo "Test Vectors: 5 (StateConsistency, CrossAgentComm, FailureInjection, ResourceContention, StateMachineValidation)"
echo "Total Test Events: 25+ with concurrent execution"
echo ""
echo "Starting execution..."
echo ""

# Run the compiled test suite
node /home/claude/agent-stress-suite.js


echo ""
echo "═══════════════════════════════════════════════════════════"
echo "TEST EXECUTION COMPLETE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📊 Report Location: /tmp/stress-test-report.md"
echo "📝 Full Log: /tmp/stress-test-full.log"
echo ""

# Display report if it exists
if [ -f /tmp/stress-test-report.md ]; then
    echo "Displaying report..."
    cat /tmp/stress-test-report.md
fi
