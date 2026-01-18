#!/bin/bash

# SirsiMaster Development Environment Installer
# This script sets up the complete development environment on any machine

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo -e "${CYAN}     SirsiMaster Development Environment Setup      ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "dev.sh" ]; then
    echo -e "${RED}Error: dev.sh not found!${NC}"
    echo "Please run this script from the Development directory"
    exit 1
fi

# Make scripts executable
echo -e "${YELLOW}→ Making scripts executable...${NC}"
chmod +x dev.sh
chmod +x dev-auto-detect.sh
[ -f "scripts/setup-new-project.sh" ] && chmod +x scripts/setup-new-project.sh
[ -f "scripts/clone-all-projects.sh" ] && chmod +x scripts/clone-all-projects.sh
echo -e "${GREEN}✓ Scripts are executable${NC}"

# Detect shell
if [ -n "$ZSH_VERSION" ]; then
    SHELL_RC="$HOME/.zshrc"
    SHELL_NAME="Zsh"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_RC="$HOME/.bashrc"
    SHELL_NAME="Bash"
else
    echo -e "${YELLOW}Warning: Unknown shell. Defaulting to .bashrc${NC}"
    SHELL_RC="$HOME/.bashrc"
    SHELL_NAME="Unknown"
fi

echo -e "${BLUE}Detected shell: $SHELL_NAME${NC}"

# Add to shell configuration
echo -e "${YELLOW}→ Configuring shell...${NC}"
if ! grep -q "source.*dev-aliases.sh" "$SHELL_RC"; then
    echo "" >> "$SHELL_RC"
    echo "# SirsiMaster Development Environment" >> "$SHELL_RC"
    echo "source ~/Development/dev-aliases.sh" >> "$SHELL_RC"
    echo -e "${GREEN}✓ Added to $SHELL_RC${NC}"
else
    echo -e "${GREEN}✓ Shell already configured${NC}"
fi

# Create necessary directories
echo -e "${YELLOW}→ Creating directory structure...${NC}"
mkdir -p scripts
mkdir -p templates/{rust-project,go-project,node-project,static-site}
mkdir -p docs
echo -e "${GREEN}✓ Directories created${NC}"

# Check for required tools
echo -e "${YELLOW}→ Checking required tools...${NC}"
MISSING_TOOLS=()

command -v git >/dev/null 2>&1 || MISSING_TOOLS+=("git")
command -v python3 >/dev/null 2>&1 || MISSING_TOOLS+=("python3")

# Optional tools (just warn if missing)
echo -e "${BLUE}Checking optional tools:${NC}"
command -v cargo >/dev/null 2>&1 && echo -e "  ${GREEN}✓ Rust (cargo)${NC}" || echo -e "  ${YELLOW}○ Rust not installed${NC}"
command -v go >/dev/null 2>&1 && echo -e "  ${GREEN}✓ Go${NC}" || echo -e "  ${YELLOW}○ Go not installed${NC}"
command -v npm >/dev/null 2>&1 && echo -e "  ${GREEN}✓ Node.js (npm)${NC}" || echo -e "  ${YELLOW}○ Node.js not installed${NC}"
command -v bundle >/dev/null 2>&1 && echo -e "  ${GREEN}✓ Ruby Bundler${NC}" || echo -e "  ${YELLOW}○ Ruby Bundler not installed${NC}"

if [ ${#MISSING_TOOLS[@]} -gt 0 ]; then
    echo -e "${RED}Missing required tools: ${MISSING_TOOLS[*]}${NC}"
    echo "Please install these tools and run the installer again"
    exit 1
fi

# Set up git configuration for this repo
echo -e "${YELLOW}→ Configuring git repository...${NC}"
if [ ! -d ".git" ]; then
    git init
    echo -e "${GREEN}✓ Git repository initialized${NC}"
else
    echo -e "${GREEN}✓ Git repository exists${NC}"
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
# OS Files
.DS_Store
Thumbs.db

# IDE Files
.vscode/
.idea/
*.swp
*.swo

# Project directories (these are separate repos)
SirsiNexusApp/
SirsiMaster.github.io/
assiduous/
sirsi-pitch-deck/

# Python
__pycache__/
*.pyc
venv/
.venv/

# Node
node_modules/
npm-debug.log*

# Build outputs
build/
dist/
*.log
EOF
    echo -e "${GREEN}✓ Created .gitignore${NC}"
fi

# Source the aliases for current session
source dev-aliases.sh 2>/dev/null || true

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}       Installation Complete! 🎉                   ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo "1. Restart your terminal or run: source $SHELL_RC"
echo "2. Test the installation: dev help"
echo "3. Check project status: dev status"
echo ""
echo -e "${YELLOW}To set up GitHub remote:${NC}"
echo "  git remote add origin https://github.com/SirsiMaster/dev-environment.git"
echo "  git add ."
echo "  git commit -m 'feat: initial development environment setup'"
echo "  git push -u origin main"
echo ""
echo -e "${BLUE}Happy coding! 🚀${NC}"
