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
PR_ROOT="/var/www/pr-$PR_NUMBER"

echo "Configuring NGINX for PR #$PR_NUMBER..."

# Check if NGINX is installed
if ! command -v nginx &> /dev/null; then
    echo "❌ Error: NGINX is not installed on this system"
    echo "Please install NGINX first using your package manager:"
    echo "  Ubuntu/Debian: sudo apt-get install nginx"
    echo "  CentOS/RHEL:   sudo yum install nginx"
    exit 1
fi

# Check if NGINX service is running
if ! systemctl is-active --quiet nginx; then
    echo "Starting NGINX service..."
    systemctl start nginx
fi

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

# Function to create a basic NGINX configuration
create_basic_config() {
    local config_file="$1"
    local config_dir=$(dirname "$config_file")
    
    # Create directory if it doesn't exist
    mkdir -p "$config_dir"
    
    cat > "$config_file" << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html index.htm index.nginx-debian.html;

    server_name _;

    # Main location block
    location / {
        try_files $uri $uri/ =404;
    }
}
EOF
    
    # Enable the site if using sites-available structure
    if [[ "$config_file" == *"sites-available"* ]]; then
        local sites_enabled="/etc/nginx/sites-enabled/$(basename "$config_file")"
        if [ ! -L "$sites_enabled" ]; then
            ln -sf "$config_file" "$sites_enabled"
        fi
    fi
    
    echo "Created basic NGINX configuration at $config_file"
}

# Detect or create NGINX configuration
MAIN_CONFIG_FILE=$(detect_nginx_config)

if [ -z "$MAIN_CONFIG_FILE" ]; then
    echo "No existing NGINX configuration found. Creating basic configuration..."
    # Try to create in the most common location
    if [ -d "/etc/nginx/sites-available" ]; then
        MAIN_CONFIG_FILE="/etc/nginx/sites-available/default"
    elif [ -d "/etc/nginx/conf.d" ]; then
        MAIN_CONFIG_FILE="/etc/nginx/conf.d/default.conf"
    else
        # Create conf.d directory as fallback
        mkdir -p "/etc/nginx/conf.d"
        MAIN_CONFIG_FILE="/etc/nginx/conf.d/default.conf"
    fi
    create_basic_config "$MAIN_CONFIG_FILE"
fi

echo "Using NGINX configuration file: $MAIN_CONFIG_FILE"

# Backup original config if backup doesn't exist
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