#!/bin/bash

set -e

echo "🚀 Starting SirsiNexus Platform"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a service is running
check_service() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=1

    echo -e "${BLUE}Checking $service_name on port $port...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:$port" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is running on port $port${NC}"
            return 0
        fi
        echo -n "."
        sleep 1
        ((attempt++))
    done
    
    echo -e "${RED}❌ $service_name failed to start on port $port${NC}"
    return 1
}

# Function to install dependencies
install_deps() {
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    
    # Install frontend dependencies
    echo "Installing frontend dependencies..."
    cd "$PROJECT_ROOT/ui"
    if ! npm ci --silent; then
        echo -e "${YELLOW}Warning: npm ci failed, trying npm install...${NC}"
        npm install
    fi
    
    # Check Rust backend dependencies
    echo "Checking backend dependencies..."
    cd "$PROJECT_ROOT/core-engine/crates/core"
    if ! cargo check --quiet; then
        echo "Building backend dependencies..."
        cargo build
    fi
}

# Set project root
PROJECT_ROOT="$(dirname "$0")/.."
cd "$PROJECT_ROOT"

echo -e "${BLUE}📍 Project root: $(pwd)${NC}"

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

# Check for required services
echo "Checking CockroachDB..."
if ! curl -s "http://localhost:8080" > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  CockroachDB may not be running. Please start it manually.${NC}"
fi

echo "Checking Redis..."
if ! redis-cli ping > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Redis may not be running. Please start it manually.${NC}"
fi

# Install dependencies
install_deps

# Start backend in background
echo -e "${BLUE}🔧 Starting backend services...${NC}"
cd "$PROJECT_ROOT"

# Set environment variables for backend
export DATABASE_URL="postgresql://sirsi:sirsi@localhost:26257/sirsi_nexus?sslmode=require"
export REDIS_URL="redis://localhost:6379"
export HTTP_PORT="8080"
export CREDENTIAL_ENCRYPTION_KEY="this-is-a-32-byte-key-for-dev!"
export RUST_LOG="info"

# Start backend in background
cd "$PROJECT_ROOT/core-engine/crates/core"
echo -e "${BLUE}Starting Rust backend server...${NC}"
cargo run > "$PROJECT_ROOT/backend.log" 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3
if ! check_service "Backend API" "8080"; then
    echo -e "${RED}❌ Backend failed to start. Check backend.log for details.${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Start frontend
echo -e "${BLUE}🎨 Starting frontend development server...${NC}"
cd "$PROJECT_ROOT/ui"

echo -e "${GREEN}✅ Backend API is running on http://localhost:8080${NC}"
echo -e "${BLUE}Starting Next.js frontend...${NC}"

# Start frontend (this will block)
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 5
if ! check_service "Frontend" "3000"; then
    echo -e "${RED}❌ Frontend failed to start${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 SirsiNexus Platform is now running!${NC}"
echo "=================================="
echo -e "${GREEN}Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}Backend API: http://localhost:8080${NC}"
echo -e "${BLUE}Credential Management: http://localhost:3000/credentials${NC}"
echo ""
echo -e "${YELLOW}📝 Logs:${NC}"
echo "Backend log: $PROJECT_ROOT/backend.log"
echo ""
echo -e "${YELLOW}To stop the platform:${NC}"
echo "Press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping SirsiNexus Platform...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}✅ Platform stopped successfully${NC}"
}

# Set trap to cleanup on exit
trap cleanup EXIT INT TERM

# Wait for frontend process (blocks here)
wait $FRONTEND_PID
