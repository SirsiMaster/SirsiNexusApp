# Compute

The Compute component provides comprehensive compute resource management capabilities including cluster management, container orchestration, and resource optimization.

## Overview

The Compute component provides:
- Container orchestration
- Resource scheduling
- Cluster management
- Auto-scaling
- Node lifecycle management
- Resource optimization

## Features

### Cluster Management

```rust
// Create compute cluster
let cluster = ComputeCluster {
    name: "production",
    provider: Provider::AWS,
    region: "us-west-2",
    network: NetworkConfig {
        vpc: "vpc-123",
        subnets: vec!["subnet-1", "subnet-2"],
        security_groups: vec!["sg-123"],
    },
    node_pools: vec![
        NodePool {
            name: "general-purpose",
            instance_type: "c5.xlarge",
            min_size: 3,
            max_size: 10,
            labels: HashMap::from([
                ("pool", "general"),
                ("tier", "standard"),
            ]),
            taints: vec![
                Taint {
                    key: "dedicated",
                    value: "gpu",
                    effect: TaintEffect::NoSchedule,
                },
            ],
        },
        NodePool {
            name: "gpu-compute",
            instance_type: "p3.2xlarge",
            min_size: 1,
            max_size: 5,
            labels: HashMap::from([
                ("pool", "gpu"),
                ("tier", "premium"),
            ]),
            spot: Some(SpotConfig {
                enabled: true,
                max_price: Some(2.0),
            }),
        },
    ],
    auto_scaling: AutoScalingConfig {
        enabled: true,
        min_nodes: 4,
        max_nodes: 15,
        target_cpu_utilization: 70,
        scale_down_delay: Duration::from_minutes(10),
    },
    logging: LoggingConfig {
        level: LogLevel::Info,
        destinations: vec![
            LogDestination::CloudWatch {
                group: "cluster-logs",
                retention_days: 30,
            },
        ],
    },
};

compute.create_cluster(cluster).await?;

// Configure cluster updates
let update_config = UpdateConfig {
    max_unavailable: 1,
    max_surge: 1,
    drain_timeout: Duration::from_minutes(5),
    pod_eviction_timeout: Duration::from_minutes(2),
    node_drain_grace_period: Duration::from_minutes(3),
};

compute.configure_updates("production", update_config).await?;
```

### Container Orchestration

```rust
// Create deployment
let deployment = Deployment {
    name: "web-app",
    namespace: "production",
    replicas: 3,
    strategy: DeploymentStrategy::RollingUpdate {
        max_surge: 1,
        max_unavailable: 0,
    },
    selector: LabelSelector {
        match_labels: HashMap::from([
            ("app", "web"),
            ("env", "prod"),
        ]),
    },
    template: PodTemplate {
        metadata: Metadata {
            labels: HashMap::from([
                ("app", "web"),
                ("env", "prod"),
            ]),
        },
        spec: PodSpec {
            containers: vec![
                Container {
                    name: "web",
                    image: "web-app:1.0",
                    ports: vec![
                        Port {
                            name: "http",
                            container_port: 8080,
                            protocol: Protocol::TCP,
                        },
                    ],
                    resources: ResourceRequirements {
                        requests: Resources {
                            cpu: Quantity::new(0.5),
                            memory: Quantity::mb(512),
                        },
                        limits: Resources {
                            cpu: Quantity::new(1.0),
                            memory: Quantity::gb(1),
                        },
                    },
                    health_check: HealthCheck {
                        http: Some(HttpCheck {
                            path: "/health",
                            port: 8080,
                            initial_delay: Duration::from_secs(5),
                            period: Duration::from_secs(10),
                        }),
                        readiness: Some(HttpCheck {
                            path: "/ready",
                            port: 8080,
                            initial_delay: Duration::from_secs(2),
                            period: Duration::from_secs(5),
                        }),
                    },
                    environment: vec![
                        EnvVar {
                            name: "DATABASE_URL",
                            value: Some("postgres://db:5432"),
                            secret: None,
                        },
                    ],
                },
            ],
            volumes: vec![
                Volume {
                    name: "config",
                    config_map: Some("app-config"),
                    secret: None,
                },
            ],
            node_selector: HashMap::from([
                ("pool", "general"),
            ]),
            affinity: Some(Affinity {
                node_affinity: Some(NodeAffinity {
                    required: vec![
                        NodeSelectorTerm {
                            match_expressions: vec![
                                NodeSelectorRequirement {
                                    key: "tier",
                                    operator: "In",
                                    values: vec!["standard"],
                                },
                            ],
                        },
                    ],
                }),
                pod_anti_affinity: Some(PodAntiAffinity {
                    required: vec![
                        PodAffinityTerm {
                            topology_key: "kubernetes.io/hostname",
                            label_selector: LabelSelector {
                                match_labels: HashMap::from([
                                    ("app", "web"),
                                ]),
                            },
                        },
                    ],
                }),
            }),
        },
    },
};

compute.create_deployment(deployment).await?;
```

