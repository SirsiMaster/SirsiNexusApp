# SirsiNexus Kubernetes Deployment

Enterprise-grade Kubernetes orchestration for the SirsiNexus platform.

## 🏗️ Architecture Overview

The SirsiNexus Kubernetes deployment consists of 8 microservices:

```
┌─────────────────────────────────────────────────────────────┐
│                     Load Balancer                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   Nginx Proxy                              │
│                 (2 replicas)                               │
└─────┬─────────────────┬─────────────────┬───────────────────┘
      │                 │                 │
┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐
│ Frontend  │    │Core Engine│    │ Analytics │
│(3 replicas)│   │(3 replicas)│   │(2 replicas)│
│  Next.js  │    │   Rust    │    │  Python   │
└─────┬─────┘    └─────┬─────┘    └─────┬─────┘
      │                │                │
      └────────────────┼────────────────┘
                       │
      ┌────────────────┼────────────────┐
      │                │                │
┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐
│PostgreSQL│    │   Redis   │    │Monitoring │
│(3 replicas)│   │(1 replica)│    │Prometheus │
│ Database  │    │   Cache   │    │ + Grafana │
└───────────┘    └───────────┘    └───────────┘
```

## 📋 Prerequisites

### Required Tools
- **kubectl** v1.20+ ([Installation Guide](https://kubernetes.io/docs/tasks/tools/install-kubectl/))
- **Kubernetes Cluster** v1.20+ (local or cloud)
- **Helm** v3.0+ (optional, for Helm deployment)

### Cluster Requirements
- **Nodes**: Minimum 3 nodes (for high availability)
- **CPU**: 16+ vCPUs total
- **Memory**: 32+ GB RAM total
- **Storage**: 500+ GB available
- **Storage Classes**: `fast-ssd` and `standard` (or modify in manifests)

### Cloud Provider Setup

#### Local Development (minikube/kind)
```bash
# Start minikube with adequate resources
minikube start --cpus=4 --memory=8192 --disk-size=50g

# Enable required addons
minikube addons enable metrics-server
minikube addons enable storage-provisioner
```

#### AWS EKS
```bash
# Create EKS cluster
eksctl create cluster --name sirsi-nexus --region us-west-2 \
  --nodegroup-name workers --node-type m5.xlarge --nodes 3 \
  --nodes-min 3 --nodes-max 10 --managed

# Install metrics server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

#### Google GKE
```bash
# Create GKE cluster
gcloud container clusters create sirsi-nexus \
  --num-nodes=3 --machine-type=n1-standard-4 \
  --enable-autoscaling --min-nodes=3 --max-nodes=10 \
  --zone=us-central1-a

# Get credentials
gcloud container clusters get-credentials sirsi-nexus --zone=us-central1-a
```

## 🚀 Quick Deployment

### Option 1: Automated Script (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd SirsiNexus/k8s

# Make script executable
chmod +x deploy.sh

# Deploy everything
./deploy.sh deploy

# Verify deployment
./deploy.sh verify

# Clean up (when needed)
./deploy.sh clean
```

### Option 2: Manual Deployment

```bash
# Apply manifests in order
kubectl apply -f namespace.yaml
kubectl apply -f secrets.yaml
kubectl apply -f configmap.yaml
kubectl apply -f storage.yaml
kubectl apply -f rbac.yaml

# Deploy databases first
kubectl apply -f redis-deployment.yaml
kubectl apply -f postgres-deployment.yaml

# Wait for databases to be ready
kubectl wait --for=condition=ready pod -l app=redis -n sirsi-nexus --timeout=300s
kubectl wait --for=condition=ready pod -l app=postgres -n sirsi-nexus --timeout=300s

# Deploy core services
kubectl apply -f core-engine-deployment.yaml
kubectl wait --for=condition=ready pod -l app=core-engine -n sirsi-nexus --timeout=300s

# Deploy application services
kubectl apply -f analytics-deployment.yaml
kubectl apply -f frontend-deployment.yaml

# Deploy monitoring
kubectl apply -f prometheus-deployment.yaml
kubectl apply -f grafana-deployment.yaml

# Deploy reverse proxy
kubectl apply -f nginx-deployment.yaml

# Apply network policies (optional, for enhanced security)
kubectl apply -f network-policies.yaml
```

### Option 3: Helm Deployment

```bash
# Install using Helm
cd helm
helm install sirsi-nexus ./sirsi-nexus -n sirsi-nexus --create-namespace

# Upgrade
helm upgrade sirsi-nexus ./sirsi-nexus -n sirsi-nexus

# Uninstall
helm uninstall sirsi-nexus -n sirsi-nexus
```

## 🔧 Configuration

### Environment Variables

Edit the ConfigMap in `configmap.yaml` or values in `helm/sirsi-nexus/values.yaml`:

```yaml
# Core Engine
RUST_LOG: "info"  # debug, info, warn, error
DATABASE_URL: "postgresql://root@postgres-service:5432/sirsi_nexus"
REDIS_URL: "redis://redis-service:6379"

# Frontend
NODE_ENV: "production"
NEXT_PUBLIC_API_URL: "http://core-engine-service:8080"

# Analytics
PYTHONPATH: "/app"
ENVIRONMENT: "production"
```

### Resource Allocation

Default resource requests and limits:

| Service | CPU Request | Memory Request | CPU Limit | Memory Limit |
|---------|-------------|----------------|-----------|--------------|
| Core Engine | 1000m | 2Gi | 2000m | 4Gi |
| Frontend | 250m | 512Mi | 500m | 1Gi |
| Analytics | 500m | 1Gi | 1000m | 2Gi |
| PostgreSQL | 1000m | 2Gi | 2000m | 4Gi |
| Redis | 250m | 256Mi | 500m | 512Mi |
| Nginx | 100m | 128Mi | 200m | 256Mi |
| Prometheus | 500m | 1Gi | 1000m | 2Gi |
| Grafana | 250m | 256Mi | 500m | 512Mi |

### Scaling Configuration

Horizontal Pod Autoscaling (HPA) is configured for:

- **Core Engine**: 3-10 replicas (70% CPU, 80% Memory)
- **Frontend**: 3-8 replicas (70% CPU)
- **Analytics**: 2-6 replicas (70% CPU, 80% Memory)

## 🔐 Security Features

### Network Policies
- Pod-to-pod communication restrictions
- Ingress/egress traffic control
- Namespace isolation

### RBAC (Role-Based Access Control)
- Service accounts with minimal permissions
- Role-based access to Kubernetes resources
- Cluster-level and namespace-level roles

### Pod Security
- Non-root containers
- Read-only root filesystems
- Security contexts
- Capability dropping

### Secrets Management
- Kubernetes secrets for sensitive data
- Base64 encoded values
- Volume mounts for secret files

## 📊 Monitoring & Observability

### Prometheus Metrics
- **Core Engine**: Custom application metrics on port 9091
- **PostgreSQL**: Database metrics on port 8081
- **Redis**: Redis metrics via redis_exporter
- **Kubernetes**: Node and pod metrics

### Grafana Dashboards
- Platform overview dashboard
- Service-specific dashboards
- Infrastructure monitoring
- Custom alerting rules

### Health Checks
- Liveness probes for all services
- Readiness probes for traffic management
- Startup probes for slow-starting services

## 🔧 Troubleshooting

### Common Issues

#### 1. Pods Stuck in Pending
```bash
# Check node resources
kubectl describe nodes

# Check persistent volume claims
kubectl get pvc -n sirsi-nexus

# Check events
kubectl get events -n sirsi-nexus --sort-by='.lastTimestamp'
```

#### 2. Service Connection Issues
```bash
# Check service endpoints
kubectl get endpoints -n sirsi-nexus

# Test service connectivity
kubectl run debug --image=alpine --rm -it -- sh
# Inside the pod:
nslookup core-engine-service.sirsi-nexus.svc.cluster.local
```

#### 3. Database Connection Problems
```bash
# Check PostgreSQL logs
kubectl logs -f statefulset/postgres -n sirsi-nexus

# Exec into PostgreSQL pod
kubectl exec -it postgres-0 -n sirsi-nexus -- psql -U root -d sirsi_nexus

# Check Redis
kubectl exec -it redis-0 -n sirsi-nexus -- redis-cli ping
```

#### 4. Image Pull Issues
```bash
# Check image pull secrets
kubectl get secrets -n sirsi-nexus

# Verify Docker registry access
kubectl create secret docker-registry registry-secret \
  --docker-server=your-registry.com \
  --docker-username=username \
  --docker-password=password \
  -n sirsi-nexus
```

### Useful Commands

```bash
# Monitor deployment progress
kubectl get pods -n sirsi-nexus -w

# Check all resources
kubectl get all -n sirsi-nexus

# View logs for all pods
kubectl logs -f -l app=core-engine -n sirsi-nexus

# Port forward for local access
kubectl port-forward svc/nginx-service 8080:80 -n sirsi-nexus

# Scale deployments
kubectl scale deployment core-engine --replicas=5 -n sirsi-nexus

# Rolling restart
kubectl rollout restart deployment/core-engine -n sirsi-nexus

# Check resource usage
kubectl top pods -n sirsi-nexus
kubectl top nodes
```

## 🚀 Accessing Services

### External Access (LoadBalancer)
If your cluster supports LoadBalancer services:
```bash
# Get external IP
kubectl get svc nginx-service -n sirsi-nexus

# Access URLs
http://<EXTERNAL-IP>           # Main application
http://<EXTERNAL-IP>:3001      # Grafana (admin/admin123)
http://<EXTERNAL-IP>:9000      # Prometheus
```

### Local Access (Port Forwarding)
```bash
# Application
kubectl port-forward svc/nginx-service 8080:80 -n sirsi-nexus
# Visit: http://localhost:8080

# Grafana
kubectl port-forward svc/grafana-service 3001:3000 -n sirsi-nexus
# Visit: http://localhost:3001 (admin/admin123)

# Prometheus
kubectl port-forward svc/prometheus-service 9000:9090 -n sirsi-nexus
# Visit: http://localhost:9000

# PostgreSQL Admin UI
kubectl port-forward svc/postgres-public 8081:8081 -n sirsi-nexus
# Visit: http://localhost:8081
```

## 🔄 Updates & Maintenance

### Rolling Updates
```bash
# Update core engine image
kubectl set image deployment/core-engine core-engine=sirsi-nexus/core-engine:v1.1.0 -n sirsi-nexus

# Check rollout status
kubectl rollout status deployment/core-engine -n sirsi-nexus

# Rollback if needed
kubectl rollout undo deployment/core-engine -n sirsi-nexus
```

### Backup & Recovery
```bash
# Backup PostgreSQL
kubectl exec postgres-0 -n sirsi-nexus -- psql -U root -d sirsi_nexus -e "BACKUP TO 's3://your-bucket/backup?AWS_ACCESS_KEY_ID=...'"

# Backup Redis
kubectl exec redis-0 -n sirsi-nexus -- redis-cli BGSAVE
```

## 📈 Performance Tuning

### Database Optimization
- Adjust PostgreSQL cache settings based on available memory
- Configure Redis memory limits and eviction policies
- Monitor query performance and add indexes as needed

### Application Scaling
- Use HPA for automatic scaling based on metrics
- Consider vertical pod autoscaling (VPA) for right-sizing
- Implement pod disruption budgets for controlled updates

### Resource Optimization
- Monitor resource usage with `kubectl top`
- Adjust resource requests/limits based on actual usage
- Use node affinity and anti-affinity for optimal placement

## 🆘 Support

### Logs Collection
```bash
# Collect all logs
kubectl logs --previous -l app=core-engine -n sirsi-nexus > core-engine.log
kubectl logs --previous -l app=frontend -n sirsi-nexus > frontend.log
kubectl logs --previous -l app=analytics -n sirsi-nexus > analytics.log

# Get cluster info
kubectl cluster-info dump > cluster-info.txt
```

### Health Check Endpoints
- Core Engine: `http://core-engine-service:8080/health`
- Frontend: `http://frontend-service:3000/api/health`
- Analytics: `http://analytics-service:8000/health`
- PostgreSQL: `http://postgres-service:5432/health`

For additional support, check the main project documentation or contact the SirsiNexus team.
