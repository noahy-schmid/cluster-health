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
NGINX_PROXY_CONFIG="/etc/nginx/nginx.conf"
CONTAINER_NAME="cluster-health-pr-$PR_NUMBER"

echo "Cleaning up Docker-based PR #$PR_NUMBER preview deployment..."

# Stop and remove Docker containers
if [ -f "$COMPOSE_FILE" ]; then
    echo "Stopping and removing Docker containers..."
    docker-compose -f "$COMPOSE_FILE" down --rmi all --volumes --remove-orphans || true
    rm -f "$COMPOSE_FILE"
    echo "✅ Docker containers and compose file removed"
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

# Remove any dangling images for this PR
echo "Cleaning up Docker images..."
docker image prune -f || true

# Function to detect NGINX configuration file
detect_nginx_config() {
    # Check common NGINX configuration file locations
    if [ -f "/etc/nginx/nginx.conf" ]; then
        echo "/etc/nginx/nginx.conf"
    elif [ -f "/etc/nginx/sites-available/default" ]; then
        echo "/etc/nginx/sites-available/default"
    elif [ -f "/etc/nginx/conf.d/default.conf" ]; then
        echo "/etc/nginx/conf.d/default.conf"
    elif [ -f "/etc/nginx/default.conf" ]; then
        echo "/etc/nginx/default.conf"
    else
        echo ""
    fi
}

# Clean up NGINX configuration
MAIN_CONFIG_FILE=$(detect_nginx_config)

if [ -z "$MAIN_CONFIG_FILE" ]; then
    echo "ℹ️  No NGINX configuration file found"
else
    echo "Using NGINX configuration file: $MAIN_CONFIG_FILE"
    
    if [ -f "$MAIN_CONFIG_FILE" ]; then
        # Create temporary file without the PR location block
        TEMP_CONFIG=$(mktemp)
        
        # Remove the PR location block and its comment
        awk -v pr_num="$PR_NUMBER" '
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
        ' "$MAIN_CONFIG_FILE" > "$TEMP_CONFIG"
        
        # Replace the original config with the cleaned one
        sudo cp "$TEMP_CONFIG" "$MAIN_CONFIG_FILE"
        rm "$TEMP_CONFIG"
        
        # Test NGINX configuration
        if sudo nginx -t; then
            # Reload NGINX
            sudo systemctl reload nginx
            echo "✅ NGINX configuration cleaned up for PR #$PR_NUMBER"
        else
            echo "❌ NGINX configuration test failed after cleanup"
            echo "Please check NGINX configuration manually"
            exit 1
        fi
    else
        echo "ℹ️  NGINX config file not found: $MAIN_CONFIG_FILE"
    fi
fi

# Clean up any orphaned networks if no containers are using them
echo "Cleaning up Docker networks..."
docker network prune -f || true

echo "🧹 Cleanup completed for PR #$PR_NUMBER"