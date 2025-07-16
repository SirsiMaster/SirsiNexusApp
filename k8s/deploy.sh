#!/bin/bash

# SirsiNexus Kubernetes Deployment Script
# Phase 3 - Production Kubernetes Orchestration

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="sirsi-nexus"
KUBECTL_TIMEOUT="300s"

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

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi
    
    # Check if kubectl can connect to cluster
    if ! kubectl cluster-info &> /dev/null; then
        error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
        exit 1
    fi
    
    # Check if metrics server is available (for HPA)
    if ! kubectl get deployment metrics-server -n kube-system &> /dev/null; then
        warning "Metrics server not found. HPA may not work properly."
        warning "To install metrics server: kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml"
    fi
    
    success "Prerequisites check completed"
}

# Deploy namespace
deploy_namespace() {
    log "Creating namespace..."
    kubectl apply -f namespace.yaml --timeout=${KUBECTL_TIMEOUT}
    success "Namespace created"
}

# Deploy secrets
deploy_secrets() {
    log "Deploying secrets..."
    kubectl apply -f secrets.yaml --timeout=${KUBECTL_TIMEOUT}
    success "Secrets deployed"
}

# Deploy configmaps
deploy_configmaps() {
    log "Deploying configmaps..."
    kubectl apply -f configmap.yaml --timeout=${KUBECTL_TIMEOUT}
    success "ConfigMaps deployed"
}

# Deploy storage
deploy_storage() {
    log "Deploying persistent volumes..."
    kubectl apply -f storage.yaml --timeout=${KUBECTL_TIMEOUT}
    success "Storage deployed"
}

# Deploy RBAC
deploy_rbac() {
    log "Deploying RBAC configuration..."
    kubectl apply -f rbac.yaml --timeout=${KUBECTL_TIMEOUT}
    success "RBAC deployed"
}

# Deploy databases
deploy_databases() {
    log "Deploying databases..."
    
    # Deploy Redis first
    kubectl apply -f redis-deployment.yaml --timeout=${KUBECTL_TIMEOUT}
    log "Waiting for Redis to be ready..."
    kubectl wait --for=condition=ready pod -l app=redis -n ${NAMESPACE} --timeout=${KUBECTL_TIMEOUT}
    
    # Deploy CockroachDB
    kubectl apply -f cockroachdb-deployment.yaml --timeout=${KUBECTL_TIMEOUT}
    log "Waiting for CockroachDB to be ready..."
    kubectl wait --for=condition=ready pod -l app=cockroachdb -n ${NAMESPACE} --timeout=${KUBECTL_TIMEOUT}
    
    success "Databases deployed and ready"
}

# Deploy core services
deploy_core_services() {
    log "Deploying core engine..."
    kubectl apply -f core-engine-deployment.yaml --timeout=${KUBECTL_TIMEOUT}
    
    log "Waiting for core engine to be ready..."
    kubectl wait --for=condition=ready pod -l app=core-engine -n ${NAMESPACE} --timeout=${KUBECTL_TIMEOUT}
    
    success "Core engine deployed and ready"
}

# Deploy application services
deploy_app_services() {
    log "Deploying application services..."
    
    # Deploy analytics
    kubectl apply -f analytics-deployment.yaml --timeout=${KUBECTL_TIMEOUT}
    
    # Deploy frontend
    kubectl apply -f frontend-deployment.yaml --timeout=${KUBECTL_TIMEOUT}
    
    log "Waiting for application services to be ready..."
    kubectl wait --for=condition=ready pod -l app=analytics -n ${NAMESPACE} --timeout=${KUBECTL_TIMEOUT}
    kubectl wait --for=condition=ready pod -l app=frontend -n ${NAMESPACE} --timeout=${KUBECTL_TIMEOUT}
    
    success "Application services deployed and ready"
}

# Deploy monitoring
deploy_monitoring() {
    log "Deploying monitoring stack..."
    
    # Deploy Prometheus
    kubectl apply -f prometheus-deployment.yaml --timeout=${KUBECTL_TIMEOUT}
    
    # Deploy Grafana
    kubectl apply -f grafana-deployment.yaml --timeout=${KUBECTL_TIMEOUT}
    
    log "Waiting for monitoring services to be ready..."
    kubectl wait --for=condition=ready pod -l app=prometheus -n ${NAMESPACE} --timeout=${KUBECTL_TIMEOUT}
    kubectl wait --for=condition=ready pod -l app=grafana -n ${NAMESPACE} --timeout=${KUBECTL_TIMEOUT}
    
    success "Monitoring stack deployed and ready"
}

