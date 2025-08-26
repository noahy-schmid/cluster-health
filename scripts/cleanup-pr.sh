#!/bin/bash

# Cleanup script for PR preview deployments
# This script should be placed at /home/$USER/cleanup-pr.sh on the DigitalOcean droplet
# Usage: sudo ./cleanup-pr.sh <PR_NUMBER>

set -e

PR_NUMBER=$1

if [ -z "$PR_NUMBER" ]; then
    echo "Error: PR number is required"
    echo "Usage: $0 <PR_NUMBER>"
    exit 1
fi

# Configuration variables
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
PR_ROOT="/var/www/pr-$PR_NUMBER"
MAIN_CONFIG_FILE="$NGINX_SITES_AVAILABLE/default"

echo "Cleaning up PR #$PR_NUMBER preview deployment..."

# Remove PR directory
if [ -d "$PR_ROOT" ]; then
    rm -rf "$PR_ROOT"
    echo "✅ Removed PR directory: $PR_ROOT"
else
    echo "ℹ️  PR directory does not exist: $PR_ROOT"
fi

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