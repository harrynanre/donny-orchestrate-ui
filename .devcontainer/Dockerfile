FROM mcr.microsoft.com/devcontainers/typescript-node:20

# Install additional tools
RUN apt-get update && apt-get install -y \
    curl \
    jq \
    git \
    && rm -rf /var/lib/apt/lists/*

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install Claude Code CLI globally (when available)
# Note: This is a placeholder - adjust when the actual package is published
# RUN npm install -g @anthropic-ai/claude-code

# Set working directory
WORKDIR /workspace

# Create non-root user if not exists
RUN useradd -m -s /bin/bash claude-dev 2>/dev/null || true

# Switch to non-root user
USER node

# Set up environment
ENV NODE_ENV=development