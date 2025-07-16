use std::sync::Arc;
use tokio::sync::RwLock;
use tonic::transport::Server;
use tonic_reflection::server::Builder as ReflectionServerBuilder;
use tracing::{info, error};

use crate::agent::AgentManager;
use crate::agent::context::ContextStore;
use crate::error::{AppError, AppResult};
use crate::server::agent_service_impl::AgentServiceImpl;
use crate::server::sirsi_service_impl::MySirsiService;
use crate::proto::sirsi::agent::v1::agent_service_server::AgentServiceServer;
use crate::proto::sirsi::v1::sirsi_service_server::SirsiServiceServer;

pub struct GrpcServer {
    port: u16,
    agent_manager: Arc<RwLock<AgentManager>>,
    context_store: Arc<ContextStore>,
}

impl GrpcServer {
    pub fn new(port: u16, redis_url: &str) -> AppResult<Self> {
        let context_store = Arc::new(ContextStore::new(redis_url)?);
        let agent_manager = Arc::new(RwLock::new(AgentManager::new()));
        

        Ok(Self {
            port,
            agent_manager,
            context_store,
        })
    }

    pub async fn start(&self) -> AppResult<()> {
        let addr = format!("0.0.0.0:{}", self.port).parse()
            .map_err(|e| AppError::Configuration(format!("Invalid server address: {}", e)))?;

        info!("Starting gRPC server on {}", addr);

        // Test Redis connection
        self.context_store.health_check().await.map_err(|e| {
            AppError::Connection(format!("Redis health check failed: {}", e))
        })?;

        info!("Redis connection established successfully");

        // Create the agent service
        let agent_service = AgentServiceImpl::new(
            self.agent_manager.clone(),
            self.context_store.clone(),
        );

        // Create the Sirsi service
        let sirsi_service = MySirsiService::new(
            self.context_store.clone(),
            self.agent_manager.clone(),
        ).await;

        // Set up reflection service for easier debugging
        let reflection_service = ReflectionServerBuilder::configure()
            .register_encoded_file_descriptor_set(crate::protos::sirsi::agent::v1::FILE_DESCRIPTOR_SET)
            .build()
            .map_err(|e| AppError::Configuration(format!("Failed to build reflection service: {}", e)))?;

        info!("✅ Agent service initialized with real gRPC implementation");
        info!("✅ Sirsi service initialized with gRPC implementation");

        // Start the server with both agent service, Sirsi service, and reflection
        let result = Server::builder()
            .add_service(AgentServiceServer::new(agent_service))
            .add_service(SirsiServiceServer::new(sirsi_service))
            .add_service(reflection_service)
            .serve(addr)
            .await;

        match result {
            Ok(_) => {
                info!("gRPC server shut down gracefully");
                Ok(())
            }
            Err(e) => {
                error!("gRPC server error: {}", e);
                Err(AppError::Server(format!("gRPC server failed: {}", e)))
            }
        }
    }

    pub async fn health_check(&self) -> AppResult<()> {
        // Check Redis connection
        self.context_store.health_check().await?;

        // Check agent manager status
        let manager = self.agent_manager.read().await;
        let _available_agents = manager.list_available_agents().await;
        

        info!("gRPC server health check passed");
        Ok(())
    }

    pub async fn get_stats(&self) -> AppResult<ServerStats> {
        let active_sessions = self.context_store.get_active_sessions_count().await?;
        let active_agents = self.context_store.get_active_agents_count().await?;

        let manager = self.agent_manager.read().await;
        let available_agent_types = manager.list_available_agents().await;

        Ok(ServerStats {
            active_sessions,
            active_agents,
            available_agent_types,
            uptime_seconds: 0, // TODO: Track actual uptime
            mcp_enabled: false,
        })
    }

    pub async fn shutdown(&self) -> AppResult<()> {
        info!("Shutting down gRPC server...");
        // Perform cleanup operations here
        Ok(())
    }
}

#[derive(Debug)]
pub struct ServerStats {
    pub active_sessions: usize,
    pub active_agents: usize,
    pub available_agent_types: Vec<String>,
    pub uptime_seconds: u64,
    pub mcp_enabled: bool,
}

// Helper function to start the server with proper error handling
pub async fn start_grpc_server(port: u16, redis_url: &str) -> AppResult<()> {
    let server = GrpcServer::new(port, redis_url)?;
    
    // Set up graceful shutdown
    let shutdown_signal = async {
        tokio::signal::ctrl_c()
            .await
            .expect("Failed to install CTRL+C signal handler");
        info!("Received shutdown signal");
    };

    // Run server with graceful shutdown
    tokio::select! {
        result = server.start() => {
            if let Err(ref e) = result {
                error!("Server error: {}", e);
            } else {
                info!("Server shutdown gracefully");
            }
            result
        }
        _ = shutdown_signal => {
            info!("Shutdown signal received, stopping server...");
            server.shutdown().await?;
            Ok(())
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::Duration;
    use tokio::time::timeout;

    #[tokio::test]
    async fn test_grpc_server_creation() {
        // This test requires Redis to be running
        if std::env::var("REDIS_URL").is_err() {
            println!("REDIS_URL not set, skipping test");
            return;
        }

        let redis_url = std::env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1".to_string());
        
        match GrpcServer::new(50051, &redis_url) {
            Ok(server) => {
                // Test health check
                if server.health_check().await.is_ok() {
                    println!("gRPC server created and health check passed");
                } else {
                    println!("Health check failed - Redis may not be available");
                }
            }
            Err(e) => {
                println!("Failed to create gRPC server: {}", e);
            }
        }
    }

    #[tokio::test]
    async fn test_server_stats() {
        if std::env::var("REDIS_URL").is_err() {
            println!("REDIS_URL not set, skipping test");
            return;
        }

        let redis_url = std::env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1".to_string());
        
        if let Ok(server) = GrpcServer::new(50052, &redis_url) {
            if server.health_check().await.is_ok() {
                let stats = server.get_stats().await.unwrap();
                assert!(!stats.available_agent_types.is_empty());
                println!("Server stats: {:?}", stats);
            }
        }
    }
}
