use sirsi_core::server::start_grpc_server;
use sirsi_core::proto::sirsi::agent::v1::*;
use sirsi_core::proto::sirsi::agent::v1::agent_service_client::AgentServiceClient;
use std::collections::HashMap;
use std::time::Duration;
use tokio::time::timeout;
use tonic::transport::Channel;
use tonic::Request;

/// Comprehensive gRPC integration tests for the enhanced SirsiNexus protobuf schema
/// Tests the complete end-to-end functionality including:
/// - Session lifecycle management with enhanced configurations
/// - Agent creation and management with capabilities
/// - Message handling with attachments and metadata
/// - Suggestion system with confidence scoring and actions
/// - Health monitoring and metrics collection
/// - Error handling and edge cases

#[tokio::test]
async fn test_enhanced_session_lifecycle() {
    let redis_url = "redis://127.0.0.1:6379";
    
    // Start gRPC server in background
    let server_handle = tokio::spawn(async move {
        start_grpc_server(50052, redis_url).await
    });
    
    // Wait for server to start
    tokio::time::sleep(Duration::from_millis(500)).await;
    
    // Connect to the server
    let channel = Channel::from_static("http://127.0.0.1:50052")
        .connect()
        .await
        .expect("Failed to connect to server");
    
    let mut client = AgentServiceClient::new(channel);
    
    // Test 1: Create Session with Enhanced Config
    let create_session_request = CreateSessionRequest {
        user_id: "test-user-enhanced".to_string(),
        context: {
            let mut ctx = HashMap::new();
            ctx.insert("environment".to_string(), "integration-test".to_string());
            ctx.insert("version".to_string(), "v2.1".to_string());
            ctx
        },
        config: Some(SessionConfig {
            max_agents: 10,
            timeout_seconds: 300,
            enable_logging: true,
            preferences: {
                let mut prefs = HashMap::new();
                prefs.insert("theme".to_string(), "enhanced".to_string());
                prefs.insert("notifications".to_string(), "enabled".to_string());
                prefs
            },
        }),
    };
    
    let response = timeout(
        Duration::from_secs(5),
        client.create_session(Request::new(create_session_request))
    ).await.expect("Request timeout").expect("Failed to create session");
    
    let session = response.into_inner().session.expect("No session in response");
    assert!(!session.session_id.is_empty());
    assert_eq!(session.user_id, "test-user-enhanced");
    assert_eq!(session.state, SessionState::Active as i32);
    
    println!("✅ Enhanced session created: {}", session.session_id);
    
    // Test 2: Create Agent with Enhanced Configuration
    let create_agent_request = CreateAgentRequest {
        session_id: session.session_id.clone(),
        agent_type: "aws".to_string(),
        config: Some(AgentConfig {
            parameters: {
                let mut params = HashMap::new();
                params.insert("region".to_string(), "us-east-1".to_string());
                params.insert("service_discovery".to_string(), "auto".to_string());
                params
            },
            timeout_seconds: 60,
            max_concurrent_operations: 5,
            enable_caching: true,
            required_capabilities: vec![
                "resource-discovery".to_string(),
                "cost-analysis".to_string(),
                "security-review".to_string()
            ],
        }),
        context: {
            let mut ctx = HashMap::new();
            ctx.insert("priority".to_string(), "high".to_string());
            ctx.insert("auto_start".to_string(), "true".to_string());
            ctx
        },
    };
    
    let response = timeout(
        Duration::from_secs(5),
        client.create_agent(Request::new(create_agent_request))
    ).await.expect("Request timeout").expect("Failed to create agent");
    
    let create_agent_response = response.into_inner();
    let agent = create_agent_response.agent.expect("No agent in response");
    assert!(!agent.agent_id.is_empty());
    assert_eq!(agent.agent_type, "aws");
    assert_eq!(agent.state, AgentState::Ready as i32);
    
    println!("✅ Enhanced agent created: {}", agent.agent_id);
    
    // Test 3: Send Enhanced Message with Attachments and Metadata
    let send_message_request = SendMessageRequest {
        session_id: session.session_id.clone(),
        agent_id: agent.agent_id.clone(),
        message: Some(Message {
            message_id: uuid::Uuid::new_v4().to_string(),
            r#type: MessageType::Text as i32,
            content: "Discover my AWS resources and provide cost optimization suggestions".to_string(),
            metadata: {
                let mut meta = HashMap::new();
                meta.insert("priority".to_string(), "high".to_string());
                meta.insert("context".to_string(), "cost-optimization".to_string());
                meta.insert("user_role".to_string(), "admin".to_string());
                meta
            },
            timestamp: None, // Will be set by server
            attachments: vec![
                Attachment {
                    attachment_id: uuid::Uuid::new_v4().to_string(),
                    name: "current-infrastructure.json".to_string(),
                    mime_type: "application/json".to_string(),
                    size_bytes: 1024,
                    content: Some(sirsi_core::proto::sirsi::agent::v1::attachment::Content::Data(
                        b"{\"region\": \"us-east-1\", \"services\": [\"ec2\", \"s3\", \"rds\"]}".to_vec()
                    )),
                }
            ],
        }),
        options: Some(MessageOptions {
            timeout_seconds: 30,
            stream_response: false,
            priority: Priority::High as i32,
            context: {
                let mut ctx = HashMap::new();
                ctx.insert("analysis_type".to_string(), "comprehensive".to_string());
                ctx.insert("include_recommendations".to_string(), "true".to_string());
                ctx
            },
        }),
    };
    
    let response = timeout(
        Duration::from_secs(10),
        client.send_message(Request::new(send_message_request))
    ).await.expect("Request timeout").expect("Failed to send message");
    
    let message_response = response.into_inner();
    assert!(!message_response.message_id.is_empty());
    assert!(message_response.response.is_some());
    assert!(!message_response.suggestions.is_empty());
    
    let response_msg = message_response.response.unwrap();
    assert!(!response_msg.content.is_empty());
    
    println!("✅ Enhanced message sent and received response: {} chars", response_msg.content.len());
    println!("✅ Received {} suggestions", message_response.suggestions.len());
    
    // Test 4: Validate Enhanced Suggestions
    for (i, suggestion) in message_response.suggestions.iter().enumerate() {
        assert!(!suggestion.suggestion_id.is_empty());
        assert!(!suggestion.title.is_empty());
        assert!(!suggestion.description.is_empty());
        assert!(suggestion.confidence >= 0.0 && suggestion.confidence <= 1.0);
        assert!(suggestion.action.is_some());
        
        let action = suggestion.action.as_ref().unwrap();
        assert!(!action.action_type.is_empty());
        assert!(!action.command.is_empty());
        
        println!("  ✅ Suggestion {}: {} (confidence: {:.1}%)", 
                i + 1, suggestion.title, suggestion.confidence * 100.0);
    }
    
    // Test 5: Get Enhanced Suggestions with Context
    let get_suggestions_request = GetSuggestionsRequest {
        session_id: session.session_id.clone(),
        agent_id: agent.agent_id.clone(),
        context: Some(SuggestionContext {
            context_type: "cost-optimization".to_string(),
            context_data: {
                let mut data = HashMap::new();
                data.insert("budget_limit".to_string(), "1000".to_string());
                data.insert("optimization_level".to_string(), "aggressive".to_string());
                data
            },
            tags: vec!["cost".to_string(), "optimization".to_string(), "aws".to_string()],
        }),
        max_suggestions: 5,
    };
    
    let response = timeout(
        Duration::from_secs(5),
        client.get_suggestions(Request::new(get_suggestions_request))
    ).await.expect("Request timeout").expect("Failed to get suggestions");
    
    let suggestions_response = response.into_inner();
    assert!(!suggestions_response.suggestions.is_empty());
    assert!(!suggestions_response.context_id.is_empty());
    
    println!("✅ Retrieved {} contextual suggestions", suggestions_response.suggestions.len());
    
    // Test 6: Get Enhanced Agent Status
    let status_request = GetAgentStatusRequest {
        session_id: session.session_id.clone(),
        agent_id: agent.agent_id.clone(),
    };
    
    let response = timeout(
        Duration::from_secs(5),
        client.get_agent_status(Request::new(status_request))
    ).await.expect("Request timeout").expect("Failed to get agent status");
    
    let status_response = response.into_inner();
    assert!(status_response.status.is_some());
    assert!(!status_response.active_capabilities.is_empty());
    assert!(status_response.metrics.is_some());
    
    let metrics = status_response.metrics.unwrap();
    assert!(metrics.messages_processed >= 1);
    assert!(metrics.average_response_time_ms > 0.0);
    
    println!("✅ Agent status retrieved - processed {} messages", metrics.messages_processed);
    
    // Test 7: Get System Health
    let health_request = GetSystemHealthRequest {
        include_metrics: true,
    };
    
    let response = timeout(
        Duration::from_secs(5),
        client.get_system_health(Request::new(health_request))
    ).await.expect("Request timeout").expect("Failed to get system health");
    
    let health_response = response.into_inner();
    assert!(health_response.health.is_some());
    assert!(health_response.metrics.is_some());
    
    let health = health_response.health.unwrap();
    assert_eq!(health.overall_status, HealthStatus::Healthy as i32);
    assert!(!health.components.is_empty());
    
    let metrics = health_response.metrics.unwrap();
    assert!(metrics.active_sessions >= 1);
    assert!(metrics.total_agents >= 1);
    
    println!("✅ System health check passed - {} active sessions, {} agents", 
            metrics.active_sessions, metrics.total_agents);
    
    // Test 8: Delete Agent (cleanup)
    let delete_agent_request = DeleteAgentRequest {
        session_id: session.session_id.clone(),
        agent_id: agent.agent_id.clone(),
    };
    
    let response = timeout(
        Duration::from_secs(5),
        client.delete_agent(Request::new(delete_agent_request))
    ).await.expect("Request timeout").expect("Failed to delete agent");
    
    println!("✅ Agent deleted successfully");
    
    // Test 9: Delete Session (cleanup)
    let delete_session_request = DeleteSessionRequest {
        session_id: session.session_id.clone(),
    };
    
    let response = timeout(
        Duration::from_secs(5),
        client.delete_session(Request::new(delete_session_request))
    ).await.expect("Request timeout").expect("Failed to delete session");
    
    println!("✅ Session deleted successfully");
    
    // Cleanup: Stop the server
    server_handle.abort();
    
    println!("\n🎉 All enhanced integration tests passed successfully!");
}

