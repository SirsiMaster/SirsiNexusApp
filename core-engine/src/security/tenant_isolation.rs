use std::collections::HashMap;
use uuid::Uuid;
use async_trait::async_trait;
use crate::error::{AppError, AppResult};

#[derive(Debug, Clone)]
pub struct TenantResource {
    pub tenant_id: Uuid,
    pub resources: HashMap<String, String>,
}

#[derive(Debug, Clone)]
pub struct TenantContext {
    pub tenant_id: Uuid,
    pub user_roles: Vec<String>,
    pub resources: Vec<TenantResource>,
}

#[async_trait]
pub trait TenantIsolation {
    async fn load_tenant_context(tenant_id: Uuid, user_id: Uuid) -> AppResult<TenantContext>;
    async fn validate_access(tenant_id: Uuid, user_id: Uuid, resource: &str, action: &str) -> AppResult<bool>;
    async fn list_tenant_resources(tenant_id: Uuid, user_id: Uuid) -> AppResult<Vec<TenantResource>>;
}

pub struct TenantIsolationManager;

#[async_trait]
impl TenantIsolation for TenantIsolationManager {
    async fn load_tenant_context(tenant_id: Uuid, _user_id: Uuid) -> AppResult<TenantContext> {
        // Simplified mock logic for tenant context
        Ok(TenantContext {
            tenant_id,
            user_roles: vec!["user".to_string()],
            resources: vec![TenantResource {
                tenant_id,
                resources: HashMap::from([
                    ("resource1".to_string(), "allowed".to_string()),
                    ("resource2".to_string(), "denied".to_string()),
                ]),
            }],
        })
    }

    async fn validate_access(tenant_id: Uuid, user_id: Uuid, resource: &str, _action: &str) -> AppResult<bool> {
        // Example validation logic
        let context = Self::load_tenant_context(tenant_id, user_id).await?;

        for res in context.resources {
            if res.resources.contains_key(resource) && res.resources[resource] == "allowed" {
                return Ok(true);
            }
        }

        Err(AppError::Unauthorized(format!("Access denied for resource: {}", resource)))
    }

    async fn list_tenant_resources(tenant_id: Uuid, user_id: Uuid) -> AppResult<Vec<TenantResource>> {
        Ok(Self::load_tenant_context(tenant_id, user_id).await?.resources)
    }
}
