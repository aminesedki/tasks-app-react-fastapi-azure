#!/usr/bin/env bash
set -Eeuo pipefail

export VITE_API_BASE_URL="https://your-api-url"

FRONTEND_DIR="$(pwd)"
DIST_DIR="$FRONTEND_DIR/dist"
CONFIG_FILE="$FRONTEND_DIR/staticwebapp.config.json"

SWA_NAME="webapps-dev-swa"

command -v npm >/dev/null 2>&1 || { echo "npm is required"; exit 1; }
command -v az >/dev/null 2>&1 || { echo "Azure CLI is required"; exit 1; }
command -v swa >/dev/null 2>&1 || { echo "SWA CLI is required"; exit 1; }

echo "Checking Azure login..."
az account show >/dev/null

echo "Building frontend..."
pushd "$FRONTEND_DIR" >/dev/null
npm ci
npm run build
popd >/dev/null

test -d "$DIST_DIR" || { echo "Build output folder not found: $DIST_DIR"; exit 1; }

if [[ -f "$CONFIG_FILE" ]]; then
  cp "$CONFIG_FILE" "$DIST_DIR/staticwebapp.config.json"
fi
echo "Fetching deployment token..."
DEPLOY_TOKEN="$(
  az staticwebapp secrets list \
    --name "$SWA_NAME" \
    --query "properties.apiKey" \
    -o tsv
)"

test -n "$DEPLOY_TOKEN" || { echo "Could not retrieve deployment token"; exit 1; }

echo "Deploying $DIST_DIR to $SWA_NAME ..."
swa deploy "$DIST_DIR" \
  --deployment-token "$DEPLOY_TOKEN"

echo "Deployment completed."