#[tokio::test]
async fn test_agent_lifecycle_edge_cases() {
    let redis_url = "redis://127.0.0.1:6379";
    
    // Start gRPC server in background
    let server_handle = tokio::spawn(async move {
        start_grpc_server(50053, redis_url).await
    });
    
    // Wait for server to start
    tokio::time::sleep(Duration::from_millis(500)).await;
    
    // Connect to the server
    let channel = Channel::from_static("http://127.0.0.1:50053")
        .connect()
        .await
        .expect("Failed to connect to server");
    
    let mut client = AgentServiceClient::new(channel);
    
    // Test error handling for invalid requests
    
    // Test 1: Try to create agent without session
    let invalid_agent_request = CreateAgentRequest {
        session_id: "non-existent-session".to_string(),
        agent_type: "aws".to_string(),
        config: None,
        context: HashMap::new(),
    };
    
    let result = client.create_agent(Request::new(invalid_agent_request)).await;
    assert!(result.is_err());
    println!("✅ Properly rejected agent creation with invalid session");
    
    // Test 2: Try to send message to non-existent agent
    let invalid_message_request = SendMessageRequest {
        session_id: "non-existent-session".to_string(),
        agent_id: "non-existent-agent".to_string(),
        message: Some(Message {
            message_id: uuid::Uuid::new_v4().to_string(),
            r#type: MessageType::Text as i32,
            content: "Test message".to_string(),
            metadata: HashMap::new(),
            timestamp: None,
            attachments: vec![],
        }),
        options: None,
    };
    
    let result = client.send_message(Request::new(invalid_message_request)).await;
    assert!(result.is_err());
    println!("✅ Properly rejected message to invalid agent");
    
    // Test 3: Try to get status of non-existent agent
    let invalid_status_request = GetAgentStatusRequest {
        session_id: "non-existent-session".to_string(),
        agent_id: "non-existent-agent".to_string(),
    };
    
    let result = client.get_agent_status(Request::new(invalid_status_request)).await;
    assert!(result.is_err());
    println!("✅ Properly rejected status request for invalid agent");
    
    // Test 4: Try to delete non-existent session
    let invalid_delete_request = DeleteSessionRequest {
        session_id: "non-existent-session".to_string(),
    };
    
    let result = client.delete_session(Request::new(invalid_delete_request)).await;
    assert!(result.is_err());
    println!("✅ Properly rejected deletion of non-existent session");
    
    // Cleanup
    server_handle.abort();
    
    println!("\n🎉 Edge case tests passed successfully!");
}

