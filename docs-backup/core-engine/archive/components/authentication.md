# Authentication

The Authentication component provides comprehensive authentication and identity management capabilities including multi-factor authentication, SSO, and identity federation.

## Overview

The Authentication component provides:
- User authentication
- Multi-factor authentication
- Single sign-on (SSO)
- Identity federation
- Social authentication
- Token management
- Session management

## Features

### Authentication Configuration

```rust
// Configure authentication providers
let auth = AuthConfig {
    providers: vec![
        Provider::OAuth2 {
            name: "google",
            client_id: "client123",
            client_secret: "secret123",
            authorize_url: "https://accounts.google.com/o/oauth2/v2/auth",
            token_url: "https://oauth2.googleapis.com/token",
            jwks_url: "https://www.googleapis.com/oauth2/v3/certs",
            scopes: vec!["openid", "email", "profile"],
            redirect_uri: "https://app.example.com/auth/callback",
        },
        Provider::SAML {
            name: "okta",
            metadata_url: "https://company.okta.com/app/metadata",
            certificate: Some(Certificate {
                path: "/certs/saml.crt",
                key: "/certs/saml.key",
            }),
            sso_url: "https://company.okta.com/app/sso",
            slo_url: Some("https://company.okta.com/app/slo"),
            name_id_format: "emailAddress",
            attribute_mapping: HashMap::from([
                ("email", "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"),
                ("name", "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"),
            ]),
        },
        Provider::LDAP {
            name: "active-directory",
            url: "ldap://directory.example.com",
            bind_dn: "cn=service,dc=example,dc=com",
            bind_password: "password123",
            search_base: "dc=example,dc=com",
            user_filter: "(&(objectClass=user)(mail={email}))",
            group_filter: "(&(objectClass=group)(member={dn}))",
            tls: Some(TlsConfig {
                enabled: true,
                verify: true,
                ca_cert: Some("/certs/ca.crt"),
            }),
        },
    ],
    mfa: MFAConfig {
        required: true,
        methods: vec![
            MFAMethod::TOTP {
                issuer: "ClusterDB",
                algorithm: "SHA1",
                digits: 6,
                period: 30,
            },
            MFAMethod::WebAuthn {
                relying_party: "app.example.com",
                origin: "https://app.example.com",
                challenge_size: 32,
            },
            MFAMethod::SMS {
                provider: SmsProvider::Twilio {
                    account_sid: "sid123",
                    auth_token: "token123",
                    from: "+1234567890",
                },
                message_template: "Your verification code is: {code}",
                code_length: 6,
                expiry: Duration::from_minutes(5),
            },
        ],
        remember_device: Some(RememberDeviceConfig {
            enabled: true,
            duration: Duration::from_days(30),
            max_devices: 5,
        }),
    },
    session: SessionConfig {
        store: SessionStore::Redis {
            url: "redis://localhost:6379",
            prefix: "session",
            ttl: Duration::from_hours(24),
        },
        cookie: CookieConfig {
            name: "session",
            domain: "example.com",
            path: "/",
            secure: true,
            http_only: true,
            same_site: SameSite::Strict,
            max_age: Some(Duration::from_hours(24)),
        },
    },
};

auth.configure(auth_config).await?;
```

### User Authentication

```rust
// Authenticate with OAuth2
let auth_request = AuthRequest::OAuth2 {
    provider: "google",
    code: "auth_code_123",
    state: "state123",
};

let auth_result = auth.authenticate(auth_request).await?;

// Authenticate with SAML
let auth_request = AuthRequest::SAML {
    provider: "okta",
    saml_response: saml_response,
};

let auth_result = auth.authenticate(auth_request).await?;

// Authenticate with LDAP
let auth_request = AuthRequest::LDAP {
    provider: "active-directory",
    username: "john.doe",
    password: "password123",
};

let auth_result = auth.authenticate(auth_request).await?;

// Setup MFA
let mfa_setup = auth.setup_mfa(auth_result.user_id, MFAMethod::TOTP {})
    .await?;

println!("Scan QR code: {}", mfa_setup.qr_code);

// Verify MFA
let mfa_request = MFARequest {
    user_id: auth_result.user_id,
    method: MFAMethod::TOTP,
    code: "123456",
};

let mfa_result = auth.verify_mfa(mfa_request).await?;

// Create session
let session = auth.create_session(SessionRequest {
    user_id: auth_result.user_id,
    mfa_verified: true,
    device_id: Some("device123"),
    ip_address: Some("192.168.1.1"),
    user_agent: Some("Mozilla/5.0..."),
}).await?;

// Validate session
let session = auth.validate_session("session123").await?;

// Revoke session
auth.revoke_session("session123").await?;
```

