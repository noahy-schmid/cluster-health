#!/bin/bash
set -e

echo "🚀 Setting up dein.salon devcontainer..."

# ── Set zsh as default shell ────────────────────────────────────────────────
if [ "$SHELL" != "/usr/bin/zsh" ] && [ "$SHELL" != "/bin/zsh" ]; then
  echo "🐚 Setting zsh as default shell..."
  sudo chsh -s "$(which zsh)" node 2>/dev/null || true
fi

# ── Configure zsh ───────────────────────────────────────────────────────────
echo "⚡ Configuring zsh..."

# Copy custom zsh configuration as the main .zshrc
if [ -f "/workspaces/deinsalon/.devcontainer/zshrc-custom.sh" ]; then
  cp /workspaces/deinsalon/.devcontainer/zshrc-custom.sh "$HOME/.zshrc"
fi

# ── Install dependencies ────────────────────────────────────────────────────
echo "📦 Installing project dependencies..."
cd /workspaces/deinsalon
pnpm install

echo ""
echo "🎉 dein.salon devcontainer is ready!"
echo "📁 Workspace: /workspaces/deinsalon"
echo "🐚 Shell: zsh with Powerlevel10k, fzf-tab, autosuggestions"
echo "🗄️  PostgreSQL: postgres:5432 (user: postgres, password: postgres, db: deinsalon)"
echo "📦 MinIO S3: minio:9000 (console: minio:9001, user: minioadmin, password: minioadmin)"