use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::info;
use uuid::Uuid;
use prost_types::Timestamp;

use crate::agent::AgentManager;
use crate::agent::context::ContextStore;
use crate::proto::sirsi::agent::v1::{agent_service_server::*, *};

#[derive(Clone)]
pub struct AgentServiceImpl {
    agent_manager: Arc<RwLock<AgentManager>>,
    #[allow(dead_code)] // Context store for future agent context management
    context_store: Arc<ContextStore>,
}

impl AgentServiceImpl {
    pub fn new(
        agent_manager: Arc<RwLock<AgentManager>>,
        context_store: Arc<ContextStore>,
    ) -> Self {
        Self {
            agent_manager,
            context_store,
        }
    }

    fn current_timestamp() -> Option<Timestamp> {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap();
        Some(Timestamp {
            seconds: now.as_secs() as i64,
            nanos: now.subsec_nanos() as i32,
        })
    }
}

#[tonic::async_trait]
impl AgentService for AgentServiceImpl {
    // Session Management
    async fn create_session(
        &self,
        request: tonic::Request<CreateSessionRequest>,
    ) -> Result<tonic::Response<CreateSessionResponse>, tonic::Status> {
        let req = request.into_inner();
        info!("Creating session for user: {}", req.user_id);

        let session_id = Uuid::new_v4().to_string();
        let now = Self::current_timestamp();
        
        // Store session information in context store for later retrieval
        if let Err(e) = self.context_store.store_session_info(
            &session_id,
            &req.user_id,
            req.context.clone(),
        ).await {
            tracing::warn!("Failed to store session context: {}", e);
        }
        
        // Initialize session in agent manager
        {
            let mut agent_manager = self.agent_manager.write().await;
            if let Err(e) = agent_manager.initialize_session(&session_id, &req.user_id).await {
                tracing::warn!("Failed to initialize session in agent manager: {}", e);
            }
        }
        
        let available_agent_types = vec![
            AgentType {
                type_id: "aws".to_string(),
                display_name: "AWS Cloud Agent".to_string(),
                description: "Manages AWS resources and operations".to_string(),
                version: "1.0.0".to_string(),
                capabilities: vec![],
                default_config: std::collections::HashMap::new(),
            },
            AgentType {
                type_id: "azure".to_string(),
                display_name: "Azure Cloud Agent".to_string(),
                description: "Manages Azure resources and operations".to_string(),
                version: "1.0.0".to_string(),
                capabilities: vec![],
                default_config: std::collections::HashMap::new(),
            },
            AgentType {
                type_id: "gcp".to_string(),
                display_name: "Google Cloud Agent".to_string(),
                description: "Manages GCP resources and operations".to_string(),
                version: "1.0.0".to_string(),
                capabilities: vec![],
                default_config: std::collections::HashMap::new(),
            },
        ];
        
        let session = Session {
            session_id: session_id.clone(),
            user_id: req.user_id.clone(),
            state: 1, // SESSION_STATE_ACTIVE
            created_at: now.clone(),
            updated_at: now.clone(),
            expires_at: {
                let expire_time = std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_secs() + 86400; // 24 hours
                Some(Timestamp {
                    seconds: expire_time as i64,
                    nanos: 0,
                })
            },
            metadata: HashMap::new(),
            config: None,
        };

        let response = CreateSessionResponse {
            session: Some(session),
            available_agent_types,
        };

        info!("✅ Session created successfully: {} for user: {}", session_id, req.user_id);
        Ok(tonic::Response::new(response))
    }

    async fn get_session(
        &self,
        request: tonic::Request<GetSessionRequest>,
    ) -> Result<tonic::Response<GetSessionResponse>, tonic::Status> {
        let req = request.into_inner();
        info!("Getting session: {}", req.session_id);

        // Placeholder implementation
        let response = GetSessionResponse {
            session: None,
            active_agents: vec![],
        };

        Ok(tonic::Response::new(response))
    }

    async fn delete_session(
        &self,
        request: tonic::Request<DeleteSessionRequest>,
    ) -> Result<tonic::Response<()>, tonic::Status> {
        let req = request.into_inner();
        info!("Deleting session: {}", req.session_id);

        Ok(tonic::Response::new(()))
    }

