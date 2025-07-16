# Compute Manager

The Compute Manager is a core component of ClusterDB that provides unified management of compute resources across multiple cloud providers.

## Overview

The Compute Manager abstracts cloud provider-specific details and provides a consistent interface for:

- Fleet management
- Instance lifecycle management
- Serverless function management
- Auto-scaling configuration
- Resource optimization

## Features

### Multi-Cloud Support

- AWS EC2 and Lambda
- Google Compute Engine and Cloud Functions
- Azure VMs and Functions
- Custom provider implementation support

### Fleet Management

```rust
// Create a new fleet
let fleet_config = FleetConfig::new(
    "web-fleet",
    "Web Application Fleet",
)
.with_capacity(5)
.with_instance_type("t3.medium")
.with_tags(tags);

let fleet = compute.create_fleet(fleet_config).await?;
```

### Instance Management

```rust
// Start an instance
compute.start_instance("i-1234567890").await?;

// Stop an instance
compute.stop_instance("i-1234567890").await?;

// Terminate an instance
compute.terminate_instance("i-1234567890").await?;
```

### Serverless Functions

```rust
// Deploy a function
let function_config = FunctionConfig {
    name: "process-image",
    runtime: "python3.9",
    handler: "main.handler",
    memory_mb: 256,
    timeout_sec: 30,
    environment: env_vars,
};

let function = compute.create_function(function_config).await?;
```

### Auto-scaling

```rust
// Configure auto-scaling
let scaling_config = AutoScalingConfig {
    min_capacity: 1,
    max_capacity: 10,
    target_cpu_utilization: 70.0,
    cooldown_seconds: 300,
};

compute.configure_auto_scaling(scaling_config).await?;
```

## Architecture

The Compute Manager follows a provider-based architecture:

```plaintext
+------------------+
|  Compute Manager |
+------------------+
         |
+------------------+
| Provider Interface|
+------------------+
         |
+------------------+     +------------------+     +------------------+
|    AWS Provider  |     |   GCP Provider   |     |  Azure Provider  |
+------------------+     +------------------+     +------------------+
```

### Components

1. **Provider Interface**: Defines the standard operations for compute management
2. **Provider Implementations**: Cloud-specific implementations
3. **Resource Models**: Common resource definitions
4. **Operation Handlers**: Business logic for resource operations

## Configuration

### Provider Configuration

```yaml
compute:
  default_provider: aws
  providers:
    aws:
      region: us-west-2
      credentials:
        access_key: ${AWS_ACCESS_KEY}
        secret_key: ${AWS_SECRET_KEY}
    gcp:
      project_id: my-project
      credentials_file: /path/to/credentials.json
    azure:
      subscription_id: ${AZURE_SUBSCRIPTION_ID}
      tenant_id: ${AZURE_TENANT_ID}
```

### Fleet Configuration

```yaml
fleet:
  default_instance_type: t3.medium
  default_capacity: 3
  tags:
    environment: production
    managed-by: clusterdb
  networking:
    vpc_id: vpc-1234567
    subnet_ids:
      - subnet-1234567
      - subnet-7654321
```

## API Reference

### REST API

#### Fleet Management

- `POST /api/v1/fleets` - Create a new fleet
- `GET /api/v1/fleets` - List all fleets
- `GET /api/v1/fleets/{id}` - Get fleet details
- `PUT /api/v1/fleets/{id}` - Update fleet configuration
- `DELETE /api/v1/fleets/{id}` - Delete a fleet

#### Instance Management

- `POST /api/v1/instances` - Create a new instance
- `GET /api/v1/instances` - List all instances
- `GET /api/v1/instances/{id}` - Get instance details
- `POST /api/v1/instances/{id}/start` - Start an instance
- `POST /api/v1/instances/{id}/stop` - Stop an instance
- `DELETE /api/v1/instances/{id}` - Terminate an instance

#### Function Management

- `POST /api/v1/functions` - Create a new function
- `GET /api/v1/functions` - List all functions
- `GET /api/v1/functions/{id}` - Get function details
- `PUT /api/v1/functions/{id}` - Update function configuration
- `DELETE /api/v1/functions/{id}` - Delete a function
- `POST /api/v1/functions/{id}/invoke` - Invoke a function

### Rust API

```rust
#[async_trait]
pub trait ComputeProvider {
    async fn create_fleet(&self, config: FleetConfig) -> ComputeResult<Fleet>;
    async fn update_fleet(&self, config: FleetConfig) -> ComputeResult<Fleet>;
    async fn delete_fleet(&self, id: &str) -> ComputeResult<()>;
    async fn get_fleet(&self, id: &str) -> ComputeResult<Fleet>;
    async fn list_fleets(&self) -> ComputeResult<Vec<Fleet>>;
    
    async fn start_instance(&self, id: &str) -> ComputeResult<()>;
    async fn stop_instance(&self, id: &str) -> ComputeResult<()>;
    async fn terminate_instance(&self, id: &str) -> ComputeResult<()>;
    
    async fn create_function(&self, config: FunctionConfig) -> ComputeResult<Function>;
    async fn update_function(&self, config: FunctionConfig) -> ComputeResult<Function>;
    async fn delete_function(&self, id: &str) -> ComputeResult<()>;
    async fn invoke_function(&self, id: &str, payload: Vec<u8>) -> ComputeResult<Vec<u8>>;
}
```

