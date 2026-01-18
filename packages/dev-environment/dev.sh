#!/bin/bash

# Development Environment Management Script
# Provides unified commands for managing all projects

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project directories
DEV_ROOT="$HOME/Development"
PROJECTS=(
    "SirsiNexusApp"
    "SirsiMaster.github.io"
    "assiduous"
    "sirsi-pitch-deck"
)

# Function to print colored headers
print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
}

# Function to print project status
print_project_status() {
    local project=$1
    local dir="$DEV_ROOT/$project"
    
    echo -e "\n${YELLOW}📁 $project${NC}"
    
    if [ -d "$dir/.git" ]; then
        cd "$dir"
        
        # Check git status
        if git diff --quiet && git diff --cached --quiet; then
            echo -e "  ${GREEN}✓ Git: Clean${NC}"
        else
            echo -e "  ${RED}✗ Git: Uncommitted changes${NC}"
            git status --short | head -5 | sed 's/^/    /'
        fi
        
        # Check current branch
        branch=$(git branch --show-current 2>/dev/null)
        echo -e "  ${CYAN}Branch: $branch${NC}"
        
        # Check if up to date with remote
        git fetch --quiet 2>/dev/null
        LOCAL=$(git rev-parse @)
        REMOTE=$(git rev-parse @{u} 2>/dev/null)
        BASE=$(git merge-base @ @{u} 2>/dev/null)
        
        if [ "$LOCAL" = "$REMOTE" ]; then
            echo -e "  ${GREEN}✓ Up to date with remote${NC}"
        elif [ "$LOCAL" = "$BASE" ]; then
            echo -e "  ${YELLOW}⟳ Behind remote (pull needed)${NC}"
        elif [ "$REMOTE" = "$BASE" ]; then
            echo -e "  ${YELLOW}⟳ Ahead of remote (push needed)${NC}"
        else
            echo -e "  ${RED}⟳ Diverged from remote${NC}"
        fi
    else
        echo -e "  ${PURPLE}No git repository${NC}"
    fi
    
    # Check for running processes (customize per project)
    case "$project" in
        "SirsiNexusApp")
            if lsof -i:3000 >/dev/null 2>&1; then
                echo -e "  ${GREEN}● Server running on port 3000${NC}"
            else
                echo -e "  ${RED}○ Server not running${NC}"
            fi
            ;;
        "SirsiMaster.github.io")
            if lsof -i:4000 >/dev/null 2>&1; then
                echo -e "  ${GREEN}● Jekyll running on port 4000${NC}"
            else
                echo -e "  ${RED}○ Jekyll not running${NC}"
            fi
            ;;
        "sirsi-pitch-deck")
            if lsof -i:8000 >/dev/null 2>&1; then
                echo -e "  ${GREEN}● Server running on port 8000${NC}"
            else
                echo -e "  ${RED}○ Server not running${NC}"
            fi
            ;;
    esac
}

# Function to start a project
start_project() {
    local project=$1
    local dir="$DEV_ROOT/$project"
    
    echo -e "${CYAN}Starting $project...${NC}"
    cd "$dir"
    
    case "$project" in
        "SirsiNexusApp")
            if [ -f "package.json" ]; then
                npm start &
                echo -e "${GREEN}✓ SirsiNexusApp started${NC}"
            else
                echo -e "${RED}✗ No package.json found${NC}"
            fi
            ;;
        "SirsiMaster.github.io")
            if [ -f "_config.yml" ]; then
                bundle exec jekyll serve &
                echo -e "${GREEN}✓ Jekyll site started${NC}"
            else
                echo -e "${RED}✗ No Jekyll configuration found${NC}"
            fi
            ;;
        "sirsi-pitch-deck")
            if [ -f "serve.py" ]; then
                python serve.py &
                echo -e "${GREEN}✓ Pitch deck server started${NC}"
            else
                echo -e "${RED}✗ No serve.py found${NC}"
            fi
            ;;
        "assiduous")
            echo -e "${YELLOW}⚠ Start command not configured for Assiduous${NC}"
            ;;
        *)
            echo -e "${RED}✗ Unknown project: $project${NC}"
            ;;
    esac
}

# Function to stop a project
stop_project() {
    local project=$1
    
    echo -e "${CYAN}Stopping $project...${NC}"
    
    case "$project" in
        "SirsiNexusApp")
            pkill -f "node.*SirsiNexusApp" 2>/dev/null
            lsof -ti:3000 | xargs kill 2>/dev/null
            echo -e "${GREEN}✓ SirsiNexusApp stopped${NC}"
            ;;
        "SirsiMaster.github.io")
            pkill -f "jekyll" 2>/dev/null
            lsof -ti:4000 | xargs kill 2>/dev/null
            echo -e "${GREEN}✓ Jekyll stopped${NC}"
            ;;
        "sirsi-pitch-deck")
            pkill -f "python.*serve.py" 2>/dev/null
            lsof -ti:8000 | xargs kill 2>/dev/null
            echo -e "${GREEN}✓ Pitch deck server stopped${NC}"
            ;;
        "assiduous")
            echo -e "${YELLOW}⚠ Stop command not configured for Assiduous${NC}"
            ;;
        *)
            echo -e "${RED}✗ Unknown project: $project${NC}"
            ;;
    esac
}

