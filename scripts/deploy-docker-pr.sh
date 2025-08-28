#!/bin/bash

# Docker-based deployment script for PR preview deployments
# This script should be placed at ~/deploy-docker-pr.sh on the DigitalOcean droplet
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
NGINX_PROXY_TEMPLATE="$HOME/nginx-proxy.conf"
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

# Create docker-compose file for this PR using the template
TEMPLATE_FILE="$HOME/docker-compose.pr-template.yml"
echo "Creating docker-compose file at: $COMPOSE_FILE"
echo "Using template file: $TEMPLATE_FILE"
echo "Current working directory: $(pwd)"
echo "Home directory: $HOME"

# Check if template file exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "❌ Error: Template file $TEMPLATE_FILE not found"
    echo "Available files in home directory:"
    ls -la ~/
    exit 1
fi

# Ensure we can write to the home directory
if [ ! -w "$HOME" ]; then
    echo "❌ Error: Cannot write to home directory $HOME"
    exit 1
fi

# Create docker-compose file from template, replacing placeholders
# Replace __PR_NUMBER__ with actual PR number and modify for deployment (use image instead of build)
python3 -c "
import sys
import os
template_file = os.path.expanduser('~/docker-compose.pr-template.yml')
output_file = os.path.expanduser('~/docker-compose.pr-$PR_NUMBER.yml')
pr_number = '$PR_NUMBER'
docker_image = '$DOCKER_IMAGE_TAG'

with open(template_file, 'r') as f:
    content = f.read()

# Replace placeholders
content = content.replace('__PR_NUMBER__', pr_number)

# Replace build section with image
lines = content.split('\n')
in_build_section = False
new_lines = []
build_indent = ''

for line in lines:
    if '    build:' in line:
        new_lines.append(f'    image: {docker_image}')
        in_build_section = True
        # Get the indentation level
        build_indent = len(line) - len(line.lstrip())
        continue
    elif in_build_section:
        # Check if we're still in the build section
        if line.strip() == '':
            continue  # Skip empty lines
        current_indent = len(line) - len(line.lstrip())
        if current_indent > build_indent:
            continue  # Skip lines that are part of the build section
        else:
            in_build_section = False
    
    if not in_build_section:
        new_lines.append(line)

with open(output_file, 'w') as f:
    f.write('\n'.join(new_lines))
"

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
    
    # Check if nginx-proxy template exists
    if [ ! -f "$NGINX_PROXY_TEMPLATE" ]; then
        echo "❌ Error: NGINX proxy template not found at $NGINX_PROXY_TEMPLATE"
        echo "Available files in home directory:"
        ls -la ~/
        exit 1
    fi
    
    # Backup original config if backup doesn't exist
    if [ ! -f "$NGINX_PROXY_CONFIG.backup" ]; then
        sudo cp "$NGINX_PROXY_CONFIG" "$NGINX_PROXY_CONFIG.backup"
        echo "Created backup of original NGINX config"
    fi
    
    # Copy the nginx-proxy template and add the PR-specific location
    sudo cp "$NGINX_PROXY_TEMPLATE" "$NGINX_PROXY_CONFIG"
    echo "Copied nginx-proxy template to $NGINX_PROXY_CONFIG"
    
    configure_nginx_proxy "$NGINX_PROXY_CONFIG" "$PR_NUMBER" "$CONTAINER_NAME"
    
    # Test NGINX configuration
    if sudo nginx -t; then
        # Reload NGINX
        sudo systemctl reload nginx
        echo "✅ NGINX configuration updated for PR #$PR_NUMBER"
    else
        echo "❌ NGINX configuration test failed"
        # Restore backup on failure
        sudo cp "$NGINX_PROXY_CONFIG.backup" "$NGINX_PROXY_CONFIG"
        exit 1
    fi
else
    echo "⚠️  NGINX not found. Please install NGINX to enable reverse proxy."
fi

echo "🚀 PR #$PR_NUMBER deployed successfully!"
echo "Container: $CONTAINER_NAME"
echo "Compose file: $COMPOSE_FILE"