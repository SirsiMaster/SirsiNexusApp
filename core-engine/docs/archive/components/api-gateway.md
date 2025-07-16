# API Gateway

The API Gateway component provides comprehensive API management capabilities including routing, authentication, rate limiting, and API lifecycle management.

## Overview

The API Gateway provides:
- API routing and versioning
- Authentication and authorization
- Rate limiting and throttling
- Request/response transformation
- API documentation
- API analytics
- API monitoring

## Features

### API Routing

```rust
// Configure API routes
let routes = ApiRoutes {
    name: "api-routes",
    base_path: "/api/v1",
    routes: vec![
        Route {
            path: "/users",
            methods: vec![Method::GET, Method::POST],
            backend: Backend::Service {
                name: "user-service",
                namespace: "default",
                port: 8080,
            },
            timeout: Duration::from_secs(5),
            retry: RetryPolicy {
                max_attempts: 3,
                initial_delay: Duration::from_millis(100),
                max_delay: Duration::from_secs(1),
                multiplier: 2.0,
            },
            cors: Some(CorsPolicy {
                allowed_origins: vec!["https://app.example.com"],
                allowed_methods: vec![Method::GET, Method::POST],
                allowed_headers: vec!["Content-Type", "Authorization"],
                expose_headers: vec!["X-Request-ID"],
                max_age: Duration::from_secs(3600),
                allow_credentials: true,
            }),
            transform: Some(Transform {
                request: vec![
                    Transformation::AddHeader {
                        name: "X-Source",
                        value: "api-gateway",
                    },
                ],
                response: vec![
                    Transformation::RemoveHeader {
                        name: "Server",
                    },
                ],
            }),
        },
        Route {
            path: "/orders",
            methods: vec![Method::GET, Method::POST, Method::PUT],
            backend: Backend::Service {
                name: "order-service",
                namespace: "default",
                port: 8080,
            },
            timeout: Duration::from_secs(10),
            circuit_breaker: Some(CircuitBreaker {
                max_requests: 100,
                error_threshold: 0.5,
                break_duration: Duration::from_secs(30),
            }),
            load_balancer: Some(LoadBalancer {
                algorithm: Algorithm::LeastConn,
                healthy_threshold: 2,
                unhealthy_threshold: 3,
                check_interval: Duration::from_secs(10),
            }),
        },
    ],
    middleware: vec![
        Middleware::RateLimit {
            requests_per_second: 1000,
            burst_size: 50,
        },
        Middleware::Authentication {
            providers: vec![
                AuthProvider::JWT {
                    issuer: "auth0",
                    jwks_url: "https://auth.example.com/.well-known/jwks.json",
                    audience: "api",
                },
            ],
        },
        Middleware::Logging {
            format: LogFormat::Json,
            fields: vec!["method", "path", "status", "duration"],
        },
    ],
};

gateway.create_routes(routes).await?;
```

### Authentication & Authorization

```rust
// Configure authentication
let auth = AuthConfig {
    providers: vec![
        Provider::OAuth2 {
            name: "auth0",
            issuer: "https://auth.example.com",
            client_id: "client123",
            client_secret: "secret123",
            authorize_url: "https://auth.example.com/authorize",
            token_url: "https://auth.example.com/oauth/token",
            jwks_url: "https://auth.example.com/.well-known/jwks.json",
            scopes: vec!["read", "write"],
        },
        Provider::ApiKey {
            name: "api-keys",
            header: "X-API-Key",
            validation: KeyValidation::Internal {
                keys: HashMap::from([
                    ("key123", ApiKeyConfig {
                        owner: "service-a",
                        scopes: vec!["read"],
                        expires_at: None,
                    }),
                ]),
            },
        },
    ],
    session: SessionConfig {
        store: SessionStore::Redis {
            url: "redis://localhost:6379",
            prefix: "session",
            ttl: Duration::from_hours(24),
        },
        cookie: CookieConfig {
            name: "session",
            domain: "example.com",
            secure: true,
            http_only: true,
            same_site: SameSite::Strict,
        },
    },
};

gateway.configure_auth(auth).await?;

// Configure authorization
let authz = AuthzConfig {
    policies: vec![
        Policy {
            name: "api-access",
            effect: Effect::Allow,
            principals: vec!["role:api-user"],
            resources: vec!["api://*"],
            conditions: Some(Conditions {
                ip_range: vec!["10.0.0.0/8"],
                time_window: TimeWindow {
                    start: "09:00",
                    end: "17:00",
                    timezone: "UTC",
                },
            }),
        },
    ],
    default_policy: Effect::Deny,
};

gateway.configure_authz(authz).await?;
```

