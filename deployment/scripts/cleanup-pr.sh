#!/bin/bash

# Cleanup script for PR Kubernetes deployments
# Usage: ./cleanup-pr.sh <PR_NUMBER>

set -e

PR_NUMBER=$1

if [ -z "$PR_NUMBER" ]; then
    echo "Error: PR number is required"
    echo "Usage: $0 <PR_NUMBER>"
    echo "Example: $0 123"
    exit 1
fi

# Configuration variables
NAMESPACE="pr-$PR_NUMBER"

echo "Cleaning up Kubernetes PR #$PR_NUMBER deployment..."
echo "This will delete namespace: $NAMESPACE"

# Confirm deletion (skip confirmation in CI)
if [ -z "$CI" ] && [ -z "$GITHUB_ACTIONS" ]; then
  read -p "Are you sure you want to delete namespace '$NAMESPACE' and all its resources? (y/N): " -r
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo "Cleanup cancelled."
      exit 0
  fi
fi

# Check if namespace exists
if ! kubectl get namespace "$NAMESPACE" >/dev/null 2>&1; then
  echo "Namespace '$NAMESPACE' does not exist. Nothing to clean up."
  exit 0
fi

echo "Deleting namespace '$NAMESPACE' and all its resources..."

# Delete the namespace (this will delete all resources in it)
kubectl delete namespace "$NAMESPACE" --timeout=300s

echo "✅ Successfully cleaned up Kubernetes PR deployment for PR #$PR_NUMBER"
echo "Namespace '$NAMESPACE' and all its resources have been deleted."

# Function to detect NGINX configuration file
detect_nginx_config() {
    # Check common NGINX configuration file locations
    if [ -f "/etc/nginx/sites-available/default" ]; then
        echo "/etc/nginx/sites-available/default"
    elif [ -f "/etc/nginx/conf.d/default.conf" ]; then
        echo "/etc/nginx/conf.d/default.conf"
    elif [ -f "/etc/nginx/default.conf" ]; then
        echo "/etc/nginx/default.conf"
    elif [ -f "/etc/nginx/nginx.conf" ]; then
        # Check if nginx.conf has a server block we can use
        if grep -q "server {" "/etc/nginx/nginx.conf"; then
            echo "/etc/nginx/nginx.conf"
        else
            echo ""
        fi
    else
        echo ""
    fi
}

# Remove PR directory
if [ -d "$PR_ROOT" ]; then
    rm -rf "$PR_ROOT"
    echo "✅ Removed PR directory: $PR_ROOT"
else
    echo "ℹ️  PR directory does not exist: $PR_ROOT"
fi

# Detect NGINX configuration file
MAIN_CONFIG_FILE=$(detect_nginx_config)

if [ -z "$MAIN_CONFIG_FILE" ]; then
    echo "ℹ️  No NGINX configuration file found"
    echo "🧹 Cleanup completed for PR #$PR_NUMBER"
    exit 0
fi

echo "Using NGINX configuration file: $MAIN_CONFIG_FILE"

# Remove NGINX configuration for this PR
if [ -f "$MAIN_CONFIG_FILE" ]; then
    # Create temporary file without the PR location block
    TEMP_CONFIG=$(mktemp)
    
    # Remove the PR location block and its comment
    awk -v pr_num="$PR_NUMBER" '
    /^[[:space:]]*# PR Preview #/ && $4 == pr_num {
        # Skip the comment line
        skip = 1
        next
    }
    /^[[:space:]]*location \/pr-/ && index($0, "/pr-" pr_num " ") {
        # Skip the location block
        skip = 1
        next
    }
    /^[[:space:]]*\}/ && skip {
        # Skip the closing brace of the location block
        skip = 0
        next
    }
    /^[[:space:]]*$/ && skip {
        # Skip empty lines within the block
        next
    }
    !skip { print }
    ' "$MAIN_CONFIG_FILE" > "$TEMP_CONFIG"
    
    # Replace the original config with the cleaned one
    cp "$TEMP_CONFIG" "$MAIN_CONFIG_FILE"
    rm "$TEMP_CONFIG"
    
    # Test NGINX configuration
    if nginx -t; then
        # Reload NGINX
        systemctl reload nginx
        echo "✅ NGINX configuration cleaned up for PR #$PR_NUMBER"
    else
        echo "❌ NGINX configuration test failed after cleanup"
        echo "Please check NGINX configuration manually"
        exit 1
    fi
else
    echo "ℹ️  NGINX config file not found: $MAIN_CONFIG_FILE"
fi

echo "🧹 Cleanup completed for PR #$PR_NUMBER"