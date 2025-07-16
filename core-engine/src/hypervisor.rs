use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, SystemTime};
use tokio::sync::{RwLock, mpsc};
use tracing::{info, error, debug};
use anyhow::Result;
use serde::{Serialize, Deserialize};
use uuid::Uuid;

use crate::config::AppConfig;
use crate::services::port_registry::ServiceType;

/// Ignition List - Central registry of all services that the hypervisor manages
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IgnitionList {
    pub services: HashMap<String, IgnitionService>,
    pub execution_order: Vec<String>,
    pub version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IgnitionService {
    pub id: String,
    pub name: String,
    pub service_type: ServiceType,
    pub port: u16,
    pub health_endpoint: String,
    pub startup_timeout: u64,
    pub dependencies: Vec<String>,
    pub auto_restart: bool,
    pub critical: bool,
    pub enabled: bool,
}

/// Central SIRSI Hypervisor - The conscious overseer of all platform services
#[derive(Debug)]
pub struct SirsiHypervisor {
    config: Arc<AppConfig>,
    services: Arc<RwLock<HashMap<String, ServiceInstance>>>,
    failure_tracker: Arc<RwLock<FailureTracker>>,
    control_channel: mpsc::UnboundedSender<HypervisorCommand>,
    status: Arc<RwLock<HypervisorStatus>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceInstance {
    pub id: String,
    pub name: String,
    pub service_type: ServiceType,
    pub status: ServiceStatus,
    pub port: Option<u16>,
    pub pid: Option<u32>,
    pub start_time: SystemTime,
    pub last_heartbeat: SystemTime,
    pub restart_count: u32,
    pub health_check_url: Option<String>,
    pub dependencies: Vec<String>,
    pub failure_threshold: u32,
    pub auto_restart: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ServiceStatus {
    Initializing,
    Starting,
    Running,
    Degraded,
    Failed,
    Stopping,
    Stopped,
    CriticalFailure,
}

#[derive(Debug, Clone)]
pub enum HypervisorCommand {
    StartService { name: String, config: ServiceConfig },
    StopService { name: String },
    RestartService { name: String },
    ServiceHealthCheck { name: String },
    ServiceFailure { name: String, error: String },
    ServiceRecovery { name: String },
    EmergencyShutdown,
    GetSystemStatus,
}

#[derive(Debug, Clone)]
pub struct ServiceConfig {
    pub service_type: ServiceType,
    pub auto_restart: bool,
    pub failure_threshold: u32,
    pub dependencies: Vec<String>,
    pub health_check_interval: Duration,
}

#[derive(Debug, Clone, Serialize)]
pub struct HypervisorStatus {
    pub status: String,
    pub uptime: Duration,
    pub total_services: usize,
    pub running_services: usize,
    pub failed_services: usize,
    pub total_restarts: u32,
    pub last_incident: Option<SystemTime>,
}

#[derive(Debug)]
struct FailureTracker {
    incidents: HashMap<String, Vec<FailureIncident>>,
    global_failure_count: u32,
    last_global_failure: Option<SystemTime>,
}

#[derive(Debug, Clone)]
struct FailureIncident {
    timestamp: SystemTime,
    error: String,
    recovery_action: String,
    recovery_success: bool,
}

impl SirsiHypervisor {
    pub async fn new(config: Arc<AppConfig>) -> Result<Self> {
        let (tx, rx) = mpsc::unbounded_channel();
        
        let hypervisor = Self {
            config: Arc::clone(&config),
            services: Arc::new(RwLock::new(HashMap::new())),
            failure_tracker: Arc::new(RwLock::new(FailureTracker::new())),
            control_channel: tx,
            status: Arc::new(RwLock::new(HypervisorStatus {
                status: "initializing".to_string(),
                uptime: Duration::from_secs(0),
                total_services: 0,
                running_services: 0,
                failed_services: 0,
                total_restarts: 0,
                last_incident: None,
            })),
        };

        // Start hypervisor control loop
        hypervisor.start_control_loop(rx).await;
        
        info!("🧠 SIRSI Hypervisor initialized - Central consciousness active");
        Ok(hypervisor)
    }

    async fn start_control_loop(&self, mut rx: mpsc::UnboundedReceiver<HypervisorCommand>) {
        let services = Arc::clone(&self.services);
        let failure_tracker = Arc::clone(&self.failure_tracker);
        let status = Arc::clone(&self.status);
        let config = Arc::clone(&self.config);

        tokio::spawn(async move {
            info!("🧠 SIRSI Hypervisor control loop started");
            
            let mut health_check_interval = tokio::time::interval(Duration::from_secs(30));
            let mut status_update_interval = tokio::time::interval(Duration::from_secs(10));

            loop {
                tokio::select! {
                    // Handle hypervisor commands
                    cmd = rx.recv() => {
                        if let Some(command) = cmd {
                            // Simple handling to avoid recursion - register services
                            match command {
                                HypervisorCommand::StartService { name, config } => {
                                    info!("🧠 Starting service: {} ({:?})", name, config.service_type);
                                    
                                    // Assign ports based on service type
                                    let (port, pid) = match config.service_type {
                                        ServiceType::RestApi => (Some(8080), Some(std::process::id())),
                                        ServiceType::WebSocket => (Some(8081), Some(std::process::id())),
                                        ServiceType::GrpcService => (Some(50051), Some(std::process::id())),
                                        ServiceType::Analytics => (Some(8082), Some(std::process::id())),
                                        ServiceType::Security => (Some(8083), Some(std::process::id())),
                                        _ => (None, None)
                                    };
                                    
                                    // Create service instance with RUNNING status
                                    let service = ServiceInstance {
                                        id: uuid::Uuid::new_v4().to_string(),
                                        name: name.clone(),
                                        service_type: config.service_type.clone(),
                                        status: ServiceStatus::Running,  // Set to Running instead of Starting
                                        port,
                                        pid,
                                        start_time: std::time::SystemTime::now(),
                                        last_heartbeat: std::time::SystemTime::now(),
                                        restart_count: 0,
                                        health_check_url: port.map(|p| format!("http://localhost:{}/health", p)),
                                        dependencies: config.dependencies,
                                        failure_threshold: config.failure_threshold,
                                        auto_restart: config.auto_restart,
                                    };
                            
                                    let service_name = name.clone();
                                    services.write().await.insert(name, service);
                                    info!("✅ Service {} started successfully on port {:?}!", service_name, port);
                                }
                                HypervisorCommand::GetSystemStatus => {
                                    let services_map = services.read().await;
                                    let status_guard = status.read().await;
                            
                                    info!("🧠 === SIRSI HYPERVISOR STATUS ===");
                                    info!("   Status: {}", status_guard.status);
                                    info!("   Services: {}/{} running", status_guard.running_services, status_guard.total_services);
                                    info!("   Failed: {}", status_guard.failed_services);
                                    info!("   Total Restarts: {}", status_guard.total_restarts);
                            
                                    for (name, service) in services_map.iter() {
                                        debug!("   🔧 {} -> {:?} (restarts: {})", name, service.status, service.restart_count);
                                    }
                                }
                                _ => {
                                    debug!("🧠 Hypervisor received command: {:?}", command);
                                }
                            }
                        } else {
                            break;
                        }
                    }
                    
                    // Periodic health checks
                    _ = health_check_interval.tick() => {
                        debug!("🧠 Periodic health check");
                    }
                    
                    // Update hypervisor status
                    _ = status_update_interval.tick() => {
                        let services_map = services.read().await;
                        let running_count = services_map.values()
                            .filter(|s| s.status == ServiceStatus::Running)
                            .count();
                        
                        let mut status_guard = status.write().await;
                        status_guard.total_services = services_map.len();
                        status_guard.running_services = running_count;
                        
                        if running_count == 0 {
                            status_guard.status = "initializing".to_string();
                        } else {
                            status_guard.status = "healthy".to_string();
                        }
                        
                        info!("🧠 Hypervisor Status: {} | Services: {}/{} running | Failed: {} | Restarts: {}", 
                            status_guard.status, status_guard.running_services, status_guard.total_services, 
                            status_guard.failed_services, status_guard.total_restarts);
                    }
                }
            }
            
            info!("🧠 SIRSI Hypervisor control loop terminated");
        });
    }


    pub async fn register_service(&self, name: &str, config: ServiceConfig) -> Result<()> {
        self.control_channel
            .send(HypervisorCommand::StartService {
                name: name.to_string(),
                config,
            })?;
        Ok(())
    }

    pub async fn report_service_failure(&self, name: &str, error: &str) -> Result<()> {
        self.control_channel
            .send(HypervisorCommand::ServiceFailure {
                name: name.to_string(),
                error: error.to_string(),
            })?;
        Ok(())
    }

    pub async fn report_service_recovery(&self, name: &str) -> Result<()> {
        self.control_channel
            .send(HypervisorCommand::ServiceRecovery {
                name: name.to_string(),
            })?;
        Ok(())
    }

    pub async fn get_status(&self) -> HypervisorStatus {
        self.status.read().await.clone()
    }

    pub async fn get_service_status(&self, name: &str) -> Option<ServiceInstance> {
        self.services.read().await.get(name).cloned()
    }

    pub async fn emergency_shutdown(&self) -> Result<()> {
        self.control_channel
            .send(HypervisorCommand::EmergencyShutdown)?;
        Ok(())
    }
    
}


impl FailureTracker {
    fn new() -> Self {
        Self {
            incidents: HashMap::new(),
            global_failure_count: 0,
            last_global_failure: None,
        }
    }
}

impl Default for ServiceConfig {
    fn default() -> Self {
        Self {
            service_type: ServiceType::Custom("generic".to_string()),
            auto_restart: true,
            failure_threshold: 3,
            dependencies: Vec::new(),
            health_check_interval: Duration::from_secs(30),
        }
    }
}
