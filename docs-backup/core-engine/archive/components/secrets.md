# Secrets Manager

The Secrets Manager provides secure storage, access, and management of sensitive information like credentials, keys, and tokens.

## Overview

The Secrets Manager provides:
- Secure secret storage
- Secret lifecycle management
- Access control
- Secret rotation
- Encryption
- Auditing
- Multiple backend support

## Features

### Secret Management

```rust
// Create secret
let secret = Secret::new()
    .with_name("db_password")
    .with_value("very-secure-password")
    .with_description("Database password")
    .with_tags(vec![
        ("environment", "production"),
        ("service", "database"),
    ])
    .with_rotation(RotationPolicy {
        enabled: true,
        interval: Duration::from_days(90),
        generator: PasswordGenerator::new()
            .with_length(32)
            .with_symbols(true),
    });

// Store secret
secrets.store(secret).await?;

// Retrieve secret
let db_password = secrets.get("db_password").await?;

// Delete secret
secrets.delete("db_password").await?;
```

### Secret References

```rust
// Create secret reference
let secret_ref = SecretRef::new("db_password")
    .with_version("latest")
    .with_key("password");

// Resolve reference
let password = secrets.resolve(&secret_ref).await?;

// Create dynamic reference
let dynamic_ref = SecretRef::new("api_key")
    .with_resolver(|secrets| async move {
        let key = secrets.get("api_key").await?;
        let encrypted = encrypt_value(&key)?;
        Ok(encrypted)
    });
```

### Secret Rotation

```rust
// Configure rotation
let rotation = RotationConfig::new()
    .with_schedule(Schedule::new("0 0 * * *")) // Daily at midnight
    .with_policy(RotationPolicy {
        max_age: Duration::from_days(90),
        overlap: Duration::from_hours(1),
    })
    .with_generator(SecretGenerator::new()
        .with_length(32)
        .with_charset(Charset::AlphaNumeric))
    .with_validator(|secret| {
        // Validate new secret
        Ok(())
    });

// Start rotation
secrets.start_rotation(rotation).await?;

// Manual rotation
secrets.rotate("db_password").await?;
```

### Access Control

```rust
// Define policy
let policy = AccessPolicy::new()
    .allow("read", "db_password")
    .allow("write", "api_keys/*")
    .deny("delete", "*")
    .with_conditions(vec![
        Condition::IpRange("10.0.0.0/8"),
        Condition::TimeWindow("09:00-17:00"),
    ]);

// Apply policy
secrets.apply_policy("service-a", policy).await?;

// Check access
let access = secrets.check_access("service-a", "read", "db_password").await?;
```

## Architecture

```plaintext
+-------------------+     +-------------------+     +-------------------+
|   Secrets API     |     |  Access Control   |     |     Auditing     |
+-------------------+     +-------------------+     +-------------------+
          |                        |                         |
          v                        v                         v
+-------------------+     +-------------------+     +-------------------+
|  Secrets Manager  |<--->|   Secret Store   |<--->|  Encryption Key  |
+-------------------+     +-------------------+     +-------------------+
          |                        |                         |
          v                        v                         v
+-------------------+     +-------------------+     +-------------------+
|  Secret Backends  |     | Secret Resolvers  |     |  Secret Cache   |
+-------------------+     +-------------------+     +-------------------+
```

### Components

1. **Secrets Manager**
   - Secret lifecycle
   - Access management
   - Rotation coordination
   - Audit logging

2. **Secret Store**
   - Value storage
   - Version tracking
   - Metadata management
   - Cache coordination

3. **Encryption Layer**
   - Key management
   - Data encryption
   - Key rotation
   - Secure deletion

## Configuration

### Core Configuration

```yaml
secrets_manager:
  backend:
    type: aws_secrets_manager
    region: us-west-2
    
  encryption:
    provider: aws_kms
    key_id: alias/secrets-key
    
  cache:
    enabled: true
    ttl: 300s
    max_size: 1000
    
  rotation:
    enabled: true
    schedule: "0 0 * * *"
    default_policy:
      max_age: 90d
      overlap: 1h
      
  audit:
    enabled: true
    log_level: info
    retention: 90d
```

### Access Policies

```yaml
policies:
  service-a:
    allow:
      - action: read
        resources:
          - db_password
          - api_keys/*
    deny:
      - action: delete
        resources:
          - "*"
    conditions:
      - type: ip_range
        value: 10.0.0.0/8
      - type: time_window
        value: 09:00-17:00
```

