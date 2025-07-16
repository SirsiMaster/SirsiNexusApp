use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextEntry {
    pub uri: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub mime_type: Option<String>,
    pub content: ContextContent,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ContextContent {
    #[serde(rename = "text")]
    Text { text: String },
    #[serde(rename = "blob")]
    Blob { 
        blob: String, // base64 encoded
        mime_type: String,
    },
    #[serde(rename = "resource")]
    Resource { uri: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceInfo {
    pub uri: String,
    pub name: String,
    pub description: Option<String>,
    pub mime_type: Option<String>,
    pub annotations: Option<ResourceAnnotations>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceAnnotations {
    pub audience: Option<Vec<String>>,
    pub priority: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolDefinition {
    pub name: String,
    pub description: String,
    pub input_schema: serde_json::Value, // JSON Schema
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolCall {
    pub name: String,
    pub arguments: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolResult {
    pub content: Vec<ToolContent>,
    pub is_error: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ToolContent {
    #[serde(rename = "text")]
    Text { text: String },
    #[serde(rename = "image")]
    Image { 
        data: String, // base64 encoded
        mime_type: String,
    },
    #[serde(rename = "resource")]
    Resource { 
        resource: ResourceInfo,
        text: Option<String>,
        blob: Option<String>, // base64 encoded
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SamplingRequest {
    pub model_preferences: Option<ModelPreferences>,
    pub system_prompt: Option<String>,
    pub include_context: Option<IncludeContext>,
    pub messages: Vec<SamplingMessage>,
    pub max_tokens: Option<u32>,
    pub temperature: Option<f64>,
    pub stop_sequences: Option<Vec<String>>,
    pub metadata: Option<HashMap<String, serde_json::Value>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelPreferences {
    pub cost_priority: Option<f64>,
    pub speed_priority: Option<f64>,
    pub intelligence_priority: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum IncludeContext {
    #[serde(rename = "none")]
    None,
    #[serde(rename = "thisServer")]
    ThisServer,
    #[serde(rename = "allServers")]
    AllServers,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SamplingMessage {
    pub role: MessageRole,
    pub content: MessageContent,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MessageRole {
    User,
    Assistant,
    System,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum MessageContent {
    #[serde(rename = "text")]
    Text { text: String },
    #[serde(rename = "image")]
    Image { 
        data: String, // base64 encoded
        mime_type: String,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SamplingResponse {
    pub model: String,
    pub stop_reason: Option<StopReason>,
    pub role: MessageRole,
    pub content: MessageContent,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum StopReason {
    EndTurn,
    StopSequence,
    MaxTokens,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum LogLevel {
    Debug,
    Info,
    Notice,
    Warning,
    Error,
    Critical,
    Alert,
    Emergency,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProgressToken {
    pub progress_token: String,
    pub progress: f64, // 0.0 to 1.0
    pub total: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PromptDefinition {
    pub name: String,
    pub description: String,
    pub arguments: Option<Vec<PromptArgument>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PromptArgument {
    pub name: String,
    pub description: Option<String>,
    pub required: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PromptMessage {
    pub role: MessageRole,
    pub content: MessageContent,
}

// Agent-specific extensions to MCP
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentContext {
    pub agent_id: String,
    pub agent_type: String,
    pub session_id: String,
    pub capabilities: Vec<String>,
    pub metadata: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CloudResourceContext {
    pub provider: String,
    pub region: String,
    pub resource_type: String,
    pub resource_id: String,
    pub tags: HashMap<String, String>,
    pub metadata: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MigrationContext {
    pub project_id: String,
    pub source_environment: HashMap<String, serde_json::Value>,
    pub target_environment: HashMap<String, serde_json::Value>,
    pub migration_phase: String,
    pub progress: f64,
}

// Helper functions
impl ContextEntry {
    pub fn new_text(uri: String, name: Option<String>, text: String) -> Self {
        Self {
            uri,
            name,
            description: None,
            mime_type: Some("text/plain".to_string()),
            content: ContextContent::Text { text },
        }
    }

    pub fn new_json(uri: String, name: Option<String>, json: serde_json::Value) -> Self {
        Self {
            uri,
            name,
            description: None,
            mime_type: Some("application/json".to_string()),
            content: ContextContent::Text { 
                text: serde_json::to_string_pretty(&json).unwrap_or_default() 
            },
        }
    }

    pub fn new_resource(uri: String, name: Option<String>, resource_uri: String) -> Self {
        Self {
            uri,
            name,
            description: None,
            mime_type: None,
            content: ContextContent::Resource { uri: resource_uri },
        }
    }
}

impl ToolContent {
    pub fn text(text: String) -> Self {
        Self::Text { text }
    }

    pub fn json(json: serde_json::Value) -> Self {
        Self::Text { 
            text: serde_json::to_string_pretty(&json).unwrap_or_default() 
        }
    }
}

impl SamplingMessage {
    pub fn user(text: String) -> Self {
        Self {
            role: MessageRole::User,
            content: MessageContent::Text { text },
        }
    }

    pub fn assistant(text: String) -> Self {
        Self {
            role: MessageRole::Assistant,
            content: MessageContent::Text { text },
        }
    }

    pub fn system(text: String) -> Self {
        Self {
            role: MessageRole::System,
            content: MessageContent::Text { text },
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_context_entry_creation() {
        let entry = ContextEntry::new_text(
            "test://context/1".to_string(),
            Some("Test Context".to_string()),
            "This is test content".to_string(),
        );

        assert_eq!(entry.uri, "test://context/1");
        assert_eq!(entry.name, Some("Test Context".to_string()));
        assert_eq!(entry.mime_type, Some("text/plain".to_string()));

        match entry.content {
            ContextContent::Text { text } => assert_eq!(text, "This is test content"),
            _ => panic!("Expected text content"),
        }
    }

    #[test]
    fn test_sampling_message_creation() {
        let msg = SamplingMessage::user("Hello, world!".to_string());
        
        assert!(matches!(msg.role, MessageRole::User));
        match msg.content {
            MessageContent::Text { text } => assert_eq!(text, "Hello, world!"),
            _ => panic!("Expected text content"),
        }
    }

    #[test]
    fn test_tool_content_json() {
        let json_value = serde_json::json!({
            "key": "value",
            "number": 42
        });

        let content = ToolContent::json(json_value);
        
        match content {
            ToolContent::Text { text } => {
                assert!(text.contains("\"key\": \"value\""));
                assert!(text.contains("\"number\": 42"));
            }
            _ => panic!("Expected text content"),
        }
    }
}
