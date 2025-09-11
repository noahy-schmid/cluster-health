#!/bin/bash

# Usage: ./deploy-k8s.sh <environment> <image_tag>
set -e

ENVIRONMENT=${1:-dev}
IMAGE_TAG=${2:-latest}
IMAGE_NAME="ghcr.io/noahyschmid/my-stylist-frontend"

echo "Deploying my-stylist-frontend to $ENVIRONMENT environment with tag $IMAGE_TAG"

# Set environment-specific variables
case $ENVIRONMENT in
  "dev"|"development")
    REPLICAS=1
    NODE_ENV="development"
    PUBLIC_URL="/$IMAGE_TAG"
    FRONTEND_HOST="129.212.168.80"
    NEXT_PUBLIC_API_URL="https://dev-api.yourdomain.com"
    ;;
  "staging")
    REPLICAS=1
    NODE_ENV="production"
    PUBLIC_URL="/"
    FRONTEND_HOST="129.212.168.80"
    NEXT_PUBLIC_API_URL="https://staging-api.yourdomain.com"
    ;;
  "prod"|"production")
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
    ' < "$template" > "$output_file"
  fi
done

echo "Applying Kubernetes manifests..."

# Apply the manifests in order
kubectl apply -f "$OUTPUT_DIR/my-stylist-frontend-service.yaml"
kubectl apply -f "$OUTPUT_DIR/my-stylist-frontend-deployment.yaml"
kubectl apply -f "$OUTPUT_DIR/my-stylist-frontend-ingress.yaml"

echo "Waiting for deployment to be ready..."
kubectl rollout status deployment/my-stylist-frontend --timeout=300s

echo "Getting service information..."
kubectl get service my-stylist-frontend
kubectl get ingress my-stylist-frontend-ingress

echo "Deployment completed successfully!"

# Cleanup
rm -rf "$TEMP_DIR"

# Export variables for GitHub Actions output
if [ -n "$GITHUB_ACTIONS" ]; then
  echo "frontend-url=http://$FRONTEND_HOST" >> $GITHUB_OUTPUT
  echo "environment=$ENVIRONMENT" >> $GITHUB_OUTPUT
  echo "image-tag=$IMAGE_TAG" >> $GITHUB_OUTPUT
fi
