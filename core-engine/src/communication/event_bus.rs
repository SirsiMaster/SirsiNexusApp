//! # Event Bus
//!
//! Provides distributed event-driven communication for agent coordination
//! using Redis Streams as the underlying message transport.

use crate::error::{AppError, AppResult};
use redis::{AsyncCommands, Client};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::broadcast;
use tokio::sync::RwLock;
use tracing::{debug, error, info, warn};
use uuid::Uuid;

/// Agent event types for communication
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AgentEventType {
    /// Agent lifecycle events
    AgentCreated,
    AgentDestroyed,
    AgentHealthUpdate,
    
    /// Task coordination events
    TaskAssigned,
    TaskCompleted,
    TaskFailed,
    
    /// Resource events
    ResourceDiscovered,
    ResourceUpdated,
    ResourceError,
    
    /// Communication events
    MessageSent,
    MessageReceived,
    BroadcastMessage,
    
    /// System events
    SystemAlert,
    MetricsUpdate,
}

/// Event payload for inter-agent communication
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentEvent {
    /// Unique event identifier
    pub event_id: String,
    
    /// Type of event
    pub event_type: AgentEventType,
    
    /// Source agent identifier
    pub source_agent_id: String,
    
    /// Target agent identifier (optional for broadcasts)
    pub target_agent_id: Option<String>,
    
    /// Session identifier
    pub session_id: String,
    
    /// Event payload data
    pub payload: serde_json::Value,
    
    /// Event metadata
    pub metadata: HashMap<String, String>,
    
    /// Event timestamp (Unix timestamp in milliseconds)
    pub timestamp: i64,
    
    /// Event priority (0-10, 10 being highest)
    pub priority: u8,
    
    /// Time-to-live in seconds
    pub ttl: Option<u64>,
}

impl AgentEvent {
    /// Create a new agent event
    pub fn new(
        event_type: AgentEventType,
        source_agent_id: String,
        session_id: String,
        payload: serde_json::Value,
    ) -> Self {
        Self {
            event_id: Uuid::new_v4().to_string(),
            event_type,
            source_agent_id,
            target_agent_id: None,
            session_id,
            payload,
            metadata: HashMap::new(),
            timestamp: chrono::Utc::now().timestamp_millis(),
            priority: 5, // Default medium priority
            ttl: Some(3600), // Default 1 hour TTL
        }
    }
    
    /// Set target agent for directed messages
    pub fn with_target(mut self, target_agent_id: String) -> Self {
        self.target_agent_id = Some(target_agent_id);
        self
    }
    
    /// Set event priority
    pub fn with_priority(mut self, priority: u8) -> Self {
        self.priority = priority.min(10);
        self
    }
    
    /// Set event TTL
    pub fn with_ttl(mut self, ttl: u64) -> Self {
        self.ttl = Some(ttl);
        self
    }
    
    /// Add metadata
    pub fn with_metadata(mut self, key: String, value: String) -> Self {
        self.metadata.insert(key, value);
        self
    }
}

/// Event subscription configuration
#[derive(Debug, Clone)]
pub struct EventSubscription {
    pub subscription_id: String,
    pub agent_id: String,
    pub event_types: Vec<AgentEventType>,
    pub session_filter: Option<String>,
    pub target_filter: Option<String>,
}

/// Event bus for agent communication
pub struct EventBus {
    redis_client: Client,
    subscriptions: Arc<RwLock<HashMap<String, EventSubscription>>>,
    event_sender: broadcast::Sender<AgentEvent>,
    stream_name: String,
    consumer_group: String,
}

impl EventBus {
    /// Create a new event bus instance
    pub async fn new(redis_url: &str) -> AppResult<Self> {
        let redis_client = Client::open(redis_url)
            .map_err(|e| AppError::Internal(format!("Failed to connect to Redis: {}", e)))?;
        
        let (event_sender, _) = broadcast::channel(1000);
        
        let event_bus = Self {
            redis_client,
            subscriptions: Arc::new(RwLock::new(HashMap::new())),
            event_sender,
            stream_name: "agent_events".to_string(),
            consumer_group: "agent_hypervisor".to_string(),
        };
        
        // Initialize Redis stream and consumer group
        event_bus.initialize_stream().await?;
        
        Ok(event_bus)
    }
    
