# Storage

The Storage component provides comprehensive storage management capabilities including distributed storage, data lifecycle management, and caching.

## Overview

The Storage component provides:
- Distributed storage system
- Data lifecycle management
- Multiple storage backends
- Data replication
- Automatic tiering
- Data encryption
- Snapshot management

## Features

### Volume Management

```rust
// Create storage volume
let volume = Volume {
    name: "data-volume",
    size: ByteSize::gb(100),
    type_: VolumeType::SSD {
        iops: 3000,
        throughput: ByteSize::mb(125),
    },
    encryption: Some(Encryption {
        enabled: true,
        key_id: Some("key-123"),
        provider: EncryptionProvider::KMS,
    }),
    replication: ReplicationConfig {
        mode: ReplicationMode::Synchronous,
        factor: 3,
        zones: vec!["us-west-2a", "us-west-2b", "us-west-2c"],
    },
    snapshot_policy: Some(SnapshotPolicy {
        schedule: "0 0 * * *", // Daily at midnight
        retention: Duration::from_days(7),
        tags: HashMap::from([
            ("type", "daily"),
            ("automated", "true"),
        ]),
    }),
    metadata: HashMap::from([
        ("environment", "production"),
        ("team", "platform"),
    ]),
};

storage.create_volume(volume).await?;

// Create volume from snapshot
let restore = VolumeRestore {
    name: "restored-volume",
    source_snapshot: "snap-123",
    size: ByteSize::gb(200), // Can be larger than source
    type_: VolumeType::SSD {
        iops: 5000,
        throughput: ByteSize::mb(250),
    },
};

storage.restore_volume(restore).await?;
```

### Data Lifecycle Management

```rust
// Configure lifecycle policy
let lifecycle = LifecyclePolicy {
    name: "data-lifecycle",
    rules: vec![
        LifecycleRule {
            name: "archive-old-data",
            pattern: "data/**/*.parquet",
            condition: Condition::And(vec![
                Condition::Age(Duration::from_days(90)),
                Condition::Size(ByteSize::gb(10)),
            ]),
            action: Action::MoveTier {
                target: StorageTier::Cold,
                preserve_metadata: true,
            },
        },
        LifecycleRule {
            name: "delete-tmp",
            pattern: "tmp/**/*",
            condition: Condition::Age(Duration::from_days(7)),
            action: Action::Delete {
                permanent: false,
                retention: Duration::from_days(30),
            },
        },
    ],
    enabled: true,
};

storage.create_lifecycle_policy(lifecycle).await?;

// Configure tiering
let tiering = TieringConfig {
    tiers: vec![
        StorageTier::Hot {
            type_: VolumeType::SSD {
                iops: 3000,
                throughput: ByteSize::mb(125),
            },
            max_size: ByteSize::tb(1),
            cost_per_gb: 0.10,
        },
        StorageTier::Warm {
            type_: VolumeType::HDD {
                throughput: ByteSize::mb(50),
            },
            max_size: ByteSize::tb(10),
            cost_per_gb: 0.03,
        },
        StorageTier::Cold {
            type_: VolumeType::Archive,
            max_size: ByteSize::tb(100),
            cost_per_gb: 0.01,
            restore_time: Duration::from_hours(4),
        },
    ],
    transition_policy: TransitionPolicy {
        rules: vec![
            TransitionRule {
                from: StorageTier::Hot,
                to: StorageTier::Warm,
                condition: Condition::And(vec![
                    Condition::Age(Duration::from_days(30)),
                    Condition::AccessFrequency(1.0), // Access per day
                ]),
            },
            TransitionRule {
                from: StorageTier::Warm,
                to: StorageTier::Cold,
                condition: Condition::And(vec![
                    Condition::Age(Duration::from_days(90)),
                    Condition::AccessFrequency(0.1),
                ]),
            },
        ],
    },
};

storage.configure_tiering(tiering).await?;
```

### Caching and Performance