### Resource Optimization

```rust
// Configure resource optimization
let optimizer = ResourceOptimizer {
    name: "cluster-optimizer",
    targets: vec![
        OptimizationTarget::CPU {
            threshold: 70,
            window: Duration::from_minutes(15),
        },
        OptimizationTarget::Memory {
            threshold: 80,
            window: Duration::from_minutes(15),
        },
    ],
    rules: vec![
        OptimizationRule {
            name: "right-size-pods",
            action: OptimizationAction::AdjustResources {
                min_adjustment: 0.1,
                max_adjustment: 0.5,
                cooldown: Duration::from_hours(24),
            },
        },
        OptimizationRule {
            name: "balance-nodes",
            action: OptimizationAction::Rebalance {
                threshold: 0.2,
                max_pods_to_move: 5,
            },
        },
    ],
    schedule: Schedule::Cron("0 * * * *"), // Every hour
};

compute.configure_optimizer(optimizer).await?;

// Configure cost optimization
let cost_config = CostOptimizationConfig {
    enabled: true,
    targets: vec![
        CostTarget::SpotInstances {
            target_percentage: 70,
            max_price_multiplier: 1.5,
        },
        CostTarget::ResourceUtilization {
            min_utilization: 60,
            action: ResourceAction::Consolidate,
        },
    ],
    budget: Budget {
        monthly_limit: 10000,
        alerts: vec![
            BudgetAlert {
                threshold_percentage: 80,
                notification: Notification::Email {
                    recipients: vec!["ops@example.com"],
                },
            },
        ],
    },
};

compute.configure_cost_optimization(cost_config).await?;
```

## Architecture

```plaintext
+------------------+
|     Compute      |
+------------------+
         |
+------------------+     +------------------+     +------------------+
| Cluster Manager  |     | Resource Manager |     | Node Manager    |
+------------------+     +------------------+     +------------------+
         |                       |                        |
+------------------+     +------------------+     +------------------+
| Container Engine |     | Scheduler        |     | Monitor         |
+------------------+     +------------------+     +------------------+
         |                       |                        |
+------------------+     +------------------+     +------------------+
| Network Plugin   |     | Storage Plugin   |     | Security Plugin |
+------------------+     +------------------+     +------------------+
```

### Components

1. **Cluster Manager**
   - Cluster lifecycle
   - Node pool management
   - Auto-scaling
   - Updates and maintenance

2. **Resource Manager**
   - Resource allocation
   - Quota management
   - Resource optimization
   - Cost optimization

3. **Container Engine**
   - Container lifecycle
   - Image management
   - Runtime configuration
   - Health monitoring

4. **Node Manager**
   - Node provisioning
   - Node health
   - Node maintenance
   - Node recovery

## Configuration

### Cluster Configuration

```yaml
compute:
  cluster:
    name: production
    provider: aws
    region: us-west-2
    
    node_pools:
      - name: general
        instance_type: c5.xlarge
        min_size: 3
        max_size: 10
      - name: gpu
        instance_type: p3.2xlarge
        min_size: 1
        max_size: 5
    
    auto_scaling:
      enabled: true
      min_nodes: 4
      max_nodes: 15
      target_cpu_utilization: 70
```

### Container Configuration

```yaml
containers:
  runtime:
    type: containerd
    version: 1.6
  
  defaults:
    registry: docker.io
    pull_policy: IfNotPresent
    security_context:
      run_as_non_root: true
  
  resources:
    requests:
      cpu: 0.5
      memory: 512Mi
    limits:
      cpu: 1.0
      memory: 1Gi
```

### Resource Configuration

```yaml
resources:
  optimization:
    enabled: true
    targets:
      - type: cpu
        threshold: 70
      - type: memory
        threshold: 80
    
    rules:
      - name: right-size
        action: adjust_resources
      - name: rebalance
        action: rebalance_nodes
```

## API Reference

### Cluster Management

