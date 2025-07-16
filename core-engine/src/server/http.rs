// HTTP REST API Server
// Provides dashboard and observability endpoints

use std::sync::Arc;
use tokio::sync::RwLock;
use serde::Serialize;
use serde_json::json;
use warp::{Filter, Reply, reject::Rejection, http::StatusCode};
use tracing::{info, warn, error};

use crate::{
    error::AppResult,
    agent::AgentManager,
    telemetry::dashboard::{DashboardApi, ApiResponse},
};

/// HTTP server for dashboard and metrics
pub struct HttpServer {
    port: u16,
    dashboard_api: Arc<DashboardApi>,
    agent_manager: Arc<RwLock<AgentManager>>,
}

/// Error response format
#[derive(Serialize)]
struct ErrorResponse {
    error: String,
    code: u16,
    timestamp: String,
}

impl HttpServer {
    /// Create new HTTP server
    pub fn new(
        port: u16,
        dashboard_api: Arc<DashboardApi>,
        agent_manager: Arc<RwLock<AgentManager>>,
    ) -> Self {
        Self {
            port,
            dashboard_api,
            agent_manager,
        }
    }
    
    /// Start the HTTP server with all endpoints
    pub async fn start(&self) -> AppResult<()> {
        let dashboard_api = self.dashboard_api.clone();
        let agent_manager = self.agent_manager.clone();
        
        // Health check endpoint
        let health = warp::path("health")
            .and(warp::get())
            .and_then(health_handler);
        
        // Dashboard data endpoint
        let dashboard = warp::path("api")
            .and(warp::path("dashboard"))
            .and(warp::get())
            .and(with_dashboard_api(dashboard_api.clone()))
            .and_then(dashboard_handler);
        
        // Prometheus metrics endpoint
        let metrics = warp::path("metrics")
            .and(warp::get())
            .and(with_dashboard_api(dashboard_api.clone()))
            .and_then(metrics_handler);
        
        // Trace details endpoint
        let trace = warp::path("api")
            .and(warp::path("traces"))
            .and(warp::path::param::<String>())
            .and(warp::get())
            .and(with_dashboard_api(dashboard_api.clone()))
            .and_then(trace_handler);
        
        // Alerts endpoint
        let alerts = warp::path("api")
            .and(warp::path("alerts"))
            .and(warp::get())
            .and(with_dashboard_api(dashboard_api.clone()))
            .and_then(alerts_handler);
        
        // Agent metrics endpoint
        let agent_metrics = warp::path("api")
            .and(warp::path("agents"))
            .and(warp::path("metrics"))
            .and(warp::get())
            .and(with_agent_manager(agent_manager.clone()))
            .and_then(agent_metrics_handler);
        
        // Agent list endpoint
        let agent_list = warp::path("api")
            .and(warp::path("agents"))
            .and(warp::get())
            .and(with_agent_manager(agent_manager.clone()))
            .and_then(agent_list_handler);
        
        // Agent status endpoint
        let agent_status = warp::path("api")
            .and(warp::path("agents"))
            .and(warp::path::param::<String>())
            .and(warp::path("status"))
            .and(warp::get())
            .and(with_agent_manager(agent_manager.clone()))
            .and_then(agent_status_handler);
        
        // Configuration endpoint
        let config = warp::path("api")
            .and(warp::path("config"))
            .and(warp::get())
            .and(with_dashboard_api(dashboard_api.clone()))
            .and_then(config_handler);
        
        // CORS configuration
        let cors = warp::cors()
            .allow_any_origin()
            .allow_headers(vec!["content-type", "authorization"])
            .allow_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"]);
        
        // Combine all routes
        let routes = health
            .or(dashboard)
            .or(metrics)
            .or(trace)
            .or(alerts)
            .or(agent_metrics)
            .or(agent_list)
            .or(agent_status)
            .or(config)
            .with(cors)
            .recover(handle_rejection);
        
        let addr = ([0, 0, 0, 0], self.port);
        info!("🌐 Starting HTTP dashboard server on http://0.0.0.0:{}", self.port);
        
        warp::serve(routes)
            .run(addr)
            .await;
        
        Ok(())
    }
}

/// Health check handler
async fn health_handler() -> Result<impl Reply, Rejection> {
    let response = json!({
        "status": "healthy",
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "service": "sirsi-nexus-dashboard"
    });
    
    Ok(warp::reply::with_status(
        warp::reply::json(&response),
        StatusCode::OK,
    ))
}

/// Dashboard data handler
async fn dashboard_handler(
    dashboard_api: Arc<DashboardApi>,
) -> Result<impl Reply, Rejection> {
    match dashboard_api.get_dashboard_data().await {
        Ok(data) => Ok(warp::reply::with_status(
            warp::reply::json(&data),
            StatusCode::OK,
        )),
        Err(e) => {
            error!("Failed to get dashboard data: {}", e);
            Err(warp::reject::custom(ApiError::InternalError))
        }
    }
}

/// Prometheus metrics handler
async fn metrics_handler(
    dashboard_api: Arc<DashboardApi>,
) -> Result<impl Reply, Rejection> {
    match dashboard_api.get_prometheus_metrics().await {
        Ok(metrics) => Ok(warp::reply::with_header(
            metrics,
            "content-type",
            "text/plain; version=0.0.4; charset=utf-8",
        )),
        Err(e) => {
            error!("Failed to get Prometheus metrics: {}", e);
            Err(warp::reject::custom(ApiError::InternalError))
        }
    }
}

