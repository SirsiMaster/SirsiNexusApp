use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, SystemTime};
use tokio::sync::{RwLock, mpsc};
use tracing::{info, warn, error, debug};
use anyhow::Result;
use serde::{Serialize, Deserialize};
use uuid::Uuid;

use crate::config::AppConfig;
use crate::services::port_registry::{ServiceType, PortRequest};

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
                            Self::handle_command(
                                command,
                                &services,
                                &failure_tracker,
                                &status,
                                &config
                            ).await;
                        } else {
                            break;
                        }
                    }
                    
                    // Periodic health checks
                    _ = health_check_interval.tick() => {
                        Self::perform_health_checks(&services, &failure_tracker).await;
                    }
                    
                    // Update hypervisor status
                    _ = status_update_interval.tick() => {
                        Self::update_hypervisor_status(&services, &status).await;
                    }
                }
            }
            
            info!("🧠 SIRSI Hypervisor control loop terminated");
        });
    }

    async fn handle_command(
        command: HypervisorCommand,
        services: &Arc<RwLock<HashMap<String, ServiceInstance>>>,
        failure_tracker: &Arc<RwLock<FailureTracker>>,
        status: &Arc<RwLock<HypervisorStatus>>,
        _config: &Arc<AppConfig>,
    ) {
        match command {
            HypervisorCommand::StartService { name, config } => {
                Self::start_service(&name, config, services).await;
            }
            HypervisorCommand::StopService { name } => {
                Self::stop_service(&name, services).await;
            }
            HypervisorCommand::RestartService { name } => {
                Self::restart_service(&name, services, failure_tracker).await;
            }
            HypervisorCommand::ServiceFailure { name, error } => {
                Self::handle_service_failure(&name, &error, services, failure_tracker).await;
            }
            HypervisorCommand::ServiceRecovery { name } => {
                Self::handle_service_recovery(&name, services).await;
            }
            HypervisorCommand::EmergencyShutdown => {
                Self::emergency_shutdown_internal(services).await;
            }
            HypervisorCommand::GetSystemStatus => {
                Self::log_system_status(services, status).await;
            }
            _ => {
                debug!("🧠 Hypervisor received command: {:?}", command);
            }
        }
    }

    async fn start_service(
        name: &str,
        service_config: ServiceConfig,
        services: &Arc<RwLock<HashMap<String, ServiceInstance>>>,
    ) {
        let service_id = Uuid::new_v4().to_string();
        let service = ServiceInstance {
            id: service_id,
            name: name.to_string(),
            service_type: service_config.service_type.clone(),
            status: ServiceStatus::Starting,
            port: None,
            pid: None,
            start_time: SystemTime::now(),
            last_heartbeat: SystemTime::now(),
            restart_count: 0,
            health_check_url: None,
            dependencies: service_config.dependencies,
            failure_threshold: service_config.failure_threshold,
            auto_restart: service_config.auto_restart,
        };

        services.write().await.insert(name.to_string(), service);
        info!("🧠 Hypervisor starting service: {}", name);
    }

    async fn stop_service(
        name: &str,
        services: &Arc<RwLock<HashMap<String, ServiceInstance>>>,
    ) {
        if let Some(service) = services.write().await.get_mut(name) {
            service.status = ServiceStatus::Stopping;
            info!("🧠 Hypervisor stopping service: {}", name);
        }
    }

    async fn restart_service(
        name: &str,
        services: &Arc<RwLock<HashMap<String, ServiceInstance>>>,
        failure_tracker: &Arc<RwLock<FailureTracker>>,
    ) {
        if let Some(service) = services.write().await.get_mut(name) {
            service.restart_count += 1;
            service.status = ServiceStatus::Starting;
            service.start_time = SystemTime::now();
            
            // Record restart incident
            let incident = FailureIncident {
                timestamp: SystemTime::now(),
                error: "Service restart requested".to_string(),
                recovery_action: "Automatic restart".to_string(),
                recovery_success: true,
            };
            
            failure_tracker.write().await
                .incidents
                .entry(name.to_string())
                .or_insert_with(Vec::new)
                .push(incident);

            info!("🧠 Hypervisor restarting service: {} (restart #{}) ", name, service.restart_count);
        }
    }

    async fn handle_service_failure(
        name: &str,
        error: &str,
        services: &Arc<RwLock<HashMap<String, ServiceInstance>>>,
        failure_tracker: &Arc<RwLock<FailureTracker>>,
    ) {
        error!("🧠 Hypervisor detected service failure: {} - {}", name, error);

        if let Some(service) = services.write().await.get_mut(name) {
            service.status = ServiceStatus::Failed;

            // Record failure incident
            let incident = FailureIncident {
                timestamp: SystemTime::now(),
                error: error.to_string(),
                recovery_action: "Pending".to_string(),
                recovery_success: false,
            };

            let mut tracker = failure_tracker.write().await;
            tracker.incidents
                .entry(name.to_string())
                .or_insert_with(Vec::new)
                .push(incident);

            tracker.global_failure_count += 1;
            tracker.last_global_failure = Some(SystemTime::now());

            // Determine recovery action
            if service.auto_restart && service.restart_count < service.failure_threshold {
                warn!("🧠 Hypervisor initiating auto-recovery for service: {}", name);
                Self::auto_recover_service(name, services, failure_tracker).await;
            } else {
                error!("🧠 Service {} has exceeded failure threshold or auto-restart disabled", name);
                service.status = ServiceStatus::CriticalFailure;
            }
        }
    }

    async fn auto_recover_service(
        name: &str,
        services: &Arc<RwLock<HashMap<String, ServiceInstance>>>,
        failure_tracker: &Arc<RwLock<FailureTracker>>,
    ) {
        if let Some(service) = services.write().await.get_mut(name) {
            info!("🧠 Hypervisor auto-recovering service: {}", name);
            
            // Implement progressive backoff for restarts
            let backoff_duration = Duration::from_secs(2_u64.pow(service.restart_count.min(5)));
            tokio::time::sleep(backoff_duration).await;

            service.restart_count += 1;
            service.status = ServiceStatus::Starting;
            service.start_time = SystemTime::now();

            // Update incident record
            if let Some(incidents) = failure_tracker.write().await.incidents.get_mut(name) {
                if let Some(last_incident) = incidents.last_mut() {
                    last_incident.recovery_action = format!("Auto-restart #{}", service.restart_count);
                    last_incident.recovery_success = true;
                }
            }

            info!("🧠 Service {} recovery initiated with {}s backoff", name, backoff_duration.as_secs());
        }
    }

    async fn handle_service_recovery(
        name: &str,
        services: &Arc<RwLock<HashMap<String, ServiceInstance>>>,
    ) {
        if let Some(service) = services.write().await.get_mut(name) {
            service.status = ServiceStatus::Running;
            service.last_heartbeat = SystemTime::now();
            info!("🧠 Hypervisor confirmed service recovery: {}", name);
        }
    }

    async fn perform_health_checks(
        services: &Arc<RwLock<HashMap<String, ServiceInstance>>>,
        failure_tracker: &Arc<RwLock<FailureTracker>>,
    ) {
        let services_snapshot = services.read().await.clone();
        
        for (name, service) in services_snapshot {
            // Check if service is responsive
            let health_status = Self::check_service_health(&service).await;
            
            if !health_status && service.status == ServiceStatus::Running {
                warn!("🧠 Health check failed for service: {}", name);
                
                Self::handle_service_failure(
                    &name,
                    "Health check failed",
                    services,
                    failure_tracker,
                ).await;
            }
        }
    }

    async fn check_service_health(service: &ServiceInstance) -> bool {
        // Implement health checks based on service type
        match service.service_type {
            ServiceType::RestApi => {
                if let Some(port) = service.port {
                    Self::check_http_health(port).await
                } else {
                    false
                }
            }
            ServiceType::WebSocket => {
                if let Some(port) = service.port {
                    Self::check_tcp_health(port).await
                } else {
                    false
                }
            }
            ServiceType::GrpcService => {
                if let Some(port) = service.port {
                    Self::check_tcp_health(port).await
                } else {
                    false
                }
            }
            _ => true, // Assume healthy for other service types
        }
    }

    async fn check_http_health(port: u16) -> bool {
        match reqwest::get(&format!("http://localhost:{}/health", port)).await {
            Ok(response) => response.status().is_success(),
            Err(_) => false,
        }
    }

    async fn check_tcp_health(port: u16) -> bool {
        match tokio::net::TcpStream::connect(format!("localhost:{}", port)).await {
            Ok(_) => true,
            Err(_) => false,
        }
    }

    async fn emergency_shutdown_internal(services: &Arc<RwLock<HashMap<String, ServiceInstance>>>) {
        error!("🧠 EMERGENCY SHUTDOWN INITIATED - All services stopping");
        
        let mut services_map = services.write().await;
        for (name, service) in services_map.iter_mut() {
            service.status = ServiceStatus::Stopping;
            warn!("🧠 Emergency stop: {}", name);
        }
    }

    async fn update_hypervisor_status(
        services: &Arc<RwLock<HashMap<String, ServiceInstance>>>,
        status: &Arc<RwLock<HypervisorStatus>>,
    ) {
        let services_map = services.read().await;
        let running_count = services_map.values()
            .filter(|s| s.status == ServiceStatus::Running)
            .count();
        let failed_count = services_map.values()
            .filter(|s| matches!(s.status, ServiceStatus::Failed | ServiceStatus::CriticalFailure))
            .count();
        let total_restarts = services_map.values()
            .map(|s| s.restart_count)
            .sum();

        let mut status_guard = status.write().await;
        status_guard.total_services = services_map.len();
        status_guard.running_services = running_count;
        status_guard.failed_services = failed_count;
        status_guard.total_restarts = total_restarts;
        
        status_guard.status = if failed_count == 0 {
            "healthy".to_string()
        } else if running_count > failed_count {
            "degraded".to_string()
        } else {
            "critical".to_string()
        };
    }

    async fn log_system_status(
        services: &Arc<RwLock<HashMap<String, ServiceInstance>>>,
        status: &Arc<RwLock<HypervisorStatus>>,
    ) {
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
