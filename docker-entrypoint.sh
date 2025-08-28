#!/bin/sh

# Docker entrypoint script for React app with dynamic routing support

set -e

# If PUBLIC_URL is set and not root, we need to rebuild with the correct public URL
if [ -n "$PUBLIC_URL" ] && [ "$PUBLIC_URL" != "/" ] && [ "$PUBLIC_URL" != "" ]; then
    echo "PUBLIC_URL is set to: $PUBLIC_URL"
    echo "Note: For PR previews, the React app should be built with the correct PUBLIC_URL during the Docker build."
    echo "This container is configured to serve from: $PUBLIC_URL"
fi

# Start nginx
exec "$@"