/// Trace details handler
async fn trace_handler(
    trace_id: String,
    dashboard_api: Arc<DashboardApi>,
) -> Result<impl Reply, Rejection> {
    match dashboard_api.get_trace_details(&trace_id).await {
        Ok(trace) => Ok(warp::reply::with_status(
            warp::reply::json(&trace),
            StatusCode::OK,
        )),
        Err(e) => {
            warn!("Failed to get trace {}: {}", trace_id, e);
            Err(warp::reject::custom(ApiError::NotFound))
        }
    }
}

/// Alerts handler
async fn alerts_handler(
    dashboard_api: Arc<DashboardApi>,
) -> Result<impl Reply, Rejection> {
    match dashboard_api.get_alerts().await {
        Ok(alerts) => Ok(warp::reply::with_status(
            warp::reply::json(&alerts),
            StatusCode::OK,
        )),
        Err(e) => {
            error!("Failed to get alerts: {}", e);
            Err(warp::reject::custom(ApiError::InternalError))
        }
    }
}

/// Agent metrics handler
async fn agent_metrics_handler(
    agent_manager: Arc<RwLock<AgentManager>>,
) -> Result<impl Reply, Rejection> {
    let manager = agent_manager.read().await;
    let metrics = manager.get_agent_metrics().await;
    
    let response = ApiResponse {
        success: true,
        data: Some(metrics),
        error: None,
        timestamp: std::time::SystemTime::now(),
    };
    
    Ok(warp::reply::with_status(
        warp::reply::json(&response),
        StatusCode::OK,
    ))
}

/// Agent list handler
async fn agent_list_handler(
    agent_manager: Arc<RwLock<AgentManager>>,
) -> Result<impl Reply, Rejection> {
    let manager = agent_manager.read().await;
    let available_agents = manager.list_available_agents().await;
    
    let response = json!({
        "success": true,
        "data": {
            "available_agent_types": available_agents,
            "timestamp": chrono::Utc::now().to_rfc3339()
        }
    });
    
    Ok(warp::reply::with_status(
        warp::reply::json(&response),
        StatusCode::OK,
    ))
}

/// Agent status handler
async fn agent_status_handler(
    agent_id: String,
    agent_manager: Arc<RwLock<AgentManager>>,
) -> Result<impl Reply, Rejection> {
    // For this endpoint, we need session context - simplified for demo
    let session_id = "demo_session"; // In real implementation, extract from auth/headers
    
    let manager = agent_manager.read().await;
    match manager.get_agent_status(session_id, &agent_id).await {
        Ok((status, metrics, capabilities)) => {
            let response = json!({
                "success": true,
                "data": {
                    "agent_id": agent_id,
                    "status": status,
                    "metrics": metrics,
                    "capabilities": capabilities,
                    "timestamp": chrono::Utc::now().to_rfc3339()
                }
            });
            
            Ok(warp::reply::with_status(
                warp::reply::json(&response),
                StatusCode::OK,
            ))
        }
        Err(e) => {
            warn!("Failed to get agent status for {}: {}", agent_id, e);
            Err(warp::reject::custom(ApiError::NotFound))
        }
    }
}

/// Configuration handler
async fn config_handler(
    dashboard_api: Arc<DashboardApi>,
) -> Result<impl Reply, Rejection> {
    let config = dashboard_api.get_config().await;
    
    Ok(warp::reply::with_status(
        warp::reply::json(&config),
        StatusCode::OK,
    ))
}

/// Error handling
async fn handle_rejection(err: Rejection) -> Result<impl Reply, std::convert::Infallible> {
    let (code, message) = if err.is_not_found() {
        (StatusCode::NOT_FOUND, "Not Found")
    } else if let Some(ApiError::NotFound) = err.find() {
        (StatusCode::NOT_FOUND, "Resource not found")
    } else if let Some(ApiError::InternalError) = err.find() {
        (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error")
    } else if err.find::<warp::reject::MethodNotAllowed>().is_some() {
        (StatusCode::METHOD_NOT_ALLOWED, "Method not allowed")
    } else {
        error!("Unhandled rejection: {:?}", err);
        (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error")
    };
    
    let error_response = ErrorResponse {
        error: message.to_string(),
        code: code.as_u16(),
        timestamp: chrono::Utc::now().to_rfc3339(),
    };
    
    Ok(warp::reply::with_status(
        warp::reply::json(&error_response),
        code,
    ))
}

/// Helper to pass dashboard API to handlers
fn with_dashboard_api(
    dashboard_api: Arc<DashboardApi>,
) -> impl Filter<Extract = (Arc<DashboardApi>,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || dashboard_api.clone())
}

/// Helper to pass agent manager to handlers
fn with_agent_manager(
    agent_manager: Arc<RwLock<AgentManager>>,
) -> impl Filter<Extract = (Arc<RwLock<AgentManager>>,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || agent_manager.clone())
}

/// Custom API errors
#[derive(Debug)]
enum ApiError {
    NotFound,
    InternalError,
}

impl warp::reject::Reject for ApiError {}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::Duration;
    
    #[tokio::test]
    async fn test_health_endpoint() {
        let result = health_handler().await;
        assert!(result.is_ok());
    }
}
