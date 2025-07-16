/// Port Registry API Endpoints
/// 
/// REST API for port management and service discovery

use axum::{
    extract::{Path, Query},
    response::Json,
    http::StatusCode,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use uuid::Uuid;

use crate::services::port_registry::{
    PortRegistry, PortAllocation, RegistryStats,
    ServiceType, PortRange, PortRequest
};

// Type alias for service directory
type ServiceDirectory = std::collections::HashMap<String, PortAllocation>;
static mut PORT_REGISTRY: Option<Arc<PortRegistry>> = None;
static REGISTRY_INIT_ONCE: std::sync::Once = std::sync::Once::new();

/// Initialize the port registry
pub async fn init_port_registry() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    REGISTRY_INIT_ONCE.call_once(|| {
        // This will be set in the initialization
    });
    
    let registry = Arc::new(PortRegistry::new());
    
    // SAFETY: This is safe because we're using Once to ensure single initialization
    unsafe {
        PORT_REGISTRY = Some(registry);
    }
    
    tracing::info!("🔌 Port Registry initialized successfully");
    Ok(())
}

/// Get port registry instance
pub fn get_port_registry() -> Result<&'static Arc<PortRegistry>, String> {
    unsafe {
        PORT_REGISTRY.as_ref().ok_or_else(|| "Port registry not initialized".to_string())
    }
}

/// Request to allocate a port
#[derive(Debug, Serialize, Deserialize)]
pub struct PortAllocationRequest {
    pub service_name: String,
    pub service_type: String,
    pub preferred_port: Option<u16>,
    pub port_range: Option<PortRangeDto>,
    pub required: Option<bool>,
}

/// Port range DTO
#[derive(Debug, Serialize, Deserialize)]
pub struct PortRangeDto {
    pub start: u16,
    pub end: u16,
}

/// Response for port allocation
#[derive(Debug, Serialize, Deserialize)]
pub struct PortAllocationResponse {
    pub success: bool,
    pub allocation: Option<PortAllocation>,
    pub message: String,
}

/// Request to release a port
#[derive(Debug, Serialize, Deserialize)]
pub struct PortReleaseRequest {
    pub allocation_id: String,
}

/// Service discovery query parameters
#[derive(Debug, Deserialize)]
pub struct ServiceQuery {
    pub service_type: Option<String>,
    pub active_only: Option<bool>,
}

/// Allocate a port
pub async fn allocate_port(
    Json(payload): Json<PortAllocationRequest>,
) -> Result<Json<PortAllocationResponse>, (StatusCode, String)> {
    
    let registry = get_port_registry()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;
    
    // Parse service type
    let service_type = match payload.service_type.as_str() {
        "rest-api" => ServiceType::RestApi,
        "grpc" => ServiceType::GrpcService,
        "websocket" => ServiceType::WebSocket,
        "database" => ServiceType::Database,
        "cache" => ServiceType::Cache,
        "analytics" => ServiceType::Analytics,
        "security" => ServiceType::Security,
        "frontend" => ServiceType::Frontend,
        custom => ServiceType::Custom(custom.to_string()),
    };
    
    let port_range = payload.port_range.map(|r| PortRange {
        start: r.start,
        end: r.end,
    });
    
    let request = PortRequest {
        service_name: payload.service_name,
        service_type,
        preferred_port: payload.preferred_port,
        port_range,
        required: payload.required.unwrap_or(false),
    };
    
    match registry.request_port(request).await {
        Ok(allocation) => {
            tracing::info!("✅ Port {} allocated for service '{}'", 
                allocation.port, allocation.service_name);
            
            Ok(Json(PortAllocationResponse {
                success: true,
                allocation: Some(allocation),
                message: "Port allocated successfully".to_string(),
            }))
        }
        Err(e) => {
            tracing::error!("❌ Port allocation failed: {}", e);
            Ok(Json(PortAllocationResponse {
                success: false,
                allocation: None,
                message: format!("Port allocation failed: {}", e),
            }))
        }
    }
}

