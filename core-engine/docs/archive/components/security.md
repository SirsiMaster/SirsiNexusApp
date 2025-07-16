# Security

The Security component provides comprehensive security features including authentication, authorization, encryption, and audit logging.

## Overview

The Security component provides:
- Identity and access management (IAM)
- Authentication and authorization
- Secret management
- Encryption at rest and in transit
- Audit logging and compliance
- Security policy enforcement

## Features

### Identity Management

```rust
// Create user
let user = User {
    id: "user123",
    name: "John Doe",
    email: "john@example.com",
    groups: vec!["developers", "ops"],
    metadata: HashMap::from([
        ("department", "Engineering"),
        ("location", "US-West"),
    ]),
};

security.create_user(user).await?;

// Create role
let role = Role {
    name: "db-admin",
    permissions: vec![
        Permission {
            resource: "databases/*",
            actions: vec!["read", "write", "manage"],
        },
        Permission {
            resource: "backups/*",
            actions: vec!["create", "delete"],
        },
    ],
};

security.create_role(role).await?;

// Assign role to user
security.assign_role("user123", "db-admin").await?;
```

### Authentication

```rust
// Configure authentication
let auth_config = AuthConfig {
    providers: vec![
        Provider::OAuth2 {
            name: "google",
            client_id: "client123",
            client_secret: "secret123",
            redirect_uri: "https://app/callback",
            scopes: vec!["email", "profile"],
        },
        Provider::LDAP {
            url: "ldap://directory",
            bind_dn: "cn=admin,dc=example,dc=com",
            bind_password: "password",
            user_search_base: "ou=users,dc=example,dc=com",
        },
    ],
    session: SessionConfig {
        duration: Duration::hours(24),
        refresh_enabled: true,
        refresh_threshold: Duration::hours(1),
    },
    mfa: Some(MFAConfig {
        required: true,
        methods: vec!["totp", "sms"],
    }),
};

security.configure_auth(auth_config).await?;

// Authenticate user
let credentials = Credentials::OAuth2 {
    provider: "google",
    token: "token123",
};

let session = security.authenticate(credentials).await?;
```

### Authorization

```rust
// Define policy
let policy = Policy {
    name: "data-access",
    effect: Effect::Allow,
    principals: vec!["group:developers", "role:db-admin"],
    resources: vec!["databases/{name}"],
    actions: vec!["read", "write"],
    conditions: Some(Conditions {
        ip_range: vec!["10.0.0.0/8"],
        time_window: TimeWindow {
            start: "09:00",
            end: "17:00",
            timezone: "UTC",
        },
    }),
};

security.create_policy(policy).await?;

// Check authorization
let auth_request = AuthRequest {
    principal: "user123",
    resource: "databases/users",
    action: "write",
    context: HashMap::from([
        ("ip", "10.0.1.100"),
        ("time", "14:30"),
    ]),
};

let decision = security.check_authorization(auth_request).await?;
```

### Secret Management

```rust
// Store secret
let secret = Secret {
    name: "api-key",
    value: "secret123",
    metadata: HashMap::from([
        ("service", "payment-api"),
        ("environment", "production"),
    ]),
    rotation: Some(RotationPolicy {
        enabled: true,
        interval_days: 30,
        notification_threshold_days: 7,
    }),
};

security.store_secret(secret).await?;

// Access secret
let secret = security
    .get_secret("api-key")
    .with_version("latest")
    .await?;
```

## Architecture

```plaintext
+------------------+
|    Security      |
+------------------+
         |
+------------------+     +------------------+     +------------------+
|  Identity & Auth |     | Access Control   |     | Secret Manager  |
+------------------+     +------------------+     +------------------+
         |                       |                        |
+------------------+     +------------------+     +------------------+
| Authentication   |     | Policy Engine    |     | Encryption      |
+------------------+     +------------------+     +------------------+
         |                       |                        |
+------------------+     +------------------+     +------------------+
|  User Directory  |     |  Audit Logging   |     |  Key Management |
+------------------+     +------------------+     +------------------+
```

### Components

1. **Identity & Auth**
   - User management
   - Role management
   - Authentication
   - Session management

2. **Access Control**
   - Policy management
   - Authorization
   - Permission management
   - Access review

3. **Secret Manager**
   - Secret storage
   - Key management
   - Rotation
   - Audit logging

4. **Encryption**
   - Data encryption
   - Key management
   - Certificate management
   - HSM integration

## Configuration

### Identity Configuration

```yaml
identity:
  providers:
    oauth2:
      - name: google
        client_id: client123
        client_secret: secret123
        redirect_uri: https://app/callback
        scopes: [email, profile]
    ldap:
      - url: ldap://directory
        bind_dn: cn=admin,dc=example,dc=com
        user_search_base: ou=users,dc=example,dc=com
  
  session:
    duration: 24h
    refresh_enabled: true
    refresh_threshold: 1h
  
  mfa:
    required: true
    methods: [totp, sms]
```

### Access Control Configuration

