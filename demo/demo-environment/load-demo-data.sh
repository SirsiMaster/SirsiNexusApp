#!/bin/bash

# SirsiNexus Demo Data Loading Script

NAMESPACE="sirsi-nexus"
DEMO_DATA_DIR="./sample-data"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Load users data
load_users() {
    log "Loading users data..."
    
    # Get core engine pod
    POD_NAME=$(kubectl get pods -l app=core-engine -n $NAMESPACE -o jsonpath='{.items[0].metadata.name}')
    
    if [ -z "$POD_NAME" ]; then
        echo "Error: No core engine pod found"
        return 1
    fi
    
    # Copy data to pod and load
    kubectl cp "$DEMO_DATA_DIR/users.json" "$NAMESPACE/$POD_NAME:/tmp/users.json"
    
    kubectl exec -n $NAMESPACE $POD_NAME -- curl -X POST \
        -H "Content-Type: application/json" \
        -d @/tmp/users.json \
        http://localhost:8080/api/users/bulk-import || true
    
    log "Users data loaded"
}

# Load catalog data
load_catalog() {
    log "Loading catalog data..."
    
    POD_NAME=$(kubectl get pods -l app=core-engine -n $NAMESPACE -o jsonpath='{.items[0].metadata.name}')
    
    kubectl cp "$DEMO_DATA_DIR/catalog.json" "$NAMESPACE/$POD_NAME:/tmp/catalog.json"
    
    kubectl exec -n $NAMESPACE $POD_NAME -- curl -X POST \
        -H "Content-Type: application/json" \
        -d @/tmp/catalog.json \
        http://localhost:8080/api/catalog/bulk-import || true
    
    log "Catalog data loaded"
}

# Load transactions data
load_transactions() {
    log "Loading transactions data..."
    
    POD_NAME=$(kubectl get pods -l app=core-engine -n $NAMESPACE -o jsonpath='{.items[0].metadata.name}')
    
    kubectl cp "$DEMO_DATA_DIR/transactions.json" "$NAMESPACE/$POD_NAME:/tmp/transactions.json"
    
    kubectl exec -n $NAMESPACE $POD_NAME -- curl -X POST \
        -H "Content-Type: application/json" \
        -d @/tmp/transactions.json \
        http://localhost:8080/api/transactions/bulk-import || true
    
    log "Transactions data loaded"
}

# Load analytics data
load_analytics() {
    log "Loading analytics data..."
    
    POD_NAME=$(kubectl get pods -l app=analytics -n $NAMESPACE -o jsonpath='{.items[0].metadata.name}')
    
    kubectl cp "$DEMO_DATA_DIR/analytics.json" "$NAMESPACE/$POD_NAME:/tmp/analytics.json"
    
    kubectl exec -n $NAMESPACE $POD_NAME -- curl -X POST \
        -H "Content-Type: application/json" \
        -d @/tmp/analytics.json \
        http://localhost:8000/api/analytics/seed-data || true
    
    log "Analytics data loaded"
}

main() {
    echo ""
    echo "🎯 Loading SirsiNexus Demo Data"
    echo "==============================="
    echo ""
    
    load_users
    load_catalog
    load_transactions
    load_analytics
    
    echo ""
    echo "✅ Demo data loading completed!"
    echo ""
}

main
