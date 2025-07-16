# Events

The Events component provides comprehensive event handling capabilities including pub/sub, event sourcing, and event streaming.

## Overview 

The Events component provides:
- Event publishing and subscription
- Event sourcing
- Event streaming
- Event persistence
- Event filtering
- Event routing
- Event processing

## Features

### Event Publishing

```rust
// Configure event broker
let broker = EventBroker {
    name: "main",
    persistence: PersistenceConfig {
        enabled: true,
        store: Store::RocksDB {
            path: "/data/events",
            options: DBOptions {
                max_background_jobs: 4,
                max_open_files: 10000,
            },
        },
        retention: RetentionPolicy {
            time: Some(Duration::from_days(30)),
            size: Some(ByteSize::gb(100)),
        },
    },
    replication: ReplicationConfig {
        factor: 3,
        sync: ReplicationSync::Quorum,
        cluster: vec![
            "node-1:9092",
            "node-2:9092",
            "node-3:9092",
        ],
    },
};

events.configure_broker(broker).await?;

// Create topic
let topic = Topic {
    name: "orders",
    partitions: 10,
    replication_factor: 3,
    config: TopicConfig {
        retention_time: Duration::from_days(7),
        retention_size: ByteSize::gb(10),
        cleanup_policy: CleanupPolicy::Delete,
        compression: Compression::Snappy,
    },
    schema: Some(Schema::Avro {
        definition: include_str!("schemas/order.avsc"),
        compatibility: SchemaCompatibility::Backward,
    }),
};

events.create_topic(topic).await?;

// Publish event
let event = Event {
    id: "evt-123",
    type_: "order.created",
    source: "order-service",
    time: Utc::now(),
    data: serde_json::to_value(&order)?,
    metadata: HashMap::from([
        ("version", "1.0"),
        ("correlation_id", "order-123"),
    ]),
};

let producer = Producer::new()
    .with_acks(Acks::All)
    .with_compression(Compression::Snappy)
    .with_retries(3)
    .with_batch_size(16384)
    .with_linger(Duration::from_millis(10));

events.publish("orders", event, producer).await?;
```

### Event Subscription

```rust
// Create consumer group
let group = ConsumerGroup {
    name: "order-processor",
    topics: vec!["orders"],
    config: ConsumerConfig {
        auto_offset_reset: AutoOffsetReset::Earliest,
        max_poll_records: 100,
        session_timeout: Duration::from_secs(30),
        heartbeat_interval: Duration::from_secs(10),
        enable_auto_commit: false,
        isolation_level: IsolationLevel::ReadCommitted,
    },
};

events.create_consumer_group(group).await?;

// Subscribe to events
let subscription = Subscription {
    group: "order-processor",
    topics: vec!["orders"],
    filter: Some(Filter::Expression("data.total >= 1000")),
    processor: Processor {
        concurrency: 10,
        batch_size: 100,
        timeout: Duration::from_secs(30),
        retry: RetryPolicy {
            max_attempts: 3,
            backoff: ExponentialBackoff {
                initial: Duration::from_secs(1),
                max: Duration::from_secs(60),
                multiplier: 2.0,
            },
        },
    },
};

let mut consumer = events.subscribe(subscription).await?;

while let Some(message) = consumer.next().await {
    let event: Event = message.payload()?;
    
    match process_order(event).await {
        Ok(_) => message.commit().await?,
        Err(e) => message.nack().await?,
    }
}
```

### Event Sourcing

```rust
// Configure event store
let store = EventStore {
    name: "order-store",
    persistence: PersistenceConfig {
        store: Store::PostgreSQL {
            url: "postgres://localhost/events",
            pool: PoolConfig {
                min_connections: 5,
                max_connections: 20,
            },
        },
        schema: Some(Schema::JsonSchema {
            definition: include_str!("schemas/order-event.json"),
        }),
    },
    snapshots: SnapshotConfig {
        enabled: true,
        interval: 100,
        compression: true,
    },
};

events.configure_store(store).await?;

// Store event
let event = DomainEvent {
    id: "evt-123",
    type_: "OrderCreated",
    aggregate_id: "order-123",
    aggregate_type: "Order",
    version: 1,
    data: serde_json::to_value(&order)?,
    metadata: HashMap::from([
        ("user_id", "user-123"),
        ("correlation_id", "corr-123"),
    ]),
};

events.store_event(event).await?;

// Load aggregate
let aggregate = events.load_aggregate::<Order>("order-123").await?;

// Get event stream
let mut stream = events.get_event_stream("order-123")
    .with_snapshot()
    .await?;

while let Some(event) = stream.next().await {
    println!("Event: {:?}", event);
}
```

