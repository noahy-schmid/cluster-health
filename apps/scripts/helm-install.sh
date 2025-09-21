#!/bin/bash

# Helm umbrella chart installer script
# Usage: ./scripts/helm-install.sh <release-name> <namespace> <docker-tag> [path-prefix]

set -e

# Function to show usage
show_usage() {
    echo "Usage: $0 <release-name> <namespace> <docker-tag> [path-prefix]"
    echo ""
    echo "Arguments:"
    echo "  release-name  Name of the Helm release"
    echo "  namespace     Kubernetes namespace to deploy to"
    echo "  docker-tag    Docker image tag to use"
    echo "  path-prefix   Optional path prefix for ingress (default: /)"
    echo ""
    echo "Examples:"
    echo "  $0 my-services-dev dev latest /dev"
    echo "  $0 my-services-prod production v1.0.0"
    echo ""
    exit 1
}

# Check if we have at least 3 arguments
if [ $# -lt 3 ]; then
    echo "Error: Missing required arguments"
    show_usage
fi

# Parse arguments
RELEASE_NAME=$1
NAMESPACE=$2
DOCKER_TAG=$3
PATH_PREFIX=${4:-/}

# Validate arguments
if [ -z "$RELEASE_NAME" ]; then
    echo "Error: Release name cannot be empty"
    exit 1
fi

if [ -z "$NAMESPACE" ]; then
    echo "Error: Namespace cannot be empty"
    exit 1
fi

if [ -z "$DOCKER_TAG" ]; then
    echo "Error: Docker tag cannot be empty"
    exit 1
fi

# Show what we're about to do
echo "🚀 Installing Helm umbrella chart..."
echo "   Release Name: $RELEASE_NAME"
echo "   Namespace:    $NAMESPACE"
echo "   Docker Tag:   $DOCKER_TAG"
echo "   Path Prefix:  $PATH_PREFIX"
echo ""

# Change to the chart directory
cd my-services-chart

# Run the helm install command
helm install "$RELEASE_NAME" . \
    --create-namespace \
    --namespace "$NAMESPACE" \
    --set "my-stylist-frontend.image.tag=$DOCKER_TAG" \
    --set "my-stylist-frontend.ingress.path=$PATH_PREFIX"

echo "✅ Deployment completed successfully!"
echo ""
echo "To check the status:"
echo "  kubectl get pods -n $NAMESPACE"
echo "  helm status $RELEASE_NAME -n $NAMESPACE"