pub mod client;
pub mod protocol;
pub mod server;
pub mod types;

pub use client::McpClient;
pub use protocol::{McpProtocol, McpMessage, McpRequest, McpResponse};
pub use server::McpServer;
pub use types::{
    ContextEntry, ResourceInfo, ToolDefinition, ToolCall, ToolResult,
    SamplingRequest, SamplingResponse, LogLevel, ProgressToken
};

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpConfig {
    pub server_name: String,
    pub version: String,
    pub capabilities: McpCapabilities,
    pub tools: Vec<ToolDefinition>,
    pub resources: Vec<ResourceInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpCapabilities {
    pub resources: Option<ResourceCapabilities>,
    pub tools: Option<ToolCapabilities>,
    pub prompts: Option<PromptCapabilities>,
    pub logging: Option<LoggingCapabilities>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceCapabilities {
    pub subscribe: bool,
    pub list_changed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolCapabilities {
    pub list_changed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PromptCapabilities {
    pub list_changed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoggingCapabilities {
    pub level: LogLevel,
}

impl Default for McpConfig {
    fn default() -> Self {
        Self {
            server_name: "Sirsi Nexus Agent MCP Server".to_string(),
            version: "1.0.0".to_string(),
            capabilities: McpCapabilities {
                resources: Some(ResourceCapabilities {
                    subscribe: true,
                    list_changed: true,
                }),
                tools: Some(ToolCapabilities {
                    list_changed: true,
                }),
                prompts: Some(PromptCapabilities {
                    list_changed: true,
                }),
                logging: Some(LoggingCapabilities {
                    level: LogLevel::Info,
                }),
            },
            tools: Vec::new(),
            resources: Vec::new(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mcp_config_default() {
        let config = McpConfig::default();
        assert_eq!(config.server_name, "Sirsi Nexus Agent MCP Server");
        assert_eq!(config.version, "1.0.0");
        assert!(config.capabilities.resources.is_some());
        assert!(config.capabilities.tools.is_some());
    }
}
