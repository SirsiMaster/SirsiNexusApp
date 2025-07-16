#!/bin/bash

# Script to commit changes and automatically restart dev server
# Usage: ./scripts/commit-and-dev.sh "commit message"

if [ -z "$1" ]; then
    echo "❌ Error: Please provide a commit message"
    echo "Usage: ./scripts/commit-and-dev.sh \"your commit message\""
    exit 1
fi

echo "📝 Adding all changes..."
git add .

echo "💾 Committing with message: $1"
git commit -m "$1"

echo "🚀 Pushing to origin..."
git push origin main

echo "🔄 Restarting dev server safely..."
./scripts/dev-safe.sh
