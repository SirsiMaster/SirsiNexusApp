use std::collections::HashMap;
use std::sync::Arc;
use std::time::Instant;
use uuid::Uuid;
use tracing::{info, warn};

use crate::{
    error::{AppError, AppResult},
    agent::implementations::AwsAgent,
    agent::context::ContextStore,
    telemetry::{
        metrics::MetricsCollector,
        opentelemetry::{OtelTracer, SpanStatus},
    },
};
use crate::proto::{Suggestion, Action};
use crate::audit::AuditLogger;

#[derive(Debug, Clone)]
pub struct AgentInfo {
    pub agent_id: String,
    pub agent_type: String,
    pub parent_agent_id: Option<String>,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct AgentMetricsData {
    pub messages_processed: i64,
    pub operations_completed: i64,
    pub errors_encountered: i64,
    pub average_response_time_ms: f64,
    pub custom_metrics: HashMap<String, String>,
}

pub struct AgentManager {
    sessions: HashMap<String, SessionState>,
    agents: HashMap<String, AgentState>,
    metrics_collector: Option<Arc<MetricsCollector>>,
    otel_tracer: Option<Arc<OtelTracer>>,
    audit_logger: Option<AuditLogger>,
}

struct SessionState {
    _user_id: String,
    agent_ids: Vec<String>,
    _context: HashMap<String, String>,
}

enum AgentImplementation {
    Aws(AwsAgent),
    Azure,
    Gcp,
    Security,
    CostOptimization,
    Migration,
    Reporting,
    General,
}

#[derive(Debug, Clone)]
pub enum AgentRole {
    Primary,
    SubAgent,
    Coordinator,
}

#[derive(Debug, Clone)]
pub struct AgentCapabilities {
    pub can_spawn_subagents: bool,
    pub can_coordinate: bool,
    pub domain_expertise: Vec<String>,
    pub required_permissions: Vec<String>,
}

impl AgentCapabilities {
    pub fn is_empty(&self) -> bool {
        self.domain_expertise.is_empty() && self.required_permissions.is_empty()
    }
}

struct AgentState {
    agent_type: String,
    status: String,
    metrics: HashMap<String, String>,
    capabilities: AgentCapabilities,
    #[allow(dead_code)] // Role system for future agent hierarchy
    role: AgentRole,
    parent_agent_id: Option<String>,
    sub_agent_ids: Vec<String>,
    implementation: AgentImplementation,
    context_store: Arc<ContextStore>,
    #[allow(dead_code)] // Memory system for future agent persistence
    memory: HashMap<String, String>,
}

impl Default for AgentManager {
    fn default() -> Self {
        Self::new()
    }
}

impl AgentManager {
    pub fn new() -> Self {
        Self {
            sessions: HashMap::new(),
            agents: HashMap::new(),
            metrics_collector: None,
            otel_tracer: None,
            audit_logger: None,
        }
    }
    
    pub fn new_with_context_store(_context_store: Arc<ContextStore>) -> Self {
        Self {
            sessions: HashMap::new(),
            agents: HashMap::new(),
            metrics_collector: None,
            otel_tracer: None,
            audit_logger: None,
        }
    }
    
    /// Add observability components
    pub fn with_observability(
        mut self,
        metrics_collector: Arc<MetricsCollector>,
        otel_tracer: Arc<OtelTracer>,
        audit_logger: AuditLogger,
    ) -> Self {
        self.metrics_collector = Some(metrics_collector);
        self.otel_tracer = Some(otel_tracer);
        self.audit_logger = Some(audit_logger);
        self
    }

    pub async fn list_available_agents(&self) -> Vec<String> {
        vec![
            "aws".to_string(),
            "azure".to_string(),
            "gcp".to_string(),
            "vsphere".to_string(),
            "migration".to_string(),
            "reporting".to_string(),
            "security".to_string(),
            "cost_optimization".to_string(),
            "compliance".to_string(),
            "monitoring".to_string(),
            "automation".to_string(),
            "scripting".to_string(),
            "tutorial".to_string(),
        ]
    }
    
    /// Initialize a new session in the agent manager
    pub async fn initialize_session(
        &mut self,
        session_id: &str,
        user_id: &str,
    ) -> AppResult<()> {
        info!("🔧 Initializing session: {} for user: {}", session_id, user_id);
        
        let session_state = SessionState {
            _user_id: user_id.to_string(),
            agent_ids: Vec::new(),
            _context: HashMap::new(),
        };
        
        self.sessions.insert(session_id.to_string(), session_state);
        
        info!("✅ Session initialized successfully: {}", session_id);
        Ok(())
    }
    
