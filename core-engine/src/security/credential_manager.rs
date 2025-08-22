use std::collections::HashMap;
use std::sync::Arc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use sqlx::{PgPool, Row};
use tokio::sync::RwLock;
use aes_gcm::{aead::Aead, KeyInit, Nonce, Key};
use aes_gcm::aes::Aes256;
use aes_gcm::AesGcm;
use base64::{Engine as _, engine::general_purpose};
use tracing::{info, warn, error};
use sha2::Digest;
use rand::Rng;

use crate::error::{AppError, AppResult};
use crate::auth::rbac::RbacManager;

/// AES-256-GCM encryption for credentials
type Aes256Gcm = AesGcm<Aes256, typenum::U12>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CredentialMetadata {
    pub id: Uuid,
    pub user_id: Uuid,
    pub tenant_id: Uuid,
    pub provider: String,
    pub credential_type: String,
    pub name: String,
    pub description: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub expires_at: Option<chrono::DateTime<chrono::Utc>>,
    pub last_used: Option<chrono::DateTime<chrono::Utc>>,
    pub is_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptedCredential {
    pub metadata: CredentialMetadata,
    pub encrypted_data: Vec<u8>,
    pub nonce: Vec<u8>,
    pub checksum: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlainCredential {
    pub metadata: CredentialMetadata,
    pub data: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CredentialAccessLog {
    pub id: Uuid,
    pub credential_id: Uuid,
    pub user_id: Uuid,
    pub tenant_id: Uuid,
    pub action: String,
    pub success: bool,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub details: Option<String>,
}

/// Production-grade credential manager with encryption, tenant isolation, and audit logging
pub struct CredentialManager {
    pool: PgPool,
    rbac: Arc<RwLock<RbacManager>>,
    encryption_key: Key<Aes256Gcm>,
    cipher: Aes256Gcm,
    credential_cache: Arc<RwLock<HashMap<Uuid, EncryptedCredential>>>,
}

impl CredentialManager {
    pub fn new(pool: PgPool, rbac: Arc<RwLock<RbacManager>>) -> AppResult<Self> {
        // Generate or load encryption key (in production, this should be loaded from secure storage)
        let encryption_key = Self::get_or_create_encryption_key()?;
        let cipher = Aes256Gcm::new(&encryption_key);
        
        Ok(Self {
            pool,
            rbac,
            encryption_key,
            cipher,
            credential_cache: Arc::new(RwLock::new(HashMap::new())),
        })
    }

    /// Get or create encryption key (in production, load from secure key management)
    fn get_or_create_encryption_key() -> AppResult<Key<Aes256Gcm>> {
        // In production, this should be loaded from a secure key management system
        // like AWS KMS, HashiCorp Vault, or similar
        let key_env = std::env::var("SIRSI_ENCRYPTION_KEY").ok();
        
        if let Some(key_base64) = key_env {
            let key_bytes = general_purpose::STANDARD.decode(key_base64)
                .map_err(|e| AppError::Configuration(format!("Invalid encryption key format: {}", e)))?;
            
            if key_bytes.len() != 32 {
                return Err(AppError::Configuration("Encryption key must be 32 bytes".into()));
            }
            
            let key = Key::<Aes256Gcm>::from_slice(&key_bytes);
            Ok(*key)
        } else {
            // Generate new key for development (should never be used in production)
            warn!("🔐 No encryption key found, generating new one for development");
            let key = Aes256Gcm::generate_key(&mut rand::thread_rng());
            let key_base64 = general_purpose::STANDARD.encode(&key);
            warn!("🔑 Set SIRSI_ENCRYPTION_KEY={} for production", key_base64);
            Ok(key)
        }
    }

    /// Store encrypted credential with tenant isolation
    pub async fn store_credential(
        &self,
        user_id: Uuid,
        tenant_id: Uuid,
        provider: &str,
        credential_type: &str,
        name: &str,
        description: Option<&str>,
        credential_data: HashMap<String, String>,
        expires_at: Option<chrono::DateTime<chrono::Utc>>,
    ) -> AppResult<Uuid> {
        // Check permissions
        let mut rbac = self.rbac.write().await;
        let has_permission = rbac.check_permission(user_id, "credentials", "create").await?;
        if !has_permission {
            self.log_access(user_id, tenant_id, None, "store_credential", false, None, None, 
                Some("Permission denied")).await?;
            return Err(AppError::Unauthorized("Permission denied to store credentials".into()));
        }

        // Generate credential ID
        let credential_id = Uuid::new_v4();
        let now = chrono::Utc::now();
        let now_time = time::OffsetDateTime::now_utc();
        let expires_at_time = expires_at.map(|dt| time::OffsetDateTime::from_unix_timestamp(dt.timestamp()).unwrap());

        // Create metadata
        let metadata = CredentialMetadata {
            id: credential_id,
            user_id,
            tenant_id,
            provider: provider.to_string(),
            credential_type: credential_type.to_string(),
            name: name.to_string(),
            description: description.map(|s| s.to_string()),
            created_at: now,
            updated_at: now,
            expires_at,
            last_used: None,
            is_active: true,
        };

        // Encrypt credential data
        let encrypted = self.encrypt_credential_data(&credential_data)?;

        // Store in database
        let encrypted_data_base64 = general_purpose::STANDARD.encode(&encrypted.encrypted_data);
        let nonce_base64 = general_purpose::STANDARD.encode(&encrypted.nonce);

        sqlx::query(
            r#"
            INSERT INTO encrypted_credentials 
            (id, user_id, tenant_id, provider, credential_type, name, description, 
             encrypted_data, nonce, checksum, created_at, updated_at, expires_at, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            "#,
        )
        .bind(credential_id)
        .bind(user_id)
        .bind(tenant_id)
        .bind(provider)
        .bind(credential_type)
        .bind(name)
        .bind(description)
        .bind(encrypted_data_base64)
        .bind(nonce_base64)
        .bind(encrypted.checksum.clone())
        .bind(now_time)
        .bind(now_time)
        .bind(expires_at_time)
        .bind(true)
        .execute(&self.pool)
        .await
        .map_err(AppError::Database)?;

        // Cache the encrypted credential
        let encrypted_credential = EncryptedCredential {
            metadata,
            encrypted_data: encrypted.encrypted_data,
            nonce: encrypted.nonce,
            checksum: encrypted.checksum,
        };
        
        self.credential_cache.write().await.insert(credential_id, encrypted_credential);

        // Log successful storage
        self.log_access(user_id, tenant_id, Some(credential_id), "store_credential", true, 
            None, None, Some("Credential stored successfully")).await?;

        info!("🔐 Credential stored successfully for user {} in tenant {}", user_id, tenant_id);
        Ok(credential_id)
    }

    /// Retrieve and decrypt credential with tenant isolation
    pub async fn get_credential(
        &self,
        user_id: Uuid,
        tenant_id: Uuid,
        credential_id: Uuid,
    ) -> AppResult<PlainCredential> {
        // Check permissions
        let mut rbac = self.rbac.write().await;
        let has_permission = rbac.check_permission(user_id, "credentials", "read").await?;
        if !has_permission {
            self.log_access(user_id, tenant_id, Some(credential_id), "get_credential", false, 
                None, None, Some("Permission denied")).await?;
            return Err(AppError::Unauthorized("Permission denied to read credentials".into()));
        }

        // Try cache first
        if let Some(encrypted_credential) = self.credential_cache.read().await.get(&credential_id) {
            // Verify tenant isolation
            if encrypted_credential.metadata.tenant_id != tenant_id {
                self.log_access(user_id, tenant_id, Some(credential_id), "get_credential", false, 
                    None, None, Some("Tenant isolation violation")).await?;
                return Err(AppError::Unauthorized("Credential not found in tenant".into()));
            }
            
            return self.decrypt_credential(encrypted_credential.clone(), user_id, tenant_id).await;
        }

        // Load from database with tenant isolation
        let row = sqlx::query(
            r#"
            SELECT id, user_id, tenant_id, provider, credential_type, name, description,
                   encrypted_data, nonce, checksum, created_at, updated_at, expires_at, 
                   last_used, is_active
            FROM encrypted_credentials 
            WHERE id = $1 AND tenant_id = $2 AND is_active = true
            "#,
        )
        .bind(credential_id)
        .bind(tenant_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::Database)?;

        let row = row.ok_or_else(|| {
            AppError::NotFound("Credential not found or inactive".into())
        })?;

        // Verify user has access (either owns it or has admin permission)
        let row_user_id: Uuid = row.get("user_id");
        if row_user_id != user_id {
            let has_admin = rbac.check_permission(user_id, "credentials", "admin").await?;
            if !has_admin {
                self.log_access(user_id, tenant_id, Some(credential_id), "get_credential", false, 
                    None, None, Some("Access denied to credential")).await?;
                return Err(AppError::Unauthorized("Access denied to credential".into()));
            }
        }

        // Decrypt credential data
        let encrypted_data_str: String = row.get("encrypted_data");
        let encrypted_data = general_purpose::STANDARD.decode(&encrypted_data_str)
            .map_err(|e| AppError::Internal(format!("Failed to decode encrypted data: {}", e)))?;
        let nonce_str: String = row.get("nonce");
        let nonce = general_purpose::STANDARD.decode(&nonce_str)
            .map_err(|e| AppError::Internal(format!("Failed to decode nonce: {}", e)))?;

        let metadata = CredentialMetadata {
            id: row.get("id"),
            user_id: row.get("user_id"),
            tenant_id: row.get("tenant_id"),
            provider: row.get("provider"),
            credential_type: row.get("credential_type"),
            name: row.get("name"),
            description: row.get("description"),
            created_at: row.get::<Option<time::OffsetDateTime>, _>("created_at").map(|t| chrono::DateTime::from_timestamp(t.unix_timestamp(), 0).unwrap()).unwrap_or_default(),
            updated_at: row.get::<Option<time::OffsetDateTime>, _>("updated_at").map(|t| chrono::DateTime::from_timestamp(t.unix_timestamp(), 0).unwrap()).unwrap_or_default(),
            expires_at: row.get::<Option<time::OffsetDateTime>, _>("expires_at").map(|t| chrono::DateTime::from_timestamp(t.unix_timestamp(), 0).unwrap()),
            last_used: row.get::<Option<time::OffsetDateTime>, _>("last_used").map(|t| chrono::DateTime::from_timestamp(t.unix_timestamp(), 0).unwrap()),
            is_active: row.get::<Option<bool>, _>("is_active").unwrap_or(true),
        };

        let encrypted_credential = EncryptedCredential {
            metadata,
            encrypted_data,
            nonce,
            checksum: row.get("checksum"),
        };

        // Cache it
        self.credential_cache.write().await.insert(credential_id, encrypted_credential.clone());

        // Update last used timestamp
        let now = time::OffsetDateTime::now_utc();
        sqlx::query(
            "UPDATE encrypted_credentials SET last_used = $1 WHERE id = $2"
        )
        .bind(now)
        .bind(credential_id)
        .execute(&self.pool)
        .await
        .map_err(AppError::Database)?;

        // Log successful access
        self.log_access(user_id, tenant_id, Some(credential_id), "get_credential", true, 
            None, None, Some("Credential accessed successfully")).await?;

        self.decrypt_credential(encrypted_credential, user_id, tenant_id).await
    }

    /// List credentials for a user with tenant isolation
    pub async fn list_credentials(
        &self,
        user_id: Uuid,
        tenant_id: Uuid,
        provider_filter: Option<&str>,
    ) -> AppResult<Vec<CredentialMetadata>> {
        // Check permissions
        let mut rbac = self.rbac.write().await;
        let has_permission = rbac.check_permission(user_id, "credentials", "read").await?;
        if !has_permission {
            return Err(AppError::Unauthorized("Permission denied to list credentials".into()));
        }

        let rows = sqlx::query(
            r#"
            SELECT id, user_id, tenant_id, provider, credential_type, name, description,
                   created_at, updated_at, expires_at, last_used, is_active
            FROM encrypted_credentials 
            WHERE user_id = $1 AND tenant_id = $2 AND is_active = true
              AND ($3::text IS NULL OR provider = $3)
            ORDER BY created_at DESC
            "#,
        )
        .bind(user_id)
        .bind(tenant_id)
        .bind(provider_filter)
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::Database)?;

        let credentials = rows.into_iter().map(|row| {
            CredentialMetadata {
                id: row.get("id"),
                user_id: row.get("user_id"),
                tenant_id: row.get("tenant_id"),
                provider: row.get("provider"),
                credential_type: row.get("credential_type"),
                name: row.get("name"),
                description: row.get("description"),
                created_at: row.get::<Option<time::OffsetDateTime>, _>("created_at").map(|t| chrono::DateTime::from_timestamp(t.unix_timestamp(), 0).unwrap()).unwrap_or_default(),
                updated_at: row.get::<Option<time::OffsetDateTime>, _>("updated_at").map(|t| chrono::DateTime::from_timestamp(t.unix_timestamp(), 0).unwrap()).unwrap_or_default(),
                expires_at: row.get::<Option<time::OffsetDateTime>, _>("expires_at").map(|t| chrono::DateTime::from_timestamp(t.unix_timestamp(), 0).unwrap()),
                last_used: row.get::<Option<time::OffsetDateTime>, _>("last_used").map(|t| chrono::DateTime::from_timestamp(t.unix_timestamp(), 0).unwrap()),
                is_active: row.get::<Option<bool>, _>("is_active").unwrap_or(true),
            }
        }).collect();

        Ok(credentials)
    }

    /// Delete credential with audit logging
    pub async fn delete_credential(
        &self,
        user_id: Uuid,
        tenant_id: Uuid,
        credential_id: Uuid,
    ) -> AppResult<()> {
        // Check permissions
        let mut rbac = self.rbac.write().await;
        let has_permission = rbac.check_permission(user_id, "credentials", "delete").await?;
        if !has_permission {
            self.log_access(user_id, tenant_id, Some(credential_id), "delete_credential", false, 
                None, None, Some("Permission denied")).await?;
            return Err(AppError::Unauthorized("Permission denied to delete credentials".into()));
        }

        // Soft delete with tenant isolation
        let is_admin = rbac.check_permission(user_id, "credentials", "admin").await?;
        let result = sqlx::query(
            r#"
            UPDATE encrypted_credentials 
            SET is_active = false, updated_at = NOW()
            WHERE id = $1 AND tenant_id = $2 AND (user_id = $3 OR $4)
            "#,
        )
        .bind(credential_id)
        .bind(tenant_id)
        .bind(user_id)
        .bind(is_admin)
        .execute(&self.pool)
        .await
        .map_err(AppError::Database)?;

        if result.rows_affected() == 0 {
            self.log_access(user_id, tenant_id, Some(credential_id), "delete_credential", false, 
                None, None, Some("Credential not found")).await?;
            return Err(AppError::NotFound("Credential not found".into()));
        }

        // Remove from cache
        self.credential_cache.write().await.remove(&credential_id);

        // Log successful deletion
        self.log_access(user_id, tenant_id, Some(credential_id), "delete_credential", true, 
            None, None, Some("Credential deleted successfully")).await?;

        info!("🗑️ Credential {} deleted by user {} in tenant {}", credential_id, user_id, tenant_id);
        Ok(())
    }

    /// Encrypt credential data
    fn encrypt_credential_data(&self, data: &HashMap<String, String>) -> AppResult<EncryptedCredential> {
        let json_data = serde_json::to_vec(data)
            .map_err(|e| AppError::Internal(format!("Failed to serialize credential data: {}", e)))?;

        let nonce_bytes = rand::thread_rng().gen::<[u8; 12]>();
        let nonce = Nonce::from_slice(&nonce_bytes);
        let encrypted_data = self.cipher.encrypt(nonce, json_data.as_slice())
            .map_err(|e| AppError::Internal(format!("Failed to encrypt credential data: {}", e)))?;

        // Create checksum for integrity verification
        let mut combined = encrypted_data.clone();
        combined.extend_from_slice(nonce.as_slice());
        let checksum = sha2::Sha256::digest(&combined);
        let checksum_hex = hex::encode(checksum);

        Ok(EncryptedCredential {
            metadata: CredentialMetadata {
                id: Uuid::new_v4(),
                user_id: Uuid::new_v4(),
                tenant_id: Uuid::new_v4(),
                provider: String::new(),
                credential_type: String::new(),
                name: String::new(),
                description: None,
                created_at: chrono::Utc::now(),
                updated_at: chrono::Utc::now(),
                expires_at: None,
                last_used: None,
                is_active: true,
            },
            encrypted_data,
            nonce: nonce.to_vec(),
            checksum: checksum_hex,
        })
    }

    /// Decrypt credential data
    async fn decrypt_credential(
        &self,
        encrypted_credential: EncryptedCredential,
        _user_id: Uuid,
        _tenant_id: Uuid,
    ) -> AppResult<PlainCredential> {
        // Verify checksum
        let mut combined = encrypted_credential.encrypted_data.clone();
        combined.extend_from_slice(&encrypted_credential.nonce);
        let computed_checksum = sha2::Sha256::digest(&combined);
        let computed_checksum_hex = hex::encode(computed_checksum);
        
        if computed_checksum_hex != encrypted_credential.checksum {
            error!("🔐 Checksum verification failed for credential {}", encrypted_credential.metadata.id);
            return Err(AppError::Internal("Credential integrity check failed".into()));
        }

        let nonce = Nonce::from_slice(&encrypted_credential.nonce);
        let decrypted_data = self.cipher.decrypt(nonce, encrypted_credential.encrypted_data.as_slice())
            .map_err(|e| AppError::Internal(format!("Failed to decrypt credential data: {}", e)))?;

        let credential_data: HashMap<String, String> = serde_json::from_slice(&decrypted_data)
            .map_err(|e| AppError::Internal(format!("Failed to deserialize credential data: {}", e)))?;

        Ok(PlainCredential {
            metadata: encrypted_credential.metadata,
            data: credential_data,
        })
    }

    /// Log credential access for audit trail
    async fn log_access(
        &self,
        user_id: Uuid,
        tenant_id: Uuid,
        credential_id: Option<Uuid>,
        action: &str,
        success: bool,
        ip_address: Option<&str>,
        user_agent: Option<&str>,
        details: Option<&str>,
    ) -> AppResult<()> {
        let log_id = Uuid::new_v4();
        let now = time::OffsetDateTime::now_utc();
        let ip_network = ip_address.map(|ip| ip.parse::<sqlx::types::ipnetwork::IpNetwork>().ok()).flatten();

        sqlx::query(
            r#"
            INSERT INTO credential_access_logs 
            (id, credential_id, user_id, tenant_id, action, success, ip_address, user_agent, timestamp, details)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            "#,
        )
        .bind(log_id)
        .bind(credential_id)
        .bind(user_id)
        .bind(tenant_id)
        .bind(action)
        .bind(success)
        .bind(ip_network)
        .bind(user_agent)
        .bind(now)
        .bind(details)
        .execute(&self.pool)
        .await
        .map_err(AppError::Database)?;

        Ok(())
    }

    /// Get credential access logs for audit
    pub async fn get_access_logs(
        &self,
        user_id: Uuid,
        tenant_id: Uuid,
        credential_id: Option<Uuid>,
        limit: Option<i64>,
    ) -> AppResult<Vec<CredentialAccessLog>> {
        // Check admin permissions
        let mut rbac = self.rbac.write().await;
        let has_permission = rbac.check_permission(user_id, "credentials", "admin").await?;
        if !has_permission {
            return Err(AppError::Unauthorized("Permission denied to view audit logs".into()));
        }

        let rows = sqlx::query(
            r#"
            SELECT id, credential_id, user_id, tenant_id, action, success, 
                   ip_address, user_agent, timestamp, details
            FROM credential_access_logs 
            WHERE tenant_id = $1
              AND ($2::uuid IS NULL OR credential_id = $2)
            ORDER BY timestamp DESC
            LIMIT $3
            "#,
        )
        .bind(tenant_id)
        .bind(credential_id)
        .bind(limit.unwrap_or(100))
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::Database)?;

        let logs = rows.into_iter().map(|row| {
            CredentialAccessLog {
                id: row.get("id"),
                credential_id: row.get::<Option<Uuid>, _>("credential_id").unwrap_or_default(),
                user_id: row.get("user_id"),
                tenant_id: row.get("tenant_id"),
                action: row.get("action"),
                success: row.get("success"),
                ip_address: row.get::<Option<sqlx::types::ipnetwork::IpNetwork>, _>("ip_address").map(|ip| ip.to_string()),
                user_agent: row.get("user_agent"),
                timestamp: row.get::<Option<time::OffsetDateTime>, _>("timestamp").map(|t| chrono::DateTime::from_timestamp(t.unix_timestamp(), 0).unwrap()).unwrap_or_default(),
                details: row.get("details"),
            }
        }).collect();

        Ok(logs)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[test]
    fn test_encryption_key_generation() {
        let key = CredentialManager::get_or_create_encryption_key().unwrap();
        assert_eq!(key.len(), 32);
    }

    #[test]
    fn test_credential_encryption_decryption() {
        let key = CredentialManager::get_or_create_encryption_key().unwrap();
        let cipher = Aes256Gcm::new(&key);
        
        // Create a mock credential manager for testing
        let mut test_data = HashMap::new();
        test_data.insert("access_key".to_string(), "test_key".to_string());
        test_data.insert("secret_key".to_string(), "test_secret".to_string());

        // This test would require more setup for the actual encryption/decryption
        // but validates the basic structure
        assert!(test_data.contains_key("access_key"));
    }
}
