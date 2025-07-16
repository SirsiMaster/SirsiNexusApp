# Model Context Protocol (MCP) Implementation

The Sirsi Nexus AI Agent Framework includes a comprehensive implementation of the Model Context Protocol (MCP), providing standardized communication between AI models and external context sources.

## Overview

The MCP implementation consists of several key components:

- **Protocol Layer**: JSON-RPC 2.0 based message format and routing
- **Server**: Hosts tools, resources, and prompts for AI agents
- **Client**: Connects to MCP servers to access external context
- **Types**: Comprehensive type definitions for all MCP entities

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   AI Model      │────▶│   MCP Client    │────▶│   MCP Server    │
│                 │     │                 │     │                 │
│ (LLM/Agent)     │     │ Context Builder │     │ Tools/Resources │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │                         │
                                ▼                         ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │ Context Entries │     │ Agent Framework │
                        │ - Agent State   │     │ - Redis Store   │
                        │ - Cloud Res.    │     │ - AWS Connector │
                        │ - Migration     │     │ - Cost Analysis │
                        └─────────────────┘     └─────────────────┘
```

## Components

### 1. Protocol Layer (`protocol.rs`)

Implements the JSON-RPC 2.0 message format according to MCP specification:

```rust
// Standard MCP request
{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
        "name": "discover_aws_resources",
        "arguments": {
            "region": "us-east-1",
            "resource_types": ["ec2", "s3"]
        }
    }
}
```

**Key Features:**
- Request/Response/Notification message types
- Standard error codes and handling
- Protocol version negotiation
- Message serialization/deserialization

### 2. MCP Server (`server.rs`)

Provides tools, resources, and prompts to AI agents:

**Built-in Tools:**
- `discover_aws_resources`: Scan AWS infrastructure
- `estimate_migration_cost`: Calculate migration costs
- `get_agent_status`: Query agent health and metrics
- `get_session_context`: Retrieve conversation history

**Built-in Resources:**
- `sessions://active`: Live session metrics
- `agents://metrics`: Real-time agent statistics
- `cloud://inventory`: Discovered cloud resources

**Built-in Prompts:**
- `migration_plan`: Generate migration strategies
- `cost_optimization`: Analyze cost reduction opportunities

### 3. MCP Client (`client.rs`)

Connects to MCP servers and provides context to AI models:

```rust
use sirsi_core::mcp::{McpClient, ContextBuilder};

// Initialize client
let mut client = McpClient::new("sirsi-agent".to_string(), "1.0.0".to_string());
client.initialize().await?;

// Build context from multiple sources
let context = ContextBuilder::new()
    .add_agent_context(&agent_context)
    .add_cloud_resource(&aws_resource)
    .add_migration_context(&migration_project)
    .build();

// Provide context to the client
client.provide_context(context).await?;

// Call tools
let result = client.call_tool("discover_aws_resources", args).await?;
```

### 4. Type System (`types.rs`)

Comprehensive type definitions for MCP entities:

**Core Types:**
- `ContextEntry`: Structured context information
- `ToolDefinition`: Tool schemas and descriptions
- `ResourceInfo`: Available resources metadata
- `SamplingRequest/Response`: AI model interaction

**Agent-Specific Extensions:**
- `AgentContext`: Agent state and capabilities
- `CloudResourceContext`: Cloud infrastructure context
- `MigrationContext`: Migration project information

## Integration with Agent Framework

The MCP implementation is deeply integrated with the Sirsi Nexus agent framework:

### 1. Context Storage Integration

```rust
// Agent context automatically flows to MCP
let agent_context = context_store.get_agent_context(agent_id).await?;
let mcp_context = ContextEntry::new_json(
    format!("agent://{}", agent_id),
    Some("Agent Context".to_string()),
    serde_json::to_value(&agent_context)?
);
```

### 2. Cloud Connector Integration

```rust
// Cloud discovery results are exposed as MCP tools
async fn handle_discover_aws_resources(&self, arguments: &serde_json::Value) -> Result<serde_json::Value, McpError> {
    let mut connector_manager = self.connector_manager.write().await;
    let connector_id = connector_manager.create_aws_connector(aws_config).await?;
    let discovery_result = connector_manager.discover_aws_resources(&connector_id, resource_types).await?;
    
    Ok(serde_json::json!({
        "content": [{
            "type": "text",
            "text": serde_json::to_string_pretty(&discovery_result)?
        }]
    }))
}
```

