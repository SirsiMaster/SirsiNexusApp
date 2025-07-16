# Monitoring

The Monitoring component provides comprehensive observability features including metrics collection, logging, tracing, and alerting.

## Overview

The Monitoring component provides:
- Metrics collection and aggregation
- Distributed tracing
- Log aggregation and analysis
- Alerting and notification
- Performance monitoring 
- Health checking

## Features

### Metrics Collection

```rust
// Configure metrics
let metrics = Metrics::new()
    .with_name("api")
    .with_labels(HashMap::from([
        ("environment", "production"),
        ("region", "us-west"),
    ]))
    .with_collectors(vec![
        Collector::Prometheus {
            port: 9090,
            path: "/metrics",
        },
        Collector::StatsD {
            host: "localhost",
            port: 8125,
            prefix: "app",
        },
    ]);

monitoring.configure_metrics(metrics).await?;

// Record metrics
let counter = monitoring.create_counter("http_requests_total")
    .with_labels(HashMap::from([
        ("method", "GET"),
        ("path", "/api/v1/users"),
    ]))
    .register()
    .await?;

counter.increment(1);

let histogram = monitoring.create_histogram("request_duration_seconds")
    .with_buckets(vec![0.1, 0.5, 1.0, 2.0, 5.0])
    .register()
    .await?;

histogram.observe(0.2);
```

### Distributed Tracing

```rust
// Configure tracing
let tracing = Tracing::new()
    .with_service("api-service")
    .with_exporters(vec![
        Exporter::Jaeger {
            endpoint: "http://jaeger:14268/api/traces",
            agent_host: "jaeger",
            agent_port: 6831,
        },
        Exporter::Zipkin {
            endpoint: "http://zipkin:9411/api/v2/spans",
        },
    ])
    .with_sampling(Sampling::RateLimiting {
        rate: 100.0,
    });

monitoring.configure_tracing(tracing).await?;

// Create spans
let tracer = monitoring.get_tracer("api");

let root_span = tracer.start_span("handle_request")
    .with_attributes(vec![
        KeyValue::new("http.method", "GET"),
        KeyValue::new("http.path", "/api/v1/users"),
    ]);

let db_span = tracer.start_span("query_database")
    .with_parent(&root_span)
    .with_attributes(vec![
        KeyValue::new("db.system", "postgresql"),
        KeyValue::new("db.statement", "SELECT * FROM users"),
    ]);

// End spans
db_span.end();
root_span.end();
```

### Logging

```rust
// Configure logging
let logging = Logging::new()
    .with_format(LogFormat::Json)
    .with_level(Level::Info)
    .with_sinks(vec![
        Sink::Console,
        Sink::File {
            path: "/var/log/app.log",
            rotation: Some(RotationPolicy {
                max_size: ByteSize::mb(100),
                max_files: 5,
            }),
        },
        Sink::Elasticsearch {
            url: "http://elasticsearch:9200",
            index: "app-logs",
        },
    ]);

monitoring.configure_logging(logging).await?;

// Log events
let logger = monitoring.get_logger("api");

logger.info("Processing request",
    context!(
        method = "GET",
        path = "/api/v1/users",
        duration_ms = 150,
    ),
);

logger.error("Database connection failed",
    context!(
        error = error,
        retries = 3,
    ),
);
```

### Alerting

```rust
// Configure alerts
let alerts = Alerts::new()
    .with_rules(vec![
        AlertRule {
            name: "high_latency",
            query: "http_request_duration_p99 > 1.0",
            duration: Duration::from_minutes(5),
            severity: Severity::Warning,
            labels: HashMap::from([
                ("team", "platform"),
                ("service", "api"),
            ]),
            annotations: HashMap::from([
                ("summary", "High API latency detected"),
                ("description", "P99 latency is above 1s for 5 minutes"),
            ]),
        },
        AlertRule {
            name: "error_rate",
            query: "rate(http_errors_total[5m]) > 0.01",
            duration: Duration::from_minutes(10),
            severity: Severity::Critical,
            labels: HashMap::from([
                ("team", "platform"),
                ("service", "api"),
            ]),
        },
    ])
    .with_receivers(vec![
        Receiver::Email {
            name: "team-email",
            to: vec!["team@example.com"],
            from: "alerts@example.com",
        },
        Receiver::Slack {
            name: "team-slack",
            webhook: "https://hooks.slack.com/...",
            channel: "#alerts",
        },
        Receiver::PagerDuty {
            name: "oncall",
            routing_key: "key123",
            severity_mapping: HashMap::from([
                (Severity::Warning, "warning"),
                (Severity::Critical, "critical"),
            ]),
        },
    ]);

monitoring.configure_alerts(alerts).await?;
```

## Architecture

```plaintext
+------------------+
|    Monitoring    |
+------------------+
         |
+------------------+     +------------------+     +------------------+
| Metrics Service  |     | Tracing Service  |     | Logging Service |
+------------------+     +------------------+     +------------------+
         |                       |                        |
+------------------+     +------------------+     +------------------+
| Metric Store     |     | Trace Store      |     | Log Store       |
+------------------+     +------------------+     +------------------+
         |                       |                        |
+------------------+     +------------------+     +------------------+
| Alert Manager    |     | Query Service    |     | Analytics       |
+------------------+     +------------------+     +------------------+
```

### Components

1. **Metrics Service**
   - Collection
   - Aggregation
   - Storage
   - Query

2. **Tracing Service**
   - Span collection
   - Context propagation
   - Sampling
   - Export

3. **Logging Service**
   - Collection
   - Processing
   - Storage
   - Analysis