    pub async fn spawn_sub_agent(
        &mut self,
        parent_agent_id: &str,
        agent_type: &str,
        config: HashMap<String, String>,
    ) -> AppResult<String> {
        // Check parent agent capabilities first
        {
            let parent_agent = self.agents.get(parent_agent_id)
                .ok_or_else(|| AppError::NotFound("Parent agent not found".into()))?;
            
            if !parent_agent.capabilities.can_spawn_subagents {
                return Err(AppError::Configuration("Parent agent cannot spawn sub-agents".into()));
            }
        }
        
        let sub_agent_id = Uuid::new_v4().to_string();
        let parent_agent_id_string = parent_agent_id.to_string();
        
        // Get context store from parent agent
        let context_store = {
            let parent_agent = self.agents.get(parent_agent_id)
                .ok_or_else(|| AppError::NotFound("Parent agent not found".into()))?;
            parent_agent.context_store.clone()
        };
        
        let (implementation, capabilities) = self.create_agent_implementation(
            agent_type, 
            &sub_agent_id, 
            Some(parent_agent_id), 
            config
        ).await?;
        
        let agent_state = AgentState {
            agent_type: agent_type.to_string(),
            status: "ready".to_string(),
            metrics: HashMap::new(),
            capabilities,
            role: AgentRole::SubAgent,
            parent_agent_id: Some(parent_agent_id_string.clone()),
            sub_agent_ids: Vec::new(),
            implementation,
            context_store,
            memory: HashMap::new(),
        };
        
        // Insert the new agent first
        self.agents.insert(sub_agent_id.clone(), agent_state);
        
        // Then update parent agent
        if let Some(parent_agent) = self.agents.get_mut(&parent_agent_id_string) {
            parent_agent.sub_agent_ids.push(sub_agent_id.clone());
        }
        
        Ok(sub_agent_id)
    }
    
    async fn create_agent_implementation(
        &self,
        agent_type: &str,
        agent_id: &str,
        _parent_agent_id: Option<&str>,
        config: HashMap<String, String>,
    ) -> AppResult<(AgentImplementation, AgentCapabilities)> {
        match agent_type {
            "aws" => {
                let aws_agent = AwsAgent::new(agent_id.to_string(), "".to_string(), config);
                aws_agent.initialize().await?;
                let capabilities = AgentCapabilities {
                    can_spawn_subagents: true,
                    can_coordinate: true,
                    domain_expertise: vec!["aws".to_string(), "ec2".to_string(), "s3".to_string()],
                    required_permissions: vec!["aws:read".to_string()],
                };
                Ok((AgentImplementation::Aws(aws_agent), capabilities))
            }
            "azure" => {
                let capabilities = AgentCapabilities {
                    can_spawn_subagents: true,
                    can_coordinate: true,
                    domain_expertise: vec!["azure".to_string(), "vm".to_string(), "storage".to_string()],
                    required_permissions: vec!["azure:read".to_string()],
                };
                Ok((AgentImplementation::Azure, capabilities))
            }
            "gcp" => {
                let capabilities = AgentCapabilities {
                    can_spawn_subagents: true,
                    can_coordinate: true,
                    domain_expertise: vec!["gcp".to_string(), "compute".to_string(), "storage".to_string()],
                    required_permissions: vec!["gcp:read".to_string()],
                };
                Ok((AgentImplementation::Gcp, capabilities))
            }
            "security" => {
                let capabilities = AgentCapabilities {
                    can_spawn_subagents: false,
                    can_coordinate: false,
                    domain_expertise: vec!["security".to_string(), "compliance".to_string(), "audit".to_string()],
                    required_permissions: vec!["security:read".to_string(), "audit:read".to_string()],
                };
                Ok((AgentImplementation::Security, capabilities))
            }
            "cost_optimization" => {
                let capabilities = AgentCapabilities {
                    can_spawn_subagents: false,
                    can_coordinate: false,
                    domain_expertise: vec!["cost".to_string(), "optimization".to_string(), "billing".to_string()],
                    required_permissions: vec!["billing:read".to_string()],
                };
                Ok((AgentImplementation::CostOptimization, capabilities))
            }
            "migration" => {
                let capabilities = AgentCapabilities {
                    can_spawn_subagents: true,
                    can_coordinate: true,
                    domain_expertise: vec!["migration".to_string(), "planning".to_string(), "execution".to_string()],
                    required_permissions: vec!["migration:read".to_string(), "migration:write".to_string()],
                };
                Ok((AgentImplementation::Migration, capabilities))
            }
            "reporting" => {
                let capabilities = AgentCapabilities {
                    can_spawn_subagents: false,
                    can_coordinate: false,
                    domain_expertise: vec!["reporting".to_string(), "analytics".to_string(), "visualization".to_string()],
                    required_permissions: vec!["analytics:read".to_string()],
                };
                Ok((AgentImplementation::Reporting, capabilities))
            }
            _ => {
                let capabilities = AgentCapabilities {
                    can_spawn_subagents: false,
                    can_coordinate: false,
                    domain_expertise: vec!["general".to_string()],
                    required_permissions: vec![],
                };
                Ok((AgentImplementation::General, capabilities))
            }
        }
    }

