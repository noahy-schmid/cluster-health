#!/bin/bash

# Cleanup script for PR preview deployments
# This script should be placed at ~/cleanup-pr.sh on the DigitalOcean droplet
# Usage: sudo ./cleanup-pr.sh <PR_NUMBER>

set -e

PR_NUMBER=$1

if [ -z "$PR_NUMBER" ]; then
    echo "Error: PR number is required"
    echo "Usage: $0 <PR_NUMBER>"
    exit 1
fi

# Configuration variables
PR_ROOT="/var/www/pr-$PR_NUMBER"

echo "Cleaning up PR #$PR_NUMBER preview deployment..."

# Function to detect NGINX configuration file
detect_nginx_config() {
    # Check common NGINX configuration file locations
    if [ -f "/etc/nginx/sites-available/default" ]; then
        echo "/etc/nginx/sites-available/default"
    elif [ -f "/etc/nginx/conf.d/default.conf" ]; then
        echo "/etc/nginx/conf.d/default.conf"
    elif [ -f "/etc/nginx/default.conf" ]; then
        echo "/etc/nginx/default.conf"
    elif [ -f "/etc/nginx/nginx.conf" ]; then
        # Check if nginx.conf has a server block we can use
        if grep -q "server {" "/etc/nginx/nginx.conf"; then
            echo "/etc/nginx/nginx.conf"
        else
            echo ""
        fi
    else
        echo ""
    fi
}

# Remove PR directory
if [ -d "$PR_ROOT" ]; then
    rm -rf "$PR_ROOT"
    echo "✅ Removed PR directory: $PR_ROOT"
else
    echo "ℹ️  PR directory does not exist: $PR_ROOT"
fi

# Detect NGINX configuration file
MAIN_CONFIG_FILE=$(detect_nginx_config)

if [ -z "$MAIN_CONFIG_FILE" ]; then
    echo "ℹ️  No NGINX configuration file found"
    echo "🧹 Cleanup completed for PR #$PR_NUMBER"
    exit 0
fi

echo "Using NGINX configuration file: $MAIN_CONFIG_FILE"

# Remove NGINX configuration for this PR
if [ -f "$MAIN_CONFIG_FILE" ]; then
    # Create temporary file without the PR location block
    TEMP_CONFIG=$(mktemp)
    
    # Remove the PR location block and its comment
    awk -v pr_num="$PR_NUMBER" '
    /^[[:space:]]*# PR Preview #/ && $4 == pr_num {
        # Skip the comment line
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
    /^[[:space:]]*$/ && skip {
        # Skip empty lines within the block
        next
    }
    !skip { print }
    ' "$MAIN_CONFIG_FILE" > "$TEMP_CONFIG"
    
    # Replace the original config with the cleaned one
    cp "$TEMP_CONFIG" "$MAIN_CONFIG_FILE"
    rm "$TEMP_CONFIG"
    
    # Test NGINX configuration
    if nginx -t; then
        # Reload NGINX
        systemctl reload nginx
        echo "✅ NGINX configuration cleaned up for PR #$PR_NUMBER"
    else
        echo "❌ NGINX configuration test failed after cleanup"
        echo "Please check NGINX configuration manually"
        exit 1
    fi
else
    echo "ℹ️  NGINX config file not found: $MAIN_CONFIG_FILE"
fi

echo "🧹 Cleanup completed for PR #$PR_NUMBER"