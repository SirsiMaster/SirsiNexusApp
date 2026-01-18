#!/bin/bash

# Clone all SirsiMaster projects
# This script clones all project repositories when setting up a new machine

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo -e "${CYAN}        Cloning SirsiMaster Projects                ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo ""

# Define repositories
declare -A REPOS=(
    ["SirsiNexusApp"]="https://github.com/SirsiMaster/SirsiNexusApp.git"
    ["SirsiMaster.github.io"]="https://github.com/SirsiMaster/SirsiMaster.github.io.git"
    ["assiduous"]="https://github.com/SirsiMaster/Assiduous.git"
    ["sirsi-pitch-deck"]="https://github.com/SirsiMaster/sirsi-pitch-deck.git"
)

# Clone each repository
for project in "${!REPOS[@]}"; do
    repo_url="${REPOS[$project]}"
    
    if [ -d "$project" ]; then
        echo -e "${YELLOW}→ $project already exists, skipping...${NC}"
    else
        echo -e "${CYAN}→ Cloning $project...${NC}"
        git clone "$repo_url" "$project"
        echo -e "${GREEN}✓ Cloned $project${NC}"
    fi
done

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}         All Projects Cloned! 🎉                   ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo "1. Install dependencies: dev install"
echo "2. Check status: dev status"
echo "3. Start developing: dev go [project]"
