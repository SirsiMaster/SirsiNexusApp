#!/bin/bash

# Quick setup script for SirsiNexus Warp development environment

echo "Setting up SirsiNexus Warp development environment..."

# Check if Warp is installed
if ! command -v warp &> /dev/null; then
    echo "Error: Warp terminal is not installed!"
    echo "Please install Warp from: https://www.warp.dev"
    exit 1
fi

# Install workflows and rules
.warp/install_warp_config.sh

# Set up development context
./dev-context.sh pages  # Default to pages context

echo "Setup complete! Available commands:"
echo "- warp workflow pages_workflow  : Start GitHub Pages development"
echo "- warp workflow app_workflow    : Start application development"
echo "- ./dev-context.sh             : Switch development context"
