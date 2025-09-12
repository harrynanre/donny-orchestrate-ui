#!/bin/bash

echo "🚀 Running postCreate setup..."

# Ensure Claude directories exist
mkdir -p .claude/{hooks,agents,commands,logs}

# Create settings.local.json if it doesn't exist
if [ ! -f .claude/settings.local.json ]; then
    cat > .claude/settings.local.json << 'EOF'
{
  "name": "Donny V5 UI - DevContainer",
  "description": "Donny V5 orchestration UI in DevContainer",
  "autoApprove": {
    "shell": [
      "ls", "tree", "cat", "sed", "awk", "grep", "find", "head", "tail", "echo", "pwd",
      "mkdir", "touch", "mv", "cp",
      "git status", "git add", "git commit", "git switch", "git checkout", "git pull", 
      "git fetch", "git merge", "git revert", "git stash", "git push",
      "node", "npm", "pnpm", "npx", "next", "tsc",
      "curl", "jq", "docker", "docker compose"
    ]
  },
  "requireApproval": {
    "shell": [
      "rm", "rmdir", "git reset --hard", "git clean", "git push --force",
      "drop", "truncate", "delete from"
    ]
  },
  "environment": {
    "UI_PORT": "5000",
    "API_PORT": "5055",
    "DOCTOR_PORT": "5056",
    "CONTAINER": "true"
  }
}
EOF
    echo "✅ Created .claude/settings.local.json"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Print versions
echo ""
echo "📋 Environment versions:"
echo "  Node.js: $(node --version)"
echo "  pnpm: $(pnpm --version)"
echo "  npm: $(npm --version)"
# echo "  claude: $(claude --version 2>/dev/null || echo 'not installed yet')"

echo ""
echo "✅ PostCreate setup complete!"