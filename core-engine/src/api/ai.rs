use axum::{
    extract::State,
    http::StatusCode,
    response::Json,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use std::sync::Arc;
use tracing::{info, error};

use crate::services::{
    AIInfrastructureService, AIOptimizationService,
    InfrastructureRequest, OptimizationRequest,
    InfrastructureResponse, OptimizationResponse,
};

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

    pub fn error(message: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(message),
            timestamp: chrono::Utc::now().to_rfc3339(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HealthCheckResponse {
    pub status: String,
    pub services: ServiceStatuses,
    pub version: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ServiceStatuses {
    pub openai: ServiceStatus,
    pub claude: ServiceStatus,
    pub infrastructure_generator: ServiceStatus,
    pub optimization_engine: ServiceStatus,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ServiceStatus {
    pub available: bool,
    pub provider: String,
    pub mode: String, // "real" or "mock"
}

// AI service state that will be shared across handlers
#[derive(Clone)]
pub struct AIServiceState {
    pub infrastructure_service: Arc<AIInfrastructureService>,
    pub optimization_service: Arc<AIOptimizationService>,
    pub db: PgPool,
}

impl AIServiceState {
    pub fn new(db: PgPool) -> Self {
        Self {
            infrastructure_service: Arc::new(AIInfrastructureService::new()),
            optimization_service: Arc::new(AIOptimizationService::new()),
            db,
        }
    }
}

pub fn router(db: PgPool) -> Router {
    let state = AIServiceState::new(db);
    
    Router::new()
        .route("/ai/health", get(ai_health_check))
        .route("/ai/infrastructure/generate", post(generate_infrastructure_handler))
        .route("/ai/optimization/analyze", post(optimize_infrastructure_handler))
        .route("/ai/capabilities", get(get_ai_capabilities))
        .with_state(state)
}

/// Health check endpoint for AI services
pub async fn ai_health_check(
    State(_state): State<AIServiceState>,
) -> Result<Json<ApiResponse<HealthCheckResponse>>, StatusCode> {
    info!("AI health check requested");

    // Check if AI services are properly initialized
    let openai_available = std::env::var("OPENAI_API_KEY").is_ok();
    let claude_available = std::env::var("ANTHROPIC_API_KEY").is_ok();

    let response = HealthCheckResponse {
        status: "healthy".to_string(),
        services: ServiceStatuses {
            openai: ServiceStatus {
                available: openai_available,
                provider: "OpenAI GPT-4".to_string(),
                mode: if openai_available { "real".to_string() } else { "mock".to_string() },
            },
            claude: ServiceStatus {
                available: claude_available,
                provider: "Anthropic Claude-3.5-Sonnet".to_string(),
                mode: if claude_available { "real".to_string() } else { "mock".to_string() },
            },
            infrastructure_generator: ServiceStatus {
                available: true,
                provider: "SirsiNexus AI Infrastructure".to_string(),
                mode: if openai_available || claude_available { "real".to_string() } else { "mock".to_string() },
            },
            optimization_engine: ServiceStatus {
                available: true,
                provider: "SirsiNexus AI Optimization".to_string(),
                mode: if openai_available || claude_available { "real".to_string() } else { "mock".to_string() },
            },
        },
        version: env!("CARGO_PKG_VERSION").to_string(),
    };

    Ok(Json(ApiResponse::success(response)))
}

/// Generate infrastructure using AI
pub async fn generate_infrastructure_handler(
    State(state): State<AIServiceState>,
    Json(request): Json<InfrastructureRequest>,
) -> Result<Json<ApiResponse<InfrastructureResponse>>, StatusCode> {
    info!("Infrastructure generation requested for {:?} using {:?}", 
          request.cloud_provider, request.ai_provider);

    match state.infrastructure_service.generate_infrastructure(request).await {
        Ok(response) => {
            info!("Infrastructure generation completed successfully with confidence score: {:.2}", 
                  response.confidence_score);
            Ok(Json(ApiResponse::success(response)))
        }
        Err(e) => {
            error!("Infrastructure generation failed: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

/// Optimize infrastructure using AI
pub async fn optimize_infrastructure_handler(
    State(state): State<AIServiceState>,
    Json(request): Json<OptimizationRequest>,
) -> Result<Json<ApiResponse<OptimizationResponse>>, StatusCode> {
    info!("Infrastructure optimization requested for {} provider", 
          request.infrastructure_data.cloud_provider);

    match state.optimization_service.optimize_infrastructure(request).await {
        Ok(response) => {
            info!("Optimization completed successfully with predicted savings: ${:.2}", 
                  response.predicted_cost_savings);
            Ok(Json(ApiResponse::success(response)))
        }
        Err(e) => {
            error!("Infrastructure optimization failed: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AICapabilities {
    pub infrastructure_generation: InfrastructureCapabilities,
    pub optimization: OptimizationCapabilities,
    pub supported_providers: SupportedProviders,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InfrastructureCapabilities {
    pub supported_cloud_providers: Vec<String>,
    pub template_formats: Vec<String>,
    pub ai_models: Vec<String>,
    pub features: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OptimizationCapabilities {
    pub optimization_goals: Vec<String>,
    pub recommendation_categories: Vec<String>,
    pub analytics_features: Vec<String>,
    pub cost_prediction: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SupportedProviders {
    pub cloud_providers: Vec<String>,
    pub ai_providers: Vec<String>,
}

/// Get AI service capabilities
pub async fn get_ai_capabilities(
    State(_state): State<AIServiceState>,
) -> Result<Json<ApiResponse<AICapabilities>>, StatusCode> {
    info!("AI capabilities requested");

    let capabilities = AICapabilities {
        infrastructure_generation: InfrastructureCapabilities {
            supported_cloud_providers: vec![
                "AWS".to_string(),
                "Azure".to_string(),
                "GCP".to_string(),
                "Kubernetes".to_string(),
                "IBM Cloud".to_string(),
                "Oracle Cloud".to_string(),
                "Alibaba Cloud".to_string(),
            ],
            template_formats: vec![
                "Terraform".to_string(),
                "Bicep".to_string(),
                "YAML".to_string(),
                "CloudFormation".to_string(),
            ],
            ai_models: vec![
                "GPT-4 Turbo".to_string(),
                "Claude-3.5-Sonnet".to_string(),
            ],
            features: vec![
                "Production-ready templates".to_string(),
                "Security best practices".to_string(),
                "Cost optimization".to_string(),
                "Auto-scaling configuration".to_string(),
                "Compliance recommendations".to_string(),
            ],
        },
        optimization: OptimizationCapabilities {
            optimization_goals: vec![
                "Cost Reduction".to_string(),
                "Performance Improvement".to_string(),
                "Reliability Enhancement".to_string(),
                "Security Hardening".to_string(),
                "Sustainability".to_string(),
            ],
            recommendation_categories: vec![
                "Instance Sizing".to_string(),
                "Auto Scaling".to_string(),
                "Reserved Instances".to_string(),
                "Spot Instances".to_string(),
                "Storage Optimization".to_string(),
                "Network Optimization".to_string(),
                "Architectural Changes".to_string(),
            ],
            analytics_features: vec![
                "Usage Pattern Analysis".to_string(),
                "Cost Prediction".to_string(),
                "Performance Impact Assessment".to_string(),
                "Risk Analysis".to_string(),
                "Implementation Planning".to_string(),
            ],
            cost_prediction: true,
        },
        supported_providers: SupportedProviders {
            cloud_providers: vec![
                "AWS".to_string(),
                "Microsoft Azure".to_string(),
                "Google Cloud Platform".to_string(),
                "Kubernetes".to_string(),
                "IBM Cloud".to_string(),
                "Oracle Cloud".to_string(),
                "Alibaba Cloud".to_string(),
            ],
            ai_providers: vec![
                "OpenAI".to_string(),
                "Anthropic".to_string(),
            ],
        },
    };

    Ok(Json(ApiResponse::success(capabilities)))
}

// Wrapper functions for integration with main router
pub async fn ai_health_check_wrapper(
    State(db): State<PgPool>,
) -> Result<Json<ApiResponse<HealthCheckResponse>>, StatusCode> {
    let state = AIServiceState::new(db);
    ai_health_check(State(state)).await
}

pub async fn generate_infrastructure_wrapper(
    State(db): State<PgPool>,
    Json(request): Json<InfrastructureRequest>,
) -> Result<Json<ApiResponse<InfrastructureResponse>>, StatusCode> {
    let state = AIServiceState::new(db);
    generate_infrastructure_handler(State(state), Json(request)).await
}

pub async fn optimize_infrastructure_wrapper(
    State(db): State<PgPool>,
    Json(request): Json<OptimizationRequest>,
) -> Result<Json<ApiResponse<OptimizationResponse>>, StatusCode> {
    let state = AIServiceState::new(db);
    optimize_infrastructure_handler(State(state), Json(request)).await
}

pub async fn get_ai_capabilities_wrapper(
    State(db): State<PgPool>,
) -> Result<Json<ApiResponse<AICapabilities>>, StatusCode> {
    let state = AIServiceState::new(db);
    get_ai_capabilities(State(state)).await
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use serde_json::json;
    use tower::ServiceExt;

    #[tokio::test]
    async fn test_ai_health_check() {
        // This would require a test database setup
        // For now, we'll test the basic structure
        
        let db_url = "postgresql://test@localhost:26257/test_db?sslmode=disable";
        if let Ok(pool) = sqlx::postgres::PgPoolOptions::new()
            .max_connections(1)
            .connect(db_url)
            .await 
        {
            let app = router(pool);
            
            let response = app
                .oneshot(
                    Request::builder()
                        .uri("/ai/health")
                        .body(Body::empty())
                        .unwrap(),
                )
                .await
                .unwrap();

            assert_eq!(response.status(), StatusCode::OK);
        }
    }

    #[tokio::test]
    async fn test_ai_capabilities() {
        let db_url = "postgresql://test@localhost:26257/test_db?sslmode=disable";
        if let Ok(pool) = sqlx::postgres::PgPoolOptions::new()
            .max_connections(1)
            .connect(db_url)
            .await 
        {
            let app = router(pool);
            
            let response = app
                .oneshot(
                    Request::builder()
                        .uri("/ai/capabilities")
                        .body(Body::empty())
                        .unwrap(),
                )
                .await
                .unwrap();

            assert_eq!(response.status(), StatusCode::OK);
        }
    }
}
