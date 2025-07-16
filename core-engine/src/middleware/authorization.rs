// Phase 3: Enterprise Authorization Middleware with Security Monitoring
// This middleware provides real-time permission checking with threat detection

use std::collections::HashMap;
use axum::{
    extract::State,
    http::{HeaderMap, Request},
    middleware::Next,
    response::Response,
};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    error::{AppError, AppResult},
    models::user::User,
    auth::rbac::RbacManager,
    audit::{AuditLogger, AuditContext},
    middleware::auth::AuthUser,
};

#[derive(Debug, Clone)]
pub struct AuthorizationConfig {
    pub require_permissions: Vec<(String, String)>, // (resource, action) pairs
    pub allow_admin_override: bool,
    pub audit_enabled: bool,
}

impl Default for AuthorizationConfig {
    fn default() -> Self {
        Self {
            require_permissions: vec![],
            allow_admin_override: true,
            audit_enabled: true,
        }
    }
}

/// Phase 3: Authorization context with detailed tracking
#[derive(Debug, Clone)]
pub struct AuthorizationContext {
    pub user_id: Uuid,
    pub user: User,
    pub permissions_checked: Vec<String>,
    pub permissions_granted: Vec<String>,
    pub permissions_denied: Vec<String>,
    pub is_admin: bool,
    pub session_context: AuditContext,
}

impl AuthorizationContext {
    pub fn new(user: User, user_id: Uuid, audit_context: AuditContext) -> Self {
        Self {
            user_id,
            user,
            permissions_checked: vec![],
            permissions_granted: vec![],
            permissions_denied: vec![],
            is_admin: false, // Will be set async
            session_context: audit_context,
        }
    }
    
    pub async fn check_admin_role(&mut self, rbac_manager: &mut RbacManager) {
        if let Ok(roles) = rbac_manager.get_user_roles(self.user_id).await {
            for role in roles {
                if role.name == "admin" || role.name == "super_admin" {
                    self.is_admin = true;
                    break;
                }
            }
        }
    }
    
    pub fn has_any_permission(&self) -> bool {
        !self.permissions_granted.is_empty() || self.is_admin
    }
}

/// Phase 3: Authorization middleware function
pub async fn authorization_middleware<B>(
    State(pool): State<PgPool>,
    mut request: Request<B>,
    next: Next<B>,
) -> Result<Response, AppError> 
where
    B: Send + 'static,
{
    tracing::info!("🔐 Phase 3: Authorization middleware - checking permissions");
    
    // Get authorization config from request extensions (set by route handlers)
    let auth_config = request
        .extensions()
        .get::<AuthorizationConfig>()
        .cloned()
        .unwrap_or_default();
    
    if auth_config.require_permissions.is_empty() {
        tracing::debug!("🔓 No permissions required for this endpoint");
        return Ok(next.run(request).await);
    }
    
    // Extract user info from the authenticated request
    let auth_user = request
        .extensions()
        .get::<AuthUser>()
        .ok_or_else(|| AppError::Auth("User not authenticated".into()))?;
    
    // Create audit context
    let headers = request.headers();
    let audit_context = create_audit_context(auth_user, headers)?;
    
    // Initialize RBAC and audit managers
    let mut rbac_manager = RbacManager::new(pool.clone());
    let audit_logger = AuditLogger::new(pool.clone());
    
    // Create authorization context
    let mut auth_context = AuthorizationContext::new(
        auth_user.user.clone(),
        auth_user.user_id,
        audit_context.clone(),
    );
    
    // Check admin role asynchronously
    auth_context.check_admin_role(&mut rbac_manager).await;
    
    // Check all required permissions
    let mut all_permissions_granted = true;
    let mut permission_results = HashMap::new();
    
    for (resource, action) in &auth_config.require_permissions {
        let permission_key = format!("{}:{}", resource, action);
        auth_context.permissions_checked.push(permission_key.clone());
        
        let has_permission = if auth_context.is_admin && auth_config.allow_admin_override {
            tracing::debug!("🔑 Admin override granted for {}", permission_key);
            true
        } else {
            match rbac_manager.check_permission(auth_user.user_id, resource, action).await {
                Ok(has_perm) => has_perm,
                Err(e) => {
                    tracing::error!("❌ Permission check failed for {}: {}", permission_key, e);
                    
                    // Log system error
                    if auth_config.audit_enabled {
                        let _ = audit_logger.log_system_event(
                            "permission_check_error",
                            serde_json::json!({
                                "user_id": auth_user.user_id,
                                "permission": permission_key,
                                "error": e.to_string()
                            }),
                            false,
                            Some(&e.to_string()),
                        ).await;
                    }
                    
                    false
                }
            }
        };
        
        permission_results.insert(permission_key.clone(), has_permission);
        
        if has_permission {
            auth_context.permissions_granted.push(permission_key.clone());
        } else {
            auth_context.permissions_denied.push(permission_key.clone());
            all_permissions_granted = false;
        }
        
        // Phase 3: Log each permission check
        if auth_config.audit_enabled {
            let _ = audit_logger.log_authorization(
                "permission_check",
                resource,
                Some(&permission_key),
                Some(auth_user.user_id),
                serde_json::json!({
                    "permission": permission_key,
                    "resource": resource,
                    "action": action,
                    "granted": has_permission,
                    "admin_override": auth_context.is_admin && auth_config.allow_admin_override,
                    "endpoint": request.uri().path()
                }),
                audit_context.clone(),
                has_permission,
                if has_permission { None } else { Some("Permission denied") },
            ).await;
        }
    }
    
    if all_permissions_granted {
        tracing::info!("✅ All permissions granted for user {}", auth_user.user_id);
        
        // Add authorization context to request for use by handlers
        request.extensions_mut().insert(auth_context);
        
        Ok(next.run(request).await)
    } else {
        tracing::warn!("❌ Access denied for user {} - missing permissions: {:?}", 
            auth_user.user_id, auth_context.permissions_denied);
        
        // Phase 3: Log comprehensive access denial
        if auth_config.audit_enabled {
            let _ = audit_logger.log_authorization(
                "access_denied",
                "endpoint",
                Some(request.uri().path()),
                Some(auth_user.user_id),
                serde_json::json!({
                    "endpoint": request.uri().path(),
                    "required_permissions": auth_config.require_permissions,
                    "granted_permissions": auth_context.permissions_granted,
                    "denied_permissions": auth_context.permissions_denied,
                    "reason": "insufficient_permissions"
                }),
                audit_context,
                false,
                Some("Access denied: insufficient permissions"),
            ).await;
        }
        
        Err(AppError::Forbidden("Insufficient permissions".into()))
    }
}

