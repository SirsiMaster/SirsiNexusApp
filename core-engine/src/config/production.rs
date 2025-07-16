// Phase 4: Production Configuration Management
// Provides environment-aware configuration with validation and hot-reloading

use std::{
    collections::HashMap,
    env,
    fs,
    path::{Path, PathBuf},
    sync::Arc,
    time::Duration,
};
use serde::{Deserialize, Serialize};
use tokio::{sync::RwLock, time::interval};
use tracing::{info, warn, error, debug};

use crate::{
    error::{AppError, AppResult},
};
use crate::audit::AuditLogger;

/// Production environment configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductionConfig {
    pub environment: Environment,
    pub service: ServiceConfig,
    pub database: DatabaseConfig,
    pub security: SecurityConfig,
    pub monitoring: MonitoringConfig,
    pub performance: PerformanceConfig,
    pub deployment: DeploymentConfig,
    pub feature_flags: FeatureFlags,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Environment {
    Development,
    Staging,
    Production,
    Testing,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceConfig {
    pub name: String,
    pub version: String,
    pub instance_id: String,
    pub region: String,
    pub availability_zone: String,
    pub grpc_port: u16,
    pub http_port: u16,
    pub websocket_port: u16,
    pub max_connections: usize,
    pub request_timeout: Duration,
    pub graceful_shutdown_timeout: Duration,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseConfig {
    pub primary_url: String,
    pub replica_urls: Vec<String>,
    pub max_connections: u32,
    pub min_connections: u32,
    pub connection_timeout: Duration,
    pub idle_timeout: Duration,
    pub max_lifetime: Duration,
    pub enable_query_logging: bool,
    pub slow_query_threshold: Duration,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityConfig {
    pub enable_tls: bool,
    pub cert_path: Option<PathBuf>,
    pub key_path: Option<PathBuf>,
    pub ca_path: Option<PathBuf>,
    pub enable_mtls: bool,
    pub jwt_secret_path: Option<PathBuf>,
    pub vault_config: VaultConfig,
    pub spiffe_config: SpiffeConfig,
    pub rate_limiting: RateLimitConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VaultConfig {
    pub enabled: bool,
    pub address: String,
    pub auth_method: String,
    pub role_id: Option<String>,
    pub secret_id_path: Option<PathBuf>,
    pub token_path: Option<PathBuf>,
    pub mount_path: String,
    pub renew_interval: Duration,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpiffeConfig {
    pub enabled: bool,
    pub socket_path: PathBuf,
    pub trust_domain: String,
    pub svid_rotation_interval: Duration,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimitConfig {
    pub enabled: bool,
    pub requests_per_minute: u64,
    pub burst_capacity: u64,
    pub window_size: Duration,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitoringConfig {
    pub enabled: bool,
    pub metrics_port: u16,
    pub health_check_port: u16,
    pub prometheus_endpoint: String,
    pub jaeger_endpoint: String,
    pub log_level: String,
    pub structured_logging: bool,
    pub export_interval: Duration,
    pub retention_days: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceConfig {
    pub enable_caching: bool,
    pub cache_ttl: Duration,
    pub max_cache_size: usize,
    pub worker_threads: Option<usize>,
    pub max_blocking_threads: usize,
    pub connection_pool_size: usize,
    pub enable_compression: bool,
    pub compression_level: u8,
    pub batch_size: usize,
    pub prefetch_enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeploymentConfig {
    pub strategy: String,
    pub replicas: u32,
    pub rolling_update: RollingUpdateConfig,
    pub resource_limits: ResourceLimits,
    pub auto_scaling: AutoScalingConfig,
    pub health_checks: HealthCheckConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RollingUpdateConfig {
    pub max_surge: String,
    pub max_unavailable: String,
    pub timeout: Duration,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceLimits {
    pub cpu_request: String,
    pub cpu_limit: String,
    pub memory_request: String,
    pub memory_limit: String,
    pub storage_request: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoScalingConfig {
    pub enabled: bool,
    pub min_replicas: u32,
    pub max_replicas: u32,
    pub target_cpu_utilization: u8,
    pub target_memory_utilization: u8,
    pub scale_up_cooldown: Duration,
    pub scale_down_cooldown: Duration,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthCheckConfig {
    pub liveness_probe: ProbeConfig,
    pub readiness_probe: ProbeConfig,
    pub startup_probe: ProbeConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProbeConfig {
    pub enabled: bool,
    pub path: String,
    pub port: u16,
    pub initial_delay: Duration,
    pub period: Duration,
    pub timeout: Duration,
    pub failure_threshold: u32,
    pub success_threshold: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeatureFlags {
    pub ai_agents_enabled: bool,
    pub real_cloud_integration: bool,
    pub advanced_analytics: bool,
    pub experimental_features: bool,
    pub debug_mode: bool,
    pub maintenance_mode: bool,
    pub custom_flags: HashMap<String, bool>,
}

/// Production configuration manager with hot-reloading
#[derive(Debug)]
pub struct ConfigManager {
    config: Arc<RwLock<ProductionConfig>>,
    config_path: PathBuf,
    audit_logger: Option<AuditLogger>,
    watch_enabled: bool,
}

impl ConfigManager {
    /// Create a new configuration manager
    pub fn new(config_path: PathBuf) -> AppResult<Self> {
        let config = Self::load_config(&config_path)?;
        
        Ok(Self {
            config: Arc::new(RwLock::new(config)),
            config_path,
            audit_logger: None,
            watch_enabled: false,
        })
    }
    
    /// Create with audit logging
    pub fn with_audit_logger(mut self, audit_logger: AuditLogger) -> Self {
        self.audit_logger = Some(audit_logger);
        self
    }
    
    /// Enable configuration hot-reloading
    pub fn with_hot_reload(mut self) -> Self {
        self.watch_enabled = true;
        self
    }
    
    /// Initialize the configuration manager
    pub async fn initialize(&self) -> AppResult<()> {
        info!("🔧 Phase 4: Initializing production configuration manager");
        
        // Validate configuration
        self.validate_config().await?;
        
        // Start configuration watcher if enabled
        if self.watch_enabled {
            self.start_config_watcher().await?;
        }
        
        // Log configuration initialization
        if let Some(audit_logger) = &self.audit_logger {
            let config = self.config.read().await;
            let _ = audit_logger.log_system_event(
                "config_manager_initialized",
                serde_json::json!({
                    "environment": config.environment,
                    "service_name": config.service.name,
                    "version": config.service.version,
                    "hot_reload_enabled": self.watch_enabled
                }),
                true,
                None,
            ).await;
        }
        
        info!("✅ Production configuration manager initialized successfully");
        Ok(())
    }
    
    /// Get current configuration
    pub async fn get_config(&self) -> ProductionConfig {
        self.config.read().await.clone()
    }
    
    /// Get specific configuration section
    pub async fn get_service_config(&self) -> ServiceConfig {
        self.config.read().await.service.clone()
    }
    
    pub async fn get_database_config(&self) -> DatabaseConfig {
        self.config.read().await.database.clone()
    }
    
    pub async fn get_security_config(&self) -> SecurityConfig {
        self.config.read().await.security.clone()
    }
    
    pub async fn get_monitoring_config(&self) -> MonitoringConfig {
        self.config.read().await.monitoring.clone()
    }
    
    pub async fn get_performance_config(&self) -> PerformanceConfig {
        self.config.read().await.performance.clone()
    }
    
    /// Update feature flag
    pub async fn update_feature_flag(&self, flag_name: &str, enabled: bool) -> AppResult<()> {
        let mut config = self.config.write().await;
        
        match flag_name {
            "ai_agents_enabled" => config.feature_flags.ai_agents_enabled = enabled,
            "real_cloud_integration" => config.feature_flags.real_cloud_integration = enabled,
            "advanced_analytics" => config.feature_flags.advanced_analytics = enabled,
            "experimental_features" => config.feature_flags.experimental_features = enabled,
            "debug_mode" => config.feature_flags.debug_mode = enabled,
            "maintenance_mode" => config.feature_flags.maintenance_mode = enabled,
            custom => {
                config.feature_flags.custom_flags.insert(custom.to_string(), enabled);
            }
        }
        
        if let Some(audit_logger) = &self.audit_logger {
            let _ = audit_logger.log_system_event(
                "feature_flag_updated",
                serde_json::json!({
                    "flag_name": flag_name,
                    "enabled": enabled,
                    "environment": config.environment
                }),
                true,
                None,
            ).await;
        }
        
        info!("🚩 Feature flag '{}' updated: {}", flag_name, enabled);
        Ok(())
    }
    
    /// Check if feature is enabled
    pub async fn is_feature_enabled(&self, flag_name: &str) -> bool {
        let config = self.config.read().await;
        
        match flag_name {
            "ai_agents_enabled" => config.feature_flags.ai_agents_enabled,
            "real_cloud_integration" => config.feature_flags.real_cloud_integration,
            "advanced_analytics" => config.feature_flags.advanced_analytics,
            "experimental_features" => config.feature_flags.experimental_features,
            "debug_mode" => config.feature_flags.debug_mode,
            "maintenance_mode" => config.feature_flags.maintenance_mode,
            custom => config.feature_flags.custom_flags.get(custom).copied().unwrap_or(false),
        }
    }
    
    /// Load configuration from file with environment variable override
    fn load_config(config_path: &Path) -> AppResult<ProductionConfig> {
        info!("📄 Loading production configuration from: {:?}", config_path);
        
        // Start with default configuration
        let mut config = Self::default_config();
        
        // Load from file if it exists
        if config_path.exists() {
            let config_content = fs::read_to_string(config_path)
                .map_err(|e| AppError::Configuration(format!("Failed to read config file: {}", e)))?;
            
            config = toml::from_str(&config_content)
                .map_err(|e| AppError::Configuration(format!("Failed to parse config file: {}", e)))?;
        } else {
            warn!("Configuration file not found, using defaults: {:?}", config_path);
        }
        
        // Override with environment variables
        Self::apply_env_overrides(&mut config);
        
        Ok(config)
    }
    
    /// Apply environment variable overrides
    fn apply_env_overrides(config: &mut ProductionConfig) {
        // Service configuration
        if let Ok(port) = env::var("GRPC_PORT") {
            if let Ok(p) = port.parse() {
                config.service.grpc_port = p;
            }
        }
        
        if let Ok(port) = env::var("HTTP_PORT") {
            if let Ok(p) = port.parse() {
                config.service.http_port = p;
            }
        }
        
        // Database configuration
        if let Ok(url) = env::var("DATABASE_URL") {
            config.database.primary_url = url;
        }
        
        // Security configuration
        if let Ok(vault_addr) = env::var("VAULT_ADDR") {
            config.security.vault_config.address = vault_addr;
        }
        
        if let Ok(_vault_token) = env::var("VAULT_TOKEN") {
            // In production, this would be handled more securely
            debug!("Vault token configured from environment");
        }
        
        // Environment detection
        if let Ok(env_str) = env::var("ENVIRONMENT") {
            config.environment = match env_str.to_lowercase().as_str() {
                "development" | "dev" => Environment::Development,
                "staging" | "stage" => Environment::Staging,
                "production" | "prod" => Environment::Production,
                "testing" | "test" => Environment::Testing,
                _ => config.environment.clone(),
            };
        }
        
        info!("🌍 Environment configured: {:?}", config.environment);
    }
    
    /// Default production configuration
    fn default_config() -> ProductionConfig {
        ProductionConfig {
            environment: Environment::Development,
            service: ServiceConfig {
                name: "sirsi-nexus-core".to_string(),
                version: env!("CARGO_PKG_VERSION").to_string(),
                instance_id: uuid::Uuid::new_v4().to_string(),
                region: "us-west-2".to_string(),
                availability_zone: "us-west-2a".to_string(),
                grpc_port: 50051,
                http_port: 8080,
                websocket_port: 8081,
                max_connections: 1000,
                request_timeout: Duration::from_secs(30),
                graceful_shutdown_timeout: Duration::from_secs(30),
            },
            database: DatabaseConfig {
                primary_url: "postgresql://localhost:26257/sirsi_nexus?sslmode=prefer".to_string(),
                replica_urls: vec![],
                max_connections: 100,
                min_connections: 5,
                connection_timeout: Duration::from_secs(10),
                idle_timeout: Duration::from_secs(600),
                max_lifetime: Duration::from_secs(1800),
                enable_query_logging: false,
                slow_query_threshold: Duration::from_millis(1000),
            },
            security: SecurityConfig {
                enable_tls: true,
                cert_path: Some(PathBuf::from("/etc/certs/tls.crt")),
                key_path: Some(PathBuf::from("/etc/certs/tls.key")),
                ca_path: Some(PathBuf::from("/etc/certs/ca.crt")),
                enable_mtls: true,
                jwt_secret_path: Some(PathBuf::from("/etc/secrets/jwt-secret")),
                vault_config: VaultConfig {
                    enabled: true,
                    address: "https://vault.sirsi-nexus.local:8200".to_string(),
                    auth_method: "kubernetes".to_string(),
                    role_id: None,
                    secret_id_path: None,
                    token_path: Some(PathBuf::from("/var/run/secrets/kubernetes.io/serviceaccount/token")),
                    mount_path: "sirsi-nexus".to_string(),
                    renew_interval: Duration::from_secs(3600),
                },
                spiffe_config: SpiffeConfig {
                    enabled: true,
                    socket_path: PathBuf::from("/tmp/spire-agent/public/api.sock"),
                    trust_domain: "sirsi-nexus.local".to_string(),
                    svid_rotation_interval: Duration::from_secs(1800),
                },
                rate_limiting: RateLimitConfig {
                    enabled: true,
                    requests_per_minute: 1000,
                    burst_capacity: 100,
                    window_size: Duration::from_secs(60),
                },
            },
            monitoring: MonitoringConfig {
                enabled: true,
                metrics_port: 9090,
                health_check_port: 8082,
                prometheus_endpoint: "/metrics".to_string(),
                jaeger_endpoint: "http://jaeger.monitoring.svc.cluster.local:14268/api/traces".to_string(),
                log_level: "info".to_string(),
                structured_logging: true,
                export_interval: Duration::from_secs(15),
                retention_days: 30,
            },
            performance: PerformanceConfig {
                enable_caching: true,
                cache_ttl: Duration::from_secs(300),
                max_cache_size: 10000,
                worker_threads: None, // Auto-detect
                max_blocking_threads: 512,
                connection_pool_size: 100,
                enable_compression: true,
                compression_level: 6,
                batch_size: 100,
                prefetch_enabled: true,
            },
            deployment: DeploymentConfig {
                strategy: "RollingUpdate".to_string(),
                replicas: 3,
                rolling_update: RollingUpdateConfig {
                    max_surge: "25%".to_string(),
                    max_unavailable: "25%".to_string(),
                    timeout: Duration::from_secs(600),
                },
                resource_limits: ResourceLimits {
                    cpu_request: "500m".to_string(),
                    cpu_limit: "2".to_string(),
                    memory_request: "512Mi".to_string(),
                    memory_limit: "2Gi".to_string(),
                    storage_request: "10Gi".to_string(),
                },
                auto_scaling: AutoScalingConfig {
                    enabled: true,
                    min_replicas: 2,
                    max_replicas: 10,
                    target_cpu_utilization: 70,
                    target_memory_utilization: 80,
                    scale_up_cooldown: Duration::from_secs(300),
                    scale_down_cooldown: Duration::from_secs(600),
                },
                health_checks: HealthCheckConfig {
                    liveness_probe: ProbeConfig {
                        enabled: true,
                        path: "/health/live".to_string(),
                        port: 8082,
                        initial_delay: Duration::from_secs(30),
                        period: Duration::from_secs(10),
                        timeout: Duration::from_secs(5),
                        failure_threshold: 3,
                        success_threshold: 1,
                    },
                    readiness_probe: ProbeConfig {
                        enabled: true,
                        path: "/health/ready".to_string(),
                        port: 8082,
                        initial_delay: Duration::from_secs(5),
                        period: Duration::from_secs(5),
                        timeout: Duration::from_secs(3),
                        failure_threshold: 3,
                        success_threshold: 1,
                    },
                    startup_probe: ProbeConfig {
                        enabled: true,
                        path: "/health/startup".to_string(),
                        port: 8082,
                        initial_delay: Duration::from_secs(10),
                        period: Duration::from_secs(5),
                        timeout: Duration::from_secs(3),
                        failure_threshold: 30,
                        success_threshold: 1,
                    },
                },
            },
            feature_flags: FeatureFlags {
                ai_agents_enabled: true,
                real_cloud_integration: true,
                advanced_analytics: true,
                experimental_features: false,
                debug_mode: false,
                maintenance_mode: false,
                custom_flags: HashMap::new(),
            },
        }
    }
    
    /// Validate configuration
    async fn validate_config(&self) -> AppResult<()> {
        let config = self.config.read().await;
        
        // Validate ports
        if config.service.grpc_port == config.service.http_port {
            return Err(AppError::Configuration("gRPC and HTTP ports cannot be the same".into()));
        }
        
        // Validate database configuration
        if config.database.max_connections <= config.database.min_connections {
            return Err(AppError::Configuration("max_connections must be greater than min_connections".into()));
        }
        
        // Validate resource limits for production
        if config.environment == Environment::Production {
            if config.deployment.replicas < 2 {
                warn!("Production deployment should have at least 2 replicas for high availability");
            }
            
            if !config.security.enable_tls {
                return Err(AppError::Configuration("TLS must be enabled in production".into()));
            }
        }
        
        info!("✅ Configuration validation passed");
        Ok(())
    }
    
    /// Start configuration file watcher
    async fn start_config_watcher(&self) -> AppResult<()> {
        info!("👁️ Starting configuration hot-reload watcher");
        
        let config_path = self.config_path.clone();
        let config_arc = Arc::clone(&self.config);
        let audit_logger = self.audit_logger.clone();
        
        tokio::spawn(async move {
            let mut interval = interval(Duration::from_secs(30));
            let mut last_modified = fs::metadata(&config_path)
                .ok()
                .and_then(|m| m.modified().ok());
            
            loop {
                interval.tick().await;
                
                if let Ok(metadata) = fs::metadata(&config_path) {
                    if let Ok(modified) = metadata.modified() {
                        if Some(modified) != last_modified {
                            info!("📄 Configuration file changed, reloading...");
                            
                            match Self::load_config(&config_path) {
                                Ok(new_config) => {
                                    *config_arc.write().await = new_config;
                                    last_modified = Some(modified);
                                    
                                    if let Some(audit_logger) = &audit_logger {
                                        let _ = audit_logger.log_system_event(
                                            "config_hot_reloaded",
                                            serde_json::json!({
                                                "config_path": config_path,
                                                "timestamp": modified
                                            }),
                                            true,
                                            None,
                                        ).await;
                                    }
                                    
                                    info!("✅ Configuration hot-reloaded successfully");
                                }
                                Err(e) => {
                                    error!("❌ Failed to reload configuration: {}", e);
                                    
                                    if let Some(audit_logger) = &audit_logger {
                                        let _ = audit_logger.log_system_event(
                                            "config_reload_failed",
                                            serde_json::json!({
                                                "config_path": config_path,
                                                "error": e.to_string()
                                            }),
                                            false,
                                            Some(&e.to_string()),
                                        ).await;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;
    
    #[tokio::test]
    async fn test_config_manager_initialization() {
        let temp_dir = tempdir().unwrap();
        let config_path = temp_dir.path().join("config.toml");
        
        let config_manager = ConfigManager::new(config_path).unwrap();
        let result = config_manager.initialize().await;
        assert!(result.is_ok());
    }
    
    #[tokio::test]
    async fn test_feature_flag_management() {
        let temp_dir = tempdir().unwrap();
        let config_path = temp_dir.path().join("config.toml");
        
        let config_manager = ConfigManager::new(config_path).unwrap();
        config_manager.initialize().await.unwrap();
        
        // Test updating feature flags
        config_manager.update_feature_flag("experimental_features", true).await.unwrap();
        assert!(config_manager.is_feature_enabled("experimental_features").await);
        
        config_manager.update_feature_flag("experimental_features", false).await.unwrap();
        assert!(!config_manager.is_feature_enabled("experimental_features").await);
    }
    
    #[tokio::test]
    async fn test_environment_detection() {
        std::env::set_var("ENVIRONMENT", "production");
        
        let temp_dir = tempdir().unwrap();
        let config_path = temp_dir.path().join("config.toml");
        
        let config_manager = ConfigManager::new(config_path).unwrap();
        let config = config_manager.get_config().await;
        
        assert_eq!(config.environment, Environment::Production);
        
        std::env::remove_var("ENVIRONMENT");
    }
}
