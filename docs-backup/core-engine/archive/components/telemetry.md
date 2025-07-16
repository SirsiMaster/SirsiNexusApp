# Telemetry

The Telemetry component provides comprehensive observability capabilities including metrics collection, distributed tracing, and logging.

## Overview

The Telemetry component provides:
- Metrics collection and aggregation
- Distributed tracing
- Structured logging
- Event correlation
- Alerting and notifications
- Performance monitoring
- Health checking

## Features

### Metrics Collection

```rust
// Configure metrics
let metrics = MetricsConfig {
    service: "api-service",
    environment: "production",
    labels: HashMap::from([
        ("team", "platform"),
        ("region", "us-west"),
    ]),
    collectors: vec![
        Collector::Prometheus {
            port: 9090,
            path: "/metrics",
            retention: Duration::from_days(15),
        },
        Collector::StatsD {
            host: "statsd:8125",
            prefix: "api",
            flush_interval: Duration::from_secs(10),
        },
    ],
    exporters: vec![
        Exporter::Prometheus {
            endpoint: "http://prometheus:9090/api/v1/write",
        },
        Exporter::DataDog {
            api_key: "key123",
            site: "datadoghq.com",
        },
    ],
    rules: vec![
        AggregationRule {
            name: "request_rate",
            query: "sum(rate(http_requests_total[5m])) by (service)",
            interval: Duration::from_minutes(5),
        },
    ],
};

telemetry.configure_metrics(metrics).await?;

// Record metrics
let counter = telemetry.create_counter("http_requests_total")
    .with_labels(HashMap::from([
        ("method", "GET"),
        ("path", "/api/users"),
        ("status", "200"),
    ]))
    .register()
    .await?;

counter.increment(1);

let histogram = telemetry.create_histogram("request_duration_seconds")
    .with_labels(HashMap::from([
        ("method", "GET"),
        ("path", "/api/users"),
    ]))
    .with_buckets(vec![0.01, 0.05, 0.1, 0.5, 1.0])
    .register()
    .await?;

histogram.observe(0.23);
```

### Distributed Tracing

```rust
// Configure tracing
let tracing = TracingConfig {
    service: "api-service",
    environment: "production",
    sampling: Sampling::RateLimiting {
        rate: 100.0, // traces per second
    },
    exporters: vec![
        TracingExporter::Jaeger {
            endpoint: "http://jaeger:14268/api/traces",
            agent: AgentConfig {
                host: "jaeger-agent",
                port: 6831,
                max_packet_size: 65000,
            },
        },
        TracingExporter::Zipkin {
            endpoint: "http://zipkin:9411/api/v2/spans",
            local_endpoint: Some(Endpoint {
                service_name: "api-service",
                ipv4: Some("10.0.0.1"),
                port: Some(8080),
            }),
        },
    ],
    propagation: vec![
        PropagationType::B3,
        PropagationType::W3C,
    ],
    resource_attributes: HashMap::from([
        ("service.name", "api-service"),
        ("service.version", "1.0.0"),
    ]),
};

telemetry.configure_tracing(tracing).await?;

// Create trace spans
let tracer = telemetry.get_tracer("api");

let root_span = tracer.start_span("handle_request")
    .with_attributes(vec![
        KeyValue::new("http.method", "GET"),
        KeyValue::new("http.path", "/api/users"),
    ]);

let db_span = tracer.start_span("query_database")
    .with_parent(&root_span)
    .with_attributes(vec![
        KeyValue::new("db.system", "postgresql"),
        KeyValue::new("db.statement", "SELECT * FROM users"),
    ]);

// Record events and errors
db_span.add_event("query_start")
    .with_attributes(vec![
        KeyValue::new("query_id", "123"),
    ]);

if let Err(e) = execute_query().await {
    db_span.record_error(&e)
        .with_attributes(vec![
            KeyValue::new("error.type", e.type_name()),
        ]);
}

db_span.add_event("query_complete");
db_span.end();

root_span.set_status(Status::Ok);
root_span.end();
```

