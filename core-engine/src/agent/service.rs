use std::sync::Arc;
use tokio::sync::RwLock;
use tonic::{Request, Response, Status};

use crate::agent::manager::AgentManager;
use crate::agent::context::ContextStore;
use crate::proto::sirsi::agent::v1::agent_service_server::AgentService as AgentServiceTrait;
use crate::proto::sirsi::agent::v1::*;

// Re-export FILE_DESCRIPTOR_SET from proto module
pub use crate::proto::sirsi::agent::v1::FILE_DESCRIPTOR_SET;

#[derive(Clone)]
pub struct AgentService {
    manager: Arc<RwLock<AgentManager>>,
    context_store: Arc<ContextStore>,
}

impl AgentService {
    pub fn new(manager: Arc<RwLock<AgentManager>>, context_store: Arc<ContextStore>) -> Self {
        Self { manager, context_store }
    }
}

#[tonic::async_trait]
impl AgentServiceTrait for AgentService {
    async fn create_session(
        &self,
        request: Request<CreateSessionRequest>,
    ) -> Result<Response<CreateSessionResponse>, Status> {
        let _req = request.into_inner();

        let context = self.context_store
            .create_session_context(&_req.user_id, _req.context)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let session_id = context.session_id.clone();
        Ok(Response::new(CreateSessionResponse {
            session: Some(Session {
                session_id,
                user_id: _req.user_id,
                state: SessionState::Active.into(),
                created_at: Some(prost_types::Timestamp::from(std::time::SystemTime::now())),
                updated_at: Some(prost_types::Timestamp::from(std::time::SystemTime::now())),
                expires_at: None,
                metadata: context.metadata,
                config: None, // TODO: Add session config handling
            }),
            available_agent_types: vec![] // Fetch this from some config or store
        }))
    }

    async fn create_agent(
        &self,
        request: Request<CreateAgentRequest>,
    ) -> Result<Response<CreateAgentResponse>, Status> {
        let req = request.into_inner();

        let _manager = self.manager.write().await;
        let agent_context = self.context_store
            .create_agent_context(&req.session_id, &req.agent_type, req.config.clone().unwrap().parameters)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let agent_id = agent_context.agent_id.clone();

        Ok(Response::new(CreateAgentResponse {
            agent: Some(Agent {
                agent_id,
                session_id: req.session_id,
                agent_type: req.agent_type.clone(),
                state: AgentState::Ready.into(),
                created_at: Some(prost_types::Timestamp::from(std::time::SystemTime::now())),
                updated_at: Some(prost_types::Timestamp::from(std::time::SystemTime::now())),
                config: Some(AgentConfig {
                    parameters: req.config.clone().unwrap().parameters,
                    timeout_seconds: 30, // Default or fetched from config
                    max_concurrent_operations: 1, // Default or configurable
                    enable_caching: true, // Default or configurable
                    required_capabilities: req.config.clone().unwrap().required_capabilities.clone(),
                }),
                metadata: Default::default(),
                parent_agent_id: String::new(), // Default, set if applicable
            }),
            capabilities: vec![] // Fetch from some config or store
        }))
    }