    // Agent Lifecycle
    async fn create_agent(
        &self,
        request: tonic::Request<CreateAgentRequest>,
    ) -> Result<tonic::Response<CreateAgentResponse>, tonic::Status> {
        let req = request.into_inner();
        info!("🤖 Creating real agent of type: {} for session: {}", req.agent_type, req.session_id);

        // Real implementation using AgentManager
        let mut agent_manager = self.agent_manager.write().await;
        
        // Convert AgentConfig to HashMap<String, String> format expected by AgentManager
        let config_map = if let Some(ref agent_config) = req.config {
            agent_config.parameters.clone()
        } else {
            HashMap::new()
        };
        
        match agent_manager.spawn_agent(
            &req.session_id,
            &req.agent_type,
            config_map,
        ).await {
            Ok(agent_id) => {
                let now = Self::current_timestamp();
                
                // Get agent status to populate capabilities
                let (_status, _metrics, _capabilities) = agent_manager
                    .get_agent_status(&req.session_id, &agent_id)
                    .await
                    .map_err(|e| tonic::Status::internal(format!("Failed to get agent status: {}", e)))?;
                
                let agent = Agent {
                    agent_id: agent_id.clone(),
                    session_id: req.session_id,
                    agent_type: req.agent_type.clone(),
                    state: 2, // AGENT_STATE_READY
                    created_at: now.clone(),
                    updated_at: now,
                    config: req.config,
                    metadata: req.context,
                    parent_agent_id: String::new(),
                };
                
                // Convert AgentCapabilities to protobuf capabilities
                let proto_capabilities = vec![
                    Capability {
                        capability_id: format!("{}_agent", req.agent_type),
                        name: format!("{}_agent", req.agent_type),
                        description: format!("Real {} agent with live integration", req.agent_type),
                        parameters: vec![], // Vec<Parameter> not HashMap
                    }
                ];

                let response = CreateAgentResponse {
                    agent: Some(agent),
                    capabilities: proto_capabilities,
                };
                
                info!("✅ Real agent created successfully: {} ({})", agent_id, req.agent_type);
                Ok(tonic::Response::new(response))
            }
            Err(e) => {
                let error_msg = format!("Failed to create agent: {}", e);
                tracing::error!("{}", error_msg);
                Err(tonic::Status::internal(error_msg))
            }
        }
    }

    async fn get_agent(
        &self,
        request: tonic::Request<GetAgentRequest>,
    ) -> Result<tonic::Response<GetAgentResponse>, tonic::Status> {
        let req = request.into_inner();
        info!("📊 Getting agent: {} for session: {}", req.agent_id, req.session_id);

        let agent_manager = self.agent_manager.read().await;
        
        match agent_manager.get_agent_details(&req.session_id, &req.agent_id).await {
            Ok((agent_info, metrics)) => {
                let now = Self::current_timestamp();
                
                let agent = Agent {
                    agent_id: req.agent_id.clone(),
                    session_id: req.session_id.clone(),
                    agent_type: agent_info.agent_type,
                    state: 2, // AGENT_STATE_READY
                    created_at: now.clone(),
                    updated_at: now.clone(),
                    config: None, // TODO: Store and return actual config
                    metadata: std::collections::HashMap::new(),
                    parent_agent_id: agent_info.parent_agent_id.unwrap_or_default(),
                };
                
                let agent_metrics = AgentMetrics {
                    messages_processed: metrics.messages_processed,
                    operations_completed: metrics.operations_completed,
                    errors_encountered: metrics.errors_encountered,
                    average_response_time_ms: metrics.average_response_time_ms,
                    last_reset: now.clone(),
                    custom_metrics: std::collections::HashMap::new(), // TODO: Convert string metrics to f64
                };
                
                let response = GetAgentResponse {
                    agent: Some(agent),
                    metrics: Some(agent_metrics),
                };
                
                info!("✅ Agent details retrieved for: {}", req.agent_id);
                Ok(tonic::Response::new(response))
            }
            Err(e) => {
                let error_msg = format!("Failed to get agent {}: {}", req.agent_id, e);
                tracing::error!("{}", error_msg);
                Err(tonic::Status::not_found(error_msg))
            }
        }
    }