```yaml
access_control:
  default_policy: deny
  cache_ttl: 300
  
  policies:
    - name: data-access
      effect: allow
      principals: [group:developers, role:db-admin]
      resources: [databases/{name}]
      actions: [read, write]
      conditions:
        ip_range: [10.0.0.0/8]
        time_window:
          start: 09:00
          end: 17:00
          timezone: UTC
```

### Secret Management Configuration

```yaml
secrets:
  storage:
    type: vault
    address: http://vault:8200
    token: s.token123
  
  encryption:
    provider: aws-kms
    key_id: key123
  
  rotation:
    enabled: true
    default_interval: 30d
    notification_threshold: 7d
```

## API Reference

### Identity Management

```rust
#[async_trait]
pub trait IdentityManager: Send + Sync {
    async fn create_user(&self, user: User) -> Result<User>;
    async fn update_user(&self, user: User) -> Result<User>;
    async fn delete_user(&self, id: &str) -> Result<()>;
    async fn get_user(&self, id: &str) -> Result<User>;
    async fn list_users(&self) -> Result<Vec<User>>;
}
```

### Access Control

```rust
#[async_trait]
pub trait AccessControl: Send + Sync {
    async fn check_authorization(&self, request: AuthRequest) -> Result<Decision>;
    async fn create_policy(&self, policy: Policy) -> Result<Policy>;
    async fn update_policy(&self, policy: Policy) -> Result<Policy>;
    async fn delete_policy(&self, name: &str) -> Result<()>;
}
```

## Best Practices

1. **Authentication**
   - Enforce strong passwords
   - Enable MFA
   - Use secure session management
   - Implement rate limiting

2. **Authorization**
   - Follow principle of least privilege
   - Regular access reviews
   - Use role-based access control
   - Implement fine-grained policies

3. **Secret Management**
   - Regular secret rotation
   - Secure storage
   - Access logging
   - Emergency access procedures

4. **Compliance**
   - Regular audits
   - Policy enforcement
   - Data classification
   - Incident response plan

## Examples

### Authentication Flow

```rust
use clusterdb::security::{Security, AuthConfig, Credentials};

#[tokio::main]
async fn main() -> Result<()> {
    let security = Security::new(config)?;
    
    // Configure auth
    let auth_config = AuthConfig::new()
        .with_oauth2_provider("google", oauth2_config)
        .with_mfa_required(true);
    
    security.configure_auth(auth_config).await?;
    
    // Authenticate
    let credentials = Credentials::OAuth2 {
        provider: "google",
        token: "token123",
    };
    
    let session = security.authenticate(credentials).await?;
    
    // Verify MFA
    let mfa_token = generate_totp();
    security.verify_mfa(session.id, mfa_token).await?;
}
```

### Policy Management

```rust
use clusterdb::security::{Security, Policy, Effect};

#[tokio::main]
async fn main() -> Result<()> {
    let security = Security::new(config)?;
    
    // Create policy
    let policy = Policy::new("data-access")
        .with_effect(Effect::Allow)
        .with_principals(vec!["group:developers"])
        .with_resources(vec!["databases/{name}"])
        .with_actions(vec!["read", "write"]);
    
    security.create_policy(policy).await?;
    
    // Check access
    let request = AuthRequest::new()
        .with_principal("user123")
        .with_resource("databases/users")
        .with_action("write");
    
    let decision = security.check_authorization(request).await?;
    println!("Access granted: {}", decision.allowed);
}
```

## Integration

### With Service Mesh

```rust
use clusterdb::{
    security::Security,
    mesh::{ServiceMesh, SecurityPolicy},
};

// Configure service mesh security
let mesh_policy = SecurityPolicy::new()
    .with_mtls(true)
    .with_authorization(security.get_policy("service-access"));

mesh.apply_security_policy(mesh_policy).await?;
```

### With Monitoring

```rust
use clusterdb::{
    security::Security,
    monitoring::{Monitor, AlertConfig},
};

// Configure security monitoring
let monitor = Monitor::new()
    .track_metric("failed_logins")
    .track_metric("policy_violations")
    .with_alerts(AlertConfig {
        thresholds: HashMap::from([
            ("failed_logins", 10),
            ("policy_violations", 5),
        ]),
    });

security.configure_monitoring(monitor).await?;
```

## Troubleshooting

### Common Issues

1. **Authentication Issues**
   ```
   Error: Invalid credentials
   Cause: Expired tokens or incorrect credentials
   Solution: Refresh tokens or verify credentials
   ```

2. **Authorization Issues**
   ```
   Error: Access denied
   Cause: Insufficient permissions
   Solution: Review policies and roles
   ```

3. **Secret Management Issues**
   ```
   Error: Secret rotation failed
   Cause: Integration error
   Solution: Check connectivity and permissions
   ```

### Debugging Tools

```bash
# Check authentication status
security auth status user123

# Test policy evaluation
security policy evaluate --principal user123 --resource db/users --action write

# Verify secret access
security secrets verify api-key
```

## Support

- [Security Issues](https://github.com/clusterdb/clusterdb/issues)
- [Security Documentation](https://docs.clusterdb.io/security)
- [Community Support](https://slack.clusterdb.io)
