pub mod agent; // Note: using 'agent' not 'agents' to match existing references
pub mod ai;
pub mod mcp;
pub mod hedera;
pub mod integrations;
pub mod api;
pub mod llm;
pub mod audit;
pub mod auth;
pub mod communication;
pub mod compliance;
pub mod components;
pub mod config;
// pub mod database; // Temporarily disabled for CI compilation
pub mod error;
pub mod hypervisor;
pub mod middleware;
pub mod models;
pub mod proto;
pub mod security;
pub mod server;
pub mod services;
// pub mod sirsi;  // Sirsi Hypervisor - Central consciousness (moved to hypervisor)
pub mod telemetry;

// Alias for backward compatibility
pub use proto as protos;

// Re-export commonly used types for easier access in tests
pub use config::AppConfig;
pub use server::{start_grpc_server};
pub use hypervisor::{SirsiHypervisor, ServiceConfig};

// Re-export protobuf types
pub use proto::sirsi::agent::v1::{agent_service_server, agent_service_client};
