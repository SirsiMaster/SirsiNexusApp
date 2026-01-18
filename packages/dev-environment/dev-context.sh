#!/bin/bash

# Development Context Toggle
# Helps maintain clear separation between GitHub Pages and Application development

CONTEXT_FILE=".dev_context"
PAGES_DIR="SirsiNexus-Pages"
APP_DIR="SirsiNexus-Core"

function set_context() {
    echo $1 > $CONTEXT_FILE
    echo "==================================="
    echo "Development Context: $1"
    echo "==================================="
    
    case $1 in
        "pages")
            echo "ACTIVE: GitHub Pages Development"
            echo "Working Directory: $PAGES_DIR"
            echo "Live URL: https://sirsimaster.github.io/SirsiNexus/"
            cd $PAGES_DIR
            ;;
        "app")
            echo "ACTIVE: Application Development"
            echo "Working Directory: $APP_DIR"
            echo "Development Environment"
            cd $APP_DIR
            ;;
        *)
            echo "Invalid context. Use 'pages' or 'app'"
            return 1
            ;;
    esac
    
    echo "-----------------------------------"
    echo "Current Git Status:"
    git status --short
    echo "-----------------------------------"
}

# If no argument provided, show current context
if [ -z "$1" ]; then
    if [ -f $CONTEXT_FILE ]; then
        current_context=$(cat $CONTEXT_FILE)
        echo "Current context: $current_context"
    else
        echo "No context set. Use './dev-context.sh pages' or './dev-context.sh app'"
    fi
else
    set_context $1
fi