### Rate Limiting

```rust
// Configure rate limiting
let rate_limit = RateLimitConfig {
    rules: vec![
        RateLimit {
            name: "default",
            requests_per_second: 1000,
            burst_size: 50,
            scope: Scope::Global,
        },
        RateLimit {
            name: "api-keys",
            requests_per_second: 100,
            burst_size: 20,
            scope: Scope::Key {
                header: "X-API-Key",
            },
        },
        RateLimit {
            name: "ip-based",
            requests_per_second: 10,
            burst_size: 5,
            scope: Scope::IP,
        },
    ],
    storage: RateLimitStorage::Redis {
        url: "redis://localhost:6379",
        prefix: "ratelimit",
    },
    response: RateLimitResponse {
        status_code: 429,
        headers: true,
    },
};

gateway.configure_rate_limit(rate_limit).await?;
```

### API Documentation

```rust
// Configure API documentation
let docs = ApiDocs {
    title: "API Documentation",
    version: "1.0.0",
    description: "API Gateway documentation",
    servers: vec![
        Server {
            url: "https://api.example.com",
            description: "Production API",
        },
    ],
    security_schemes: vec![
        SecurityScheme::OAuth2 {
            name: "oauth2",
            flows: OAuth2Flows {
                authorization_code: Some(OAuth2Flow {
                    authorization_url: "https://auth.example.com/authorize",
                    token_url: "https://auth.example.com/token",
                    scopes: vec!["read", "write"],
                }),
            },
        },
    ],
    paths: vec![
        PathItem {
            path: "/users",
            operations: vec![
                Operation {
                    method: Method::GET,
                    summary: "List users",
                    parameters: vec![
                        Parameter {
                            name: "limit",
                            in_: ParameterLocation::Query,
                            required: false,
                            schema: Schema::Integer {
                                format: "int32",
                                minimum: Some(1),
                                maximum: Some(100),
                                default: Some(10),
                            },
                        },
                    ],
                    responses: HashMap::from([
                        (200, Response {
                            description: "List of users",
                            content: Some(Content {
                                media_type: "application/json",
                                schema: Schema::Array {
                                    items: Box::new(Schema::Reference {
                                        ref_: "#/components/schemas/User",
                                    }),
                                },
                            }),
                        }),
                    ]),
                    security: vec![
                        SecurityRequirement::OAuth2 {
                            name: "oauth2",
                            scopes: vec!["read"],
                        },
                    ],
                },
            ],
        },
    ],
};

gateway.configure_docs(docs).await?;
```

## Architecture

```plaintext
+------------------+
|   API Gateway    |
+------------------+
         |
+------------------+     +------------------+     +------------------+
|  Route Manager   |     |  Auth Manager    |     | Rate Limiter    |
+------------------+     +------------------+     +------------------+
         |                       |                        |
+------------------+     +------------------+     +------------------+
| Load Balancer    |     | Cache Manager    |     | Monitor Service |
+------------------+     +------------------+     +------------------+
         |                       |                        |
+------------------+     +------------------+     +------------------+
| Service Registry |     | Config Store     |     | Analytics       |
+------------------+     +------------------+     +------------------+
```

### Components

1. **Route Manager**
   - Route configuration
   - Request routing
   - Load balancing
   - Circuit breaking

2. **Auth Manager**
   - Authentication
   - Authorization
   - Key management
   - Session handling

3. **Rate Limiter**
   - Rate limiting
   - Throttling
   - Quota management
   - Usage tracking

4. **Monitor Service**
   - API metrics
   - Request logging
   - Error tracking
   - Performance monitoring

## Configuration

### Gateway Configuration

```yaml
gateway:
  host: 0.0.0.0
  port: 8080
  
  tls:
    enabled: true
    cert_file: /certs/server.crt
    key_file: /certs/server.key
  
  middleware:
    cors:
      enabled: true
      allowed_origins: ["https://app.example.com"]
    compression:
      enabled: true
      level: 6
```

### Route Configuration

```yaml
routes:
  - path: /api/v1/users
    methods: [GET, POST]
    backend:
      service: user-service
      port: 8080
    timeout: 5s
    retry:
      max_attempts: 3
      initial_delay: 100ms
```

### Auth Configuration

```yaml
auth:
  providers:
    oauth2:
      - name: auth0
        issuer: https://auth.example.com
        jwks_url: https://auth.example.com/.well-known/jwks.json
    api_key:
      header: X-API-Key
      validation: internal
```

## API Reference

### Route Management

