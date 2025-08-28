#!/bin/bash

# Simple cleanup script for Docker PR previews
# Usage: ./cleanup-docker-pr.sh <PR_NUMBER>

set -e

PR_NUMBER=$1

if [ -z "$PR_NUMBER" ]; then
    echo "Error: PR number is required"
    echo "Usage: $0 <PR_NUMBER>"
    exit 1
fi

# Configuration
BASE_PORT=8000
PR_PORT=$((BASE_PORT + PR_NUMBER))
COMPOSE_FILE="~/docker-compose.pr-$PR_NUMBER.yml"
CONTAINER_NAME="cluster-health-pr-$PR_NUMBER"

echo "🧹 Cleaning up Docker-based PR #$PR_NUMBER preview..."

# Stop and remove container
if docker ps -a --format "{{.Names}}" | grep -q "^$CONTAINER_NAME$"; then
    echo "🛑 Stopping and removing container $CONTAINER_NAME..."
    docker stop "$CONTAINER_NAME" || true
    docker rm "$CONTAINER_NAME" || true
    echo "✅ Container removed"
else
    echo "ℹ️  Container $CONTAINER_NAME not found"
fi

# Remove docker-compose file
if [ -f "$COMPOSE_FILE" ]; then
    echo "🗑️  Removing docker-compose file..."
    rm "$COMPOSE_FILE"
    echo "✅ Docker-compose file removed"
else
    echo "ℹ️  Docker-compose file not found"
fi

# Remove nginx configuration for this PR
echo "🔧 Removing nginx configuration for PR #$PR_NUMBER..."
NGINX_CONF="/etc/nginx/sites-available/default"

if sudo grep -q "# PR Preview #$PR_NUMBER" "$NGINX_CONF"; then
    # Remove the PR block from nginx config
    sudo sed -i "/# PR Preview #$PR_NUMBER/,/^[[:space:]]*}/d" "$NGINX_CONF"
    
    # Test and reload nginx
    if sudo nginx -t; then
        sudo systemctl reload nginx
        echo "✅ Nginx configuration updated"
    else
        echo "❌ Nginx configuration test failed"
    fi
else
    echo "ℹ️  No nginx configuration found for PR #$PR_NUMBER"
fi

# Clean up unused Docker images
echo "🧹 Cleaning up unused Docker resources..."
docker system prune -f || true

echo "✅ Cleanup completed for PR #$PR_NUMBER"