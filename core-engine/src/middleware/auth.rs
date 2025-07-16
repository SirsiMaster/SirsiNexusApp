use uuid::Uuid;
use axum::{
    async_trait,
    extract::{FromRequestParts},
    http::{header::AUTHORIZATION, request::Parts},
    response::{IntoResponse, Response},
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::{
    error::{AppError, AppResult},
    models::user::User,
    auth::rbac::RbacManager,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,      // User ID
    pub exp: i64,         // Expiration time
    pub iat: i64,         // Issued at time
    pub role: String,     // User role
    pub jti: String,      // JWT ID (for token revocation)
}

#[derive(Debug)]
pub struct AuthUser {
    pub user: User,
    pub user_id: Uuid,
}

/// Permission-checked authenticated user
/// Use this for endpoints that require specific permissions
#[derive(Debug)]
pub struct AuthorizedUser {
    pub user: User,
    pub user_id: Uuid,
    pub required_permissions: Vec<(String, String)>, // (resource, action) pairs
}

impl AuthorizedUser {
    /// Create a new authorized user with permission requirements
    pub fn new(user: User, user_id: Uuid, required_permissions: Vec<(String, String)>) -> Self {
        Self {
            user,
            user_id,
            required_permissions,
        }
    }
    
    /// Check if user has a specific permission
    pub async fn has_permission(&self, rbac_manager: &mut RbacManager, resource: &str, action: &str) -> AppResult<bool> {
        rbac_manager.check_permission(self.user_id, resource, action).await
    }
}

#[async_trait]
impl FromRequestParts<PgPool> for AuthUser
{
    type Rejection = Response;

    async fn from_request_parts(parts: &mut Parts, pool: &PgPool) -> Result<Self, Self::Rejection> {
        // Extract the token from the Authorization header
        let auth_header = parts
            .headers
            .get(AUTHORIZATION)
            .and_then(|value| value.to_str().ok())
            .and_then(|value| value.strip_prefix("Bearer "))
            .ok_or_else(|| AppError::Auth("Missing authorization header".into()).into_response())?;

        // Decode and validate the token
        let mut validation = Validation::default();
        validation.validate_exp = true;
        validation.leeway = 60; // 1 minute leeway for clock skew
        
        let claims = decode::<Claims>(
            auth_header,
            &DecodingKey::from_secret(std::env::var("JWT_SECRET").unwrap_or_else(|_| "your-secret-key".to_string()).as_bytes()),
            &validation
        )
        .map_err(|_| AppError::Auth("Invalid token".into()).into_response())?
        .claims;

        // Parse the user ID from the token
        let user_id = Uuid::parse_str(&claims.sub)
            .map_err(|_| AppError::Auth("Invalid user ID".into()).into_response())?;

        // Get the user from the database
        let user = User::find_by_id(pool, user_id)
            .await
            .map_err(|e| e.into_response())?
            .ok_or_else(|| AppError::Auth("User not found".into()).into_response())?;

        Ok(AuthUser { user, user_id })
    }
}

// Utility function to verify access token
pub async fn verify_token(token: &str) -> AppResult<Claims> {
    let mut validation = Validation::default();
    validation.validate_exp = true;
    validation.leeway = 60; // 1 minute leeway for clock skew
    
    let claims = decode::<Claims>(
        token,
        &DecodingKey::from_secret(std::env::var("JWT_SECRET").unwrap_or_else(|_| "your-secret-key".to_string()).as_bytes()),
        &validation
    )
    .map_err(|_| AppError::Auth("Invalid token".into()))?
    .claims;

    Ok(claims)
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{
        body::Body,
        extract::State,
        http::{Request, StatusCode},
        routing::get,
        Router,
    };
use sqlx::postgres::PgPoolOptions; // CockroachDB connection
    use tower::ServiceExt;

    async fn setup() -> PgPool {
        let db_url = std::env::var("DATABASE_URL")
            .unwrap_or_else(|_| "postgresql://root@localhost:26257/sirsi_test?sslmode=disable".to_string());
        
        PgPoolOptions::new()
            .max_connections(5)
            .connect(&db_url)
            .await
            .expect("Failed to connect to database")
    }

    #[tokio::test]
    async fn test_auth_middleware() {
        let pool = setup().await;
        
        // Create a test router with a protected endpoint
        let app = Router::new()
            .route("/protected", get(protected_handler))
            .with_state(pool.clone());

        // Create a test request without auth header
        let response = app.clone()
            .oneshot(
                Request::builder()
                    .uri("/protected")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);

        // Test with invalid token
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/protected")
                    .header("Authorization", "Bearer invalid_token")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
    }

    async fn protected_handler(_auth: AuthUser) -> &'static str {
        "Protected content"
    }
}