### Structured Logging

```rust
// Configure logging
let logging = LoggingConfig {
    level: Level::Info,
    format: LogFormat::Json,
    service: "api-service",
    environment: "production",
    sinks: vec![
        LogSink::Console {
            pretty: true,
        },
        LogSink::File {
            path: "/var/log/app.log",
            rotation: Some(RotationPolicy {
                max_size: ByteSize::mb(100),
                max_files: 5,
                compress: true,
            }),
        },
        LogSink::Elasticsearch {
            url: "http://elasticsearch:9200",
            index_pattern: "logs-%Y.%m.%d",
            buffer_size: 1000,
            flush_interval: Duration::from_secs(1),
        },
    ],
    processors: vec![
        LogProcessor::AddFields {
            fields: HashMap::from([
                ("service", "api-service"),
                ("version", "1.0.0"),
            ]),
        },
        LogProcessor::Filter {
            field: "path",
            exclude: vec!["/health", "/metrics"],
        },
    ],
};

telemetry.configure_logging(logging).await?;

// Create structured logs
let logger = telemetry.get_logger("api");

logger.info("Processing request",
    context!(
        method = "GET",
        path = "/api/users",
        user_id = user.id,
        duration_ms = duration.as_millis(),
    ),
);

if let Err(e) = process_request().await {
    logger.error("Request failed",
        context!(
            error = error::Error(&e),
            method = "GET",
            path = "/api/users",
            status = 500,
        ),
    );
}
```

### Health Checks

```rust
// Configure health checks
let health = HealthConfig {
    checks: vec![
        HealthCheck {
            name: "database",
            check: Check::TCP {
                host: "database",
                port: 5432,
                timeout: Duration::from_secs(5),
            },
            interval: Duration::from_secs(30),
            timeout: Duration::from_secs(5),
            unhealthy_threshold: 3,
            healthy_threshold: 2,
        },
        HealthCheck {
            name: "redis",
            check: Check::HTTP {
                url: "http://redis:8001/health",
                method: Method::GET,
                timeout: Duration::from_secs(5),
                expected_status: 200,
                headers: HashMap::new(),
            },
            interval: Duration::from_secs(30),
            timeout: Duration::from_secs(5),
            unhealthy_threshold: 3,
            healthy_threshold: 2,
        },
        HealthCheck {
            name: "disk-space",
            check: Check::Script {
                command: vec!["check-disk-space", "--threshold", "90"],
                timeout: Duration::from_secs(30),
            },
            interval: Duration::from_minutes(5),
            timeout: Duration::from_secs(30),
            unhealthy_threshold: 2,
            healthy_threshold: 1,
        },
    ],
    readiness_endpoint: "/ready",
    liveness_endpoint: "/health",
};

telemetry.configure_health(health).await?;
```

## Architecture

```plaintext
+------------------+
|    Telemetry     |
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
| Alert Manager    |     | Health Checker   |     | Analytics       |
+------------------+     +------------------+     +------------------+
```

### Components

1. **Metrics Service**
   - Collection
   - Aggregation
   - Storage
   - Querying

2. **Tracing Service**
   - Span collection
   - Context propagation
   - Trace storage
   - Trace analysis

3. **Logging Service**
   - Log collection
   - Log processing
   - Log storage
   - Log analysis

4. **Health Checker**
   - Health checks
   - Readiness probes
   - Liveness probes
   - Status reporting

## Configuration

### Metrics Configuration

```yaml
metrics:
  service: api-service
  environment: production
  
  collectors:
    prometheus:
      port: 9090
      path: /metrics
      retention: 15d
    statsd:
      host: statsd:8125
      prefix: api
      flush_interval: 10s
  
  exporters:
    - type: prometheus
      endpoint: http://prometheus:9090
    - type: datadog
      api_key: key123
      site: datadoghq.com
```

