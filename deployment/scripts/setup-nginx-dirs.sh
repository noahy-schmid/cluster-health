#!/bin/bash

# Setup NGINX directory structure for PR deployments
set -e

echo "Setting up NGINX directory structure..."

# Create nginx configuration directories
sudo mkdir -p /etc/nginx-docker/conf.d
sudo mkdir -p /etc/nginx-docker/ssl
sudo mkdir -p /var/www

# Set proper permissions
sudo chown -R $USER:$USER /var/www

echo "NGINX directory structure created successfully"
