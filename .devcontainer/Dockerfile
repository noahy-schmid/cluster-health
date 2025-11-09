FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV NEXT_TELEMETRY_DISABLED=1



# Install system dependencies
RUN apt-get update && apt-get install -y \
    # Basic utilities
    curl \
    wget \
    git \
    unzip 

# Switch to the non-root user (created by base image)
USER node

# Install Homebrew for the node user
RUN /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" && \
    echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> ~/.bashrc && \
    eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"

# Install tools via Homebrew (with proper PATH)
RUN eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)" && \
    brew install fzf kubernetes-cli helm k9s

# Install pnpm globally
RUN npm install -g pnpm@latest

# Set shell environment for pnpm setup
ENV SHELL=/bin/bash
RUN pnpm setup

# Set PNPM environment variables
ENV PNPM_HOME="/home/node/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Install additional Node.js tools
RUN pnpm install -g \
    typescript \
    ts-node \
    nodemon \
    eslint \
    prettier \
    @types/node \
    turbo

# Set working directory (will be created by dev container runtime)
WORKDIR /workspaces/cluster-health

# Reset to noninteractive
ENV DEBIAN_FRONTEND=