### Event Streaming

```rust
// Configure stream processor
let processor = StreamProcessor {
    name: "order-processor",
    inputs: vec![
        Stream {
            name: "orders",
            format: DataFormat::Avro,
            partitions: 10,
        },
        Stream {
            name: "inventory",
            format: DataFormat::Avro,
            partitions: 5,
        },
    ],
    outputs: vec![
        Stream {
            name: "processed-orders",
            format: DataFormat::Avro,
            partitions: 10,
        },
    ],
    state: StateConfig {
        store: StateStore::RocksDB {
            path: "/data/state",
            ttl: Some(Duration::from_days(7)),
        },
        checkpointing: CheckpointConfig {
            interval: Duration::from_minutes(5),
            retention: Duration::from_days(1),
        },
    },
    processing: ProcessingConfig {
        parallelism: 10,
        window: WindowConfig {
            type_: WindowType::Tumbling {
                size: Duration::from_minutes(5),
            },
            allowed_lateness: Duration::from_minutes(1),
            triggers: vec![
                Trigger::Watermark,
                Trigger::Count(1000),
            ],
        },
    },
};

events.create_processor(processor).await?;

// Define processing topology
let topology = Topology::new()
    .stream("orders")
    .filter(|order: Order| order.status == OrderStatus::Pending)
    .join(
        "inventory",
        |order, inventory| order.product_id == inventory.product_id,
    )
    .window(
        Duration::from_minutes(5),
        |window| {
            window
                .group_by(|order| order.customer_id)
                .aggregate(|orders| {
                    OrderSummary {
                        count: orders.len(),
                        total_value: orders.iter().sum(),
                    }
                })
        },
    )
    .to("processed-orders");

events.deploy_topology("order-processor", topology).await?;
```

## Architecture

```plaintext
+------------------+
|     Events       |
+------------------+
         |
+------------------+     +------------------+     +------------------+
|  Event Broker    |     |  Event Store     |     | Stream Processor|
+------------------+     +------------------+     +------------------+
         |                       |                        |
+------------------+     +------------------+     +------------------+
| Publisher        |     | Consumer         |     | State Store     |
+------------------+     +------------------+     +------------------+
         |                       |                        |
+------------------+     +------------------+     +------------------+
| Topic Manager    |     | Group Manager    |     | Window Manager  |
+------------------+     +------------------+     +------------------+
```

### Components

1. **Event Broker**
   - Event routing
   - Message persistence
   - Topic management
   - Cluster management

2. **Event Store**
   - Event persistence
   - Event streaming
   - Snapshots
   - Event sourcing

3. **Stream Processor**
   - Stream processing
   - State management
   - Window operations
   - Event joining

4. **Publisher/Consumer**
   - Event publishing
   - Event consumption
   - Message delivery
   - Consumer groups

## Configuration

### Event Broker Configuration

```yaml
broker:
  name: main
  persistence:
    enabled: true
    store:
      type: rocksdb
      path: /data/events
  replication:
    factor: 3
    sync: quorum
    cluster:
      - node-1:9092
      - node-2:9092
```

### Event Store Configuration

```yaml
store:
  name: order-store
  persistence:
    store:
      type: postgresql
      url: postgres://localhost/events
    schema:
      type: json-schema
      path: schemas/order-event.json
  snapshots:
    enabled: true
    interval: 100
```

### Stream Configuration

```yaml
streams:
  processors:
    order-processor:
      inputs:
        - name: orders
          format: avro
          partitions: 10
      outputs:
        - name: processed-orders
          format: avro
          partitions: 10
      state:
        store: rocksdb
        path: /data/state
```

