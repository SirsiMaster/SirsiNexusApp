# Identity Manager

The Identity Manager component provides comprehensive identity and access management capabilities including user management, authentication, and role-based access control.

## Overview

The Identity Manager provides:
- User and group management
- Role-based access control (RBAC)
- Authentication providers
- Single sign-on (SSO)
- Identity federation
- Multi-factor authentication (MFA)

## Features

### User Management

```rust
// Create user
let user = User {
    id: "user123",
    username: "jdoe",
    email: "jdoe@example.com",
    full_name: "John Doe",
    active: true,
    groups: vec!["developers", "team-alpha"],
    attributes: HashMap::from([
        ("department", "Engineering"),
        ("location", "HQ"),
        ("employee_id", "E123"),
    ]),
    preferences: UserPreferences {
        language: "en",
        timezone: "UTC",
        theme: "dark",
    },
};

identity.create_user(user).await?;

// Update user
identity.update_user("user123")
    .set_email("john.doe@example.com")
    .set_groups(vec!["developers", "team-alpha", "project-x"])
    .execute()
    .await?;

// Get user details
let user = identity.get_user("user123")
    .with_groups()
    .with_roles()
    .with_permissions()
    .await?;
```

### Group Management

```rust
// Create group
let group = Group {
    name: "developers",
    description: "Development team",
    metadata: HashMap::from([
        ("type", "technical"),
        ("level", "senior"),
    ]),
    parent_group: Some("engineering"),
};

identity.create_group(group).await?;

// Manage group membership
identity.add_user_to_group("user123", "developers").await?;
identity.remove_user_from_group("user123", "team-beta").await?;

// Get group members
let members = identity.list_group_members("developers")
    .with_roles()
    .paginate()
    .await?;
```

### Role Management

```rust
// Create role
let role = Role {
    name: "db-admin",
    description: "Database administrator",
    permissions: vec![
        Permission {
            resource: "databases/*",
            actions: vec!["read", "write", "manage"],
        },
        Permission {
            resource: "backups/*",
            actions: vec!["create", "list", "restore"],
        },
    ],
    metadata: HashMap::from([
        ("level", "admin"),
        ("scope", "database"),
    ]),
};

identity.create_role(role).await?;

// Assign role
identity.assign_role_to_user("user123", "db-admin").await?;
identity.assign_role_to_group("developers", "app-developer").await?;

// Check permissions
let has_permission = identity.check_permission("user123", "databases/users", "write").await?;
```

### Authentication

```rust
// Configure authentication providers
let auth_config = AuthConfig {
    providers: vec![
        Provider::OAuth2 {
            name: "google",
            client_id: "client123",
            client_secret: "secret123",
            redirect_uri: "https://app/callback",
            scopes: vec!["email", "profile"],
        },
        Provider::SAML {
            name: "okta",
            metadata_url: "https://okta/metadata",
            certificate: "cert123",
            private_key: "key123",
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
    mfa: MFAConfig {
        required: true,
        methods: vec!["totp", "sms", "webauthn"],
        remember_device: true,
        remember_duration: Duration::days(30),
    },
};

identity.configure_auth(auth_config).await?;

// Authenticate user
let auth_result = identity.authenticate(Credentials::OAuth2 {
    provider: "google",
    token: "token123",
}).await?;

// Verify MFA
let mfa_result = identity.verify_mfa(
    auth_result.session_id,
    MFACredentials::TOTP { code: "123456" },
).await?;

// Access token management
let token = identity.create_access_token(TokenRequest {
    user_id: "user123",
    scope: vec!["api:read", "api:write"],
    duration: Duration::hours(1),
}).await?;

identity.revoke_token("token123").await?;
```

## Architecture

```plaintext
+------------------+
| Identity Manager |
+------------------+
         |
+------------------+     +------------------+     +------------------+
|  User Manager    |     |  Auth Manager    |     |  Role Manager   |
+------------------+     +------------------+     +------------------+
         |                       |                        |
+------------------+     +------------------+     +------------------+
|  User Store     |     | Auth Providers   |     | Policy Store    |
+------------------+     +------------------+     +------------------+
         |                       |                        |
+------------------+     +------------------+     +------------------+
|  Group Manager   |     |  Session Store   |     | Access Review   |
+------------------+     +------------------+     +------------------+
```

### Components

1. **User Manager**
   - User lifecycle
   - Profile management
   - Attribute management
   - Group membership

2. **Auth Manager**
   - Authentication
   - MFA
   - Session management
   - Token management

3. **Role Manager**
   - Role definitions
   - Permission management
   - Role assignments
   - Access review

4. **Group Manager**
   - Group hierarchy
   - Membership management
   - Group attributes
   - Dynamic groups

## Configuration

### Identity Configuration

```yaml
identity:
  user_store:
    type: postgresql
    connection: postgres://localhost/identity
    pool_size: 10
  
  providers:
    oauth2:
      - name: google
        client_id: client123
        client_secret: secret123
        redirect_uri: https://app/callback
        scopes: [email, profile]
    saml:
      - name: okta
        metadata_url: https://okta/metadata
        certificate: cert123
    ldap:
      - url: ldap://directory
        bind_dn: cn=admin,dc=example,dc=com
        user_search_base: ou=users,dc=example,dc=com
  
  session:
    store: redis
    duration: 24h
    refresh_enabled: true
  
  mfa:
    required: true
    methods: [totp, sms, webauthn]
    remember_device: true
```