    async fn list_agents(
        &self,
        request: tonic::Request<ListAgentsRequest>,
    ) -> Result<tonic::Response<ListAgentsResponse>, tonic::Status> {
        let req = request.into_inner();
        info!("📋 Listing agents for session: {} (page_size: {})", req.session_id, req.page_size);

        let agent_manager = self.agent_manager.read().await;
        
        match agent_manager.list_session_agents(&req.session_id).await {
            Ok(agent_list) => {
                let now = Self::current_timestamp();
                
                // Convert internal agent info to protobuf agents
                let agents: Vec<Agent> = agent_list.into_iter().map(|agent_info| {
                    Agent {
                        agent_id: agent_info.agent_id,
                        session_id: req.session_id.clone(),
                        agent_type: agent_info.agent_type,
                        state: 2, // AGENT_STATE_READY
                        created_at: now.clone(),
                        updated_at: now.clone(),
                        config: None,
                        metadata: std::collections::HashMap::new(),
                        parent_agent_id: agent_info.parent_agent_id.unwrap_or_default(),
                    }
                }).collect();
                
                let total_size = agents.len() as i32;
                
                // Apply pagination if requested
                let paginated_agents = if req.page_size > 0 {
                    let page_size = req.page_size as usize;
                    agents.into_iter().take(page_size).collect()
                } else {
                    agents
                };
                
                let response = ListAgentsResponse {
                    agents: paginated_agents,
                    next_page_token: String::new(), // TODO: Implement pagination tokens
                    total_size,
                };
                
                info!("✅ Listed {} agents for session: {}", total_size, req.session_id);
                Ok(tonic::Response::new(response))
            }
            Err(e) => {
                let error_msg = format!("Failed to list agents for session {}: {}", req.session_id, e);
                tracing::error!("{}", error_msg);
                Err(tonic::Status::internal(error_msg))
            }
        }
    }

    async fn update_agent(
        &self,
        request: tonic::Request<UpdateAgentRequest>,
    ) -> Result<tonic::Response<UpdateAgentResponse>, tonic::Status> {
        let req = request.into_inner();
        info!("Updating agent: {}", req.agent_id);

        let response = UpdateAgentResponse {
            agent: req.agent,
        };

        Ok(tonic::Response::new(response))
    }

    async fn delete_agent(
        &self,
        request: tonic::Request<DeleteAgentRequest>,
    ) -> Result<tonic::Response<()>, tonic::Status> {
        let req = request.into_inner();
        info!("Deleting agent: {}", req.agent_id);

        Ok(tonic::Response::new(()))
    }

    // Agent Interaction - Real Implementation
    async fn send_message(
        &self,
        request: tonic::Request<SendMessageRequest>,
    ) -> Result<tonic::Response<SendMessageResponse>, tonic::Status> {
        let req = request.into_inner();
        info!("💬 Real message to agent {}: {}", req.agent_id, req.message.as_ref().map(|m| &m.content).unwrap_or(&"<no content>".to_string()));

        let agent_manager = self.agent_manager.read().await;
        
        if let Some(message) = req.message {
            // Extract session ID from request or derive from agent context
            let session_id = req.session_id;
            
            // Convert metadata to HashMap for agent processing
            let context = message.metadata;
            
            // Send message to real agent through AgentManager
            match agent_manager.send_message(
                &session_id,
                &req.agent_id,
                &message.content,
                context.clone(),
            ).await {
                Ok((message_id, response_content, suggestions)) => {
                    let response_message = Message {
                        message_id: Uuid::new_v4().to_string(),
                        r#type: 4, // MESSAGE_TYPE_RESPONSE
                        content: response_content,
                        metadata: context,
                        timestamp: Self::current_timestamp(),
                        attachments: vec![],
                    };
                    
                    // Convert agent suggestions to protobuf suggestions
                    let proto_suggestions: Vec<Suggestion> = suggestions.into_iter().map(|s| {
                        Suggestion {
                            suggestion_id: s.suggestion_id,
                            title: s.title,
                            description: s.description,
                            r#type: s.r#type, // Use r#type field name
                            action: s.action.map(|a| Action {
                                action_type: a.action_type,
                                parameters: a.parameters,
                                command: a.command,
                                required_permissions: a.required_permissions,
                            }),
                            confidence: s.confidence,
                            metadata: s.metadata,
                            priority: s.priority,
                        }
                    }).collect();

                    let suggestion_count = proto_suggestions.len();
                    let response = SendMessageResponse {
                        message_id,
                        response: Some(response_message),
                        suggestions: proto_suggestions,
                        metrics: None, // TODO: Add performance metrics
                    };
                    info!("✅ Real agent response generated with {} suggestions", suggestion_count);
                    Ok(tonic::Response::new(response))
                }
                Err(e) => {
                    let error_msg = format!("Agent message processing failed: {}", e);
                    tracing::error!("{}", error_msg);
                    Err(tonic::Status::internal(error_msg))
                }
            }
        } else {
            Err(tonic::Status::invalid_argument("Message content is required"))
        }
    }

