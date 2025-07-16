use axum::{
    extract::State,
    Json,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool; // CockroachDB uses PostgreSQL protocol
use validator::Validate;

use crate::{
    error::AppResult,
    models::user::User,
};

// Router function for backwards compatibility
use axum::{routing::post, Router};

pub fn router() -> Router<PgPool> {
    Router::new()
        .route("/register", post(register_handler))
        .route("/login", post(login_handler))
}

#[derive(Debug, Deserialize, Validate, Clone)]
pub struct RegisterRequest {
    #[validate(length(min = 1))]
    pub name: String,
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 8))]
    pub password: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}
#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub user: User,
}

#[axum::debug_handler]
pub async fn register_handler(
    State(pool): State<PgPool>,
    Json(payload): Json<RegisterRequest>,
) -> AppResult<Json<AuthResponse>> {
    // Validate request
    payload.validate().map_err(|e| crate::error::AppError::Validation(e.to_string()))?;

    // Hash password
    use argon2::{Argon2, PasswordHasher};
    use argon2::password_hash::SaltString;
    use argon2::password_hash::rand_core::OsRng;
    
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2.hash_password(payload.password.as_bytes(), &salt)
        .map_err(|e| crate::error::AppError::Internal(e.to_string()))?;
    let password_hash = password_hash.to_string();

    // Create user
    let user = User::create(
        &pool,
        &payload.name,
        &payload.email,
        &password_hash,
    ).await?;

    // Generate JWT token
    let token = create_jwt_token(&user)?;

    Ok(Json(AuthResponse { token, user }))
}

#[axum::debug_handler]
pub async fn login_handler(
    State(pool): State<PgPool>,
    Json(payload): Json<LoginRequest>,
) -> AppResult<Json<AuthResponse>> {
    // Find user by email
    let user = User::find_by_email(&pool, &payload.email)
        .await?
        .ok_or_else(|| crate::error::AppError::Auth("Invalid email or password".into()))?;

    // Verify password
    use argon2::{Argon2, PasswordVerifier};
    use argon2::password_hash::PasswordHash;
    
    let parsed_hash = PasswordHash::new(&user.password_hash)
        .map_err(|e| crate::error::AppError::Internal(e.to_string()))?;
    let argon2 = Argon2::default();
    let is_valid = argon2.verify_password(payload.password.as_bytes(), &parsed_hash).is_ok();

    if !is_valid {
        return Err(crate::error::AppError::Auth("Invalid email or password".into()));
    }

    // Generate JWT token
    let token = create_jwt_token(&user)?;

    Ok(Json(AuthResponse { token, user }))
}

fn create_jwt_token(user: &User) -> AppResult<String> {
    use jsonwebtoken::{encode, EncodingKey, Header};
    use serde::{Deserialize, Serialize};
    use time::OffsetDateTime;

    #[derive(Debug, Serialize, Deserialize)]
    struct Claims {
        sub: String, // User ID
        exp: i64,    // Expiration time
        iat: i64,    // Issued at
    }

    let now = OffsetDateTime::now_utc();
    let expiry = now + time::Duration::hours(24); // Token expires in 24 hours

    let claims = Claims {
        sub: user.id.to_string(),
        exp: expiry.unix_timestamp(),
        iat: now.unix_timestamp(),
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(b"your-secret-key"), // In production, use a proper secret
    ).map_err(|e| crate::error::AppError::Internal(e.to_string()))?;

    Ok(token)
}

#[cfg(test)]
mod tests {
    use super::*;
use sqlx::postgres::PgPoolOptions; // CockroachDB connection
    use uuid::Uuid;

    async fn setup() -> PgPool {
        // Load environment variables from .env file
        dotenv::dotenv().ok();
        
        let db_url = std::env::var("DATABASE_URL")
            .unwrap_or_else(|_| "postgresql://root@localhost:26257/sirsi_nexus?sslmode=disable".to_string());
        
        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(&db_url)
            .await
            .expect("Failed to connect to database");

        // Clear test database
        sqlx::query("TRUNCATE users CASCADE")
            .execute(&pool)
            .await
            .expect("Failed to clear test database");

        pool
    }

    #[tokio::test]
    #[serial_test::serial]
    async fn test_register_handler() {
        let pool = setup().await;

        let request = RegisterRequest {
            email: format!("test{}@example.com", Uuid::new_v4()),
            password: "password123".to_string(),
            name: "Test User".to_string(),
        };

        let result = register_handler(
            State(pool.clone()),
            Json(request.clone()),
        ).await;

        assert!(result.is_ok());
        let response = result.unwrap();
        assert_eq!(response.0.user.email, request.email);
        assert_eq!(response.0.user.name, request.name);
        assert!(!response.0.token.is_empty());
    }

    #[tokio::test]
    #[serial_test::serial]
    async fn test_login_handler() {
        let pool = setup().await;

        // First register a user
        let email = format!("test{}@example.com", Uuid::new_v4());
        let password = "password123".to_string();
        let request = RegisterRequest {
            email: email.clone(),
            password: password.clone(),
            name: "Test User".to_string(),
        };

        let _ = register_handler(
            State(pool.clone()),
            Json(request),
        ).await.unwrap();

        // Now try to login
        let login_request = LoginRequest {
            email: email.clone(),
            password,
        };

        let result = login_handler(
            State(pool.clone()),
            Json(login_request),
        ).await;

        assert!(result.is_ok());
        let response = result.unwrap();
        assert_eq!(response.0.user.email, email);
        assert!(!response.0.token.is_empty());
    }
}
