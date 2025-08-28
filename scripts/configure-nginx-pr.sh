#!/bin/bash

# Simple nginx configuration script for PR previews
# Usage: ./configure-nginx-pr.sh <PR_NUMBER> <PORT>

set -e

PR_NUMBER=$1
PORT=$2

if [ -z "$PR_NUMBER" ] || [ -z "$PORT" ]; then
    echo "Error: PR number and port are required"
    echo "Usage: $0 <PR_NUMBER> <PORT>"
    exit 1
fi

NGINX_CONF="/etc/nginx/sites-available/default"
NGINX_BACKUP="/etc/nginx/sites-available/default.backup"

echo "🔧 Configuring nginx for PR #$PR_NUMBER on port $PORT..."

# Create backup of nginx config if it doesn't exist
if [ ! -f "$NGINX_BACKUP" ]; then
    echo "📁 Creating backup of nginx configuration..."
    sudo cp "$NGINX_CONF" "$NGINX_BACKUP"
fi

# Check if PR location already exists
if sudo grep -q "location /pr-$PR_NUMBER" "$NGINX_CONF"; then
    echo "✅ PR #$PR_NUMBER location already exists in nginx config"
    return 0
fi

# Add PR location block to nginx config
echo "📝 Adding PR #$PR_NUMBER location to nginx config..."
sudo tee -a "$NGINX_CONF" > /dev/null << EOF

    # PR Preview #$PR_NUMBER
    location /pr-$PR_NUMBER {
        proxy_pass http://127.0.0.1:$PORT/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_redirect off;
    }
EOF

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx configuration is valid"
    
    # Reload nginx
    echo "🔄 Reloading nginx..."
    sudo systemctl reload nginx
    echo "✅ Nginx reloaded successfully"
else
    echo "❌ Nginx configuration test failed"
    echo "🔙 Restoring backup configuration..."
    sudo cp "$NGINX_BACKUP" "$NGINX_CONF"
    exit 1
fi

echo "🎉 PR #$PR_NUMBER nginx configuration completed!"