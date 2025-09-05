#!/bin/bash

# Start NGINX container with Docker network for PR deployments
set -e

echo "Setting up Docker network and starting NGINX container..."

# Create Docker network for PR deployments
docker network create pr-network || echo 'Network already exists'

# Stop and remove existing nginx container if it exists
docker stop nginx-proxy || true
docker rm nginx-proxy || true

# Start NGINX container
docker run -d \
  --name nginx-proxy \
  --network pr-network \
  -p 80:80 \
  -p 443:443 \
  -v /etc/nginx-docker/nginx.conf:/etc/nginx/nginx.conf:ro \
  -v /etc/nginx-docker/conf.d:/etc/nginx/conf.d:ro \
  -v /etc/nginx-docker/ssl:/etc/nginx/ssl:ro \
  -v /var/www:/var/www:ro \
  --restart unless-stopped \
  nginx:alpine

echo 'NGINX container started successfully'