    async fn send_message(
        &self,
        request: Request<SendMessageRequest>,
    ) -> Result<Response<SendMessageResponse>, Status> {
        let req = request.into_inner();
        
        let manager = self.manager.read().await;
        let (response_id, response, suggestions) = manager
            .send_message(&req.session_id, &req.agent_id, &req.message.clone().unwrap().content, req.options.clone().unwrap().context)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        self.context_store
            .add_conversation_entry(&req.agent_id, &req.message.clone().unwrap().content, &response, vec![])
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(SendMessageResponse {
            message_id: response_id.clone(),
            response: Some(Message {
                message_id: response_id.clone(),
                r#type: MessageType::Response.into(),
                content: response,
                metadata: Default::default(),
                timestamp: Some(prost_types::Timestamp::from(std::time::SystemTime::now())),
                attachments: vec![],
            }),
            suggestions,
            metrics: Some(MessageMetrics {
                processing_time_ms: 0.0, // TODO: Implement actual tracking
                tokens_processed: 0, // TODO: Implement actual tracking
                model_used: String::from("sirsi-nexus"), // TODO: Use actual model
                performance_metrics: Default::default(),
            }),
        }))
    }

    async fn get_suggestions(
        &self,
        request: Request<GetSuggestionsRequest>,
    ) -> Result<Response<GetSuggestionsResponse>, Status> {
        let req = request.into_inner();
        
        let context_type = req.context.clone().unwrap().context_type;
        let context_map = req.context.clone().unwrap().context_data;
        
        let manager = self.manager.read().await;
        let suggestions = manager
            .get_suggestions(&req.session_id, &req.agent_id, &context_type, context_map)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(GetSuggestionsResponse {
            suggestions,
            context_id: String::new(), // TODO: Implement context ID tracking
        }))
    }

    async fn get_agent_status(
        &self,
        request: Request<GetAgentStatusRequest>,
    ) -> Result<Response<GetAgentStatusResponse>, Status> {
        let req = request.into_inner();

        let _manager = self.manager.read().await;
        let agent_context = self.context_store
            .get_agent_context(&req.agent_id)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let metrics = agent_context.metadata.clone();

        Ok(Response::new(GetAgentStatusResponse {
            status: Some(AgentStatus {
                state: AgentState::Ready.into(), // Replace with actual state conversion
                status_message: String::from("Agent is operational."), // Replace with actual messages
                last_activity: Some(prost_types::Timestamp::from(std::time::SystemTime::now())),
                active_operations: 0, // Replace with actual value if needed
                status_details: Default::default(), // Fill in if applicable
            }),
            metrics: Some(AgentMetrics {
                messages_processed: 0, // Actual processed count
                operations_completed: 0, // Actual completed operations
                errors_encountered: 0, // Actual error count
                average_response_time_ms: 0.0, // Actual average response time
                last_reset: Some(prost_types::Timestamp::from(std::time::SystemTime::now())),
                custom_metrics: Default::default(), // Add actual custom metrics if applicable
            }),
            active_capabilities: vec![], // Fetch these as needed
            health_status: String::from("Healthy"), // Replace with actual health status
        }))
    }

    async fn get_session(
        &self,
        request: Request<GetSessionRequest>,
    ) -> Result<Response<GetSessionResponse>, Status> {
        let req = request.into_inner();
        
        let session_context = self.context_store
            .get_session_context(&req.session_id)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(GetSessionResponse {
            session: Some(Session {
                session_id: req.session_id,
                user_id: session_context.user_id,
                state: SessionState::Active.into(),
                created_at: Some(prost_types::Timestamp::from(std::time::SystemTime::now())),
                updated_at: Some(prost_types::Timestamp::from(std::time::SystemTime::now())),
                expires_at: None,
                metadata: session_context.metadata,
                config: None, // TODO: Add session config handling
            }),
            active_agents: vec![], // TODO: Fetch active agents from manager
        }))
    }

    async fn delete_session(
        &self,
        request: Request<DeleteSessionRequest>,
    ) -> Result<Response<()>, Status> {
        let req = request.into_inner();
        
        // TODO: Implement session cleanup in manager
        
        Ok(Response::new(()))
    }

    async fn get_agent(
        &self,
        request: Request<GetAgentRequest>,
    ) -> Result<Response<GetAgentResponse>, Status> {
        let req = request.into_inner();
        
        let agent_context = self.context_store
            .get_agent_context(&req.agent_id)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(GetAgentResponse {
            agent: Some(Agent {
                agent_id: req.agent_id,
                session_id: req.session_id,
                agent_type: agent_context.agent_type,
                state: AgentState::Ready.into(),
                created_at: Some(prost_types::Timestamp::from(std::time::SystemTime::now())),
                updated_at: Some(prost_types::Timestamp::from(std::time::SystemTime::now())),
config: Some(AgentConfig {
                    parameters: agent_context.metadata,
                    timeout_seconds: 30,
                    max_concurrent_operations: 1,
                    enable_caching: true,
                    required_capabilities: vec![],
                }),
                metadata: Default::default(),
                parent_agent_id: String::new(),
            }),
            metrics: Some(AgentMetrics {
                messages_processed: 0,
                operations_completed: 0,
                errors_encountered: 0,
                average_response_time_ms: 0.0,
                last_reset: Some(prost_types::Timestamp::from(std::time::SystemTime::now())),
                custom_metrics: Default::default(),
            }),
        }))
    }

    async fn list_agents(
        &self,
        request: Request<ListAgentsRequest>,
    ) -> Result<Response<ListAgentsResponse>, Status> {
        let req = request.into_inner();
        
        // TODO: Implement agent listing from manager
        
        Ok(Response::new(ListAgentsResponse {
            agents: vec![], // TODO: Fetch agents from manager
            next_page_token: String::new(),
            total_size: 0,
        }))
    }

    async fn update_agent(
        &self,
        request: Request<UpdateAgentRequest>,
    ) -> Result<Response<UpdateAgentResponse>, Status> {
        let req = request.into_inner();
        
        // TODO: Implement agent updating in manager
        
        Ok(Response::new(UpdateAgentResponse {
            agent: req.agent,
        }))
    }

    async fn delete_agent(
        &self,
        request: Request<DeleteAgentRequest>,
    ) -> Result<Response<()>, Status> {
        let req = request.into_inner();
        
        // TODO: Implement agent deletion in manager
        
        Ok(Response::new(()))
    }

    async fn get_system_health(
        &self,
        request: Request<GetSystemHealthRequest>,
    ) -> Result<Response<GetSystemHealthResponse>, Status> {
        let _req = request.into_inner();
        
        // TODO: Implement system health checking
        
        Ok(Response::new(GetSystemHealthResponse {
            health: Some(SystemHealth {
                overall_status: HealthStatus::Healthy.into(),
                components: Default::default(),
                last_check: Some(prost_types::Timestamp::from(std::time::SystemTime::now())),
            }),
            metrics: Some(SystemMetrics {
                active_sessions: 0,
                total_agents: 0,
                cpu_usage_percent: 0.0,
                memory_usage_percent: 0.0,
                uptime_seconds: 0,
                custom_metrics: Default::default(),
            }),
        }))
    }
}

