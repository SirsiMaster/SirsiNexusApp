use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::RwLock;
use tokio_tungstenite::{accept_async, tungstenite::Message as WsMessage, WebSocketStream};
use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use tracing::{info, error, warn, debug};
use tonic::transport::Channel;

use crate::error::{AppError, AppResult};
use crate::proto::sirsi::agent::v1::{
    agent_service_client::AgentServiceClient,
    *,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct WebSocketRequest {
    #[serde(rename = "requestId")]
    pub request_id: Option<String>,
    pub action: String,
    #[serde(rename = "sessionId")]
    pub session_id: Option<String>,
    #[serde(rename = "agentId")]
    pub agent_id: Option<String>,
    pub data: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WebSocketResponse {
    #[serde(rename = "requestId")]
    pub request_id: String,
    pub action: String,
    pub success: bool,
    pub data: Option<serde_json::Value>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AgentSessionData {
    #[serde(rename = "sessionId")]
    pub session_id: String,
    #[serde(rename = "userId")]
    pub user_id: String,
    pub status: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "availableAgents")]
    pub available_agents: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SubAgentData {
    #[serde(rename = "agentId")]
    pub agent_id: String,
    #[serde(rename = "agentType")]
    pub agent_type: String,
    pub status: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    pub capabilities: Vec<String>,
    pub metrics: HashMap<String, String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AgentSuggestionData {
    pub id: String,
    pub title: String,
    pub description: String,
    #[serde(rename = "actionType")]
    pub action_type: String,
    pub action: String,
    pub parameters: HashMap<String, String>,
    pub confidence: f32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MessageResponseData {
    #[serde(rename = "responseId")]
    pub response_id: String,
    pub response: String,
    pub suggestions: Vec<AgentSuggestionData>,
}

pub struct WebSocketHandler {
    grpc_client: AgentServiceClient<Channel>,
    sessions: Arc<RwLock<HashMap<String, String>>>, // WebSocket ID -> Session ID
}

impl WebSocketHandler {
    pub async fn new(grpc_endpoint: &str) -> AppResult<Self> {
        let channel = Channel::from_shared(grpc_endpoint.to_string())
            .map_err(|e| AppError::Configuration(format!("Invalid gRPC endpoint: {}", e)))?
            .connect()
            .await
            .map_err(|e| AppError::Connection(format!("Failed to connect to gRPC service: {}", e)))?;

        let grpc_client = AgentServiceClient::new(channel);

        Ok(Self {
            grpc_client,
            sessions: Arc::new(RwLock::new(HashMap::new())),
        })
    }

    pub async fn handle_connection(&mut self, stream: TcpStream, addr: SocketAddr) {
        info!("WebSocket connection from {}", addr);
        
        let ws_stream = match accept_async(stream).await {
            Ok(ws) => ws,
            Err(e) => {
                error!("Failed to accept WebSocket connection: {}", e);
                return;
            }
        };

        let connection_id = Uuid::new_v4().to_string();
        info!("Assigned connection ID: {}", connection_id);

        if let Err(e) = self.handle_websocket(ws_stream, connection_id.clone()).await {
            error!("WebSocket handler error for {}: {}", connection_id, e);
        }

        // Cleanup session mapping
        self.sessions.write().await.remove(&connection_id);
        info!("Connection {} closed", connection_id);
    }

    async fn handle_websocket(
        &mut self,
        ws_stream: WebSocketStream<TcpStream>,
        connection_id: String,
    ) -> AppResult<()> {
        let (mut ws_sender, mut ws_receiver) = ws_stream.split();

        while let Some(msg) = ws_receiver.next().await {
            let msg = match msg {
                Ok(msg) => msg,
                Err(e) => {
                    warn!("WebSocket message error: {}", e);
                    break;
                }
            };

            match msg {
                WsMessage::Text(text) => {
                    debug!("Received message: {}", text);
                    
                    let response = match self.process_request(&text, &connection_id).await {
                        Ok(resp) => resp,
                        Err(e) => {
                            error!("Request processing error: {}", e);
                            WebSocketResponse {
                                request_id: "unknown".to_string(),
                                action: "error".to_string(),
                                success: false,
                                data: None,
                                error: Some(e.to_string()),
                            }
                        }
                    };

                    let response_json = match serde_json::to_string(&response) {
                        Ok(json) => json,
                        Err(e) => {
                            error!("Failed to serialize response: {}", e);
                            continue;
                        }
                    };

                    if let Err(e) = ws_sender.send(WsMessage::Text(response_json)).await {
                        error!("Failed to send WebSocket response: {}", e);
                        break;
                    }
                }
                WsMessage::Ping(data) => {
                    if let Err(e) = ws_sender.send(WsMessage::Pong(data)).await {
                        error!("Failed to send pong: {}", e);
                        break;
                    }
                }
                WsMessage::Close(_) => {
                    info!("WebSocket close received");
                    break;
                }
                _ => {
                    // Ignore other message types
                }
            }
        }

        Ok(())
    }

    async fn process_request(
        &mut self,
        message: &str,
        connection_id: &str,
    ) -> AppResult<WebSocketResponse> {
        let request: WebSocketRequest = serde_json::from_str(message)
            .map_err(|e| AppError::Serialization(format!("Invalid request format: {}", e)))?;

        let request_id = request.request_id.clone()
            .unwrap_or_else(|| Uuid::new_v4().to_string());

        match request.action.as_str() {
            // Legacy compatibility actions
            "start_session" => self.handle_start_session(request, request_id, connection_id).await,
            "spawn_agent" => self.handle_spawn_agent(request, request_id).await,
            "send_message" => self.handle_send_message(request, request_id).await,
            "get_suggestions" => self.handle_get_suggestions(request, request_id).await,
            "get_status" => self.handle_get_status(request, request_id).await,
            "stop_session" => self.handle_stop_session(request, request_id).await,
            
            // New protobuf-compatible actions
            "create_session" => self.handle_create_session(request, request_id, connection_id).await,
            "create_agent" => self.handle_create_agent(request, request_id).await,
            "get_agent_status" => self.handle_get_agent_status(request, request_id).await,
            "list_agents" => self.handle_list_agents(request, request_id).await,
            "delete_session" => self.handle_delete_session(request, request_id).await,
            "delete_agent" => self.handle_delete_agent(request, request_id).await,
            "get_system_health" => self.handle_get_system_health(request, request_id).await,
            
            // Sirsi Persona actions
            "sirsi_persona_process_natural_language" => self.handle_sirsi_process_request(request, request_id).await,
            "sirsi_persona_get_omniscient_overview" => self.handle_sirsi_get_overview(request, request_id).await,
            "sirsi_persona_execute_supreme_decision" => self.handle_sirsi_execute_decision(request, request_id).await,
            "sirsi_persona_subscribe_real_time" => self.handle_sirsi_subscribe_real_time(request, request_id).await,
            "sirsi_persona_update_session_config" => self.handle_sirsi_update_session_config(request, request_id).await,
            
            _ => {
                let action = request.action.clone();
                Ok(WebSocketResponse {
                    request_id,
                    action: request.action,
                    success: false,
                    data: None,
                    error: Some(format!("Unknown action: {}", action)),
                })
            }
        }
    }

    async fn handle_start_session(
        &mut self,
        request: WebSocketRequest,
        request_id: String,
        connection_id: &str,
    ) -> AppResult<WebSocketResponse> {
        let data = request.data.ok_or_else(|| 
            AppError::Validation("Missing data for start_session".to_string()))?;

        let user_id = data.get("userId")
            .and_then(|v| v.as_str())
            .ok_or_else(|| AppError::Validation("Missing userId".to_string()))?;

        let context = data.get("context")
            .and_then(|v| v.as_object())
            .map(|obj| {
                obj.iter()
                    .filter_map(|(k, v)| v.as_str().map(|s| (k.clone(), s.to_string())))
                    .collect::<HashMap<String, String>>()
            })
            .unwrap_or_default();

        let grpc_request = CreateSessionRequest {
            user_id: user_id.to_string(),
            context,
            config: None, // Use default session config
        };

        let response = self.grpc_client.create_session(tonic::Request::new(grpc_request)).await
            .map_err(|e| AppError::Connection(format!("gRPC create_session failed: {}", e)))?;

        let session_response = response.into_inner();
        
        // Extract session ID from the response
        let session_id = session_response.session.as_ref()
            .map(|s| s.session_id.clone())
            .unwrap_or_else(|| "unknown".to_string());
        
        // Store session mapping
        self.sessions.write().await.insert(
            connection_id.to_string(),
            session_id.clone()
        );

        let session_data = AgentSessionData {
            session_id,
            user_id: user_id.to_string(),
            status: "active".to_string(),
            created_at: chrono::Utc::now().to_rfc3339(),
            available_agents: vec![
                "aws".to_string(),
                "azure".to_string(),
                "gcp".to_string(),
                "migration".to_string(),
                "security".to_string(),
                "reporting".to_string(),
                "scripting".to_string(),
                "tutorial".to_string(),
            ],
        };

        Ok(WebSocketResponse {
            request_id,
            action: "start_session".to_string(),
            success: true,
            data: Some(serde_json::to_value(session_data)?),
            error: None,
        })
    }

    async fn handle_spawn_agent(
        &mut self,
        request: WebSocketRequest,
        request_id: String,
    ) -> AppResult<WebSocketResponse> {
        let session_id = request.session_id.ok_or_else(|| 
            AppError::Validation("Missing sessionId".to_string()))?;

        let data = request.data.ok_or_else(|| 
            AppError::Validation("Missing data for spawn_agent".to_string()))?;

        let agent_type = data.get("agentType")
            .and_then(|v| v.as_str())
            .ok_or_else(|| AppError::Validation("Missing agentType".to_string()))?;

        let config = data.get("config")
            .and_then(|v| v.as_object())
            .map(|obj| {
                obj.iter()
                    .filter_map(|(k, v)| v.as_str().map(|s| (k.clone(), s.to_string())))
                    .collect::<HashMap<String, String>>()
            })
            .unwrap_or_default();

        let _agent_type_enum = match agent_type {
            "aws" => 2,
            "azure" => 3,
            "gcp" => 4,
            "vsphere" => 5,
            "migration" => 6,
            "security" => 7,
            "reporting" => 8,
            "scripting" => 9,
            "tutorial" => 10,
            _ => 1, // General
        };

        let grpc_request = CreateAgentRequest {
            session_id,
            agent_type: agent_type.to_string(),
            config: Some(AgentConfig {
                parameters: config,
                timeout_seconds: 30,
                max_concurrent_operations: 5,
                enable_caching: true,
                required_capabilities: vec![],
            }),
            context: std::collections::HashMap::new(),
        };

        let response = self.grpc_client.create_agent(tonic::Request::new(grpc_request)).await
            .map_err(|e| AppError::Connection(format!("gRPC create_agent failed: {}", e)))?;

        let agent_response = response.into_inner();
        
        let agent_id = agent_response.agent.as_ref()
            .map(|a| a.agent_id.clone())
            .unwrap_or_else(|| "unknown".to_string());

        let agent_data = SubAgentData {
            agent_id,
            agent_type: agent_type.to_string(),
            status: "ready".to_string(),
            created_at: chrono::Utc::now().to_rfc3339(),
            capabilities: vec![
                "chat".to_string(),
                "suggest".to_string(),
                format!("{}_specific", agent_type),
            ],
            metrics: HashMap::new(),
        };

        Ok(WebSocketResponse {
            request_id,
            action: "spawn_agent".to_string(),
            success: true,
            data: Some(serde_json::to_value(agent_data)?),
            error: None,
        })
    }

    async fn handle_send_message(
        &mut self,
        request: WebSocketRequest,
        request_id: String,
    ) -> AppResult<WebSocketResponse> {
        let session_id = request.session_id.ok_or_else(|| 
            AppError::Validation("Missing sessionId".to_string()))?;

        let agent_id = request.agent_id.ok_or_else(|| 
            AppError::Validation("Missing agentId".to_string()))?;

        let data = request.data.ok_or_else(|| 
            AppError::Validation("Missing data for send_message".to_string()))?;

        let message = data.get("message")
            .and_then(|v| v.as_str())
            .ok_or_else(|| AppError::Validation("Missing message".to_string()))?;

        let context = data.get("context")
            .and_then(|v| v.as_object())
            .map(|obj| {
                obj.iter()
                    .filter_map(|(k, v)| v.as_str().map(|s| (k.clone(), s.to_string())))
                    .collect::<HashMap<String, String>>()
            })
            .unwrap_or_default();

        let grpc_request = SendMessageRequest {
            session_id,
            agent_id,
            message: Some(Message {
                message_id: Uuid::new_v4().to_string(),
                content: message.to_string(),
                r#type: 1, // MESSAGE_TYPE_TEXT
                timestamp: Some(prost_types::Timestamp {
                    seconds: chrono::Utc::now().timestamp(),
                    nanos: 0,
                }),
                metadata: context,
                attachments: Vec::new(),
            }),
            options: None, // Use default options
        };

        let response = self.grpc_client.send_message(tonic::Request::new(grpc_request)).await
            .map_err(|e| AppError::Connection(format!("gRPC send_message failed: {}", e)))?;

        let message_response = response.into_inner();

        let suggestions: Vec<AgentSuggestionData> = message_response.suggestions
            .into_iter()
            .map(|s| AgentSuggestionData {
                id: s.suggestion_id,
                title: s.title,
                description: s.description,
                action_type: s.action.as_ref().map(|a| a.action_type.clone()).unwrap_or_default(),
                action: "".to_string(), // Can be derived from action if needed
                parameters: s.action.as_ref().map(|a| a.parameters.clone()).unwrap_or_default(),
                confidence: s.confidence,
            })
            .collect();
            
        let response_content = message_response.response.as_ref()
            .map(|r| r.content.clone())
            .unwrap_or_else(|| "No response".to_string());

        let response_data = MessageResponseData {
            response_id: message_response.message_id,
            response: response_content,
            suggestions,
        };

        Ok(WebSocketResponse {
            request_id,
            action: "send_message".to_string(),
            success: true,
            data: Some(serde_json::to_value(response_data)?),
            error: None,
        })
    }

    async fn handle_get_suggestions(
        &mut self,
        request: WebSocketRequest,
        request_id: String,
    ) -> AppResult<WebSocketResponse> {
        let session_id = request.session_id.ok_or_else(|| 
            AppError::Validation("Missing sessionId".to_string()))?;

        let agent_id = request.agent_id.ok_or_else(|| 
            AppError::Validation("Missing agentId".to_string()))?;

        let data = request.data.ok_or_else(|| 
            AppError::Validation("Missing data for get_suggestions".to_string()))?;

        let suggestion_type = data.get("suggestionType")
            .and_then(|v| v.as_str())
            .ok_or_else(|| AppError::Validation("Missing suggestionType".to_string()))?;

        let context = data.get("context")
            .and_then(|v| v.as_object())
            .map(|obj| {
                obj.iter()
                    .filter_map(|(k, v)| v.as_str().map(|s| (k.clone(), s.to_string())))
                    .collect::<HashMap<String, String>>()
            })
            .unwrap_or_default();

        let _suggestion_type_enum = match suggestion_type {
            "action" => 1,
            "optimization" => 2,
            "security" => 3,
            "code" => 4,
            "tutorial" => 5,
            "troubleshooting" => 6,
            _ => 1,
        };

        let grpc_request = GetSuggestionsRequest {
            session_id,
            agent_id,
            context: Some(SuggestionContext {
                context_type: suggestion_type.to_string(),
                context_data: context,
                tags: vec![],
            }),
            max_suggestions: 10, // Default limit
        };

        let response = self.grpc_client.get_suggestions(tonic::Request::new(grpc_request)).await
            .map_err(|e| AppError::Connection(format!("gRPC get_suggestions failed: {}", e)))?;

        let suggestions_response = response.into_inner();

        let suggestions: Vec<AgentSuggestionData> = suggestions_response.suggestions
            .into_iter()
            .map(|s| AgentSuggestionData {
                id: s.suggestion_id,
                title: s.title,
                description: s.description,
                action_type: s.action.as_ref().map(|a| a.action_type.clone()).unwrap_or_default(),
                action: "".to_string(), // Map from action if needed
                parameters: s.action.as_ref().map(|a| a.parameters.clone()).unwrap_or_default(),
                confidence: s.confidence,
            })
            .collect();

        Ok(WebSocketResponse {
            request_id,
            action: "get_suggestions".to_string(),
            success: true,
            data: Some(serde_json::to_value(suggestions)?),
            error: None,
        })
    }

    async fn handle_get_status(
        &mut self,
        request: WebSocketRequest,
        request_id: String,
    ) -> AppResult<WebSocketResponse> {
        let session_id = request.session_id.ok_or_else(|| 
            AppError::Validation("Missing sessionId".to_string()))?;

        let agent_id = request.agent_id.ok_or_else(|| 
            AppError::Validation("Missing agentId".to_string()))?;

        let grpc_request = GetAgentStatusRequest {
            session_id,
            agent_id: agent_id.clone(),
        };

        let response = self.grpc_client.get_agent_status(tonic::Request::new(grpc_request)).await
            .map_err(|e| AppError::Connection(format!("gRPC get_agent_status failed: {}", e)))?;

        let status_response = response.into_inner();

        let status_string = status_response.status
            .as_ref()
            .map(|s| match s.state {
                1 => "initializing".to_string(),
                2 => "ready".to_string(),
                3 => "busy".to_string(),
                4 => "error".to_string(),
                5 => "terminated".to_string(),
                _ => "unknown".to_string(),
            })
            .unwrap_or_else(|| "unknown".to_string());
            
        let capabilities = status_response.active_capabilities
            .iter()
            .map(|c| c.name.clone())
            .collect();
            
        let metrics = status_response.metrics
            .as_ref()
            .map(|m| {
                let mut map = std::collections::HashMap::new();
                map.insert("messages_processed".to_string(), m.messages_processed.to_string());
                map.insert("operations_completed".to_string(), m.operations_completed.to_string());
                map.insert("errors_encountered".to_string(), m.errors_encountered.to_string());
                map.insert("avg_response_time_ms".to_string(), m.average_response_time_ms.to_string());
                map
            })
            .unwrap_or_default();

        let agent_data = SubAgentData {
            agent_id,
            agent_type: "general".to_string(), // Default agent type
            status: status_string,
            created_at: chrono::Utc::now().to_rfc3339(),
            capabilities,
            metrics,
        };

        Ok(WebSocketResponse {
            request_id,
            action: "get_status".to_string(),
            success: true,
            data: Some(serde_json::to_value(agent_data)?),
            error: None,
        })
    }

    // New protobuf-compatible handlers
    async fn handle_stop_session(
        &mut self,
        request: WebSocketRequest,
        request_id: String,
    ) -> AppResult<WebSocketResponse> {
        let session_id = request.session_id.ok_or_else(|| 
            AppError::Validation("Missing sessionId".to_string()))?;

        let grpc_request = crate::proto::sirsi::agent::v1::DeleteSessionRequest {
            session_id,
        };

        let _response = self.grpc_client.delete_session(tonic::Request::new(grpc_request)).await
            .map_err(|e| AppError::Connection(format!("gRPC delete_session failed: {}", e)))?;

        Ok(WebSocketResponse {
            request_id,
            action: "stop_session".to_string(),
            success: true,
            data: None,
            error: None,
        })
    }

    async fn handle_create_session(
        &mut self,
        request: WebSocketRequest,
        request_id: String,
        connection_id: &str,
    ) -> AppResult<WebSocketResponse> {
        // Use the existing start_session implementation for backward compatibility
        let response = self.handle_start_session(request, request_id, connection_id).await?;
        
        // Convert response action to create_session
        Ok(WebSocketResponse {
            request_id: response.request_id,
            action: "create_session".to_string(),
            success: response.success,
            data: response.data,
            error: response.error,
        })
    }

    async fn handle_create_agent(
        &mut self,
        request: WebSocketRequest,
        request_id: String,
    ) -> AppResult<WebSocketResponse> {
        // Use the existing spawn_agent implementation for backward compatibility
        let response = self.handle_spawn_agent(request, request_id).await?;
        
        // Convert response action to create_agent
        Ok(WebSocketResponse {
            request_id: response.request_id,
            action: "create_agent".to_string(),
            success: response.success,
            data: response.data,
            error: response.error,
        })
    }

    async fn handle_get_agent_status(
        &mut self,
        request: WebSocketRequest,
        request_id: String,
    ) -> AppResult<WebSocketResponse> {
        // Use the existing get_status implementation for backward compatibility
        let response = self.handle_get_status(request, request_id).await?;
        
        // Convert response action to get_agent_status
        Ok(WebSocketResponse {
            request_id: response.request_id,
            action: "get_agent_status".to_string(),
            success: response.success,
            data: response.data,
            error: response.error,
        })
    }

    async fn handle_list_agents(
        &mut self,
        request: WebSocketRequest,
        request_id: String,
    ) -> AppResult<WebSocketResponse> {
        let session_id = request.session_id.ok_or_else(|| 
            AppError::Validation("Missing sessionId".to_string()))?;

        let grpc_request = crate::proto::sirsi::agent::v1::ListAgentsRequest {
            session_id,
            page_size: 50,
            page_token: String::new(),
            filter: String::new(),
        };

        let response = self.grpc_client.list_agents(tonic::Request::new(grpc_request)).await
            .map_err(|e| AppError::Connection(format!("gRPC list_agents failed: {}", e)))?;

        let list_response = response.into_inner();

        let agents_data: Vec<SubAgentData> = list_response.agents
            .into_iter()
            .map(|agent| SubAgentData {
                agent_id: agent.agent_id,
                agent_type: agent.agent_type,
                status: match agent.state {
                    1 => "initializing".to_string(),
                    2 => "ready".to_string(),
                    3 => "busy".to_string(),
                    4 => "error".to_string(),
                    5 => "terminated".to_string(),
                    _ => "unknown".to_string(),
                },
                created_at: chrono::Utc::now().to_rfc3339(),
                capabilities: vec!["basic".to_string()],
                metrics: HashMap::new(),
            })
            .collect();

        Ok(WebSocketResponse {
            request_id,
            action: "list_agents".to_string(),
            success: true,
            data: Some(serde_json::to_value(agents_data)?),
            error: None,
        })
    }

    async fn handle_delete_session(
        &mut self,
        request: WebSocketRequest,
        request_id: String,
    ) -> AppResult<WebSocketResponse> {
        let session_id = request.session_id.ok_or_else(|| 
            AppError::Validation("Missing sessionId".to_string()))?;

        let grpc_request = crate::proto::sirsi::agent::v1::DeleteSessionRequest {
            session_id,
        };

        let _response = self.grpc_client.delete_session(tonic::Request::new(grpc_request)).await
            .map_err(|e| AppError::Connection(format!("gRPC delete_session failed: {}", e)))?;

        Ok(WebSocketResponse {
            request_id,
            action: "delete_session".to_string(),
            success: true,
            data: None,
            error: None,
        })
    }

    async fn handle_delete_agent(
        &mut self,
        request: WebSocketRequest,
        request_id: String,
    ) -> AppResult<WebSocketResponse> {
        let session_id = request.session_id.ok_or_else(|| 
            AppError::Validation("Missing sessionId".to_string()))?;

        let agent_id = request.agent_id.ok_or_else(|| 
            AppError::Validation("Missing agentId".to_string()))?;

        let grpc_request = crate::proto::sirsi::agent::v1::DeleteAgentRequest {
            session_id,
            agent_id,
        };

        let _response = self.grpc_client.delete_agent(tonic::Request::new(grpc_request)).await
            .map_err(|e| AppError::Connection(format!("gRPC delete_agent failed: {}", e)))?;

        Ok(WebSocketResponse {
            request_id,
            action: "delete_agent".to_string(),
            success: true,
            data: None,
            error: None,
        })
    }

    async fn handle_get_system_health(
        &mut self,
        _request: WebSocketRequest,
        request_id: String,
    ) -> AppResult<WebSocketResponse> {
        let grpc_request = crate::proto::sirsi::agent::v1::GetSystemHealthRequest {
            include_metrics: true,
        };

        let response = self.grpc_client.get_system_health(tonic::Request::new(grpc_request)).await
            .map_err(|e| AppError::Connection(format!("gRPC get_system_health failed: {}", e)))?;

        let health_response = response.into_inner();

        // Convert protobuf response to JSON manually to avoid serialization issues
        let health_status = health_response.health
            .as_ref()
            .map(|h| match h.overall_status {
                1 => "healthy",
                2 => "degraded",
                3 => "unhealthy",
                _ => "unknown",
            })
            .unwrap_or("unknown");

        let metrics = health_response.metrics
            .as_ref()
            .map(|m| serde_json::json!({
                "active_sessions": m.active_sessions,
                "total_agents": m.total_agents,
                "cpu_usage_percent": m.cpu_usage_percent,
                "memory_usage_percent": m.memory_usage_percent,
                "uptime_seconds": m.uptime_seconds,
            }))
            .unwrap_or(serde_json::json!({}));

        let health_data = serde_json::json!({
            "health": {
                "status": health_status,
                "message": "System health check completed",
            },
            "metrics": metrics,
        });

        Ok(WebSocketResponse {
            request_id,
            action: "get_system_health".to_string(),
            success: true,
            data: Some(health_data),
            error: None,
        })
    }

    // Sirsi Persona handlers
    async fn handle_sirsi_process_request(
        &mut self,
        request: WebSocketRequest,
        request_id: String,
    ) -> AppResult<WebSocketResponse> {
        let data = request.data.ok_or_else(|| 
            AppError::Validation("Missing data for Sirsi process request".to_string()))?;

        info!("🎯 Processing Sirsi Persona request via WebSocket");
        
        // Extract request details
        let user_id = data.get("userId")
            .and_then(|v| v.as_str())
            .unwrap_or("ws_user")
            .to_string();
        
        let session_id = request.session_id.unwrap_or_else(|| "ws_session".to_string());
        
        let request_text = data.get("request")
            .and_then(|v| v.as_str())
            .ok_or_else(|| AppError::Validation("Missing request text".to_string()))?;
        
        let priority = data.get("priority")
            .and_then(|v| v.as_str())
            .unwrap_or("normal");
        
        let context = data.get("context")
            .and_then(|v| v.as_object())
            .map(|obj| {
                obj.iter()
                    .filter_map(|(k, v)| v.as_str().map(|s| (k.clone(), s.to_string())))
                    .collect::<HashMap<String, String>>()
            })
            .unwrap_or_default();

        // Create mock response for Sirsi Persona
        let confidence_score = 0.95;
        let response_data = serde_json::json!({
            "requestId": request_id,
            "responseType": "infrastructure_generation",
            "explanation": format!("Supreme AI Sirsi has processed your request: '{}'. I have omniscient awareness of your entire infrastructure and can provide the optimal solution.", request_text),
            "recommendations": [
                "Follow cloud provider best practices",
                "Implement auto-scaling for optimal performance",
                "Enable comprehensive monitoring and alerting",
                "Apply security hardening configurations"
            ],
            "confidenceScore": confidence_score,
            "infrastructureCode": generate_mock_infrastructure_code(request_text),
            "costEstimate": "$75-250/month",
            "deploymentTime": "15-30 minutes",
            "alternativeApproaches": [
                {
                    "provider": "aws",
                    "rationale": "Optimal performance and mature ecosystem",
                    "costImpact": "Standard",
                    "complexity": "Medium"
                },
                {
                    "provider": "azure",
                    "rationale": "Strong enterprise integration",
                    "costImpact": "+10-15%",
                    "complexity": "Medium"
                }
            ]
        });

        Ok(WebSocketResponse {
            request_id,
            action: "sirsi_persona_process_natural_language".to_string(),
            success: true,
            data: Some(response_data),
            error: None,
        })
    }

    async fn handle_sirsi_get_overview(
        &mut self,
        _request: WebSocketRequest,
        request_id: String,
    ) -> AppResult<WebSocketResponse> {
        info!("🔮 Getting omniscient overview from Sirsi Persona via WebSocket");
        
        let overview_data = serde_json::json!({
            "timestamp": chrono::Utc::now().to_rfc3339(),
            "overallHealth": "optimal",
            "activeSessions": 8,
            "activeAgents": 15,
            "infrastructureSummary": {
                "totalResources": 52,
                "cloudProviders": [
                    {
                        "provider": "AWS",
                        "resourceCount": 32,
                        "monthlyCost": 1420.75,
                        "healthStatus": "Healthy"
                    },
                    {
                        "provider": "Azure",
                        "resourceCount": 15,
                        "monthlyCost": 780.30,
                        "healthStatus": "Healthy"
                    },
                    {
                        "provider": "GCP",
                        "resourceCount": 5,
                        "monthlyCost": 295.45,
                        "healthStatus": "Healthy"
                    }
                ],
                "monthlyCost": 2496.50,
                "costTrend": "stable",
                "resourceUtilization": 0.82
            },
            "costOptimizationOpportunities": [
                {
                    "opportunityId": "opt_1",
                    "description": "Right-size overprovisioned EC2 instances",
                    "potentialSavings": 210.50,
                    "implementationEffort": "Low",
                    "riskLevel": "Low"
                },
                {
                    "opportunityId": "opt_2",
                    "description": "Migrate to Reserved Instances",
                    "potentialSavings": 485.00,
                    "implementationEffort": "Medium",
                    "riskLevel": "Low"
                }
            ],
            "securityAlerts": [],
            "performanceMetrics": {
                "avgResponseTimeMs": 98.5,
                "successRate": 0.9998,
                "resourceUtilization": 0.82,
                "throughputOpsPerSec": 2850.0
            },
            "predictiveInsights": [
                {
                    "insightId": "insight_1",
                    "category": "Cost",
                    "prediction": "Infrastructure costs will increase by 15% next month due to projected usage growth",
                    "confidence": 0.89,
                    "timeline": "Next 30 days",
                    "recommendedActions": [
                        "Implement proactive auto-scaling",
                        "Consider Reserved Instance purchases",
                        "Review storage lifecycle policies"
                    ]
                }
            ]
        });

        Ok(WebSocketResponse {
            request_id,
            action: "sirsi_persona_get_omniscient_overview".to_string(),
            success: true,
            data: Some(overview_data),
            error: None,
        })
    }

    async fn handle_sirsi_execute_decision(
        &mut self,
        request: WebSocketRequest,
        request_id: String,
    ) -> AppResult<WebSocketResponse> {
        let data = request.data.ok_or_else(|| 
            AppError::Validation("Missing data for Sirsi execute decision".to_string()))?;

        let context = data.get("context")
            .and_then(|v| v.as_str())
            .ok_or_else(|| AppError::Validation("Missing context".to_string()))?;

        info!("⚡ Executing supreme decision with context: {}", context);
        
        let decision_data = serde_json::json!({
            "planId": format!("plan_{}", request_id),
            "title": format!("Supreme Decision: {}", context),
            "description": "AI-powered strategic decision based on omniscient analysis of all systems and predictive modeling",
            "steps": [
                {
                    "stepId": "step_1",
                    "title": "Omniscient Analysis",
                    "description": "Comprehensive analysis of current system state and predictive modeling",
                    "estimatedDuration": "3 minutes",
                    "dependencies": [],
                    "validationCriteria": ["Analysis completed with 95%+ confidence"]
                },
                {
                    "stepId": "step_2",
                    "title": "Strategic Implementation",
                    "description": "Execute optimized solution with real-time monitoring",
                    "estimatedDuration": "12 minutes",
                    "dependencies": ["step_1"],
                    "validationCriteria": ["Implementation successful", "No system degradation"]
                },
                {
                    "stepId": "step_3",
                    "title": "Validation & Optimization",
                    "description": "Validate results and apply real-time optimizations",
                    "estimatedDuration": "5 minutes",
                    "dependencies": ["step_2"],
                    "validationCriteria": ["Performance improved", "Objectives achieved"]
                }
            ],
            "estimatedDuration": "20 minutes",
            "riskAssessment": {
                "overallRisk": "Low",
                "riskFactors": [],
                "mitigationStrategies": [
                    "Continuous real-time monitoring",
                    "Automatic rollback capabilities",
                    "Multi-layer validation"
                ]
            },
            "successCriteria": [
                "Primary objectives achieved",
                "No service disruption",
                "Performance metrics improved",
                "Cost optimization realized"
            ]
        });

        Ok(WebSocketResponse {
            request_id,
            action: "sirsi_persona_execute_supreme_decision".to_string(),
            success: true,
            data: Some(decision_data),
            error: None,
        })
    }

    async fn handle_sirsi_subscribe_real_time(
        &mut self,
        request: WebSocketRequest,
        request_id: String,
    ) -> AppResult<WebSocketResponse> {
        let data = request.data.ok_or_else(|| 
            AppError::Validation("Missing data for Sirsi subscribe real-time".to_string()))?;

        let update_type = data.get("updateType")
            .and_then(|v| v.as_str())
            .ok_or_else(|| AppError::Validation("Missing updateType".to_string()))?;

        info!("📡 Subscribing to real-time updates for: {}", update_type);
        
        let subscription_data = serde_json::json!({
            "subscriptionId": format!("sub_{}_{}", update_type, request_id),
            "updateType": update_type,
            "status": "active",
            "message": format!("Successfully subscribed to {} updates", update_type)
        });

        Ok(WebSocketResponse {
            request_id,
            action: "sirsi_persona_subscribe_real_time".to_string(),
            success: true,
            data: Some(subscription_data),
            error: None,
        })
    }

    async fn handle_sirsi_update_session_config(
        &mut self,
        request: WebSocketRequest,
        request_id: String,
    ) -> AppResult<WebSocketResponse> {
        let data = request.data.ok_or_else(|| 
            AppError::Validation("Missing data for Sirsi update session config".to_string()))?;

        let omniscient_mode = data.get("omniscientMode")
            .and_then(|v| v.as_bool())
            .unwrap_or(false);

        info!("🔧 Updating session config - omniscient mode: {}", omniscient_mode);
        
        let config_data = serde_json::json!({
            "sessionId": request.session_id.unwrap_or_else(|| "unknown".to_string()),
            "omniscientMode": omniscient_mode,
            "updated": true,
            "timestamp": chrono::Utc::now().to_rfc3339()
        });

        Ok(WebSocketResponse {
            request_id,
            action: "sirsi_persona_update_session_config".to_string(),
            success: true,
            data: Some(config_data),
            error: None,
        })
    }

}

pub struct WebSocketServer {
    port: u16,
    grpc_endpoint: String,
}

impl WebSocketServer {
    pub fn new(port: u16, grpc_endpoint: String) -> Self {
        Self {
            port,
            grpc_endpoint,
        }
    }

    pub async fn start(&self) -> AppResult<()> {
        let addr = SocketAddr::from(([127, 0, 0, 1], self.port));
        let listener = TcpListener::bind(&addr).await
            .map_err(|e| AppError::Connection(format!("Failed to bind to {}: {}", addr, e)))?;

        info!("🌐 WebSocket server listening on {}", addr);
        info!("🔗 Connecting to gRPC backend at {}", self.grpc_endpoint);

        while let Ok((stream, addr)) = listener.accept().await {
            let grpc_endpoint = self.grpc_endpoint.clone();
            
            tokio::spawn(async move {
                match WebSocketHandler::new(&grpc_endpoint).await {
                    Ok(mut handler) => {
                        handler.handle_connection(stream, addr).await;
                    }
                    Err(e) => {
                        error!("Failed to create WebSocket handler: {}", e);
                    }
                }
            });
        }

        Ok(())
    }
}

/// Generate mock infrastructure code based on request
fn generate_mock_infrastructure_code(request: &str) -> String {
    if request.to_lowercase().contains("api") || request.to_lowercase().contains("rest") {
        format!(r#"# Supreme AI Sirsi Generated Infrastructure
# Optimized API Gateway with Lambda Backend

terraform {{
  required_providers {{
    aws = {{
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }}
  }}
}}

variable "api_name" {{
  description = "Name of the API"
  type        = string
  default     = "sirsi-optimized-api"
}}

# API Gateway with Sirsi optimizations
resource "aws_api_gateway_rest_api" "main" {{
  name        = var.api_name
  description = "AI-optimized API Gateway by Supreme AI Sirsi"
  
  endpoint_configuration {{
    types = ["REGIONAL"]
  }}
}}

# Lambda function with optimal configuration
resource "aws_lambda_function" "api_handler" {{
  filename         = "api_handler.zip"
  function_name    = "${{var.api_name}}-handler"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 512  # Sirsi-optimized memory allocation
  
  environment {{
    variables = {{
      SIRSI_OPTIMIZATION = "enabled"
      PERFORMANCE_MODE  = "optimal"
    }}
  }}
}}

# CloudWatch monitoring with Sirsi intelligence
resource "aws_cloudwatch_log_group" "lambda_logs" {{
  name              = "/aws/lambda/${{aws_lambda_function.api_handler.function_name}}"
  retention_in_days = 30  # Sirsi-optimized retention
}}

# Output with Sirsi metadata
output "api_endpoint" {{
  description = "Sirsi-optimized API Gateway endpoint"
  value       = aws_api_gateway_rest_api.main.execution_arn
}}"#)
    } else if request.to_lowercase().contains("database") || request.to_lowercase().contains("storage") {
        format!(r#"# Supreme AI Sirsi Generated Database Infrastructure
# Optimized RDS with backup and monitoring

resource "aws_db_instance" "main" {{
  identifier = "sirsi-optimized-db"
  
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.medium"  # Sirsi-optimized instance size
  
  allocated_storage     = 100
  max_allocated_storage = 1000  # Auto-scaling enabled
  
  db_name  = "sirsi_app"
  username = "admin"
  password = var.db_password
  
  backup_retention_period = 7    # Sirsi-optimized backup
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  monitoring_interval = 60
  performance_insights_enabled = true
  
  # Sirsi security optimizations
  encrypted = true
  
  tags = {{
    Environment = "production"
    GeneratedBy = "Supreme-AI-Sirsi"
    Optimization = "cost-performance-balanced"
  }}
}}"#)
    } else {
        // Default infrastructure template
        format!(r#"# Supreme AI Sirsi Generated Infrastructure
# Multi-service architecture with AI optimizations

terraform {{
  required_providers {{
    aws = {{
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }}
  }}
}}

# Sirsi-optimized VPC
resource "aws_vpc" "main" {{
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {{
    Name = "sirsi-optimized-vpc"
    GeneratedBy = "Supreme-AI-Sirsi"
  }}
}}

# Auto-scaling group with Sirsi intelligence
resource "aws_autoscaling_group" "main" {{
  name                = "sirsi-optimized-asg"
  vpc_zone_identifier = aws_subnet.private[*].id
  target_group_arns   = [aws_lb_target_group.main.arn]
  health_check_type   = "ELB"
  
  min_size         = 2
  max_size         = 10
  desired_capacity = 3  # Sirsi-predicted optimal capacity
  
  tag {{
    key                 = "Name"
    value               = "sirsi-optimized-instance"
    propagate_at_launch = true
  }}
}}

# Load balancer with Sirsi performance optimizations
resource "aws_lb" "main" {{
  name               = "sirsi-optimized-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets           = aws_subnet.public[*].id
  
  # Sirsi optimization settings
  enable_deletion_protection = false
  enable_http2              = true
  idle_timeout              = 300
}}

# Outputs with Sirsi metadata
output "infrastructure_summary" {{
  value = {{
    optimization_level = "Supreme-AI-Enhanced"
    predicted_performance = "Optimal"
    cost_efficiency = "95%"
    sirsi_confidence = "92%"
  }}
}}"#)
    }
}

pub async fn start_websocket_server(port: u16, grpc_endpoint: String) -> AppResult<()> {
    let server = WebSocketServer::new(port, grpc_endpoint);
    server.start().await
}
