#!/bin/zsh

# 🚀 SirsiNexus Full Stack Launcher
# Start both backend and frontend services

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${CYAN}================================================================${NC}"
echo -e "${CYAN}🚀 SirsiNexus Full Stack Platform${NC}"
echo -e "${CYAN}================================================================${NC}"
echo -e "${GREEN}✨ Backend + Frontend Complete Development Environment ✨${NC}"
echo -e "${CYAN}================================================================${NC}"
echo ""

# Navigate to the SirsiNexus directory
SCRIPT_DIR="$(dirname "$0")"
cd "$SCRIPT_DIR"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down services...${NC}"
    # Kill background processes
    if [[ ! -z "$BACKEND_PID" ]]; then
        kill $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Backend stopped${NC}"
    fi
    if [[ ! -z "$FRONTEND_PID" ]]; then
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Frontend stopped${NC}"
    fi
    echo -e "${CYAN}👋 SirsiNexus shutdown complete${NC}"
    exit 0
}

# Set up signal handling
trap cleanup INT TERM

echo -e "${BLUE}🔧 Step 1: Starting Backend Services${NC}"
echo -e "${YELLOW}🚀 Launching sirsi-nexus backend in development mode...${NC}"

# Start backend in background
./sirsi-nexus start --dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✅ Backend started successfully (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}❌ Failed to start backend${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔧 Step 2: Starting Frontend GUI${NC}"

# Check if UI directory exists
if [[ ! -d "ui" ]]; then
    echo -e "${RED}❌ Error: UI directory not found!${NC}"
    cleanup
fi

cd ui

# Install dependencies if needed
if [[ ! -d "node_modules" ]]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install
    if [[ $? -ne 0 ]]; then
        echo -e "${RED}❌ Failed to install dependencies!${NC}"
        cleanup
    fi
fi

echo -e "${YELLOW}🎨 Launching Next.js frontend...${NC}"

# Start frontend in background
npm run dev &
FRONTEND_PID=$!

# Wait a bit for frontend to start
sleep 5

echo ""
echo -e "${PURPLE}================================================================${NC}"
echo -e "${GREEN}🎉 SirsiNexus Full Stack Platform is now running!${NC}"
echo -e "${PURPLE}================================================================${NC}"
echo ""
echo -e "${CYAN}🌐 Access Points:${NC}"
echo -e "${GREEN}   📱 Frontend GUI: http://localhost:3000${NC}"
echo -e "${GREEN}   🔧 Backend API: http://localhost:8080${NC}"
echo -e "${GREEN}   📊 Health Check: http://localhost:8080/health${NC}"
echo ""
echo -e "${YELLOW}🔧 Backend Services Running:${NC}"
echo -e "${GREEN}   🤖 AI Infrastructure Agent (gRPC): localhost:50051${NC}"
echo -e "${GREEN}   🌐 REST API Service: localhost:8080${NC}"
echo -e "${GREEN}   🔌 WebSocket Service: localhost:8081${NC}"
echo -e "${GREEN}   📊 Analytics Engine: Internal${NC}"
echo -e "${GREEN}   🔒 Security Engine: Internal${NC}"
echo ""
echo -e "${PURPLE}================================================================${NC}"
echo -e "${YELLOW}📝 Press Ctrl+C to stop all services${NC}"
echo -e "${PURPLE}================================================================${NC}"

# Wait for user interrupt
wait
