#!/bin/bash

# Setup script for devcontainer workspace initialization
set -e

WORKSPACE_DIR="/workspaces/cluster-health"
HOST_WORKSPACE="/tmp/host-workspace"

echo "🚀 Setting up devcontainer workspace..."

# Create workspace directory if it doesn't exist
mkdir -p "$WORKSPACE_DIR"

# Check if this is the first time setup (no .git directory in volume)
if [ ! -d "$WORKSPACE_DIR/.git" ]; then
    echo "📂 First time setup - copying repository content to volume..."
    
    # Copy all files from host to volume, excluding .git, node_modules, and cache directories
    rsync -av --progress \
        --exclude='.git' \
        --exclude='node_modules' \
        --exclude='.pnpm-store' \
        --exclude='**/node_modules' \
        --exclude='**/.pnpm-store' \
        --exclude='.next' \
        --exclude='**/dist' \
        --exclude='**/build' \
        "$HOST_WORKSPACE/" "$WORKSPACE_DIR/" 2>/dev/null || {
        echo "⚠️  rsync not available, using alternative copy method..."
        # Create a more selective copy command that excludes the same directories
        find "$HOST_WORKSPACE" -type f \
            ! -path "*/node_modules/*" \
            ! -path "*/.pnpm-store/*" \
            ! -path "*/.git/*" \
            ! -path "*/.next/*" \
            ! -path "*/dist/*" \
            ! -path "*/build/*" \
            -exec cp --parents {} "$WORKSPACE_DIR/" \; 2>/dev/null || {
            echo "⚠️  Falling back to basic copy - this may include cache directories"
            cp -r "$HOST_WORKSPACE"/. "$WORKSPACE_DIR/"
        }
    }
    
    # Initialize git and set up remote
    cd "$WORKSPACE_DIR"
    
    if [ -d "$HOST_WORKSPACE/.git" ]; then
        echo "🔗 Setting up git repository..."
        git init .
        
        # Copy git config
        cp "$HOST_WORKSPACE/.git/config" "$WORKSPACE_DIR/.git/" 2>/dev/null || true
        
        # Get remote URL from host workspace
        REMOTE_URL=$(cd "$HOST_WORKSPACE" && git remote get-url origin 2>/dev/null || echo "")
        if [ -n "$REMOTE_URL" ]; then
            git remote add origin "$REMOTE_URL"
            echo "✅ Added remote: $REMOTE_URL"
        fi
        
        # Get current branch from host
        CURRENT_BRANCH=$(cd "$HOST_WORKSPACE" && git branch --show-current 2>/dev/null || echo "main")
        git checkout -b "$CURRENT_BRANCH" 2>/dev/null || git checkout "$CURRENT_BRANCH" 2>/dev/null || true
    fi
    
    echo "✅ Workspace initialization completed!"
else
    echo "📁 Existing workspace found, skipping initialization"
fi

# Set proper permissions for SSH
if [ -d "/home/node/.ssh" ]; then
    chmod 700 /home/node/.ssh
    chmod 600 /home/node/.ssh/* 2>/dev/null || true
    echo "🔐 SSH permissions configured"
fi

# pnpm is already installed globally in the container
echo "📦 pnpm is already available globally"

# Set zsh as default shell (if not already set)
if [ "$SHELL" != "/usr/bin/zsh" ] && [ "$SHELL" != "/bin/zsh" ]; then
    echo "🐚 Configuring zsh as default shell..."
    sudo chsh -s /usr/bin/zsh node 2>/dev/null || sudo chsh -s /bin/zsh node 2>/dev/null || true
fi

# Set up custom zsh configuration
echo "⚡ Configuring zsh customizations..."
mkdir -p /home/node/.zshrc.d

# Copy custom zsh configuration if it exists
if [ -f "/tmp/host-workspace/.devcontainer/zshrc-custom.sh" ]; then
    cp "/tmp/host-workspace/.devcontainer/zshrc-custom.sh" "/home/node/.zshrc.d/custom.zsh"
fi

# Add sourcing of custom config to .zshrc if not already present
if [ -f "/home/node/.zshrc" ] && ! grep -q ".zshrc.d/custom.zsh" "/home/node/.zshrc"; then
    echo "" >> /home/node/.zshrc
    echo "# Source custom configuration" >> /home/node/.zshrc
    echo "[ -f ~/.zshrc.d/custom.zsh ] && source ~/.zshrc.d/custom.zsh" >> /home/node/.zshrc
fi

# Install additional zsh plugins if Oh My Zsh is installed
if [ -d "/home/node/.oh-my-zsh" ]; then
    echo "🔌 Installing additional zsh plugins..."
    
    # Install zsh-autosuggestions
    if [ ! -d "/home/node/.oh-my-zsh/custom/plugins/zsh-autosuggestions" ]; then
        git clone https://github.com/zsh-users/zsh-autosuggestions /home/node/.oh-my-zsh/custom/plugins/zsh-autosuggestions 2>/dev/null || true
    fi
    
    # Install zsh-syntax-highlighting
    if [ ! -d "/home/node/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting" ]; then
        git clone https://github.com/zsh-users/zsh-syntax-highlighting /home/node/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting 2>/dev/null || true
    fi
fi

# Fix ownership of home directory files
sudo chown -R node:node /home/node/.zshrc.d /home/node/.oh-my-zsh 2>/dev/null || true

echo "🎉 Devcontainer setup completed successfully!"
echo "� Running with Docker Compose for easy service management"
echo "💡 Workspace uses Docker volume for better performance"
echo "🔒 SSH keys, zsh config, and Rust/Node caches persist across rebuilds"
echo "⚡ Custom zsh with fzf, kubectl, pnpm, and development aliases ready"
echo "📦 Tools available: pnpm, fzf, kubectl, helm, k9s, rust, ripgrep"