### Token Management

```rust
// Create access token
let token_request = TokenRequest {
    user_id: "user123",
    scopes: vec!["read", "write"],
    audience: "api",
    duration: Duration::from_hours(1),
    claims: Some(HashMap::from([
        ("role", "admin"),
        ("team", "platform"),
    ])),
};

let token = auth.create_token(token_request).await?;

// Validate token
let claims = auth.validate_token("token123").await?;

// Refresh token
let new_token = auth.refresh_token("refresh_token123").await?;

// Revoke token
auth.revoke_token("token123").await?;
```

### Identity Federation

```rust
// Configure identity federation
let federation = FederationConfig {
    providers: vec![
        FederatedProvider::OIDC {
            name: "partner",
            issuer: "https://auth.partner.com",
            client_id: "client123",
            client_secret: "secret123",
            scopes: vec!["openid", "email"],
            user_mapping: UserMapping {
                id_claim: "sub",
                email_claim: "email",
                name_claim: "name",
                groups_claim: Some("groups"),
            },
        },
    ],
    trust_chain: TrustChain {
        certificates: vec!["/certs/partner.crt"],
        allowed_domains: vec!["partner.com"],
    },
};

auth.configure_federation(federation).await?;

// Authenticate federated user
let auth_request = AuthRequest::Federated {
    provider: "partner",
    token: "token123",
};

let auth_result = auth.authenticate(auth_request).await?;
```

## Architecture

```plaintext
+------------------+
|  Authentication  |
+------------------+
         |
+------------------+     +------------------+     +------------------+
|  Auth Manager    |     |  Token Manager   |     | Session Manager |
+------------------+     +------------------+     +------------------+
         |                       |                        |
+------------------+     +------------------+     +------------------+
|  Identity Store  |     |  Token Store     |     | Session Store   |
+------------------+     +------------------+     +------------------+
         |                       |                        |
+------------------+     +------------------+     +------------------+
| Auth Providers   |     | MFA Provider     |     | Policy Engine   |
+------------------+     +------------------+     +------------------+
```

### Components

1. **Auth Manager**
   - Authentication flow
   - Provider management
   - Identity federation
   - Access policies

2. **Token Manager**
   - Token lifecycle
   - Token validation
   - Token refresh
   - Token revocation

3. **Session Manager**
   - Session lifecycle
   - Session validation
   - Session storage
   - Session policies

4. **MFA Provider**
   - MFA methods
   - MFA validation
   - Device management
   - Challenge handling

## Configuration

### Authentication Configuration

```yaml
auth:
  providers:
    oauth2:
      - name: google
        client_id: client123
        client_secret: secret123
        scopes: [openid, email, profile]
    saml:
      - name: okta
        metadata_url: https://company.okta.com/metadata
        certificate: /certs/saml.crt
    ldap:
      - name: active-directory
        url: ldap://directory
        bind_dn: cn=service
        search_base: dc=example,dc=com
```

### MFA Configuration

```yaml
mfa:
  required: true
  methods:
    - type: totp
      issuer: ClusterDB
      digits: 6
    - type: webauthn
      relying_party: app.example.com
    - type: sms
      provider: twilio
      from: "+1234567890"
```

### Session Configuration

```yaml
session:
  store:
    type: redis
    url: redis://localhost:6379
    ttl: 24h
  
  cookie:
    name: session
    secure: true
    http_only: true
    same_site: strict
```

## API Reference

### Authentication Management

