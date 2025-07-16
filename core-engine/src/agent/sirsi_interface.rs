use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{mpsc, RwLock};
use serde::{Serialize, Deserialize};
use uuid::Uuid;
use tracing::{info, warn, debug};

use crate::error::{AppError, AppResult};
use crate::proto::Suggestion;

/// Core communication protocol between agents and Sirsi Persona
/// This ensures agents NEVER communicate directly with the UI - only through Sirsi
#[derive(Debug, Clone)]
pub struct SirsiInterface {
    agent_id: String,
    agent_type: String,
    request_handler: Arc<SirsiRequestHandler>,
    response_sender: Arc<SirsiResponseSender>,
    context_sync: Arc<SirsiContextSync>,
    capability_reporter: Arc<CapabilityReporter>,
    health_monitor: Arc<HealthMonitor>,
}

/// Handles incoming requests from Sirsi to the agent
#[derive(Debug)]
pub struct SirsiRequestHandler {
    agent_id: String,
    incoming_requests: Arc<RwLock<HashMap<String, SirsiRequest>>>,
    request_receiver: Arc<RwLock<Option<mpsc::UnboundedReceiver<SirsiRequest>>>>,
}

/// Handles outgoing responses from agent to Sirsi
#[derive(Debug)]
pub struct SirsiResponseSender {
    agent_id: String,
    response_sender: Arc<RwLock<Option<mpsc::UnboundedSender<SirsiResponse>>>>,
    pending_responses: Arc<RwLock<HashMap<String, SirsiResponse>>>,
}

/// Synchronizes context between agent and Sirsi
#[derive(Debug)]
pub struct SirsiContextSync {
    agent_id: String,
    local_context: Arc<RwLock<AgentContext>>,
    sirsi_context: Arc<RwLock<SirsiSharedContext>>,
    sync_frequency_ms: u64,
}

/// Reports agent capabilities and status to Sirsi
#[derive(Debug)]
pub struct CapabilityReporter {
    agent_id: String,
    capabilities: Arc<RwLock<AgentCapabilities>>,
    status_sender: Arc<RwLock<Option<mpsc::UnboundedSender<CapabilityUpdate>>>>,
}

/// Monitors agent health and reports to Sirsi
#[derive(Debug)]
pub struct HealthMonitor {
    agent_id: String,
    health_status: Arc<RwLock<AgentHealthStatus>>,
    last_heartbeat: Arc<RwLock<chrono::DateTime<chrono::Utc>>>,
    heartbeat_interval_ms: u64,
}

/// Request from Sirsi to agent
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SirsiRequest {
    pub request_id: String,
    pub request_type: SirsiRequestType,
    pub session_id: String,
    pub user_id: String,
    pub message: Option<String>,
    pub context: HashMap<String, String>,
    pub priority: RequestPriority,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub timeout_ms: Option<u64>,
}

/// Response from agent to Sirsi
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SirsiResponse {
    pub request_id: String,
    pub agent_id: String,
    pub response_type: SirsiResponseType,
    pub success: bool,
    pub content: Option<String>,
    pub suggestions: Vec<AgentSuggestion>,
    pub context_updates: HashMap<String, String>,
    pub error: Option<String>,
    pub confidence_score: f32,
    pub processing_time_ms: u64,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

/// Types of requests Sirsi can send to agents
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SirsiRequestType {
    ProcessMessage,
    GetSuggestions,
    GetStatus,
    GetCapabilities,
    UpdateContext,
    ExecuteAction,
    HealthCheck,
    Shutdown,
}

/// Types of responses agents can send to Sirsi
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SirsiResponseType {
    MessageProcessed,
    SuggestionsGenerated,
    StatusReport,
    CapabilitiesReport,
    ContextUpdated,
    ActionExecuted,
    HealthStatus,
    Error,
}

/// Request priority levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RequestPriority {
    Low,
    Normal,
    High,
    Critical,
    Emergency,
}