# Deploy reverse proxy
deploy_reverse_proxy() {
    log "Deploying reverse proxy..."
    kubectl apply -f nginx-deployment.yaml --timeout=${KUBECTL_TIMEOUT}
    
    log "Waiting for nginx to be ready..."
    kubectl wait --for=condition=ready pod -l app=nginx -n ${NAMESPACE} --timeout=${KUBECTL_TIMEOUT}
    
    success "Reverse proxy deployed and ready"
}

# Deploy network policies
deploy_network_policies() {
    log "Deploying network policies..."
    kubectl apply -f network-policies.yaml --timeout=${KUBECTL_TIMEOUT}
    success "Network policies deployed"
}

# Verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    echo ""
    echo "=== DEPLOYMENT STATUS ==="
    kubectl get all -n ${NAMESPACE}
    
    echo ""
    echo "=== PERSISTENT VOLUMES ==="
    kubectl get pvc -n ${NAMESPACE}
    
    echo ""
    echo "=== SERVICES ==="
    kubectl get svc -n ${NAMESPACE}
    
    echo ""
    echo "=== INGRESS ==="
    kubectl get ingress -n ${NAMESPACE} 2>/dev/null || echo "No ingress resources found"
    
    echo ""
    echo "=== HORIZONTAL POD AUTOSCALERS ==="
    kubectl get hpa -n ${NAMESPACE}
    
    success "Deployment verification completed"
}

# Get access information
get_access_info() {
    log "Getting access information..."
    
    echo ""
    echo "=== ACCESS INFORMATION ==="
    
    # Get LoadBalancer service IP
    NGINX_IP=$(kubectl get svc nginx-service -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")
    if [ "$NGINX_IP" = "pending" ] || [ -z "$NGINX_IP" ]; then
        NGINX_IP=$(kubectl get svc nginx-service -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "pending")
    fi
    
    if [ "$NGINX_IP" != "pending" ] && [ -n "$NGINX_IP" ]; then
        echo "🌐 Application URL: http://${NGINX_IP}"
        echo "📊 Grafana URL: http://${NGINX_IP}:3001 (admin/admin123)"
        echo "🔍 Prometheus URL: http://${NGINX_IP}:9000"
    else
        echo "⏳ LoadBalancer IP is still pending. Use port-forward for local access:"
        echo ""
        echo "# Access the application:"
        echo "kubectl port-forward svc/nginx-service 8080:80 -n ${NAMESPACE}"
        echo "# Then visit: http://localhost:8080"
        echo ""
        echo "# Access Grafana:"
        echo "kubectl port-forward svc/grafana-service 3001:3000 -n ${NAMESPACE}"
        echo "# Then visit: http://localhost:3001 (admin/admin123)"
        echo ""
        echo "# Access Prometheus:"
        echo "kubectl port-forward svc/prometheus-service 9000:9090 -n ${NAMESPACE}"
        echo "# Then visit: http://localhost:9000"
    fi
    
    echo ""
    echo "=== USEFUL COMMANDS ==="
    echo "# Watch deployment status:"
    echo "kubectl get pods -n ${NAMESPACE} -w"
    echo ""
    echo "# View logs:"
    echo "kubectl logs -f deployment/core-engine -n ${NAMESPACE}"
    echo "kubectl logs -f deployment/frontend -n ${NAMESPACE}"
    echo ""
    echo "# Scale deployments:"
    echo "kubectl scale deployment core-engine --replicas=5 -n ${NAMESPACE}"
    echo ""
    echo "# Delete deployment:"
    echo "kubectl delete namespace ${NAMESPACE}"
}

# Main deployment function
main() {
    echo ""
    echo "🚀 SirsiNexus Kubernetes Deployment"
    echo "==================================="
    echo ""
    
    check_prerequisites
    
    log "Starting deployment in order..."
    
    # Deploy in dependency order
    deploy_namespace
    deploy_secrets
    deploy_configmaps
    deploy_storage
    deploy_rbac
    deploy_databases
    deploy_core_services
    deploy_app_services
    deploy_monitoring
    deploy_reverse_proxy
    deploy_network_policies
    
    # Verify and show access info
    verify_deployment
    get_access_info
    
    echo ""
    success "🎉 SirsiNexus Kubernetes deployment completed successfully!"
    echo ""
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "verify")
        verify_deployment
        get_access_info
        ;;
    "clean")
        warning "This will delete the entire SirsiNexus deployment!"
        read -p "Are you sure? (yes/no): " -r
        if [[ $REPLY == "yes" ]]; then
            kubectl delete namespace ${NAMESPACE}
            success "Deployment cleaned up"
        else
            echo "Cleanup cancelled"
        fi
        ;;
    "help")
        echo "Usage: $0 [deploy|verify|clean|help]"
        echo "  deploy - Full deployment (default)"
        echo "  verify - Verify existing deployment and show access info"
        echo "  clean  - Remove entire deployment"
        echo "  help   - Show this help"
        ;;
    *)
        error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
