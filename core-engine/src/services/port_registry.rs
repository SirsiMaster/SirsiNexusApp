/// Port Registry Service - Centralized Port Management
/// 
/// This service manages port allocation for all SirsiNexus services to prevent
/// conflicts and enable dynamic service discovery.

use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use tokio::sync::RwLock;
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use tracing::{info, warn, error};

/// Port allocation request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortRequest {
    pub service_name: String,
    pub service_type: ServiceType,
    pub preferred_port: Option<u16>,
    pub port_range: Option<PortRange>,
    pub required: bool, // If true, service must get a port or fail
}

/// Service type for port allocation strategy
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ServiceType {
    RestApi,
    WebSocket,
    GrpcService,
    Database,
    Cache,
    Analytics,
    Security,
    Monitor,
    LoadBalancer,
    Frontend,
    AI,
    Infrastructure,
    Financial,
    Custom(String),
}
/// Port range specification
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortRange {
    pub start: u16,
    pub end: u16,
}

/// Allocated port information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortAllocation {
    pub port: u16,
    pub service_name: String,
    pub service_type: ServiceType,
    pub allocation_id: String,
    pub allocated_at: DateTime<Utc>,
    pub last_heartbeat: DateTime<Utc>,
    pub status: AllocationStatus,
    pub process_id: Option<u32>,
    pub host: String,
}

/// Status of port allocation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AllocationStatus {
    Reserved,   // Port reserved but service not started
    Active,     // Service is running on this port
    Inactive,   // Service stopped but port still allocated
    Expired,    // Allocation expired due to no heartbeat
}

/// Port registry service
#[derive(Debug)]
pub struct PortRegistry {
    /// Current port allocations
    allocations: Arc<RwLock<HashMap<u16, PortAllocation>>>,
    
    /// Service name to port mapping
    service_ports: Arc<RwLock<HashMap<String, u16>>>,
    
    /// Reserved ports that should not be allocated
    reserved_ports: HashSet<u16>,
    
    /// Default port ranges for different service types
    service_ranges: HashMap<ServiceType, PortRange>,
    
    /// Heartbeat timeout in seconds
    heartbeat_timeout: u64,
}

impl Default for PortRange {
    fn default() -> Self {
        Self {
            start: 8000,
            end: 9000,
        }
    }
}

impl PortRegistry {
    /// Create a new port registry
    pub fn new() -> Self {
        let mut reserved_ports = HashSet::new();
        
        // Reserve system and commonly used ports
        reserved_ports.extend(vec![
            22, 25, 53, 80, 110, 143, 443, 993, 995, // System ports
            3000, 3001, // Common frontend ports
            5432, 5433, // PostgreSQL
            6379, 6380, // Redis
            26257, 26258, // CockroachDB
        ]);

        let mut service_ranges = HashMap::new();
        service_ranges.insert(ServiceType::RestApi, PortRange { start: 8080, end: 8099 });
        service_ranges.insert(ServiceType::GrpcService, PortRange { start: 50050, end: 50099 });
        service_ranges.insert(ServiceType::WebSocket, PortRange { start: 8100, end: 8199 });
        service_ranges.insert(ServiceType::Database, PortRange { start: 5400, end: 5499 });
        service_ranges.insert(ServiceType::Cache, PortRange { start: 6300, end: 6399 });
        service_ranges.insert(ServiceType::Analytics, PortRange { start: 8200, end: 8299 });
        service_ranges.insert(ServiceType::Security, PortRange { start: 8300, end: 8399 });
        service_ranges.insert(ServiceType::Frontend, PortRange { start: 3000, end: 3099 });
        service_ranges.insert(ServiceType::Infrastructure, PortRange { start: 8400, end: 8499 });
        service_ranges.insert(ServiceType::Financial, PortRange { start: 8500, end: 8599 });

        Self {
            allocations: Arc::new(RwLock::new(HashMap::new())),
            service_ports: Arc::new(RwLock::new(HashMap::new())),
            reserved_ports,
            service_ranges,
            heartbeat_timeout: 30, // 30 seconds
        }
    }