### Tracing Configuration

```yaml
tracing:
  service: api-service
  environment: production
  
  sampling:
    type: rate_limiting
    rate: 100
  
  exporters:
    jaeger:
      endpoint: http://jaeger:14268
      agent:
        host: jaeger-agent
        port: 6831
    zipkin:
      endpoint: http://zipkin:9411
```

### Logging Configuration

```yaml
logging:
  level: info
  format: json
  
  sinks:
    - type: console
      pretty: true
    - type: file
      path: /var/log/app.log
      rotation:
        max_size: 100MB
        max_files: 5
    - type: elasticsearch
      url: http://elasticsearch:9200
      index: logs-%Y.%m.%d
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
    async fn get_tracer(&self, name: &str) -> Result<Tracer>;
    async fn get_span(&self, id: &str) -> Result<Span>;
    async fn list_traces(&self, query: TraceQuery) -> Result<Vec<Trace>>;
}
```

## Best Practices

1. **Metrics Collection**
   - Use consistent naming
   - Label appropriately
   - Choose proper types
   - Set retention policies

2. **Tracing**
   - Sample appropriately
   - Add context
   - Track errors
   - Monitor latency

3. **Logging**
   - Structured logging
   - Proper log levels
   - Include context
   - Rotate logs

4. **Health Checks**
   - Check dependencies
   - Set timeouts
   - Monitor thresholds
   - Alert on failures

## Examples

### Metrics Recording

```rust
use clusterdb::telemetry::{Telemetry, Counter, Labels};

#[tokio::main]
async fn main() -> Result<()> {
    let telemetry = Telemetry::new(config)?;
    
    // Create counter
    let requests = Counter::new("http_requests_total")
        .with_description("Total HTTP requests")
        .with_label_keys(&["method", "path", "status"])
        .register()?;
    
    // Record metrics
    requests.with_labels(&[
        ("method", "GET"),
        ("path", "/api/users"),
        ("status", "200"),
    ]).increment(1);
}
```

### Trace Creation

```rust
use clusterdb::telemetry::{Telemetry, Tracer};

#[tokio::main]
async fn main() -> Result<()> {
    let telemetry = Telemetry::new(config)?;
    let tracer = telemetry.get_tracer("app")?;
    
    // Create span
    let span = tracer.start_span("process_request")
        .with_attribute("request_id", "req-123");
    
    // Record events
    span.add_event("starting_process");
    process_request().await?;
    span.add_event("completed_process");
    
    // End span
    span.end();
}
```

## Integration

### With Service Mesh

```rust
use clusterdb::{
    telemetry::Telemetry,
    mesh::{ServiceMesh, TelemetryConfig},
};

// Configure mesh telemetry
let config = TelemetryConfig::new()
    .with_metrics(true)
    .with_tracing(true)
    .with_logging(LogConfig {
        level: Level::Info,
        format: LogFormat::Json,
    });

mesh.configure_telemetry(telemetry, config).await?;
```

### With API Gateway

```rust
use clusterdb::{
    telemetry::Telemetry,
    gateway::{Gateway, TelemetryConfig},
};

// Configure gateway telemetry
let config = TelemetryConfig::new()
    .with_request_logging(true)
    .with_metrics(MetricsConfig {
        request_duration: true,
        response_size: true,
    })
    .with_tracing(TracingConfig {
        enabled: true,
        sample_rate: 0.1,
    });

gateway.configure_telemetry(telemetry, config).await?;
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
   Error: Trace export failed
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
telemetry metrics list

# View recent traces
telemetry traces search --service api-service

# Tail logs
telemetry logs tail --service api-service
```

## Support

- [Telemetry Issues](https://github.com/clusterdb/clusterdb/issues)
- [Telemetry Documentation](https://docs.clusterdb.io/telemetry)
- [Community Support](https://slack.clusterdb.io)
