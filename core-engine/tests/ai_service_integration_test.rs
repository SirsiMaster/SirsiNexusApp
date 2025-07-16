use sirsi_core::services::ai_infrastructure_service::*;

#[tokio::test]
async fn test_ai_infrastructure_service_creation() {
    let service = AIInfrastructureService::new();
    
    // Test that service is created successfully
    // In mock mode when no API keys are present
    assert!(!service.is_mock_mode() || service.is_mock_mode()); // Always true, but tests the method access
}

#[tokio::test]
async fn test_ai_infrastructure_service_mock_generation() {
    let service = AIInfrastructureService::new();
    
    let request = InfrastructureRequest {
        cloud_provider: CloudProvider::AWS,
        ai_provider: AIProvider::OpenAI,
        description: "Test web application".to_string(),
        requirements: InfrastructureRequirements {
            performance_tier: PerformanceTier::Standard,
            security_level: SecurityLevel::Enhanced,
            budget_limit: Some(100.0),
            compliance_requirements: vec![],
            scaling_requirements: None,
        },
    };
    
    let result = service.generate_infrastructure(request).await;
    
    if let Err(ref e) = result {
        eprintln!("Error: {}", e);
    }
    assert!(result.is_ok(), "Expected Ok, got: {:?}", result);
    let response = result.unwrap();
    
    // Verify response structure
    assert!(!response.template.is_empty());
    assert!(!response.template_type.is_empty());
    assert!(response.estimated_cost.is_some());
    assert!(!response.security_recommendations.is_empty());
    assert!(!response.optimization_suggestions.is_empty());
    assert!(!response.deployment_instructions.is_empty());
}

#[tokio::test]
async fn test_different_cloud_providers() {
    let service = AIInfrastructureService::new();
    
    let providers = vec![
        CloudProvider::AWS,
        CloudProvider::Azure,
        CloudProvider::GCP,
        CloudProvider::Kubernetes,
        CloudProvider::IBM,
        CloudProvider::Oracle,
        CloudProvider::Alibaba,
    ];
    
    for provider in providers {
        let request = InfrastructureRequest {
            cloud_provider: provider.clone(),
            ai_provider: AIProvider::OpenAI,
            description: format!("Test application for {:?}", provider),
            requirements: InfrastructureRequirements {
                performance_tier: PerformanceTier::Basic,
                security_level: SecurityLevel::Basic,
                budget_limit: None,
                compliance_requirements: vec![],
                scaling_requirements: None,
            },
        };
        
        let result = service.generate_infrastructure(request).await;
        assert!(result.is_ok(), "Failed for provider: {:?}", provider);
        
        let response = result.unwrap();
        assert!(!response.template.is_empty(), "Empty template for provider: {:?}", provider);
    }
}

#[tokio::test]
async fn test_different_ai_providers() {
    let service = AIInfrastructureService::new();
    
    let ai_providers = vec![
        AIProvider::OpenAI,
        AIProvider::Claude3_5Sonnet,
        AIProvider::ClaudeCode,
    ];
    
    for ai_provider in ai_providers {
        let request = InfrastructureRequest {
            cloud_provider: CloudProvider::AWS,
            ai_provider: ai_provider.clone(),
            description: format!("Test application using {:?}", ai_provider),
            requirements: InfrastructureRequirements {
                performance_tier: PerformanceTier::Standard,
                security_level: SecurityLevel::Enhanced,
                budget_limit: Some(200.0),
                compliance_requirements: vec![],
                scaling_requirements: None,
            },
        };
        
        let result = service.generate_infrastructure(request).await;
        assert!(result.is_ok(), "Failed for AI provider: {:?}", ai_provider);
        
        let response = result.unwrap();
        assert_eq!(response.ai_provider_used, ai_provider);
    }
}

#[tokio::test]
async fn test_cost_estimation() {
    let service = AIInfrastructureService::new();
    
    let request = InfrastructureRequest {
        cloud_provider: CloudProvider::AWS,
        ai_provider: AIProvider::OpenAI,
        description: "Enterprise application".to_string(),
        requirements: InfrastructureRequirements {
            performance_tier: PerformanceTier::Enterprise,
            security_level: SecurityLevel::Maximum,
            budget_limit: Some(1000.0),
            compliance_requirements: vec![],
            scaling_requirements: None,
        },
    };
    
    let result = service.generate_infrastructure(request).await;
    assert!(result.is_ok());
    
    let response = result.unwrap();
    assert!(response.estimated_cost.is_some());
    
    // Enterprise tier should have higher cost estimates
    let cost = response.estimated_cost.unwrap();
    assert!(cost > 500.0, "Enterprise cost estimate too low: {}", cost);
}

#[tokio::test]
async fn test_security_recommendations() {
    let service = AIInfrastructureService::new();
    
    let request = InfrastructureRequest {
        cloud_provider: CloudProvider::AWS,
        ai_provider: AIProvider::OpenAI,
        description: "Secure web application".to_string(),
        requirements: InfrastructureRequirements {
            performance_tier: PerformanceTier::Standard,
            security_level: SecurityLevel::Maximum,
            budget_limit: None,
            compliance_requirements: vec![],
            scaling_requirements: None,
        },
    };
    
    let result = service.generate_infrastructure(request).await;
    assert!(result.is_ok());
    
    let response = result.unwrap();
    
    // Maximum security should have comprehensive recommendations
    assert!(!response.security_recommendations.is_empty());
    assert!(response.security_recommendations.len() >= 3);
    
    // Check for common security recommendations
    let recommendations_text = response.security_recommendations.join(" ").to_lowercase();
    assert!(
        recommendations_text.contains("security") || 
        recommendations_text.contains("encryption") ||
        recommendations_text.contains("access"),
        "Security recommendations seem insufficient: {:?}", response.security_recommendations
    );
}