4. **Alert Manager**
   - Rule evaluation
   - Alert grouping
   - Notification
   - Silence management

## Configuration

### Metrics Configuration

```yaml
metrics:
  collectors:
    prometheus:
      port: 9090
      path: /metrics
    statsd:
      host: localhost
      port: 8125
      prefix: app
  
  storage:
    type: prometheus
    retention: 15d
    scrape_interval: 15s
  
  exporters:
    - type: prometheus
      port: 9090
    - type: statsd
      host: statsd
      port: 8125
```

### Tracing Configuration

```yaml
tracing:
  service: api-service
  environment: production
  
  sampling:
    type: probabilistic
    rate: 0.1
  
  exporters:
    jaeger:
      endpoint: http://jaeger:14268
      agent:
        host: jaeger
        port: 6831
    zipkin:
      endpoint: http://zipkin:9411
```

### Logging Configuration

```yaml
logging:
  format: json
  level: info
  
  sinks:
    console:
      enabled: true
    file:
      path: /var/log/app.log
      rotation:
        max_size: 100MB
        max_files: 5
    elasticsearch:
      url: http://elasticsearch:9200
      index: app-logs
```

## API Reference

### Metrics Management

```rust
#[async_trait]
pub trait MetricsManager: Send + Sync {
    async fn create_counter(&self, name: &str) -> Result<Counter>;
    async fn create_gauge(&self, name: &str) -> Result<Gauge>;
    async fn create_histogram(&self, name: &str) -> Result<Histogram>;
    async fn get_metric(&self, name: &str) -> Result<Metric>;
    async fn list_metrics(&self) -> Result<Vec<Metric>>;
}
```

### Tracing Management

```rust
#[async_trait]
pub trait TracingManager: Send + Sync {
    async fn create_tracer(&self, name: &str) -> Result<Tracer>;
    async fn get_span(&self, id: &str) -> Result<Span>;
    async fn list_traces(&self, query: TraceQuery) -> Result<Vec<Trace>>;
}
```

## Best Practices

1. **Metrics Collection**
   - Use consistent naming
   - Add relevant labels
   - Choose appropriate types
   - Document metrics

2. **Tracing**
   - Define span boundaries
   - Add context attributes
   - Configure sampling
   - Manage cardinality

3. **Logging**
   - Structured logging
   - Appropriate levels
   - Include context
   - Manage storage

4. **Alerting**
   - Clear alert conditions
   - Proper routing
   - Alert grouping
   - Runbook links

## Examples

### Metrics Collection

```rust
use clusterdb::monitoring::{Monitoring, MetricBuilder};

#[tokio::main]
async fn main() -> Result<()> {
    let monitoring = Monitoring::new(config)?;
    
    // Create metrics
    let request_counter = MetricBuilder::counter("http_requests_total")
        .with_description("Total HTTP requests")
        .with_label("method")
        .with_label("path")
        .build()?;
    
    // Record metrics
    request_counter
        .with_labels(&[("method", "GET"), ("path", "/api/users")])
        .increment(1);
    
    // Query metrics
    let result = monitoring.query("rate(http_requests_total[5m])")
        .await?;
    
    println!("Request rate: {:?}", result);
}
```

### Distributed Tracing

```rust
use clusterdb::monitoring::{Monitoring, Tracer};

#[tokio::main]
async fn main() -> Result<()> {
    let monitoring = Monitoring::new(config)?;
    
    // Create tracer
    let tracer = monitoring.create_tracer("order-service")?;
    
    // Create spans
    let order_span = tracer.start_span("process_order")
        .with_attributes(&[
            ("order_id", "12345"),
            ("customer_id", "67890"),
        ]);
    
    // Record events
    order_span.add_event("validating_payment")
        .with_attributes(&[
            ("amount", "100.00"),
            ("currency", "USD"),
        ]);
    
    // End span
    order_span.end();
}
```

## Integration

### With Service Mesh

```rust
use clusterdb::{
    monitoring::Monitoring,
    mesh::{ServiceMesh, MetricsConfig},
};

// Configure mesh metrics
let mesh_config = MetricsConfig::new()
    .with_metric("request_duration")
    .with_metric("request_size")
    .with_metric("response_size");

mesh.configure_metrics(monitoring, mesh_config).await?;
```

### With ML Platform

```rust
use clusterdb::{
    monitoring::Monitoring,
    ml::{MLPlatform, MetricsConfig},
};

// Configure ML metrics
let ml_config = MetricsConfig::new()
    .with_metric("training_duration")
    .with_metric("model_accuracy")
    .with_metric("prediction_latency");

ml.configure_metrics(monitoring, ml_config).await?;
```

## Troubleshooting

### Common Issues

1. **Metric Collection Issues**
   ```
   Error: Metric registration failed
   Cause: Duplicate metric name
   Solution: Use unique metric names
   ```

2. **Tracing Issues**
   ```
   Error: Span export failed
   Cause: Exporter connection error
   Solution: Check exporter connectivity
   ```

3. **Logging Issues**
   ```
   Error: Log shipping failed
   Cause: Log store unavailable
   Solution: Check log store status
   ```

### Debugging Tools

```bash
# Check metric status
monitoring metrics check

# Verify trace sampling
monitoring traces sampling-status

# Test alert rules
monitoring alerts test high-latency-rule
```

## Support

- [Monitoring Issues](https://github.com/clusterdb/clusterdb/issues)
- [Monitoring Documentation](https://docs.clusterdb.io/monitoring)
- [Community Support](https://slack.clusterdb.io)
