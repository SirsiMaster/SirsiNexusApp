use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::error::{AppError, AppResult};
use super::types::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpMessage {
    pub jsonrpc: String,
    #[serde(flatten)]
    pub content: MessageContent,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum MessageContent {
    Request(McpRequest),
    Response(McpResponse),
    Notification(McpNotification),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpRequest {
    pub id: serde_json::Value,
    pub method: String,
    pub params: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpResponse {
    pub id: serde_json::Value,
    #[serde(flatten)]
    pub result: ResponseResult,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum ResponseResult {
    Success { result: serde_json::Value },
    Error { error: McpError },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpNotification {
    pub method: String,
    pub params: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpError {
    pub code: i32,
    pub message: String,
    pub data: Option<serde_json::Value>,
}

// Standard MCP error codes
pub mod error_codes {
    pub const PARSE_ERROR: i32 = -32700;
    pub const INVALID_REQUEST: i32 = -32600;
    pub const METHOD_NOT_FOUND: i32 = -32601;
    pub const INVALID_PARAMS: i32 = -32602;
    pub const INTERNAL_ERROR: i32 = -32603;
    
    // MCP-specific errors
    pub const RESOURCE_NOT_FOUND: i32 = -32001;
    pub const TOOL_NOT_FOUND: i32 = -32002;
    pub const PROMPT_NOT_FOUND: i32 = -32003;
    pub const CONTEXT_NOT_FOUND: i32 = -32004;
}

pub struct McpProtocol {
    request_id_counter: u64,
}

impl McpProtocol {
    pub fn new() -> Self {
        Self {
            request_id_counter: 0,
        }
    }

    pub fn create_request(&mut self, method: String, params: Option<serde_json::Value>) -> McpMessage {
        self.request_id_counter += 1;
        McpMessage {
            jsonrpc: "2.0".to_string(),
            content: MessageContent::Request(McpRequest {
                id: serde_json::Value::Number(self.request_id_counter.into()),
                method,
                params,
            }),
        }
    }

    pub fn create_response(id: serde_json::Value, result: serde_json::Value) -> McpMessage {
        McpMessage {
            jsonrpc: "2.0".to_string(),
            content: MessageContent::Response(McpResponse {
                id,
                result: ResponseResult::Success { result },
            }),
        }
    }

    pub fn create_error_response(id: serde_json::Value, error: McpError) -> McpMessage {
        McpMessage {
            jsonrpc: "2.0".to_string(),
            content: MessageContent::Response(McpResponse {
                id,
                result: ResponseResult::Error { error },
            }),
        }
    }

    pub fn create_notification(method: String, params: Option<serde_json::Value>) -> McpMessage {
        McpMessage {
            jsonrpc: "2.0".to_string(),
            content: MessageContent::Notification(McpNotification {
                method,
                params,
            }),
        }
    }

    pub fn parse_message(json_str: &str) -> AppResult<McpMessage> {
        serde_json::from_str(json_str)
            .map_err(|e| AppError::Serialization(format!("Failed to parse MCP message: {}", e)))
    }

    pub fn serialize_message(message: &McpMessage) -> AppResult<String> {
        serde_json::to_string(message)
            .map_err(|e| AppError::Serialization(format!("Failed to serialize MCP message: {}", e)))
    }

    // Standard MCP method implementations
    pub fn initialize_request(&mut self, client_info: ClientInfo, capabilities: ClientCapabilities) -> McpMessage {
        let params = serde_json::to_value(InitializeParams {
            protocol_version: "2024-11-05".to_string(),
            capabilities,
            client_info,
        }).unwrap();

        self.create_request("initialize".to_string(), Some(params))
    }

    pub fn list_resources_request(&mut self, cursor: Option<String>) -> McpMessage {
        let params = cursor.map(|c| serde_json::json!({ "cursor": c }));
        self.create_request("resources/list".to_string(), params)
    }

    pub fn read_resource_request(&mut self, uri: String) -> McpMessage {
        let params = serde_json::json!({ "uri": uri });
        self.create_request("resources/read".to_string(), Some(params))
    }

    pub fn list_tools_request(&mut self, cursor: Option<String>) -> McpMessage {
        let params = cursor.map(|c| serde_json::json!({ "cursor": c }));
        self.create_request("tools/list".to_string(), params)
    }

    pub fn call_tool_request(&mut self, name: String, arguments: serde_json::Value) -> McpMessage {
        let params = serde_json::json!({
            "name": name,
            "arguments": arguments
        });
        self.create_request("tools/call".to_string(), Some(params))
    }

    pub fn complete_request(&mut self, ref_obj: CompletionRef, argument: CompletionArgument) -> McpMessage {
        let params = serde_json::json!({
            "ref": ref_obj,
            "argument": argument
        });
        self.create_request("completion/complete".to_string(), Some(params))
    }

    pub fn log_notification(level: LogLevel, data: serde_json::Value, logger: Option<String>) -> McpMessage {
        let params = serde_json::json!({
            "level": level,
            "data": data,
            "logger": logger
        });
        Self::create_notification("notifications/log".to_string(), Some(params))
    }

    pub fn progress_notification(progress_token: String, progress: f64, total: Option<u64>) -> McpMessage {
        let params = serde_json::json!({
            "progressToken": progress_token,
            "progress": progress,
            "total": total
        });
        Self::create_notification("notifications/progress".to_string(), Some(params))
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InitializeParams {
    #[serde(rename = "protocolVersion")]
    pub protocol_version: String,
    pub capabilities: ClientCapabilities,
    #[serde(rename = "clientInfo")]
    pub client_info: ClientInfo,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClientInfo {
    pub name: String,
    pub version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClientCapabilities {
    pub experimental: Option<HashMap<String, serde_json::Value>>,
    pub sampling: Option<SamplingCapabilities>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SamplingCapabilities {
    // No specific capabilities defined in the spec yet
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompletionRef {
    #[serde(rename = "type")]
    pub ref_type: String, // "ref/resource" or "ref/prompt"
    pub uri: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompletionArgument {
    pub name: String,
    pub value: String,
}

impl Default for McpProtocol {
    fn default() -> Self {
        Self::new()
    }
}

impl McpError {
    pub fn new(code: i32, message: String) -> Self {
        Self {
            code,
            message,
            data: None,
        }
    }

    pub fn with_data(code: i32, message: String, data: serde_json::Value) -> Self {
        Self {
            code,
            message,
            data: Some(data),
        }
    }

    pub fn parse_error() -> Self {
        Self::new(error_codes::PARSE_ERROR, "Parse error".to_string())
    }

    pub fn invalid_request() -> Self {
        Self::new(error_codes::INVALID_REQUEST, "Invalid request".to_string())
    }

    pub fn method_not_found(method: &str) -> Self {
        Self::new(error_codes::METHOD_NOT_FOUND, format!("Method not found: {}", method))
    }

    pub fn invalid_params(message: &str) -> Self {
        Self::new(error_codes::INVALID_PARAMS, format!("Invalid params: {}", message))
    }

    pub fn internal_error(message: &str) -> Self {
        Self::new(error_codes::INTERNAL_ERROR, format!("Internal error: {}", message))
    }

    pub fn resource_not_found(uri: &str) -> Self {
        Self::new(error_codes::RESOURCE_NOT_FOUND, format!("Resource not found: {}", uri))
    }

    pub fn tool_not_found(name: &str) -> Self {
        Self::new(error_codes::TOOL_NOT_FOUND, format!("Tool not found: {}", name))
    }
}

impl From<AppError> for McpError {
    fn from(error: AppError) -> Self {
        match error {
            AppError::NotFound(msg) => McpError::new(error_codes::RESOURCE_NOT_FOUND, msg),
            AppError::InvalidInput(msg) => McpError::invalid_params(&msg),
            AppError::Serialization(_msg) => McpError::parse_error(),
            _ => McpError::internal_error(&error.to_string()),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_protocol_creation() {
        let mut protocol = McpProtocol::new();
        assert_eq!(protocol.request_id_counter, 0);

        let msg = protocol.create_request("test".to_string(), None);
        assert_eq!(protocol.request_id_counter, 1);

        match msg.content {
            MessageContent::Request(req) => {
                assert_eq!(req.method, "test");
                assert_eq!(req.id, serde_json::Value::Number(1.into()));
            }
            _ => panic!("Expected request"),
        }
    }

    #[test]
    fn test_message_parsing() {
        let json = r#"{"jsonrpc":"2.0","id":1,"method":"test","params":{"key":"value"}}"#;
        let message = McpProtocol::parse_message(json).unwrap();

        assert_eq!(message.jsonrpc, "2.0");
        match message.content {
            MessageContent::Request(req) => {
                assert_eq!(req.method, "test");
                assert_eq!(req.id, serde_json::Value::Number(1.into()));
            }
            _ => panic!("Expected request"),
        }
    }

    #[test]
    fn test_error_creation() {
        let error = McpError::method_not_found("unknown_method");
        assert_eq!(error.code, error_codes::METHOD_NOT_FOUND);
        assert!(error.message.contains("unknown_method"));
    }

    #[test]
    fn test_response_serialization() {
        let response = McpProtocol::create_response(
            serde_json::Value::Number(1.into()),
            serde_json::json!({"result": "success"})
        );

        let json = McpProtocol::serialize_message(&response).unwrap();
        assert!(json.contains("\"jsonrpc\":\"2.0\""));
        assert!(json.contains("\"id\":1"));
        assert!(json.contains("\"result\""));
    }
}