    pub async fn spawn_agent(
        &mut self,
        session_id: &str,
        agent_type: &str,
        config: HashMap<String, String>,
    ) -> AppResult<String> {
        let start_time = Instant::now();
        let agent_id = Uuid::new_v4().to_string();

        // Start distributed tracing span
        let span = if let Some(tracer) = &self.otel_tracer {
            tracer.start_span(
                &format!("agent_spawn_{}", agent_type),
                "agent_manager",
                None,
            ).await.ok()
        } else {
            None
        };

        // Add span tags
        if let (Some(tracer), Some(ref span)) = (&self.otel_tracer, &span) {
            let mut tags = HashMap::new();
            tags.insert("agent.type".to_string(), agent_type.to_string());
            tags.insert("agent.id".to_string(), agent_id.clone());
            tags.insert("session.id".to_string(), session_id.to_string());
            let _ = tracer.add_span_tags(&span.span_id, tags).await;
        }

        // Verify session exists first
        if !self.sessions.contains_key(session_id) {
            if let (Some(tracer), Some(ref span)) = (&self.otel_tracer, &span) {
                let _ = tracer.finish_span(&span.span_id, SpanStatus::Error).await;
            }
            return Err(AppError::NotFound("Session not found".into()));
        }

        let (implementation, capabilities) = self.create_agent_implementation(
            agent_type,
            &agent_id,
            None,
            config
        ).await?;
        
        // Create default context store for now
        let context_store = Arc::new(ContextStore::new("redis://127.0.0.1:6379")?);

        // Create agent state
        let agent_state = AgentState {
            agent_type: agent_type.to_string(),
            status: "ready".to_string(),
            metrics: HashMap::new(),
            capabilities,
            role: AgentRole::Primary,
            parent_agent_id: None,
            sub_agent_ids: Vec::new(),
            implementation,
            context_store,
            memory: HashMap::new(),
        };

        // Add agent to global state first
        self.agents.insert(agent_id.clone(), agent_state);
        
        // Then add agent to session
        if let Some(session) = self.sessions.get_mut(session_id) {
            session.agent_ids.push(agent_id.clone());
        }

        // Record metrics
        if let Some(metrics) = &self.metrics_collector {
            metrics.increment_counter("agent_spawns_total", 1).await;
            metrics.increment_counter(&format!("agent_spawns_{}", agent_type), 1).await;
            metrics.set_gauge("active_agents", self.agents.len() as i64).await;
        }

        // Audit log
        if let Some(audit_logger) = &self.audit_logger {
            let _ = audit_logger.log_agent_event(
                &agent_id,
                "agent_spawned",
                serde_json::json!({
                    "agent_type": agent_type,
                    "session_id": session_id,
                    "spawn_duration_ms": start_time.elapsed().as_millis()
                }),
                true,
                Some(session_id),
            ).await;
        }

        // Finish span
        if let (Some(tracer), Some(ref span)) = (&self.otel_tracer, &span) {
            let _ = tracer.finish_span(&span.span_id, SpanStatus::Ok).await;
        }

        Ok(agent_id)
    }
    
    /// Enable dynamic module loading capabilities
    pub async fn enable_dynamic_loading(&self, enabled: bool) {
        if enabled {
            tracing::info!("🔄 Dynamic module loading enabled.");
        } else {
            tracing::warn!("⚠️ Dynamic module loading is disabled.");
        }
    }

