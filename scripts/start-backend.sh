#!/bin/bash

set -e

echo "🚀 Starting SirsiNexus Backend Services"

# Set environment variables
export DATABASE_URL="postgresql://sirsi:sirsi@localhost:26257/sirsi_nexus?sslmode=require"
export REDIS_URL="redis://localhost:6379"
export HTTP_PORT="8080"
export CREDENTIAL_ENCRYPTION_KEY="this-is-a-32-byte-key-for-dev!"

# Change to core engine directory
cd "$(dirname "$0")/../core-engine/crates/core"

# Check if dependencies are installed
echo "📦 Checking Rust dependencies..."
if ! cargo check --quiet; then
    echo "🔄 Installing Rust dependencies..."
    cargo build
fi

# Start the backend server
echo "🌟 Starting backend server on http://localhost:8080"
echo "🔧 Environment: Development"
echo "🗄️  Database: $DATABASE_URL"
echo "📊 Redis: $REDIS_URL"
echo "🔐 Credential encryption: ENABLED"
echo ""

# Start with RUST_LOG for debugging
RUST_LOG=debug cargo run