    /// Initialize Redis stream and consumer group
    async fn initialize_stream(&self) -> AppResult<()> {
        let mut conn = self.redis_client.get_async_connection().await
            .map_err(|e| AppError::Internal(format!("Failed to get Redis connection: {}", e)))?;
        
        // Create consumer group (ignore error if already exists)
        let _: Result<String, redis::RedisError> = redis::cmd("XGROUP")
            .arg("CREATE")
            .arg(&self.stream_name)
            .arg(&self.consumer_group)
            .arg("0")
            .arg("MKSTREAM")
            .query_async(&mut conn)
            .await;
        
        info!("Event bus initialized with stream: {}", self.stream_name);
        Ok(())
    }
    
    /// Publish an event to the bus
    pub async fn publish(&self, event: AgentEvent) -> AppResult<String> {
        let mut conn = self.redis_client.get_async_connection().await
            .map_err(|e| AppError::Internal(format!("Failed to get Redis connection: {}", e)))?;
        
        // Serialize event to JSON
        let event_json = serde_json::to_string(&event)
            .map_err(|e| AppError::Internal(format!("Failed to serialize event: {}", e)))?;
        
        // Add to Redis stream
        let stream_id: String = conn.xadd(
            &self.stream_name,
            "*",
            &[
                ("event_id", &event.event_id),
                ("event_type", &serde_json::to_string(&event.event_type).unwrap_or_default()),
                ("source_agent_id", &event.source_agent_id),
                ("session_id", &event.session_id),
                ("data", &event_json),
                ("priority", &event.priority.to_string()),
                ("timestamp", &event.timestamp.to_string()),
            ]
        ).await
        .map_err(|e| AppError::Internal(format!("Failed to publish event: {}", e)))?;
        
        // Send to local subscribers
        if let Err(e) = self.event_sender.send(event.clone()) {
            warn!("Failed to send event to local subscribers: {}", e);
        }
        
        debug!("Published event {} to stream {}", event.event_id, stream_id);
        Ok(stream_id)
    }
    
    /// Subscribe to events
    pub async fn subscribe(&self, subscription: EventSubscription) -> AppResult<broadcast::Receiver<AgentEvent>> {
        let mut subscriptions = self.subscriptions.write().await;
        subscriptions.insert(subscription.subscription_id.clone(), subscription.clone());
        
        info!("Agent {} subscribed to events: {:?}", 
              subscription.agent_id, subscription.event_types);
        
        Ok(self.event_sender.subscribe())
    }
    
    /// Unsubscribe from events
    pub async fn unsubscribe(&self, subscription_id: &str) -> AppResult<()> {
        let mut subscriptions = self.subscriptions.write().await;
        if let Some(subscription) = subscriptions.remove(subscription_id) {
            info!("Agent {} unsubscribed from events", subscription.agent_id);
        }
        Ok(())
    }
    
    /// Start event processing loop
    pub async fn start_event_processor(&self) -> AppResult<()> {
        let redis_client = self.redis_client.clone();
        let stream_name = self.stream_name.clone();
        let consumer_group = self.consumer_group.clone();
        let event_sender = self.event_sender.clone();
        let subscriptions = self.subscriptions.clone();
        
        tokio::spawn(async move {
            let mut conn = match redis_client.get_async_connection().await {
                Ok(conn) => conn,
                Err(e) => {
                    error!("Failed to get Redis connection for event processor: {}", e);
                    return;
                }
            };
            
            info!("Starting event processor for stream: {}", stream_name);
            
            loop {
                // Read events from Redis stream
                let result: Result<HashMap<String, HashMap<String, Vec<(String, Vec<(String, String)>)>>>, redis::RedisError> = 
                    redis::cmd("XREADGROUP")
                    .arg("GROUP")
                    .arg(&consumer_group)
                    .arg("agent_processor")
                    .arg("COUNT")
                    .arg("10")
                    .arg("BLOCK")
                    .arg("1000")
                    .arg("STREAMS")
                    .arg(&stream_name)
                    .arg(">")
                    .query_async(&mut conn)
                    .await;
                
                match result {
                    Ok(streams) => {
                        for (stream, entries) in streams {
                            if let Some(messages) = entries.get(&stream) {
                                for (message_id, fields) in messages {
                                    if let Err(e) = Self::process_event_message(
                                        &event_sender,
                                        &subscriptions,
                                        message_id,
                                        fields
                                    ).await {
                                        error!("Failed to process event message {}: {}", message_id, e);
                                    }
                                }
                            }
                        }
                    }
                    Err(e) => {
                        if !e.to_string().contains("NOGROUP") {
                            error!("Failed to read from Redis stream: {}", e);
                            tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
                        }
                    }
                }
            }
        });
        
        Ok(())
    }
    