/// Release a port allocation
pub async fn release_port(
    Json(payload): Json<PortReleaseRequest>,
) -> Result<Json<HashMap<String, String>>, (StatusCode, String)> {
    
    let registry = get_port_registry()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;
    
    match registry.release_port(&payload.allocation_id).await {
        Ok(()) => {
            tracing::info!("✅ Port allocation {} released", payload.allocation_id);
            
            let mut response = HashMap::new();
            response.insert("success".to_string(), "true".to_string());
            response.insert("message".to_string(), "Port released successfully".to_string());
            Ok(Json(response))
        }
        Err(e) => {
            tracing::error!("❌ Port release failed: {}", e);
            Err((StatusCode::BAD_REQUEST, format!("Port release failed: {}", e)))
        }
    }
}

/// Send heartbeat for an allocation
pub async fn heartbeat(
    Path(allocation_id): Path<String>,
) -> Result<Json<HashMap<String, String>>, (StatusCode, String)> {
    
    let registry = get_port_registry()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;
    
    match registry.heartbeat(&allocation_id).await {
        Ok(()) => {
            let mut response = HashMap::new();
            response.insert("success".to_string(), "true".to_string());
            response.insert("message".to_string(), "Heartbeat successful".to_string());
            Ok(Json(response))
        }
        Err(e) => {
            tracing::error!("❌ Heartbeat failed for {}: {}", allocation_id, e);
            Err((StatusCode::NOT_FOUND, format!("Heartbeat failed: {}", e)))
        }
    }
}

/// Get service directory
pub async fn get_service_directory(
    Query(params): Query<ServiceQuery>,
) -> Result<Json<HashMap<String, PortAllocation>>, (StatusCode, String)> {
    
    let registry = get_port_registry()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;
    
    let mut directory = registry.get_service_directory().await;
    
    // Filter by service type if specified
    if let Some(service_type) = params.service_type {
        directory.retain(|_, allocation| {
            allocation.service_type.as_str() == service_type
        });
    }
    
    tracing::info!("📋 Service directory requested - {} services found", directory.len());
    
    Ok(Json(directory))
}

/// Get specific service port
pub async fn get_service_port(
    Path(service_name): Path<String>,
) -> Result<Json<Option<PortAllocation>>, (StatusCode, String)> {
    
    let registry = get_port_registry()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;
    
    let allocation = registry.get_service_port(&service_name).await;
    
    if let Some(ref alloc) = allocation {
        tracing::info!("🔍 Service '{}' found on port {}", service_name, alloc.port);
    } else {
        tracing::warn!("🔍 Service '{}' not found in registry", service_name);
    }
    
    Ok(Json(allocation))
}

/// Get registry statistics
pub async fn get_registry_stats() -> Result<Json<RegistryStats>, (StatusCode, String)> {
    
    let registry = get_port_registry()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;
    
    let stats = registry.get_stats().await;
    
    tracing::info!("📊 Registry stats: {} total, {} active allocations", 
        stats.total_allocations, stats.active_allocations);
    
    Ok(Json(stats))
}

/// Cleanup expired allocations
pub async fn cleanup_expired() -> Result<Json<HashMap<String, String>>, (StatusCode, String)> {
    
    let registry = get_port_registry()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;
    
    let cleaned_count = registry.cleanup_expired().await;
    
    let mut response = HashMap::new();
    response.insert("success".to_string(), "true".to_string());
    response.insert("cleaned_count".to_string(), cleaned_count.to_string());
    response.insert("message".to_string(), format!("Cleaned up {} expired allocations", cleaned_count));
    
    tracing::info!("🧹 Cleanup completed - {} expired allocations removed", cleaned_count);
    
    Ok(Json(response))
}

/// Get registry health status
pub async fn get_registry_health() -> Result<Json<HashMap<String, String>>, (StatusCode, String)> {
    
    let registry = get_port_registry()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;
    
    let stats = registry.get_stats().await;
    
    let mut health = HashMap::new();
    health.insert("status".to_string(), "healthy".to_string());
    health.insert("total_allocations".to_string(), stats.total_allocations.to_string());
    health.insert("active_allocations".to_string(), stats.active_allocations.to_string());
    health.insert("reserved_allocations".to_string(), stats.reserved_allocations.to_string());
    
    // Health check based on allocation ratios
    let health_status = if stats.total_allocations == 0 {
        "no_allocations"
    } else if stats.active_allocations as f64 / stats.total_allocations as f64 > 0.8 {
        "healthy"
    } else if stats.active_allocations as f64 / stats.total_allocations as f64 > 0.5 {
        "warning"
    } else {
        "critical"
    };
    
    health.insert("health_status".to_string(), health_status.to_string());
    health.insert("version".to_string(), "1.0.0".to_string());
    
    Ok(Json(health))
}

