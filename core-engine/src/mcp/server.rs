use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{info, warn, debug};

use crate::error::AppResult;
use crate::agent::context::ContextStore;
use crate::agent::connectors::{ConnectorManager, AwsConfig, AwsResource};
use super::protocol::{McpProtocol, McpMessage, MessageContent, McpRequest, McpError, error_codes};
use super::types::*;
use super::McpConfig;

pub struct McpServer {
    config: McpConfig,
    context_store: Arc<ContextStore>,
    connector_manager: Arc<RwLock<ConnectorManager>>,
    tools: HashMap<String, ToolDefinition>,
    resources: HashMap<String, ResourceInfo>,
    prompts: HashMap<String, PromptDefinition>,
}

impl McpServer {
    pub fn new(config: McpConfig, context_store: Arc<ContextStore>) -> Self {
        let mut server = Self {
            config,
            context_store,
            connector_manager: Arc::new(RwLock::new(ConnectorManager::new())),
            tools: HashMap::new(),
            resources: HashMap::new(),
            prompts: HashMap::new(),
        };

        server.register_default_tools();
        server.register_default_resources();
        server.register_default_prompts();
        server
    }

    fn register_default_tools(&mut self) {
        // AWS discovery tool
        self.tools.insert("discover_aws_resources".to_string(), ToolDefinition {
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
                    },
                    "credentials": {
                        "type": "object",
                        "description": "AWS credentials (optional if using IAM roles)"
                    }
                },
                "required": ["region", "resource_types"]
            }),
        });

        // Cost estimation tool
        self.tools.insert("estimate_migration_cost".to_string(), ToolDefinition {
            name: "estimate_migration_cost".to_string(),
            description: "Estimate the cost of migrating AWS resources".to_string(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "resources": {
                        "type": "array",
                        "description": "Array of AWS resources to estimate"
                    },
                    "target_region": {
                        "type": "string",
                        "description": "Target region for migration"
                    }
                },
                "required": ["resources"]
            }),
        });

        // Agent status tool
        self.tools.insert("get_agent_status".to_string(), ToolDefinition {
            name: "get_agent_status".to_string(),
            description: "Get the status of a specific agent".to_string(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "agent_id": {
                        "type": "string",
                        "description": "ID of the agent to check"
                    }
                },
                "required": ["agent_id"]
            }),
        });

        // Session context tool
        self.tools.insert("get_session_context".to_string(), ToolDefinition {
            name: "get_session_context".to_string(),
            description: "Get the context for a session including conversation history".to_string(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "session_id": {
                        "type": "string",
                        "description": "ID of the session"
                    }
                },
                "required": ["session_id"]
            }),
        });
    }

    fn register_default_resources(&mut self) {
        // Active sessions resource
        self.resources.insert("sessions://active".to_string(), ResourceInfo {
            uri: "sessions://active".to_string(),
            name: "Active Sessions".to_string(),
            description: Some("List of currently active agent sessions".to_string()),
            mime_type: Some("application/json".to_string()),
            annotations: None,
        });

        // Agent metrics resource
        self.resources.insert("agents://metrics".to_string(), ResourceInfo {
            uri: "agents://metrics".to_string(),
            name: "Agent Metrics".to_string(),
            description: Some("Real-time metrics for all active agents".to_string()),
            mime_type: Some("application/json".to_string()),
            annotations: None,
        });

        // Cloud inventory resource
        self.resources.insert("cloud://inventory".to_string(), ResourceInfo {
            uri: "cloud://inventory".to_string(),
            name: "Cloud Resource Inventory".to_string(),
            description: Some("Comprehensive inventory of discovered cloud resources".to_string()),
            mime_type: Some("application/json".to_string()),
            annotations: None,
        });
    }

    fn register_default_prompts(&mut self) {
        // Migration planning prompt
        self.prompts.insert("migration_plan".to_string(), PromptDefinition {
            name: "migration_plan".to_string(),
            description: "Generate a comprehensive migration plan for cloud resources".to_string(),
            arguments: Some(vec![
                PromptArgument {
                    name: "source_provider".to_string(),
                    description: Some("Source cloud provider".to_string()),
                    required: Some(true),
                },
                PromptArgument {
                    name: "target_provider".to_string(),
                    description: Some("Target cloud provider".to_string()),
                    required: Some(true),
                },
                PromptArgument {
                    name: "resources".to_string(),
                    description: Some("JSON array of resources to migrate".to_string()),
                    required: Some(true),
                },
            ]),
        });

        // Cost optimization prompt
        self.prompts.insert("cost_optimization".to_string(), PromptDefinition {
            name: "cost_optimization".to_string(),
            description: "Analyze resources and provide cost optimization recommendations".to_string(),
            arguments: Some(vec![
                PromptArgument {
                    name: "resources".to_string(),
                    description: Some("JSON array of cloud resources".to_string()),
                    required: Some(true),
                },
                PromptArgument {
                    name: "budget_target".to_string(),
                    description: Some("Target budget reduction percentage".to_string()),
                    required: Some(false),
                },
            ]),
        });
    }

    pub async fn handle_message(&self, message: McpMessage) -> AppResult<Option<McpMessage>> {
        debug!("Handling MCP message: {:?}", message);

        match message.content {
            MessageContent::Request(request) => {
                let response = self.handle_request(request).await;
                Ok(Some(response))
            }
            MessageContent::Notification(notification) => {
                self.handle_notification(notification).await?;
                Ok(None)
            }
            MessageContent::Response(_) => {
                // We don't expect to receive responses as a server
                warn!("Received unexpected response message");
                Ok(None)
            }
        }
    }

    async fn handle_request(&self, request: McpRequest) -> McpMessage {
        let result = match request.method.as_str() {
            "initialize" => self.handle_initialize(&request).await,
            "resources/list" => self.handle_list_resources(&request).await,
            "resources/read" => self.handle_read_resource(&request).await,
            "tools/list" => self.handle_list_tools(&request).await,
            "tools/call" => self.handle_call_tool(&request).await,
            "prompts/list" => self.handle_list_prompts(&request).await,
            "prompts/get" => self.handle_get_prompt(&request).await,
            "completion/complete" => self.handle_complete(&request).await,
            _ => Err(McpError::method_not_found(&request.method)),
        };

        match result {
            Ok(response_data) => McpProtocol::create_response(request.id, response_data),
            Err(error) => McpProtocol::create_error_response(request.id, error),
        }
    }

    async fn handle_notification(&self, _notification: super::protocol::McpNotification) -> AppResult<()> {
        // Handle notifications (logs, progress updates, etc.)
        Ok(())
    }

    async fn handle_initialize(&self, _request: &McpRequest) -> Result<serde_json::Value, McpError> {
        Ok(serde_json::json!({
            "protocolVersion": "2024-11-05",
            "capabilities": self.config.capabilities,
            "serverInfo": {
                "name": self.config.server_name,
                "version": self.config.version
            }
        }))
    }

    async fn handle_list_resources(&self, _request: &McpRequest) -> Result<serde_json::Value, McpError> {
        let resources: Vec<&ResourceInfo> = self.resources.values().collect();
        Ok(serde_json::json!({
            "resources": resources
        }))
    }

    async fn handle_read_resource(&self, request: &McpRequest) -> Result<serde_json::Value, McpError> {
        let params = request.params.as_ref()
            .ok_or_else(|| McpError::invalid_params("Missing parameters"))?;

        let uri = params["uri"].as_str()
            .ok_or_else(|| McpError::invalid_params("Missing or invalid uri"))?;

        match uri {
            "sessions://active" => {
                let sessions_count = self.context_store.get_active_sessions_count().await
                    .map_err(|e| McpError::internal_error(&e.to_string()))?;
                
                Ok(serde_json::json!({
                    "contents": [{
                        "uri": uri,
                        "mimeType": "application/json",
                        "text": serde_json::json!({
                            "active_sessions": sessions_count,
                            "timestamp": chrono::Utc::now()
                        }).to_string()
                    }]
                }))
            }
            "agents://metrics" => {
                let agents_count = self.context_store.get_active_agents_count().await
                    .map_err(|e| McpError::internal_error(&e.to_string()))?;
                
                Ok(serde_json::json!({
                    "contents": [{
                        "uri": uri,
                        "mimeType": "application/json",
                        "text": serde_json::json!({
                            "active_agents": agents_count,
                            "timestamp": chrono::Utc::now()
                        }).to_string()
                    }]
                }))
            }
            _ => Err(McpError::resource_not_found(uri))
        }
    }

    async fn handle_list_tools(&self, _request: &McpRequest) -> Result<serde_json::Value, McpError> {
        let tools: Vec<&ToolDefinition> = self.tools.values().collect();
        Ok(serde_json::json!({
            "tools": tools
        }))
    }

    async fn handle_call_tool(&self, request: &McpRequest) -> Result<serde_json::Value, McpError> {
        let params = request.params.as_ref()
            .ok_or_else(|| McpError::invalid_params("Missing parameters"))?;

        let name = params["name"].as_str()
            .ok_or_else(|| McpError::invalid_params("Missing or invalid tool name"))?;

        let arguments = &params["arguments"];

        match name {
            "discover_aws_resources" => self.handle_discover_aws_resources(arguments).await,
            "estimate_migration_cost" => self.handle_estimate_migration_cost(arguments).await,
            "get_agent_status" => self.handle_get_agent_status(arguments).await,
            "get_session_context" => self.handle_get_session_context(arguments).await,
            _ => Err(McpError::tool_not_found(name))
        }
    }

    async fn handle_discover_aws_resources(&self, arguments: &serde_json::Value) -> Result<serde_json::Value, McpError> {
        let region = arguments["region"].as_str()
            .ok_or_else(|| McpError::invalid_params("Missing region"))?;

        let resource_types: Vec<String> = arguments["resource_types"]
            .as_array()
            .ok_or_else(|| McpError::invalid_params("Missing or invalid resource_types"))?
            .iter()
            .filter_map(|v| v.as_str().map(String::from))
            .collect();

        let aws_config = AwsConfig {
            region: region.to_string(),
            access_key_id: arguments.get("credentials")
                .and_then(|c| c.get("access_key_id"))
                .and_then(|v| v.as_str())
                .map(String::from),
            secret_access_key: arguments.get("credentials")
                .and_then(|c| c.get("secret_access_key"))
                .and_then(|v| v.as_str())
                .map(String::from),
            role_arn: None,
            external_id: None,
        };

        let mut connector_manager = self.connector_manager.write().await;
        let connector_id = connector_manager.create_aws_connector(aws_config).await
            .map_err(|e| McpError::internal_error(&e.to_string()))?;

        let discovery_result = connector_manager.discover_aws_resources(&connector_id, resource_types).await
            .map_err(|e| McpError::internal_error(&e.to_string()))?;

        Ok(serde_json::json!({
            "content": [{
                "type": "text",
                "text": serde_json::to_string_pretty(&discovery_result)
                    .unwrap_or_else(|_| "Failed to serialize discovery result".to_string())
            }]
        }))
    }

    async fn handle_estimate_migration_cost(&self, arguments: &serde_json::Value) -> Result<serde_json::Value, McpError> {
        let resources: Vec<AwsResource> = serde_json::from_value(arguments["resources"].clone())
            .map_err(|e| McpError::invalid_params(&format!("Invalid resources: {}", e)))?;

        // For now, we'll create a temporary connector for cost estimation
        // In a real implementation, you'd want to maintain connector state
        let aws_config = AwsConfig {
            region: "us-east-1".to_string(), // Default region
            access_key_id: None,
            secret_access_key: None,
            role_arn: None,
            external_id: None,
        };

        let mut connector_manager = self.connector_manager.write().await;
        let connector_id = connector_manager.create_aws_connector(aws_config).await
            .map_err(|e| McpError::internal_error(&e.to_string()))?;

        let cost_estimates = connector_manager.estimate_aws_costs(&connector_id, &resources).await
            .map_err(|e| McpError::internal_error(&e.to_string()))?;

        Ok(serde_json::json!({
            "content": [{
                "type": "text",
                "text": serde_json::to_string_pretty(&cost_estimates)
                    .unwrap_or_else(|_| "Failed to serialize cost estimates".to_string())
            }]
        }))
    }

    async fn handle_get_agent_status(&self, arguments: &serde_json::Value) -> Result<serde_json::Value, McpError> {
        let agent_id = arguments["agent_id"].as_str()
            .ok_or_else(|| McpError::invalid_params("Missing agent_id"))?;

        let agent_context = self.context_store.get_agent_context(agent_id).await
            .map_err(|e| McpError::internal_error(&e.to_string()))?;

        Ok(serde_json::json!({
            "content": [{
                "type": "text",
                "text": serde_json::to_string_pretty(&agent_context)
                    .unwrap_or_else(|_| "Failed to serialize agent context".to_string())
            }]
        }))
    }

    async fn handle_get_session_context(&self, arguments: &serde_json::Value) -> Result<serde_json::Value, McpError> {
        let session_id = arguments["session_id"].as_str()
            .ok_or_else(|| McpError::invalid_params("Missing session_id"))?;

        let session_context = self.context_store.get_session_context(session_id).await
            .map_err(|e| McpError::internal_error(&e.to_string()))?;

        Ok(serde_json::json!({
            "content": [{
                "type": "text",
                "text": serde_json::to_string_pretty(&session_context)
                    .unwrap_or_else(|_| "Failed to serialize session context".to_string())
            }]
        }))
    }

    async fn handle_list_prompts(&self, _request: &McpRequest) -> Result<serde_json::Value, McpError> {
        let prompts: Vec<&PromptDefinition> = self.prompts.values().collect();
        Ok(serde_json::json!({
            "prompts": prompts
        }))
    }

    async fn handle_get_prompt(&self, request: &McpRequest) -> Result<serde_json::Value, McpError> {
        let params = request.params.as_ref()
            .ok_or_else(|| McpError::invalid_params("Missing parameters"))?;

        let name = params["name"].as_str()
            .ok_or_else(|| McpError::invalid_params("Missing or invalid prompt name"))?;

        match name {
            "migration_plan" => {
                let prompt_text = r#"You are an expert cloud migration architect. Based on the provided source and target cloud providers and the list of resources, create a comprehensive migration plan that includes:

1. **Assessment Phase**: Analyze the current resources and their dependencies
2. **Planning Phase**: Define the migration strategy and timeline
3. **Preparation Phase**: List prerequisites and setup requirements
4. **Migration Phase**: Step-by-step migration process
5. **Validation Phase**: Testing and verification procedures
6. **Optimization Phase**: Post-migration improvements

Source Provider: {{source_provider}}
Target Provider: {{target_provider}}
Resources to Migrate: {{resources}}

Please provide a detailed, actionable migration plan with timelines, risks, and mitigation strategies."#;

                Ok(serde_json::json!({
                    "description": "Generate a comprehensive migration plan for cloud resources",
                    "messages": [{
                        "role": "user",
                        "content": {
                            "type": "text",
                            "text": prompt_text
                        }
                    }]
                }))
            }
            "cost_optimization" => {
                let prompt_text = r#"You are a cloud cost optimization expert. Analyze the provided cloud resources and generate specific recommendations to reduce costs while maintaining performance and availability.

Resources to Analyze: {{resources}}
Budget Target: {{budget_target}}% reduction

Please provide:
1. **Current Cost Analysis**: Break down current costs by service/resource type
2. **Optimization Opportunities**: Specific recommendations with potential savings
3. **Right-sizing Recommendations**: Instance/service sizing adjustments
4. **Reserved Instance/Savings Plans**: Long-term commitment opportunities
5. **Architecture Improvements**: Structural changes for better cost efficiency
6. **Monitoring Setup**: Cost tracking and alerting recommendations

Format your response with clear action items and expected savings for each recommendation."#;

                Ok(serde_json::json!({
                    "description": "Analyze resources and provide cost optimization recommendations",
                    "messages": [{
                        "role": "user",
                        "content": {
                            "type": "text",
                            "text": prompt_text
                        }
                    }]
                }))
            }
            _ => Err(McpError::new(error_codes::PROMPT_NOT_FOUND, format!("Prompt not found: {}", name)))
        }
    }

    async fn handle_complete(&self, _request: &McpRequest) -> Result<serde_json::Value, McpError> {
        // Implement completion logic for argument completion
        Ok(serde_json::json!({
            "completion": {
                "values": [],
                "total": 0,
                "hasMore": false
            }
        }))
    }

    pub async fn health_check(&self) -> AppResult<()> {
        self.context_store.health_check().await?;
        info!("MCP server health check passed");
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::agent::context::ContextStore;

    #[tokio::test]
    async fn test_mcp_server_creation() {
        let config = McpConfig::default();
        
        // This test requires Redis to be running
        if let Ok(context_store) = ContextStore::new("redis://127.0.0.1") {
            let server = McpServer::new(config, Arc::new(context_store));
            
            assert!(!server.tools.is_empty());
            assert!(!server.resources.is_empty());
            assert!(!server.prompts.is_empty());
        }
    }

    #[tokio::test]
    async fn test_list_tools_request() {
        let config = McpConfig::default();
        
        if let Ok(context_store) = ContextStore::new("redis://127.0.0.1") {
            let server = McpServer::new(config, Arc::new(context_store));
            
            let request = McpRequest {
                id: serde_json::Value::Number(1.into()),
                method: "tools/list".to_string(),
                params: None,
            };

            let result = server.handle_list_tools(&request).await;
            assert!(result.is_ok());
            
            let response = result.unwrap();
            assert!(response["tools"].is_array());
        }
    }
}
