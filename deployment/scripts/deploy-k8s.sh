#!/bin/bash

# Usage: ./deploy-k8s.sh <environment> <image_tag> [pr_number]
set -e

ENVIRONMENT=${1:-dev}
IMAGE_TAG=${2:-latest}
PR_NUMBER=${3:-""}
IMAGE_NAME="ghcr.io/noahyschmid/my-stylist-frontend"

echo "Deploying my-stylist-frontend to $ENVIRONMENT environment with tag $IMAGE_TAG"

# Determine namespace based on environment and PR number
case $ENVIRONMENT in
  "dev"|"development")
    if [ -n "$PR_NUMBER" ]; then
      NAMESPACE="pr-$PR_NUMBER"
      echo "PR deployment detected - using namespace: $NAMESPACE"
    else
      NAMESPACE="development"
    fi
    REPLICAS=1
    NODE_ENV="development"
    PUBLIC_URL="/$IMAGE_TAG"
    FRONTEND_HOST="129.212.168.80"
    NEXT_PUBLIC_API_URL="https://dev-api.yourdomain.com"
    ;;
  "staging")
    NAMESPACE="staging"
    REPLICAS=1
    NODE_ENV="production"
    PUBLIC_URL="/"
    FRONTEND_HOST="129.212.168.80"
    NEXT_PUBLIC_API_URL="https://staging-api.yourdomain.com"
    ;;
  "prod"|"production")
    NAMESPACE="production"
    REPLICAS=1
    NODE_ENV="production"
    PUBLIC_URL="/"
    FRONTEND_HOST="129.212.168.80"
    NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
    ;;
  *)
    echo "Unknown environment: $ENVIRONMENT"
    echo "Supported environments: dev, staging, prod"
    exit 1
    ;;
esac

echo "Using namespace: $NAMESPACE"

# Debug: Print all variables before processing templates
echo "Environment variables:"
echo "  IMAGE_NAME=$IMAGE_NAME"
echo "  IMAGE_TAG=$IMAGE_TAG"
echo "  REPLICAS=$REPLICAS"
echo "  NODE_ENV=$NODE_ENV"
echo "  PUBLIC_URL=$PUBLIC_URL"
echo "  FRONTEND_HOST=$FRONTEND_HOST"
echo "  NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"
echo "  NAMESPACE=$NAMESPACE"

# Export all variables for envsubst
export IMAGE_NAME
export IMAGE_TAG
export REPLICAS
export NODE_ENV
export PUBLIC_URL
export FRONTEND_HOST
export NEXT_PUBLIC_API_URL
export NAMESPACE

# Create namespace if it doesn't exist
echo "Ensuring namespace '$NAMESPACE' exists..."
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# Create image pull secret in the namespace
echo "Creating/updating image pull secret in namespace '$NAMESPACE'..."
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username="${DOCKER_USERNAME:-$USER}" \
  --docker-password="${DOCKER_PASSWORD:-}" \
  --namespace="$NAMESPACE" \
  --dry-run=client -o yaml | kubectl apply -f -

# Create temporary directory for processed templates
TEMP_DIR=$(mktemp -d)
TEMPLATE_DIR="deployment/kube/templates"
OUTPUT_DIR="$TEMP_DIR/manifests"

mkdir -p "$OUTPUT_DIR"

echo "Processing templates..."

# Process each template file
for template in $TEMPLATE_DIR/*.template; do
  if [ -f "$template" ]; then
    filename=$(basename "$template" .template)
    output_file="$OUTPUT_DIR/$filename"
    
    echo "Processing $template -> $output_file"
    
    # Replace variables in template
    envsubst '
      $IMAGE_NAME
      $IMAGE_TAG
      $REPLICAS
      $NODE_ENV
      $PUBLIC_URL
      $FRONTEND_HOST
      $NEXT_PUBLIC_API_URL
      $NAMESPACE
    ' < "$template" > "$output_file"
  fi
done

echo "Applying Kubernetes manifests to namespace '$NAMESPACE'..."

# Apply the manifests in order to the specific namespace
kubectl apply -f "$OUTPUT_DIR/my-stylist-frontend-service.yaml" --namespace="$NAMESPACE"
kubectl apply -f "$OUTPUT_DIR/my-stylist-frontend-deployment.yaml" --namespace="$NAMESPACE"
kubectl apply -f "$OUTPUT_DIR/my-stylist-frontend-ingress.yaml" --namespace="$NAMESPACE"

echo "Waiting for deployment to be ready..."
kubectl rollout status deployment/my-stylist-frontend --namespace="$NAMESPACE" --timeout=300s

echo "Getting service information..."
kubectl get service my-stylist-frontend --namespace="$NAMESPACE"
kubectl get ingress my-stylist-frontend-ingress --namespace="$NAMESPACE"

echo "Deployment completed successfully!"

# Cleanup
rm -rf "$TEMP_DIR"

# Export variables for GitHub Actions output
if [ -n "$GITHUB_ACTIONS" ]; then
  echo "frontend-url=http://$FRONTEND_HOST" >> $GITHUB_OUTPUT
  echo "environment=$ENVIRONMENT" >> $GITHUB_OUTPUT
  echo "image-tag=$IMAGE_TAG" >> $GITHUB_OUTPUT
  echo "namespace=$NAMESPACE" >> $GITHUB_OUTPUT
fi
