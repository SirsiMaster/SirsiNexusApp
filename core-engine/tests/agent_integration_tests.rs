use std::collections::HashMap;
use std::time::Duration;

use sirsi_core::{
    agent::{
        context::ContextStore,
        manager::AgentManager,
        connectors::{
            aws::{AwsAgent, AwsConfig},
            azure::{AzureAgent, AzureConfig},
            gcp::{GcpAgent, GcpConfig},
            ConnectorManager,
        },
    },
    config::AppConfig,
};

const TEST_TIMEOUT: Duration = Duration::from_secs(30);

// Helper function to check if Redis is available
async fn is_redis_available() -> bool {
    match ContextStore::new("redis://127.0.0.1:6379") {
        Ok(store) => store.health_check().await.is_ok(),
        Err(_) => false,
    }
}

#[tokio::test]
async fn test_agent_manager_lifecycle() {
    let manager = AgentManager::new();
    
    // Test basic agent manager functionality
    let available_agents = manager.list_available_agents().await;
    assert!(!available_agents.is_empty());
    assert!(available_agents.contains(&"aws".to_string()));
    assert!(available_agents.contains(&"azure".to_string()));
    assert!(available_agents.contains(&"gcp".to_string()));
    println!("Available agents: {:?}", available_agents);
}

#[tokio::test]
async fn test_context_store_integration() {
    if !is_redis_available().await {
        println!("Redis not available, skipping context store test");
        return;
    }

    let store = ContextStore::new("redis://127.0.0.1:6379").unwrap();
    
    // Test session lifecycle
    let session = store.create_session_context("test-user", HashMap::new()).await.unwrap();
    assert!(!session.session_id.is_empty());
    assert_eq!(session.user_id, "test-user");

    // Test agent lifecycle
    let agent = store.create_agent_context(&session.session_id, "aws", HashMap::new()).await.unwrap();
    assert!(!agent.agent_id.is_empty());
    assert_eq!(agent.agent_type, "aws");

    // Test conversation
    let entry_id = store.add_conversation_entry(
        &agent.agent_id,
        "test message",
        "test response",
        vec!["suggestion1".to_string()],
    ).await.unwrap();
    assert!(!entry_id.is_empty());

    // Cleanup
    store.remove_agent(&agent.agent_id).await.unwrap();
    store.remove_session(&session.session_id).await.unwrap();
    
    println!("Context store integration test completed successfully");
}

#[tokio::test]
async fn test_aws_connector_integration() {
    let config = AwsConfig {
        region: "us-east-1".to_string(),
        access_key_id: None,
        secret_access_key: None,
        role_arn: None,
        external_id: None,
    };

    let mut agent = AwsAgent::new(config);
    
    // Test initialization (this will use default credentials or fail gracefully)
    if agent.initialize().await.is_ok() {
        println!("AWS agent initialized successfully");
        
        // Test health check (may fail due to credentials, which is acceptable)
        let health_check_result = agent.health_check().await;
        match health_check_result {
            Ok(_) => {
                println!("AWS health check passed");
                
                // Test resource discovery
                let result = agent.discover_resources(vec!["ec2".to_string()]).await;
                if let Ok(discovery_result) = result {
                    assert!(discovery_result.scan_time_ms > 0);
                    println!("AWS resource discovery completed in {}ms", discovery_result.scan_time_ms);
                } else {
                    println!("AWS resource discovery failed (expected without proper credentials)");
                }
            }
            Err(e) => {
                println!("AWS health check failed (expected without credentials): {}", e);
            }
        }
    } else {
        println!("AWS credentials not available, skipping AWS integration test");
    }
}

#[tokio::test]
async fn test_azure_connector_mock() {
    let config = AzureConfig {
        subscription_id: "test-subscription".to_string(),
        tenant_id: None,
        client_id: None,
        client_secret: None,
        resource_group: None,
    };

    let mut agent = AzureAgent::new(config);
    
    // Test initialization (mock implementation)
    assert!(agent.initialize().await.is_ok());
    
    // Test health check
    assert!(agent.health_check().await.is_ok());
    
    // Test resource discovery
    let result = agent.discover_resources(vec!["vm".to_string()]).await.unwrap();
    assert_eq!(result.resources.len(), 1);
    assert_eq!(result.resources[0].resource_type, "microsoft.compute/virtualmachines");
    assert!(result.scan_time_ms > 0);
    
    println!("Azure mock connector test completed: {} resources discovered", result.resources.len());
}

