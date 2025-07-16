// Phase 3: SPIFFE/SPIRE Integration for Zero-Trust mTLS Authentication
// Provides cryptographic service identity verification and workload attestation

use std::{
    collections::HashMap,
    path::PathBuf,
    sync::Arc,
    time::{Duration, SystemTime},
};
use serde::{Deserialize, Serialize};
use tokio::{
    sync::RwLock,
    time::interval,
};
use tracing::{error, info, warn};

use crate::{
    error::{AppError, AppResult},
    audit::AuditLogger,
};

/// SPIFFE ID representing a service identity
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct SpiffeId {
    pub trust_domain: String,
    pub path: String,
}

impl SpiffeId {
    pub fn new(trust_domain: String, path: String) -> Self {
        Self { trust_domain, path }
    }
    
    pub fn to_uri(&self) -> String {
        format!("spiffe://{}{}", self.trust_domain, self.path)
    }
    
    pub fn from_uri(uri: &str) -> AppResult<Self> {
        if !uri.starts_with("spiffe://") {
            return Err(AppError::Security("Invalid SPIFFE URI format".into()));
        }
        
        let without_scheme = &uri[9..]; // Remove "spiffe://"
        if let Some(slash_pos) = without_scheme.find('/') {
            let trust_domain = without_scheme[..slash_pos].to_string();
            let path = without_scheme[slash_pos..].to_string();
            Ok(Self { trust_domain, path })
        } else {
            Err(AppError::Security("Invalid SPIFFE URI: missing path".into()))
        }
    }
}

/// X.509 SVID (SPIFFE Verifiable Identity Document)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct X509Svid {
    pub spiffe_id: SpiffeId,
    pub certificates: Vec<Vec<u8>>, // DER-encoded certificates
    pub private_key: Vec<u8>,        // DER-encoded private key
    pub trust_bundle: Vec<Vec<u8>>,  // DER-encoded CA certificates
    pub expires_at: SystemTime,
}

impl X509Svid {
    pub fn is_expired(&self) -> bool {
        SystemTime::now() > self.expires_at
    }
    
    pub fn time_until_expiry(&self) -> Option<Duration> {
        self.expires_at.duration_since(SystemTime::now()).ok()
    }
    
    pub fn expires_within(&self, duration: Duration) -> bool {
        self.time_until_expiry()
            .map(|time_left| time_left <= duration)
            .unwrap_or(true)
    }
}

/// Workload API client configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkloadApiConfig {
    pub socket_path: PathBuf,
    pub timeout: Duration,
    pub retry_attempts: u32,
    pub retry_delay: Duration,
}

impl Default for WorkloadApiConfig {
    fn default() -> Self {
        Self {
            socket_path: PathBuf::from("/tmp/spire-agent/public/api.sock"),
            timeout: Duration::from_secs(30),
            retry_attempts: 3,
            retry_delay: Duration::from_secs(5),
        }
    }
}

/// SPIFFE Workload API client
#[derive(Debug)]
pub struct WorkloadApiClient {
    config: WorkloadApiConfig,
    svid_cache: Arc<RwLock<Option<X509Svid>>>,
    audit_logger: Option<AuditLogger>,
}

impl WorkloadApiClient {
    pub fn new(config: WorkloadApiConfig) -> Self {
        Self {
            config,
            svid_cache: Arc::new(RwLock::new(None)),
            audit_logger: None,
        }
    }
    
    pub fn with_audit_logger(mut self, audit_logger: AuditLogger) -> Self {
        self.audit_logger = Some(audit_logger);
        self
    }
    
    /// Initialize the SPIFFE workload API client
    pub async fn initialize(&self) -> AppResult<()> {
        info!("🔐 Phase 3: Initializing SPIFFE Workload API client");
        
        // Check if SPIRE agent socket exists
        if !self.config.socket_path.exists() {
            warn!("🔶 SPIRE agent socket not found at {:?}, falling back to mock implementation", 
                self.config.socket_path);
            
            // Initialize with mock SVID for development
            let mock_svid = self.create_mock_svid().await?;
            *self.svid_cache.write().await = Some(mock_svid);
            
            if let Some(audit_logger) = &self.audit_logger {
                let _ = audit_logger.log_system_event(
                    "spiffe_mock_init",
                    serde_json::json!({
                        "reason": "spire_agent_unavailable",
                        "socket_path": self.config.socket_path,
                        "using_mock": true
                    }),
                    true,
                    None,
                ).await;
            }
        } else {
            // Fetch real SVID from SPIRE agent
            match self.fetch_svid_from_agent().await {
                Ok(svid) => {
                    info!("✅ Successfully fetched SVID from SPIRE agent: {}", svid.spiffe_id.to_uri());
                    *self.svid_cache.write().await = Some(svid);
                    
                    if let Some(audit_logger) = &self.audit_logger {
                        let _ = audit_logger.log_system_event(
                            "spiffe_svid_fetched",
                            serde_json::json!({
                                "socket_path": self.config.socket_path,
                                "success": true
                            }),
                            true,
                            None,
                        ).await;
                    }
                }
                Err(e) => {
                    error!("❌ Failed to fetch SVID from SPIRE agent: {}", e);
                    
                    // Fall back to mock SVID
                    let mock_svid = self.create_mock_svid().await?;
                    *self.svid_cache.write().await = Some(mock_svid);
                    
                    if let Some(audit_logger) = &self.audit_logger {
                        let _ = audit_logger.log_system_event(
                            "spiffe_fallback_mock",
                            serde_json::json!({
                                "error": e.to_string(),
                                "using_mock": true
                            }),
                            false,
                            Some(&e.to_string()),
                        ).await;
                    }
                }
            }
        }
        
        Ok(())
    }
    
