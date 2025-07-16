use std::collections::HashMap;
use tracing::{info, debug};

use crate::error::{AppError, AppResult};
use super::protocol::{McpProtocol, ClientInfo, ClientCapabilities};
use super::types::*;

pub struct McpClient {
    protocol: McpProtocol,
    initialized: bool,
    client_info: ClientInfo,
}

impl McpClient {
    pub fn new(name: String, version: String) -> Self {
        Self {
            protocol: McpProtocol::new(),
            initialized: false,
            client_info: ClientInfo {
                name,
                version,
            },
        }
    }

    pub async fn initialize(&mut self) -> AppResult<()> {
        let init_message = self.protocol.initialize_request(
            ClientInfo {
                name: self.client_info.name.clone(),
                version: self.client_info.version.clone(),
            },
            ClientCapabilities {
                experimental: None,
                sampling: None,
            },
        );

        debug!("Sending initialize request: {:?}", init_message);
        
        // In a real implementation, you would send this over a transport
        // For now, we'll just mark as initialized
        self.initialized = true;
        
        info!("MCP client initialized successfully");
        Ok(())
    }

    pub async fn list_resources(&mut self) -> AppResult<Vec<ResourceInfo>> {
        self.ensure_initialized()?;
        
        let message = self.protocol.list_resources_request(None);
        debug!("Listing resources: {:?}", message);

        // Mock response for demonstration
        // In a real implementation, you would send this over a transport and parse the response
        Ok(vec![
            ResourceInfo {
                uri: "sessions://active".to_string(),
                name: "Active Sessions".to_string(),
                description: Some("List of currently active agent sessions".to_string()),
                mime_type: Some("application/json".to_string()),
                annotations: None,
            },
            ResourceInfo {
                uri: "agents://metrics".to_string(),
                name: "Agent Metrics".to_string(),
                description: Some("Real-time metrics for all active agents".to_string()),
                mime_type: Some("application/json".to_string()),
                annotations: None,
            },
        ])
    }

    pub async fn read_resource(&mut self, uri: &str) -> AppResult<Vec<ContextEntry>> {
        self.ensure_initialized()?;
        
        let message = self.protocol.read_resource_request(uri.to_string());
        debug!("Reading resource {}: {:?}", uri, message);

        // Mock response based on URI
        match uri {
            "sessions://active" => {
                Ok(vec![ContextEntry::new_json(
                    uri.to_string(),
                    Some("Active Sessions".to_string()),
                    serde_json::json!({
                        "active_sessions": 5,
                        "timestamp": chrono::Utc::now()
                    })
                )])
            }
            "agents://metrics" => {
                Ok(vec![ContextEntry::new_json(
                    uri.to_string(),
                    Some("Agent Metrics".to_string()),
                    serde_json::json!({
                        "active_agents": 12,
                        "timestamp": chrono::Utc::now()
                    })
                )])
            }
            _ => Err(AppError::NotFound(format!("Resource not found: {}", uri)))
        }
    }

    pub async fn list_tools(&mut self) -> AppResult<Vec<ToolDefinition>> {
        self.ensure_initialized()?;
        
        let message = self.protocol.list_tools_request(None);
        debug!("Listing tools: {:?}", message);

        // Mock response
        Ok(vec![
            ToolDefinition {
                name: "discover_aws_resources".to_string(),
                description: "Discover AWS resources in a given region".to_string(),
                input_schema: serde_json::json!({
                    "type": "object",
                    "properties": {
                        "region": {
                            "type": "string",
                            "description": "AWS region to scan"
                        },
                        "resource_types": {
                            "type": "array",
                            "items": { "type": "string" },
                            "description": "Types of resources to discover (ec2, s3, etc.)"
                        }
                    },
                    "required": ["region", "resource_types"]
                }),
            },
            ToolDefinition {
                name: "estimate_migration_cost".to_string(),
                description: "Estimate the cost of migrating AWS resources".to_string(),
                input_schema: serde_json::json!({
                    "type": "object",
                    "properties": {
                        "resources": {
                            "type": "array",
                            "description": "Array of AWS resources to estimate"
                        }
                    },
                    "required": ["resources"]
                }),
            },
        ])
    }

