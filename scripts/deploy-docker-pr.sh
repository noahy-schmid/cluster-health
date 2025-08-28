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
COMPOSE_FILE="~/docker-compose.pr-$PR_NUMBER.yml"
NGINX_DYNAMIC_CONFIG="~/nginx-dynamic.conf"
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
TEMPLATE_FILE="~/docker-compose.pr-template.yml"
echo "Creating docker-compose file at: $COMPOSE_FILE"
echo "Using template file: $TEMPLATE_FILE"

# Check if template file exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "❌ Error: Template file $TEMPLATE_FILE not found"
    echo "Available files in home directory:"
    ls -la ~/
    exit 1
fi

# Create docker-compose file from template, replacing placeholders
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

# Update nginx configuration for this PR
configure_nginx_for_pr() {
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
    
    # Add PR location block before the comment
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

echo "Configuring NGINX for PR #$PR_NUMBER..."

# Check if nginx dynamic config exists
if [ ! -f "$NGINX_DYNAMIC_CONFIG" ]; then
    echo "❌ Error: NGINX dynamic config not found at $NGINX_DYNAMIC_CONFIG"
    echo "Available files in home directory:"
    ls -la ~/
    exit 1
fi

# Update nginx configuration with new PR location
configure_nginx_for_pr "$NGINX_DYNAMIC_CONFIG" "$PR_NUMBER" "$CONTAINER_NAME"

# Stop and remove existing PR container if it exists
if docker ps -a --format "{{.Names}}" | grep -q "^$CONTAINER_NAME$"; then
    echo "Stopping existing PR container..."
    docker-compose -f "$COMPOSE_FILE" down || true
fi

# Stop existing nginx proxy if it exists (to restart with new config)
if docker ps --format "{{.Names}}" | grep -q "^nginx-proxy$"; then
    echo "Stopping existing nginx proxy to reload configuration..."
    docker stop nginx-proxy || true
    docker rm nginx-proxy || true
fi

# Start the new container and nginx proxy
echo "Starting PR #$PR_NUMBER container and nginx proxy..."
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for containers to be ready
echo "Waiting for containers to be ready..."
sleep 15

# Verify containers are running
if docker ps --format "{{.Names}}" | grep -q "^$CONTAINER_NAME$"; then
    echo "✅ Container $CONTAINER_NAME is running"
else
    echo "❌ Failed to start container $CONTAINER_NAME"
    docker-compose -f "$COMPOSE_FILE" logs
    exit 1
fi

if docker ps --format "{{.Names}}" | grep -q "^nginx-proxy$"; then
    echo "✅ Nginx proxy is running"
else
    echo "❌ Failed to start nginx proxy"
    docker-compose -f "$COMPOSE_FILE" logs nginx-proxy
    exit 1
fi

echo "🚀 PR #$PR_NUMBER deployed successfully!"
echo "Container: $CONTAINER_NAME"
echo "Compose file: $COMPOSE_FILE"
echo "Nginx proxy: nginx-proxy"
echo "URL: http://your-domain/pr-$PR_NUMBER"