#!/bin/bash

# NGINX configuration script for PR preview deployments
# This script should be placed at /home/$USER/configure-nginx-pr.sh on the DigitalOcean droplet
# Usage: sudo ./configure-nginx-pr.sh <PR_NUMBER>

set -e

PR_NUMBER=$1

if [ -z "$PR_NUMBER" ]; then
    echo "Error: PR number is required"
    echo "Usage: $0 <PR_NUMBER>"
    exit 1
fi

# Configuration variables
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
PR_ROOT="/var/www/pr-$PR_NUMBER"
MAIN_CONFIG_FILE="$NGINX_SITES_AVAILABLE/default"

echo "Configuring NGINX for PR #$PR_NUMBER..."

# Backup original config if it doesn't exist
if [ ! -f "$MAIN_CONFIG_FILE.backup" ]; then
    cp "$MAIN_CONFIG_FILE" "$MAIN_CONFIG_FILE.backup"
    echo "Created backup of original NGINX config"
fi

# Check if PR location block already exists
if grep -q "location /pr-$PR_NUMBER" "$MAIN_CONFIG_FILE"; then
    echo "NGINX configuration for PR #$PR_NUMBER already exists"
    exit 0
fi

# Create temporary file with the new location block
TEMP_CONFIG=$(mktemp)

# Read the existing config and add the new location block before the main location /
awk -v pr_num="$PR_NUMBER" -v pr_root="$PR_ROOT" '
/^[[:space:]]*location \/ \{/ {
    # Add PR location block before the main location /
    print "    # PR Preview #" pr_num
    print "    location /pr-" pr_num " {"
    print "        alias " pr_root ";"
    print "        try_files $uri $uri/ /pr-" pr_num "/index.html;"
    print "        expires 1d;"
    print "        add_header Cache-Control \"public, immutable\";"
    print "    }"
    print ""
}
{ print }
' "$MAIN_CONFIG_FILE" > "$TEMP_CONFIG"

# Replace the original config with the updated one
cp "$TEMP_CONFIG" "$MAIN_CONFIG_FILE"
rm "$TEMP_CONFIG"

# Test NGINX configuration
if nginx -t; then
    # Reload NGINX
    systemctl reload nginx
    echo "✅ NGINX configured successfully for PR #$PR_NUMBER"
    echo "Preview available at: http://$(hostname -I | awk '{print $1}')/pr-$PR_NUMBER"
else
    echo "❌ NGINX configuration test failed. Restoring backup..."
    cp "$MAIN_CONFIG_FILE.backup" "$MAIN_CONFIG_FILE"
    exit 1
fi