    /// Request a port allocation
    pub async fn request_port(&self, request: PortRequest) -> Result<PortAllocation, PortRegistryError> {
        info!("🔌 Port request for service '{}' (type: {:?})", request.service_name, request.service_type);

        let mut allocations = self.allocations.write().await;
        let mut service_ports = self.service_ports.write().await;

        // Check if service already has a port allocated
        if let Some(existing_port) = service_ports.get(&request.service_name) {
            if let Some(allocation) = allocations.get_mut(existing_port) {
                // Refresh existing allocation
                allocation.last_heartbeat = Utc::now();
                allocation.status = AllocationStatus::Active;
                info!("✅ Refreshed existing port {} for service '{}'", existing_port, request.service_name);
                return Ok(allocation.clone());
            }
        }

        // Try preferred port first
        if let Some(preferred) = request.preferred_port {
            if self.is_port_available(preferred, &allocations) {
                let allocation = self.create_allocation(preferred, request.clone())?;
                allocations.insert(preferred, allocation.clone());
                service_ports.insert(request.service_name.clone(), preferred);
                info!("✅ Allocated preferred port {} for service '{}'", preferred, request.service_name);
                return Ok(allocation);
            } else {
                warn!("⚠️ Preferred port {} not available for service '{}'", preferred, request.service_name);
                if request.required {
                    return Err(PortRegistryError::PreferredPortUnavailable(preferred));
                }
            }
        }

        // Find available port in range
        let port_range = request.port_range.as_ref()
            .or_else(|| self.service_ranges.get(&request.service_type))
            .cloned()
            .unwrap_or_default();

        for port in port_range.start..=port_range.end {
            if self.is_port_available(port, &allocations) {
                let allocation = self.create_allocation(port, request.clone())?;
                allocations.insert(port, allocation.clone());
                service_ports.insert(request.service_name.clone(), port);
                info!("✅ Allocated port {} for service '{}' in range {}..{}", 
                    port, request.service_name, port_range.start, port_range.end);
                return Ok(allocation);
            }
        }

        error!("❌ No available ports for service '{}' in range {}..{}", 
            request.service_name, port_range.start, port_range.end);
        Err(PortRegistryError::NoAvailablePorts(port_range))
    }

    /// Release a port allocation
    pub async fn release_port(&self, allocation_id: &str) -> Result<(), PortRegistryError> {
        let mut allocations = self.allocations.write().await;
        let mut service_ports = self.service_ports.write().await;

        // Find allocation by ID
        let (port, service_name) = allocations
            .iter()
            .find(|(_, alloc)| alloc.allocation_id == allocation_id)
            .map(|(port, alloc)| (*port, alloc.service_name.clone()))
            .ok_or_else(|| PortRegistryError::AllocationNotFound(allocation_id.to_string()))?;

        allocations.remove(&port);
        service_ports.remove(&service_name);

        info!("🔓 Released port {} for service '{}'", port, service_name);
        Ok(())
    }

    /// Send heartbeat to keep allocation alive
    pub async fn heartbeat(&self, allocation_id: &str) -> Result<(), PortRegistryError> {
        let mut allocations = self.allocations.write().await;

        for allocation in allocations.values_mut() {
            if allocation.allocation_id == allocation_id {
                allocation.last_heartbeat = Utc::now();
                allocation.status = AllocationStatus::Active;
                return Ok(());
            }
        }

        Err(PortRegistryError::AllocationNotFound(allocation_id.to_string()))
    }

    /// Get service discovery information
    pub async fn get_service_directory(&self) -> HashMap<String, PortAllocation> {
        let allocations = self.allocations.read().await;
        let mut directory = HashMap::new();

        for allocation in allocations.values() {
            if allocation.status == AllocationStatus::Active {
                directory.insert(allocation.service_name.clone(), allocation.clone());
            }
        }

        directory
    }

    /// Get allocation for a specific service
    pub async fn get_service_port(&self, service_name: &str) -> Option<PortAllocation> {
        let service_ports = self.service_ports.read().await;
        let allocations = self.allocations.read().await;

        if let Some(port) = service_ports.get(service_name) {
            allocations.get(port).cloned()
        } else {
            None
        }
    }

    /// Clean up expired allocations
    pub async fn cleanup_expired(&self) -> usize {
        let mut allocations = self.allocations.write().await;
        let mut service_ports = self.service_ports.write().await;
        let cutoff_time = Utc::now() - chrono::Duration::seconds(self.heartbeat_timeout as i64);

        let expired_ports: Vec<u16> = allocations
            .iter()
            .filter(|(_, alloc)| alloc.last_heartbeat < cutoff_time && alloc.status != AllocationStatus::Reserved)
            .map(|(port, _)| *port)
            .collect();

        let mut cleaned_count = 0;
        for port in expired_ports {
            if let Some(allocation) = allocations.remove(&port) {
                service_ports.remove(&allocation.service_name);
                cleaned_count += 1;
                warn!("🧹 Cleaned up expired allocation for port {} (service: {})", 
                    port, allocation.service_name);
            }
        }

        if cleaned_count > 0 {
            info!("🧹 Cleaned up {} expired port allocations", cleaned_count);
        }

        cleaned_count
    }