    /// Process individual event message
    async fn process_event_message(
        event_sender: &broadcast::Sender<AgentEvent>,
        subscriptions: &Arc<RwLock<HashMap<String, EventSubscription>>>,
        _message_id: &str,
        fields: &[(String, String)],
    ) -> AppResult<()> {
        // Extract event data from Redis stream fields
        let mut event_data = None;
        
        for (key, value) in fields {
            if key == "data" {
                event_data = Some(value);
                break;
            }
        }
        
        if let Some(data) = event_data {
            // Deserialize event
            let event: AgentEvent = serde_json::from_str(data)
                .map_err(|e| AppError::Internal(format!("Failed to deserialize event: {}", e)))?;
            
            // Check subscriptions and forward to interested agents
            let subscriptions_read = subscriptions.read().await;
            for subscription in subscriptions_read.values() {
                if Self::should_forward_event(&event, subscription) {
                    if let Err(e) = event_sender.send(event.clone()) {
                        warn!("Failed to forward event to subscriber {}: {}", subscription.agent_id, e);
                    }
                }
            }
        }
        
        Ok(())
    }
    
    /// Check if event should be forwarded to subscription
    fn should_forward_event(event: &AgentEvent, subscription: &EventSubscription) -> bool {
        // Check event type filter
        if !subscription.event_types.is_empty() {
            let event_type_matches = subscription.event_types.iter()
                .any(|et| std::mem::discriminant(et) == std::mem::discriminant(&event.event_type));
            if !event_type_matches {
                return false;
            }
        }
        
        // Check session filter
        if let Some(ref session_filter) = subscription.session_filter {
            if &event.session_id != session_filter {
                return false;
            }
        }
        
        // Check target filter
        if let Some(ref target_filter) = subscription.target_filter {
            if let Some(ref target_agent_id) = event.target_agent_id {
                if target_agent_id != target_filter {
                    return false;
                }
            } else {
                return false; // Event has no target but subscription requires specific target
            }
        }
        
        true
    }
    
    /// Get event bus health status
    pub async fn get_health(&self) -> AppResult<HashMap<String, String>> {
        let mut conn = self.redis_client.get_async_connection().await
            .map_err(|e| AppError::Internal(format!("Failed to get Redis connection: {}", e)))?;
        
        let stream_info: Result<HashMap<String, redis::Value>, redis::RedisError> = 
            redis::cmd("XINFO")
            .arg("STREAM")
            .arg(&self.stream_name)
            .query_async(&mut conn)
            .await;
        
        let mut health = HashMap::new();
        health.insert("status".to_string(), "healthy".to_string());
        health.insert("stream_name".to_string(), self.stream_name.clone());
        health.insert("consumer_group".to_string(), self.consumer_group.clone());
        
        match stream_info {
            Ok(info) => {
                health.insert("stream_exists".to_string(), "true".to_string());
                if let Some(redis::Value::Int(length)) = info.get("length") {
                    health.insert("stream_length".to_string(), length.to_string());
                }
            }
            Err(_) => {
                health.insert("stream_exists".to_string(), "false".to_string());
            }
        }
        
        let subscriptions = self.subscriptions.read().await;
        health.insert("active_subscriptions".to_string(), subscriptions.len().to_string());
        
        Ok(health)
    }
}

/// Event bus builder for easier configuration
pub struct EventBusBuilder {
    redis_url: String,
    stream_name: Option<String>,
    consumer_group: Option<String>,
}

impl EventBusBuilder {
    pub fn new(redis_url: &str) -> Self {
        Self {
            redis_url: redis_url.to_string(),
            stream_name: None,
            consumer_group: None,
        }
    }
    
    pub fn with_stream_name(mut self, stream_name: &str) -> Self {
        self.stream_name = Some(stream_name.to_string());
        self
    }
    
    pub fn with_consumer_group(mut self, consumer_group: &str) -> Self {
        self.consumer_group = Some(consumer_group.to_string());
        self
    }
    
    pub async fn build(self) -> AppResult<EventBus> {
        let mut event_bus = EventBus::new(&self.redis_url).await?;
        
        if let Some(stream_name) = self.stream_name {
            event_bus.stream_name = stream_name;
        }
        
        if let Some(consumer_group) = self.consumer_group {
            event_bus.consumer_group = consumer_group;
        }
        
        event_bus.initialize_stream().await?;
        Ok(event_bus)
    }
}
