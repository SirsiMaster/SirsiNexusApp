#!/bin/bash

# SirsiNexus Deployment Script
# Automated deployment for all components

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE=${NAMESPACE:-sirsi-nexus}
ENVIRONMENT=${ENVIRONMENT:-production}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-docker.io}
IMAGE_TAG=${IMAGE_TAG:-latest}

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check dependencies
check_dependencies() {
    log "Checking dependencies..."
    
    if ! command -v kubectl &> /dev/null; then
        error "kubectl is not installed"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        error "docker is not installed"
        exit 1
    fi
    
    success "All dependencies are available"
}

# Build Docker images
build_images() {
    log "Building Docker images..."
    
    # Core Engine
    log "Building core-engine image..."
    docker build -t ${DOCKER_REGISTRY}/sirsi-nexus/core-engine:${IMAGE_TAG} ./core-engine
    
    # UI
    log "Building ui image..."
    docker build -t ${DOCKER_REGISTRY}/sirsi-nexus/ui:${IMAGE_TAG} ./ui
    
    # Analytics Platform
    if [ -d "./analytics-platform" ]; then
        log "Building analytics-platform image..."
        docker build -t ${DOCKER_REGISTRY}/sirsi-nexus/analytics:${IMAGE_TAG} ./analytics-platform
    fi
    
    success "All images built successfully"
}

# Push Docker images
push_images() {
    log "Pushing Docker images to registry..."
    
    docker push ${DOCKER_REGISTRY}/sirsi-nexus/core-engine:${IMAGE_TAG}
    docker push ${DOCKER_REGISTRY}/sirsi-nexus/ui:${IMAGE_TAG}
    
    if [ -d "./analytics-platform" ]; then
        docker push ${DOCKER_REGISTRY}/sirsi-nexus/analytics:${IMAGE_TAG}
    fi
    
    success "All images pushed successfully"
}

# Deploy to Kubernetes
deploy_kubernetes() {
    log "Deploying to Kubernetes namespace: ${NAMESPACE}"
    
    # Create namespace if it doesn't exist
    kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply all Kubernetes manifests
    log "Applying Kubernetes manifests..."
    
    # Update image tags in deployments
    find k8s/ -name "*.yaml" -exec sed -i.bak "s|image: sirsi-nexus/|image: ${DOCKER_REGISTRY}/sirsi-nexus/|g" {} \;
    find k8s/ -name "*.yaml" -exec sed -i.bak "s|:latest|:${IMAGE_TAG}|g" {} \;
    
    # Apply manifests
    kubectl apply -f k8s/ -n ${NAMESPACE}
    
    # Clean up backup files
    find k8s/ -name "*.yaml.bak" -delete
    
    success "Kubernetes manifests applied"
}

# Wait for deployments
wait_for_deployments() {
    log "Waiting for deployments to be ready..."
    
    # List of deployments to wait for
    deployments=(
        "sirsi-nexus-core-engine"
        "sirsi-nexus-ui"
        "sirsi-nexus-frontend"
        "postgres"
        "redis"
    )
    
    for deployment in "${deployments[@]}"; do
        if kubectl get deployment ${deployment} -n ${NAMESPACE} &> /dev/null; then
            log "Waiting for ${deployment}..."
            kubectl rollout status deployment/${deployment} -n ${NAMESPACE} --timeout=300s
        else
            warning "Deployment ${deployment} not found, skipping..."
        fi
    done
    
    success "All deployments are ready"
}

# Health check
health_check() {
    log "Performing health checks..."
    
    # Get service endpoints
    log "Service status:"
    kubectl get services -n ${NAMESPACE}
    
    log "Pod status:"
    kubectl get pods -n ${NAMESPACE}
    
    # Check if services are responding
    log "Checking service health..."
    
    # Port forward and test (example for UI)
    if kubectl get service sirsi-nexus-ui -n ${NAMESPACE} &> /dev/null; then
        log "UI service is available"
    else
        warning "UI service not found"
    fi
    
    success "Health checks completed"
}

# Database migration
run_migrations() {
    log "Running database migrations..."
    
    # Check if core-engine pod is ready
    if kubectl get pods -l app=sirsi-nexus-core-engine -n ${NAMESPACE} | grep -q Running; then
        # Run migrations (example command)
        log "Database migrations would run here"
        # kubectl exec -it deployment/sirsi-nexus-core-engine -n ${NAMESPACE} -- ./migrate
    else
        warning "Core engine pod not ready, skipping migrations"
    fi
}

