#!/bin/bash

set -e

cd "$(dirname "$0")"

# Load environment variables from .env.buildone
if [ -f .env.buildone ]; then
    export $(grep -v '^#' .env.buildone | xargs)
else
    echo "No env file found. Exiting..."
    exit 0
fi

echo "INFO - You can pass the 'all' argument to build and push all the applications"

cd ..

export DOCKER_CLI_EXPERIMENTAL=enabled
#docker buildx create --use --name multi-builder
#docker buildx inspect --bootstrap

docker login "$REGISTRY_URL" -u "$DOCKER_USERNAME" -p "$DOCKER_PASSWORD"

docker buildx build --platform linux/amd64,linux/arm64 -t "$REGISTRY_URL"/pagatu-fe:latest --push .
kubectl rollout restart deploy pagatu-fe -n pagatu

echo "Successfully built: fe"
