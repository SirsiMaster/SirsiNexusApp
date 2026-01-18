#!/bin/bash

# Installation script for Warp workflows and rules
WARP_DIR="$HOME/.warp"
WORKFLOW_DIR="$WARP_DIR/workflows"
RULES_DIR="$WARP_DIR/rules"

# Create directories if they don't exist
mkdir -p "$WORKFLOW_DIR"
mkdir -p "$RULES_DIR"

# Copy workflows and rules
cp .warp/workflows/* "$WORKFLOW_DIR/"
cp .warp/rules/* "$RULES_DIR/"

echo "Installed SirsiNexus Warp configurations successfully!"
echo "Workflows available:"
ls -1 "$WORKFLOW_DIR"
