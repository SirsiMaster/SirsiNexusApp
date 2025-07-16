//! # Message Schemas
//!
//! Defines standardized message schemas for inter-agent communication,
//! ensuring consistent data exchange between different agent types.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

/// Standard agent message envelope
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentMessage {
    /// Unique message identifier
    pub message_id: String,
    
    /// Source agent identifier
    pub from_agent_id: String,
    
    /// Target agent identifier
    pub to_agent_id: String,
    
    /// Session identifier for context
    pub session_id: String,
    
    /// Message type for routing
    pub message_type: MessageType,
    
    /// Message payload
    pub payload: MessagePayload,
    
    /// Message metadata
    pub metadata: HashMap<String, String>,
    
    /// Message timestamp (Unix timestamp in milliseconds)
    pub timestamp: i64,
    
    /// Request correlation ID for tracking request-response pairs
    pub correlation_id: Option<String>,
    
    /// Time-to-live in seconds
    pub ttl: Option<u64>,
}

impl AgentMessage {
    /// Create a new agent message
    pub fn new(
        from_agent_id: String,
        to_agent_id: String,
        session_id: String,
        message_type: MessageType,
        payload: MessagePayload,
    ) -> Self {
        Self {
            message_id: Uuid::new_v4().to_string(),
            from_agent_id,
            to_agent_id,
            session_id,
            message_type,
            payload,
            metadata: HashMap::new(),
            timestamp: chrono::Utc::now().timestamp_millis(),
            correlation_id: None,
            ttl: Some(3600), // Default 1 hour TTL
        }
    }
    
    /// Create a response message
    pub fn create_response(
        original: &AgentMessage,
        from_agent_id: String,
        message_type: MessageType,
        payload: MessagePayload,
    ) -> Self {
        Self {
            message_id: Uuid::new_v4().to_string(),
            from_agent_id,
            to_agent_id: original.from_agent_id.clone(),
            session_id: original.session_id.clone(),
            message_type,
            payload,
            metadata: HashMap::new(),
            timestamp: chrono::Utc::now().timestamp_millis(),
            correlation_id: Some(original.message_id.clone()),
            ttl: Some(3600),
        }
    }
    
    /// Add metadata to the message
    pub fn with_metadata(mut self, key: String, value: String) -> Self {
        self.metadata.insert(key, value);
        self
    }
    
    /// Set correlation ID for request tracking
    pub fn with_correlation_id(mut self, correlation_id: String) -> Self {
        self.correlation_id = Some(correlation_id);
        self
    }
}

/// Message types for agent communication
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MessageType {
    // Task coordination
    TaskRequest,
    TaskResponse,
    TaskProgress,
    TaskComplete,
    TaskError,
    
    // Resource management
    ResourceDiscovery,
    ResourceUpdate,
    ResourceQuery,
    ResourceData,
    
    // Agent coordination
    AgentHandshake,
    AgentHeartbeat,
    AgentStatus,
    AgentShutdown,
    
    // Data exchange
    DataRequest,
    DataResponse,
    DataStream,
    
    // Notifications
    Alert,
    Warning,
    Information,
    
    // Custom message types
    Custom(String),
}

/// Message payload variants
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum MessagePayload {
    /// Task-related payloads
    Task(TaskPayload),
    
    /// Resource-related payloads
    Resource(ResourcePayload),
    
    /// Agent status payloads
    Status(StatusPayload),
    
    /// Data exchange payloads
    Data(DataPayload),
    
    /// Alert/notification payloads
    Alert(AlertPayload),
    
    /// Generic JSON payload
    Json(serde_json::Value),
    
    /// Text message
    Text(String),
    
    /// Binary data (base64 encoded)
    Binary(String),
}

/// Task coordination payload
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskPayload {
    /// Task identifier
    pub task_id: String,
    
    /// Task type
    pub task_type: String,
    
    /// Task configuration
    pub config: serde_json::Value,
    
    /// Task parameters
    pub parameters: HashMap<String, String>,
    
    /// Task priority (0-10)
    pub priority: u8,
    
    /// Expected completion time (Unix timestamp)
    pub deadline: Option<i64>,
    
    /// Task dependencies
    pub dependencies: Vec<String>,
    
    /// Task result (for responses)
    pub result: Option<serde_json::Value>,
    
    /// Task progress (0-100)
    pub progress: Option<f64>,
    
    /// Error information
    pub error: Option<TaskError>,
}

/// Task error information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskError {
    /// Error code
    pub code: String,
    
    /// Error message
    pub message: String,
    
    /// Error details
    pub details: HashMap<String, String>,
    
    /// Whether the error is retryable
    pub retryable: bool,
    
    /// Retry count
    pub retry_count: Option<u32>,
}

