#!/bin/bash

COOLDOWN_PERIOD=300  # 5 minutes
LAST_DEPLOY_FILE=".last_deploy"

if [ -f $LAST_DEPLOY_FILE ]; then
    last_deploy=$(cat $LAST_DEPLOY_FILE)
    current_time=$(date +%s)
    elapsed=$((current_time - last_deploy))
    
    if [ $elapsed -lt $COOLDOWN_PERIOD ]; then
        remaining=$((COOLDOWN_PERIOD - elapsed))
        echo "Error: Must wait $remaining more seconds before next deployment"
        exit 1
    fi
fi

# Record deployment time
date +%s > $LAST_DEPLOY_FILE

# Perform deployment
git push origin $(git branch --show-current)