# Function to update all projects
update_all() {
    print_header "Updating All Projects"
    
    for project in "${PROJECTS[@]}"; do
        dir="$DEV_ROOT/$project"
        if [ -d "$dir/.git" ]; then
            echo -e "\n${CYAN}Updating $project...${NC}"
            cd "$dir"
            git pull
        else
            echo -e "\n${YELLOW}Skipping $project (no git repo)${NC}"
        fi
    done
}

# Function to clean all projects
clean_all() {
    print_header "Cleaning All Projects"
    
    for project in "${PROJECTS[@]}"; do
        dir="$DEV_ROOT/$project"
        echo -e "\n${CYAN}Cleaning $project...${NC}"
        
        # Remove common build artifacts and temp files
        find "$dir" -name ".DS_Store" -delete 2>/dev/null
        find "$dir" -name "*.pyc" -delete 2>/dev/null
        find "$dir" -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null
        find "$dir" -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null
        find "$dir" -name ".cache" -type d -exec rm -rf {} + 2>/dev/null
        
        echo -e "${GREEN}✓ Cleaned${NC}"
    done
}

# Function to navigate to a project
go_to_project() {
    local project=$1
    local dir="$DEV_ROOT/$project"
    
    if [ -d "$dir" ]; then
        cd "$dir"
        echo -e "${GREEN}✓ Switched to $project${NC}"
        echo -e "${CYAN}Path: $dir${NC}"
        
        # Show brief status
        if [ -d ".git" ]; then
            branch=$(git branch --show-current 2>/dev/null)
            echo -e "${YELLOW}Branch: $branch${NC}"
        fi
    else
        echo -e "${RED}✗ Project directory not found: $project${NC}"
    fi
}

# Function to run tests for a project
run_tests() {
    local project=$1
    local dir="$DEV_ROOT/$project"
    
    cd "$dir"
    echo -e "${CYAN}Running tests for $project...${NC}"
    
    case "$project" in
        "SirsiNexusApp")
            if [ -f "package.json" ]; then
                npm test
            else
                echo -e "${RED}✗ No package.json found${NC}"
            fi
            ;;
        "assiduous")
            echo -e "${YELLOW}⚠ No tests configured for Assiduous${NC}"
            echo -e "${CYAN}Checking HTML validation...${NC}"
            # Basic HTML validation
            find src -name "*.html" -exec echo "Checking {}" \; -exec tidy -q -e {} \; 2>&1 | grep -v "Warning:"
            ;;
        "sirsi-pitch-deck")
            if [ -f "test.py" ]; then
                python test.py
            else
                echo -e "${YELLOW}⚠ No test.py found${NC}"
            fi
            ;;
        *)
            echo -e "${YELLOW}⚠ Test command not configured for $project${NC}"
            ;;
    esac
}

# Function to install/update dependencies
install_deps() {
    local project=$1
    local dir="$DEV_ROOT/$project"
    
    cd "$dir"
    echo -e "${CYAN}Installing dependencies for $project...${NC}"
    
    case "$project" in
        "SirsiNexusApp")
            if [ -f "package.json" ]; then
                npm install
                echo -e "${GREEN}✓ Node dependencies installed${NC}"
            fi
            ;;
        "SirsiMaster.github.io")
            if [ -f "Gemfile" ]; then
                bundle install
                echo -e "${GREEN}✓ Ruby gems installed${NC}"
            fi
            ;;
        "sirsi-pitch-deck")
            if [ -f "requirements.txt" ]; then
                pip install -r requirements.txt
                echo -e "${GREEN}✓ Python dependencies installed${NC}"
            fi
            ;;
        "assiduous")
            echo -e "${YELLOW}⚠ No dependencies to install (static site)${NC}"
            ;;
        *)
            echo -e "${YELLOW}⚠ Install command not configured for $project${NC}"
            ;;
    esac
}

# Function to build a project
build_project() {
    local project=$1
    local dir="$DEV_ROOT/$project"
    
    cd "$dir"
    echo -e "${CYAN}Building $project...${NC}"
    
    case "$project" in
        "SirsiNexusApp")
            if [ -f "package.json" ]; then
                npm run build
                echo -e "${GREEN}✓ Build completed${NC}"
            fi
            ;;
        "SirsiMaster.github.io")
            if [ -f "_config.yml" ]; then
                bundle exec jekyll build
                echo -e "${GREEN}✓ Jekyll site built${NC}"
            fi
            ;;
        "assiduous")
            echo -e "${YELLOW}⚠ No build required (static site)${NC}"
            ;;
        *)
            echo -e "${YELLOW}⚠ Build command not configured for $project${NC}"
            ;;
    esac
}