/// Resource management payload
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourcePayload {
    /// Resource identifier
    pub resource_id: String,
    
    /// Resource type
    pub resource_type: String,
    
    /// Cloud provider
    pub provider: String,
    
    /// Resource region/location
    pub region: String,
    
    /// Resource configuration
    pub config: serde_json::Value,
    
    /// Resource properties
    pub properties: HashMap<String, String>,
    
    /// Resource tags
    pub tags: HashMap<String, String>,
    
    /// Resource status
    pub status: String,
    
    /// Resource metrics
    pub metrics: Option<serde_json::Value>,
    
    /// Cost information
    pub cost: Option<CostInfo>,
}

/// Cost information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CostInfo {
    /// Monthly cost estimate
    pub monthly_cost: f64,
    
    /// Daily cost
    pub daily_cost: f64,
    
    /// Hourly cost
    pub hourly_cost: f64,
    
    /// Currency code (e.g., "USD")
    pub currency: String,
    
    /// Cost breakdown
    pub breakdown: HashMap<String, f64>,
}

/// Agent status payload
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StatusPayload {
    /// Agent health status
    pub health: String,
    
    /// Agent state
    pub state: String,
    
    /// Agent uptime in seconds
    pub uptime: u64,
    
    /// Active task count
    pub active_tasks: u32,
    
    /// Completed task count
    pub completed_tasks: u64,
    
    /// Failed task count
    pub failed_tasks: u64,
    
    /// Agent capabilities
    pub capabilities: Vec<String>,
    
    /// Resource usage
    pub resource_usage: Option<ResourceUsage>,
    
    /// Last activity timestamp
    pub last_activity: i64,
    
    /// Additional status data
    pub extra: HashMap<String, String>,
}

/// Resource usage information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceUsage {
    /// CPU usage percentage
    pub cpu_percent: f64,
    
    /// Memory usage in bytes
    pub memory_bytes: u64,
    
    /// Memory usage percentage
    pub memory_percent: f64,
    
    /// Network I/O bytes
    pub network_bytes: u64,
    
    /// Disk I/O bytes
    pub disk_bytes: u64,
    
    /// Open file descriptors
    pub open_files: u32,
}

/// Data exchange payload
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataPayload {
    /// Data identifier
    pub data_id: String,
    
    /// Data type
    pub data_type: String,
    
    /// Data format (json, csv, xml, etc.)
    pub format: String,
    
    /// Data schema version
    pub schema_version: String,
    
    /// Actual data content
    pub content: serde_json::Value,
    
    /// Data size in bytes
    pub size: u64,
    
    /// Data checksum (for integrity)
    pub checksum: Option<String>,
    
    /// Compression used (if any)
    pub compression: Option<String>,
    
    /// Data metadata
    pub metadata: HashMap<String, String>,
}

/// Alert/notification payload
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertPayload {
    /// Alert identifier
    pub alert_id: String,
    
    /// Alert severity
    pub severity: AlertSeverity,
    
    /// Alert title
    pub title: String,
    
    /// Alert description
    pub description: String,
    
    /// Alert source
    pub source: String,
    
    /// Alert category
    pub category: String,
    
    /// Affected resources
    pub affected_resources: Vec<String>,
    
    /// Alert details
    pub details: HashMap<String, String>,
    
    /// Recommended actions
    pub actions: Vec<String>,
    
    /// Alert URL (for more information)
    pub url: Option<String>,
}

/// Alert severity levels
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum AlertSeverity {
    Critical,
    High,
    Medium,
    Low,
    Info,
}

/// Agent capability descriptor
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentCapability {
    /// Capability identifier
    pub capability_id: String,
    
    /// Human-readable name
    pub name: String,
    
    /// Capability description
    pub description: String,
    
    /// Capability version
    pub version: String,
    
    /// Required parameters
    pub required_params: Vec<String>,
    
    /// Optional parameters
    pub optional_params: Vec<String>,
    
    /// Supported operations
    pub operations: Vec<String>,
    
    /// Resource requirements
    pub requirements: HashMap<String, String>,
}

/// Message routing configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessageRoute {
    /// Route identifier
    pub route_id: String,
    
    /// Source agent pattern (glob)
    pub source_pattern: String,
    
    /// Target agent pattern (glob)
    pub target_pattern: String,
    
    /// Message type filter
    pub message_type_filter: Option<Vec<MessageType>>,
    
    /// Route priority
    pub priority: u8,
    
    /// Route enabled flag
    pub enabled: bool,
    
    /// Route metadata
    pub metadata: HashMap<String, String>,
}

/// Message acknowledgment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessageAck {
    /// Original message ID
    pub message_id: String,
    
    /// Acknowledgment type
    pub ack_type: AckType,
    
    /// Acknowledgment timestamp
    pub timestamp: i64,
    
    /// Processing time in milliseconds
    pub processing_time_ms: Option<u64>,
    
    /// Error information (if applicable)
    pub error: Option<String>,
}

/// Acknowledgment types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AckType {
    /// Message received successfully
    Received,
    
    /// Message processed successfully
    Processed,
    
    /// Message processing failed
    Failed,
    
    /// Message rejected
    Rejected,
    
    /// Message expired
    Expired,
}