    async fn get_suggestions(
        &self,
        request: tonic::Request<GetSuggestionsRequest>,
    ) -> Result<tonic::Response<GetSuggestionsResponse>, tonic::Status> {
        let req = request.into_inner();
        info!("Getting suggestions for agent: {}", req.agent_id);

        let response = GetSuggestionsResponse {
            suggestions: vec![],
            context_id: String::new(),
        };

        Ok(tonic::Response::new(response))
    }

    // Health and Monitoring
    async fn get_agent_status(
        &self,
        request: tonic::Request<GetAgentStatusRequest>,
    ) -> Result<tonic::Response<GetAgentStatusResponse>, tonic::Status> {
        let req = request.into_inner();
        info!("🔍 Getting status for agent: {} in session: {}", req.agent_id, req.session_id);

        let agent_manager = self.agent_manager.read().await;
        
        match agent_manager.get_agent_status(&req.session_id, &req.agent_id).await {
            Ok((status_str, metrics, capabilities)) => {
                let now = Self::current_timestamp();
                
                // Create agent status
                let agent_status = AgentStatus {
                    state: 2, // AGENT_STATE_READY
                    status_message: status_str.clone(),
                    last_activity: now.clone(),
                    active_operations: 0, // TODO: Track active operations
                    status_details: metrics.clone(),
                };
                
                // Create agent metrics
                let agent_metrics = AgentMetrics {
                    messages_processed: metrics.get("messages_processed")
                        .and_then(|v| v.parse::<i64>().ok()).unwrap_or(0),
                    operations_completed: metrics.get("operations_completed")
                        .and_then(|v| v.parse::<i64>().ok()).unwrap_or(0),
                    errors_encountered: metrics.get("errors_encountered")
                        .and_then(|v| v.parse::<i64>().ok()).unwrap_or(0),
                    average_response_time_ms: metrics.get("avg_response_time_ms")
                        .and_then(|v| v.parse::<f64>().ok()).unwrap_or(0.0),
                    last_reset: now.clone(),
                    custom_metrics: std::collections::HashMap::new(),
                };
                
                // Convert capabilities to protobuf format
                let active_capabilities: Vec<Capability> = capabilities.into_iter().map(|cap| {
                    Capability {
                        capability_id: cap.clone(),
                        name: cap.clone(),
                        description: format!("Agent capability: {}", cap),
                        parameters: vec![], // TODO: Add actual capability parameters
                    }
                }).collect();
                
                // Determine health status based on agent state
                let health_status = if status_str == "ready" || status_str == "active" {
                    "healthy"
                } else if status_str == "error" {
                    "unhealthy"
                } else {
                    "unknown"
                }.to_string();
                
                let response = GetAgentStatusResponse {
                    status: Some(agent_status),
                    metrics: Some(agent_metrics),
                    active_capabilities,
                    health_status,
                };
                
                info!("✅ Agent status retrieved: {} - {}", req.agent_id, status_str);
                Ok(tonic::Response::new(response))
            }
            Err(e) => {
                let error_msg = format!("Failed to get status for agent {}: {}", req.agent_id, e);
                tracing::error!("{}", error_msg);
                Err(tonic::Status::not_found(error_msg))
            }
        }
    }

    async fn get_system_health(
        &self,
        request: tonic::Request<GetSystemHealthRequest>,
    ) -> Result<tonic::Response<GetSystemHealthResponse>, tonic::Status> {
        let _req = request.into_inner();
        info!("Getting system health");

        let response = GetSystemHealthResponse {
            health: None,
            metrics: None,
        };

        Ok(tonic::Response::new(response))
    }
}
