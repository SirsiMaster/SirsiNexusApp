#!/bin/bash

# Development Environment Aliases and Functions (Fixed Version)
# This file includes a fixed proj function that actually changes directories
# Source this file in your ~/.zshrc or ~/.bashrc:
# source ~/Development/dev-aliases-fixed.sh

# Quick navigation aliases
alias dev-root='cd ~/Development'
alias dev-nexus='cd ~/Development/SirsiNexusApp'
alias dev-portal='cd ~/Development/SirsiMaster.github.io'
alias dev-assiduous='cd ~/Development/assiduous'
alias dev-pitch='cd ~/Development/sirsi-pitch-deck'

# Shorthand for dev.sh commands
alias ds='~/Development/dev.sh status'
alias dg='~/Development/dev.sh go'
alias dt='~/Development/dev.sh test'
alias db='~/Development/dev.sh build'
alias di='~/Development/dev.sh install'
alias dc='~/Development/dev.sh commit'
alias dsearch='~/Development/dev.sh search'

# Fixed version of proj function that actually changes directories
function proj() {
    if [ -z "$1" ]; then
        echo "Usage: proj [nexus|portal|assiduous|pitch]"
        echo "Available projects:"
        echo "  nexus     - SirsiNexusApp"
        echo "  portal    - SirsiMaster.github.io"
        echo "  assiduous - Assiduous real estate platform"
        echo "  pitch     - Sirsi pitch deck"
        return 1
    fi
    
    local project_path=""
    local project_name=""
    
    case "$1" in
        nexus)
            project_path="$HOME/Development/SirsiNexusApp"
            project_name="SirsiNexusApp"
            ;;
        portal)
            project_path="$HOME/Development/SirsiMaster.github.io"
            project_name="SirsiMaster.github.io"
            ;;
        assiduous)
            project_path="$HOME/Development/assiduous"
            project_name="assiduous"
            ;;
        pitch)
            project_path="$HOME/Development/sirsi-pitch-deck"
            project_name="sirsi-pitch-deck"
            ;;
        *)
            echo "Unknown project: $1"
            return 1
            ;;
    esac
    
    # Actually change to the directory
    cd "$project_path" || return 1
    
    # Show status
    echo "✓ Switched to $project_name"
    echo "Path: $project_path"
    
    # Show git branch if in a git repo
    if [ -d ".git" ]; then
        branch=$(git branch --show-current 2>/dev/null)
        if [ -n "$branch" ]; then
            echo "Branch: $branch"
        fi
    fi
}

# Function to activate Python virtual environment
function venv() {
    local venv_dir=""
    
    # Check common virtual environment locations
    if [ -d "venv" ]; then
        venv_dir="venv"
    elif [ -d ".venv" ]; then
        venv_dir=".venv"
    elif [ -d "env" ]; then
        venv_dir="env"
    fi
    
    if [ -n "$venv_dir" ]; then
        source "$venv_dir/bin/activate"
        echo "✓ Activated virtual environment: $venv_dir"
    else
        echo "✗ No virtual environment found in current directory"
        echo "Create one with: python -m venv venv"
    fi
}

# Function to create a new Python virtual environment
function mkvenv() {
    local name="${1:-venv}"
    
    if [ -d "$name" ]; then
        echo "✗ Virtual environment '$name' already exists"
        return 1
    fi
    
    python -m venv "$name"
    source "$name/bin/activate"
    pip install --upgrade pip
    
    echo "✓ Created and activated virtual environment: $name"
    echo "✓ Upgraded pip to latest version"
    
    # Install requirements if they exist
    if [ -f "requirements.txt" ]; then
        echo "Found requirements.txt, installing..."
        pip install -r requirements.txt
    fi
}

# Function to run all servers
function dev-start-all() {
    echo "Starting all development servers..."
    
    # Start each project in background
    (cd ~/Development/SirsiNexusApp && npm start &)
    (cd ~/Development/SirsiMaster.github.io && bundle exec jekyll serve &)
    (cd ~/Development/sirsi-pitch-deck && python serve.py &)
    (cd ~/Development/assiduous && python -m http.server 8080 &)
    
    echo "✓ All servers starting..."
    echo ""
    echo "Access points:"
    echo "  SirsiNexusApp:    http://localhost:3000"
    echo "  Portal:           http://localhost:4000"
    echo "  Pitch Deck:       http://localhost:8000"
    echo "  Assiduous:        http://localhost:8080/src/"
}

# Function to stop all servers
function dev-stop-all() {
    echo "Stopping all development servers..."
    
    # Kill processes on known ports
    lsof -ti:3000 | xargs kill 2>/dev/null
    lsof -ti:4000 | xargs kill 2>/dev/null
    lsof -ti:8000 | xargs kill 2>/dev/null
    lsof -ti:8080 | xargs kill 2>/dev/null
    
    # Kill specific processes
    pkill -f "node.*SirsiNexusApp" 2>/dev/null
    pkill -f "jekyll" 2>/dev/null
    pkill -f "python.*serve.py" 2>/dev/null
    pkill -f "python.*http.server" 2>/dev/null
    
    echo "✓ All servers stopped"
}

# Function to check all project statuses
function dev-check() {
    ~/Development/dev.sh status
}

# Function to open project in VS Code
function code-proj() {
    case "$1" in
        nexus)
            code ~/Development/SirsiNexusApp
            ;;
        portal)
            code ~/Development/SirsiMaster.github.io
            ;;
        assiduous)
            code ~/Development/assiduous
            ;;
        pitch)
            code ~/Development/sirsi-pitch-deck
            ;;
        all)
            code ~/Development/workspace.code-workspace
            ;;
        *)
            echo "Usage: code-proj [nexus|portal|assiduous|pitch|all]"
            ;;
    esac
}

# Function to git pull all projects
function dev-pull-all() {
    echo "Pulling latest changes for all projects..."
    ~/Development/dev.sh update
}

# Function to show project URLs
function dev-urls() {
    echo "Development URLs:"
    echo ""
    echo "Local Servers:"
    echo "  SirsiNexusApp:    http://localhost:3000"
    echo "  Portal:           http://localhost:4000" 
    echo "  Pitch Deck:       http://localhost:8000"
    echo "  Assiduous:        http://localhost:8080/src/"
    echo ""
    echo "Production Sites:"
    echo "  Portal:           https://sirsmaster.github.io"
    echo "  GitHub Repos:"
    echo "    Nexus:          https://github.com/SirsiMaster/SirsiNexusApp"
    echo "    Portal:         https://github.com/SirsiMaster/SirsiMaster.github.io"
    echo "    Assiduous:      https://github.com/SirsiMaster/Assiduous"
}

# Add to PATH if not already there
export PATH="$HOME/Development:$PATH"

echo "✓ Development aliases and functions loaded (fixed version)"
echo "  Type 'dev help' for available commands"
echo "  Type 'proj' to navigate between projects (now works correctly!)"
echo "  Type 'dev-urls' to see all project URLs"
