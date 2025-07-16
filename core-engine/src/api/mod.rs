use axum::{
    routing::{get, post, put, delete, options},
    Router,
    response::IntoResponse,
    http::StatusCode,
};
use sqlx::PgPool; // CockroachDB uses PostgreSQL protocol

pub mod auth;
pub mod projects;
pub mod ai;
pub mod sirsi_persona;
pub mod orchestration; // Phase 6.3 - Real Agent Orchestration
pub mod port_registry; // Centralized Port Management

// Individual module routers for backwards compatibility
pub mod health {
    use axum::{routing::get, Router};
    
    pub fn router() -> Router {
        Router::new().route("/health", get(super::health_check))
    }
}

pub mod users {
    use axum::Router;
    
    pub fn router() -> Router {
        Router::new()
        // Add user-specific routes here if needed
    }
}

pub fn create_router(db: PgPool) -> Router {
    Router::new()
        .route("/health", get(health_check))
        // Auth routes
        .route("/auth/register", post(auth::register_handler))
        .route("/auth/login", post(auth::login_handler))
        // Projects routes
        .route("/projects", get(projects::list_projects_handler))
        .route("/projects", post(projects::create_project_handler))
        .route("/projects/:id", get(projects::get_project_handler))
        .route("/projects/:id", put(projects::update_project_handler))
        .route("/projects/:id", delete(projects::delete_project_handler))
        // AI routes
        .route("/ai/health", get(ai::ai_health_check_wrapper))
        .route("/ai/infrastructure/generate", post(ai::generate_infrastructure_wrapper))
        .route("/ai/optimization/analyze", post(ai::optimize_infrastructure_wrapper))
        .route("/ai/capabilities", get(ai::get_ai_capabilities_wrapper))
        // Sirsi Persona routes
        .route("/sirsi/process_request", post(sirsi_persona::process_request))
        .route("/sirsi/get_overview", get(sirsi_persona::get_overview))
        .route("/sirsi/execute_decision", post(sirsi_persona::execute_decision))
        // Phase 6.3 - Real Agent Orchestration routes
        .route("/orchestration/tasks", post(orchestration::create_orchestration_task))
        .route("/orchestration/tasks", get(orchestration::list_orchestration_tasks))
        .route("/orchestration/tasks/:task_id", get(orchestration::get_orchestration_task_status))
        .route("/orchestration/test/aws", post(orchestration::test_orchestration_aws))
        .route("/orchestration/health", get(orchestration::get_orchestration_health))
        // Port Registry routes - Centralized Port Management
        .route("/ports/allocate", post(port_registry::allocate_port))
        .route("/ports/release", post(port_registry::release_port))
        .route("/ports/heartbeat/:allocation_id", post(port_registry::heartbeat))
        .route("/ports/directory", get(port_registry::get_service_directory))
        .route("/ports/service/:service_name", get(port_registry::get_service_port))
        .route("/ports/stats", get(port_registry::get_registry_stats))
        .route("/ports/cleanup", post(port_registry::cleanup_expired))
        .route("/ports/health", get(port_registry::get_registry_health))
        .route("/ports/ranges", get(port_registry::get_port_ranges))
        // New comprehensive discovery endpoints
        .route("/ports/overview", get(port_registry::get_port_overview))
        .route("/ports/port/:port_id", get(port_registry::get_port_by_id))
        .route("/ports/type/:service_type", get(port_registry::get_services_by_type))
        // OPTIONS routes for CORS preflight
        .route("/sirsi/process_request", options(options_handler))
        .route("/sirsi/get_overview", options(options_handler))
        .route("/sirsi/execute_decision", options(options_handler))
        .route("/orchestration/tasks", options(options_handler))
        .route("/orchestration/health", options(options_handler))
        .route("/orchestration/test/aws", options(options_handler))
        .route("/ports/allocate", options(options_handler))
        .route("/ports/release", options(options_handler))
        .route("/ports/directory", options(options_handler))
        .route("/ports/health", options(options_handler))
        .route("/ports/overview", options(options_handler))
        .route("/health", options(options_handler))
        .with_state(db)
}

pub async fn health_check() -> &'static str {
    "OK"
}

/// Handle CORS preflight OPTIONS requests
async fn options_handler() -> impl IntoResponse {
    (StatusCode::OK, [
        ("Access-Control-Allow-Origin", "*"),
        ("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"),
        ("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept"),
        ("Access-Control-Max-Age", "86400"),
    ])
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::StatusCode;
    use axum::body::Body;
    use axum::http::Request;
    use tower::ServiceExt;

    #[tokio::test]
    #[serial_test::serial]
    async fn test_health_check() {
        // Load environment variables from .env file
        dotenv::dotenv().ok();
        
        let db_url = std::env::var("DATABASE_URL")
            .unwrap_or_else(|_| "postgresql://root@localhost:26257/sirsi_nexus?sslmode=disable".to_string());
        
        let pool = sqlx::postgres::PgPoolOptions::new()
            .max_connections(1)
            .connect(&db_url)
            .await
            .expect("Failed to connect to database");
        
        let app = create_router(pool);
        
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/health")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        
        let body = hyper::body::to_bytes(response.into_body()).await.unwrap();
        assert_eq!(&body[..], b"OK");
    }
}
