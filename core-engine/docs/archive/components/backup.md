# Backup Manager

The Backup Manager provides automated backup, restore, and disaster recovery capabilities for system data and configurations.

## Overview

The Backup Manager provides:
- Automated backups
- Multiple storage backends
- Backup verification
- Point-in-time recovery
- Incremental backups
- Data retention policies
- Disaster recovery

## Features

### Backup Management

```rust
// Create backup
let backup = Backup::new()
    .with_name("daily-backup")
    .with_description("Daily full backup")
    .with_type(BackupType::Full)
    .with_sources(vec![
        BackupSource::Database {
            connection: "postgresql://localhost:5432/mydb",
            schemas: vec!["public"],
        },
        BackupSource::Files {
            paths: vec!["/data/uploads", "/config"],
            exclude: vec!["*.tmp", "*.log"],
        },
    ])
    .with_retention(RetentionPolicy {
        keep_daily: 7,
        keep_weekly: 4,
        keep_monthly: 12,
    });

// Execute backup
backups.execute(backup).await?;

// List backups
let backups = backups.list().await?;

// Delete backup
backups.delete("daily-backup-2025-06-24").await?;
```

### Restore Operations

```rust
// Configure restore
let restore = Restore::new()
    .with_backup("daily-backup-2025-06-24")
    .with_point_in_time(SystemTime::now() - Duration::from_hours(12))
    .with_targets(vec![
        RestoreTarget::Database {
            connection: "postgresql://localhost:5432/mydb",
            schemas: vec!["public"],
        },
        RestoreTarget::Files {
            source: "/data/uploads",
            destination: "/data/restored",
        },
    ])
    .with_options(RestoreOptions {
        verify: true,
        parallel: 4,
        dry_run: false,
    });

// Execute restore
backups.restore(restore).await?;
```

### Verification

```rust
// Verify backup
let verification = Verification::new()
    .with_backup("daily-backup-2025-06-24")
    .with_checks(vec![
        Check::Integrity,
        Check::Completeness,
        Check::Size { min_bytes: 1024 },
    ])
    .with_restore_test(RestoreTest {
        enabled: true,
        destination: "test-restore",
    });

// Run verification
let results = backups.verify(verification).await?;

// Process results
for result in results {
    match result {
        VerificationResult::Success { check, details } => {
            info!("Check passed: {}", check);
        }
        VerificationResult::Failure { check, error } => {
            error!("Check failed: {} - {}", check, error);
        }
    }
}
```

## Architecture

```plaintext
+------------------+     +------------------+     +------------------+
|   Backup API     |     |  Restore API     |     |   Verify API    |
+------------------+     +------------------+     +------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +------------------+     +------------------+
| Backup Manager   |<--->|  Backup Store   |<--->|  Backup Cache   |
+------------------+     +------------------+     +------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +------------------+     +------------------+
| Storage Backends |     | Data Processors  |     |  Retry Manager  |
+------------------+     +------------------+     +------------------+
```

### Components

1. **Backup Manager**
   - Backup coordination
   - Schedule management
   - Policy enforcement
   - Error handling

2. **Backup Store**
   - Metadata storage
   - Version tracking
   - Data indexing
   - Cleanup coordination

3. **Storage Backend**
   - Data storage
   - Compression
   - Encryption
   - Transfer management

## Configuration

### Core Configuration

```yaml
backup_manager:
  storage:
    type: s3
    bucket: backups-bucket
    prefix: prod/
    region: us-west-2
    
  compression:
    algorithm: zstd
    level: 3
    
  encryption:
    enabled: true
    provider: aws_kms
    key_id: alias/backup-key
    
  scheduling:
    timezone: UTC
    full_backup: "0 0 * * *"
    incremental_backup: "0 */6 * * *"
    
  retention:
    keep_daily: 7
    keep_weekly: 4
    keep_monthly: 12
    
  verification:
    enabled: true
    schedule: "0 12 * * *"
    restore_test: true
```

### Backup Policy

```yaml
policies:
  database:
    sources:
      - type: postgresql
        connection: ${DB_URL}
        schemas: ["public"]
    schedule:
      full: "0 0 * * 0"
      incremental: "0 */6 * * *"
    retention:
      keep_daily: 7
      keep_weekly: 4
      keep_monthly: 12
      
  files:
    sources:
      - type: filesystem
        paths: ["/data/uploads", "/config"]
        exclude: ["*.tmp", "*.log"]
    schedule:
      full: "0 0 * * *"
    retention:
      keep_daily: 30
```

## API Reference

### Backup Management

