// Phase 3: Enterprise Security Module
// Integrates SPIFFE/SPIRE, HashiCorp Vault, and OPA for comprehensive security

pub mod spiffe;
pub mod vault;
pub mod credential_manager;
pub mod health_monitor;
pub mod tenant_isolation;

pub use spiffe::*;
pub use vault::*;
pub use credential_manager::{CredentialManager, CredentialMetadata, PlainCredential, CredentialAccessLog};
pub use health_monitor::{HealthMonitor, HealthCheck, HealthStatus, SystemMetrics};
pub use tenant_isolation::{TenantIsolationManager, TenantContext, TenantResource};

use sqlx::PgPool;

use crate::{
    error::AppResult,
    audit::AuditLogger,
};

/// Phase 3: Comprehensive Security Manager
/// Coordinates all security components: SPIFFE, Vault, RBAC, and audit logging
#[derive(Debug)]
pub struct SecurityManager {
    pub spiffe_client: WorkloadApiClient,
    pub trust_domain_manager: TrustDomainManager,
    pub vault_client: VaultClient,
    pub audit_logger: AuditLogger,
}

impl SecurityManager {
    /// Initialize the security manager with all components
    pub async fn new(pool: PgPool) -> AppResult<Self> {
        let audit_logger = AuditLogger::new(pool.clone());
        
        // Initialize SPIFFE components
        let spiffe_config = WorkloadApiConfig::default();
        let spiffe_client = WorkloadApiClient::new(spiffe_config)
            .with_audit_logger(audit_logger.clone());
        
        let trust_domain_manager = TrustDomainManager::new()
            .with_audit_logger(audit_logger.clone());
        
        // Initialize Vault client
        let vault_config = VaultConfig::default();
        let vault_client = VaultClient::new(vault_config)
            .with_audit_logger(audit_logger.clone());
        
        Ok(Self {
            spiffe_client,
            trust_domain_manager,
            vault_client,
            audit_logger,
        })
    }
    
    /// Initialize all security components
    pub async fn initialize(&self) -> AppResult<()> {
        tracing::info!("🔐 Phase 3: Initializing comprehensive security manager");
        
        // Initialize trust domains
        self.trust_domain_manager.initialize().await?;
        
        // Initialize SPIFFE workload API
        self.spiffe_client.initialize().await?;
        
        // Start SVID rotation
        self.spiffe_client.start_rotation().await?;
        
        // Initialize Vault connection
        self.vault_client.initialize().await?;
        
        // Log security initialization
        self.audit_logger.log_system_event(
            "security_manager_initialized",
            serde_json::json!({
                "components": ["spiffe", "vault", "trust_domains", "audit"],
                "phase": 3,
                "security_level": "enterprise"
            }),
            true,
            None,
        ).await?;
        
        tracing::info!("✅ Security manager initialization complete");
        Ok(())
    }
    
    /// Get current service identity (SPIFFE ID)
    pub async fn get_service_identity(&self) -> AppResult<SpiffeId> {
        let svid = self.spiffe_client.get_svid().await?;
        Ok(svid.spiffe_id)
    }
    
    /// Verify peer service identity
    pub async fn verify_peer_identity(&self, peer_spiffe_id: &SpiffeId) -> AppResult<bool> {
        self.trust_domain_manager.verify_spiffe_id(peer_spiffe_id).await
    }
    
    /// Get secret from Vault
    pub async fn get_secret(&self, path: &str) -> AppResult<serde_json::Value> {
        self.vault_client.get_secret(path).await
    }
    
    /// Store secret in Vault
    pub async fn store_secret(&self, path: &str, secret: serde_json::Value) -> AppResult<()> {
        self.vault_client.store_secret(path, secret).await
    }
    
    /// Perform comprehensive security health check
    pub async fn health_check(&self) -> AppResult<SecurityHealthStatus> {
        let mut status = SecurityHealthStatus::default();
        
        // Check SPIFFE/SPIRE status
        match self.spiffe_client.get_svid().await {
            Ok(svid) => {
                status.spiffe_healthy = true;
                status.svid_expires_in = svid.time_until_expiry();
                status.svid_expires_soon = svid.expires_within(std::time::Duration::from_secs(1800)); // 30 minutes
            }
            Err(_) => {
                status.spiffe_healthy = false;
            }
        }
        
        // Check Vault status
        status.vault_healthy = self.vault_client.health_check().await.is_ok();
        
        // Check trust domain status
        let trust_domains = self.trust_domain_manager.list_trust_domains().await;
        status.trust_domains_count = trust_domains.len();
        status.trust_domains_configured = !trust_domains.is_empty();
        
        // Log health check
        self.audit_logger.log_system_event(
            "security_health_check",
            serde_json::json!({
                "spiffe_healthy": status.spiffe_healthy,
                "vault_healthy": status.vault_healthy,
                "trust_domains_count": status.trust_domains_count,
                "svid_expires_soon": status.svid_expires_soon
            }),
            status.overall_healthy(),
            if status.overall_healthy() { None } else { Some("Security components unhealthy") },
        ).await?;
        
        Ok(status)
    }
}

/// Security health status
#[derive(Debug, Clone)]
#[derive(Default)]
pub struct SecurityHealthStatus {
    pub spiffe_healthy: bool,
    pub vault_healthy: bool,
    pub trust_domains_configured: bool,
    pub trust_domains_count: usize,
    pub svid_expires_soon: bool,
    pub svid_expires_in: Option<std::time::Duration>,
}


impl SecurityHealthStatus {
    pub fn overall_healthy(&self) -> bool {
        self.spiffe_healthy && 
        self.vault_healthy && 
        self.trust_domains_configured && 
        !self.svid_expires_soon
    }
    
    pub fn get_issues(&self) -> Vec<String> {
        let mut issues = Vec::new();
        
        if !self.spiffe_healthy {
            issues.push("SPIFFE/SPIRE unavailable".to_string());
        }
        
        if !self.vault_healthy {
            issues.push("Vault unavailable".to_string());
        }
        
        if !self.trust_domains_configured {
            issues.push("No trust domains configured".to_string());
        }
        
        if self.svid_expires_soon {
            issues.push("SVID expires soon".to_string());
        }
        
        issues
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::postgres::PgPoolOptions;
    
    async fn setup_test_pool() -> PgPool {
        // Load environment variables from .env file
        dotenv::dotenv().ok();
        
        let db_url = std::env::var("DATABASE_URL")
            .unwrap_or_else(|_| "postgresql://root@localhost:26257/sirsi_nexus?sslmode=disable".to_string());
        
        PgPoolOptions::new()
            .max_connections(1)
            .connect(&db_url)
            .await
            .expect("Failed to connect to test database")
    }
    
    #[tokio::test]
    async fn test_security_manager_initialization() {
        let pool = setup_test_pool().await;
        let security_manager = SecurityManager::new(pool).await.unwrap();
        
        // Test initialization (should work with mocks)
        let result = security_manager.initialize().await;
        assert!(result.is_ok());
    }
    
    #[tokio::test]
    async fn test_security_health_check() {
        let pool = setup_test_pool().await;
        let security_manager = SecurityManager::new(pool).await.unwrap();
        security_manager.initialize().await.unwrap();
        
        let health_status = security_manager.health_check().await.unwrap();
        
        // With mocks, SPIFFE should be healthy, Vault might not be
        assert!(health_status.spiffe_healthy);
        assert!(health_status.trust_domains_configured);
        assert!(health_status.trust_domains_count > 0);
    }
}
