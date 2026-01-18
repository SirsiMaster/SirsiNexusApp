#!/bin/bash

# Development Context Toggle
CONTEXT_FILE=".dev_context"

function set_context() {
    echo $1 > $CONTEXT_FILE
    echo "==================================="
    echo "Development Context: $1"
    echo "==================================="
    case $1 in
        "pages")
            echo "ACTIVE: GitHub Pages Development"
            echo "Working Directory: SirsiNexus-Pages"
            ;;
        "app")
            echo "ACTIVE: Application Development"
            echo "Working Directory: SirsiNexus-Core"
            ;;
        *)
            echo "Invalid context. Use 'pages' or 'app'"
            return 1
            ;;
    esac
}

set_context $1
