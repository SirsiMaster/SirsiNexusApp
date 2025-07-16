use sirsi_core::db::create_pool;
use sirsi_core::config::DatabaseConfig;
use sqlx::Row;

#[tokio::test]
async fn test_cockroachdb_connection() {
    let config = DatabaseConfig {
        host: "localhost".to_string(),
        port: 26257,
        username: "root".to_string(),
        password: "".to_string(),
        database: "sirsi_test".to_string(),
        max_connections: 5,
        ssl_ca_cert: None,
        sslmode: Some("disable".to_string()),
        url: "postgresql://root@localhost:26257/sirsi_test?sslmode=disable".to_string(),
    };

    let pool = create_pool(&config).await.expect("Failed to create database pool");
    
    // Test basic connectivity
    let row = sqlx::query("SELECT 1 as test_value")
        .fetch_one(&pool)
        .await
        .expect("Failed to execute test query");
    
    let test_value: i64 = row.get("test_value");
    assert_eq!(test_value, 1);
    
    // Test database exists and has our tables
    let tables = sqlx::query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
        .fetch_all(&pool)
        .await
        .expect("Failed to query tables");
    
    let table_names: Vec<String> = tables.iter()
        .map(|row| row.get::<String, _>("table_name"))
        .collect();
    
    assert!(table_names.contains(&"users".to_string()));
    assert!(table_names.contains(&"projects".to_string()));
    assert!(table_names.contains(&"resources".to_string()));
}

#[tokio::test]
async fn test_uuid_generation() {
    let config = DatabaseConfig {
        host: "localhost".to_string(),
        port: 26257,
        username: "root".to_string(),
        password: "".to_string(),
        database: "sirsi_test".to_string(),
        max_connections: 5,
        ssl_ca_cert: None,
        sslmode: Some("disable".to_string()),
        url: "postgresql://root@localhost:26257/sirsi_test?sslmode=disable".to_string(),
    };

    let pool = create_pool(&config).await.expect("Failed to create database pool");
    
    // Test CockroachDB's gen_random_uuid() function
    let row = sqlx::query("SELECT gen_random_uuid() as uuid_value")
        .fetch_one(&pool)
        .await
        .expect("Failed to generate UUID");
    
    let uuid_value: uuid::Uuid = row.get("uuid_value");
    assert!(!uuid_value.to_string().is_empty());
}
