#!/bin/bash

# Helm umbrella chart installer script
# Usage: ./scripts/helm-install.sh <release-name> <namespace> <docker-tag> [path-prefix]

set -e

# Function to show usage
show_usage() {
    echo "Usage: $0 <release-name> <environment> <namespace> <docker-tag> [path-prefix]"
    echo ""
    echo "Arguments:"
    echo "  release-name  Name of the Helm release"
    echo "  environment    Environment for the deployment ('pr', 'develop', 'staging' or 'production')"
    echo "  namespace     Kubernetes namespace to deploy to"
    echo "  docker-tag    Docker image tag to use"
    echo "  path-prefix   Optional path prefix for ingress (default: /)"
    echo ""
    echo "Examples:"
    echo "  $0 my-services-dev develop develop latest /dev"
    echo ""
    exit 1
}

# Check if we have at least 4 arguments
if [ $# -lt 4 ]; then
    echo "Error: Missing required arguments"
    show_usage
fi

# Parse arguments
RELEASE_NAME=$1
ENVIRONMENT=$2
NAMESPACE=$3
DOCKER_TAG=$4
BASE_PATH=${5:-/}

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
echo "🚀 Installing Helm umbrella chart in ($ENVIRONMENT)..."
echo "   Release Name: $RELEASE_NAME"
echo "   Namespace:    $NAMESPACE"
echo "   Docker Tag:   $DOCKER_TAG"
echo "   Path Prefix:  $BASE_PATH"
echo ""

# Change to the chart directory
cd my-services-chart

# Run the helm install command
helm upgrade --install "$RELEASE_NAME" . \
    --create-namespace \
    --namespace "$NAMESPACE" \
    --set "marketing-webpage.image.tag=$DOCKER_TAG" \
    --set "marketing-webpage.ingress.path=$BASE_PATH"

echo "✅ Deployment completed successfully!"
echo ""
echo "To check the status:"
echo "  kubectl get pods -n $NAMESPACE"
echo "  helm status $RELEASE_NAME -n $NAMESPACE"