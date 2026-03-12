FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

ENV DEBIAN_FRONTEND=noninteractive
ENV NEXT_TELEMETRY_DISABLED=1

# Install system dependencies needed for Homebrew and zsh plugins
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    file \
    git \
    procps \
    zsh \
    && rm -rf /var/lib/apt/lists/*

# Switch to the non-root user (provided by the base image)
USER node

# Install Homebrew
RUN /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
ENV PATH="/home/linuxbrew/.linuxbrew/bin:/home/linuxbrew/.linuxbrew/sbin:${PATH}"

# Install all development dependencies through Homebrew
# Node.js 22 is already provided by the base image
RUN brew install \
    pnpm \
    fzf \
    turbo \
    zsh-autosuggestions \
    zsh-syntax-highlighting \
    zsh-history-substring-search

# Install Oh My Zsh
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# Install Powerlevel10k theme
RUN git clone --depth=1 https://github.com/romkatv/powerlevel10k.git \
    "${HOME}/.oh-my-zsh/custom/themes/powerlevel10k"

# Install fzf-tab plugin
RUN git clone --depth=1 https://github.com/Aloxaf/fzf-tab.git \
    "${HOME}/.oh-my-zsh/custom/plugins/fzf-tab"

# Set default shell to zsh
ENV SHELL=/bin/zsh

# Set working directory
WORKDIR /workspaces/deinsalon

ENV DEBIAN_FRONTEND=