#[tokio::test]
async fn test_gcp_connector_mock() {
    let config = GcpConfig {
        project_id: "test-project".to_string(),
        credentials_path: None,
        region: Some("us-central1".to_string()),
        zone: Some("us-central1-a".to_string()),
    };

    let mut agent = GcpAgent::new(config);
    
    // Test initialization (mock implementation)
    assert!(agent.initialize().await.is_ok());
    
    // Test health check
    assert!(agent.health_check().await.is_ok());
    
    // Test resource discovery
    let result = agent.discover_resources(vec!["compute".to_string()]).await.unwrap();
    assert_eq!(result.resources.len(), 1);
    assert_eq!(result.resources[0].resource_type, "compute.googleapis.com/Instance");
    assert!(result.scan_time_ms > 0);
    
    println!("GCP mock connector test completed: {} resources discovered", result.resources.len());
}

#[tokio::test]
async fn test_connector_manager_integration() {
    let mut manager = ConnectorManager::new();
    
    // Test AWS connector creation (with mock/default credentials)
    let aws_config = AwsConfig {
        region: "us-east-1".to_string(),
        access_key_id: None,
        secret_access_key: None,
        role_arn: None,
        external_id: None,
    };
    
    // This might fail if AWS credentials are not available, which is fine for testing
    if let Ok(aws_connector_id) = manager.create_aws_connector(aws_config).await {
        assert!(!aws_connector_id.is_empty());
        assert!(manager.health_check_connector(&aws_connector_id).await.is_ok());
        manager.remove_connector(&aws_connector_id).await.unwrap();
        println!("AWS connector integration test passed");
    } else {
        println!("AWS connector creation failed (expected without credentials)");
    }

    // Test Azure mock connector
    let azure_config = AzureConfig {
        subscription_id: "test-subscription".to_string(),
        tenant_id: None,
        client_id: None,
        client_secret: None,
        resource_group: None,
    };
    
    let azure_connector_id = manager.create_azure_connector(azure_config).await.unwrap();
    assert!(!azure_connector_id.is_empty());
    assert!(manager.health_check_connector(&azure_connector_id).await.is_ok());
    
    // Test resource discovery
    let discovery_result = manager.discover_azure_resources(
        &azure_connector_id, 
        vec!["vm".to_string()]
    ).await.unwrap();
    assert_eq!(discovery_result.resources.len(), 1);
    
    manager.remove_connector(&azure_connector_id).await.unwrap();
    println!("Azure connector manager integration test passed");

    // Test GCP mock connector
    let gcp_config = GcpConfig {
        project_id: "test-project".to_string(),
        credentials_path: None,
        region: Some("us-central1".to_string()),
        zone: Some("us-central1-a".to_string()),
    };
    
    let gcp_connector_id = manager.create_gcp_connector(gcp_config).await.unwrap();
    assert!(!gcp_connector_id.is_empty());
    assert!(manager.health_check_connector(&gcp_connector_id).await.is_ok());
    
    manager.remove_connector(&gcp_connector_id).await.unwrap();
    println!("GCP connector manager integration test passed");
}

