# ClusterDB API Documentation

This documentation provides comprehensive information about the ClusterDB APIs, including REST, gRPC, and CLI interfaces.

## Overview

ClusterDB provides multiple API interfaces:
- RESTful HTTP API
- gRPC API
- Command Line Interface (CLI)

## API Versions

- Current: v1
- Beta: v2beta1
- Legacy: v0 (deprecated)

## Authentication

### API Key Authentication

```bash
# Header format
Authorization: Bearer <api_key>

# Example
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  https://api.clusterdb.io/v1/clusters
```

### OAuth2/OIDC

```bash
# Get token
TOKEN=$(curl -X POST https://auth.clusterdb.io/oauth/token \
  -d "grant_type=client_credentials" \
  -d "client_id=${CLIENT_ID}" \
  -d "client_secret=${CLIENT_SECRET}")

# Use token
curl -H "Authorization: Bearer ${TOKEN}" \
  https://api.clusterdb.io/v1/clusters
```

## REST API

### Base URL

```
https://api.clusterdb.io/v1
```

### Endpoints

#### Compute Management

```http
# Fleets
GET     /fleets
POST    /fleets
GET     /fleets/{id}
PUT     /fleets/{id}
DELETE  /fleets/{id}

# Instances
GET     /instances
POST    /instances
GET     /instances/{id}
PUT     /instances/{id}
DELETE  /instances/{id}
POST    /instances/{id}/start
POST    /instances/{id}/stop

# Functions
GET     /functions
POST    /functions
GET     /functions/{id}
PUT     /functions/{id}
DELETE  /functions/{id}
POST    /functions/{id}/invoke
```

#### Service Mesh

```http
# Virtual Services
GET     /mesh/virtual-services
POST    /mesh/virtual-services
GET     /mesh/virtual-services/{id}
PUT     /mesh/virtual-services/{id}
DELETE  /mesh/virtual-services/{id}

# Security Policies
GET     /mesh/security-policies
POST    /mesh/security-policies
GET     /mesh/security-policies/{id}
PUT     /mesh/security-policies/{id}
DELETE  /mesh/security-policies/{id}
```

#### Identity Management

```http
# Users
GET     /users
POST    /users
GET     /users/{id}
PUT     /users/{id}
DELETE  /users/{id}

# Groups
GET     /groups
POST    /groups
GET     /groups/{id}
PUT     /groups/{id}
DELETE  /groups/{id}
```

### Request Format

```http
POST /v1/fleets HTTP/1.1
Host: api.clusterdb.io
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "web-fleet",
  "description": "Web application fleet",
  "capacity": 3,
  "instance_type": "t3.medium",
  "tags": {
    "environment": "production"
  }
}
```

### Response Format

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "fleet-123",
  "name": "web-fleet",
  "description": "Web application fleet",
  "capacity": 3,
  "instance_type": "t3.medium",
  "status": "active",
  "created_at": "2025-06-25T04:00:00Z",
  "tags": {
    "environment": "production"
  }
}
```

### Error Format

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid fleet configuration",
    "details": {
      "field": "capacity",
      "reason": "must be greater than 0"
    }
  }
}
```

## gRPC API

### Service Definitions

```protobuf
// compute.proto
service ComputeService {
  rpc CreateFleet(CreateFleetRequest) returns (Fleet);
  rpc GetFleet(GetFleetRequest) returns (Fleet);
  rpc UpdateFleet(UpdateFleetRequest) returns (Fleet);
  rpc DeleteFleet(DeleteFleetRequest) returns (google.protobuf.Empty);
  rpc ListFleets(ListFleetsRequest) returns (ListFleetsResponse);
}

// mesh.proto
service MeshService {
  rpc ApplyVirtualService(ApplyVirtualServiceRequest) returns (VirtualService);
  rpc GetVirtualService(GetVirtualServiceRequest) returns (VirtualService);
  rpc DeleteVirtualService(DeleteVirtualServiceRequest) returns (google.protobuf.Empty);
  rpc ListVirtualServices(ListVirtualServicesRequest) returns (ListVirtualServicesResponse);
}
```

### Message Types