    /// Get registry statistics
    pub async fn get_stats(&self) -> RegistryStats {
        let allocations = self.allocations.read().await;
        
        let mut stats = RegistryStats {
            total_allocations: allocations.len(),
            active_allocations: 0,
            reserved_allocations: 0,
            inactive_allocations: 0,
            expired_allocations: 0,
            service_types: HashMap::new(),
        };

        for allocation in allocations.values() {
            match allocation.status {
                AllocationStatus::Active => stats.active_allocations += 1,
                AllocationStatus::Reserved => stats.reserved_allocations += 1,
                AllocationStatus::Inactive => stats.inactive_allocations += 1,
                AllocationStatus::Expired => stats.expired_allocations += 1,
            }

            *stats.service_types.entry(allocation.service_type.clone()).or_insert(0) += 1;
        }

        stats
    }

    /// Check if a port is available
    fn is_port_available(&self, port: u16, allocations: &HashMap<u16, PortAllocation>) -> bool {
        !self.reserved_ports.contains(&port) && !allocations.contains_key(&port)
    }

    /// Create a new port allocation
    fn create_allocation(&self, port: u16, request: PortRequest) -> Result<PortAllocation, PortRegistryError> {
        Ok(PortAllocation {
            port,
            service_name: request.service_name,
            service_type: request.service_type,
            allocation_id: Uuid::new_v4().to_string(),
            allocated_at: Utc::now(),
            last_heartbeat: Utc::now(),
            status: AllocationStatus::Reserved,
            process_id: None,
            host: hostname::get()
                .map_err(|_| PortRegistryError::HostnameError)?
                .to_string_lossy()
                .to_string(),
        })
    }
}

/// Registry statistics
#[derive(Debug, Serialize, Deserialize)]
pub struct RegistryStats {
    pub total_allocations: usize,
    pub active_allocations: usize,
    pub reserved_allocations: usize,
    pub inactive_allocations: usize,
    pub expired_allocations: usize,
    pub service_types: HashMap<ServiceType, usize>,
}

/// Port registry errors
#[derive(Debug, thiserror::Error)]
pub enum PortRegistryError {
    #[error("Preferred port {0} is not available")]
    PreferredPortUnavailable(u16),
    
    #[error("No available ports in range {0:?}")]
    NoAvailablePorts(PortRange),
    
    #[error("Allocation not found: {0}")]
    AllocationNotFound(String),
    
    #[error("Failed to get hostname")]
    HostnameError,
    
    #[error("Service type not supported")]
    UnsupportedServiceType,
}

impl std::fmt::Display for PortRange {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}..{}", self.start, self.end)
    }
}

impl ServiceType {
    pub fn as_str(&self) -> &str {
        match self {
            ServiceType::RestApi => "rest-api",
            ServiceType::GrpcService => "grpc",
            ServiceType::WebSocket => "websocket",
            ServiceType::Database => "database",
            ServiceType::Cache => "cache",
            ServiceType::Analytics => "analytics",
            ServiceType::Security => "security",
            ServiceType::Frontend => "frontend",
            ServiceType::Monitor => "monitor",
            ServiceType::LoadBalancer => "load-balancer",
            ServiceType::AI => "ai",
            ServiceType::Infrastructure => "infrastructure",
            ServiceType::Financial => "financial",
            ServiceType::Custom(name) => name,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_port_allocation() {
        let registry = PortRegistry::new();
        
        let request = PortRequest {
            service_name: "test-service".to_string(),
            service_type: ServiceType::RestApi,
            preferred_port: Some(8080),
            port_range: None,
            required: false,
        };

        let allocation = registry.request_port(request).await.unwrap();
        assert_eq!(allocation.port, 8080);
        assert_eq!(allocation.service_name, "test-service");
    }

    #[tokio::test]
    async fn test_port_conflict() {
        let registry = PortRegistry::new();
        
        let request1 = PortRequest {
            service_name: "service1".to_string(),
            service_type: ServiceType::RestApi,
            preferred_port: Some(8080),
            port_range: None,
            required: false,
        };

        let request2 = PortRequest {
            service_name: "service2".to_string(),
            service_type: ServiceType::RestApi,
            preferred_port: Some(8080),
            port_range: None,
            required: false,
        };

        let allocation1 = registry.request_port(request1).await.unwrap();
        assert_eq!(allocation1.port, 8080);

        let allocation2 = registry.request_port(request2).await.unwrap();
        assert_ne!(allocation2.port, 8080); // Should get different port
        assert!(allocation2.port >= 8080 && allocation2.port <= 8099); // Within range
    }

    #[tokio::test]
    async fn test_service_discovery() {
        let registry = PortRegistry::new();
        
        let request = PortRequest {
            service_name: "api-service".to_string(),
            service_type: ServiceType::RestApi,
            preferred_port: None,
            port_range: None,
            required: false,
        };

        let allocation = registry.request_port(request).await.unwrap();
        registry.heartbeat(&allocation.allocation_id).await.unwrap();

        let directory = registry.get_service_directory().await;
        assert!(directory.contains_key("api-service"));
    }
}
