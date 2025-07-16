# Messaging

The Messaging component provides comprehensive messaging and event handling capabilities including pub/sub, message queues, and stream processing.

## Overview

The Messaging component provides:
- Message queues
- Pub/sub messaging
- Stream processing
- Message routing
- Dead letter handling 
- Message durability
- Event sourcing

## Features

### Message Queues

```rust
// Create message queue
let queue = Queue {
    name: "orders",
    durability: Durability::Persistent,
    max_size: ByteSize::gb(10),
    max_length: Some(1_000_000),
    message_ttl: Some(Duration::from_hours(24)),
    dead_letter_config: Some(DeadLetterConfig {
        queue: "orders-dlq",
        max_retries: 3,
        retry_delay: Duration::from_secs(60),
    }),
    encryption: Some(Encryption {
        enabled: true,
        key_id: Some("key-123"),
    }),
    permissions: QueuePermissions {
        producers: vec!["order-service"],
        consumers: vec!["fulfillment-service", "notification-service"],
    },
};

messaging.create_queue(queue).await?;

// Send message
let message = Message {
    payload: serde_json::to_vec(&order)?,
    properties: MessageProperties {
        content_type: "application/json",
        correlation_id: Some("order-123"),
        reply_to: Some("order-responses"),
        headers: HashMap::from([
            ("source", "order-service"),
            ("version", "1.0"),
        ]),
        priority: Some(1),
        expiration: Some(Duration::from_minutes(30)),
    },
    routing: MessageRouting {
        mandatory: true,
        immediate: false,
    },
};

messaging.send_message("orders", message).await?;

// Receive messages
let consumer = Consumer {
    queue: "orders",
    name: "fulfillment-consumer",
    prefetch: 100,
    auto_ack: false,
    exclusive: false,
};

let mut messages = messaging.consume(consumer).await?;

while let Some(delivery) = messages.next().await {
    let order: Order = serde_json::from_slice(&delivery.payload)?;
    
    match process_order(order).await {
        Ok(_) => delivery.ack().await?,
        Err(e) => {
            if delivery.retry_count() < 3 {
                delivery.reject(true).await?; // Requeue
            } else {
                delivery.reject(false).await?; // Send to DLQ
            }
        }
    }
}
```

### Pub/Sub Messaging

```rust
// Create topic
let topic = Topic {
    name: "order-events",
    durability: Durability::Persistent,
    retention: RetentionPolicy {
        time: Some(Duration::from_days(7)),
        size: Some(ByteSize::gb(50)),
    },
    partitions: 10,
    replication_factor: 3,
    cleanup: CleanupPolicy::Delete,
    compression: Some(Compression {
        type_: CompressionType::LZ4,
        level: 6,
    }),
};

messaging.create_topic(topic).await?;

// Create subscription
let subscription = Subscription {
    name: "notification-service",
    topic: "order-events",
    type_: SubscriptionType::PushEndpoint {
        endpoint: "http://notification-service/events",
        retry_policy: RetryPolicy {
            max_retries: 3,
            initial_delay: Duration::from_secs(1),
            max_delay: Duration::from_secs(60),
            multiplier: 2.0,
        },
    },
    filter: Some(Filter::Expression("event_type = 'order.created'")),
    dead_letter_topic: Some("order-events-dlq"),
    ack_deadline: Duration::from_secs(30),
};

messaging.create_subscription(subscription).await?;

// Publish event
let event = Event {
    id: "evt-123",
    type_: "order.created",
    source: "order-service",
    time: Utc::now(),
    data: serde_json::to_value(order)?,
    metadata: HashMap::from([
        ("version", "1.0"),
        ("correlation_id", "order-123"),
    ]),
};

messaging.publish("order-events", event).await?;

// Subscribe to events
let subscriber = Subscriber {
    subscription: "notification-service",
    batch_size: 100,
    max_outstanding: 1000,
};

let mut events = messaging.subscribe(subscriber).await?;

while let Some(message) = events.next().await {
    let event: Event = serde_json::from_slice(&message.data)?;
    
    match process_event(event).await {
        Ok(_) => message.ack().await?,
        Err(e) => message.nack().await?,
    }
}
```