## API Reference

### Event Management

```rust
#[async_trait]
pub trait EventManager: Send + Sync {
    async fn publish(&self, topic: &str, event: Event) -> Result<EventId>;
    async fn subscribe(&self, subscription: Subscription) -> Result<EventStream>;
    async fn create_topic(&self, topic: Topic) -> Result<Topic>;
    async fn delete_topic(&self, name: &str) -> Result<()>;
}
```

### Event Store

```rust
#[async_trait]
pub trait EventStore: Send + Sync {
    async fn store_event(&self, event: DomainEvent) -> Result<()>;
    async fn load_aggregate<T>(&self, id: &str) -> Result<T>;
    async fn get_events(&self, id: &str) -> Result<Vec<DomainEvent>>;
    async fn create_snapshot(&self, aggregate: &Aggregate) -> Result<()>;
}
```

## Best Practices

1. **Event Design**
   - Event versioning
   - Schema evolution
   - Event ownership
   - Event immutability

2. **Message Delivery**
   - Delivery guarantees
   - Message ordering
   - Error handling
   - Dead letter queues

3. **Stream Processing**
   - State management
   - Checkpointing
   - Error recovery
   - Performance tuning

4. **Monitoring**
   - Event metrics
   - Consumer lag
   - Broker health
   - Alert thresholds

## Examples

### Event Publishing

```rust
use clusterdb::events::{Events, Event, Producer};

#[tokio::main]
async fn main() -> Result<()> {
    let events = Events::new(config)?;
    
    // Create producer
    let producer = Producer::new()
        .with_acks(Acks::All)
        .with_retries(3);
    
    // Publish event
    let event = Event::new("order.created")
        .with_data(order)
        .with_metadata(metadata);
    
    events.publish("orders", event, producer).await?;
}
```

### Event Processing

```rust
use clusterdb::events::{Events, Consumer, ProcessingConfig};

#[tokio::main]
async fn main() -> Result<()> {
    let events = Events::new(config)?;
    
    // Create consumer
    let consumer = Consumer::new("order-processor")
        .with_topics(vec!["orders"])
        .with_config(processing_config);
    
    // Process events
    while let Some(event) = consumer.next().await {
        match process_event(event).await {
            Ok(_) => event.commit().await?,
            Err(e) => event.nack().await?,
        }
    }
}
```

## Integration

### With Monitoring

```rust
use clusterdb::{
    events::Events,
    monitoring::{Monitor, MetricsConfig},
};

// Configure event monitoring
let metrics = MetricsConfig::new()
    .with_metric("message_rate")
    .with_metric("consumer_lag")
    .with_metric("processing_time")
    .with_alerts(AlertConfig {
        lag_threshold: 1000,
        latency_threshold_ms: 500,
    });

events.configure_monitoring(metrics).await?;
```

### With Tracing

```rust
use clusterdb::{
    events::Events,
    tracing::{Tracer, TracingConfig},
};

// Configure event tracing
let tracing = TracingConfig::new()
    .with_service_name("event-processor")
    .with_sampling_rate(0.1)
    .with_propagation(true);

events.configure_tracing(tracing).await?;
```

## Troubleshooting

### Common Issues

1. **Publishing Issues**
   ```
   Error: Message too large
   Cause: Event size exceeds limit
   Solution: Increase message size limit
   ```

2. **Consumer Issues**
   ```
   Error: Consumer lag high
   Cause: Slow processing
   Solution: Scale consumers or optimize
   ```

3. **Stream Issues**
   ```
   Error: State store full
   Cause: Insufficient storage
   Solution: Increase storage or cleanup
   ```

### Debugging Tools

```bash
# Check topic status
events topic status orders

# Monitor consumer lag
events consumer lag order-processor

# View event logs
events logs show --topic orders
```

## Support

- [Events Issues](https://github.com/clusterdb/clusterdb/issues)
- [Events Documentation](https://docs.clusterdb.io/events)
- [Community Support](https://slack.clusterdb.io)