```rust
// Configure cache
let cache = CacheConfig {
    enabled: true,
    size: ByteSize::gb(100),
    policy: CachePolicy::LRU {
        max_entries: 1_000_000,
        ttl: Duration::from_hours(24),
    },
    backend: CacheBackend::Redis {
        hosts: vec!["redis-0:6379", "redis-1:6379"],
        password: None,
        pool_size: 20,
    },
    compression: Some(Compression {
        algorithm: CompressionAlgorithm::LZ4,
        level: 6,
        min_size: ByteSize::kb(4),
    }),
};

storage.configure_cache(cache).await?;

// Configure performance optimization
let performance = PerformanceConfig {
    io_profile: IOProfile::Mixed {
        read_percentage: 70,
        write_percentage: 30,
    },
    read_ahead: ByteSize::mb(1),
    write_buffer: ByteSize::mb(64),
    direct_io: true,
    async_io: true,
    optimization: vec![
        Optimization::Prefetch {
            enabled: true,
            size: ByteSize::mb(10),
            threads: 2,
        },
        Optimization::WriteCoalescing {
            window: Duration::from_millis(100),
            max_size: ByteSize::mb(1),
        },
    ],
};

storage.configure_performance(performance).await?;
```

## Architecture

```plaintext
+------------------+
|     Storage      |
+------------------+
         |
+------------------+     +------------------+     +------------------+
| Volume Manager   |     | Cache Manager    |     | Backup Manager  |
+------------------+     +------------------+     +------------------+
         |                       |                        |
+------------------+     +------------------+     +------------------+
| Lifecycle Manager|     | Tier Manager     |     | Quota Manager   |
+------------------+     +------------------+     +------------------+
         |                       |                        |
+------------------+     +------------------+     +------------------+
| Storage Backend  |     | Monitor Service  |     | Security Service|
+------------------+     +------------------+     +------------------+
```

### Components

1. **Volume Manager**
   - Volume lifecycle
   - Snapshot management
   - Replication control
   - Performance tuning

2. **Cache Manager**
   - Cache policies
   - Data distribution
   - Eviction strategies
   - Performance optimization

3. **Lifecycle Manager**
   - Data tiering
   - Retention policies
   - Archival rules
   - Cleanup operations

4. **Storage Backend**
   - Multiple backends
   - Data distribution
   - IO management
   - Space allocation

## Configuration

### Storage Configuration

```yaml
storage:
  volumes:
    default_type: ssd
    encryption: true
    replication_factor: 3
    
    types:
      ssd:
        iops: 3000
        throughput: 125MB/s
      hdd:
        throughput: 50MB/s
  
  tiers:
    hot:
      type: ssd
      max_size: 1TB
      cost_per_gb: 0.10
    warm:
      type: hdd
      max_size: 10TB
      cost_per_gb: 0.03
```

### Cache Configuration

```yaml
cache:
  enabled: true
  size: 100GB
  
  policy:
    type: lru
    max_entries: 1000000
    ttl: 24h
  
  backend:
    type: redis
    hosts:
      - redis-0:6379
      - redis-1:6379
    pool_size: 20
```

### Lifecycle Configuration

```yaml
lifecycle:
  rules:
    - name: archive-old-data
      pattern: "data/**/*.parquet"
      age: 90d
      action: move_tier
      target_tier: cold
    
    - name: delete-tmp
      pattern: "tmp/**/*"
      age: 7d
      action: delete
```

## API Reference

### Volume Management

```rust
#[async_trait]
pub trait VolumeManager: Send + Sync {
    async fn create_volume(&self, volume: Volume) -> Result<Volume>;
    async fn delete_volume(&self, name: &str) -> Result<()>;
    async fn resize_volume(&self, name: &str, new_size: ByteSize) -> Result<Volume>;
    async fn create_snapshot(&self, volume: &str, snapshot: Snapshot) -> Result<Snapshot>;
    async fn list_volumes(&self) -> Result<Vec<Volume>>;
}
```

### Cache Management

```rust
#[async_trait]
pub trait CacheManager: Send + Sync {
    async fn configure_cache(&self, config: CacheConfig) -> Result<()>;
    async fn invalidate(&self, key: &str) -> Result<()>;
    async fn clear_cache(&self) -> Result<()>;
    async fn get_stats(&self) -> Result<CacheStats>;
}
```