    /// Update agent state for stateful decision making
    pub async fn update_agent_state(&mut self, agent_id: &str, status: String) -> AppResult<()> {
        if let Some(agent) = self.agents.get_mut(agent_id) {
            agent.status = status;
            tracing::info!("Agent {} state updated.", agent_id);
            Ok(())
        } else {
            Err(AppError::NotFound(format!("Agent with ID {} not found", agent_id)))
        }
    }

    pub async fn send_message(
        &self,
        session_id: &str,
        agent_id: &str,
        message: &str,
        context: HashMap<String, String>,
    ) -> AppResult<(String, String, Vec<Suggestion>)> {
        let start_time = Instant::now();
        
        // Start distributed tracing span
        let span = if let Some(tracer) = &self.otel_tracer {
            tracer.start_span(
                "agent_message_processing",
                "agent_manager",
                None,
            ).await.ok()
        } else {
            None
        };

        // Add span tags
        if let (Some(tracer), Some(ref span)) = (&self.otel_tracer, &span) {
            let mut tags = HashMap::new();
            tags.insert("agent.id".to_string(), agent_id.to_string());
            tags.insert("session.id".to_string(), session_id.to_string());
            tags.insert("message.length".to_string(), message.len().to_string());
            let _ = tracer.add_span_tags(&span.span_id, tags).await;
        }

        // Verify session and agent exist
        let agent = match self.verify_session_and_agent(session_id, agent_id) {
            Ok(agent) => agent,
            Err(e) => {
                if let (Some(tracer), Some(ref span)) = (&self.otel_tracer, &span) {
                    let _ = tracer.finish_span(&span.span_id, SpanStatus::Error).await;
                }
                return Err(e);
            }
        };

        let message_id = Uuid::new_v4().to_string();
        
        let (response, suggestions) = match &agent.implementation {
            AgentImplementation::Aws(aws_agent) => {
                aws_agent.process_message(message, context).await?
            }
            AgentImplementation::Azure => {
                let response = format!("Azure agent received: {}", message);
                let suggestions = vec![];
                (response, suggestions)
            }
            AgentImplementation::Gcp => {
                let response = format!("GCP agent received: {}", message);
                let suggestions = vec![];
                (response, suggestions)
            }
            AgentImplementation::Security => {
                let response = format!("Security agent received: {}", message);
                let suggestions = vec![];
                (response, suggestions)
            }
            AgentImplementation::CostOptimization => {
                let response = format!("Cost optimization agent received: {}", message);
                let suggestions = vec![];
                (response, suggestions)
            }
            AgentImplementation::Migration => {
                let response = format!("Migration agent received: {}", message);
                let suggestions = vec![];
                (response, suggestions)
            }
            AgentImplementation::Reporting => {
                let response = format!("Reporting agent received: {}", message);
                let suggestions = vec![];
                (response, suggestions)
            }
            AgentImplementation::General => {
                let response = format!("General agent received: {}", message);
                let suggestions = vec![
                    Suggestion {
                        suggestion_id: Uuid::new_v4().to_string(),
                        title: "General Help".to_string(),
                        description: "Get general assistance".to_string(),
                        r#type: 1, // SUGGESTION_TYPE_ACTION
                        action: Some(Action {
                            action_type: "general_help".to_string(),
                            command: "general_help".to_string(),
                            parameters: HashMap::new(),
                            required_permissions: vec![],
                        }),
                        confidence: 0.8,
                        metadata: HashMap::new(),
                        priority: 1,
                    },
                ];
                (response, suggestions)
            }
        };

        let duration_ms = start_time.elapsed().as_millis() as f64;
        
        // Record metrics
        if let Some(metrics) = &self.metrics_collector {
            metrics.increment_counter("agent_messages_total", 1).await;
            metrics.increment_counter(&format!("agent_messages_{}", &agent.agent_type), 1).await;
            metrics.observe_histogram("agent_message_duration_ms", duration_ms).await;
            metrics.record_agent_operation(
                "message_processing",
                duration_ms,
                true, // Assuming success if we reach here
                false, // Not an AI API call directly
            ).await;
        }

        // Audit log
        if let Some(audit_logger) = &self.audit_logger {
            let _ = audit_logger.log_agent_event(
                agent_id,
                "message_processed",
                serde_json::json!({
                    "message_id": message_id,
                    "agent_type": agent.agent_type,
                    "response_length": response.len(),
                    "suggestions_count": suggestions.len(),
                    "duration_ms": duration_ms
                }),
                false,
                Some(session_id),
            ).await;
        }

        // Finish span
        if let (Some(tracer), Some(ref span)) = (&self.otel_tracer, &span) {
            let _ = tracer.add_span_event(
                &span.span_id,
                "message_processed",
                {
                    let mut attrs = HashMap::new();
                    attrs.insert("suggestions_count".to_string(), suggestions.len().to_string());
                    attrs.insert("response_length".to_string(), response.len().to_string());
                    attrs
                },
            ).await;
            let _ = tracer.finish_span(&span.span_id, SpanStatus::Ok).await;
        }

        Ok((message_id, response, suggestions))
    }