```protobuf
message Fleet {
  string id = 1;
  string name = 2;
  string description = 3;
  int32 capacity = 4;
  string instance_type = 5;
  FleetStatus status = 6;
  google.protobuf.Timestamp created_at = 7;
  map<string, string> tags = 8;
}

message VirtualService {
  string name = 1;
  string namespace = 2;
  repeated string hosts = 3;
  repeated string gateways = 4;
  repeated HttpRoute http_routes = 5;
}
```

### Using gRPC

```rust
use clusterdb::compute::v1::{ComputeServiceClient, CreateFleetRequest};

#[tokio::main]
async fn main() -> Result<()> {
    let channel = Channel::from_static("https://api.clusterdb.io")
        .connect()
        .await?;
    
    let mut client = ComputeServiceClient::new(channel);
    
    let request = CreateFleetRequest {
        name: "web-fleet".to_string(),
        description: "Web application fleet".to_string(),
        capacity: 3,
        instance_type: "t3.medium".to_string(),
        tags: HashMap::new(),
    };
    
    let response = client.create_fleet(request).await?;
    println!("Created fleet: {:?}", response);
}
```

## CLI

### Global Options

```bash
clusterdb [options] <command> [args]

Options:
  --config string    Config file (default "~/.clusterdb/config.yaml")
  --profile string   Configuration profile to use
  --debug           Enable debug logging
  --output string   Output format (json|yaml|table) (default "table")
```

### Command Groups

```bash
# Compute Management
clusterdb compute fleet create
clusterdb compute fleet list
clusterdb compute instance start
clusterdb compute instance stop

# Service Mesh
clusterdb mesh apply -f service.yaml
clusterdb mesh get virtual-service web-vs

# Identity Management
clusterdb identity user create
clusterdb identity group list

# Monitoring
clusterdb monitor metrics
clusterdb monitor alerts
```

### Examples

```bash
# Create a fleet
clusterdb compute fleet create \
  --name web-fleet \
  --capacity 3 \
  --instance-type t3.medium \
  --tag environment=production

# Configure service mesh
clusterdb mesh apply -f virtual-service.yaml

# View metrics
clusterdb monitor metrics \
  --service web-service \
  --window 1h
```

## Webhooks

### Event Types

```typescript
interface Event {
  id: string;
  type: EventType;
  data: any;
  timestamp: string;
}

enum EventType {
  FLEET_CREATED = "fleet.created",
  FLEET_UPDATED = "fleet.updated",
  FLEET_DELETED = "fleet.deleted",
  INSTANCE_STARTED = "instance.started",
  INSTANCE_STOPPED = "instance.stopped",
}
```

### Webhook Configuration

```yaml
webhooks:
  - url: https://example.com/webhook
    events:
      - fleet.created
      - fleet.updated
    secret: ${WEBHOOK_SECRET}
```

### Example Payload

```json
{
  "id": "evt_123",
  "type": "fleet.created",
  "data": {
    "fleet_id": "fleet-123",
    "name": "web-fleet",
    "capacity": 3
  },
  "timestamp": "2025-06-25T04:00:00Z"
}
```

## Rate Limiting

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1624608000

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "details": {
      "limit": 100,
      "reset": 1624608000
    }
  }
}
```

## Versioning

### API Version Header

```http
Accept: application/json;version=v1
```

### Version Lifecycle

1. **Alpha (v1alpha1)**
   - Early access
   - Breaking changes possible
   - Not for production use

2. **Beta (v1beta1)**
   - Feature complete
   - Minor breaking changes
   - Production use with caution

3. **Stable (v1)**
   - Production ready
   - No breaking changes
   - Long-term support

## SDK Support

### Official SDKs

- [Rust SDK](https://github.com/clusterdb/clusterdb-rust)
- [Python SDK](https://github.com/clusterdb/clusterdb-python)
- [Go SDK](https://github.com/clusterdb/clusterdb-go)
- [Node.js SDK](https://github.com/clusterdb/clusterdb-node)

### Community SDKs

- [Java SDK](https://github.com/community/clusterdb-java)
- [.NET SDK](https://github.com/community/clusterdb-dotnet)

## Support

- [API Issues](https://github.com/clusterdb/clusterdb/issues)
- [API Documentation](https://docs.clusterdb.io/api)
- [SDK Documentation](https://docs.clusterdb.io/sdk)
- [Community Support](https://slack.clusterdb.io)
