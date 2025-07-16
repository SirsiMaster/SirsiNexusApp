use sqlx::postgres::{PgPool, PgPoolOptions}; // CockroachDB uses PostgreSQL protocol
use std::time::Duration;
use crate::config::DatabaseConfig;

pub type DbPool = PgPool; // CockroachDB connection pool

pub async fn create_pool(config: &DatabaseConfig) -> Result<DbPool, sqlx::Error> {
    // CockroachDB uses PostgreSQL-compatible driver
    let sslmode = config.sslmode.as_deref().unwrap_or("require");
    let database_url = if config.password.is_empty() {
        // Insecure mode (development)
        format!(
            "postgresql://{}@{}:{}/{}?sslmode=disable",
            config.username,
            config.host,
            config.port,
            config.database
        )
    } else {
        // Secure mode with password
        format!(
            "postgresql://{}:{}@{}:{}/{}?sslmode={}",
            config.username,
            config.password,
            config.host,
            config.port,
            config.database,
            sslmode
        )
    };
    
    PgPoolOptions::new()
        .max_connections(config.max_connections)
        .acquire_timeout(Duration::from_secs(3))
        .connect(&database_url)
        .await
}
