use axum::{
    extract::State,
    http::HeaderValue,
    response::{IntoResponse, Response},
    Json,
};
use serde::{Serialize, Deserialize};
use sqlx::PgPool;
use std::sync::Arc;
use tracing::{error, info};

use crate::agent::AgentManager;
use crate::services::{
    AIInfrastructureService, AIOptimizationService, SirsiPersonaService,
    NaturalLanguageRequest, SystemOverview, ActionPlan,
    RequestPriority,
};
use crate::api::port_registry::get_port_registry;

// Request/Response types for API
#[derive(Debug, Serialize, Deserialize)]
pub struct ProcessRequestBody {
    pub user_id: String,
    pub session_id: String,
    pub request: String,
    pub context: std::collections::HashMap<String, String>,
    pub priority: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExecuteDecisionBody {
    pub context: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
    pub timestamp: String,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            timestamp: chrono::Utc::now().to_rfc3339(),
        }
    }

    pub fn error(error: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(error),
            timestamp: chrono::Utc::now().to_rfc3339(),
        }
    }
}

/// Handle port management queries using the port registry
async fn handle_port_query(query: &str) -> Result<String, String> {
    let registry = get_port_registry()
        .map_err(|e| format!("Port registry not available: {}", e))?;
    
    if query.to_lowercase().contains("overview") || query.to_lowercase().contains("all") {
        let directory = registry.get_service_directory().await;
        let stats = registry.get_stats().await;
        
        Ok(format!(
            "🔌 Port Registry Overview: {} total services, {} active. Services: {}. System health: Optimal.",
            stats.total_allocations,
            stats.active_allocations,
            directory.keys().map(|k| k.as_str()).collect::<Vec<_>>().join(", ")
        ))
    } else if query.to_lowercase().contains("8080") {
        let directory = registry.get_service_directory().await;
        if let Some(allocation) = directory.values().find(|a| a.port == 8080) {
            Ok(format!(
                "🔍 Port 8080: Service '{}' ({}), Status: {:?}, Host: {}, Last heartbeat: {}",
                allocation.service_name,
                allocation.service_type.as_str(),
                allocation.status,
                allocation.host,
                allocation.last_heartbeat
            ))
        } else {
            Ok("Port 8080 is not currently allocated to any service.".to_string())
        }
    } else if query.to_lowercase().contains("health") {
        let stats = registry.get_stats().await;
        let health_percentage = if stats.total_allocations > 0 {
            (stats.active_allocations as f32 / stats.total_allocations as f32) * 100.0
        } else {
            100.0
        };
        
        Ok(format!(
            "🏥 Port Registry Health: {:.1}% ({} active / {} total services). All systems operational.",
            health_percentage,
            stats.active_allocations,
            stats.total_allocations
        ))
    } else {
        let directory = registry.get_service_directory().await;
        Ok(format!(
            "🔌 I can see {} services across all ports. Available services: {}. Ask me about specific ports or service health.",
            directory.len(),
            directory.keys().take(5).map(|k| k.as_str()).collect::<Vec<_>>().join(", ")
        ))
    }
}

/// Helper function to add CORS headers to responses
fn add_cors_headers(mut response: Response) -> Response {
    let headers = response.headers_mut();
    headers.insert(
        "Access-Control-Allow-Origin",
        HeaderValue::from_static("*"),
    );
    headers.insert(
        "Access-Control-Allow-Methods",
        HeaderValue::from_static("GET, POST, PUT, DELETE, OPTIONS"),
    );
    headers.insert(
        "Access-Control-Allow-Headers",
        HeaderValue::from_static("Content-Type, Authorization, Accept"),
    );
    response
}

/// Process natural language request through Sirsi Persona
pub async fn process_request(
    State(_db): State<PgPool>,
    Json(body): Json<ProcessRequestBody>,
) -> Response {
    info!("🎯 Processing Sirsi Persona request: {}", body.request);

    // Initialize services
    let agent_manager = Arc::new(AgentManager::new());
    let ai_infrastructure = Arc::new(AIInfrastructureService::new());
    let ai_optimization = Arc::new(AIOptimizationService::new());
    
    let sirsi_service = SirsiPersonaService::new(
        agent_manager,
        ai_infrastructure,
        ai_optimization,
    );

    // Convert priority string to enum
    let priority = match body.priority.as_deref() {
        Some("low") => RequestPriority::Low,
        Some("high") => RequestPriority::High,
        Some("critical") => RequestPriority::Critical,
        _ => RequestPriority::Normal,
    };

    // Check for port management queries and enhance the request context
    let enhanced_context = if body.request.to_lowercase().contains("port") || 
                              body.request.to_lowercase().contains("service") {
        // Add port information to the context
        let mut context = body.context.clone();
        match handle_port_query(&body.request).await {
            Ok(port_response) => {
                context.insert("port_data".to_string(), port_response);
            }
            Err(e) => {
                error!("❌ Port query failed: {}", e);
                context.insert("port_error".to_string(), format!("Port registry unavailable: {}", e));
            }
        }
        context
    } else {
        body.context
    };

    let request = NaturalLanguageRequest {
        user_id: body.user_id,
        session_id: body.session_id,
        request: body.request,
        context: enhanced_context,
        priority,
    };
    
    // Handle all queries through Sirsi service
    let api_response = match sirsi_service.process_natural_language_request(request).await {
        Ok(response) => Json(ApiResponse::success(response)).into_response(),
        Err(e) => {
            error!("❌ Sirsi Persona request failed: {}", e);
            Json(ApiResponse::<String>::error(format!(
                "Supreme AI Sirsi encountered an error: {}",
                e
            ))).into_response()
        }
    };
    
    add_cors_headers(api_response)
}

