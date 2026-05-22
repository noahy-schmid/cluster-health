#!/bin/sh
set -e

echo "Pushing database schema..."
npx drizzle-kit push
echo "Schema push complete."

echo "Starting Next.js server..."
exec node server.js
