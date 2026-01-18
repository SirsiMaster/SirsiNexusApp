#!/bin/bash

# Auto-detect and configure new projects
# This script automatically detects project types and configures dev.sh

detect_project_type() {
    local dir=$1
    local project_name=$(basename "$dir")
    
    echo "Detecting project type for: $project_name"
    
    # Detect Rust projects
    if [ -f "$dir/Cargo.toml" ]; then
        echo "  → Rust project detected"
        echo "  Commands: cargo build, cargo test, cargo run"
        return 0
    fi
    
    # Detect Go projects
    if [ -f "$dir/go.mod" ]; then
        echo "  → Go project detected"
        echo "  Commands: go build, go test, go run"
        return 0
    fi
    
    # Detect Node.js projects
    if [ -f "$dir/package.json" ]; then
        echo "  → Node.js project detected"
        # Check for common scripts
        if grep -q '"start"' "$dir/package.json"; then
            echo "  Commands: npm start, npm test, npm build"
        fi
        return 0
    fi
    
    # Detect Python projects
    if [ -f "$dir/requirements.txt" ] || [ -f "$dir/setup.py" ] || [ -f "$dir/pyproject.toml" ]; then
        echo "  → Python project detected"
        echo "  Commands: python setup, pip install"
        return 0
    fi
    
    # Detect Jekyll sites
    if [ -f "$dir/_config.yml" ]; then
        echo "  → Jekyll site detected"
        echo "  Commands: bundle exec jekyll serve"
        return 0
    fi
    
    # Detect static HTML sites
    if [ -f "$dir/index.html" ] || [ -d "$dir/src" ]; then
        echo "  → Static HTML site detected"
        echo "  Commands: python -m http.server"
        return 0
    fi
    
    echo "  → Unknown project type"
    return 1
}

# Scan all directories in Development folder
scan_projects() {
    local dev_root="$HOME/Development"
    
    echo "Scanning for projects in: $dev_root"
    echo ""
    
    for dir in "$dev_root"/*; do
        if [ -d "$dir" ] && [ ! -d "$dir/.git" ]; then
            continue  # Skip non-git directories
        fi
        
        if [ -d "$dir" ]; then
            detect_project_type "$dir"
            echo ""
        fi
    done
}

# Add a new project to dev.sh
add_to_dev_script() {
    local project_name=$1
    local dev_script="$HOME/Development/dev.sh"
    
    # Check if project already exists in dev.sh
    if grep -q "\"$project_name\"" "$dev_script"; then
        echo "Project $project_name already configured in dev.sh"
        return 0
    fi
    
    echo "Would add $project_name to dev.sh PROJECTS array"
    echo "Edit $dev_script and add to PROJECTS array"
}

# Main execution
case "$1" in
    scan)
        scan_projects
        ;;
    add)
        if [ -z "$2" ]; then
            echo "Usage: dev-auto-detect add [project-name]"
            exit 1
        fi
        add_to_dev_script "$2"
        ;;
    *)
        echo "Auto-detect tool for development projects"
        echo ""
        echo "Usage:"
        echo "  dev-auto-detect scan    - Scan and detect all projects"
        echo "  dev-auto-detect add [name] - Add a project to dev.sh"
        ;;
esac