/// Agent context maintained locally
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentContext {
    pub agent_id: String,
    pub session_id: String,
    pub user_preferences: HashMap<String, String>,
    pub conversation_history: Vec<ConversationEntry>,
    pub operational_context: HashMap<String, String>,
    pub last_updated: chrono::DateTime<chrono::Utc>,
}

/// Shared context between Sirsi and agents
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SirsiSharedContext {
    pub session_id: String,
    pub global_context: HashMap<String, String>,
    pub active_agents: Vec<String>,
    pub user_intent: Option<String>,
    pub system_state: HashMap<String, String>,
    pub last_synchronized: chrono::DateTime<chrono::Utc>,
}

/// Conversation entry for context tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversationEntry {
    pub id: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub message: String,
    pub response: String,
    pub agent_id: String,
    pub context: HashMap<String, String>,
}

/// Agent capabilities that can be reported to Sirsi
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentCapabilities {
    pub agent_type: String,
    pub supported_operations: Vec<String>,
    pub cloud_providers: Vec<String>,
    pub specializations: Vec<String>,
    pub can_spawn_subagents: bool,
    pub can_coordinate: bool,
    pub max_concurrent_operations: u32,
    pub estimated_response_time_ms: u32,
}

/// Agent suggestions formatted for Sirsi
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentSuggestion {
    pub suggestion_id: String,
    pub title: String,
    pub description: String,
    pub suggestion_type: String,
    pub action_type: String,
    pub parameters: HashMap<String, String>,
    pub confidence: f32,
    pub priority: i32,
    pub estimated_impact: String,
}

/// Agent health status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentHealthStatus {
    pub status: HealthStatusLevel,
    pub cpu_usage_percent: f32,
    pub memory_usage_mb: u64,
    pub active_operations: u32,
    pub error_count: u32,
    pub last_error: Option<String>,
    pub uptime_seconds: u64,
}

/// Health status levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HealthStatusLevel {
    Healthy,
    Warning,
    Critical,
    Error,
    Offline,
}

