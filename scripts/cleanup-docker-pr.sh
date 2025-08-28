#!/bin/bash

# Docker-based cleanup script for PR preview deployments
# This script should be placed at ~/cleanup-docker-pr.sh on the DigitalOcean droplet
# Usage: ./cleanup-docker-pr.sh <PR_NUMBER>

set -e

PR_NUMBER=$1

if [ -z "$PR_NUMBER" ]; then
    echo "Error: PR number is required"
    echo "Usage: $0 <PR_NUMBER>"
    exit 1
fi

# Configuration variables
COMPOSE_FILE="~/docker-compose.pr-$PR_NUMBER.yml"
NGINX_DYNAMIC_CONFIG="~/nginx-dynamic.conf"
CONTAINER_NAME="cluster-health-pr-$PR_NUMBER"

echo "Cleaning up Docker-based PR #$PR_NUMBER preview deployment..."

# Stop and remove Docker containers for this PR
if [ -f "$COMPOSE_FILE" ]; then
    echo "Stopping and removing PR containers..."
    docker-compose -f "$COMPOSE_FILE" down --volumes --remove-orphans || true
    rm -f "$COMPOSE_FILE"
    echo "✅ PR containers and compose file removed"
else
    echo "ℹ️  Compose file not found: $COMPOSE_FILE"
    
    # Try to stop container directly if it exists
    if docker ps -a --format "{{.Names}}" | grep -q "^$CONTAINER_NAME$"; then
        echo "Stopping container directly..."
        docker stop "$CONTAINER_NAME" || true
        docker rm "$CONTAINER_NAME" || true
        echo "✅ Container removed directly"
    fi
fi

# Remove PR location from nginx config
remove_pr_from_nginx() {
    local config_file="$1"
    local pr_num="$2"
    
    if [ ! -f "$config_file" ]; then
        echo "ℹ️  NGINX config file not found: $config_file"
        return 0
    fi
    
    # Check if PR location block exists
    if ! grep -q "location /pr-$pr_num" "$config_file"; then
        echo "ℹ️  No NGINX configuration found for PR #$pr_num"
        return 0
    fi
    
    # Create temporary file without the PR location block
    local temp_config=$(mktemp)
    
    # Remove the PR location block and its comment
    awk -v pr_num="$pr_num" '
    /^[[:space:]]*# PR Preview #/ && $4 == pr_num {
        # Skip the comment line and start skipping the block
        skip = 1
        next
    }
    /^[[:space:]]*location \/pr-/ && index($0, "/pr-" pr_num " ") {
        # Skip the location block
        skip = 1
        next
    }
    /^[[:space:]]*\}/ && skip {
        # Skip the closing brace of the location block
        skip = 0
        next
    }
    /^[[:space:]]*proxy_pass/ && skip {
        # Skip proxy_pass lines within the block
        next
    }
    /^[[:space:]]*proxy_set_header/ && skip {
        # Skip proxy_set_header lines within the block
        next
    }
    /^[[:space:]]*$/ && skip {
        # Skip empty lines within the block
        next
    }
    !skip { print }
    ' "$config_file" > "$temp_config"
    
    # Replace the original config with the cleaned one
    cp "$temp_config" "$config_file"
    rm "$temp_config"
    
    echo "✅ Removed PR #$pr_num configuration from nginx"
}

# Clean up NGINX configuration
echo "Cleaning up NGINX configuration..."
remove_pr_from_nginx "$NGINX_DYNAMIC_CONFIG" "$PR_NUMBER"

# Check if there are any other PR containers running
OTHER_PRS=$(docker ps --format "{{.Names}}" | grep "^cluster-health-pr-" | grep -v "^$CONTAINER_NAME$" || true)

if [ -z "$OTHER_PRS" ]; then
    echo "No other PR containers running. Stopping nginx proxy..."
    # Stop nginx proxy since no PRs are running
    if docker ps --format "{{.Names}}" | grep -q "^nginx-proxy$"; then
        docker stop nginx-proxy || true
        docker rm nginx-proxy || true
        echo "✅ Nginx proxy stopped"
    fi
else
    echo "Other PR containers still running. Restarting nginx proxy with updated config..."
    # Restart nginx proxy to reload configuration
    if docker ps --format "{{.Names}}" | grep -q "^nginx-proxy$"; then
        docker stop nginx-proxy || true
        docker rm nginx-proxy || true
    fi
    
    # Find any running PR container to get its compose file
    FIRST_PR=$(echo "$OTHER_PRS" | head -1 | sed 's/cluster-health-pr-//')
    if [ -f "~/docker-compose.pr-$FIRST_PR.yml" ]; then
        echo "Restarting nginx proxy using compose file for PR #$FIRST_PR..."
        docker-compose -f "~/docker-compose.pr-$FIRST_PR.yml" up -d nginx-proxy
        echo "✅ Nginx proxy restarted"
    fi
fi

# Clean up any orphaned images and networks
echo "Cleaning up Docker resources..."
docker image prune -f || true
docker network prune -f || true

echo "🧹 Cleanup completed for PR #$PR_NUMBER"