/// Get comprehensive port and service overview
#[derive(Debug, Serialize, Deserialize)]
pub struct PortOverview {
    pub total_ports: usize,
    pub active_services: usize,
    pub port_allocations: HashMap<String, PortAllocation>,
    pub port_usage: HashMap<u16, String>, // port -> service_name
    pub service_types: HashMap<String, Vec<String>>, // service_type -> [service_names]
    pub registry_stats: RegistryStats,
}

/// Get complete port and service overview
pub async fn get_port_overview() -> Result<Json<PortOverview>, (StatusCode, String)> {
    
    let registry = get_port_registry()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;
    
    let directory = registry.get_service_directory().await;
    let stats = registry.get_stats().await;
    
    // Build port usage map
    let mut port_usage = HashMap::new();
    for (service_name, allocation) in &directory {
        port_usage.insert(allocation.port, service_name.clone());
    }
    
    // Build service types map
    let mut service_types: HashMap<String, Vec<String>> = HashMap::new();
    for (service_name, allocation) in &directory {
        service_types
            .entry(allocation.service_type.as_str().to_string())
            .or_insert_with(Vec::new)
            .push(service_name.clone());
    }
    
    let overview = PortOverview {
        total_ports: directory.len(),
        active_services: directory.len(),
        port_allocations: directory,
        port_usage,
        service_types,
        registry_stats: stats,
    };
    
    tracing::info!("📊 Port overview requested - {} services, {} ports in use", 
        overview.active_services, overview.total_ports);
    
    Ok(Json(overview))
}

/// Get port by ID
pub async fn get_port_by_id(
    Path(port_id): Path<u16>,
) -> Result<Json<Option<PortAllocation>>, (StatusCode, String)> {
    
    let registry = get_port_registry()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;
    
    let directory = registry.get_service_directory().await;
    
    // Find allocation by port
    let allocation = directory.values()
        .find(|allocation| allocation.port == port_id)
        .cloned();
    
    if let Some(ref alloc) = allocation {
        tracing::info!("🔍 Port {} found - service: {}", port_id, alloc.service_name);
    } else {
        tracing::warn!("🔍 Port {} not found in registry", port_id);
    }
    
    Ok(Json(allocation))
}

/// Get all services by type
pub async fn get_services_by_type(
    Path(service_type): Path<String>,
) -> Result<Json<HashMap<String, PortAllocation>>, (StatusCode, String)> {
    
    let registry = get_port_registry()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;
    
    let directory = registry.get_service_directory().await;
    
    // Filter by service type
    let filtered: HashMap<String, PortAllocation> = directory.into_iter()
        .filter(|(_, allocation)| allocation.service_type.as_str() == service_type)
        .collect();
    
    tracing::info!("🔍 Found {} services of type '{}'", filtered.len(), service_type);
    
    Ok(Json(filtered))
}

/// List available port ranges
pub async fn get_port_ranges() -> Result<Json<HashMap<String, PortRangeDto>>, (StatusCode, String)> {
    
    let mut ranges = HashMap::new();
    ranges.insert("rest-api".to_string(), PortRangeDto { start: 8080, end: 8099 });
    ranges.insert("grpc".to_string(), PortRangeDto { start: 50050, end: 50099 });
    ranges.insert("websocket".to_string(), PortRangeDto { start: 8100, end: 8199 });
    ranges.insert("database".to_string(), PortRangeDto { start: 5400, end: 5499 });
    ranges.insert("cache".to_string(), PortRangeDto { start: 6300, end: 6399 });
    ranges.insert("analytics".to_string(), PortRangeDto { start: 8200, end: 8299 });
    ranges.insert("security".to_string(), PortRangeDto { start: 8300, end: 8399 });
    ranges.insert("frontend".to_string(), PortRangeDto { start: 3000, end: 3099 });
    
    Ok(Json(ranges))
}
