# Load Balancer

The Load Balancer provides traffic distribution and request routing capabilities across multiple service instances.

## Overview

The Load Balancer provides:
- Request routing
- Traffic distribution
- Health checking
- Circuit breaking
- Rate limiting
- SSL termination
- Access control

## Features

### Load Balancing

```rust
// Configure load balancer
let lb = LoadBalancer::new()
    .with_name("api-lb")
    .with_protocol(Protocol::Http)
    .with_algorithm(Algorithm::RoundRobin)
    .with_targets(vec![
        Target::new("api-1")
            .with_address("10.0.0.1:8080")
            .with_weight(100),
        Target::new("api-2")
            .with_address("10.0.0.2:8080")
            .with_weight(100),
    ])
    .with_health_check(HealthCheck {
        path: "/health",
        interval: Duration::from_secs(10),
        timeout: Duration::from_secs(2),
        healthy_threshold: 2,
        unhealthy_threshold: 3,
    })
    .with_circuit_breaker(CircuitBreaker {
        threshold: 0.5,
        min_requests: 100,
        interval: Duration::from_secs(60),
        half_open_timeout: Duration::from_secs(30),
    });

// Initialize load balancer
lb_manager.register(lb)?;

// Route request
let response = lb.route(request).await?;

// Update targets
lb.add_target(Target::new("api-3")
    .with_address("10.0.0.3:8080")
    .with_weight(100)).await?;

lb.remove_target("api-1").await?;
```

### Traffic Management

```rust
// Configure rules
let rules = vec![
    Rule::new("api-v2")
        .with_path("/api/v2/*")
        .with_method(Method::Any)
        .with_targets(vec!["api-v2-1", "api-v2-2"])
        .with_sticky_session(StickySession {
            cookie: "session_id",
            ttl: Duration::from_hours(1),
        }),
    Rule::new("api-canary")
        .with_header("X-Canary", "true")
        .with_targets(vec!["api-canary-1"])
        .with_weight(10),
];

// Apply rules
lb.set_rules(rules).await?;

// Rate limiting
let rate_limit = RateLimit::new()
    .with_limit(1000)
    .with_interval(Duration::from_secs(60))
    .with_key(|req| {
        // Extract rate limit key
        Ok(req.client_ip().to_string())
    });

lb.set_rate_limit(rate_limit).await?;
```

### Health Checking

```rust
// Configure health checker
let health = HealthChecker::new()
    .with_probes(vec![
        Probe::Http {
            path: "/health",
            method: Method::Get,
            headers: vec![
                ("User-Agent", "HealthCheck/1.0"),
            ],
            expected_status: 200,
            expected_body: None,
        },
        Probe::Tcp {
            port: 8080,
            timeout: Duration::from_secs(2),
        },
    ])
    .with_schedule(Schedule {
        interval: Duration::from_secs(10),
        timeout: Duration::from_secs(2),
        retry: 3,
    });

// Start health checking
lb.start_health_checks(health).await?;

// Handle health events
let mut events = lb.health_events();
while let Some(event) = events.next().await {
    match event {
        HealthEvent::Healthy { target } => {
            info!("Target healthy: {}", target);
        }
        HealthEvent::Unhealthy { target, reason } => {
            warn!("Target unhealthy: {} - {}", target, reason);
        }
    }
}
```

## Architecture

```plaintext
+------------------+     +------------------+     +------------------+
|  Balancer API    |     | Traffic Rules    |     |  Health Checks  |
+------------------+     +------------------+     +------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +------------------+     +------------------+
|    LB Manager    |<--->|  Target Groups  |<--->|  Health Store   |
+------------------+     +------------------+     +------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +------------------+     +------------------+
|   LB Engines     |     |  Stats Collector |     |   Rule Engine   |
+------------------+     +------------------+     +------------------+
```

### Components

1. **LB Manager**
   - Load balancer lifecycle
   - Configuration management
   - Target registration
   - Health coordination

2. **Target Groups**
   - Target management
   - Weight distribution
   - Session persistence
   - Load distribution

3. **Health Store**
   - Health state
   - Metrics collection
   - History tracking
   - Event generation

## Configuration

### Core Configuration

```yaml
load_balancer:
  listeners:
    - protocol: http
      port: 80
      ssl: false
      
    - protocol: https
      port: 443
      ssl:
        certificate: /etc/ssl/cert.pem
        private_key: /etc/ssl/key.pem
        
  algorithm: round_robin
  sticky_sessions: true
  
  health_check:
    enabled: true
    interval: 10s
    timeout: 2s
    healthy_threshold: 2
    unhealthy_threshold: 3
    
  circuit_breaker:
    enabled: true
    threshold: 0.5
    min_requests: 100
    interval: 60s
    
  rate_limit:
    enabled: true
    limit: 1000
    interval: 60s
```