#[tokio::test]
async fn test_concurrent_operations() {
    let redis_url = "redis://127.0.0.1:6379";
    
    // Start gRPC server in background
    let server_handle = tokio::spawn(async move {
        start_grpc_server(50054, redis_url).await
    });
    
    // Wait for server to start
    tokio::time::sleep(Duration::from_millis(500)).await;
    
    // Test concurrent session creation
    let mut handles = vec![];
    
    for i in 0..5 {
        let handle = tokio::spawn(async move {
            let channel = Channel::from_static("http://127.0.0.1:50054")
                .connect()
                .await
                .expect("Failed to connect to server");
            
            let mut client = AgentServiceClient::new(channel);
            
            let create_session_request = CreateSessionRequest {
                user_id: format!("concurrent-user-{}", i),
                context: HashMap::new(),
                config: None,
            };
            
            let response = client.create_session(Request::new(create_session_request))
                .await
                .expect("Failed to create session");
            
            let session = response.into_inner().session.expect("No session in response");
            println!("✅ Concurrent session {} created: {}", i, session.session_id);
            session.session_id
        });
        handles.push(handle);
    }
    
    // Wait for all sessions to be created
    let session_ids: Vec<String> = futures::future::join_all(handles)
        .await
        .into_iter()
        .map(|r| r.expect("Task failed"))
        .collect();
    
    assert_eq!(session_ids.len(), 5);
    println!("✅ All {} concurrent sessions created successfully", session_ids.len());
    
    // Cleanup sessions
    let channel = Channel::from_static("http://127.0.0.1:50054")
        .connect()
        .await
        .expect("Failed to connect to server");
    
    let mut client = AgentServiceClient::new(channel);
    
    for session_id in session_ids {
        let delete_request = DeleteSessionRequest { session_id };
        let _ = client.delete_session(Request::new(delete_request)).await;
    }
    
    // Cleanup
    server_handle.abort();
    
    println!("\n🎉 Concurrent operations test passed successfully!");
}

