#!/bin/bash

# Docker build or push script
# Usage: ./scripts/docker-build-push.sh <action> <docker-tag> [path-prefix]

set -e

# Function to show usage
show_usage() {
    echo "Usage: $0 <action> <docker-tag> [path-prefix]"
    echo ""
    echo "Arguments:"
    echo "  action         Action to perform: 'build' or 'push'"
    echo "  image-name    Docker image name (leading ghcr.io/noahy-schmid/ already included)"
    echo "  docker-tag     Docker image tag (required)"
    echo "  environment    Environment for the build ('pr', 'develop', 'staging' or 'production')"
    echo "  path-prefix    Path prefix for Next.js basePath (default: /, only used for build)"
    echo ""
    echo "Examples:"
    echo "  $0 build latest              # Build with latest tag and root path"
    echo "  $0 build dev /dev            # Build with dev tag and /dev path"
    echo "  $0 push latest               # Push latest tag (assumes already built)"
    echo "  $0 push dev                  # Push dev tag"
    echo ""
    exit 1
}

# Check if we have at least 4 arguments
if [ $# -lt 4 ]; then
    echo "Error: Missing required arguments"
    show_usage
fi

# Parse arguments
ACTION=$1
IMAGE_NAME=$2
DOCKER_TAG=$3
ENVIRONMENT=$4
PATH_PREFIX=${5:-/}

# Validate action
if [ "$ACTION" != "build" ] && [ "$ACTION" != "push" ]; then
    echo "Error: Action must be 'build' or 'push'"
    show_usage
fi

# Validate arguments
if [ -z "$DOCKER_TAG" ]; then
    echo "Error: Docker tag cannot be empty"
    exit 1
fi

# Define image name
IMAGE_NAME_WITH_REPO="ghcr.io/noahy-schmid/$IMAGE_NAME"
FULL_IMAGE_NAME="${IMAGE_NAME_WITH_REPO}:${DOCKER_TAG}"

# Show what we're about to do
echo "🐳 Docker ${ACTION} Script"
echo "=========================="
echo "Action:        $ACTION"
echo "Image Name:    $FULL_IMAGE_NAME"
echo "Environment:   $ENVIRONMENT"
if [ "$ACTION" = "build" ]; then
    echo "Path Prefix:   $PATH_PREFIX"
fi
echo ""

echo "📁 Working directory: $(pwd)"
echo ""

if [ "$ACTION" = "build" ]; then
    # Build the Docker image
    echo "🔨 Building Docker image..."
    docker build \
        --platform linux/amd64 \
        --build-arg PATH_PREFIX="$PATH_PREFIX" \
        -t "$FULL_IMAGE_NAME" \
        -f Dockerfile \
        ./../..

    echo "✅ Docker build completed successfully!"
    echo ""
    echo "🔍 Image details:"
    docker images "$IMAGE_NAME" --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

elif [ "$ACTION" = "push" ]; then
    # Push the Docker image
    echo "📤 Pushing Docker image to registry..."
    
    # Check if image exists locally
    if ! docker image inspect "$FULL_IMAGE_NAME" >/dev/null 2>&1; then
        echo "❌ Error: Image $FULL_IMAGE_NAME not found locally"
        echo "   Please build the image first with:"
        echo "   $0 build $DOCKER_TAG [path-prefix]"
        exit 1
    fi
    
    docker push "$FULL_IMAGE_NAME"
    echo "✅ Docker push completed successfully!"
    echo ""
    echo "🎉 Image available at: $FULL_IMAGE_NAME"
fi