### Traffic Rules

```yaml
rules:
  api_v2:
    path: /api/v2/*
    method: any
    targets:
      - api-v2-1
      - api-v2-2
    sticky_session:
      cookie: session_id
      ttl: 1h
      
  api_canary:
    header:
      name: X-Canary
      value: "true"
    targets:
      - api-canary-1
    weight: 10
```

## API Reference

### Load Balancer Management

```rust
#[async_trait]
pub trait LoadBalancerManager: Send + Sync {
    async fn register(&self, lb: LoadBalancer) -> Result<()>;
    async fn deregister(&self, name: &str) -> Result<()>;
    async fn get(&self, name: &str) -> Result<LoadBalancer>;
    async fn list(&self) -> Result<Vec<LoadBalancer>>;
}
```

### Traffic Management

```rust
#[async_trait]
pub trait TrafficManager: Send + Sync {
    async fn route(&self, request: Request) -> Result<Response>;
    async fn set_rules(&self, rules: Vec<Rule>) -> Result<()>;
    async fn get_rules(&self) -> Result<Vec<Rule>>;
}
```

### Health Management

```rust
#[async_trait]
pub trait HealthManager: Send + Sync {
    async fn check_health(&self, target: &Target) -> Result<Health>;
    async fn set_health(&self, target: &Target, health: Health) -> Result<()>;
    async fn get_health(&self, target: &Target) -> Result<Health>;
}
```

## Best Practices

1. **Load Distribution**
   - Even distribution
   - Target weights
   - Health awareness
   - Sticky sessions

2. **Health Checking**
   - Regular intervals
   - Multiple probes
   - Quick detection
   - Graceful recovery

3. **Traffic Management**
   - Rate limiting
   - Circuit breaking
   - Access control
   - SSL termination

4. **Monitoring**
   - Request metrics
   - Health status
   - Error rates
   - Latency tracking

## Examples

### Basic Usage

```rust
use sirsinexus::lb::{LoadBalancer, Target};

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize load balancer
    let lb = LoadBalancer::new()
        .with_name("api-lb")
        .with_protocol(Protocol::Http)
        .with_targets(vec![
            Target::new("api-1")
                .with_address("10.0.0.1:8080"),
            Target::new("api-2")
                .with_address("10.0.0.2:8080"),
        ])
        .build()?;
    
    // Route requests
    let response = lb.route(request).await?;
    println!("Response: {:?}", response);
}
```

### Custom Algorithm

```rust
use sirsinexus::lb::{Algorithm, Target};

#[derive(Debug)]
struct LeastConnections {
    connections: HashMap<String, u32>,
}

impl Algorithm for LeastConnections {
    fn select(&self, targets: &[Target]) -> Result<&Target> {
        targets
            .iter()
            .min_by_key(|t| self.connections.get(t.id()).unwrap_or(&0))
            .ok_or_else(|| Error::NoTargets)
    }
    
    fn record_metrics(&mut self, target: &Target, metrics: &Metrics) {
        self.connections.insert(
            target.id().to_string(),
            metrics.active_connections,
        );
    }
}
```

## Integration

### With Monitoring

```rust
use sirsinexus::{
    lb::LoadBalancer,
    monitoring::Monitor,
};

// Configure monitoring
let lb = LoadBalancer::new()
    .with_monitoring(Monitor::new()
        .with_metrics(vec![
            Metric::RequestRate,
            Metric::ErrorRate,
            Metric::Latency,
        ]))
    .build()?;
```

### With Service Discovery

```rust
use sirsinexus::{
    lb::LoadBalancer,
    discovery::ServiceDiscovery,
};

// Configure service discovery
let lb = LoadBalancer::new()
    .with_discovery(ServiceDiscovery::new()
        .with_provider(Provider::Consul {
            address: "consul:8500",
            service: "api",
        }))
    .build()?;
```

## Troubleshooting

### Common Issues

1. **No Healthy Targets**
   ```
   Error: No healthy targets available
   Cause: All targets failed health checks
   Solution: Check target health and thresholds
   ```

2. **High Latency**
   ```
   Error: High request latency
   Cause: Target overload or network issues
   Solution: Add capacity or check network
   ```

3. **Circuit Open**
   ```
   Error: Circuit breaker open
   Cause: High error rate
   Solution: Check target errors and threshold
   ```

### Debugging Tools

```bash
# View load balancer status
sirsinexus lb status api-lb

# Check target health
sirsinexus lb health api-lb

# View traffic metrics
sirsinexus lb metrics api-lb
```

## Support

- [Load Balancer Issues](https://github.com/sirsinexus/sirsinexus/issues)
- [Load Balancer Documentation](https://docs.sirsinexus.io/load-balancer)
- [Community Support](https://slack.sirsinexus.io)
