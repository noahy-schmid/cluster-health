#!/bin/bash

# Docker-based deployment script for PR preview deployments
# This script should be placed at /home/$USER/deploy-docker-pr.sh on the DigitalOcean droplet
# Usage: ./deploy-docker-pr.sh <PR_NUMBER> <DOCKER_IMAGE_TAG>

set -e

PR_NUMBER=$1
DOCKER_IMAGE_TAG=$2

if [ -z "$PR_NUMBER" ] || [ -z "$DOCKER_IMAGE_TAG" ]; then
    echo "Error: PR number and Docker image tag are required"
    echo "Usage: $0 <PR_NUMBER> <DOCKER_IMAGE_TAG>"
    exit 1
fi

# Configuration variables
COMPOSE_FILE="$HOME/docker-compose.pr-$PR_NUMBER.yml"
NGINX_PROXY_CONFIG="/etc/nginx/nginx.conf"
CONTAINER_NAME="cluster-health-pr-$PR_NUMBER"

echo "Deploying Docker-based PR #$PR_NUMBER preview..."

# Verify Docker is available (should be installed by CI pipeline)
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed on this system"
    echo "Docker should have been installed by the CI pipeline."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed on this system"
    echo "Docker Compose should have been installed by the CI pipeline."
    exit 1
fi

# Create cluster-health network if it doesn't exist
if ! docker network ls | grep -q "cluster-health"; then
    echo "Creating Docker network..."
    docker network create cluster-health
fi

# Create docker-compose file for this PR
echo "Creating docker-compose file at: $COMPOSE_FILE"
echo "Current working directory: $(pwd)"
echo "Home directory: $HOME"

# Ensure we can write to the home directory
if [ ! -w "$HOME" ]; then
    echo "❌ Error: Cannot write to home directory $HOME"
    exit 1
fi

cat > "$COMPOSE_FILE" << EOF
version: '3.8'

services:
  app-pr-$PR_NUMBER:
    image: $DOCKER_IMAGE_TAG
    container_name: $CONTAINER_NAME
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PUBLIC_URL=/pr-$PR_NUMBER
    networks:
      - cluster-health
    labels:
      - "pr.number=$PR_NUMBER"
      - "pr.cleanup=true"

networks:
  cluster-health:
    external: true
EOF

# Verify the docker-compose file was created successfully
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ Error: Failed to create docker-compose file at $COMPOSE_FILE"
    exit 1
fi

echo "✅ Docker-compose file created successfully at $COMPOSE_FILE"

# Stop and remove existing container if it exists
if docker ps -a --format "{{.Names}}" | grep -q "^$CONTAINER_NAME$"; then
    echo "Stopping existing container..."
    docker-compose -f "$COMPOSE_FILE" down
fi

# Start the new container
echo "Starting PR #$PR_NUMBER container..."
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for container to be ready
echo "Waiting for container to be ready..."
sleep 10

# Verify container is running
if docker ps --format "{{.Names}}" | grep -q "^$CONTAINER_NAME$"; then
    echo "✅ Container $CONTAINER_NAME is running"
else
    echo "❌ Failed to start container $CONTAINER_NAME"
    exit 1
fi

# Configure NGINX proxy for this PR
configure_nginx_proxy() {
    local config_file="$1"
    local pr_num="$2"
    local container_name="$3"
    
    # Check if PR location block already exists
    if grep -q "location /pr-$pr_num" "$config_file"; then
        echo "NGINX configuration for PR #$pr_num already exists"
        return 0
    fi
    
    # Create temporary file with the new location block
    local temp_config=$(mktemp)
    
    # Add PR location block before the main location /
    awk -v pr_num="$pr_num" -v container_name="$container_name" '
    /^[[:space:]]*# PR preview locations will be dynamically added here/ {
        print "        # PR Preview #" pr_num
        print "        location /pr-" pr_num " {"
        print "            proxy_pass http://" container_name ":80/;"
        print "            proxy_set_header Host $host;"
        print "            proxy_set_header X-Real-IP $remote_addr;"
        print "            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;"
        print "            proxy_set_header X-Forwarded-Proto $scheme;"
        print "        }"
        print ""
    }
    { print }
    ' "$config_file" > "$temp_config"
    
    # Replace the original config with the updated one
    cp "$temp_config" "$config_file"
    rm "$temp_config"
}

# Check if NGINX is installed and configure it
if command -v nginx &> /dev/null; then
    echo "Configuring NGINX proxy for PR #$PR_NUMBER..."
    
    # Backup original config if backup doesn't exist
    if [ ! -f "$NGINX_PROXY_CONFIG.backup" ]; then
        sudo cp "$NGINX_PROXY_CONFIG" "$NGINX_PROXY_CONFIG.backup"
        echo "Created backup of original NGINX config"
    fi
    
    configure_nginx_proxy "$NGINX_PROXY_CONFIG" "$PR_NUMBER" "$CONTAINER_NAME"
    
    # Test NGINX configuration
    if sudo nginx -t; then
        # Reload NGINX
        sudo systemctl reload nginx
        echo "✅ NGINX configuration updated for PR #$PR_NUMBER"
    else
        echo "❌ NGINX configuration test failed"
        exit 1
    fi
else
    echo "⚠️  NGINX not found. Please install NGINX to enable reverse proxy."
fi

echo "🚀 PR #$PR_NUMBER deployed successfully!"
echo "Container: $CONTAINER_NAME"
echo "Compose file: $COMPOSE_FILE"