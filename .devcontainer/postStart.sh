#!/bin/bash

# Set up YOLO mode aliases for container-only use
SHELL_RC="$HOME/.bashrc"
if [ -f "$HOME/.zshrc" ]; then
    SHELL_RC="$HOME/.zshrc"
fi

# Add aliases if not already present
if ! grep -q "claude.*dangerously-skip-permissions" "$SHELL_RC" 2>/dev/null; then
    cat >> "$SHELL_RC" << 'EOF'

# Claude YOLO mode (DevContainer only)
alias claude='claude --dangerously-skip-permissions'
alias c='claude --dangerously-skip-permissions'
EOF
    echo "✅ Added Claude YOLO aliases to $SHELL_RC"
fi

echo ""
echo "⚡ YOLO mode active inside DevContainer (skip-permissions)."
echo "⚠️  This only applies INSIDE the container. Outside, normal prompts apply."
echo ""
echo "Usage: 'claude' or 'c' for no-prompt mode (container only)"
echo ""