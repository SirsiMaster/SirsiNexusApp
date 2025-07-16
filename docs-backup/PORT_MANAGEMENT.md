# SirsiNexus Port Management System

## Overview

The SirsiNexus Port Management System provides centralized port allocation and service discovery for all platform services. It prevents port conflicts and enables dynamic service discovery.

## Features

- **Dynamic Port Allocation**: Automatically assigns ports to services
- **Service Discovery**: Find services by name, type, or port
- **Port Conflict Prevention**: Ensures no two services use the same port
- **Heartbeat Monitoring**: Tracks service health and availability
- **Comprehensive API**: REST endpoints for all operations
- **CLI Interface**: Command-line tools for management

## API Endpoints

### Port Management
- `POST /ports/allocate` - Allocate a port for a service
- `POST /ports/release` - Release a port allocation
- `POST /ports/heartbeat/:allocation_id` - Send heartbeat for an allocation
- `POST /ports/cleanup` - Clean up expired allocations

### Service Discovery
- `GET /ports/directory` - List all active services
- `GET /ports/service/:service_name` - Get service information by name
- `GET /ports/port/:port_id` - Get service information by port
- `GET /ports/type/:service_type` - Get all services of a specific type
- `GET /ports/overview` - Get comprehensive port and service overview

### Registry Information
- `GET /ports/stats` - Get registry statistics
- `GET /ports/health` - Get registry health status
- `GET /ports/ranges` - Get available port ranges

## CLI Commands

### Basic Usage
```bash
# Start SirsiNexus platform
sirsi-nexus start

# View all active ports and services
sirsi-nexus ports list

# Get comprehensive overview
sirsi-nexus ports overview

# Get service information by name
sirsi-nexus ports service my-service

# Get service information by port
sirsi-nexus ports port 8080

# Get all services of a specific type
sirsi-nexus ports type rest-api

# Get registry statistics
sirsi-nexus ports stats

# Get registry health
sirsi-nexus ports health
```

### Port Allocation
```bash
# Allocate a port for a service
sirsi-nexus ports allocate my-service rest-api

# Allocate with preferred port
sirsi-nexus ports allocate my-service rest-api --preferred-port 8080

# Allocate with required port (will fail if not available)
sirsi-nexus ports allocate my-service rest-api --preferred-port 8080 --required

# Release a port allocation
sirsi-nexus ports release allocation-id-here

# Send heartbeat for an allocation
sirsi-nexus ports heartbeat allocation-id-here

# Clean up expired allocations
sirsi-nexus ports cleanup
```

## Service Types

The system supports the following service types:

- **rest-api**: REST API services (ports 8080-8099)
- **grpc**: gRPC services (ports 50050-50099)
- **websocket**: WebSocket services (ports 8100-8199)
- **database**: Database services (ports 5400-5499)
- **cache**: Cache services (ports 6300-6399)
- **analytics**: Analytics services (ports 8200-8299)
- **security**: Security services (ports 8300-8399)
- **frontend**: Frontend services (ports 3000-3099)
- **custom**: Custom service types (flexible port ranges)

## API Usage Examples

### Allocate a Port
```bash
curl -X POST http://localhost:8080/ports/allocate \
  -H "Content-Type: application/json" \
  -d '{
    "service_name": "my-api",
    "service_type": "rest-api",
    "preferred_port": 8080,
    "required": false
  }'
```

Response:
```json
{
  "success": true,
  "allocation": {
    "port": 8080,
    "service_name": "my-api",
    "service_type": "rest-api",
    "allocation_id": "uuid-here",
    "allocated_at": "2025-01-07T12:00:00Z",
    "last_heartbeat": "2025-01-07T12:00:00Z",
    "status": "Active",
    "process_id": null,
    "host": "localhost"
  },
  "message": "Port allocated successfully"
}
```

### Get Service Directory
```bash
curl http://localhost:8080/ports/directory
```

Response:
```json
{
  "my-api": {
    "port": 8080,
    "service_name": "my-api",
    "service_type": "rest-api",
    "allocation_id": "uuid-here",
    "allocated_at": "2025-01-07T12:00:00Z",
    "last_heartbeat": "2025-01-07T12:00:00Z",
    "status": "Active",
    "process_id": null,
    "host": "localhost"
  }
}
```

### Get Port Overview
```bash
curl http://localhost:8080/ports/overview
```

Response:
```json
{
  "total_ports": 1,
  "active_services": 1,
  "port_allocations": {
    "my-api": {
      "port": 8080,
      "service_name": "my-api",
      "service_type": "rest-api",
      "allocation_id": "uuid-here",
      "allocated_at": "2025-01-07T12:00:00Z",
      "last_heartbeat": "2025-01-07T12:00:00Z",
      "status": "Active",
      "process_id": null,
      "host": "localhost"
    }
  },
  "port_usage": {
    "8080": "my-api"
  },
  "service_types": {
    "rest-api": ["my-api"]
  },
  "registry_stats": {
    "total_allocations": 1,
    "active_allocations": 1,
    "reserved_allocations": 0,
    "expired_allocations": 0,
    "service_types": {
      "rest-api": 1
    }
  }
}
```

### Send Heartbeat
```bash
curl -X POST http://localhost:8080/ports/heartbeat/allocation-id-here
```

Response:
```json
{
  "success": "true",
  "message": "Heartbeat successful"
}
```

### Release Port
```bash
curl -X POST http://localhost:8080/ports/release \
  -H "Content-Type: application/json" \
  -d '{
    "allocation_id": "uuid-here"
  }'
```

Response:
```json
{
  "success": "true",
  "message": "Port released successfully"
}
```

## Integration with SirsiNexus

The Port Registry is automatically initialized when the SirsiNexus platform starts. All platform services can use the registry for:

1. **Dynamic Port Assignment**: Services request ports during startup
2. **Service Discovery**: Services can find other services by name or type
3. **Health Monitoring**: Services send heartbeats to indicate they're alive
4. **Graceful Shutdown**: Services release ports when shutting down

## Configuration

The Port Registry can be configured with:

- **Heartbeat Timeout**: How long to wait before marking a service as expired
- **Reserved Ports**: Ports that should never be allocated
- **Service Ranges**: Default port ranges for different service types
- **Cleanup Interval**: How often to clean up expired allocations

## Security

The Port Registry includes security features:

- **CORS Support**: Proper CORS headers for web applications
- **Input Validation**: All inputs are validated for security
- **Rate Limiting**: Prevents abuse of the API
- **Authentication**: Can be integrated with SirsiNexus authentication

## Monitoring

The system provides comprehensive monitoring:

- **Registry Statistics**: Total, active, reserved, and expired allocations
- **Health Checks**: Overall registry health and status
- **Service Metrics**: Per-service type statistics
- **Heartbeat Tracking**: Service availability monitoring

## Future Enhancements

Planned features include:

- **Auto-scaling Integration**: Dynamic port allocation based on load
- **Multi-host Support**: Port allocation across multiple hosts
- **Load Balancing**: Port allocation strategies for load balancing
- **Service Mesh Integration**: Integration with service mesh technologies
- **Advanced Analytics**: Detailed analytics on port usage patterns
