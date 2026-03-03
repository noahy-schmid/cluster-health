# Custom zsh configuration for devcontainer
# This file will be persistent across container rebuilds

# Oh My Zsh configuration
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="powerlevel10k/powerlevel10k"

# Plugins
plugins=(
    git
    docker
    kubectl
    node
    npm
    rust
    fzf-tab
    zsh-autosuggestions
    zsh-syntax-highlighting
)

# Load Oh My Zsh
source $ZSH/oh-my-zsh.sh

# Powerlevel10k instant prompt
# Enable Powerlevel10k instant prompt. Should stay close to the top of ~/.zshrc.
# Initialization code that may require console input (password prompts, [y/n]
# confirmations, etc.) must go above this block; everything else may go below.
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

# Load Powerlevel10k config if it exists
[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh

# fzf-tab configuration
# Enable fzf-tab for better tab completion
zstyle ':fzf-tab:complete:cd:*' fzf-preview 'eza -1 --color=always $realpath 2>/dev/null || ls -1 --color=always $realpath'
zstyle ':fzf-tab:complete:__zoxide_z:*' fzf-preview 'eza -1 --color=always $realpath 2>/dev/null || ls -1 --color=always $realpath'
zstyle ':fzf-tab:*' switch-group ',' '.'

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
alias frontend='cd /workspaces/cluster-health/apps/apps/marketing-webpage'
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