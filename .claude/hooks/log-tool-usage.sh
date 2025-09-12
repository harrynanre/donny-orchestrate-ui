#!/bin/bash

# Log tool usage without exposing secrets
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
TOOL_NAME="${1:-unknown}"
TOOL_ACTION="${2:-unknown}"

# Create log directory if it doesn't exist
mkdir -p .claude/logs

# Log entry (no secrets)
echo "[$TIMESTAMP] Tool: $TOOL_NAME | Action: $TOOL_ACTION" >> .claude/logs/tool-usage.log

# Rotate log if it gets too large (>10MB)
if [ -f .claude/logs/tool-usage.log ]; then
    SIZE=$(stat -f%z .claude/logs/tool-usage.log 2>/dev/null || stat -c%s .claude/logs/tool-usage.log 2>/dev/null || echo 0)
    if [ "$SIZE" -gt 10485760 ]; then
        mv .claude/logs/tool-usage.log .claude/logs/tool-usage.log.$(date +%Y%m%d_%H%M%S)
        # Keep only last 5 rotated logs
        ls -t .claude/logs/tool-usage.log.* 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null
    fi
fi