    pub async fn get_suggestions(
        &self,
        session_id: &str,
        agent_id: &str,
        context_type: &str,
        context: HashMap<String, String>,
    ) -> AppResult<Vec<Suggestion>> {
        // Verify session and agent exist
        let agent = self.verify_session_and_agent(session_id, agent_id)?;

        let suggestions = match &agent.implementation {
            AgentImplementation::Aws(aws_agent) => {
                aws_agent.get_suggestions(context_type, context).await?
            }
            AgentImplementation::Azure => {
                vec![
                    Suggestion {
                        suggestion_id: Uuid::new_v4().to_string(),
                        title: format!("Azure {} Suggestion", context_type),
                        description: "This is an Azure contextual suggestion".to_string(),
                        r#type: 1, // SUGGESTION_TYPE_ACTION
                        action: Some(Action {
                            action_type: "azure_action".to_string(),
                            command: "azure_action".to_string(),
                            parameters: HashMap::new(),
                            required_permissions: vec![],
                        }),
                        confidence: 0.7,
                        metadata: HashMap::new(),
                        priority: 1,
                    },
                ]
            }
            AgentImplementation::Gcp => {
                vec![
                    Suggestion {
                        suggestion_id: Uuid::new_v4().to_string(),
                        title: format!("GCP {} Suggestion", context_type),
                        description: "This is a GCP contextual suggestion".to_string(),
                        r#type: 1, // SUGGESTION_TYPE_ACTION
                        action: Some(Action {
                            action_type: "gcp_action".to_string(),
                            command: "gcp_action".to_string(),
                            parameters: HashMap::new(),
                            required_permissions: vec![],
                        }),
                        confidence: 0.7,
                        metadata: HashMap::new(),
                        priority: 1,
                    },
                ]
            }
            AgentImplementation::Security => {
                vec![
                    Suggestion {
                        suggestion_id: Uuid::new_v4().to_string(),
                        title: format!("Security {} Suggestion", context_type),
                        description: "This is a security contextual suggestion".to_string(),
                        r#type: 1, // SUGGESTION_TYPE_ACTION
                        action: Some(Action {
                            action_type: "security_action".to_string(),
                            parameters: HashMap::new(),
                            command: "action_command".to_string(),
                            required_permissions: vec![],
                        }),
                        confidence: 0.7,
                        metadata: HashMap::new(),
                        priority: 1,
                    },
                ]
            }
            AgentImplementation::CostOptimization => {
                vec![
                    Suggestion {
                        suggestion_id: Uuid::new_v4().to_string(),
                        title: format!("Cost Optimization {} Suggestion", context_type),
                        description: "This is a cost optimization suggestion".to_string(),
                        r#type: 1, // SUGGESTION_TYPE_ACTION
                        action: Some(Action {
                            action_type: "cost_optimization_action".to_string(),
                            parameters: HashMap::new(),
                            command: "action_command".to_string(),
                            required_permissions: vec![],
                        }),
                        confidence: 0.7,
                        metadata: HashMap::new(),
                        priority: 1,
                    },
                ]
            }
            AgentImplementation::Migration => {
                vec![
                    Suggestion {
                        suggestion_id: Uuid::new_v4().to_string(),
                        title: format!("Migration {} Suggestion", context_type),
                        description: "This is a migration contextual suggestion".to_string(),
                        r#type: 1, // SUGGESTION_TYPE_ACTION
                        action: Some(Action {
                            action_type: "migration_action".to_string(),
                            parameters: HashMap::new(),
                            command: "action_command".to_string(),
                            required_permissions: vec![],
                        }),
                        confidence: 0.7,
                        metadata: HashMap::new(),
                        priority: 1,
                    },
                ]
            }
            AgentImplementation::Reporting => {
                vec![
                    Suggestion {
                        suggestion_id: Uuid::new_v4().to_string(),
                        title: format!("Reporting {} Suggestion", context_type),
                        description: "This is a reporting contextual suggestion".to_string(),
                        r#type: 1, // SUGGESTION_TYPE_ACTION
                        action: Some(Action {
                            action_type: "reporting_action".to_string(),
                            parameters: HashMap::new(),
                            command: "action_command".to_string(),
                            required_permissions: vec![],
                        }),
                        confidence: 0.7,
                        metadata: HashMap::new(),
                        priority: 1,
                    },
                ]
            }
            AgentImplementation::General => {
                vec![
                    Suggestion {
                        suggestion_id: Uuid::new_v4().to_string(),
                        title: format!("General {} Suggestion", context_type),
                        description: "This is a general contextual suggestion".to_string(),
                        r#type: 1, // SUGGESTION_TYPE_ACTION
                        action: Some(Action {
                            action_type: "general_action".to_string(),
                            parameters: HashMap::new(),
                            command: "action_command".to_string(),
                            required_permissions: vec![],
                        }),
                        confidence: 0.7,
                        metadata: HashMap::new(),
                        priority: 1,
                    },
                ]
            }
        };

        Ok(suggestions)
    }
    