    pub async fn call_tool(&mut self, name: &str, arguments: serde_json::Value) -> AppResult<ToolResult> {
        self.ensure_initialized()?;
        
        let message = self.protocol.call_tool_request(name.to_string(), arguments.clone());
        debug!("Calling tool {}: {:?}", name, message);

        // Mock responses based on tool name
        match name {
            "discover_aws_resources" => {
                let mock_resources = serde_json::json!({
                    "resources": [
                        {
                            "resource_type": "ec2:instance",
                            "resource_id": "i-1234567890abcdef0",
                            "name": "web-server-1",
                            "region": "us-east-1",
                            "tags": {"Environment": "production", "Team": "web"},
                            "metadata": {"instance_type": "t3.medium", "state": "running"}
                        }
                    ],
                    "total_count": 1,
                    "scan_time_ms": 2500
                });

                Ok(ToolResult {
                    content: vec![ToolContent::json(mock_resources)],
                    is_error: Some(false),
                })
            }
            "estimate_migration_cost" => {
                let mock_costs = serde_json::json!({
                    "i-1234567890abcdef0": 72.0
                });

                Ok(ToolResult {
                    content: vec![ToolContent::json(mock_costs)],
                    is_error: Some(false),
                })
            }
            "get_agent_status" => {
                let agent_id = arguments.get("agent_id")
                    .and_then(|v| v.as_str())
                    .unwrap_or("unknown");

                let mock_status = serde_json::json!({
                    "agent_id": agent_id,
                    "status": "ready",
                    "last_activity": chrono::Utc::now(),
                    "capabilities": ["chat", "suggest", "aws_specific"]
                });

                Ok(ToolResult {
                    content: vec![ToolContent::json(mock_status)],
                    is_error: Some(false),
                })
            }
            "get_session_context" => {
                let session_id = arguments.get("session_id")
                    .and_then(|v| v.as_str())
                    .unwrap_or("unknown");

                let mock_context = serde_json::json!({
                    "session_id": session_id,
                    "user_id": "user-123",
                    "agents": ["agent-1", "agent-2"],
                    "created_at": chrono::Utc::now(),
                    "last_activity": chrono::Utc::now()
                });

                Ok(ToolResult {
                    content: vec![ToolContent::json(mock_context)],
                    is_error: Some(false),
                })
            }
            _ => Err(AppError::NotFound(format!("Tool not found: {}", name)))
        }
    }

    pub async fn sample_text(&mut self, request: SamplingRequest) -> AppResult<SamplingResponse> {
        self.ensure_initialized()?;
        
        debug!("Sampling request: {:?}", request);

        // Mock response - in a real implementation, this would go to an LLM
        let response_text = match request.messages.last() {
            Some(msg) => match &msg.content {
                super::types::MessageContent::Text { text } => {
                    format!("AI response to: {}", text)
                }
                _ => "AI response to non-text input".to_string(),
            }
            None => "AI response to empty message".to_string(),
        };

        Ok(SamplingResponse {
            model: "gpt-4".to_string(),
            stop_reason: Some(StopReason::EndTurn),
            role: MessageRole::Assistant,
            content: super::types::MessageContent::Text { text: response_text },
        })
    }

    pub async fn provide_context(&mut self, entries: Vec<ContextEntry>) -> AppResult<()> {
        self.ensure_initialized()?;
        
        debug!("Providing context entries: {}", entries.len());
        
        // In a real implementation, you would send context to the server
        // For now, we'll just log it
        for entry in entries {
            info!("Context entry: {} ({})", entry.uri, entry.name.unwrap_or("unnamed".to_string()));
        }
        
        Ok(())
    }

    pub async fn get_cloud_resource_context(&mut self, provider: &str, resource_id: &str) -> AppResult<CloudResourceContext> {
        self.ensure_initialized()?;
        
        // Mock cloud resource context
        Ok(CloudResourceContext {
            provider: provider.to_string(),
            region: "us-east-1".to_string(),
            resource_type: "ec2:instance".to_string(),
            resource_id: resource_id.to_string(),
            tags: {
                let mut tags = HashMap::new();
                tags.insert("Environment".to_string(), "production".to_string());
                tags.insert("Team".to_string(), "backend".to_string());
                tags
            },
            metadata: {
                let mut metadata = HashMap::new();
                metadata.insert("instance_type".to_string(), serde_json::Value::String("t3.medium".to_string()));
                metadata.insert("state".to_string(), serde_json::Value::String("running".to_string()));
                metadata
            },
        })
    }