```rust
#[async_trait]
pub trait ClusterManager: Send + Sync {
    async fn create_cluster(&self, cluster: ComputeCluster) -> Result<Cluster>;
    async fn delete_cluster(&self, name: &str) -> Result<()>;
    async fn update_cluster(&self, name: &str, update: ClusterUpdate) -> Result<Cluster>;
    async fn get_cluster(&self, name: &str) -> Result<Cluster>;
    async fn list_clusters(&self) -> Result<Vec<Cluster>>;
}
```

### Container Management

```rust
#[async_trait]
pub trait ContainerManager: Send + Sync {
    async fn create_deployment(&self, deployment: Deployment) -> Result<Deployment>;
    async fn update_deployment(&self, name: &str, update: DeploymentUpdate) -> Result<Deployment>;
    async fn delete_deployment(&self, name: &str) -> Result<()>;
    async fn scale_deployment(&self, name: &str, replicas: i32) -> Result<()>;
}
```

## Best Practices

1. **Cluster Management**
   - Multi-AZ deployment
   - Node pool segregation
   - Regular updates
   - Health monitoring

2. **Resource Management**
   - Proper sizing
   - Resource quotas
   - Cost optimization
   - Utilization monitoring

3. **Container Management**
   - Image security
   - Resource limits
   - Health checks
   - Rolling updates

4. **Operations**
   - Regular backups
   - Disaster recovery
   - Monitoring
   - Log management

## Examples

### Cluster Operations

```rust
use clusterdb::compute::{Compute, ComputeCluster, NodePool};

#[tokio::main]
async fn main() -> Result<()> {
    let compute = Compute::new(config)?;
    
    // Create cluster
    let cluster = ComputeCluster::new("production")
        .with_provider(Provider::AWS)
        .with_region("us-west-2")
        .add_node_pool(NodePool::new("general")
            .with_instance_type("c5.xlarge")
            .with_size_range(3, 10))
        .with_auto_scaling(true);
    
    compute.create_cluster(cluster).await?;
    
    // Monitor cluster
    let status = compute.watch_cluster("production")
        .await
        .filter(|event| event.type_ == "NodeAdded")
        .for_each(|event| {
            println!("Node event: {:?}", event);
        });
}
```

### Container Deployment

```rust
use clusterdb::compute::{Compute, Deployment, Container};

#[tokio::main]
async fn main() -> Result<()> {
    let compute = Compute::new(config)?;
    
    // Create deployment
    let deployment = Deployment::new("web-app")
        .with_replicas(3)
        .with_container(Container::new("web")
            .with_image("web-app:1.0")
            .with_port(8080)
            .with_resources(resources))
        .with_rolling_update(1, 0);
    
    compute.create_deployment(deployment).await?;
    
    // Scale deployment
    compute.scale_deployment("web-app", 5).await?;
}
```

## Integration

### With Monitoring

```rust
use clusterdb::{
    compute::Compute,
    monitoring::{Monitor, MetricsConfig},
};

// Configure compute monitoring
let metrics = MetricsConfig::new()
    .with_metric("node_cpu_usage")
    .with_metric("node_memory_usage")
    .with_metric("pod_resource_usage")
    .with_alerts(AlertConfig {
        cpu_threshold: 80,
        memory_threshold: 85,
    });

compute.configure_monitoring(metrics).await?;
```

### With Storage

```rust
use clusterdb::{
    compute::Compute,
    storage::{Storage, VolumeConfig},
};

// Configure compute storage
let storage = Storage::new(config)?;
let volume = storage.create_volume(VolumeConfig {
    name: "data",
    size_gb: 100,
    type_: VolumeType::SSD,
})?;

let deployment = Deployment::new("stateful-app")
    .with_volume(volume)
    .with_container(container_config);

compute.create_deployment(deployment).await?;
```

## Troubleshooting

### Common Issues

1. **Node Issues**
   ```
   Error: Node not ready
   Cause: Resource exhaustion
   Solution: Check resource usage and scale if needed
   ```

2. **Container Issues**
   ```
   Error: Container crash loop
   Cause: Application error
   Solution: Check container logs and health checks
   ```

3. **Resource Issues**
   ```
   Error: Resource quota exceeded
   Cause: Insufficient resources
   Solution: Adjust quotas or scale cluster
   ```

### Debugging Tools

```bash
# Check node status
compute node status node-123

# View container logs
compute logs deployment/web-app

# Monitor resource usage
compute top nodes
```

## Support

- [Compute Issues](https://github.com/clusterdb/clusterdb/issues)
- [Compute Documentation](https://docs.clusterdb.io/compute)
- [Community Support](https://slack.clusterdb.io)
