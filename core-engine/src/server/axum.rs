use axum::{Router, Json, response::Json as ResponseJson};
use sqlx::postgres::PgPoolOptions;
use std::net::SocketAddr;
use tracing::{info, error};
use serde_json::json;

/// Start REST API server with Sirsi Persona endpoints
pub async fn start_rest_server(addr: &str) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    info!("🌐 Starting REST API server on {}", addr);

    // Load environment variables from .env file if available
    dotenvy::dotenv().ok();

    // Create database pool
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgresql://root@localhost:26257/sirsi_nexus?sslmode=disable".to_string());

    let pool = match PgPoolOptions::new()
        .max_connections(10)
        .connect(&database_url)
        .await
    {
        Ok(pool) => {
            info!("✅ Connected to database");
            pool
        }
        Err(e) => {
            error!("❌ Failed to connect to database: {}", e);
            // Create a minimal pool for testing without database
            return start_mock_server(addr).await;
        }
    };

    // Create the application router with all API routes
    let app = crate::api::create_router(pool);

    // Parse the address
    let addr: SocketAddr = addr.parse()
        .map_err(|e| format!("Invalid address: {}", e))?;

    info!("🚀 REST API server listening on {}", addr);
    info!("📡 Sirsi Persona endpoints available:");
    info!("   • GET  /sirsi/get_overview");
    info!("   • POST /sirsi/process_request");
    info!("   • POST /sirsi/execute_decision");
    info!("   • GET  /health");

    // Start the server
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .map_err(|e| Box::new(e) as Box<dyn std::error::Error + Send + Sync>)
}

/// Start a mock server without database dependency for testing
async fn start_mock_server(addr: &str) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    use axum::{routing::get, response::Json as ResponseJson};
    use serde_json::json;

    info!("⚠️  Starting mock REST API server (no database)");

    let app = Router::new()
        .route("/health", get(|| async { ResponseJson(json!({"status": "ok", "mode": "mock"})) }))
        .route("/sirsi/get_overview", get(mock_overview))
        .route("/sirsi/process_request", axum::routing::post(mock_process_request))
        .route("/sirsi/execute_decision", axum::routing::post(mock_execute_decision));

    let addr: SocketAddr = addr.parse()
        .map_err(|e| format!("Invalid address: {}", e))?;

    info!("🚀 Mock REST API server listening on {}", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .map_err(|e| Box::new(e) as Box<dyn std::error::Error + Send + Sync>)
}

// Mock handlers for testing
async fn mock_overview() -> ResponseJson<serde_json::Value> {
    ResponseJson(json!({
        "success": true,
        "data": {
            "timestamp": chrono::Utc::now().to_rfc3339(),
            "overall_health": "Optimal",
            "active_sessions": 0,
            "active_agents": 0,
            "infrastructure_summary": {
                "total_resources": 0,
                "cloud_providers": [],
                "monthly_cost": 0.0,
                "cost_trend": "Stable",
                "resource_utilization": 0.0
            },
            "cost_optimization_opportunities": [],
            "security_alerts": [],
            "performance_metrics": {
                "avg_response_time_ms": 0.0,
                "success_rate": 1.0,
                "resource_utilization": 0.0,
                "throughput_ops_per_sec": 0.0
            },
            "predictive_insights": []
        },
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

async fn mock_process_request(Json(body): Json<serde_json::Value>) -> ResponseJson<serde_json::Value> {
    ResponseJson(json!({
        "success": true,
        "data": {
            "request_id": uuid::Uuid::new_v4().to_string(),
            "response_type": "InfrastructureGeneration",
            "infrastructure_code": "# Mock Terraform code\nresource \"aws_instance\" \"example\" {\n  ami           = \"ami-0abcdef1234567890\"\n  instance_type = \"t3.micro\"\n}\n",
            "explanation": format!("Mock response for: {}", body.get("request").and_then(|v| v.as_str()).unwrap_or("unknown request")),
            "recommendations": ["This is a mock response", "Real implementation requires database connection"],
            "cost_estimate": "$10-20/month",
            "deployment_time": "5-10 minutes",
            "confidence_score": 0.85,
            "alternative_approaches": []
        },
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

async fn mock_execute_decision(Json(body): Json<serde_json::Value>) -> ResponseJson<serde_json::Value> {
    ResponseJson(json!({
        "success": true,
        "data": {
            "plan_id": uuid::Uuid::new_v4().to_string(),
            "title": format!("Mock Decision for: {}", body.get("context").and_then(|v| v.as_str()).unwrap_or("unknown context")),
            "description": "Mock AI-powered strategic decision",
            "steps": [
                {
                    "step_id": uuid::Uuid::new_v4().to_string(),
                    "title": "Mock Analysis Phase",
                    "description": "Mock comprehensive analysis",
                    "estimated_duration": "2 minutes",
                    "dependencies": [],
                    "validation_criteria": ["Mock analysis completed"]
                }
            ],
            "estimated_duration": "5 minutes",
            "risk_assessment": {
                "overall_risk": "Low",
                "risk_factors": [],
                "mitigation_strategies": ["Mock continuous monitoring"]
            },
            "success_criteria": ["Mock objectives achieved"]
        },
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}
