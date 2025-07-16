pub mod connectors;
pub mod context;
pub mod coordinator;
pub mod implementations;
pub mod loader;
pub mod manager;
pub mod service;
pub mod sirsi_interface;
pub use manager::{AgentManager, AgentCapabilities};
pub use loader::{AgentModuleLoader, AgentModuleInfo};
pub use sirsi_interface::{SirsiInterface, SirsiRequest, SirsiResponse, QualityEnforcer};

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Agent {
    pub id: String,
    pub agent_type: String,
    pub status: AgentStatus,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub last_activity: chrono::DateTime<chrono::Utc>,
    pub capabilities: Vec<String>,
    pub metadata: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AgentStatus {
    Initializing,
    Active,
    Idle,
    Busy,
    Error,
    Terminated,
}
