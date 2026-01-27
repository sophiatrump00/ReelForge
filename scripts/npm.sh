#!/bin/bash
# Wrapper to run npm via Docker
# Usage: ./scripts/npm.sh <command>
# Example: ./scripts/npm.sh install

# Ensure we are in the project root or adjust paths accordingly
# This script assumes it is run from the project root or that 'frontend' is a subdirectory 

if [ ! -d "frontend" ]; then
    echo "❌ Error: Could not find 'frontend' directory."
    echo "   Please run this script from the project root (where setup.sh is)."
    exit 1
fi

echo "🐳 Running 'npm $@' via Docker (node:20-alpine)..."

docker run --rm -it \
    -u "$(id -u):$(id -g)" \
    -v "$(pwd)/frontend:/app" \
    -w /app \
    node:20-alpine npm "$@"
