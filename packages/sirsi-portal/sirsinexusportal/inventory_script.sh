#!/bin/bash

# GitHub Pages Directory Inventory Script
# This script collects git status, branch info, and timestamps for GitHub Pages directories

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if directory is a git repository
is_git_repo() {
    local dir="$1"
    if [ -d "$dir/.git" ] || git -C "$dir" rev-parse --git-dir > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to get ahead/behind status with origin
get_ahead_behind() {
    local dir="$1"
    local branch="$2"
    
    cd "$dir"
    
    # Check if remote origin exists
    if ! git remote get-url origin > /dev/null 2>&1; then
        echo "No remote origin"
        return
    fi
    
    # Fetch latest from origin quietly
    git fetch origin > /dev/null 2>&1
    
    # Get ahead/behind count
    local ahead_behind=$(git rev-list --count --left-right HEAD...origin/$branch 2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$ahead_behind" ]; then
        local ahead=$(echo "$ahead_behind" | cut -f1)
        local behind=$(echo "$ahead_behind" | cut -f2)
        echo "ahead $ahead, behind $behind"
    else
        echo "No tracking branch"
    fi
}

# Function to get last modified timestamp of working tree
get_last_modified() {
    local dir="$1"
    
    # Check if stat command supports -f flag (macOS)
    if stat -f "%m" "$dir" > /dev/null 2>&1; then
        # macOS version
        stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$dir"
    else
        # Linux version
        stat -c "%y" "$dir" | cut -d'.' -f1
    fi
}

# Function to analyze a directory
analyze_directory() {
    local dir="$1"
    local abs_path=$(realpath "$dir")
    
    echo -e "${BLUE}## Directory: $abs_path${NC}"
    echo ""
    
    if ! is_git_repo "$dir"; then
        echo -e "${RED}❌ Not a git repository${NC}"
        echo ""
        return
    fi
    
    cd "$dir"
    
    # Get git information
    local short_hash=$(git rev-parse --short HEAD 2>/dev/null)
    local branch=$(git branch --show-current 2>/dev/null)
    local modified_count=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
    
    # Get ahead/behind status
    local ahead_behind=$(get_ahead_behind "$dir" "$branch")
    
    # Get last modified timestamp
    local last_modified=$(get_last_modified "$dir")
    
    # Display results
    echo "**Git Information:**"
    echo "- **Commit Hash:** \`$short_hash\`"
    echo "- **Branch:** \`$branch\`"
    echo "- **Status vs Origin:** $ahead_behind"
    echo "- **Modified Files:** $modified_count"
    echo "- **Last Modified:** $last_modified"
    
    # Show any uncommitted changes
    if [ "$modified_count" -gt 0 ]; then
        echo ""
        echo "**Uncommitted Changes:**"
        echo '```'
        git status --porcelain | head -10
        if [ "$modified_count" -gt 10 ]; then
            echo "... and $((modified_count - 10)) more files"
        fi
        echo '```'
    fi
    
    echo ""
}

# Main execution
echo "# GitHub Pages Directory Inventory Report"
echo "Generated on: $(date)"
echo ""

# Define directories to check
# Add more directories to this array as needed
DIRECTORIES=(
    "."
    # Add other GitHub Pages directories here
    # "../other-repo.github.io"
)

# Check if we can find other GitHub Pages directories automatically
echo "Searching for GitHub Pages directories..."
while IFS= read -r -d '' dir; do
    # Convert to absolute path and then to relative path from current directory
    abs_dir=$(realpath "$dir" 2>/dev/null)
    current_abs=$(realpath "." 2>/dev/null)
    
    # Skip if this is the current directory
    if [[ "$abs_dir" != "$current_abs" ]]; then
        relative_dir=$(realpath --relative-to="." "$dir" 2>/dev/null || echo "$dir")
        if [[ "$relative_dir" != *"/.git"* ]]; then
            DIRECTORIES+=("$relative_dir")
        fi
    fi
done < <(find .. -maxdepth 2 -name "*.github.io" -type d -print0 2>/dev/null)

# Remove duplicates and sort
DIRECTORIES=($(printf '%s\n' "${DIRECTORIES[@]}" | sort -u))

echo "Found ${#DIRECTORIES[@]} directories to analyze."
echo ""

# Analyze each directory
for dir in "${DIRECTORIES[@]}"; do
    if [ -d "$dir" ]; then
        analyze_directory "$dir"
    else
        echo -e "${RED}❌ Directory not found: $dir${NC}"
        echo ""
    fi
done

echo "---"
echo ""
echo "**Summary:**"
echo "- Total directories analyzed: ${#DIRECTORIES[@]}"
echo "- Report generated: $(date)"
echo ""
echo "*Use this report to identify the most up-to-date repository and any divergent commits.*"
