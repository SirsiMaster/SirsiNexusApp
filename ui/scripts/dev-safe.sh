#!/bin/bash

# Script to ensure only one Next.js dev server is running at a time
# Usage: ./scripts/dev-safe.sh

echo "🔍 Checking for existing Next.js dev servers..."

# Find all Next.js server processes
NEXT_PIDS=$(ps aux | grep "next-server" | grep -v grep | awk '{print $2}')

if [ ! -z "$NEXT_PIDS" ]; then
    echo "⚠️  Found existing Next.js dev servers. Terminating them..."
    echo "$NEXT_PIDS" | xargs kill 2>/dev/null
    sleep 2
    echo "✅ Terminated existing dev servers"
else
    echo "✅ No existing dev servers found"
fi

# Check if port 3000 is in use by any process
PORT_3000_PID=$(lsof -ti:3000)
if [ ! -z "$PORT_3000_PID" ]; then
    echo "⚠️  Port 3000 is in use by process $PORT_3000_PID. Terminating..."
    kill $PORT_3000_PID 2>/dev/null
    sleep 1
fi

echo "🚀 Starting fresh Next.js dev server..."
npm run dev
