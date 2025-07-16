# Configuration Manager

The Configuration Manager provides centralized configuration management with features for loading, validating, and distributing configuration across the system.

## Overview

The Configuration Manager provides:
- Hierarchical configuration
- Multiple source support (files, env vars, remote)
- Dynamic configuration updates
- Configuration validation
- Secret references
- Change notifications

## Features

### Configuration Sources

```rust
// File-based configuration
let file_source = ConfigSource::File {
    path: "/etc/sirsinexus/config.yaml",
    format: Format::Yaml,
    required: true,
    watch: true,
};

// Environment variables
let env_source = ConfigSource::Environment {
    prefix: "SIRSINEXUS_",
    separator: "__",
};

// Remote configuration store
let remote_source = ConfigSource::Remote {
    endpoint: "https://config.sirsinexus.io",
    refresh_interval: Duration::from_secs(300),
    credentials: RemoteCredentials::from_env("CONFIG_CREDS"),
};

// Initialize configuration manager
let config = ConfigManager::new()
    .add_source(file_source)
    .add_source(env_source)
    .add_source(remote_source)
    .build()?;
```

### Configuration Schema

```rust
#[derive(Deserialize, Validate)]
struct DatabaseConfig {
    #[validate(url)]
    url: String,
    
    #[validate(range(min = 1, max = 100))]
    max_connections: u32,
    
    #[validate(length(min = 1))]
    username: String,
    
    #[serde(rename = "password")]
    #[validate(secret)]
    password_ref: SecretRef,
}

#[derive(Deserialize, Validate)]
struct ServiceConfig {
    #[validate(length(min = 1))]
    name: String,
    
    #[validate(port_number)]
    port: u16,
    
    #[validate]
    database: DatabaseConfig,
    
    #[validate(custom = "validate_features")]
    features: HashMap<String, bool>,
}
```

### Dynamic Updates

```rust
// Watch for configuration changes
let mut changes = config.watch_changes();

tokio::spawn(async move {
    while let Some(change) = changes.next().await {
        match change {
            ConfigChange::Updated { key, old_value, new_value } => {
                info!("Config updated: {} -> {}", key, new_value);
                // Handle configuration update
            }
            ConfigChange::Removed { key } => {
                info!("Config removed: {}", key);
                // Handle configuration removal
            }
        }
    }
});
```

### Secret References

```rust
// Configuration with secret references
let config_yaml = r#"
database:
  username: "db_user"
  password: "${secret:db_password}"
  url: "postgresql://localhost:5432/mydb"
"#;

// Resolve secrets during configuration load
let config = ConfigManager::new()
    .add_source(ConfigSource::String {
        content: config_yaml,
        format: Format::Yaml,
    })
    .with_secret_resolver(SecretResolver::new()
        .add_provider(SecretsManager::new())
        .add_provider(EnvironmentSecrets::new()))
    .build()?;

// Access resolved configuration
let db_config = config.get::<DatabaseConfig>("database")?;
println!("Database URL: {}", db_config.url);
```

## Architecture

```plaintext
+----------------------+     +----------------------+     +----------------------+
|  Configuration API   |     |    Change Events    |     |  Config Validation  |
+----------------------+     +----------------------+     +----------------------+
            |                          |                           |
            v                          v                           v
+----------------------+     +----------------------+     +----------------------+
|   Config Manager     |<--->|    Config Store     |<--->|   Schema Registry   |
+----------------------+     +----------------------+     +----------------------+
            |                          |                           |
            v                          v                           v
+----------------------+     +----------------------+     +----------------------+
|   Config Sources     |     |   Secret Resolution  |     |   Config Cache     |
+----------------------+     +----------------------+     +----------------------+
```

### Components

1. **Config Manager**
   - Configuration loading
   - Source management
   - Change detection
   - Validation coordination

2. **Config Store**
   - Value storage
   - Change tracking
   - Cache management
   - Type conversion

3. **Schema Registry**
   - Schema definitions
   - Validation rules
   - Type information
   - Default values

## Configuration

### Core Configuration

```yaml
config_manager:
  sources:
    - type: file
      path: /etc/sirsinexus/config.yaml
      format: yaml
      required: true
      watch: true
      
    - type: environment
      prefix: SIRSINEXUS_
      separator: __
      
    - type: remote
      endpoint: https://config.sirsinexus.io
      refresh_interval: 300s
      
  validation:
    schema_path: /etc/sirsinexus/config-schema.json
    strict: true
    
  secrets:
    providers:
      - type: secrets_manager
        region: us-west-2
      - type: environment
        prefix: SIRSINEXUS_SECRET_
```