### Access Control Configuration

```yaml
access_control:
  roles:
    app-developer:
      permissions:
        - resource: applications/*
          actions: [deploy, restart, logs]
    db-admin:
      permissions:
        - resource: databases/*
          actions: [create, backup, restore]
  
  groups:
    developers:
      roles: [app-developer]
      attributes:
        type: technical
        level: senior
```

## API Reference

### User Management

```rust
#[async_trait]
pub trait UserManager: Send + Sync {
    async fn create_user(&self, user: User) -> Result<User>;
    async fn update_user(&self, id: &str, update: UserUpdate) -> Result<User>;
    async fn delete_user(&self, id: &str) -> Result<()>;
    async fn get_user(&self, id: &str) -> Result<User>;
    async fn list_users(&self, query: UserQuery) -> Result<Vec<User>>;
}
```

### Authentication

```rust
#[async_trait]
pub trait AuthManager: Send + Sync {
    async fn authenticate(&self, credentials: Credentials) -> Result<AuthResult>;
    async fn verify_mfa(&self, session: &str, credentials: MFACredentials) -> Result<MFAResult>;
    async fn create_token(&self, request: TokenRequest) -> Result<Token>;
    async fn validate_token(&self, token: &str) -> Result<TokenInfo>;
    async fn revoke_token(&self, token: &str) -> Result<()>;
}
```

## Best Practices

1. **User Management**
   - Validate user data
   - Implement proper lifecycle
   - Use secure password storage
   - Regular access review

2. **Authentication**
   - Multiple auth providers
   - Enforce MFA
   - Token expiration
   - Session management

3. **Access Control**
   - Least privilege principle
   - Regular role review
   - Audit access changes
   - Clear documentation

4. **Security**
   - Encrypt sensitive data
   - Rate limiting
   - Audit logging
   - Compliance checks

## Examples

### User Lifecycle

```rust
use clusterdb::identity::{Identity, User, UserUpdate};

#[tokio::main]
async fn main() -> Result<()> {
    let identity = Identity::new(config)?;
    
    // Create user
    let user = User::new()
        .with_username("jdoe")
        .with_email("jdoe@example.com")
        .with_full_name("John Doe");
    
    let created = identity.create_user(user).await?;
    
    // Update user
    let updated = identity.update_user(created.id)
        .set_email("john.doe@example.com")
        .add_groups(vec!["developers"])
        .execute()
        .await?;
    
    // Delete user
    identity.delete_user(created.id).await?;
}
```

### Authentication Flow

```rust
use clusterdb::identity::{Identity, Credentials, MFACredentials};

#[tokio::main]
async fn main() -> Result<()> {
    let identity = Identity::new(config)?;
    
    // First factor
    let auth_result = identity.authenticate(Credentials::Password {
        username: "jdoe",
        password: "password123",
    }).await?;
    
    // Second factor
    let mfa_result = identity.verify_mfa(
        auth_result.session_id,
        MFACredentials::TOTP { code: "123456" },
    ).await?;
    
    // Create session
    let session = identity.create_session(mfa_result.user_id).await?;
    
    println!("Authenticated: {}", session.id);
}
```

## Integration

### With Directory Service

```rust
use clusterdb::{
    identity::Identity,
    directory::{DirectoryService, DirectoryConfig},
};

// Configure directory integration
let directory = DirectoryService::new(DirectoryConfig {
    url: "ldap://directory",
    bind_dn: "cn=admin,dc=example,dc=com",
    bind_password: "password",
});

// Sync users and groups
let sync_config = SyncConfig {
    user_filter: "(objectClass=person)",
    group_filter: "(objectClass=group)",
    attribute_mapping: AttributeMapping {
        username: "uid",
        email: "mail",
        groups: "memberOf",
    },
};

identity.sync_directory(directory, sync_config).await?;
```

### With Audit Log

```rust
use clusterdb::{
    identity::Identity,
    audit::{AuditLog, AuditConfig},
};

// Configure audit logging
let audit = AuditLog::new(AuditConfig {
    store: "elasticsearch",
    retention_days: 90,
    detailed: true,
});

// Enable identity auditing
identity.configure_audit(audit)
    .audit_authentication(true)
    .audit_access_control(true)
    .execute()
    .await?;
```

## Troubleshooting

### Common Issues

1. **Authentication Issues**
   ```
   Error: MFA verification failed
   Cause: Invalid TOTP code
   Solution: Check time sync or regenerate TOTP
   ```

2. **Authorization Issues**
   ```
   Error: Permission denied
   Cause: Missing role assignment
   Solution: Review role configuration
   ```

3. **Directory Issues**
   ```
   Error: Sync failed
   Cause: LDAP connection error
   Solution: Check network or credentials
   ```

### Debugging Tools

```bash
# Check user status
identity user status user123

# Test authentication
identity auth test --username jdoe --provider google

# Verify role assignments
identity roles list --user user123
```

## Support

- [Identity Issues](https://github.com/clusterdb/clusterdb/issues)
- [Identity Documentation](https://docs.clusterdb.io/identity)
- [Community Support](https://slack.clusterdb.io)
