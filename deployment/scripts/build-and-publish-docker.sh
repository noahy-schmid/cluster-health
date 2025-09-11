#!/bin/bash

# Usage: ./build-and-publish-docker.sh <tag>
set -e

IMAGE_NAME="ghcr.io/noahyschmid/my-stylist-frontend"

if [ -z "$1" ]; then
  echo "Usage: $0 <tag>"
  exit 1
fi

TAG="$1"

echo "Building Docker image: ${IMAGE_NAME}:${TAG}"

# Change to my-stylist-frontend directory for build context
cd my-stylist-frontend

# Build the Docker image
docker build -t ${IMAGE_NAME}:${TAG} .
echo "Pushing Docker image: ${IMAGE_NAME}:${TAG}"
docker push ${IMAGE_NAME}:${TAG}

echo "Successfully built and pushed ${IMAGE_NAME}:${TAG}"