## API Reference

### Secret Management

```rust
#[async_trait]
pub trait SecretsManager: Send + Sync {
    async fn store(&self, secret: Secret) -> Result<()>;
    async fn get(&self, name: &str) -> Result<Secret>;
    async fn delete(&self, name: &str) -> Result<()>;
    async fn list(&self) -> Result<Vec<SecretMetadata>>;
}
```

### Secret Resolution

```rust
#[async_trait]
pub trait SecretResolver: Send + Sync {
    async fn resolve(&self, reference: &SecretRef) -> Result<Vec<u8>>;
    async fn validate(&self, reference: &SecretRef) -> Result<()>;
}
```

### Access Control

```rust
#[async_trait]
pub trait AccessControl: Send + Sync {
    async fn check_access(&self, principal: &str, action: &str, resource: &str) -> Result<bool>;
    async fn apply_policy(&self, name: &str, policy: AccessPolicy) -> Result<()>;
}
```

## Best Practices

1. **Secret Management**
   - Use strong encryption
   - Rotate regularly
   - Limit access
   - Audit usage

2. **Access Control**
   - Least privilege
   - Regular review
   - Clear policies
   - Audit logging

3. **Security**
   - Encrypt at rest
   - Secure transport
   - Key rotation
   - Access monitoring

4. **Operational**
   - Regular backups
   - Disaster recovery
   - Performance monitoring
   - Capacity planning

## Examples

### Basic Usage

```rust
use sirsinexus::secrets::{SecretsManager, Secret};

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize secrets manager
    let secrets = SecretsManager::new()
        .with_backend(AwsSecretsManager::new()
            .with_region("us-west-2"))
        .build()?;
    
    // Store secret
    let secret = Secret::new()
        .with_name("api_key")
        .with_value("secret-value")
        .with_description("API key for service");
    
    secrets.store(secret).await?;
    
    // Retrieve secret
    let api_key = secrets.get("api_key").await?;
    println!("API Key: {}", api_key.value());
}
```

### Custom Backend

```rust
use sirsinexus::secrets::{SecretBackend, Secret};

#[derive(Debug)]
struct VaultBackend {
    client: VaultClient,
    path: String,
}

#[async_trait]
impl SecretBackend for VaultBackend {
    async fn store(&self, secret: Secret) -> Result<()> {
        let path = format!("{}/{}", self.path, secret.name());
        self.client.put(&path, secret.to_json()?).await?;
        Ok(())
    }
    
    async fn get(&self, name: &str) -> Result<Secret> {
        let path = format!("{}/{}", self.path, name);
        let data = self.client.get(&path).await?;
        Secret::from_json(data)
    }
    
    async fn delete(&self, name: &str) -> Result<()> {
        let path = format!("{}/{}", self.path, name);
        self.client.delete(&path).await?;
        Ok(())
    }
}
```

## Integration

### With Configuration

```rust
use sirsinexus::{
    secrets::SecretsManager,
    config::ConfigManager,
};

// Configure with config
let config = ConfigManager::new();
let secrets = SecretsManager::new()
    .with_config(config.clone())
    .build()?;

// Register secrets manager
config.register_secret_resolver(secrets.clone());
```

### With Service Registry

```rust
use sirsinexus::{
    secrets::SecretsManager,
    registry::ServiceRegistry,
};

// Register secrets manager
let registry = ServiceRegistry::new();
registry.register_secrets(secrets.clone());

// Get secrets manager
let secrets = registry.get_secrets()?;
```

## Troubleshooting

### Common Issues

1. **Access Denied**
   ```
   Error: Failed to access secret
   Cause: Insufficient permissions
   Solution: Check access policy
   ```

2. **Secret Not Found**
   ```
   Error: Secret not found
   Cause: Invalid name or deleted
   Solution: Verify secret exists
   ```

3. **Rotation Failed**
   ```
   Error: Failed to rotate secret
   Cause: Validation failed
   Solution: Check rotation policy
   ```

### Debugging Tools

```bash
# List secrets
sirsinexus secrets list

# View secret metadata
sirsinexus secrets info api_key

# Check access
sirsinexus secrets check-access --principal service-a --action read --resource db_password
```

## Support

- [Secrets Issues](https://github.com/sirsinexus/sirsinexus/issues)
- [Secrets Documentation](https://docs.sirsinexus.io/secrets)
- [Community Support](https://slack.sirsinexus.io)