```rust
#[async_trait]
pub trait RouteManager: Send + Sync {
    async fn create_route(&self, route: Route) -> Result<Route>;
    async fn update_route(&self, name: &str, route: Route) -> Result<Route>;
    async fn delete_route(&self, name: &str) -> Result<()>;
    async fn get_route(&self, name: &str) -> Result<Route>;
    async fn list_routes(&self) -> Result<Vec<Route>>;
}
```

### Auth Management

```rust
#[async_trait]
pub trait AuthManager: Send + Sync {
    async fn configure_auth(&self, config: AuthConfig) -> Result<()>;
    async fn create_api_key(&self, key: ApiKey) -> Result<ApiKey>;
    async fn validate_token(&self, token: &str) -> Result<Claims>;
    async fn revoke_token(&self, token: &str) -> Result<()>;
}
```

## Best Practices

1. **API Design**
   - Consistent naming
   - Version APIs
   - Use proper HTTP methods
   - Handle errors properly

2. **Security**
   - Use HTTPS
   - Implement authentication
   - Enable rate limiting
   - Monitor for threats

3. **Performance**
   - Enable caching
   - Use compression
   - Monitor latency
   - Implement timeouts

4. **Monitoring**
   - Log all requests
   - Track API usage
   - Monitor errors
   - Set up alerts

## Examples

### Route Configuration

```rust
use clusterdb::gateway::{Gateway, Route, Backend};

#[tokio::main]
async fn main() -> Result<()> {
    let gateway = Gateway::new(config)?;
    
    // Configure route
    let route = Route::new("/api/v1/users")
        .with_methods(vec![Method::GET, Method::POST])
        .with_backend(Backend::Service {
            name: "user-service",
            port: 8080,
        })
        .with_timeout(Duration::from_secs(5));
    
    gateway.create_route(route).await?;
    
    // Monitor route
    let metrics = gateway.watch_route_metrics("users")
        .await
        .for_each(|metric| {
            println!("Route metric: {:?}", metric);
        });
}
```

### Authentication Setup

```rust
use clusterdb::gateway::{Gateway, AuthConfig, Provider};

#[tokio::main]
async fn main() -> Result<()> {
    let gateway = Gateway::new(config)?;
    
    // Configure auth
    let auth = AuthConfig::new()
        .with_provider(Provider::OAuth2 {
            name: "auth0",
            issuer: "https://auth.example.com",
        })
        .with_session_store(SessionStore::Redis {
            url: "redis://localhost",
        });
    
    gateway.configure_auth(auth).await?;
    
    // Create API key
    let key = gateway.create_api_key(ApiKeyConfig {
        name: "service-a",
        scopes: vec!["read", "write"],
    }).await?;
    
    println!("API Key: {}", key.value);
}
```

## Integration

### With Monitoring

```rust
use clusterdb::{
    gateway::Gateway,
    monitoring::{Monitor, MetricsConfig},
};

// Configure API monitoring
let metrics = MetricsConfig::new()
    .with_metric("request_count")
    .with_metric("response_time")
    .with_metric("error_rate")
    .with_alerts(AlertConfig {
        error_threshold: 0.01,
        latency_threshold_ms: 500,
    });

gateway.configure_monitoring(metrics).await?;
```

### With Service Mesh

```rust
use clusterdb::{
    gateway::Gateway,
    mesh::{ServiceMesh, GatewayPolicy},
};

// Configure mesh integration
let policy = GatewayPolicy::new()
    .with_mtls(true)
    .with_traffic_policy(TrafficPolicy {
        load_balancer: LoadBalancerType::RoundRobin,
        timeout: Duration::from_secs(5),
    });

mesh.configure_gateway(gateway, policy).await?;
```

## Troubleshooting

### Common Issues

1. **Routing Issues**
   ```
   Error: Service not found
   Cause: Incorrect service name
   Solution: Verify service registration
   ```

2. **Auth Issues**
   ```
   Error: Invalid token
   Cause: Expired or malformed token
   Solution: Check token validity and format
   ```

3. **Rate Limit Issues**
   ```
   Error: Too many requests
   Cause: Rate limit exceeded
   Solution: Implement backoff or increase limits
   ```

### Debugging Tools

```bash
# Check route status
gateway route status /api/v1/users

# Test authentication
gateway auth test-token "token"

# Monitor API traffic
gateway monitor traffic
```

## Support

- [Gateway Issues](https://github.com/clusterdb/clusterdb/issues)
- [Gateway Documentation](https://docs.clusterdb.io/gateway)
- [Community Support](https://slack.clusterdb.io)
