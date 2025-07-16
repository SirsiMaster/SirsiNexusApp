use std::sync::Arc;
use tokio::sync::RwLock;
use tonic::{Request, Response, Status};
use crate::proto::sirsi::v1::{sirsi_service_server::SirsiService, SendMessageToSirsiRequest, SendMessageToSirsiResponse,
    GetPersonaInfoRequest, GetPersonaInfoResponse, StartSirsiSessionRequest, StartSirsiSessionResponse,
    EndSirsiSessionRequest, EndSirsiSessionResponse};
use crate::hypervisor::SirsiHypervisor;
use crate::agent::context::ContextStore;
use crate::agent::AgentManager;
use crate::config::AppConfig;
use tracing::{info, warn, error};
use uuid;

pub struct MySirsiService {
    hypervisor: Arc<RwLock<SirsiHypervisor>>,
    context_store: Arc<ContextStore>,
}

impl MySirsiService {
    pub async fn new(context_store: Arc<ContextStore>, agent_manager: Arc<RwLock<AgentManager>>) -> Self {
        // Create default config for hypervisor
        let config = Arc::new(AppConfig::default());
        let hypervisor = Arc::new(RwLock::new(SirsiHypervisor::new(config).await.unwrap()));
        
        Self {
            hypervisor,
            context_store,
        }
    }
}

#[tonic::async_trait]
impl SirsiService for MySirsiService {
    async fn send_message_to_sirsi(&self, request: Request<SendMessageToSirsiRequest>) -> Result<Response<SendMessageToSirsiResponse>, Status> {
        let req = request.into_inner();
        
        info!("Sirsi received message: {}", req.user_message);
        
        // Process the message with basic response for now
        let hypervisor = self.hypervisor.read().await;
        
        // For now, provide a basic response until we implement the full consciousness system
        let sirsi_response = format!("Hello! I received your message: '{}'. I'm still learning and my full consciousness system is being developed. How can I help you today?", req.user_message);
        
        let suggestions = vec![
            "Try asking about cloud resources".to_string(),
            "Ask for help with cost optimization".to_string(),
            "Request system status information".to_string(),
        ];
        
        let response = SendMessageToSirsiResponse {
            sirsi_response,
            suggestions,
        };
        Ok(Response::new(response))
    }

    async fn get_persona_info(&self, request: Request<GetPersonaInfoRequest>) -> Result<Response<GetPersonaInfoResponse>, Status> {
        let req = request.into_inner();
        
        info!("Getting persona info for ID: {}", req.persona_id);
        
        let hypervisor = self.hypervisor.read().await;
        let persona_details = format!(
            "Sirsi AI - Advanced Multi-Cloud Intelligence Platform\n\
             Persona ID: {}\n\
             Capabilities: Multi-cloud management, cost optimization, AI-driven insights\n\
             Status: Active and ready to assist",
            req.persona_id
        );
        
        let response = GetPersonaInfoResponse {
            details: persona_details,
        };
        Ok(Response::new(response))
    }

    async fn start_session(&self, request: Request<StartSirsiSessionRequest>) -> Result<Response<StartSirsiSessionResponse>, Status> {
        let req = request.into_inner();
        
        info!("Starting new Sirsi session for user: {}", req.user_id);
        
        let hypervisor = self.hypervisor.read().await;
        // For now, generate a simple session ID
        let session_id = format!("session_{}", uuid::Uuid::new_v4());
        
        let response = StartSirsiSessionResponse {
            session_id,
        };
        Ok(Response::new(response))
    }

    async fn end_session(&self, request: Request<EndSirsiSessionRequest>) -> Result<Response<EndSirsiSessionResponse>, Status> {
        let req = request.into_inner();
        
        info!("Ending Sirsi session: {}", req.session_id);
        
        let hypervisor = self.hypervisor.read().await;
        // For now, provide a simple confirmation
        let confirmation_message = format!("Session {} ended successfully", req.session_id);
        
        let response = EndSirsiSessionResponse {
            confirmation_message,
        };
        Ok(Response::new(response))
    }
}