# Function to check and commit changes
commit_changes() {
    local project=$1
    local message=$2
    local dir="$DEV_ROOT/$project"
    
    cd "$dir"
    
    if [ ! -d ".git" ]; then
        echo -e "${RED}✗ Not a git repository${NC}"
        return 1
    fi
    
    # Show status
    echo -e "${CYAN}Git status for $project:${NC}"
    git status --short
    
    if [ -z "$message" ]; then
        echo -e "${YELLOW}Please provide a commit message${NC}"
        return 1
    fi
    
    git add -A
    git commit -m "$message"
    echo -e "${GREEN}✓ Changes committed${NC}"
}

# Function for quick project search
search_in_project() {
    local project=$1
    local pattern=$2
    local dir="$DEV_ROOT/$project"
    
    if [ -z "$pattern" ]; then
        echo -e "${RED}✗ Please provide a search pattern${NC}"
        return 1
    fi
    
    echo -e "${CYAN}Searching for '$pattern' in $project...${NC}"
    cd "$dir"
    
    # Use grep with color output
    grep -r --color=always --exclude-dir={.git,node_modules,__pycache__,.cache,build,dist} "$pattern" . | head -20
    
    # Count total matches
    local count=$(grep -r --exclude-dir={.git,node_modules,__pycache__,.cache,build,dist} "$pattern" . 2>/dev/null | wc -l)
    echo -e "\n${YELLOW}Total matches: $count${NC}"
}

# Main command handler
case "$1" in
    "status")
        print_header "Development Environment Status"
        for project in "${PROJECTS[@]}"; do
            print_project_status "$project"
        done
        ;;
    
    "start")
        if [ -z "$2" ]; then
            echo -e "${RED}✗ Please specify a project to start${NC}"
            echo "Available projects: ${PROJECTS[@]}"
        else
            start_project "$2"
        fi
        ;;
    
    "stop")
        if [ -z "$2" ]; then
            echo -e "${RED}✗ Please specify a project to stop${NC}"
            echo "Available projects: ${PROJECTS[@]}"
        else
            stop_project "$2"
        fi
        ;;
    
    "update")
        update_all
        ;;
    
    "clean")
        clean_all
        ;;
    
    "list")
        print_header "Available Projects"
        for project in "${PROJECTS[@]}"; do
            echo "  • $project"
        done
        ;;
    
    "go")
        if [ -z "$2" ]; then
            echo -e "${RED}✗ Please specify a project${NC}"
            echo "Available projects: ${PROJECTS[@]}"
        else
            go_to_project "$2"
        fi
        ;;
    
    "test")
        if [ -z "$2" ]; then
            echo -e "${RED}✗ Please specify a project to test${NC}"
            echo "Available projects: ${PROJECTS[@]}"
        else
            run_tests "$2"
        fi
        ;;
    
    "install")
        if [ -z "$2" ]; then
            echo -e "${CYAN}Installing dependencies for all projects...${NC}"
            for project in "${PROJECTS[@]}"; do
                install_deps "$project"
            done
        else
            install_deps "$2"
        fi
        ;;
    
    "build")
        if [ -z "$2" ]; then
            echo -e "${RED}✗ Please specify a project to build${NC}"
            echo "Available projects: ${PROJECTS[@]}"
        else
            build_project "$2"
        fi
        ;;
    
    "commit")
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo -e "${RED}✗ Usage: dev commit [project] [message]${NC}"
        else
            commit_changes "$2" "$3"
        fi
        ;;
    
    "search")
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo -e "${RED}✗ Usage: dev search [project] [pattern]${NC}"
        else
            search_in_project "$2" "$3"
        fi
        ;;
    
    "help"|"")
        print_header "Development Environment Commands"
        echo -e "${CYAN}Usage:${NC} dev [command] [options]"
        echo ""
        echo -e "${YELLOW}Navigation & Status:${NC}"
        echo "  status          - Show status of all projects"
        echo "  go [project]    - Navigate to a project directory"
        echo "  list            - List all available projects"
        echo "  search [proj] [pattern] - Search for text in project"
        echo ""
        echo -e "${YELLOW}Development:${NC}"
        echo "  start [project] - Start a project server"
        echo "  stop [project]  - Stop a project server"
        echo "  test [project]  - Run tests for a project"
        echo "  build [project] - Build a project"
        echo ""
        echo -e "${YELLOW}Maintenance:${NC}"
        echo "  install [proj?] - Install dependencies (all if no project specified)"
        echo "  update          - Pull latest changes for all repos"
        echo "  clean           - Clean build artifacts and temp files"
        echo "  commit [proj] [msg] - Commit changes with message"
        echo ""
        echo -e "${YELLOW}Projects:${NC}"
        for project in "${PROJECTS[@]}"; do
            echo "  • $project"
        done
        echo ""
        echo -e "${YELLOW}Examples:${NC}"
        echo "  dev go assiduous"
        echo "  dev start SirsiNexusApp"
        echo "  dev test assiduous"
        echo "  dev search SirsiNexusApp 'useState'"
        echo "  dev commit assiduous 'feat: add new property search'"
        ;;
    
    *)
        echo -e "${RED}✗ Unknown command: $1${NC}"
        echo "Run 'dev help' for usage information"
        exit 1
        ;;
esac