#[tokio::test]
async fn test_message_attachments_and_metadata() {
    let redis_url = "redis://127.0.0.1:6379";
    
    // Start gRPC server in background
    let server_handle = tokio::spawn(async move {
        start_grpc_server(50055, redis_url).await
    });
    
    // Wait for server to start
    tokio::time::sleep(Duration::from_millis(500)).await;
    
    // Connect to the server
    let channel = Channel::from_static("http://127.0.0.1:50055")
        .connect()
        .await
        .expect("Failed to connect to server");
    
    let mut client = AgentServiceClient::new(channel);
    
    // Create a session and agent
    let session_request = CreateSessionRequest {
        user_id: "attachment-test-user".to_string(),
        context: HashMap::new(),
        config: None,
    };
    
    let session_response = client.create_session(Request::new(session_request))
        .await
        .expect("Failed to create session");
    let session = session_response.into_inner().session.unwrap();
    
    let agent_request = CreateAgentRequest {
        session_id: session.session_id.clone(),
        agent_type: "general".to_string(),
        config: None,
        context: HashMap::new(),
    };
    
    let agent_response = client.create_agent(Request::new(agent_request))
        .await
        .expect("Failed to create agent");
    let agent = agent_response.into_inner().agent.unwrap();
    
    // Test message with multiple attachments and rich metadata
    let message_request = SendMessageRequest {
        session_id: session.session_id.clone(),
        agent_id: agent.agent_id.clone(),
        message: Some(Message {
            message_id: uuid::Uuid::new_v4().to_string(),
            r#type: MessageType::Text as i32,
            content: "Analyze these configuration files and provide recommendations".to_string(),
            metadata: {
                let mut meta = HashMap::new();
                meta.insert("user_role".to_string(), "developer".to_string());
                meta.insert("project_name".to_string(), "production-app".to_string());
                meta.insert("environment".to_string(), "staging".to_string());
                meta.insert("urgency".to_string(), "high".to_string());
                meta
            },
            timestamp: None,
            attachments: vec![
                Attachment {
                    attachment_id: uuid::Uuid::new_v4().to_string(),
                    name: "docker-compose.yml".to_string(),
                    mime_type: "application/x-yaml".to_string(),
                    size_bytes: 2048,
                    content: Some(sirsi_core::proto::sirsi::agent::v1::attachment::Content::Data(
                        b"version: '3.8'\nservices:\n  app:\n    image: myapp:latest".to_vec()
                    )),
                },
                Attachment {
                    attachment_id: uuid::Uuid::new_v4().to_string(),
                    name: "config.json".to_string(),
                    mime_type: "application/json".to_string(),
                    size_bytes: 512,
                    content: Some(sirsi_core::proto::sirsi::agent::v1::attachment::Content::Data(
                        b"{\"database_url\": \"postgresql://localhost:5432/mydb\"}".to_vec()
                    )),
                },
                Attachment {
                    attachment_id: uuid::Uuid::new_v4().to_string(),
                    name: "readme.md".to_string(),
                    mime_type: "text/markdown".to_string(),
                    size_bytes: 1024,
                    content: Some(sirsi_core::proto::sirsi::agent::v1::attachment::Content::Data(
                        b"# My Application\n\nThis is a sample application...".to_vec()
                    )),
                },
            ],
        }),
        options: Some(MessageOptions {
            timeout_seconds: 45,
            stream_response: false,
            priority: Priority::High as i32,
            context: {
                let mut ctx = HashMap::new();
                ctx.insert("analysis_type".to_string(), "security_and_performance".to_string());
                ctx.insert("output_format".to_string(), "detailed_report".to_string());
                ctx
            },
        }),
    };
    
    let response = timeout(
        Duration::from_secs(10),
        client.send_message(Request::new(message_request))
    ).await.expect("Request timeout").expect("Failed to send message with attachments");
    
    let message_response = response.into_inner();
    assert!(!message_response.message_id.is_empty());
    assert!(message_response.response.is_some());
    
    let response_msg = message_response.response.unwrap();
    assert!(!response_msg.content.is_empty());
    
    // Verify metadata is preserved
    assert!(!response_msg.metadata.is_empty());
    
    println!("✅ Message with {} attachments processed successfully", 3);
    println!("✅ Response contains {} metadata fields", response_msg.metadata.len());
    
    // Cleanup
    let _ = client.delete_agent(Request::new(DeleteAgentRequest {
        session_id: session.session_id.clone(),
        agent_id: agent.agent_id,
    })).await;
    
    let _ = client.delete_session(Request::new(DeleteSessionRequest {
        session_id: session.session_id,
    })).await;
    
    server_handle.abort();
    
    println!("\n🎉 Attachment and metadata test passed successfully!");
}