### Stream Processing

```rust
// Create stream processor
let processor = StreamProcessor {
    name: "order-processor",
    input_streams: vec![
        Stream {
            name: "orders",
            format: DataFormat::Json,
            partitions: 10,
        },
        Stream {
            name: "inventory",
            format: DataFormat::Avro { schema: schema },
            partitions: 5,
        },
    ],
    output_streams: vec![
        Stream {
            name: "processed-orders",
            format: DataFormat::Json,
            partitions: 10,
        },
    ],
    processing: Processing::Stateful {
        state_store: StateStore {
            name: "order-state",
            backend: StateBackend::RocksDB {
                path: "/data/state",
                options: db_options,
            },
        },
        windows: vec![
            Window {
                name: "order-window",
                type_: WindowType::Tumbling {
                    size: Duration::from_minutes(5),
                },
                trigger: Trigger::Watermark {
                    allowed_lateness: Duration::from_minutes(1),
                },
            },
        ],
    },
    scaling: ScalingConfig {
        min_tasks: 2,
        max_tasks: 10,
        target_records_per_second: 1000,
    },
    fault_tolerance: FaultTolerance {
        checkpoint_interval: Duration::from_minutes(5),
        retention: Duration::from_hours(24),
        exactly_once: true,
    },
};

messaging.create_processor(processor).await?;

// Define processing logic
let topology = Topology::new()
    .stream("orders")
    .filter(|order: Order| order.status == OrderStatus::Pending)
    .join(
        "inventory",
        |order, inventory| order.product_id == inventory.product_id,
    )
    .window(
        "order-window",
        |window: Window<Order>| {
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

messaging.deploy_topology("order-processor", topology).await?;
```

## Architecture

```plaintext
+------------------+
|    Messaging     |
+------------------+
         |
+------------------+     +------------------+     +------------------+
|  Queue Manager   |     |   Pub/Sub       |     | Stream Manager  |
+------------------+     +------------------+     +------------------+
         |                       |                        |
+------------------+     +------------------+     +------------------+
| Message Store    |     | Event Store      |     | State Store     |
+------------------+     +------------------+     +------------------+
         |                       |                        |
+------------------+     +------------------+     +------------------+
| Queue Cluster    |     | Topic Cluster    |     | Process Cluster |
+------------------+     +------------------+     +------------------+
```

### Components

1. **Queue Manager**
   - Queue lifecycle
   - Message routing
   - Dead letter handling
   - Consumer groups

2. **Pub/Sub**
   - Topic management
   - Event distribution
   - Subscription handling
   - Event filtering

3. **Stream Manager**
   - Stream processing
   - State management
   - Window operations
   - Scaling control

4. **Message Store**
   - Message persistence
   - Message replication
   - Recovery handling
   - Message indexing

## Configuration

### Queue Configuration

```yaml
messaging:
  queues:
    default_settings:
      durability: persistent
      max_size: 10GB
      message_ttl: 24h
    
    queues:
      - name: orders
        max_length: 1000000
        dead_letter:
          queue: orders-dlq
          max_retries: 3
      - name: notifications
        max_length: 500000
        message_ttl: 1h
```

### Pub/Sub Configuration

```yaml
messaging:
  pubsub:
    topics:
      - name: order-events
        partitions: 10
        retention:
          time: 7d
          size: 50GB
        cleanup: delete
    
    subscriptions:
      - name: notification-service
        topic: order-events
        type: push
        endpoint: http://notifications/events
        filter: "event_type = 'order.created'"
```

### Stream Configuration

```yaml
messaging:
  streams:
    processors:
      - name: order-processor
        scaling:
          min_tasks: 2
          max_tasks: 10
        fault_tolerance:
          checkpoint_interval: 5m
          exactly_once: true
        state:
          backend: rocksdb
          path: /data/state
```

## API Reference

### Queue Management

```rust
#[async_trait]
pub trait QueueManager: Send + Sync {
    async fn create_queue(&self, queue: Queue) -> Result<Queue>;
    async fn delete_queue(&self, name: &str) -> Result<()>;
    async fn send_message(&self, queue: &str, message: Message) -> Result<MessageId>;
    async fn receive_messages(&self, queue: &str, count: u32) -> Result<Vec<Message>>;
}
```

