# Custom zsh configuration for devcontainer
# This file will be persistent across container rebuilds

# Oh My Zsh configuration
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="agnoster" # You can change this to your preferred theme

# Plugins
plugins=(
    git
    docker
    kubectl
    node
    npm
    rust
    zsh-autosuggestions
    zsh-syntax-highlighting
)

# Load Oh My Zsh
source $ZSH/oh-my-zsh.sh

# Custom aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias ..='cd ..'
alias ...='cd ../..'
alias k='kubectl'
alias d='docker'
alias pn='pnpm'

# Git aliases
alias gs='git status'
alias ga='git add'
alias gc='git commit'
alias gp='git push'
alias gl='git pull'
alias gco='git checkout'
alias gb='git branch'
alias gd='git diff'

# Kubernetes aliases
alias kgp='kubectl get pods'
alias kgs='kubectl get services'
alias kgd='kubectl get deployments'
alias kdp='kubectl describe pod'
alias kds='kubectl describe service'
alias kdd='kubectl describe deployment'

# Docker aliases  
alias dps='docker ps'
alias dpa='docker ps -a'
alias di='docker images'
alias dex='docker exec -it'
alias dlogs='docker logs'

# Navigation to common directories
alias workspace='cd /workspaces/cluster-health'
alias apps='cd /workspaces/cluster-health/apps'
alias frontend='cd /workspaces/cluster-health/apps/apps/my-stylist-frontend'
alias salon='cd /workspaces/cluster-health/apps/apps/salon-webpage'

# Environment variables
export EDITOR=code
export NEXT_TELEMETRY_DISABLED=1

# Add custom paths
export PATH="$HOME/.cargo/bin:$PATH"

# Welcome message
echo "🚀 Welcome to the cluster-health devcontainer!"
echo "📁 Workspace: /workspaces/cluster-health"
echo "🐚 Shell: zsh with Oh My Zsh"
echo "🔧 Tools: Node.js, pnpm, kubectl, helm, k9s, rust"
echo ""