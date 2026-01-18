#!/bin/bash

# Deployment Safeguard Script
# Prevents rapid commits and enforces proper deployment practices

COOLDOWN_PERIOD=300  # 5 minutes between deployments
LAST_DEPLOY_FILE=".last_deploy"
DEPLOY_LOG="deploy_history.log"

function log_deploy() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $DEPLOY_LOG
}

function check_cooldown() {
    if [ -f $LAST_DEPLOY_FILE ]; then
        last_deploy=$(cat $LAST_DEPLOY_FILE)
        current_time=$(date +%s)
        elapsed=$((current_time - last_deploy))
        
        if [ $elapsed -lt $COOLDOWN_PERIOD ]; then
            remaining=$((COOLDOWN_PERIOD - elapsed))
            echo "Error: Must wait $remaining more seconds before next deployment"
            return 1
        fi
    fi
    return 0
}

function deploy_pages() {
    # Verify we're on the right branch
    current_branch=$(git branch --show-current)
    if [ "$current_branch" != "main" ] && [ "$current_branch" != "gh-pages" ]; then
        echo "Error: Must be on main or gh-pages branch to deploy"
        return 1
    }

    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        echo "Error: You have uncommitted changes"
        return 1
    }

    # Check cooldown period
    if ! check_cooldown; then
        return 1
    fi

    # Proceed with deployment
    echo "Starting deployment..."
    date +%s > $LAST_DEPLOY_FILE
    
    # Pull latest changes first
    git pull origin $current_branch
    
    # Push changes
    git push origin $current_branch
    
    log_deploy "Deployed from branch: $current_branch"
    echo "Deployment complete!"
}

# Main execution
deploy_pages