### Pub/Sub Management

```rust
#[async_trait]
pub trait PubSubManager: Send + Sync {
    async fn create_topic(&self, topic: Topic) -> Result<Topic>;
    async fn create_subscription(&self, sub: Subscription) -> Result<Subscription>;
    async fn publish(&self, topic: &str, message: Message) -> Result<MessageId>;
    async fn subscribe(&self, subscription: &str) -> Result<Subscriber>;
}
```

## Best Practices

1. **Message Design**
   - Clear schemas
   - Version messages
   - Include metadata
   - Handle failures

2. **Queue Management**
   - Proper sizing
   - Dead letter queues
   - Consumer scaling
   - Message expiry

3. **Event Processing**
   - Idempotent handlers
   - Error handling
   - Event ordering
   - State management

4. **Performance**
   - Batch processing
   - Message compression
   - Consumer tuning
   - Monitoring

## Examples

### Message Processing

```rust
use clusterdb::messaging::{Messaging, Queue, Consumer};

#[tokio::main]
async fn main() -> Result<()> {
    let messaging = Messaging::new(config)?;
    
    // Create queue
    let queue = Queue::new("orders")
        .with_durability(Durability::Persistent)
        .with_max_size(ByteSize::gb(10))
        .with_dead_letter("orders-dlq");
    
    messaging.create_queue(queue).await?;
    
    // Process messages
    let consumer = Consumer::new("orders")
        .with_prefetch(100)
        .with_auto_ack(false);
    
    let mut messages = messaging.consume(consumer).await?;
    
    while let Some(message) = messages.next().await {
        match process_message(message.payload).await {
            Ok(_) => message.ack().await?,
            Err(e) => message.reject(true).await?,
        }
    }
}
```

### Event Publishing

```rust
use clusterdb::messaging::{Messaging, Topic, Event};

#[tokio::main]
async fn main() -> Result<()> {
    let messaging = Messaging::new(config)?;
    
    // Create topic
    let topic = Topic::new("order-events")
        .with_partitions(10)
        .with_retention(Duration::from_days(7));
    
    messaging.create_topic(topic).await?;
    
    // Publish events
    let event = Event::new("order.created")
        .with_data(order)
        .with_metadata(metadata);
    
    messaging.publish("order-events", event).await?;
}
```

## Integration

### With Monitoring

```rust
use clusterdb::{
    messaging::Messaging,
    monitoring::{Monitor, MetricsConfig},
};

// Configure messaging monitoring
let metrics = MetricsConfig::new()
    .with_metric("message_rate")
    .with_metric("queue_depth")
    .with_metric("processing_latency")
    .with_alerts(AlertConfig {
        queue_threshold: 10000,
        latency_threshold_ms: 1000,
    });

messaging.configure_monitoring(metrics).await?;
```

### With Tracing

```rust
use clusterdb::{
    messaging::Messaging,
    tracing::{Tracer, SpanContext},
};

// Configure message tracing
let message = Message::new()
    .with_payload(payload)
    .with_tracing(SpanContext::new()
        .with_operation("process_order")
        .with_parent(parent_span));

messaging.send_message("orders", message).await?;
```

## Troubleshooting

### Common Issues

1. **Queue Issues**
   ```
   Error: Queue full
   Cause: Consumer not keeping up
   Solution: Scale consumers or enable backpressure
   ```

2. **Message Issues**
   ```
   Error: Message processing failed
   Cause: Invalid message format
   Solution: Validate message schema
   ```

3. **Performance Issues**
   ```
   Error: High latency
   Cause: Resource contention
   Solution: Tune consumer configuration
   ```

### Debugging Tools

```bash
# Check queue status
messaging queue status orders

# Monitor message flow
messaging monitor flow orders

# View consumer lag
messaging consumer lag orders-group
```

## Support

- [Messaging Issues](https://github.com/clusterdb/clusterdb/issues)
- [Messaging Documentation](https://docs.clusterdb.io/messaging)
- [Community Support](https://slack.clusterdb.io)