```rust
#[async_trait]
pub trait AuthManager: Send + Sync {
    async fn authenticate(&self, request: AuthRequest) -> Result<AuthResult>;
    async fn setup_mfa(&self, user_id: &str, method: MFAMethod) -> Result<MFASetup>;
    async fn verify_mfa(&self, request: MFARequest) -> Result<MFAResult>;
    async fn create_session(&self, request: SessionRequest) -> Result<Session>;
    async fn validate_session(&self, id: &str) -> Result<Session>;
}
```

### Token Management

```rust
#[async_trait]
pub trait TokenManager: Send + Sync {
    async fn create_token(&self, request: TokenRequest) -> Result<Token>;
    async fn validate_token(&self, token: &str) -> Result<Claims>;
    async fn refresh_token(&self, token: &str) -> Result<Token>;
    async fn revoke_token(&self, token: &str) -> Result<()>;
}
```

## Best Practices

1. **Authentication**
   - Multiple auth methods
   - Strong password policy
   - Rate limiting
   - Account lockout

2. **Multi-Factor Auth**
   - Multiple MFA options
   - Secure backup codes
   - Device management
   - Clear recovery process

3. **Sessions**
   - Secure session storage
   - Regular rotation
   - Proper timeout
   - Device tracking

4. **Security**
   - Use HTTPS
   - Token encryption
   - Audit logging
   - Regular rotation

## Examples

### Authentication Flow

```rust
use clusterdb::auth::{Auth, AuthRequest, MFARequest};

#[tokio::main]
async fn main() -> Result<()> {
    let auth = Auth::new(config)?;
    
    // First factor
    let auth_result = auth.authenticate(AuthRequest::OAuth2 {
        provider: "google",
        code: "code123",
    }).await?;
    
    // Second factor
    let mfa_result = auth.verify_mfa(MFARequest {
        user_id: auth_result.user_id,
        method: MFAMethod::TOTP,
        code: "123456",
    }).await?;
    
    // Create session
    let session = auth.create_session(SessionRequest {
        user_id: auth_result.user_id,
        mfa_verified: true,
    }).await?;
    
    println!("Session created: {}", session.id);
}
```

### Token Management

```rust
use clusterdb::auth::{Auth, TokenRequest};

#[tokio::main]
async fn main() -> Result<()> {
    let auth = Auth::new(config)?;
    
    // Create token
    let token = auth.create_token(TokenRequest {
        user_id: "user123",
        scopes: vec!["read", "write"],
        duration: Duration::from_hours(1),
    }).await?;
    
    // Validate token
    let claims = auth.validate_token(&token.access_token).await?;
    
    // Refresh when needed
    let new_token = auth.refresh_token(&token.refresh_token).await?;
}
```

## Integration

### With API Gateway

```rust
use clusterdb::{
    auth::Auth,
    gateway::{Gateway, AuthConfig},
};

// Configure gateway authentication
let config = AuthConfig::new()
    .with_jwt_auth(JWTConfig {
        issuer: "auth.example.com",
        audience: "api",
    })
    .with_key_auth(KeyConfig {
        header: "X-API-Key",
        prefix: "Bearer",
    });

gateway.configure_auth(auth, config).await?;
```

### With Service Mesh

```rust
use clusterdb::{
    auth::Auth,
    mesh::{ServiceMesh, AuthPolicy},
};

// Configure mesh authentication
let policy = AuthPolicy::new()
    .with_jwt_validation(true)
    .with_mtls(true)
    .with_principals(vec!["spiffe://cluster/service"]);

mesh.configure_auth(auth, policy).await?;
```

## Troubleshooting

### Common Issues

1. **Authentication Issues**
   ```
   Error: Invalid credentials
   Cause: Wrong username/password
   Solution: Verify credentials
   ```

2. **MFA Issues**
   ```
   Error: Invalid MFA code
   Cause: Time drift or wrong code
   Solution: Check time sync or regenerate
   ```

3. **Session Issues**
   ```
   Error: Session expired
   Cause: Timeout or manual logout
   Solution: Re-authenticate
   ```

### Debugging Tools

```bash
# Check auth status
auth status user123

# Test authentication
auth test-auth --provider google

# Verify MFA setup
auth verify-mfa user123
```

## Support

- [Auth Issues](https://github.com/clusterdb/clusterdb/issues)
- [Auth Documentation](https://docs.clusterdb.io/auth)
- [Community Support](https://slack.clusterdb.io)
