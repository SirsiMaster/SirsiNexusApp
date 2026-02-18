# Operations Guide

## Table of Contents
1. [Installation](#installation)
2. [Deployment](#deployment)
3. [Configuration](#configuration)
4. [Monitoring & Observability](#monitoring--observability)
5. [Troubleshooting](#troubleshooting)
6. [Maintenance](#maintenance)
7. [Security Operations](#security-operations)
8. [Disaster Recovery](#disaster-recovery)
9. [Performance Tuning](#performance-tuning)
10. [Scaling](#scaling)

## Installation

### Prerequisites
- **Operating System**: Linux (Ubuntu 20.04+, CentOS 8+), macOS 10.15+
- **CPU**: 4+ cores recommended
- **Memory**: 8GB+ RAM
- **Storage**: 20GB+ available space
- **Network**: Outbound internet access for cloud provider APIs
- **Docker**: 20.10+
- **Kubernetes**: 1.24+ (for production deployments)

### Database Requirements
- **PostgreSQL**: 15+ (recommended for production)
- **PostgreSQL**: 13+ (alternative for development)
- **Redis**: 6.2+ (for event bus and caching)

### Development Setup
```bash
# Clone repository
git clone https://github.com/your-org/sirsi-nexus.git
cd sirsi-nexus/core-engine

# Install Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install dependencies
cargo install cargo-watch
cargo install sqlx-cli

# Start local services
docker-compose up -d postgres redis

# Run database migrations
sqlx migrate run --database-url postgresql://sirsi:password@localhost:5432/sirsi_nexus

# Build and run
cargo build --release
cargo run
```

### Production Installation
```bash
# Create system user
sudo useradd -r -s /bin/false sirsi-nexus

# Create directories
sudo mkdir -p /opt/sirsi-nexus/{bin,config,logs,data}
sudo chown -R sirsi-nexus:sirsi-nexus /opt/sirsi-nexus

# Copy binary
sudo cp target/release/sirsi-core /opt/sirsi-nexus/bin/

# Set permissions
sudo chmod +x /opt/sirsi-nexus/bin/sirsi-core
```

## Deployment

### Docker Deployment
```yaml
# docker-compose.yml
version: '3.8'

services:
  sirsi-core:
    image: sirsi/core-engine:latest
    ports:
      - "8080:8080"
      - "50051:50051"
    environment:
      - DATABASE_URL=postgresql://sirsi:password@postgres:5432/sirsi_nexus
      - REDIS_URL=redis://redis:6379
      - RUST_LOG=info
    depends_on:
      - postgres
      - redis
    volumes:
      - ./config:/app/config
      - ./logs:/app/logs
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=sirsi_nexus
      - POSTGRES_USER=sirsi
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Kubernetes Deployment
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sirsi-core
  namespace: sirsi-nexus
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sirsi-core
  template:
    metadata:
      labels:
        app: sirsi-core
    spec:
      containers:
      - name: sirsi-core
        image: sirsi/core-engine:latest
        ports:
        - containerPort: 8080
        - containerPort: 50051
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: sirsi-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: sirsi-config
              key: redis-url
        - name: RUST_LOG
          value: "info"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: sirsi-core-service
  namespace: sirsi-nexus
spec:
  selector:
    app: sirsi-core
  ports:
  - name: http
    port: 8080
    targetPort: 8080
  - name: grpc
    port: 50051
    targetPort: 50051
  type: ClusterIP
```

### Helm Chart
```yaml
# values.yaml
image:
  repository: sirsi/core-engine
  tag: latest
  pullPolicy: IfNotPresent

replicaCount: 3

service:
  type: ClusterIP
  httpPort: 8080
  grpcPort: 50051

ingress:
  enabled: true
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
  hosts:
    - host: api.sirsinexus.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: sirsi-tls
      hosts:
        - api.sirsinexus.com

database:
  type: postgres
  host: postgres-service.database.svc.cluster.local
  port: 5432
  name: sirsi_nexus
  user: sirsi
  passwordSecret: sirsi-db-secret

redis:
  host: redis.cache.svc.cluster.local
  port: 6379

monitoring:
  enabled: true
  prometheus:
    enabled: true
    port: 9090
  grafana:
    enabled: true
    port: 3000

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80
```

## Configuration

### Environment Variables
```bash
# Core Settings
SIRSI_BIND_ADDRESS=0.0.0.0:8080
SIRSI_GRPC_ADDRESS=0.0.0.0:50051
SIRSI_WORKERS=4

# Database Configuration
DATABASE_URL=postgresql://sirsi:password@localhost:5432/sirsi_nexus
DATABASE_MAX_CONNECTIONS=20
DATABASE_MIN_CONNECTIONS=5

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_MAX_CONNECTIONS=10

# Logging
RUST_LOG=info
SIRSI_LOG_LEVEL=info
SIRSI_LOG_FORMAT=json

# Security
JWT_SECRET=your-jwt-secret-here
API_KEY_SECRET=your-api-key-secret-here
ENCRYPTION_KEY=your-encryption-key-here

# Cloud Provider Credentials
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1

AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_TENANT_ID=your-azure-tenant-id
AZURE_SUBSCRIPTION_ID=your-azure-subscription-id

GCP_PROJECT_ID=your-gcp-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Metrics and Monitoring
PROMETHEUS_ENDPOINT=http://prometheus:9090
GRAFANA_ENDPOINT=http://grafana:3000
JAEGER_ENDPOINT=http://jaeger:14268
```

### Configuration File
```yaml
# config/sirsi.yml
server:
  bind_address: "0.0.0.0:8080"
  grpc_address: "0.0.0.0:50051"
  workers: 4
  timeout: 30s
  max_payload_size: 10MB

database:
  url: "postgresql://sirsi:password@localhost:5432/sirsi_nexus"
  max_connections: 20
  min_connections: 5
  connection_timeout: 30s
  idle_timeout: 600s

redis:
  url: "redis://localhost:6379"
  max_connections: 10
  connection_timeout: 5s
  command_timeout: 10s

logging:
  level: "info"
  format: "json"
  output: "stdout"
  file: "/var/log/sirsi-nexus/sirsi.log"

security:
  jwt_secret: "your-jwt-secret-here"
  jwt_expiration: 3600
  api_key_secret: "your-api-key-secret-here"
  encryption_key: "your-encryption-key-here"
  rate_limit:
    requests_per_minute: 100
    burst_size: 20

cloud_providers:
  aws:
    regions:
      - us-east-1
      - us-west-2
      - eu-west-1
    max_concurrent_requests: 50
    retry_attempts: 3
    retry_delay: 1s

  azure:
    subscription_id: "your-azure-subscription-id"
    max_concurrent_requests: 50
    retry_attempts: 3
    retry_delay: 1s

  gcp:
    project_id: "your-gcp-project-id"
    max_concurrent_requests: 50
    retry_attempts: 3
    retry_delay: 1s

metrics:
  enabled: true
  prometheus:
    endpoint: "http://prometheus:9090"
    push_interval: 30s
  grafana:
    endpoint: "http://grafana:3000"
  jaeger:
    endpoint: "http://jaeger:14268"
    sampling_rate: 0.1

task_scheduler:
  max_concurrent_tasks: 100
  task_timeout: 300s
  retry_attempts: 3
  retry_delay: 10s
  cleanup_interval: 3600s

agent_manager:
  max_agents: 50
  agent_timeout: 600s
  heartbeat_interval: 30s
  cleanup_interval: 300s
```

## Monitoring & Observability

### Prometheus Metrics
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'sirsi-core'
    static_configs:
      - targets: ['sirsi-core:9090']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'sirsi-agents'
    static_configs:
      - targets: ['sirsi-core:9091']
    metrics_path: '/agent-metrics'
    scrape_interval: 30s
```

### Grafana Dashboards
```json
{
  "dashboard": {
    "title": "SirsiNexus Core Engine",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(sirsi_http_requests_total[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(sirsi_http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Active Agents",
        "type": "singlestat",
        "targets": [
          {
            "expr": "sirsi_active_agents",
            "legendFormat": "Active Agents"
          }
        ]
      },
      {
        "title": "Task Queue Length",
        "type": "graph",
        "targets": [
          {
            "expr": "sirsi_task_queue_length",
            "legendFormat": "Queue Length"
          }
        ]
      }
    ]
  }
}
```

### Log Configuration
```yaml
# fluentd configuration
<source>
  @type tail
  path /var/log/sirsi-nexus/*.log
  pos_file /var/log/fluentd/sirsi-nexus.log.pos
  tag sirsi.core
  format json
  time_format %Y-%m-%dT%H:%M:%S.%NZ
</source>

<filter sirsi.core>
  @type record_transformer
  <record>
    hostname ${hostname}
    service sirsi-core
  </record>
</filter>

<match sirsi.core>
  @type elasticsearch
  host elasticsearch
  port 9200
  index_name sirsi-logs
  type_name _doc
</match>
```

### Health Checks
```rust
// Health check endpoints
#[get("/health")]
pub async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(json!({
        "status": "healthy",
        "timestamp": Utc::now(),
        "version": env!("CARGO_PKG_VERSION")
    }))
}

#[get("/ready")]
pub async fn readiness_check(
    db: web::Data<Pool<Postgres>>,
    redis: web::Data<Redis>,
) -> impl Responder {
    // Check database connection
    if db.acquire().await.is_err() {
        return HttpResponse::ServiceUnavailable().json(json!({
            "status": "not ready",
            "reason": "database connection failed"
        }));
    }

    // Check Redis connection
    if redis.ping().await.is_err() {
        return HttpResponse::ServiceUnavailable().json(json!({
            "status": "not ready",
            "reason": "redis connection failed"
        }));
    }

    HttpResponse::Ok().json(json!({
        "status": "ready",
        "timestamp": Utc::now()
    }))
}
```

## Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database connectivity
telnet localhost 5432

# Check database logs
docker logs postgres-container

# Test connection with psql
psql -h localhost -U sirsi -d sirsi_nexus -c "SELECT 1;"

# Check connection pool status
curl http://localhost:8080/metrics | grep db_connections
```

#### Redis Connection Issues
```bash
# Check Redis connectivity
redis-cli ping

# Check Redis logs
docker logs redis-container

# Monitor Redis commands
redis-cli monitor

# Check Redis memory usage
redis-cli info memory
```

#### High Memory Usage
```bash
# Check memory usage
free -h
ps aux | grep sirsi-core

# Check for memory leaks
valgrind --tool=memcheck --leak-check=full ./target/release/sirsi-core

# Monitor memory metrics
curl http://localhost:8080/metrics | grep memory
```

#### gRPC Connection Issues
```bash
# Test gRPC connectivity
grpcurl -plaintext localhost:50051 list

# Check gRPC service methods
grpcurl -plaintext localhost:50051 list sirsi.AgentService

# Test specific gRPC method
grpcurl -plaintext \
  -d '{"name": "test-agent", "agent_type": "aws"}' \
  localhost:50051 sirsi.AgentService/CreateAgent
```

### Debugging Commands
```bash
# Check service status
systemctl status sirsi-nexus

# View logs
journalctl -u sirsi-nexus -f

# Check network connections
netstat -tlnp | grep sirsi

# Monitor system resources
top -p $(pgrep sirsi-core)

# Check file descriptors
lsof -p $(pgrep sirsi-core)

# Trace system calls
strace -p $(pgrep sirsi-core)
```

### Performance Debugging
```bash
# Profile CPU usage
perf record -p $(pgrep sirsi-core) -g sleep 30
perf report

# Monitor I/O operations
iotop -p $(pgrep sirsi-core)

# Check database query performance
docker exec postgres-container psql -U sirsi -d sirsi_nexus -c "
SELECT query, calls, mean_time, total_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;"
```

## Maintenance

### Database Maintenance
```bash
# Backup database
pg_dump -h localhost -U sirsi sirsi_nexus > backup_$(date +%Y%m%d).sql

# Restore database
psql -h localhost -U sirsi sirsi_nexus < backup_20240115.sql

# Run migrations
sqlx migrate run --database-url postgresql://sirsi:password@localhost:5432/sirsi_nexus

# Check database size
docker exec postgres-container psql -U sirsi -d sirsi_nexus -c "
SELECT pg_size_pretty(pg_database_size('sirsi_nexus'));"

# Vacuum and analyze
docker exec postgres-container psql -U sirsi -d sirsi_nexus -c "
VACUUM ANALYZE;"
```

### Log Rotation
```bash
# Configure logrotate
cat > /etc/logrotate.d/sirsi-nexus << 'EOF'
/var/log/sirsi-nexus/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 sirsi-nexus sirsi-nexus
    postrotate
        systemctl reload sirsi-nexus
    endscript
}
EOF
```

### Certificate Management
```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Update certificate
cp new-cert.pem /opt/sirsi-nexus/config/
cp new-key.pem /opt/sirsi-nexus/config/
systemctl reload sirsi-nexus

# Check certificate expiration
openssl x509 -in cert.pem -text -noout | grep "Not After"
```

### Resource Cleanup
```bash
# Clean up old task records
docker exec postgres-container psql -U sirsi -d sirsi_nexus -c "
DELETE FROM tasks WHERE created_at < NOW() - INTERVAL '30 days';"

# Clean up old log files
find /var/log/sirsi-nexus -name "*.log" -mtime +30 -delete

# Clean up Docker images
docker image prune -a -f

# Clean up unused volumes
docker volume prune -f
```

## Security Operations

### Security Scanning
```bash
# Scan for vulnerabilities
cargo audit

# Check for secrets in code
git-secrets --scan

# Run security linting
cargo clippy -- -D warnings

# Check dependencies
cargo outdated
```

### Access Control
```bash
# Rotate JWT secret
kubectl patch secret sirsi-secrets -p '{"data":{"jwt-secret":"'$(echo -n "new-secret" | base64)'"}}'

# Update API keys
kubectl patch configmap sirsi-config -p '{"data":{"api-keys":"'$(base64 -w 0 < new-api-keys.json)'"}}'

# Review access logs
grep "authentication" /var/log/sirsi-nexus/sirsi.log | tail -100
```

### Network Security
```bash
# Check firewall rules
ufw status verbose

# Monitor network connections
netstat -tlnp | grep :8080
netstat -tlnp | grep :50051

# Check SSL/TLS configuration
nmap --script ssl-enum-ciphers -p 8080 localhost
```

## Disaster Recovery

### Backup Strategy
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups/sirsi-nexus"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup database
pg_dump -h localhost -U sirsi sirsi_nexus | gzip > "$BACKUP_DIR/database_$DATE.sql.gz"

# Backup Redis data
redis-cli --rdb "$BACKUP_DIR/redis_$DATE.rdb"

# Backup configuration
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" /opt/sirsi-nexus/config/

# Backup logs
tar -czf "$BACKUP_DIR/logs_$DATE.tar.gz" /var/log/sirsi-nexus/

# Upload to S3
aws s3 cp "$BACKUP_DIR/" s3://sirsi-backups/$(date +%Y/%m/%d)/ --recursive

# Clean up old backups
find "$BACKUP_DIR" -name "*.gz" -mtime +7 -delete
find "$BACKUP_DIR" -name "*.rdb" -mtime +7 -delete
```

### Recovery Procedures
```bash
#!/bin/bash
# recovery.sh

BACKUP_FILE=$1
RECOVERY_DIR="/opt/recovery/sirsi-nexus"

# Create recovery directory
mkdir -p "$RECOVERY_DIR"

# Stop services
systemctl stop sirsi-nexus

# Restore database
gunzip -c "$BACKUP_FILE" | psql -h localhost -U sirsi sirsi_nexus

# Restore Redis data
redis-cli shutdown
cp redis_backup.rdb /var/lib/redis/dump.rdb
systemctl start redis

# Restore configuration
tar -xzf config_backup.tar.gz -C /

# Start services
systemctl start sirsi-nexus

# Verify recovery
curl http://localhost:8080/health
```

## Performance Tuning

### Database Optimization
```sql
-- Configure PostgreSQL
-- postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200

-- Add indexes
CREATE INDEX CONCURRENTLY idx_tasks_status ON tasks(status);
CREATE INDEX CONCURRENTLY idx_tasks_created_at ON tasks(created_at);
CREATE INDEX CONCURRENTLY idx_agents_type ON agents(agent_type);
CREATE INDEX CONCURRENTLY idx_sessions_created_at ON sessions(created_at);
```

### Redis Optimization
```bash
# redis.conf
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
tcp-keepalive 300
timeout 300
```

### Application Tuning
```yaml
# Increase worker threads
SIRSI_WORKERS=8

# Adjust database pool
DATABASE_MAX_CONNECTIONS=50
DATABASE_MIN_CONNECTIONS=10

# Optimize Redis connections
REDIS_MAX_CONNECTIONS=20

# Enable compression
SIRSI_ENABLE_COMPRESSION=true

# Adjust timeouts
SIRSI_REQUEST_TIMEOUT=30
SIRSI_TASK_TIMEOUT=600
```

## Scaling

### Horizontal Scaling
```yaml
# HPA configuration
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: sirsi-core-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: sirsi-core
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Vertical Scaling
```yaml
# Increase resource limits
resources:
  requests:
    memory: "1Gi"
    cpu: "500m"
  limits:
    memory: "2Gi"
    cpu: "1000m"
```

### Load Balancing
```yaml
# nginx.conf
upstream sirsi_backend {
    least_conn;
    server sirsi-core-1:8080;
    server sirsi-core-2:8080;
    server sirsi-core-3:8080;
}

server {
    listen 80;
    location / {
        proxy_pass http://sirsi_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Database Scaling
```bash
# Read replicas
DATABASE_READ_URL=postgresql://sirsi:password@postgres-read:5432/sirsi_nexus
DATABASE_WRITE_URL=postgresql://sirsi:password@postgres-write:5432/sirsi_nexus

# Connection pooling
DATABASE_MAX_CONNECTIONS=100
DATABASE_POOL_SIZE=20
```

This comprehensive operations guide provides all the necessary information for successfully deploying, monitoring, and maintaining the SirsiNexus platform in production environments.