#[tokio::test]
async fn test_suggestion_system_comprehensive() {
    let redis_url = "redis://127.0.0.1:6379";
    
    // Start gRPC server in background
    let server_handle = tokio::spawn(async move {
        start_grpc_server(50056, redis_url).await
    });
    
    // Wait for server to start
    tokio::time::sleep(Duration::from_millis(500)).await;
    
    // Connect to the server
    let channel = Channel::from_static("http://127.0.0.1:50056")
        .connect()
        .await
        .expect("Failed to connect to server");
    
    let mut client = AgentServiceClient::new(channel);
    
    // Create session and agent
    let session_request = CreateSessionRequest {
        user_id: "suggestion-test-user".to_string(),
        context: HashMap::new(),
        config: None,
    };
    
    let session_response = client.create_session(Request::new(session_request))
        .await
        .expect("Failed to create session");
    let session = session_response.into_inner().session.unwrap();
    
    let agent_request = CreateAgentRequest {
        session_id: session.session_id.clone(),
        agent_type: "optimization".to_string(),
        config: Some(AgentConfig {
            parameters: {
                let mut params = HashMap::new();
                params.insert("focus".to_string(), "cost_optimization".to_string());
                params.insert("scope".to_string(), "comprehensive".to_string());
                params
            },
            timeout_seconds: 60,
            max_concurrent_operations: 3,
            enable_caching: true,
            required_capabilities: vec![
                "cost-analysis".to_string(),
                "recommendation-engine".to_string(),
            ],
        }),
        context: HashMap::new(),
    };
    
    let agent_response = client.create_agent(Request::new(agent_request))
        .await
        .expect("Failed to create agent");
    let agent = agent_response.into_inner().agent.unwrap();
    
    // Test various suggestion contexts
    let suggestion_contexts = vec![
        ("cost-optimization", vec!["cost", "savings", "efficiency"]),
        ("security-review", vec!["security", "compliance", "vulnerabilities"]),
        ("performance-tuning", vec!["performance", "optimization", "speed"]),
        ("scaling-strategy", vec!["scaling", "growth", "capacity"]),
    ];
    
    for (context_type, tags) in suggestion_contexts {
        let request = GetSuggestionsRequest {
            session_id: session.session_id.clone(),
            agent_id: agent.agent_id.clone(),
            context: Some(SuggestionContext {
                context_type: context_type.to_string(),
                context_data: {
                    let mut data = HashMap::new();
                    data.insert("priority".to_string(), "high".to_string());
                    data.insert("complexity".to_string(), "medium".to_string());
                    data
                },
                tags: tags.iter().map(|s| s.to_string()).collect(),
            }),
            max_suggestions: 3,
        };
        
        let response = timeout(
            Duration::from_secs(5),
            client.get_suggestions(Request::new(request))
        ).await.expect("Request timeout").expect("Failed to get suggestions");
        
        let suggestions_response = response.into_inner();
        assert!(!suggestions_response.context_id.is_empty());
        
        for suggestion in &suggestions_response.suggestions {
            assert!(!suggestion.suggestion_id.is_empty());
            assert!(!suggestion.title.is_empty());
            assert!(!suggestion.description.is_empty());
            assert!(suggestion.confidence >= 0.0 && suggestion.confidence <= 1.0);
            assert!(suggestion.action.is_some());
            assert!(suggestion.priority >= 1 && suggestion.priority <= 5);
            
            let action = suggestion.action.as_ref().unwrap();
            assert!(!action.action_type.is_empty());
            assert!(!action.command.is_empty());
        }
        
        println!("✅ {} context: {} suggestions with valid structure", 
                context_type, suggestions_response.suggestions.len());
    }
    
    // Cleanup
    let _ = client.delete_agent(Request::new(DeleteAgentRequest {
        session_id: session.session_id.clone(),
        agent_id: agent.agent_id,
    })).await;
    
    let _ = client.delete_session(Request::new(DeleteSessionRequest {
        session_id: session.session_id,
    })).await;
    
    server_handle.abort();
    
    println!("\n🎉 Comprehensive suggestion system test passed successfully!");
}