## Best Practices

1. **Resource Tagging**
   - Always tag resources with appropriate metadata
   - Include environment, owner, and purpose tags
   - Use consistent tagging schemes across providers

2. **Security**
   - Use IAM roles and service accounts
   - Implement least privilege access
   - Regularly rotate credentials
   - Enable encryption for sensitive data

3. **Cost Optimization**
   - Use auto-scaling to match demand
   - Implement instance scheduling
   - Monitor and optimize resource usage
   - Use spot/preemptible instances where appropriate

4. **High Availability**
   - Distribute resources across availability zones
   - Implement proper health checks
   - Use load balancing
   - Configure automated failover

5. **Monitoring**
   - Set up comprehensive metrics collection
   - Configure appropriate alerts
   - Monitor costs and usage
   - Track performance metrics

## Troubleshooting

### Common Issues

1. **Provider Authentication Failures**
   ```
   Error: Failed to authenticate with provider
   Cause: Invalid or expired credentials
   Solution: Verify and update provider credentials
   ```

2. **Resource Limits**
   ```
   Error: Failed to create instance
   Cause: Resource quota exceeded
   Solution: Request quota increase or cleanup unused resources
   ```

3. **Network Connectivity**
   ```
   Error: Failed to connect to instance
   Cause: Security group/firewall rules
   Solution: Verify network configuration and rules
   ```

### Debugging

1. Enable debug logging:
   ```rust
   RUST_LOG=debug cargo run
   ```

2. Check provider status:
   ```bash
   clusterdb compute status --provider aws
   ```

3. Verify network connectivity:
   ```bash
   clusterdb compute diagnose-network --fleet-id <id>
   ```

## Examples

### Basic Fleet Management

```rust
use clusterdb::compute::{ComputeManager, FleetConfig};

#[tokio::main]
async fn main() -> Result<()> {
    let compute = ComputeManager::new(config)?;
    
    // Create a fleet
    let fleet = compute.create_fleet(FleetConfig {
        name: "web-fleet".to_string(),
        capacity: 3,
        instance_type: "t3.medium".to_string(),
        ..Default::default()
    }).await?;
    
    // Scale the fleet
    compute.update_fleet_capacity(&fleet.id, 5).await?;
    
    // Delete the fleet
    compute.delete_fleet(&fleet.id).await?;
}
```

### Serverless Function Deployment

```rust
use clusterdb::compute::{ComputeManager, FunctionConfig};

#[tokio::main]
async fn main() -> Result<()> {
    let compute = ComputeManager::new(config)?;
    
    // Deploy function
    let function = compute.create_function(FunctionConfig {
        name: "process-image".to_string(),
        runtime: "python3.9".to_string(),
        handler: "main.handler".to_string(),
        code: include_bytes!("function.zip").to_vec(),
        memory_mb: 256,
        timeout_sec: 30,
        environment: env_vars,
    }).await?;
    
    // Invoke function
    let result = compute.invoke_function(
        &function.id,
        serde_json::to_vec(&payload)?,
    ).await?;
}
```

## Integration

### Service Mesh Integration

```rust
use clusterdb::{compute::ComputeManager, mesh::ServiceMesh};

// Register compute resources with service mesh
let mesh = ServiceMesh::new(config)?;
mesh.register_compute_resources(&compute).await?;
```

### Monitoring Integration

```rust
use clusterdb::{compute::ComputeManager, monitoring::Monitor};

// Configure compute metrics collection
let monitor = Monitor::new(config)?;
monitor.configure_compute_metrics(&compute).await?;
```

## Migration

### Cross-Provider Migration

```rust
use clusterdb::compute::{ComputeManager, MigrationConfig};

// Migrate fleet between providers
let migration = compute.create_migration(MigrationConfig {
    source_fleet: "fleet-1",
    target_provider: "gcp",
    strategy: MigrationStrategy::Rolling,
}).await?;
```

## Upgrade Guide

1. Backup current configuration
2. Update ClusterDB to latest version
3. Apply provider-specific updates
4. Validate compute operations
5. Update dependent services

## Support

For issues and support:
- GitHub Issues: [ClusterDB Issues](https://github.com/clusterdb/clusterdb/issues)
- Documentation: [ClusterDB Docs](https://docs.clusterdb.io)
- Community: [ClusterDB Slack](https://slack.clusterdb.io)