### Schema Definition

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["service", "database"],
  "properties": {
    "service": {
      "type": "object",
      "required": ["name", "port"],
      "properties": {
        "name": {
          "type": "string",
          "minLength": 1
        },
        "port": {
          "type": "integer",
          "minimum": 1024,
          "maximum": 65535
        }
      }
    },
    "database": {
      "type": "object",
      "required": ["url", "username"],
      "properties": {
        "url": {
          "type": "string",
          "format": "uri"
        },
        "username": {
          "type": "string",
          "minLength": 1
        },
        "password": {
          "type": "string",
          "pattern": "^\\${secret:[a-zA-Z0-9_]+}$"
        }
      }
    }
  }
}
```

## API Reference

### Configuration Management

```rust
#[async_trait]
pub trait ConfigManager: Send + Sync {
    async fn get<T: DeserializeOwned>(&self, key: &str) -> Result<T>;
    async fn set<T: Serialize>(&self, key: &str, value: T) -> Result<()>;
    async fn delete(&self, key: &str) -> Result<()>;
    async fn watch<T: DeserializeOwned>(&self, key: &str) -> Result<ConfigWatcher<T>>;
}
```

### Configuration Sources

```rust
#[async_trait]
pub trait ConfigSource: Send + Sync {
    async fn load(&self) -> Result<HashMap<String, Value>>;
    async fn watch(&self) -> Result<Pin<Box<dyn Stream<Item = ConfigChange>>>>;
}
```

### Schema Validation

```rust
#[async_trait]
pub trait SchemaValidator: Send + Sync {
    async fn validate(&self, config: &Value) -> Result<()>;
    async fn validate_type<T: DeserializeOwned>(&self, value: &T) -> Result<()>;
}
```

## Best Practices

1. **Configuration Design**
   - Use hierarchical structure
   - Keep related settings together
   - Use consistent naming
   - Document all options

2. **Validation**
   - Define strict schemas
   - Validate early
   - Provide good error messages
   - Use appropriate types

3. **Security**
   - Never store secrets directly
   - Use secret references
   - Encrypt sensitive values
   - Audit access

4. **Maintainability**
   - Version configurations
   - Document changes
   - Use change notifications
   - Monitor usage

## Examples

### Basic Usage

```rust
use sirsinexus::config::{ConfigManager, ConfigSource};

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize configuration
    let config = ConfigManager::new()
        .add_source(ConfigSource::File {
            path: "/etc/sirsinexus/config.yaml",
            format: Format::Yaml,
            required: true,
            watch: true,
        })
        .build()?;
    
    // Get typed configuration
    let db_config = config.get::<DatabaseConfig>("database").await?;
    
    // Watch for changes
    let mut watcher = config.watch::<DatabaseConfig>("database").await?;
    while let Some(new_config) = watcher.next().await {
        println!("Database config updated: {:?}", new_config);
    }
}
```

### Custom Source

```rust
use sirsinexus::config::{ConfigSource, ConfigChange};

#[derive(Debug)]
struct EtcdSource {
    client: EtcdClient,
    prefix: String,
}

#[async_trait]
impl ConfigSource for EtcdSource {
    async fn load(&self) -> Result<HashMap<String, Value>> {
        let values = self.client.get_prefix(&self.prefix).await?;
        Ok(values.into_iter().map(|(k, v)| (k, v.into())).collect())
    }
    
    async fn watch(&self) -> Result<Pin<Box<dyn Stream<Item = ConfigChange>>>> {
        let watcher = self.client.watch_prefix(&self.prefix).await?;
        Ok(Box::pin(watcher.map(|event| {
            match event {
                EtcdEvent::Put { key, value } => {
                    ConfigChange::Updated {
                        key: key.to_string(),
                        value: value.into(),
                    }
                }
                EtcdEvent::Delete { key } => {
                    ConfigChange::Removed {
                        key: key.to_string(),
                    }
                }
            }
        })))
    }
}
```

## Integration

### With Secrets Manager

```rust
use sirsinexus::{
    config::ConfigManager,
    secrets::SecretsManager,
};

// Configure with secrets manager
let config = ConfigManager::new()
    .with_secret_resolver(SecretResolver::new()
        .add_provider(SecretsManager::new()
            .with_region("us-west-2")
            .with_cache(Duration::from_secs(300))))
    .build()?;
```

### With Service Registry

```rust
use sirsinexus::{
    config::ConfigManager,
    registry::ServiceRegistry,
};

// Register service configuration
let registry = ServiceRegistry::new();
registry.register_config::<ServiceConfig>("service", config.clone());

// Get service configuration
let service_config = registry.get_config::<ServiceConfig>("service")?;
```

## Troubleshooting

### Common Issues

1. **Loading Failures**
   ```
   Error: Failed to load configuration
   Cause: File not found or inaccessible
   Solution: Check file permissions and path
   ```

2. **Validation Errors**
   ```
   Error: Configuration validation failed
   Cause: Invalid value type or range
   Solution: Check schema requirements
   ```

3. **Secret Resolution**
   ```
   Error: Failed to resolve secret
   Cause: Secret not found or access denied
   Solution: Verify secret exists and permissions
   ```

### Debugging Tools

```bash
# Validate configuration
sirsinexus config validate

# View current configuration
sirsinexus config view

# Check configuration sources
sirsinexus config sources
```

## Support

- [Configuration Issues](https://github.com/sirsinexus/sirsinexus/issues)
- [Configuration Documentation](https://docs.sirsinexus.io/config)
- [Community Support](https://slack.sirsinexus.io)
