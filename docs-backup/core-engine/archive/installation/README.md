# ClusterDB Installation Guide

This guide provides detailed instructions for installing and configuring ClusterDB in various environments.

## Prerequisites

### System Requirements

- CPU: 4 cores (minimum), 8 cores (recommended)
- Memory: 8GB (minimum), 16GB (recommended)
- Storage: 20GB (minimum), 50GB (recommended)
- Network: Reliable internet connection

### Software Requirements

- Rust 1.65 or later
- Docker 20.10 or later
- Kubernetes 1.22 or later
- Helm 3.0 or later

### Cloud Provider Access

- AWS credentials with appropriate permissions
- GCP service account with required roles
- Azure service principal with necessary permissions

## Installation Methods

### 1. Using Package Manager

```bash
# Install ClusterDB CLI
curl -fsSL https://get.clusterdb.io | sh

# Verify installation
clusterdb version
```

### 2. From Source

```bash
# Clone repository
git clone https://github.com/clusterdb/clusterdb.git
cd clusterdb

# Build from source
cargo build --release

# Install binary
sudo cp target/release/clusterdb /usr/local/bin/
```

### 3. Using Docker

```bash
# Pull Docker image
docker pull clusterdb/clusterdb:latest

# Run ClusterDB
docker run -d \
  --name clusterdb \
  -p 8080:8080 \
  -v ~/.clusterdb:/etc/clusterdb \
  clusterdb/clusterdb:latest
```

### 4. Using Helm (Kubernetes)

```bash
# Add ClusterDB Helm repository
helm repo add clusterdb https://charts.clusterdb.io
helm repo update

# Install ClusterDB
helm install clusterdb clusterdb/clusterdb \
  --namespace clusterdb \
  --create-namespace \
  --values values.yaml
```

## Configuration

### 1. Basic Configuration

```yaml
# ~/.clusterdb/config.yaml
api:
  host: 0.0.0.0
  port: 8080
  tls:
    enabled: true
    cert_file: /etc/clusterdb/tls/cert.pem
    key_file: /etc/clusterdb/tls/key.pem

storage:
  type: postgresql
  url: postgresql://user:pass@localhost:5432/clusterdb

telemetry:
  enabled: true
  endpoint: http://prometheus:9090
```

### 2. Cloud Provider Configuration

```yaml
# ~/.clusterdb/providers.yaml
providers:
  aws:
    enabled: true
    region: us-west-2
    credentials:
      access_key: ${AWS_ACCESS_KEY}
      secret_key: ${AWS_SECRET_KEY}
  
  gcp:
    enabled: true
    project_id: my-project
    credentials_file: /etc/clusterdb/gcp-credentials.json
  
  azure:
    enabled: true
    subscription_id: ${AZURE_SUBSCRIPTION_ID}
    tenant_id: ${AZURE_TENANT_ID}
    client_id: ${AZURE_CLIENT_ID}
    client_secret: ${AZURE_CLIENT_SECRET}
```

### 3. Security Configuration

```yaml
# ~/.clusterdb/security.yaml
security:
  authentication:
    type: oidc
    issuer: https://auth.example.com
    client_id: ${OIDC_CLIENT_ID}
    client_secret: ${OIDC_CLIENT_SECRET}
  
  authorization:
    type: rbac
    default_role: viewer
    policy_file: /etc/clusterdb/rbac.yaml
  
  encryption:
    enabled: true
    key_file: /etc/clusterdb/encryption.key
```

## Post-Installation

### 1. Verify Installation

```bash
# Check ClusterDB status
clusterdb status

# Verify component health
clusterdb health check

# Test cloud provider connections
clusterdb provider test --all
```

### 2. Initialize Database

```bash
# Initialize database schema
clusterdb database init

# Run migrations
clusterdb database migrate
```

### 3. Create Initial Admin User

```bash
# Create admin user
clusterdb user create \
  --username admin \
  --role admin \
  --email admin@example.com
```

## Security Hardening

### 1. TLS Configuration

```bash
# Generate self-signed certificates
clusterdb cert generate \
  --common-name clusterdb.example.com \
  --days 365

# Configure TLS
clusterdb config set \
  --tls.enabled=true \
  --tls.cert-file=/etc/clusterdb/tls/cert.pem \
  --tls.key-file=/etc/clusterdb/tls/key.pem
```

### 2. Authentication Setup

```bash
# Configure OIDC
clusterdb auth configure \
  --type=oidc \
  --issuer=https://auth.example.com \
  --client-id=${OIDC_CLIENT_ID} \
  --client-secret=${OIDC_CLIENT_SECRET}
```

### 3. RBAC Configuration

```bash
# Configure RBAC roles
clusterdb rbac apply -f rbac.yaml

# Verify RBAC configuration
clusterdb rbac verify
```

## Upgrading

### 1. Backup Existing Installation

```bash
# Backup configuration
clusterdb backup config --output backup.tar.gz

# Backup database
clusterdb backup database --output db-backup.sql
```

### 2. Perform Upgrade

```bash
# Upgrade ClusterDB
clusterdb upgrade --version latest

# Apply migrations
clusterdb database migrate
```

### 3. Verify Upgrade

```bash
# Verify installation
clusterdb verify upgrade

# Check component versions
clusterdb version --all
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```
   Error: Failed to connect to database
   Cause: Invalid credentials or network issues
   Solution: Verify database configuration and connectivity
   ```

2. **Cloud Provider Authentication**
   ```
   Error: Failed to authenticate with cloud provider
   Cause: Invalid or expired credentials
   Solution: Update provider credentials
   ```

3. **Permission Issues**
   ```
   Error: Permission denied
   Cause: Insufficient file permissions
   Solution: Check and update file permissions
   ```

### Logs

```bash
# View ClusterDB logs
clusterdb logs

# View specific component logs
clusterdb logs --component compute-manager

# Enable debug logging
clusterdb logs --level debug
```

## Next Steps

1. [Quick Start Guide](../quickstart/README.md)
2. [Configuration Guide](../configuration/README.md)
3. [Security Best Practices](../security/README.md)
4. [API Documentation](../api/README.md)

## Support

- [Installation Issues](https://github.com/clusterdb/clusterdb/issues)
- [Documentation](https://docs.clusterdb.io)
- [Community Support](https://slack.clusterdb.io)
