# Logging

The Logging component provides centralized logging capabilities with features for log collection, processing, and analysis.

## Overview

The Logging component provides:
- Log collection
- Log processing
- Log storage
- Log analysis
- Log forwarding
- Search capabilities
- Monitoring integration

## Features

### Log Management

```rust
// Configure logger
let logger = Logger::new()
    .with_level(Level::Info)
    .with_format(Format::Json)
    .with_target("sirsinexus")
    .with_metadata(metadata! {
        version => env!("CARGO_PKG_VERSION"),
        environment => "production",
    })
    .with_outputs(vec![
        Output::File {
            path: "/var/log/sirsinexus.log",
            rotation: Rotation {
                size: 100 * 1024 * 1024, // 100MB
                keep: 7,
                compress: true,
            },
        },
        Output::Syslog {
            facility: Facility::Daemon,
            tag: "sirsinexus",
        },
    ]);

// Initialize logger
logging.init(logger)?;

// Log messages
info!("System started");
warn!("Resource usage high: {}", usage);
error!("Failed to process request: {}", error);

// Structured logging
info!(
    event = "user_login",
    user_id = user.id,
    ip = remote_addr,
    "User logged in successfully"
);
```

### Log Processing

```rust
// Configure processors
let processors = vec![
    Processor::Filter {
        field: "level",
        operator: Operator::GreaterOrEqual,
        value: Level::Warn,
    },
    Processor::Transform {
        field: "timestamp",
        transform: Transform::DateTime {
            format: "%Y-%m-%d %H:%M:%S",
            timezone: "UTC",
        },
    },
    Processor::Enrich {
        source: EnrichSource::GeoIP {
            field: "ip",
            database: "/var/lib/geoip/GeoLite2-City.mmdb",
        },
    },
];

// Apply processors
logging.add_processors(processors)?;

// Process logs
let processed = logging.process_logs(logs).await?;
```

### Log Analysis

```rust
// Configure analysis
let analysis = Analysis::new()
    .with_query(Query::new()
        .with_field("level", Operator::Equal, Level::Error)
        .with_field("timestamp", Operator::Range {
            start: "2025-06-24T00:00:00Z",
            end: "2025-06-25T00:00:00Z",
        }))
    .with_aggregations(vec![
        Aggregation::Count { field: "error_code" },
        Aggregation::Cardinality { field: "user_id" },
        Aggregation::Percentiles {
            field: "duration",
            percentiles: vec![50.0, 95.0, 99.0],
        },
    ])
    .with_options(AnalysisOptions {
        timeout: Duration::from_secs(30),
        limit: 1000,
    });

// Run analysis
let results = logging.analyze(analysis).await?;

// Process results
for result in results {
    match result {
        AnalysisResult::Count { field, value } => {
            info!("Count of {}: {}", field, value);
        }
        AnalysisResult::Cardinality { field, value } => {
            info!("Unique {} count: {}", field, value);
        }
        AnalysisResult::Percentiles { field, values } => {
            info!("Percentiles for {}:", field);
            for (p, v) in values {
                info!("  p{}: {}", p, v);
            }
        }
    }
}
```

## Architecture

```plaintext
+------------------+     +------------------+     +------------------+
|   Logging API    |     | Log Processors   |     |  Log Analysis   |
+------------------+     +------------------+     +------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +------------------+     +------------------+
|  Logger Manager  |<--->|   Log Store     |<--->|   Log Cache     |
+------------------+     +------------------+     +------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +------------------+     +------------------+
|   Log Outputs    |     |  Log Forwarders  |     | Search Engine  |
+------------------+     +------------------+     +------------------+
```

### Components

1. **Logger Manager**
   - Log collection
   - Level filtering
   - Format handling
   - Output routing

2. **Log Store**
   - Log persistence
   - Index management
   - Retention policies
   - Query handling

3. **Log Processors**
   - Filtering
   - Transformation
   - Enrichment
   - Aggregation

## Configuration

### Core Configuration

```yaml
logging:
  level: info
  format: json
  target: sirsinexus
  
  outputs:
    - type: file
      path: /var/log/sirsinexus.log
      rotation:
        size: 100MB
        keep: 7
        compress: true
        
    - type: syslog
      facility: daemon
      tag: sirsinexus
      
    - type: elasticsearch
      hosts: ["http://elasticsearch:9200"]
      index: sirsinexus-logs
      
  processors:
    - type: filter
      field: level
      operator: gte
      value: warn
      
    - type: transform
      field: timestamp
      transform:
        type: datetime
        format: "%Y-%m-%d %H:%M:%S"
        timezone: UTC
        
    - type: enrich
      source:
        type: geoip
        field: ip
        database: /var/lib/geoip/GeoLite2-City.mmdb
        
  retention:
    duration: 30d
    size: 500GB
```

