use sirsi_core::db::create_pool;
use sirsi_core::config::DatabaseConfig;
use sirsi_core::models::user::User;

#[tokio::test]
async fn test_user_creation_and_retrieval() {
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
    
    // Clean up any existing test users
    sqlx::query("DELETE FROM users WHERE email LIKE 'test_%@cockroachdb.test'")
        .execute(&pool)
        .await
        .expect("Failed to clean up test users");
    
    // Create a new user
    let test_email = "test_user@cockroachdb.test";
    let test_name = "Test User";
    let test_password_hash = "hashed_password_123";
    
    let created_user = User::create(&pool, test_name, test_email, test_password_hash)
        .await
        .expect("Failed to create user");
    
    // Verify the user was created correctly
    assert_eq!(created_user.name, test_name);
    assert_eq!(created_user.email, test_email);
    assert_eq!(created_user.password_hash, test_password_hash);
    assert!(created_user.created_at.is_some());
    assert!(created_user.updated_at.is_some());
    
    // Retrieve the user by email
    let retrieved_user = User::find_by_email(&pool, test_email)
        .await
        .expect("Failed to query user by email")
        .expect("User not found");
    
    assert_eq!(retrieved_user.id, created_user.id);
    assert_eq!(retrieved_user.name, test_name);
    assert_eq!(retrieved_user.email, test_email);
    assert_eq!(retrieved_user.password_hash, test_password_hash);
    
    // Retrieve the user by ID
    let retrieved_by_id = User::find_by_id(&pool, created_user.id)
        .await
        .expect("Failed to query user by ID")
        .expect("User not found");
    
    assert_eq!(retrieved_by_id.id, created_user.id);
    assert_eq!(retrieved_by_id.name, test_name);
    assert_eq!(retrieved_by_id.email, test_email);
    
    // Test that non-existent user returns None
    let non_existent = User::find_by_email(&pool, "nonexistent@example.com")
        .await
        .expect("Failed to query non-existent user");
    
    assert!(non_existent.is_none());
}
