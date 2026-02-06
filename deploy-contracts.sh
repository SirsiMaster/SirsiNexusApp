#!/bin/bash

# Deploy Contracts Script
# This script builds the finalwishes-contracts React app and deploys it to Firebase Hosting

set -e  # Exit on error

echo "=== Sirsi Nexus App - Contract Deployment Script ==="
echo ""

cd "$(dirname "$0")"

# Step 1: Build the React app
echo "Step 1: Building finalwishes-contracts..."
cd packages/finalwishes-contracts
npm run build
echo "✓ Build complete"
echo ""

# Step 2: Sync to sirsi-opensign public folder
echo "Step 2: Syncing build artifacts to sirsi-opensign..."
cd ../sirsi-opensign

# Clear old assets
rm -rf public/assets/index-*.js public/assets/index-*.css

# Copy new assets from dist
cp -R ../finalwishes-contracts/dist/assets/index-*.js public/assets/
cp -R ../finalwishes-contracts/dist/assets/index-*.css public/assets/

# Sync public folder assets (security-init.js, etc)
cp -R ../finalwishes-contracts/public/assets/js/* public/assets/js/

# Copy the SPA index.html to partnership route
mkdir -p public/partnership/finalwishes
cp ../finalwishes-contracts/dist/index.html public/partnership/finalwishes/index.html

echo "✓ Sync complete"
echo ""

# Step 3: Deploy to Firebase
echo "Step 3: Deploying to Firebase Hosting..."
firebase deploy --only hosting --project sirsi-nexus-live

echo ""
echo "=== Deployment Complete ==="
echo "Your contract app should now be live at:"
echo "https://sirsi-sign.web.app/partnership/finalwishes"