### 3. Real-time Metrics

```rust
// Live agent metrics are exposed as MCP resources
match uri {
    "agents://metrics" => {
        let agents_count = self.context_store.get_active_agents_count().await?;
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
}
```

## Usage Examples

### 1. Discovering AWS Resources

```rust
let mut client = McpClient::new("migration-agent".to_string(), "1.0.0".to_string());
client.initialize().await?;

let discovery_args = serde_json::json!({
    "region": "us-east-1",
    "resource_types": ["ec2", "s3", "rds"],
    "credentials": {
        "access_key_id": "AKIA...",
        "secret_access_key": "..."
    }
});

let result = client.call_tool("discover_aws_resources", discovery_args).await?;
```

### 2. Building Rich Context

```rust
let context = ContextBuilder::new()
    .add_agent_context(&AgentContext {
        agent_id: "aws-discovery-agent".to_string(),
        agent_type: "aws".to_string(),
        session_id: session_id.clone(),
        capabilities: vec!["discover".to_string(), "analyze".to_string()],
        metadata: HashMap::new(),
    })
    .add_cloud_resource(&CloudResourceContext {
        provider: "aws".to_string(),
        region: "us-east-1".to_string(),
        resource_type: "ec2:instance".to_string(),
        resource_id: "i-1234567890abcdef0".to_string(),
        tags: tags_map,
        metadata: metadata_map,
    })
    .add_migration_context(&MigrationContext {
        project_id: "migration-project-123".to_string(),
        source_environment: source_env,
        target_environment: target_env,
        migration_phase: "assessment".to_string(),
        progress: 0.15,
    })
    .build();

client.provide_context(context).await?;
```

### 3. Using Prompts for Migration Planning

```rust
let migration_prompt_args = serde_json::json!({
    "name": "migration_plan",
    "arguments": {
        "source_provider": "aws",
        "target_provider": "azure",
        "resources": discovered_resources
    }
});

// This would typically be handled by an LLM integration
let prompt_response = client.call_tool("prompts/get", migration_prompt_args).await?;
```

## Configuration

### Server Configuration

```rust
use sirsi_core::mcp::{McpConfig, McpCapabilities};

let mcp_config = McpConfig {
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
    tools: vec![], // Populated automatically
    resources: vec![], // Populated automatically
};

let mcp_server = McpServer::new(mcp_config, context_store);
```

### Client Configuration

```rust
let client_info = ClientInfo {
    name: "Sirsi Migration Agent".to_string(),
    version: "1.0.0".to_string(),
    capabilities: ClientCapabilities {
        experimental: None,
        sampling: Some(SamplingCapabilities {}),
    },
};
```

## Error Handling

The MCP implementation uses standard JSON-RPC error codes:

```rust
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
```

## Testing

The MCP implementation includes comprehensive tests:

```bash
# Run MCP-specific tests
cargo test mcp

# Run integration tests with Redis
REDIS_URL=redis://localhost:6379 cargo test mcp::tests::test_server_integration

# Test MCP client functionality
cargo test mcp::client::tests
```

## Future Enhancements

### 1. Transport Layer
- WebSocket transport for real-time communication
- HTTP/2 transport for high-performance scenarios
- Unix domain sockets for local communication

### 2. Advanced Context
- Vector embeddings for semantic search
- Knowledge graph integration
- Temporal context for time-series data

### 3. Multi-Agent Coordination
- Agent-to-agent MCP communication
- Distributed context sharing
- Cross-agent tool invocation

### 4. Security
- Authentication and authorization
- Context encryption
- Audit logging

## Standards Compliance

This implementation follows the Model Context Protocol specification:
- Protocol version: 2024-11-05
- JSON-RPC 2.0 compliance
- Standard message formats
- Error handling patterns
- Capability negotiation

## Performance Considerations

### 1. Context Size Management
- Context entries are limited to reasonable sizes
- Large resources are referenced, not embedded
- Streaming for large datasets

### 2. Caching
- Tool results are cached when appropriate
- Resource metadata is cached
- Context entries have TTL

### 3. Concurrency
- Async/await throughout
- Connection pooling for external services
- Rate limiting for API calls

The MCP implementation in Sirsi Nexus provides a robust foundation for AI agent context management, enabling sophisticated cloud migration and optimization workflows with standardized, extensible interfaces.