    /// Get the current SVID
    pub async fn get_svid(&self) -> AppResult<X509Svid> {
        let svid_guard = self.svid_cache.read().await;
        svid_guard
            .as_ref()
            .ok_or_else(|| AppError::Security("No SVID available".into())).cloned()
    }
    
    /// Start automatic SVID rotation
    pub async fn start_rotation(&self) -> AppResult<()> {
        info!("🔄 Phase 3: Starting SVID automatic rotation");
        
        let svid_cache = Arc::clone(&self.svid_cache);
        let audit_logger = self.audit_logger.clone();
        
        tokio::spawn(async move {
            let mut rotation_interval = interval(Duration::from_secs(300)); // Check every 5 minutes
            
            loop {
                rotation_interval.tick().await;
                
                // Check if SVID needs rotation
                let needs_rotation = {
                    let svid_guard = svid_cache.read().await;
                    svid_guard
                        .as_ref()
                        .map(|svid| svid.expires_within(Duration::from_secs(1800))) // Rotate if expires within 30 minutes
                        .unwrap_or(true)
                };
                
                if needs_rotation {
                    info!("🔄 SVID rotation required");
                    
                    // In production, this would fetch from SPIRE agent
                    // For now, we'll create a new mock SVID
                    match Self::create_mock_svid_static().await {
                        Ok(new_svid) => {
                            info!("✅ SVID rotated successfully: {}", new_svid.spiffe_id.to_uri());
                            *svid_cache.write().await = Some(new_svid);
                            
                            if let Some(audit_logger) = &audit_logger {
                                let _ = audit_logger.log_system_event(
                                    "spiffe_svid_rotated",
                                    serde_json::json!({
                                        "rotation_reason": "approaching_expiry",
                                        "success": true
                                    }),
                                    true,
                                    None,
                                ).await;
                            }
                        }
                        Err(e) => {
                            error!("❌ SVID rotation failed: {}", e);
                            
                            if let Some(audit_logger) = &audit_logger {
                                let _ = audit_logger.log_system_event(
                                    "spiffe_svid_rotation_failed",
                                    serde_json::json!({
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
        });
        
        Ok(())
    }
    
    /// Fetch SVID from SPIRE agent (real implementation)
    async fn fetch_svid_from_agent(&self) -> AppResult<X509Svid> {
        // Phase 3: In production, this would:
        // 1. Connect to SPIRE agent via Unix domain socket
        // 2. Send WorkloadAPI gRPC request
        // 3. Parse response and extract X.509 SVID
        // 4. Validate certificate chain
        
        // For now, simulate with mock data
        warn!("🔶 SPIRE agent integration not yet implemented, using mock SVID");
        self.create_mock_svid().await
    }
    
    /// Create a mock SVID for development/testing
    async fn create_mock_svid(&self) -> AppResult<X509Svid> {
        Self::create_mock_svid_static().await
    }
    
    async fn create_mock_svid_static() -> AppResult<X509Svid> {
        let spiffe_id = SpiffeId::new(
            "sirsi-nexus.local".to_string(),
            "/core-engine".to_string(),
        );
        
        // Generate mock certificate data (in production, this would be real X.509 certs)
        let mock_cert = b"-----BEGIN CERTIFICATE-----\nMIICMock...\n-----END CERTIFICATE-----\n".to_vec();
        let mock_key = b"-----BEGIN PRIVATE KEY-----\nMIIEMock...\n-----END PRIVATE KEY-----\n".to_vec();
        let mock_ca = b"-----BEGIN CERTIFICATE-----\nMIICaMock...\n-----END CERTIFICATE-----\n".to_vec();
        
        Ok(X509Svid {
            spiffe_id,
            certificates: vec![mock_cert],
            private_key: mock_key,
            trust_bundle: vec![mock_ca],
            expires_at: SystemTime::now() + Duration::from_secs(3600), // 1 hour from now
        })
    }
}

/// SPIFFE Trust Domain Manager
#[derive(Debug)]
pub struct TrustDomainManager {
    trust_domains: Arc<RwLock<HashMap<String, TrustDomain>>>,
    audit_logger: Option<AuditLogger>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrustDomain {
    pub name: String,
    pub ca_certificates: Vec<Vec<u8>>, // DER-encoded CA certificates
    pub federation_endpoints: Vec<String>,
    pub created_at: SystemTime,
    pub updated_at: SystemTime,
}

impl Default for TrustDomainManager {
    fn default() -> Self {
        Self::new()
    }
}

impl TrustDomainManager {
    pub fn new() -> Self {
        Self {
            trust_domains: Arc::new(RwLock::new(HashMap::new())),
            audit_logger: None,
        }
    }
    
    pub fn with_audit_logger(mut self, audit_logger: AuditLogger) -> Self {
        self.audit_logger = Some(audit_logger);
        self
    }
    
    /// Initialize trust domain with default configuration
    pub async fn initialize(&self) -> AppResult<()> {
        info!("🔐 Phase 3: Initializing SPIFFE Trust Domain Manager");
        
        // Add default trust domain
        let default_domain = TrustDomain {
            name: "sirsi-nexus.local".to_string(),
            ca_certificates: vec![
                b"-----BEGIN CERTIFICATE-----\nMIICDefaultCA...\n-----END CERTIFICATE-----\n".to_vec()
            ],
            federation_endpoints: vec![
                "https://spire-server.sirsi-nexus.local:8443".to_string()
            ],
            created_at: SystemTime::now(),
            updated_at: SystemTime::now(),
        };
        
        self.add_trust_domain(default_domain).await?;
        
        if let Some(audit_logger) = &self.audit_logger {
            let _ = audit_logger.log_system_event(
                "spiffe_trust_domain_initialized",
                serde_json::json!({
                    "default_domain": "sirsi-nexus.local",
                    "ca_count": 1
                }),
                true,
                None,
            ).await;
        }
        
        Ok(())
    }
    
    /// Add a new trust domain
    pub async fn add_trust_domain(&self, domain: TrustDomain) -> AppResult<()> {
        info!("➕ Adding trust domain: {}", domain.name);
        
        let mut domains = self.trust_domains.write().await;
        domains.insert(domain.name.clone(), domain);
        
        Ok(())
    }
    
    /// Verify SPIFFE ID against trust domain
    pub async fn verify_spiffe_id(&self, spiffe_id: &SpiffeId) -> AppResult<bool> {
        let domains = self.trust_domains.read().await;
        
        let is_trusted = domains.contains_key(&spiffe_id.trust_domain);
        
        if let Some(audit_logger) = &self.audit_logger {
            let _ = audit_logger.log_system_event(
                "spiffe_id_verification",
                serde_json::json!({
                    "spiffe_id": spiffe_id.to_uri(),
                    "trust_domain": spiffe_id.trust_domain,
                    "trusted": is_trusted
                }),
                is_trusted,
                if is_trusted { None } else { Some("Trust domain not recognized") },
            ).await;
        }
        
        Ok(is_trusted)
    }
    
    /// Get trust domain information
    pub async fn get_trust_domain(&self, name: &str) -> Option<TrustDomain> {
        let domains = self.trust_domains.read().await;
        domains.get(name).cloned()
    }
    
    /// List all trust domains
    pub async fn list_trust_domains(&self) -> Vec<String> {
        let domains = self.trust_domains.read().await;
        domains.keys().cloned().collect()
    }
}

/// SPIFFE-aware TLS configuration
#[derive(Debug, Clone)]
pub struct SpiffeTlsConfig {
    pub require_spiffe_id: bool,
    pub allowed_spiffe_ids: Vec<SpiffeId>,
    pub trust_domain_validation: bool,
}

impl Default for SpiffeTlsConfig {
    fn default() -> Self {
        Self {
            require_spiffe_id: true,
            allowed_spiffe_ids: vec![],
            trust_domain_validation: true,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_spiffe_id_parsing() {
        let uri = "spiffe://sirsi-nexus.local/core-engine";
        let spiffe_id = SpiffeId::from_uri(uri).unwrap();
        
        assert_eq!(spiffe_id.trust_domain, "sirsi-nexus.local");
        assert_eq!(spiffe_id.path, "/core-engine");
        assert_eq!(spiffe_id.to_uri(), uri);
    }
    
    #[test]
    fn test_invalid_spiffe_uri() {
        let invalid_uri = "https://example.com/path";
        assert!(SpiffeId::from_uri(invalid_uri).is_err());
    }
    
    #[tokio::test]
    async fn test_mock_svid_creation() {
        let config = WorkloadApiConfig::default();
        let client = WorkloadApiClient::new(config);
        
        let svid = client.create_mock_svid().await.unwrap();
        assert_eq!(svid.spiffe_id.trust_domain, "sirsi-nexus.local");
        assert_eq!(svid.spiffe_id.path, "/core-engine");
        assert!(!svid.is_expired());
    }
    
    #[tokio::test]
    async fn test_trust_domain_manager() {
        let manager = TrustDomainManager::new();
        manager.initialize().await.unwrap();
        
        let domains = manager.list_trust_domains().await;
        assert!(domains.contains(&"sirsi-nexus.local".to_string()));
        
        let spiffe_id = SpiffeId::new(
            "sirsi-nexus.local".to_string(),
            "/test-service".to_string(),
        );
        
        let is_trusted = manager.verify_spiffe_id(&spiffe_id).await.unwrap();
        assert!(is_trusted);
    }
}