## Best Practices

1. **Volume Management**
   - Proper sizing
   - Encryption enabled
   - Regular snapshots
   - Performance monitoring

2. **Data Lifecycle**
   - Clear policies
   - Regular cleanup
   - Cost optimization
   - Data classification

3. **Caching**
   - Appropriate sizing
   - Monitoring and tuning
   - Regular invalidation
   - Performance metrics

4. **Security**
   - Encryption at rest
   - Access control
   - Audit logging
   - Key rotation

## Examples

### Volume Operations

```rust
use clusterdb::storage::{Storage, Volume, VolumeType};

#[tokio::main]
async fn main() -> Result<()> {
    let storage = Storage::new(config)?;
    
    // Create volume
    let volume = Volume::new("data-volume")
        .with_size(ByteSize::gb(100))
        .with_type(VolumeType::SSD {
            iops: 3000,
            throughput: ByteSize::mb(125),
        })
        .with_encryption(true);
    
    storage.create_volume(volume).await?;
    
    // Create snapshot
    let snapshot = storage.create_snapshot("data-volume", SnapshotConfig {
        name: "backup-1",
        description: "Daily backup",
    }).await?;
    
    // Monitor volume metrics
    let metrics = storage.watch_volume_metrics("data-volume")
        .await
        .filter(|metric| metric.type_ == "iops")
        .for_each(|metric| {
            println!("IOPS: {}", metric.value);
        });
}
```

### Lifecycle Management

```rust
use clusterdb::storage::{Storage, LifecyclePolicy, LifecycleRule};

#[tokio::main]
async fn main() -> Result<()> {
    let storage = Storage::new(config)?;
    
    // Configure lifecycle
    let policy = LifecyclePolicy::new("data-lifecycle")
        .add_rule(LifecycleRule::new("archive-old")
            .with_pattern("data/**/*.parquet")
            .with_age(Duration::from_days(90))
            .with_action(Action::MoveTier {
                target: StorageTier::Cold,
            }));
    
    storage.create_lifecycle_policy(policy).await?;
    
    // Monitor transitions
    let transitions = storage.watch_lifecycle_events()
        .await
        .filter(|event| event.type_ == "tier_transition")
        .for_each(|event| {
            println!("Transition: {:?}", event);
        });
}
```

## Integration

### With Compute

```rust
use clusterdb::{
    storage::Storage,
    compute::{Compute, VolumeMount},
};

// Mount storage in compute
let compute = Compute::new(config)?;
let volume = storage.create_volume(volume_config).await?;

let deployment = compute.create_deployment("app")
    .with_volume_mount(VolumeMount {
        volume: volume.name(),
        mount_path: "/data",
    });

compute.apply_deployment(deployment).await?;
```

### With Monitoring

```rust
use clusterdb::{
    storage::Storage,
    monitoring::{Monitor, MetricsConfig},
};

// Configure storage monitoring
let metrics = MetricsConfig::new()
    .with_metric("volume_iops")
    .with_metric("volume_throughput")
    .with_metric("volume_latency")
    .with_alerts(AlertConfig {
        iops_threshold: 5000,
        latency_threshold_ms: 10,
    });

storage.configure_monitoring(metrics).await?;
```

## Troubleshooting

### Common Issues

1. **Performance Issues**
   ```
   Error: High latency detected
   Cause: IO bottleneck
   Solution: Check IO patterns and scaling
   ```

2. **Capacity Issues**
   ```
   Error: Volume full
   Cause: Insufficient space
   Solution: Resize volume or clean up data
   ```

3. **Replication Issues**
   ```
   Error: Replication lag
   Cause: Network congestion
   Solution: Check network or reduce load
   ```

### Debugging Tools

```bash
# Check volume status
storage volume status data-volume

# Monitor IO metrics
storage metrics volume data-volume

# View lifecycle events
storage lifecycle list-events
```

## Support

- [Storage Issues](https://github.com/clusterdb/clusterdb/issues)
- [Storage Documentation](https://docs.clusterdb.io/storage)
- [Community Support](https://slack.clusterdb.io)