#[tokio::test]
async fn test_cost_estimation() {
    // Test AWS cost estimation
    let aws_config = AwsConfig {
        region: "us-east-1".to_string(),
        access_key_id: None,
        secret_access_key: None,
        role_arn: None,
        external_id: None,
    };
    
    let aws_agent = AwsAgent::new(aws_config);
    let aws_resources = vec![
        sirsi_core::agent::connectors::aws::AwsResource {
            resource_type: "ec2:instance".to_string(),
            resource_id: "i-1234567890abcdef0".to_string(),
            name: Some("test-instance".to_string()),
            arn: Some("arn:aws:ec2:us-east-1::instance/i-1234567890abcdef0".to_string()),
            region: "us-east-1".to_string(),
            tags: HashMap::new(),
            metadata: {
                let mut map = HashMap::new();
                map.insert("instance_type".to_string(), "t3.micro".to_string());
                map
            },
            cost_estimate: None,
        }
    ];
    
    let cost_estimates = aws_agent.estimate_migration_cost(&aws_resources).await.unwrap();
    assert!(cost_estimates.contains_key("i-1234567890abcdef0"));
    assert_eq!(cost_estimates["i-1234567890abcdef0"], 8.76);
    
    println!("Cost estimation test passed: ${}/month for t3.micro", cost_estimates["i-1234567890abcdef0"]);
}

#[tokio::test]
async fn test_migration_recommendations() {
    let azure_config = AzureConfig {
        subscription_id: "test-subscription".to_string(),
        tenant_id: None,
        client_id: None,
        client_secret: None,
        resource_group: None,
    };
    
    let azure_agent = AzureAgent::new(azure_config);
    let azure_resources = vec![
        sirsi_core::agent::connectors::azure::AzureResource {
            resource_type: "microsoft.compute/virtualmachines".to_string(),
            resource_id: "/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.Compute/virtualMachines/test-vm".to_string(),
            name: "test-vm".to_string(),
            resource_group: "test-rg".to_string(),
            location: "East US".to_string(),
            tags: HashMap::new(),
            metadata: {
                let mut map = HashMap::new();
                map.insert("vm_size".to_string(), "Basic_A1".to_string());
                map
            },
            cost_estimate: None,
        }
    ];
    
    let recommendations = azure_agent.generate_migration_recommendations(&azure_resources).await.unwrap();
    assert!(!recommendations.is_empty());
    assert!(recommendations.iter().any(|r| r.contains("Basic tier")));
    
    println!("Migration recommendations test passed: {} recommendations generated", recommendations.len());
    for (i, rec) in recommendations.iter().enumerate() {
        println!("  {}. {}", i + 1, rec);
    }
}

#[tokio::test]
async fn test_config_loading() {
    // Test that config can be loaded (will use defaults if config files don't exist)
    let result = AppConfig::load();
    
    // This might fail if no config files exist, which is expected in test environment
    match result {
        Ok(config) => {
            // Verify basic structure
            assert!(!config.redis.url.is_empty());
            println!("Config loaded successfully: redis_url = {}", config.redis.url);
        }
        Err(e) => {
            println!("Config loading failed (expected in test env): {}", e);
            // This is expected in test environment without config files
        }
    }
}

