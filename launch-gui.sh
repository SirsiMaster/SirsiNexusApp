#!/bin/zsh

# 🎨 SirsiNexus GUI Launcher
# Launch the Next.js frontend interface

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
echo -e "${CYAN}🎨 SirsiNexus GUI - Next.js Frontend Interface${NC}"
echo -e "${CYAN}================================================================${NC}"
echo -e "${GREEN}✨ Professional Glass Morphism Design System ✨${NC}"
echo -e "${CYAN}================================================================${NC}"
echo ""

# Navigate to the SirsiNexus directory
SCRIPT_DIR="$(dirname "$0")"
cd "$SCRIPT_DIR"

# Check if UI directory exists
if [[ ! -d "ui" ]]; then
    echo -e "${RED}❌ Error: UI directory not found!${NC}"
    exit 1
fi

cd ui

# Check if node_modules exists
if [[ ! -d "node_modules" ]]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    if [[ $? -ne 0 ]]; then
        echo -e "${RED}❌ Failed to install dependencies!${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencies installed successfully!${NC}"
fi

# Check if the backend is running
echo -e "${BLUE}🔍 Checking backend status...${NC}"
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running on port 8080${NC}"
else
    echo -e "${YELLOW}⚠️  Backend not detected. You may want to start it first:${NC}"
    echo -e "${CYAN}   cd .. && ./sirsi start${NC}"
    echo ""
fi

# Show available URLs
echo -e "${PURPLE}🌐 GUI will be available at:${NC}"
echo -e "${GREEN}   Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}   Backend API: http://localhost:8080${NC}"
echo ""

# Start the development server
echo -e "${BLUE}🚀 Starting Next.js development server...${NC}"
echo -e "${YELLOW}📝 Press Ctrl+C to stop the server${NC}"
echo ""

# Start the Next.js app
npm run dev