```rust
#[async_trait]
pub trait BackupManager: Send + Sync {
    async fn execute(&self, backup: Backup) -> Result<BackupId>;
    async fn list(&self) -> Result<Vec<BackupMetadata>>;
    async fn get(&self, id: BackupId) -> Result<Backup>;
    async fn delete(&self, id: BackupId) -> Result<()>;
}
```

### Restore Operations

```rust
#[async_trait]
pub trait RestoreManager: Send + Sync {
    async fn restore(&self, restore: Restore) -> Result<()>;
    async fn verify_restore(&self, id: BackupId) -> Result<()>;
    async fn list_restores(&self) -> Result<Vec<RestoreMetadata>>;
}
```

### Verification

```rust
#[async_trait]
pub trait VerificationManager: Send + Sync {
    async fn verify(&self, verification: Verification) -> Result<Vec<VerificationResult>>;
    async fn verify_backup(&self, id: BackupId) -> Result<()>;
}
```

## Best Practices

1. **Backup Strategy**
   - Regular schedules
   - Multiple copies
   - Offline storage
   - Test restores

2. **Performance**
   - Compression
   - Incremental backups
   - Parallel processing
   - Storage optimization

3. **Security**
   - Encryption
   - Access control
   - Secure transport
   - Audit logging

4. **Monitoring**
   - Success verification
   - Storage usage
   - Performance metrics
   - Error tracking

## Examples

### Basic Usage

```rust
use sirsinexus::backup::{BackupManager, Backup};

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize backup manager
    let backups = BackupManager::new()
        .with_storage(S3Storage::new()
            .with_bucket("backups")
            .with_region("us-west-2"))
        .build()?;
    
    // Create backup
    let backup = Backup::new()
        .with_name("database-backup")
        .with_source(BackupSource::Database {
            connection: "postgresql://localhost:5432/mydb",
            schemas: vec!["public"],
        });
    
    // Execute backup
    let id = backups.execute(backup).await?;
    println!("Backup created: {}", id);
}
```

### Custom Storage

```rust
use sirsinexus::backup::{StorageBackend, Backup};

#[derive(Debug)]
struct FtpStorage {
    client: FtpClient,
    path: String,
}

#[async_trait]
impl StorageBackend for FtpStorage {
    async fn store(&self, backup: &Backup, data: &[u8]) -> Result<()> {
        let path = format!("{}/{}.bak", self.path, backup.id());
        self.client.put(&path, data).await?;
        Ok(())
    }
    
    async fn retrieve(&self, id: BackupId) -> Result<Vec<u8>> {
        let path = format!("{}/{}.bak", self.path, id);
        let data = self.client.get(&path).await?;
        Ok(data)
    }
    
    async fn delete(&self, id: BackupId) -> Result<()> {
        let path = format!("{}/{}.bak", self.path, id);
        self.client.delete(&path).await?;
        Ok(())
    }
}
```

## Integration

### With Monitoring

```rust
use sirsinexus::{
    backup::BackupManager,
    monitoring::Monitor,
};

// Configure monitoring
let backups = BackupManager::new()
    .with_monitoring(Monitor::new()
        .with_metrics(vec![
            Metric::BackupDuration,
            Metric::BackupSize,
            Metric::RestoreTime,
        ]))
    .build()?;
```

### With Notification

```rust
use sirsinexus::{
    backup::BackupManager,
    notification::Notifier,
};

// Configure notifications
let backups = BackupManager::new()
    .with_notifier(Notifier::new()
        .with_email("admin@example.com")
        .with_slack_webhook("https://hooks.slack.com/..."))
    .build()?;
```

## Troubleshooting

### Common Issues

1. **Backup Failed**
   ```
   Error: Failed to create backup
   Cause: Insufficient storage space
   Solution: Free up space or increase capacity
   ```

2. **Restore Failed**
   ```
   Error: Failed to restore backup
   Cause: Corrupted backup data
   Solution: Use alternate backup or verify data
   ```

3. **Verification Failed**
   ```
   Error: Backup verification failed
   Cause: Checksum mismatch
   Solution: Check storage integrity
   ```

### Debugging Tools

```bash
# List backups
sirsinexus backup list

# Show backup details
sirsinexus backup info daily-backup-2025-06-24

# Verify backup
sirsinexus backup verify daily-backup-2025-06-24
```

## Support

- [Backup Issues](https://github.com/sirsinexus/sirsinexus/issues)
- [Backup Documentation](https://docs.sirsinexus.io/backup)
- [Community Support](https://slack.sirsinexus.io)
