# API & Integration Guide

## Table of Contents
1. [Authentication & Authorization](#authentication--authorization)
2. [gRPC APIs](#grpc-apis)
3. [REST APIs](#rest-apis)
4. [WebSocket APIs](#websocket-apis)
5. [Cloud Service Integrations](#cloud-service-integrations)
6. [Event Bus & Messaging](#event-bus--messaging)
7. [SDK & Client Libraries](#sdk--client-libraries)
8. [Integration Examples](#integration-examples)

## Authentication & Authorization

### OAuth2 Flow
```rust
// Client credentials flow
let token = oauth_client
    .exchange_client_credentials()
    .request_async(http_client)
    .await?;

// Authorization code flow
let auth_url = oauth_client
    .authorize_url(CsrfToken::new_random)
    .add_scope(Scope::new("read:agents"))
    .add_scope(Scope::new("write:tasks"))
    .url();
```

### JWT Token Validation
```rust
use jsonwebtoken::{decode, DecodingKey, Validation};

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: usize,
    iat: usize,
    scopes: Vec<String>,
}

pub fn validate_jwt(token: &str) -> Result<Claims, AuthError> {
    let key = DecodingKey::from_secret(JWT_SECRET.as_ref());
    let validation = Validation::default();
    
    decode::<Claims>(token, &key, &validation)
        .map(|token_data| token_data.claims)
        .map_err(|_| AuthError::InvalidToken)
}
```

### API Key Authentication
```bash
# Include API key in headers
curl -H "X-API-Key: your-api-key" \
     -H "Content-Type: application/json" \
     https://api.sirsinexus.com/v1/agents
```

## gRPC APIs

### Agent Service
```protobuf
service AgentService {
    rpc CreateAgent(CreateAgentRequest) returns (CreateAgentResponse);
    rpc GetAgent(GetAgentRequest) returns (GetAgentResponse);
    rpc ListAgents(ListAgentsRequest) returns (ListAgentsResponse);
    rpc UpdateAgent(UpdateAgentRequest) returns (UpdateAgentResponse);
    rpc DeleteAgent(DeleteAgentRequest) returns (DeleteAgentResponse);
    rpc ExecuteTask(ExecuteTaskRequest) returns (stream ExecuteTaskResponse);
}
```

### Task Service
```protobuf
service TaskService {
    rpc CreateTask(CreateTaskRequest) returns (CreateTaskResponse);
    rpc GetTask(GetTaskRequest) returns (GetTaskResponse);
    rpc ListTasks(ListTasksRequest) returns (ListTasksResponse);
    rpc CancelTask(CancelTaskRequest) returns (CancelTaskResponse);
    rpc GetTaskStatus(GetTaskStatusRequest) returns (GetTaskStatusResponse);
}
```

### Hypervisor Service
```protobuf
service HypervisorService {
    rpc CreateSession(CreateSessionRequest) returns (CreateSessionResponse);
    rpc GetSession(GetSessionRequest) returns (GetSessionResponse);
    rpc ListSessions(ListSessionsRequest) returns (ListSessionsResponse);
    rpc TerminateSession(TerminateSessionRequest) returns (TerminateSessionResponse);
    rpc GetSessionMetrics(GetSessionMetricsRequest) returns (GetSessionMetricsResponse);
}
```

### Client Example (Rust)
```rust
use tonic::transport::Channel;
use sirsi_core::proto::agent_service_client::AgentServiceClient;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let channel = Channel::from_static("http://localhost:50051").connect().await?;
    let mut client = AgentServiceClient::new(channel);
    
    let request = tonic::Request::new(CreateAgentRequest {
        name: "test-agent".to_string(),
        agent_type: "aws".to_string(),
        capabilities: vec!["ec2:describe".to_string()],
    });
    
    let response = client.create_agent(request).await?;
    println!("Created agent: {:?}", response.get_ref());
    
    Ok(())
}
```

## REST APIs

### Base URL
```
Production: https://api.sirsinexus.com
Development: http://localhost:8080
```

### Common Headers
```http
Content-Type: application/json
Authorization: Bearer <jwt-token>
X-API-Key: <api-key>
X-Request-ID: <unique-request-id>
```

### Agent Management
```http
# Create Agent
POST /v1/agents
{
    "name": "aws-agent-1",
    "agent_type": "aws",
    "capabilities": ["ec2:describe", "s3:list"],
    "configuration": {
        "region": "us-east-1",
        "instance_type": "t3.micro"
    }
}

# Get Agent
GET /v1/agents/{agent_id}

# List Agents
GET /v1/agents?page=1&limit=10&type=aws

# Update Agent
PUT /v1/agents/{agent_id}
{
    "name": "updated-agent",
    "capabilities": ["ec2:describe", "s3:list", "rds:describe"]
}

# Delete Agent
DELETE /v1/agents/{agent_id}
```

### Task Management
```http
# Create Task
POST /v1/tasks
{
    "agent_id": "agent-123",
    "task_type": "security_audit",
    "parameters": {
        "target": "vpc-12345",
        "compliance_framework": "SOC2"
    },
    "priority": "high"
}

# Get Task Status
GET /v1/tasks/{task_id}/status

# Cancel Task
DELETE /v1/tasks/{task_id}
```

### Session Management
```http
# Create Session
POST /v1/sessions
{
    "agents": ["agent-123", "agent-456"],
    "session_type": "collaborative",
    "timeout": 3600
}

# Get Session
GET /v1/sessions/{session_id}

# List Sessions
GET /v1/sessions?status=active&page=1&limit=10
```

## WebSocket APIs

### Connection
```javascript
const ws = new WebSocket('ws://localhost:8080/v1/ws');

ws.onopen = function() {
    // Send authentication
    ws.send(JSON.stringify({
        type: 'auth',
        token: 'your-jwt-token'
    }));
};
```

### Event Types
```typescript
interface WebSocketMessage {
    type: 'task_update' | 'agent_status' | 'session_event' | 'error';
    data: any;
    timestamp: string;
}

// Task Update
{
    type: 'task_update',
    data: {
        task_id: 'task-123',
        status: 'completed',
        progress: 100,
        result: { /* task result */ }
    }
}

// Agent Status
{
    type: 'agent_status',
    data: {
        agent_id: 'agent-123',
        status: 'running',
        cpu_usage: 45.2,
        memory_usage: 67.8
    }
}
```

## Cloud Service Integrations

### AWS Integration
```rust
use aws_sdk_ec2::Client as Ec2Client;
use aws_sdk_s3::Client as S3Client;

pub struct AwsAgent {
    ec2_client: Ec2Client,
    s3_client: S3Client,
    region: String,
}

impl AwsAgent {
    pub async fn new(region: &str) -> Result<Self, AwsError> {
        let config = aws_config::load_from_env().await;
        let ec2_client = Ec2Client::new(&config);
        let s3_client = S3Client::new(&config);
        
        Ok(Self {
            ec2_client,
            s3_client,
            region: region.to_string(),
        })
    }
    
    pub async fn describe_instances(&self) -> Result<Vec<Instance>, AwsError> {
        let resp = self.ec2_client
            .describe_instances()
            .send()
            .await?;
            
        // Process response
        Ok(instances)
    }
}
```

### Azure Integration
```rust
use azure_mgmt_compute::Client as ComputeClient;
use azure_mgmt_storage::Client as StorageClient;

pub struct AzureAgent {
    compute_client: ComputeClient,
    storage_client: StorageClient,
    subscription_id: String,
}

impl AzureAgent {
    pub async fn new(subscription_id: &str) -> Result<Self, AzureError> {
        let credential = DefaultAzureCredential::default();
        let compute_client = ComputeClient::new(credential.clone());
        let storage_client = StorageClient::new(credential);
        
        Ok(Self {
            compute_client,
            storage_client,
            subscription_id: subscription_id.to_string(),
        })
    }
    
    pub async fn list_virtual_machines(&self) -> Result<Vec<VirtualMachine>, AzureError> {
        let vms = self.compute_client
            .virtual_machines()
            .list(&self.subscription_id)
            .await?;
            
        Ok(vms)
    }
}
```

### GCP Integration
```rust
use google_cloud_compute::Client as ComputeClient;
use google_cloud_storage::Client as StorageClient;

pub struct GcpAgent {
    compute_client: ComputeClient,
    storage_client: StorageClient,
    project_id: String,
}

impl GcpAgent {
    pub async fn new(project_id: &str) -> Result<Self, GcpError> {
        let compute_client = ComputeClient::new().await?;
        let storage_client = StorageClient::new().await?;
        
        Ok(Self {
            compute_client,
            storage_client,
            project_id: project_id.to_string(),
        })
    }
    
    pub async fn list_instances(&self) -> Result<Vec<Instance>, GcpError> {
        let instances = self.compute_client
            .instances()
            .list(&self.project_id, "us-central1-a")
            .await?;
            
        Ok(instances)
    }
}
```

## Event Bus & Messaging

### Redis Event Bus
```rust
use redis::AsyncCommands;

pub struct EventBus {
    connection: redis::aio::Connection,
}

impl EventBus {
    pub async fn publish(&mut self, channel: &str, message: &str) -> Result<(), EventBusError> {
        self.connection
            .publish::<_, _, ()>(channel, message)
            .await
            .map_err(EventBusError::Redis)
    }
    
    pub async fn subscribe(&mut self, channels: &[&str]) -> Result<(), EventBusError> {
        let mut pubsub = self.connection.as_pubsub();
        
        for channel in channels {
            pubsub.subscribe(channel).await?;
        }
        
        Ok(())
    }
}
```

### Event Types
```rust
#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Event {
    TaskCreated {
        task_id: String,
        agent_id: String,
        timestamp: DateTime<Utc>,
    },
    TaskCompleted {
        task_id: String,
        result: serde_json::Value,
        timestamp: DateTime<Utc>,
    },
    AgentStatusChanged {
        agent_id: String,
        old_status: AgentStatus,
        new_status: AgentStatus,
        timestamp: DateTime<Utc>,
    },
    SessionCreated {
        session_id: String,
        agents: Vec<String>,
        timestamp: DateTime<Utc>,
    },
}
```

## SDK & Client Libraries

### Rust SDK
```toml
[dependencies]
sirsi-client = "0.1.0"
tokio = { version = "1.0", features = ["full"] }
```

```rust
use sirsi_client::{SirsiClient, CreateAgentRequest};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = SirsiClient::new("http://localhost:50051").await?;
    
    let agent = client.create_agent(CreateAgentRequest {
        name: "test-agent".to_string(),
        agent_type: "aws".to_string(),
        capabilities: vec!["ec2:describe".to_string()],
    }).await?;
    
    println!("Created agent: {:?}", agent);
    Ok(())
}
```

### Python SDK
```python
import asyncio
from sirsi_client import SirsiClient

async def main():
    client = SirsiClient("http://localhost:50051")
    
    agent = await client.create_agent(
        name="test-agent",
        agent_type="aws",
        capabilities=["ec2:describe"]
    )
    
    print(f"Created agent: {agent}")

if __name__ == "__main__":
    asyncio.run(main())
```

### JavaScript SDK
```javascript
const { SirsiClient } = require('@sirsi/client');

const client = new SirsiClient('http://localhost:50051');

async function createAgent() {
    const agent = await client.createAgent({
        name: 'test-agent',
        agentType: 'aws',
        capabilities: ['ec2:describe']
    });
    
    console.log('Created agent:', agent);
}

createAgent().catch(console.error);
```

## Integration Examples

### Multi-Cloud Security Audit
```rust
use sirsi_client::SirsiClient;

async fn security_audit_example() -> Result<(), Box<dyn std::error::Error>> {
    let client = SirsiClient::new("http://localhost:50051").await?;
    
    // Create agents for each cloud provider
    let aws_agent = client.create_agent(CreateAgentRequest {
        name: "aws-security-agent".to_string(),
        agent_type: "aws".to_string(),
        capabilities: vec![
            "ec2:describe".to_string(),
            "s3:list".to_string(),
            "iam:list".to_string(),
        ],
    }).await?;
    
    let azure_agent = client.create_agent(CreateAgentRequest {
        name: "azure-security-agent".to_string(),
        agent_type: "azure".to_string(),
        capabilities: vec![
            "compute:read".to_string(),
            "storage:read".to_string(),
            "iam:read".to_string(),
        ],
    }).await?;
    
    // Create collaborative session
    let session = client.create_session(CreateSessionRequest {
        agents: vec![aws_agent.id, azure_agent.id],
        session_type: "collaborative".to_string(),
        timeout: 3600,
    }).await?;
    
    // Execute security audit tasks
    let aws_task = client.create_task(CreateTaskRequest {
        agent_id: aws_agent.id,
        task_type: "security_audit".to_string(),
        parameters: json!({
            "compliance_framework": "SOC2",
            "scope": "vpc-12345"
        }),
        priority: "high".to_string(),
    }).await?;
    
    let azure_task = client.create_task(CreateTaskRequest {
        agent_id: azure_agent.id,
        task_type: "security_audit".to_string(),
        parameters: json!({
            "compliance_framework": "SOC2",
            "scope": "resource-group-123"
        }),
        priority: "high".to_string(),
    }).await?;
    
    // Monitor task completion
    let aws_result = client.wait_for_task_completion(&aws_task.id).await?;
    let azure_result = client.wait_for_task_completion(&azure_task.id).await?;
    
    println!("AWS audit result: {:?}", aws_result);
    println!("Azure audit result: {:?}", azure_result);
    
    Ok(())
}
```

### Cost Optimization Pipeline
```rust
async fn cost_optimization_pipeline() -> Result<(), Box<dyn std::error::Error>> {
    let client = SirsiClient::new("http://localhost:50051").await?;
    
    // Create cost analysis agent
    let cost_agent = client.create_agent(CreateAgentRequest {
        name: "cost-optimizer".to_string(),
        agent_type: "multi_cloud".to_string(),
        capabilities: vec![
            "cost:analyze".to_string(),
            "resource:optimize".to_string(),
            "billing:read".to_string(),
        ],
    }).await?;
    
    // Analyze costs across all clouds
    let analysis_task = client.create_task(CreateTaskRequest {
        agent_id: cost_agent.id,
        task_type: "cost_analysis".to_string(),
        parameters: json!({
            "time_range": "last_30_days",
            "include_projections": true,
            "optimization_threshold": 0.15
        }),
        priority: "medium".to_string(),
    }).await?;
    
    let analysis_result = client.wait_for_task_completion(&analysis_task.id).await?;
    
    // Generate optimization recommendations
    let optimization_task = client.create_task(CreateTaskRequest {
        agent_id: cost_agent.id,
        task_type: "generate_optimizations".to_string(),
        parameters: json!({
            "analysis_data": analysis_result.data,
            "risk_tolerance": "low",
            "approval_required": true
        }),
        priority: "medium".to_string(),
    }).await?;
    
    let recommendations = client.wait_for_task_completion(&optimization_task.id).await?;
    
    println!("Cost optimization recommendations: {:?}", recommendations);
    
    Ok(())
}
```

### Compliance Monitoring
```rust
async fn compliance_monitoring() -> Result<(), Box<dyn std::error::Error>> {
    let client = SirsiClient::new("http://localhost:50051").await?;
    
    // Create compliance monitoring agent
    let compliance_agent = client.create_agent(CreateAgentRequest {
        name: "compliance-monitor".to_string(),
        agent_type: "compliance".to_string(),
        capabilities: vec![
            "audit:read".to_string(),
            "policy:evaluate".to_string(),
            "report:generate".to_string(),
        ],
    }).await?;
    
    // Set up continuous monitoring
    let monitoring_task = client.create_task(CreateTaskRequest {
        agent_id: compliance_agent.id,
        task_type: "continuous_monitoring".to_string(),
        parameters: json!({
            "frameworks": ["SOC2", "HIPAA", "PCI-DSS"],
            "check_interval": "1h",
            "alert_threshold": "medium"
        }),
        priority: "high".to_string(),
    }).await?;
    
    // Subscribe to compliance events
    let mut event_stream = client.subscribe_to_events(&[
        "compliance.violation",
        "compliance.policy_change",
        "compliance.audit_complete"
    ]).await?;
    
    while let Some(event) = event_stream.next().await {
        match event.event_type.as_str() {
            "compliance.violation" => {
                println!("Compliance violation detected: {:?}", event.data);
                // Handle violation
            }
            "compliance.policy_change" => {
                println!("Policy change detected: {:?}", event.data);
                // Update monitoring
            }
            "compliance.audit_complete" => {
                println!("Audit completed: {:?}", event.data);
                // Process audit results
            }
            _ => {}
        }
    }
    
    Ok(())
}
```

## Error Handling

### Common Error Types
```rust
#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    #[error("Authentication failed: {0}")]
    Authentication(String),
    
    #[error("Authorization failed: {0}")]
    Authorization(String),
    
    #[error("Resource not found: {0}")]
    NotFound(String),
    
    #[error("Invalid request: {0}")]
    InvalidRequest(String),
    
    #[error("Rate limit exceeded")]
    RateLimit,
    
    #[error("Service unavailable")]
    ServiceUnavailable,
    
    #[error("Internal server error")]
    InternalError,
}
```

### Error Response Format
```json
{
    "error": {
        "code": "AUTHENTICATION_FAILED",
        "message": "Invalid JWT token",
        "details": {
            "timestamp": "2024-01-15T10:30:00Z",
            "request_id": "req-123456",
            "trace_id": "trace-789"
        }
    }
}
```

## Rate Limiting

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248600
X-RateLimit-Retry-After: 3600
```

### Rate Limit Handling
```rust
use std::time::Duration;
use tokio::time::sleep;

async fn handle_rate_limit(client: &SirsiClient) -> Result<(), ApiError> {
    loop {
        match client.make_request().await {
            Ok(response) => return Ok(response),
            Err(ApiError::RateLimit) => {
                println!("Rate limit exceeded, waiting...");
                sleep(Duration::from_secs(60)).await;
            }
            Err(e) => return Err(e),
        }
    }
}
```

## Testing

### Integration Tests
```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_agent_lifecycle() {
        let client = SirsiClient::new("http://localhost:50051").await.unwrap();
        
        // Create agent
        let agent = client.create_agent(CreateAgentRequest {
            name: "test-agent".to_string(),
            agent_type: "aws".to_string(),
            capabilities: vec!["ec2:describe".to_string()],
        }).await.unwrap();
        
        // Get agent
        let retrieved = client.get_agent(&agent.id).await.unwrap();
        assert_eq!(agent.id, retrieved.id);
        
        // Update agent
        let updated = client.update_agent(&agent.id, UpdateAgentRequest {
            name: Some("updated-agent".to_string()),
            capabilities: Some(vec!["ec2:describe".to_string(), "s3:list".to_string()]),
        }).await.unwrap();
        
        assert_eq!(updated.name, "updated-agent");
        assert_eq!(updated.capabilities.len(), 2);
        
        // Delete agent
        client.delete_agent(&agent.id).await.unwrap();
        
        // Verify deletion
        let result = client.get_agent(&agent.id).await;
        assert!(result.is_err());
    }
}
```

This comprehensive guide covers all API endpoints, authentication methods, cloud integrations, and practical examples for working with the SirsiNexus platform.