    pub async fn get_migration_context(&mut self, project_id: &str) -> AppResult<MigrationContext> {
        self.ensure_initialized()?;
        
        // Mock migration context
        Ok(MigrationContext {
            project_id: project_id.to_string(),
            source_environment: {
                let mut env = HashMap::new();
                env.insert("provider".to_string(), serde_json::Value::String("aws".to_string()));
                env.insert("region".to_string(), serde_json::Value::String("us-west-2".to_string()));
                env
            },
            target_environment: {
                let mut env = HashMap::new();
                env.insert("provider".to_string(), serde_json::Value::String("azure".to_string()));
                env.insert("region".to_string(), serde_json::Value::String("East US".to_string()));
                env
            },
            migration_phase: "planning".to_string(),
            progress: 0.25,
        })
    }

    fn ensure_initialized(&self) -> AppResult<()> {
        if !self.initialized {
            Err(AppError::Configuration("MCP client not initialized".to_string()))
        } else {
            Ok(())
        }
    }

    pub fn is_initialized(&self) -> bool {
        self.initialized
    }
}

// Helper struct for creating context entries from agent data
pub struct ContextBuilder {
    entries: Vec<ContextEntry>,
}

impl ContextBuilder {
    pub fn new() -> Self {
        Self {
            entries: Vec::new(),
        }
    }

    pub fn add_agent_context(mut self, agent_context: &AgentContext) -> Self {
        let uri = format!("agent://{}", agent_context.agent_id);
        let entry = ContextEntry::new_json(
            uri,
            Some(format!("Agent {} Context", agent_context.agent_type)),
            serde_json::to_value(agent_context).unwrap_or_default(),
        );
        self.entries.push(entry);
        self
    }

    pub fn add_cloud_resource(mut self, resource: &CloudResourceContext) -> Self {
        let uri = format!("{}://{}/{}", resource.provider, resource.region, resource.resource_id);
        let entry = ContextEntry::new_json(
            uri,
            Some(format!("{} Resource", resource.resource_type)),
            serde_json::to_value(resource).unwrap_or_default(),
        );
        self.entries.push(entry);
        self
    }

    pub fn add_migration_context(mut self, migration: &MigrationContext) -> Self {
        let uri = format!("migration://{}", migration.project_id);
        let entry = ContextEntry::new_json(
            uri,
            Some("Migration Context".to_string()),
            serde_json::to_value(migration).unwrap_or_default(),
        );
        self.entries.push(entry);
        self
    }

    pub fn add_text_context(mut self, uri: String, name: Option<String>, text: String) -> Self {
        let entry = ContextEntry::new_text(uri, name, text);
        self.entries.push(entry);
        self
    }

    pub fn build(self) -> Vec<ContextEntry> {
        self.entries
    }
}

impl Default for ContextBuilder {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_mcp_client_creation() {
        let mut client = McpClient::new("test-client".to_string(), "1.0.0".to_string());
        assert!(!client.is_initialized());

        client.initialize().await.unwrap();
        assert!(client.is_initialized());
    }

    #[tokio::test]
    async fn test_context_builder() {
        let agent_context = AgentContext {
            agent_id: "agent-123".to_string(),
            agent_type: "aws".to_string(),
            session_id: "session-456".to_string(),
            capabilities: vec!["discover".to_string(), "estimate".to_string()],
            metadata: HashMap::new(),
        };

        let contexts = ContextBuilder::new()
            .add_agent_context(&agent_context)
            .add_text_context(
                "custom://test".to_string(),
                Some("Test Context".to_string()),
                "This is test content".to_string(),
            )
            .build();

        assert_eq!(contexts.len(), 2);
        assert_eq!(contexts[0].uri, "agent://agent-123");
        assert_eq!(contexts[1].uri, "custom://test");
    }

    #[tokio::test]
    async fn test_tool_calling() {
        let mut client = McpClient::new("test-client".to_string(), "1.0.0".to_string());
        client.initialize().await.unwrap();

        let args = serde_json::json!({
            "region": "us-east-1",
            "resource_types": ["ec2", "s3"]
        });

        let result = client.call_tool("discover_aws_resources", args).await.unwrap();
        assert!(!result.content.is_empty());
        assert_eq!(result.is_error, Some(false));
    }
}