/// Helper function to create audit context from request
fn create_audit_context(auth_user: &AuthUser, headers: &HeaderMap) -> AppResult<AuditContext> {
    let ip_address = headers
        .get("x-forwarded-for")
        .or_else(|| headers.get("x-real-ip"))
        .and_then(|v| v.to_str().ok())
        .map(|s| s.split(',').next().unwrap_or(s).trim().to_string());
    
    let user_agent = headers
        .get("user-agent")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());
    
    Ok(AuditContext {
        user_id: Some(auth_user.user_id),
        session_id: None, // Could be extracted from JWT claims if available
        ip_address,
        user_agent,
    })
}

/// Phase 3: Permission requirement builder for route handlers
#[derive(Debug, Clone)]
pub struct RequirePermissions {
    permissions: Vec<(String, String)>,
    allow_admin_override: bool,
}

impl Default for RequirePermissions {
    fn default() -> Self {
        Self::new()
    }
}

impl RequirePermissions {
    pub fn new() -> Self {
        Self {
            permissions: vec![],
            allow_admin_override: true,
        }
    }
    
    pub fn permission(mut self, resource: impl Into<String>, action: impl Into<String>) -> Self {
        self.permissions.push((resource.into(), action.into()));
        self
    }
    
    pub fn admin_override(mut self, allow: bool) -> Self {
        self.allow_admin_override = allow;
        self
    }
    
    pub fn build(self) -> AuthorizationConfig {
        AuthorizationConfig {
            require_permissions: self.permissions,
            allow_admin_override: self.allow_admin_override,
            audit_enabled: true,
        }
    }
}

/// Convenience macro for defining permission requirements
#[macro_export]
macro_rules! require_permissions {
    ($($resource:expr => $action:expr),*) => {
        {
            let mut req = $crate::middleware::authorization::RequirePermissions::new();
            $(
                req = req.permission($resource, $action);
            )*
            req.build()
        }
    };
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    
    #[test]
    fn test_permission_builder() {
        let config = RequirePermissions::new()
            .permission("users", "read")
            .permission("users", "write")
            .admin_override(false)
            .build();
        
        assert_eq!(config.require_permissions.len(), 2);
        assert!(!config.allow_admin_override);
    }
    
    #[test]
    fn test_permission_macro() {
        let config = require_permissions!(
            "users" => "read",
            "agents" => "manage"
        );
        
        assert_eq!(config.require_permissions.len(), 2);
        assert!(config.allow_admin_override);
    }
}
