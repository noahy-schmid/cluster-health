#!/bin/bash

# Simple Docker-based deployment script for PR preview deployments
# Usage: ./deploy-docker-pr.sh <PR_NUMBER> <DOCKER_IMAGE_TAG>

set -e

PR_NUMBER=$1
DOCKER_IMAGE_TAG=$2

if [ -z "$PR_NUMBER" ] || [ -z "$DOCKER_IMAGE_TAG" ]; then
    echo "Error: PR number and Docker image tag are required"
    echo "Usage: $0 <PR_NUMBER> <DOCKER_IMAGE_TAG>"
    exit 1
fi

# Configuration
BASE_PORT=8000
PR_PORT=$((BASE_PORT + PR_NUMBER))
COMPOSE_FILE="~/docker-compose.pr-$PR_NUMBER.yml"
CONTAINER_NAME="cluster-health-pr-$PR_NUMBER"

echo "🚀 Deploying Docker-based PR #$PR_NUMBER preview..."
echo "📦 Docker Image: $DOCKER_IMAGE_TAG"
echo "🔌 Port: $PR_PORT"

# Verify Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed"
    exit 1
fi

# Stop and remove existing container if it exists
if docker ps -a --format "{{.Names}}" | grep -q "^$CONTAINER_NAME$"; then
    echo "🛑 Stopping existing PR #$PR_NUMBER container..."
    docker stop "$CONTAINER_NAME" || true
    docker rm "$CONTAINER_NAME" || true
fi

# Create docker-compose file from template
echo "📝 Creating docker-compose file..."
sed -e "s|__DOCKER_IMAGE__|$DOCKER_IMAGE_TAG|g" \
    -e "s|__PR_NUMBER__|$PR_NUMBER|g" \
    -e "s|__PORT__|$PR_PORT|g" \
    ~/docker-compose.pr-template.yml > "$COMPOSE_FILE"

# Start the container
echo "🐳 Starting PR #$PR_NUMBER container..."
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for container to be ready
echo "⏳ Waiting for container to be ready..."
sleep 10

# Verify container is running
if docker ps --format "{{.Names}}" | grep -q "^$CONTAINER_NAME$"; then
    echo "✅ Container $CONTAINER_NAME is running on port $PR_PORT"
    
    # Update nginx configuration to proxy to this port
    ~/configure-nginx-pr.sh "$PR_NUMBER" "$PR_PORT"
    
    echo "🎉 PR #$PR_NUMBER deployed successfully!"
    echo "🌐 Available at: http://$(hostname -I | awk '{print $1}'):$PR_PORT"
    echo "🌐 Or via nginx proxy at: http://$(hostname -I | awk '{print $1}')/pr-$PR_NUMBER"
else
    echo "❌ Failed to start container $CONTAINER_NAME"
    docker-compose -f "$COMPOSE_FILE" logs
    exit 1
fi