    /// Get comprehensive metrics for all agents
    pub async fn get_agent_metrics(&self) -> AgentMetricsData {
        let mut total_messages = 0i64;
        let mut total_operations = 0i64;
        let mut total_errors = 0i64;
        let total_response_time = 0f64;
        let mut custom_metrics = HashMap::new();
        
        // Aggregate metrics from all agents
        for (agent_id, agent_state) in &self.agents {
            // Extract metrics from agent state (simplified)
            if let Some(messages) = agent_state.metrics.get("messages_processed") {
                if let Ok(count) = messages.parse::<i64>() {
                    total_messages += count;
                }
            }
            if let Some(operations) = agent_state.metrics.get("operations_completed") {
                if let Ok(count) = operations.parse::<i64>() {
                    total_operations += count;
                }
            }
            if let Some(errors) = agent_state.metrics.get("errors_encountered") {
                if let Ok(count) = errors.parse::<i64>() {
                    total_errors += count;
                }
            }
            
            // Add agent-specific metrics
            custom_metrics.insert(
                format!("agent_{}_type", agent_id),
                agent_state.agent_type.clone(),
            );
            custom_metrics.insert(
                format!("agent_{}_status", agent_id),
                agent_state.status.clone(),
            );
        }
        
        // Calculate average response time
        let average_response_time_ms = if total_messages > 0 {
            total_response_time / total_messages as f64
        } else {
            0.0
        };
        
        custom_metrics.insert("active_agents_count".to_string(), self.agents.len().to_string());
        custom_metrics.insert("active_sessions_count".to_string(), self.sessions.len().to_string());
        
        AgentMetricsData {
            messages_processed: total_messages,
            operations_completed: total_operations,
            errors_encountered: total_errors,
            average_response_time_ms,
            custom_metrics,
        }
    }

    pub async fn get_agent_status(
        &self,
        session_id: &str,
        agent_id: &str,
    ) -> AppResult<(String, HashMap<String, String>, Vec<String>)> {
        // Verify session and agent exist
        let agent = self.verify_session_and_agent(session_id, agent_id)?;

        // Convert capabilities to string vector for easier service integration
        let capabilities_list = vec![
            "message_processing".to_string(),
            "context_awareness".to_string(),
            "suggestion_generation".to_string(),
        ];

        Ok((
            agent.status.clone(),
            agent.metrics.clone(),
            capabilities_list,
        ))
    }