# Rollback function
rollback() {
    local deployment=$1
    log "Rolling back deployment: ${deployment}"
    kubectl rollout undo deployment/${deployment} -n ${NAMESPACE}
    kubectl rollout status deployment/${deployment} -n ${NAMESPACE}
}

# Cleanup function
cleanup() {
    log "Cleaning up temporary files..."
    # Add cleanup logic here
}

# Main deployment function
deploy() {
    log "Starting SirsiNexus deployment..."
    log "Environment: ${ENVIRONMENT}"
    log "Namespace: ${NAMESPACE}"
    log "Image tag: ${IMAGE_TAG}"
    
    trap cleanup EXIT
    
    check_dependencies
    build_images
    
    if [ "${PUSH_IMAGES:-true}" = "true" ]; then
        push_images
    fi
    
    deploy_kubernetes
    wait_for_deployments
    run_migrations
    health_check
    
    success "🚀 SirsiNexus deployment completed successfully!"
    log "Access your application:"
    log "  kubectl get services -n ${NAMESPACE}"
}

# Development deployment (local only)
deploy_dev() {
    log "Starting development deployment..."
    
    export PUSH_IMAGES=false
    export IMAGE_TAG=dev
    export NAMESPACE=sirsi-nexus-dev
    
    deploy
}

# Production deployment
deploy_prod() {
    log "Starting production deployment..."
    
    if [ -z "${DOCKER_USERNAME:-}" ] || [ -z "${DOCKER_PASSWORD:-}" ]; then
        error "Docker credentials not set for production deployment"
        exit 1
    fi
    
    # Login to Docker registry
    echo "${DOCKER_PASSWORD}" | docker login ${DOCKER_REGISTRY} -u "${DOCKER_USERNAME}" --password-stdin
    
    export PUSH_IMAGES=true
    export IMAGE_TAG=latest
    export NAMESPACE=sirsi-nexus
    
    deploy
}

# Status check
status() {
    log "Checking SirsiNexus status..."
    
    echo "Namespaces:"
    kubectl get namespaces | grep sirsi-nexus || true
    
    if kubectl get namespace ${NAMESPACE} &> /dev/null; then
        echo ""
        echo "Deployments in ${NAMESPACE}:"
        kubectl get deployments -n ${NAMESPACE}
        
        echo ""
        echo "Services in ${NAMESPACE}:"
        kubectl get services -n ${NAMESPACE}
        
        echo ""
        echo "Pods in ${NAMESPACE}:"
        kubectl get pods -n ${NAMESPACE}
    else
        warning "Namespace ${NAMESPACE} not found"
    fi
}

# Help function
show_help() {
    cat << EOF
SirsiNexus Deployment Script

Usage: $0 [COMMAND]

Commands:
    deploy          Full deployment (build, push, deploy)
    deploy-dev      Development deployment (no push)
    deploy-prod     Production deployment with credentials
    build           Build Docker images only
    push            Push Docker images only
    k8s             Deploy to Kubernetes only
    status          Check deployment status
    rollback [dep]  Rollback specific deployment
    help            Show this help message

Environment Variables:
    NAMESPACE       Kubernetes namespace (default: sirsi-nexus)
    ENVIRONMENT     Environment name (default: production)
    DOCKER_REGISTRY Docker registry URL (default: docker.io)
    IMAGE_TAG       Docker image tag (default: latest)
    DOCKER_USERNAME Docker registry username
    DOCKER_PASSWORD Docker registry password

Examples:
    $0 deploy-dev                    # Development deployment
    $0 deploy-prod                   # Production deployment
    NAMESPACE=test $0 deploy         # Deploy to test namespace
    $0 rollback sirsi-nexus-ui       # Rollback UI deployment
    $0 status                        # Check status

EOF
}

# Command handling
case "${1:-help}" in
    deploy)
        deploy
        ;;
    deploy-dev)
        deploy_dev
        ;;
    deploy-prod)
        deploy_prod
        ;;
    build)
        check_dependencies
        build_images
        ;;
    push)
        check_dependencies
        push_images
        ;;
    k8s|kubernetes)
        check_dependencies
        deploy_kubernetes
        wait_for_deployments
        ;;
    status)
        status
        ;;
    rollback)
        if [ -z "${2:-}" ]; then
            error "Please specify deployment name to rollback"
            exit 1
        fi
        rollback "$2"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