#[tokio::test]
async fn test_full_integration_workflow() {
    if !is_redis_available().await {
        println!("Redis not available, skipping full integration test");
        return;
    }

    println!("Starting full integration workflow test...");
    
    // Initialize context store
    let context_store = ContextStore::new("redis://127.0.0.1:6379").unwrap();
    
    // Create session
    let session = context_store.create_session_context("integration-test-user", HashMap::new()).await.unwrap();
    println!("✓ Created session: {}", session.session_id);
    
    // Create agent manager
    let agent_manager = AgentManager::new();
    
    // Test with Azure mock connector (since it's guaranteed to work)
    let mut connector_manager = ConnectorManager::new();
    let azure_config = AzureConfig {
        subscription_id: "test-subscription".to_string(),
        tenant_id: None,
        client_id: None,
        client_secret: None,
        resource_group: Some("test-rg".to_string()),
    };
    
    let connector_id = connector_manager.create_azure_connector(azure_config).await.unwrap();
    println!("✓ Created Azure connector: {}", connector_id);
    
    // Discover resources
    let discovery_result = connector_manager.discover_azure_resources(
        &connector_id,
        vec!["vm".to_string(), "storage".to_string()]
    ).await.unwrap();
    
    println!("✓ Discovered {} resources in {}ms", 
        discovery_result.resources.len(), 
        discovery_result.scan_time_ms
    );
    
    assert!(discovery_result.resources.len() >= 2); // VM + Storage
    assert!(discovery_result.scan_time_ms > 0);
    
    // Create agent context
    let agent_context = context_store.create_agent_context(
        &session.session_id,
        "azure",
        HashMap::new()
    ).await.unwrap();
    
    println!("✓ Created agent context: {}", agent_context.agent_id);
    
    // Simulate conversation
    let entry_id = context_store.add_conversation_entry(
        &agent_context.agent_id,
        "Discover Azure resources",
        &format!("Found {} resources", discovery_result.resources.len()),
        vec!["Try discovering storage resources".to_string()]
    ).await.unwrap();
    
    println!("✓ Added conversation entry: {}", entry_id);
    
    // Test cost estimation for discovered resources
    let azure_agent = AzureAgent::new(AzureConfig {
        subscription_id: "test-subscription".to_string(),
        tenant_id: None,
        client_id: None,
        client_secret: None,
        resource_group: Some("test-rg".to_string()),
    });
    
    let cost_estimates = azure_agent.estimate_migration_cost(&discovery_result.resources).await.unwrap();
    println!("✓ Generated cost estimates for {} resources", cost_estimates.len());
    
    let recommendations = azure_agent.generate_migration_recommendations(&discovery_result.resources).await.unwrap();
    println!("✓ Generated {} migration recommendations", recommendations.len());
    
    // Test stats
    let active_sessions = context_store.get_active_sessions_count().await.unwrap();
    let active_agents = context_store.get_active_agents_count().await.unwrap();
    println!("✓ Current stats: {} active sessions, {} active agents", active_sessions, active_agents);
    
    // Cleanup
    context_store.remove_agent(&agent_context.agent_id).await.unwrap();
    context_store.remove_session(&session.session_id).await.unwrap();
    connector_manager.remove_connector(&connector_id).await.unwrap();
    
    println!("✅ Full integration workflow test completed successfully!");
}

#[tokio::test]
async fn test_multi_cloud_workflow() {
    println!("Starting multi-cloud integration test...");
    
    let mut connector_manager = ConnectorManager::new();
    
    // Create Azure connector
    let azure_config = AzureConfig {
        subscription_id: "test-subscription".to_string(),
        tenant_id: None,
        client_id: None,
        client_secret: None,
        resource_group: None,
    };
    let azure_id = connector_manager.create_azure_connector(azure_config).await.unwrap();
    
    // Create GCP connector
    let gcp_config = GcpConfig {
        project_id: "test-project".to_string(),
        credentials_path: None,
        region: Some("us-central1".to_string()),
        zone: Some("us-central1-a".to_string()),
    };
    let gcp_id = connector_manager.create_gcp_connector(gcp_config).await.unwrap();
    
    println!("✓ Created connectors: Azure({}), GCP({})", azure_id, gcp_id);
    
    // Discover resources from both clouds
    let azure_resources = connector_manager.discover_azure_resources(
        &azure_id,
        vec!["vm".to_string(), "storage".to_string()]
    ).await.unwrap();
    
    let gcp_resources = connector_manager.discover_gcp_resources(
        &gcp_id,
        vec!["compute".to_string(), "storage".to_string()]
    ).await.unwrap();
    
    println!("✓ Azure discovered: {} resources", azure_resources.resources.len());
    println!("✓ GCP discovered: {} resources", gcp_resources.resources.len());
    
    // Health check all connectors
    assert!(connector_manager.health_check_connector(&azure_id).await.is_ok());
    assert!(connector_manager.health_check_connector(&gcp_id).await.is_ok());
    
    println!("✓ All connectors passed health checks");
    
    // List all connectors
    let all_connectors = connector_manager.list_connectors();
    assert_eq!(all_connectors.len(), 2);
    println!("✓ Total connectors: {}", all_connectors.len());
    
    // Cleanup
    connector_manager.remove_connector(&azure_id).await.unwrap();
    connector_manager.remove_connector(&gcp_id).await.unwrap();
    
    println!("✅ Multi-cloud integration test completed successfully!");
}
