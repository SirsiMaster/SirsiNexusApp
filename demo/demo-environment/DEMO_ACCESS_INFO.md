# SirsiNexus Demo Access Information

## 🌐 Service URLs

### Primary Application
- **Main Application**: http://localhost:8080 (or LoadBalancer IP)
- **Frontend Health**: http://localhost:8080/api/health

### Monitoring & Analytics
- **Grafana Dashboard**: http://localhost:3001
  - Username: admin
  - Password: admin123
  
- **Prometheus Metrics**: http://localhost:9000

### Database Access
- **CockroachDB Admin**: http://localhost:8081
  - No authentication (demo mode)

## 🎯 Demo Scenarios

### 1. User Registration Demo
- Navigate to main application
- Click "Register New User"
- Fill sample data and submit
- Login with created credentials

### 2. Catalog Management Demo
- Access catalog section
- Add new book with ISBN: 978-3-456789-01-2
- Search and filter books
- Check out/return items

### 3. Analytics Dashboard Demo
- View real-time statistics
- Generate usage reports
- Export data in various formats
- Monitor user engagement

### 4. System Performance Demo
- Access Grafana dashboard
- Show real-time metrics
- Demonstrate auto-scaling
- Monitor resource usage

## 🔧 Demo Data

### Sample Users
- Alice Johnson (alice.johnson@example.com) - Library Administrator
- Bob Smith (bob.smith@university.edu) - Cataloger
- Carol Davis (carol.davis@library.org) - Circulation Manager

### Sample Books
- "Advanced Library Management Systems" - Dr. Sarah Wilson
- "Digital Transformation in Libraries" - Prof. Michael Chen
- "Modern Cataloging Practices" - Linda Rodriguez

### Demo Credentials
- Demo User: demo@library.org / password123
- Admin User: admin@sirsi-nexus.com / admin123

## 📊 Performance Benchmarks

### Expected Performance
- **Page Load Time**: < 2 seconds
- **API Response**: < 500ms
- **Search Results**: < 1 second
- **Auto-scaling**: Triggers within 30 seconds

### Load Testing
- **Concurrent Users**: 100-400 supported
- **API Throughput**: 1000+ requests/second
- **Database Performance**: < 50ms query time
- **Auto-scaling Range**: 3-10 pods

## 🎬 Live Demo Commands

### Quick Status Check
```bash
kubectl get pods -n sirsi-nexus
kubectl get svc -n sirsi-nexus
kubectl get hpa -n sirsi-nexus
```

### Load Demo Data
```bash
cd demo-environment
./load-demo-data.sh
```

### Performance Showcase
```bash
cd demo-environment/performance-showcase
./real-time-demo.sh
```

### Generate Load for Scaling Demo
```bash
# In separate terminals
for i in {1..20}; do curl -s http://localhost:8080 & done
```

## 🛠️ Troubleshooting

### If Services Are Not Accessible
1. Check port forwarding:
   ```bash
   kubectl port-forward svc/nginx-service 8080:80 -n sirsi-nexus
   kubectl port-forward svc/grafana-service 3001:3000 -n sirsi-nexus
   ```

2. Verify pod status:
   ```bash
   kubectl get pods -n sirsi-nexus
   kubectl describe pod <pod-name> -n sirsi-nexus
   ```

### If Data Loading Fails
1. Check core engine logs:
   ```bash
   kubectl logs -f deployment/core-engine -n sirsi-nexus
   ```

2. Verify database connectivity:
   ```bash
   kubectl exec -it cockroachdb-0 -n sirsi-nexus -- /cockroach/cockroach sql --insecure
   ```

### If Monitoring is Unavailable
1. Check Grafana pod:
   ```bash
   kubectl get pods -l app=grafana -n sirsi-nexus
   ```

2. Reset Grafana admin password:
   ```bash
   kubectl exec -it deployment/grafana -n sirsi-nexus -- grafana-cli admin reset-admin-password admin123
   ```

## 📞 Demo Support
- Technical Issues: Check pod logs and events
- Performance Questions: Use Grafana dashboards
- Feature Questions: Reference scenario guides
- Access Issues: Verify port forwarding

---
*Ready for an impressive demonstration! 🚀*