/// Capability update messages
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CapabilityUpdate {
    pub agent_id: String,
    pub update_type: CapabilityUpdateType,
    pub capabilities: AgentCapabilities,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

/// Types of capability updates
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CapabilityUpdateType {
    Initial,
    Updated,
    Enhanced,
    Degraded,
    Restored,
}

impl SirsiInterface {
    /// Create a new SirsiInterface for an agent
    pub fn new(agent_id: String, agent_type: String) -> Self {
        info!("🔗 Creating SirsiInterface for agent: {} (type: {})", agent_id, agent_type);
        
        let request_handler = Arc::new(SirsiRequestHandler::new(agent_id.clone()));
        let response_sender = Arc::new(SirsiResponseSender::new(agent_id.clone()));
        let context_sync = Arc::new(SirsiContextSync::new(agent_id.clone()));
        let capability_reporter = Arc::new(CapabilityReporter::new(agent_id.clone()));
        let health_monitor = Arc::new(HealthMonitor::new(agent_id.clone()));

        Self {
            agent_id,
            agent_type,
            request_handler,
            response_sender,
            context_sync,
            capability_reporter,
            health_monitor,
        }
    }

    /// Initialize the interface and start background tasks
    pub async fn initialize(&self) -> AppResult<()> {
        info!("🚀 Initializing SirsiInterface for agent: {}", self.agent_id);
        
        // Initialize all components
        self.request_handler.initialize().await?;
        self.response_sender.initialize().await?;
        self.context_sync.initialize().await?;
        self.capability_reporter.initialize().await?;
        self.health_monitor.initialize().await?;

        // Report initial capabilities to Sirsi
        self.report_capabilities(CapabilityUpdateType::Initial).await?;
        
        // Start health monitoring
        self.start_health_monitoring().await?;

        info!("✅ SirsiInterface initialized successfully for agent: {}", self.agent_id);
        Ok(())
    }

    /// Send a response to Sirsi
    pub async fn send_response(&self, response: SirsiResponse) -> AppResult<()> {
        debug!("📤 Agent {} sending response to Sirsi: {}", self.agent_id, response.request_id);
        
        // Validate response
        self.validate_response(&response)?;
        
        // Send through response sender
        self.response_sender.send_response(response).await?;
        
        // Update health metrics
        self.health_monitor.record_operation().await;
        
        Ok(())
    }

    /// Receive a request from Sirsi (non-blocking)
    pub async fn try_receive_request(&self) -> AppResult<Option<SirsiRequest>> {
        self.request_handler.try_receive_request().await
    }

    /// Wait for a request from Sirsi (blocking)
    pub async fn receive_request(&self) -> AppResult<SirsiRequest> {
        self.request_handler.receive_request().await
    }

    /// Update local agent context
    pub async fn update_context(&self, context_updates: HashMap<String, String>) -> AppResult<()> {
        debug!("🔄 Agent {} updating context with {} entries", self.agent_id, context_updates.len());
        self.context_sync.update_local_context(context_updates).await
    }

    /// Get current shared context from Sirsi
    pub async fn get_shared_context(&self) -> AppResult<SirsiSharedContext> {
        self.context_sync.get_shared_context().await
    }

    /// Report agent capabilities to Sirsi
    pub async fn report_capabilities(&self, update_type: CapabilityUpdateType) -> AppResult<()> {
        debug!("📊 Agent {} reporting capabilities: {:?}", self.agent_id, update_type);
        self.capability_reporter.report_capabilities(update_type).await
    }

    /// Get current health status
    pub async fn get_health_status(&self) -> AppResult<AgentHealthStatus> {
        self.health_monitor.get_health_status().await
    }

    /// Create a formatted response for Sirsi from agent processing
    pub fn create_response(
        &self,
        request_id: String,
        content: String,
        suggestions: Vec<Suggestion>,
        processing_time_ms: u64,
    ) -> SirsiResponse {
        let agent_suggestions: Vec<AgentSuggestion> = suggestions
            .into_iter()
            .map(|s| AgentSuggestion {
                suggestion_id: s.suggestion_id,
                title: s.title,
                description: s.description,
                suggestion_type: "action".to_string(), // Map from protobuf
                action_type: s.action.as_ref().map(|a| a.action_type.clone()).unwrap_or_default(),
                parameters: s.action.as_ref().map(|a| a.parameters.clone()).unwrap_or_default(),
                confidence: s.confidence,
                priority: s.priority,
                estimated_impact: "medium".to_string(), // Default value
            })
            .collect();

        SirsiResponse {
            request_id,
            agent_id: self.agent_id.clone(),
            response_type: SirsiResponseType::MessageProcessed,
            success: true,
            content: Some(content),
            suggestions: agent_suggestions,
            context_updates: HashMap::new(),
            error: None,
            confidence_score: 0.9, // Default confidence
            processing_time_ms,
            timestamp: chrono::Utc::now(),
        }
    }

    /// Convert agent capabilities to protobuf format for external APIs
    pub async fn get_capabilities_for_external_api(&self) -> AppResult<Vec<String>> {
        let capabilities = self.capability_reporter.get_capabilities().await?;
        Ok(capabilities.supported_operations)
    }

    /// Process a message request and create appropriate response
    pub async fn process_message_request(
        &self,
        request: SirsiRequest,
        process_fn: impl Fn(&str, HashMap<String, String>) -> AppResult<(String, Vec<Suggestion>)>,
    ) -> AppResult<SirsiResponse> {
        let start_time = std::time::Instant::now();
        
        // Extract message and context
        let message = request.message.as_deref().unwrap_or("");
        let context = request.context.clone();
        
        // Process the message using the provided function
        match process_fn(message, context) {
            Ok((response_content, suggestions)) => {
                let processing_time = start_time.elapsed().as_millis() as u64;
                Ok(self.create_response(request.request_id, response_content, suggestions, processing_time))
            }
            Err(e) => {
                let processing_time = start_time.elapsed().as_millis() as u64;
                Ok(SirsiResponse {
                    request_id: request.request_id,
                    agent_id: self.agent_id.clone(),
                    response_type: SirsiResponseType::Error,
                    success: false,
                    content: None,
                    suggestions: Vec::new(),
                    context_updates: HashMap::new(),
                    error: Some(e.to_string()),
                    confidence_score: 0.0,
                    processing_time_ms: processing_time,
                    timestamp: chrono::Utc::now(),
                })
            }
        }
    }

    /// Validate response before sending to Sirsi
    fn validate_response(&self, response: &SirsiResponse) -> AppResult<()> {
        // Ensure response has required fields
        if response.request_id.is_empty() {
            return Err(AppError::Validation("Response missing request_id".to_string()));
        }
        
        if response.agent_id != self.agent_id {
            return Err(AppError::Validation("Response agent_id mismatch".to_string()));
        }
        
        // Validate confidence score
        if response.confidence_score < 0.0 || response.confidence_score > 1.0 {
            warn!("⚠️ Agent {} confidence score out of range: {}", self.agent_id, response.confidence_score);
        }
        
        Ok(())
    }

    /// Start background health monitoring
    async fn start_health_monitoring(&self) -> AppResult<()> {
        debug!("💓 Starting health monitoring for agent: {}", self.agent_id);
        // This would start a background task in a real implementation
        // For now, we'll just mark it as started
        Ok(())
    }
}

impl SirsiRequestHandler {
    fn new(agent_id: String) -> Self {
        Self {
            agent_id,
            incoming_requests: Arc::new(RwLock::new(HashMap::new())),
            request_receiver: Arc::new(RwLock::new(None)),
        }
    }

    async fn initialize(&self) -> AppResult<()> {
        debug!("🔧 Initializing SirsiRequestHandler for agent: {}", self.agent_id);
        // Initialize request receiver channel
        // This would connect to the actual Sirsi communication channel
        Ok(())
    }

    async fn try_receive_request(&self) -> AppResult<Option<SirsiRequest>> {
        // Non-blocking receive from Sirsi
        // For now, return None (no pending requests)
        Ok(None)
    }

    async fn receive_request(&self) -> AppResult<SirsiRequest> {
        // Blocking receive from Sirsi
        // For now, create a mock request for testing
        Ok(SirsiRequest {
            request_id: Uuid::new_v4().to_string(),
            request_type: SirsiRequestType::ProcessMessage,
            session_id: "test_session".to_string(),
            user_id: "test_user".to_string(),
            message: Some("Test message".to_string()),
            context: HashMap::new(),
            priority: RequestPriority::Normal,
            timestamp: chrono::Utc::now(),
            timeout_ms: Some(30000),
        })
    }
}

impl SirsiResponseSender {
    fn new(agent_id: String) -> Self {
        Self {
            agent_id,
            response_sender: Arc::new(RwLock::new(None)),
            pending_responses: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    async fn initialize(&self) -> AppResult<()> {
        debug!("🔧 Initializing SirsiResponseSender for agent: {}", self.agent_id);
        // Initialize response sender channel
        // This would connect to the actual Sirsi communication channel
        Ok(())
    }

    async fn send_response(&self, response: SirsiResponse) -> AppResult<()> {
        debug!("📤 Sending response to Sirsi: {}", response.request_id);
        
        // Store in pending responses for tracking
        {
            let mut pending = self.pending_responses.write().await;
            pending.insert(response.request_id.clone(), response.clone());
        }
        
        // Send to Sirsi through communication channel
        // For now, just log the response
        info!("📨 Agent {} response sent to Sirsi: {} ({})", 
              self.agent_id, response.request_id, response.response_type as u8);
        
        Ok(())
    }
}

impl SirsiContextSync {
    fn new(agent_id: String) -> Self {
        let agent_id_clone = agent_id.clone();
        Self {
            agent_id,
            local_context: Arc::new(RwLock::new(AgentContext {
                agent_id: agent_id_clone,
                session_id: String::new(),
                user_preferences: HashMap::new(),
                conversation_history: Vec::new(),
                operational_context: HashMap::new(),
                last_updated: chrono::Utc::now(),
            })),
            sirsi_context: Arc::new(RwLock::new(SirsiSharedContext {
                session_id: String::new(),
                global_context: HashMap::new(),
                active_agents: Vec::new(),
                user_intent: None,
                system_state: HashMap::new(),
                last_synchronized: chrono::Utc::now(),
            })),
            sync_frequency_ms: 5000, // Sync every 5 seconds
        }
    }

    async fn initialize(&self) -> AppResult<()> {
        debug!("🔧 Initializing SirsiContextSync for agent: {}", self.agent_id);
        // Start periodic context synchronization
        Ok(())
    }

    async fn update_local_context(&self, updates: HashMap<String, String>) -> AppResult<()> {
        let mut context = self.local_context.write().await;
        for (key, value) in updates {
            context.operational_context.insert(key, value);
        }
        context.last_updated = chrono::Utc::now();
        Ok(())
    }

    async fn get_shared_context(&self) -> AppResult<SirsiSharedContext> {
        let context = self.sirsi_context.read().await;
        Ok(context.clone())
    }
}

impl CapabilityReporter {
    fn new(agent_id: String) -> Self {
        Self {
            agent_id,
            capabilities: Arc::new(RwLock::new(AgentCapabilities {
                agent_type: "generic".to_string(),
                supported_operations: Vec::new(),
                cloud_providers: Vec::new(),
                specializations: Vec::new(),
                can_spawn_subagents: false,
                can_coordinate: false,
                max_concurrent_operations: 5,
                estimated_response_time_ms: 1000,
            })),
            status_sender: Arc::new(RwLock::new(None)),
        }
    }

    async fn initialize(&self) -> AppResult<()> {
        debug!("🔧 Initializing CapabilityReporter for agent: {}", self.agent_id);
        // Initialize capability reporting channel
        Ok(())
    }

    async fn report_capabilities(&self, update_type: CapabilityUpdateType) -> AppResult<()> {
        let capabilities = self.capabilities.read().await.clone();
        let update = CapabilityUpdate {
            agent_id: self.agent_id.clone(),
            update_type,
            capabilities,
            timestamp: chrono::Utc::now(),
        };
        
        debug!("📊 Reporting capabilities to Sirsi: {:?}", update.update_type);
        // Send capability update to Sirsi
        
        Ok(())
    }

    async fn get_capabilities(&self) -> AppResult<AgentCapabilities> {
        let capabilities = self.capabilities.read().await;
        Ok(capabilities.clone())
    }
}

impl HealthMonitor {
    fn new(agent_id: String) -> Self {
        Self {
            agent_id,
            health_status: Arc::new(RwLock::new(AgentHealthStatus {
                status: HealthStatusLevel::Healthy,
                cpu_usage_percent: 0.0,
                memory_usage_mb: 0,
                active_operations: 0,
                error_count: 0,
                last_error: None,
                uptime_seconds: 0,
            })),
            last_heartbeat: Arc::new(RwLock::new(chrono::Utc::now())),
            heartbeat_interval_ms: 30000, // 30 second heartbeat
        }
    }

    async fn initialize(&self) -> AppResult<()> {
        debug!("🔧 Initializing HealthMonitor for agent: {}", self.agent_id);
        // Start health monitoring
        Ok(())
    }

    async fn get_health_status(&self) -> AppResult<AgentHealthStatus> {
        let status = self.health_status.read().await;
        Ok(status.clone())
    }

    async fn record_operation(&self) {
        // Update heartbeat
        {
            let mut heartbeat = self.last_heartbeat.write().await;
            *heartbeat = chrono::Utc::now();
        }
        
        // Update operation count
        {
            let mut status = self.health_status.write().await;
            status.active_operations = status.active_operations.saturating_add(1);
        }
    }
}

/// Quality enforcement for agent responses
pub struct QualityEnforcer;

impl QualityEnforcer {
    /// Validate agent response meets quality standards
    pub fn validate_response(response: &SirsiResponse) -> AppResult<()> {
        // Quality checks aligned with HDP/HAP requirements
        
        // Check response completeness
        if response.success && response.content.is_none() {
            return Err(AppError::Validation("Successful response missing content".to_string()));
        }
        
        // Check confidence score reasonableness
        if response.confidence_score < 0.1 && response.success {
            warn!("⚠️ Low confidence score for successful response: {}", response.confidence_score);
        }
        
        // Check processing time reasonableness
        if response.processing_time_ms > 30000 {
            warn!("⚠️ High processing time: {}ms", response.processing_time_ms);
        }
        
        // Validate suggestions quality
        for suggestion in &response.suggestions {
            if suggestion.title.is_empty() || suggestion.description.is_empty() {
                return Err(AppError::Validation("Suggestion missing title or description".to_string()));
            }
        }
        
        Ok(())
    }
    
    /// Enforce response standards before sending to Sirsi
    pub fn enforce_standards(response: &mut SirsiResponse) {
        // Ensure minimum confidence for successful responses
        if response.success && response.confidence_score < 0.5 {
            response.confidence_score = 0.5;
        }
        
        // Limit number of suggestions for better UX
        if response.suggestions.len() > 5 {
            response.suggestions.truncate(5);
        }
        
        // Ensure content quality
        if let Some(content) = &response.content {
            if content.len() < 10 {
                response.confidence_score *= 0.8; // Reduce confidence for short responses
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::proto::Action;

    #[tokio::test]
    async fn test_sirsi_interface_creation() {
        let interface = SirsiInterface::new("test_agent".to_string(), "aws".to_string());
        assert_eq!(interface.agent_id, "test_agent");
        assert_eq!(interface.agent_type, "aws");
    }

    #[tokio::test]
    async fn test_sirsi_interface_initialization() {
        let interface = SirsiInterface::new("test_agent".to_string(), "aws".to_string());
        let result = interface.initialize().await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_response_creation() {
        let interface = SirsiInterface::new("test_agent".to_string(), "aws".to_string());
        let suggestions = vec![
            Suggestion {
                suggestion_id: "test_1".to_string(),
                title: "Test Suggestion".to_string(),
                description: "Test Description".to_string(),
                r#type: 1,
                action: Some(Action {
                    action_type: "test".to_string(),
                    command: "test_command".to_string(),
                    parameters: HashMap::new(),
                    required_permissions: Vec::new(),
                }),
                confidence: 0.9,
                metadata: HashMap::new(),
                priority: 1,
            }
        ];
        
        let response = interface.create_response(
            "test_request".to_string(),
            "Test response content".to_string(),
            suggestions,
            100,
        );
        
        assert_eq!(response.request_id, "test_request");
        assert_eq!(response.agent_id, "test_agent");
        assert!(response.success);
        assert_eq!(response.suggestions.len(), 1);
    }

    #[tokio::test]
    async fn test_quality_enforcement() {
        let mut response = SirsiResponse {
            request_id: "test".to_string(),
            agent_id: "test_agent".to_string(),
            response_type: SirsiResponseType::MessageProcessed,
            success: true,
            content: Some("Short".to_string()),
            suggestions: Vec::new(),
            context_updates: HashMap::new(),
            error: None,
            confidence_score: 0.3,
            processing_time_ms: 100,
            timestamp: chrono::Utc::now(),
        };
        
        QualityEnforcer::enforce_standards(&mut response);
        assert_eq!(response.confidence_score, 0.5); // Should be raised to minimum
        
        let validation_result = QualityEnforcer::validate_response(&response);
        assert!(validation_result.is_ok());
    }
}