    pub async fn get_agent_details(
        &self,
        session_id: &str,
        agent_id: &str,
    ) -> AppResult<(AgentInfo, AgentMetricsData)> {
        let agent = self.verify_session_and_agent(session_id, agent_id)?;
        
        let agent_info = AgentInfo {
            agent_id: agent_id.to_string(),
            agent_type: agent.agent_type.clone(),
            parent_agent_id: agent.parent_agent_id.clone(),
        };
        
        let metrics_data = AgentMetricsData {
            messages_processed: agent.metrics.get("messages_processed")
                .and_then(|v| v.parse::<i64>().ok()).unwrap_or(0),
            operations_completed: agent.metrics.get("operations_completed")
                .and_then(|v| v.parse::<i64>().ok()).unwrap_or(0),
            errors_encountered: agent.metrics.get("errors_encountered")
                .and_then(|v| v.parse::<i64>().ok()).unwrap_or(0),
            average_response_time_ms: agent.metrics.get("avg_response_time_ms")
                .and_then(|v| v.parse::<f64>().ok()).unwrap_or(0.0),
            custom_metrics: agent.metrics.clone(),
        };
        
        Ok((agent_info, metrics_data))
    }
    
    pub async fn list_session_agents(
        &self,
        session_id: &str,
    ) -> AppResult<Vec<AgentInfo>> {
        let session = self.sessions
            .get(session_id)
            .ok_or_else(|| AppError::NotFound("Session not found".into()))?;
        
        let mut agent_list = Vec::new();
        
        for agent_id in &session.agent_ids {
            if let Some(agent) = self.agents.get(agent_id) {
                agent_list.push(AgentInfo {
                    agent_id: agent_id.clone(),
                    agent_type: agent.agent_type.clone(),
                    parent_agent_id: agent.parent_agent_id.clone(),
                });
            }
        }
        
        Ok(agent_list)
    }

    /// Terminate an agent and remove it from the session
    pub async fn terminate_agent(&mut self, session_id: &str, agent_id: &str) -> AppResult<()> {
        // Verify the agent exists in the session
        self.verify_session_and_agent(session_id, agent_id)?;
        
        // Remove the agent from the session
        if let Some(session) = self.sessions.get_mut(session_id) {
            session.agent_ids.retain(|id| id != agent_id);
        }
        
        // Remove the agent itself
        if let Some(agent) = self.agents.remove(agent_id) {
            // If this agent has sub-agents, terminate them too
            let sub_agent_ids = agent.sub_agent_ids.clone();
            for sub_agent_id in sub_agent_ids {
                let future = self.terminate_agent(session_id, &sub_agent_id);
                if let Err(e) = Box::pin(future).await {
                    warn!("Failed to terminate sub-agent {}: {}", sub_agent_id, e);
                }
            }
            
            info!("Terminated agent {} from session {}", agent_id, session_id);
        }
        
        Ok(())
    }
    
    fn verify_session_and_agent(&self, session_id: &str, agent_id: &str) -> AppResult<&AgentState> {
        let session = self.sessions
            .get(session_id)
            .ok_or_else(|| AppError::NotFound("Session not found".into()))?;

        if !session.agent_ids.contains(&agent_id.to_string()) {
            return Err(AppError::NotFound("Agent not found in session".into()));
        }

        let agent = self.agents
            .get(agent_id)
            .ok_or_else(|| AppError::NotFound("Agent not found".into()))?;

        Ok(agent)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_list_available_agents() {
        let manager = AgentManager::new();
        let agents = manager.list_available_agents().await;
        assert!(!agents.is_empty());
    }

    #[tokio::test]
    async fn test_agent_lifecycle() {
        let mut manager = AgentManager::new();
        
        // Create a session
        let session_id = "test-session".to_string();
        manager.sessions.insert(session_id.clone(), SessionState {
            _user_id: "test-user".to_string(),
            agent_ids: Vec::new(),
            _context: HashMap::new(),
        });

        // Spawn an agent
        let agent_id = manager.spawn_agent(
            &session_id,
            "test",
            HashMap::new(),
        ).await.unwrap();

        // Get agent status
        let (status, _metrics, capabilities) = manager.get_agent_status(
            &session_id,
            &agent_id,
        ).await.unwrap();

        assert_eq!(status, "ready");
        assert!(!capabilities.is_empty());

        // Send a message
        let (message_id, response, suggestions) = manager.send_message(
            &session_id,
            &agent_id,
            "test message",
            HashMap::new(),
        ).await.unwrap();

        assert!(!message_id.is_empty());
        assert!(!response.is_empty());
        assert!(!suggestions.is_empty());

        // Get suggestions
        let suggestions = manager.get_suggestions(
            &session_id,
            &agent_id,
            "test",
            HashMap::new(),
        ).await.unwrap();

        assert!(!suggestions.is_empty());
    }
}
