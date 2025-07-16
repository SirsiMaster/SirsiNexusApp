use axum::{
    body::Body,
    http::{Request, StatusCode},
    routing::get,
    Router,
};
use jsonwebtoken::{encode, EncodingKey, Header};
use sqlx::postgres::PgPoolOptions;
use tower::ServiceExt;

use sirsi_core::{
    middleware::auth::{AuthUser, Claims},
    models::user::User,
};
use uuid;

async fn setup() -> sqlx::PgPool {
    // Load environment variables from .env file
    dotenv::dotenv().ok();
    
    let db_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgresql://root@localhost:26257/sirsi_nexus?sslmode=disable".to_string());
    
    PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("Failed to connect to database")
}

#[tokio::test]
async fn test_auth_flow() {
    let pool = setup().await;
    
    // Create a test user
    let user = User::create(
        &pool,
        "test_user",
        "test@example.com",
        "password123",
    )
    .await
    .expect("Failed to create test user");

    // Create a valid JWT
    let claims = Claims {
        sub: user.id.to_string(),
        exp: (chrono::Utc::now() + chrono::Duration::hours(1)).timestamp(),
        iat: chrono::Utc::now().timestamp(),
        role: "user".to_string(),
        jti: uuid::Uuid::new_v4().to_string(),
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(b"your-secret-key"),
    )
    .expect("Failed to create token");

    // Test with valid token
    let app1 = Router::new()
        .route("/protected", get(protected_handler))
        .with_state(pool.clone());
        
    let response = app1
        .oneshot(
            Request::builder()
                .uri("/protected")
                .header("Authorization", format!("Bearer {}", token))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    // Test with expired token
    let expired_claims = Claims {
        sub: user.id.to_string(),
        exp: (chrono::Utc::now() - chrono::Duration::hours(1)).timestamp(),
        iat: chrono::Utc::now().timestamp(),
        role: "user".to_string(),
        jti: uuid::Uuid::new_v4().to_string(),
    };

    let expired_token = encode(
        &Header::default(),
        &expired_claims,
        &EncodingKey::from_secret(b"your-secret-key"),
    )
    .expect("Failed to create expired token");

    let app2 = Router::new()
        .route("/protected", get(protected_handler))
        .with_state(pool.clone());

    let response = app2
        .oneshot(
            Request::builder()
                .uri("/protected")
                .header("Authorization", format!("Bearer {}", expired_token))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);

    // Cleanup
sqlx::query!("DELETE FROM users WHERE id = $1", user.id)
        .execute(&pool)
        .await
        .expect("Failed to cleanup test user");
}

async fn protected_handler(_auth: AuthUser) -> &'static str {
    "Protected content"
}