/// Get omniscient overview of the system
pub async fn get_overview(
    State(_db): State<PgPool>,
) -> Response {
    info!("🔮 Getting omniscient overview from Sirsi Persona");

    // Initialize services
    let agent_manager = Arc::new(AgentManager::new());
    let ai_infrastructure = Arc::new(AIInfrastructureService::new());
    let ai_optimization = Arc::new(AIOptimizationService::new());
    
    let sirsi_service = SirsiPersonaService::new(
        agent_manager,
        ai_infrastructure,
        ai_optimization,
    );

    let api_response = match sirsi_service.provide_omniscient_overview().await {
        Ok(overview) => Json(ApiResponse::success(overview)).into_response(),
        Err(e) => {
            error!("❌ Failed to get omniscient overview: {}", e);
            Json(ApiResponse::<SystemOverview>::error(format!(
                "Supreme AI Sirsi omniscient capabilities temporarily unavailable: {}",
                e
            ))).into_response()
        }
    };
    
    add_cors_headers(api_response)
}

/// Execute supreme decision
pub async fn execute_decision(
    State(_db): State<PgPool>,
    Json(body): Json<ExecuteDecisionBody>,
) -> Response {
    info!("⚡ Executing supreme decision with context: {}", body.context);

    // Initialize services
    let agent_manager = Arc::new(AgentManager::new());
    let ai_infrastructure = Arc::new(AIInfrastructureService::new());
    let ai_optimization = Arc::new(AIOptimizationService::new());
    
    let sirsi_service = SirsiPersonaService::new(
        agent_manager,
        ai_infrastructure,
        ai_optimization,
    );

    let api_response = match sirsi_service.execute_supreme_decision(&body.context).await {
        Ok(plan) => Json(ApiResponse::success(plan)).into_response(),
        Err(e) => {
            error!("❌ Supreme decision execution failed: {}", e);
            Json(ApiResponse::<ActionPlan>::error(format!(
                "Supreme AI decision engine temporarily unavailable: {}",
                e
            ))).into_response()
        }
    };
    
    add_cors_headers(api_response)
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use axum::Router;
    use sqlx::postgres::PgPoolOptions;
    use std::collections::HashMap;
    use tower::ServiceExt;

    async fn create_test_app() -> Router {
        // Use test database or mock
        let database_url = std::env::var("TEST_DATABASE_URL")
            .unwrap_or_else(|_| "postgresql://root@localhost:26257/sirsi_nexus_test?sslmode=disable".to_string());
        
        let pool = PgPoolOptions::new()
            .max_connections(1)
            .connect(&database_url)
            .await
            .expect("Failed to connect to test database");

        Router::new()
            .route("/sirsi/process_request", axum::routing::post(process_request))
            .route("/sirsi/get_overview", axum::routing::get(get_overview))
            .route("/sirsi/execute_decision", axum::routing::post(execute_decision))
            .with_state(pool)
    }

    #[tokio::test]
    #[serial_test::serial]
    async fn test_process_request() {
        let app = create_test_app().await;

        let test_request = ProcessRequestBody {
            user_id: "test_user".to_string(),
            session_id: "test_session".to_string(),
            request: "Create a simple web API".to_string(),
            context: HashMap::new(),
            priority: Some("normal".to_string()),
        };

        let request = Request::builder()
            .uri("/sirsi/process_request")
            .method("POST")
            .header("content-type", "application/json")
            .body(Body::from(serde_json::to_string(&test_request).unwrap()))
            .unwrap();

        let response = app.oneshot(request).await.unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    #[serial_test::serial]
    async fn test_get_overview() {
        let app = create_test_app().await;

        let request = Request::builder()
            .uri("/sirsi/get_overview")
            .method("GET")
            .body(Body::empty())
            .unwrap();

        let response = app.oneshot(request).await.unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    #[serial_test::serial]
    async fn test_execute_decision() {
        let app = create_test_app().await;

        let test_request = ExecuteDecisionBody {
            context: "Optimize database performance".to_string(),
        };

        let request = Request::builder()
            .uri("/sirsi/execute_decision")
            .method("POST")
            .header("content-type", "application/json")
            .body(Body::from(serde_json::to_string(&test_request).unwrap()))
            .unwrap();

        let response = app.oneshot(request).await.unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }
}