// TODO: Re-enable tests after fixing proto integration issues
// #[cfg(test)]
// mod tests {
//     use super::*;
//     use std::collections::HashMap;
// 
//     #[tokio::test]
//     async fn test_start_session() {
//         let manager = Arc::new(RwLock::new(AgentManager::new()));
//         let service = AgentService::new(manager);
// 
//         let request = Request::new(StartSessionRequest {
//             user_id: "test-user".to_string(),
//             context: HashMap::new(),
//         });
// 
//         let response = service.start_session(request).await.unwrap();
//         let response = response.into_inner();
// 
//         assert!(!response.session_id.is_empty());
//         assert!(!response.available_agents.is_empty());
//     }
// 
//     #[tokio::test]
//     async fn test_spawn_sub_agent() {
//         let manager = Arc::new(RwLock::new(AgentManager::new()));
//         let service = AgentService::new(manager);
// 
//         let request = Request::new(SpawnSubAgentRequest {
//             session_id: Uuid::new_v4().to_string(),
//             agent_type: "test".to_string(),
//             config: HashMap::new(),
//         });
// 
//         let response = service.spawn_sub_agent(request).await.unwrap();
//         let response = response.into_inner();
// 
//         assert!(!response.agent_id.is_empty());
//         assert_eq!(response.status, "running");
//     }
// }
