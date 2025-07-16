#!/bin/bash

# Real-time Performance Demonstration Script

NAMESPACE="sirsi-nexus"

echo "🚀 SirsiNexus Performance Showcase"
echo "=================================="
echo ""

# Function to show real-time metrics
show_realtime_metrics() {
    echo "📊 Real-time System Metrics:"
    echo "----------------------------"
    
    # CPU and Memory usage
    echo "Resource Usage:"
    kubectl top pods -n $NAMESPACE 2>/dev/null || echo "Metrics server not available"
    
    echo ""
    echo "Pod Status:"
    kubectl get pods -n $NAMESPACE --no-headers | awk '{print $1 ": " $3}'
    
    echo ""
    echo "HPA Status:"
    kubectl get hpa -n $NAMESPACE --no-headers 2>/dev/null || echo "No HPA configured"
    
    echo ""
    echo "Service Endpoints:"
    kubectl get svc -n $NAMESPACE --no-headers | awk '{print $1 ": " $4}'
}

# Function to simulate load and show scaling
demonstrate_autoscaling() {
    echo "⚡ Auto-scaling Demonstration:"
    echo "-----------------------------"
    
    echo "Starting load simulation..."
    
    # Get service URL
    SERVICE_URL=$(kubectl get svc nginx-service -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "localhost:8080")
    
    # Start background load
    for i in {1..10}; do
        curl -s "$SERVICE_URL" > /dev/null &
    done
    
    echo "Monitoring auto-scaling response..."
    
    # Monitor for 2 minutes
    for i in {1..8}; do
        echo "--- Observation $i ---"
        kubectl get hpa -n $NAMESPACE 2>/dev/null || echo "HPA not configured"
        kubectl get pods -n $NAMESPACE --no-headers | wc -l | awk '{print "Current pods: " $1}'
        sleep 15
    done
    
    echo "Auto-scaling demonstration complete!"
}

# Function to show response time performance
test_response_times() {
    echo "⏱️  Response Time Testing:"
    echo "-------------------------"
    
    SERVICE_URL=$(kubectl get svc nginx-service -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "localhost:8080")
    
    echo "Testing API endpoints..."
    
    # Test main application
    START_TIME=$(date +%s%3N)
    curl -s "$SERVICE_URL" > /dev/null
    END_TIME=$(date +%s%3N)
    DURATION=$((END_TIME - START_TIME))
    echo "Frontend load time: ${DURATION}ms"
    
    # Test health endpoints
    for service in core-engine analytics; do
        START_TIME=$(date +%s%3N)
        kubectl exec -n $NAMESPACE deployment/$service -- curl -s http://localhost:8080/health > /dev/null 2>&1 || true
        END_TIME=$(date +%s%3N)
        DURATION=$((END_TIME - START_TIME))
        echo "$service health check: ${DURATION}ms"
    done
}

# Main demonstration
main() {
    while true; do
        clear
        echo "🎯 SirsiNexus Live Performance Demo"
        echo "$(date)"
        echo "=================================="
        echo ""
        
        show_realtime_metrics
        echo ""
        test_response_times
        
        echo ""
        echo "Press Ctrl+C to exit, or waiting 10 seconds for refresh..."
        sleep 10
    done
}

# Handle command line arguments
case "${1:-realtime}" in
    "metrics")
        show_realtime_metrics
        ;;
    "scaling")
        demonstrate_autoscaling
        ;;
    "response")
        test_response_times
        ;;
    "realtime")
        main
        ;;
    *)
        echo "Usage: $0 [metrics|scaling|response|realtime]"
        echo "  metrics   - Show current system metrics"
        echo "  scaling   - Demonstrate auto-scaling"
        echo "  response  - Test response times"
        echo "  realtime  - Real-time dashboard (default)"
        ;;
esac