### Log Format

```yaml
formats:
  json:
    timestamp_field: "@timestamp"
    level_field: level
    message_field: message
    metadata_field: metadata
    
  text:
    pattern: "{d} {l} {t} {m}{n}"
    timestamp_format: "%Y-%m-%d %H:%M:%S"
    color: true
```

## API Reference

### Logger Management

```rust
#[async_trait]
pub trait LoggerManager: Send + Sync {
    async fn log(&self, record: LogRecord) -> Result<()>;
    async fn flush(&self) -> Result<()>;
    async fn shutdown(&self) -> Result<()>;
}
```

### Log Processing

```rust
#[async_trait]
pub trait LogProcessor: Send + Sync {
    async fn process(&self, record: LogRecord) -> Result<LogRecord>;
    async fn batch_process(&self, records: Vec<LogRecord>) -> Result<Vec<LogRecord>>;
}
```

### Log Analysis

```rust
#[async_trait]
pub trait LogAnalyzer: Send + Sync {
    async fn analyze(&self, query: Query) -> Result<Vec<AnalysisResult>>;
    async fn search(&self, query: Query) -> Result<SearchResults>;
}
```

## Best Practices

1. **Log Management**
   - Structured logging
   - Appropriate levels
   - Clear messages
   - Contextual metadata

2. **Performance**
   - Async logging
   - Batching
   - Buffer management
   - Resource limits

3. **Security**
   - Sensitive data filtering
   - Access control
   - Secure transport
   - Audit logging

4. **Operational**
   - Log rotation
   - Storage monitoring
   - Error handling
   - Backup strategy

## Examples

### Basic Usage

```rust
use sirsinexus::logging::{Logger, Level, Format};

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logger
    let logger = Logger::new()
        .with_level(Level::Info)
        .with_format(Format::Json)
        .with_output(Output::File {
            path: "/var/log/app.log",
            rotation: Rotation::default(),
        })
        .build()?;
    
    // Log messages
    info!("Application started");
    
    // Structured logging
    info!(
        event = "user_action",
        user_id = 123,
        action = "login",
        "User logged in"
    );
}
```

### Custom Processor

```rust
use sirsinexus::logging::{LogProcessor, LogRecord};

#[derive(Debug)]
struct SensitiveDataFilter {
    patterns: Vec<Regex>,
}

#[async_trait]
impl LogProcessor for SensitiveDataFilter {
    async fn process(&self, mut record: LogRecord) -> Result<LogRecord> {
        for pattern in &self.patterns {
            record.message = pattern.replace_all(&record.message, "[REDACTED]");
        }
        Ok(record)
    }
}
```

## Integration

### With Monitoring

```rust
use sirsinexus::{
    logging::Logger,
    monitoring::Monitor,
};

// Configure with monitoring
let logger = Logger::new()
    .with_monitoring(Monitor::new()
        .with_metrics(vec![
            Metric::LogVolume,
            Metric::ErrorRate,
            Metric::ProcessingLatency,
        ]))
    .build()?;
```

### With Tracing

```rust
use sirsinexus::{
    logging::Logger,
    tracing::Tracer,
};

// Configure with tracing
let logger = Logger::new()
    .with_tracer(Tracer::new()
        .with_service("sirsinexus")
        .with_version("1.0.0"))
    .build()?;
```

## Troubleshooting

### Common Issues

1. **High Volume**
   ```
   Error: Log buffer overflow
   Cause: Too many log messages
   Solution: Increase buffer size or add filtering
   ```

2. **Disk Space**
   ```
   Error: Failed to write log
   Cause: Insufficient disk space
   Solution: Free space or adjust retention
   ```

3. **Performance**
   ```
   Error: High logging latency
   Cause: Slow processing or I/O
   Solution: Optimize processors or outputs
   ```

### Debugging Tools

```bash
# View logs
sirsinexus logs view

# Search logs
sirsinexus logs search --level error --since 1h

# Analyze logs
sirsinexus logs analyze --metric error_rate --window 15m
```

## Support

- [Logging Issues](https://github.com/sirsinexus/sirsinexus/issues)
- [Logging Documentation](https://docs.sirsinexus.io/logging)
- [Community Support](https://slack.sirsinexus.io)
