# Powerlevel10k instant prompt (must stay near the top)
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

# Oh My Zsh configuration
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="powerlevel10k/powerlevel10k"

# Plugins (fzf-tab must be loaded before other completion plugins)
# zsh-autosuggestions and zsh-syntax-highlighting are sourced from
# Homebrew below, so they are not listed here.
plugins=(
    git
    docker
    node
    npm
    fzf
    fzf-tab
)

source $ZSH/oh-my-zsh.sh

# ── Homebrew-installed zsh plugins (loaded as fallback / supplement) ──────────
BREW_PREFIX="/home/linuxbrew/.linuxbrew"

# zsh-autosuggestions (Homebrew)
if [[ -f "$BREW_PREFIX/share/zsh-autosuggestions/zsh-autosuggestions.zsh" ]]; then
  source "$BREW_PREFIX/share/zsh-autosuggestions/zsh-autosuggestions.zsh"
fi

# zsh-syntax-highlighting (Homebrew)
if [[ -f "$BREW_PREFIX/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh" ]]; then
  source "$BREW_PREFIX/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh"
fi

# zsh-history-substring-search (Homebrew)
if [[ -f "$BREW_PREFIX/share/zsh-history-substring-search/zsh-history-substring-search.zsh" ]]; then
  source "$BREW_PREFIX/share/zsh-history-substring-search/zsh-history-substring-search.zsh"
fi

# ── Autosuggestions configuration ────────────────────────────────────────────
# Accept the inline suggestion with the right arrow key
ZSH_AUTOSUGGEST_STRATEGY=(history completion)
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE="fg=#888888"

# ── History substring search key bindings ────────────────────────────────────
# Up/Down arrows search history filtered by what is already typed.
# The cursor moves to the end of the line so you can edit or accept.
bindkey '^[[A' history-substring-search-up
bindkey '^[[B' history-substring-search-down
bindkey '^[OA' history-substring-search-up
bindkey '^[OB' history-substring-search-down

# Move cursor to end of line after accepting a history substring match
HISTORY_SUBSTRING_SEARCH_ENSURE_UNIQUE=1

# ── fzf-tab configuration ───────────────────────────────────────────────────
zstyle ':fzf-tab:complete:cd:*' fzf-preview 'ls -1 --color=always $realpath 2>/dev/null'
zstyle ':fzf-tab:*' switch-group ',' '.'

# ── History settings ─────────────────────────────────────────────────────────
HISTSIZE=50000
SAVEHIST=50000
setopt HIST_IGNORE_ALL_DUPS
setopt HIST_FIND_NO_DUPS
setopt HIST_SAVE_NO_DUPS
setopt SHARE_HISTORY
setopt APPEND_HISTORY

# ── Load Powerlevel10k config ────────────────────────────────────────────────
[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh

# ── Aliases ──────────────────────────────────────────────────────────────────
alias ll='ls -alF'
alias la='ls -A'
alias pn='pnpm'

alias gs='git status'
alias ga='git add'
alias gc='git commit'
alias gp='git push'
alias gl='git pull'
alias gco='git checkout'
alias gb='git branch'
alias gd='git diff'

# ── Environment ──────────────────────────────────────────────────────────────
export EDITOR=code
export NEXT_TELEMETRY_DISABLED=1