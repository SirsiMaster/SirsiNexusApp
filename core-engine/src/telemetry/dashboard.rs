// Dashboard API
// Provides REST endpoints for metrics visualization and monitoring

use std::{
    collections::HashMap,
    sync::Arc,
    time::{SystemTime, UNIX_EPOCH},
};
use serde::{Deserialize, Serialize};
use tracing::info;

use crate::{
    error::AppResult,
    telemetry::{
        metrics::{MetricsCollector, MetricsSnapshot, Alert, AlertThresholds},
        prometheus::PrometheusExporter,
        opentelemetry::{OtelTracer, Trace},
    },
};
use crate::audit::AuditLogger;

/// Dashboard API server
#[derive(Debug)]
pub struct DashboardApi {
    metrics_collector: Arc<MetricsCollector>,
    prometheus_exporter: Arc<PrometheusExporter>,
    otel_tracer: Arc<OtelTracer>,
    alert_thresholds: AlertThresholds,
    audit_logger: Option<AuditLogger>,
    dashboard_config: DashboardConfig,
}

/// Dashboard configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardConfig {
    pub title: String,
    pub refresh_interval_seconds: u64,
    pub max_traces_displayed: usize,
    pub alert_retention_hours: u64,
    pub enable_real_time_updates: bool,
    pub theme: DashboardTheme,
}

/// Dashboard theme configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DashboardTheme {
    Light,
    Dark,
    Auto,
}

/// Real-time dashboard data
#[derive(Debug, Serialize, Deserialize)]
pub struct DashboardData {
    pub timestamp: SystemTime,
    pub system_overview: SystemOverview,
    pub application_status: ApplicationStatus,
    pub performance_metrics: PerformanceMetrics,
    pub active_alerts: Vec<Alert>,
    pub recent_traces: Vec<TraceSummary>,
    pub health_status: HealthStatus,
}

/// System overview for dashboard
#[derive(Debug, Serialize, Deserialize)]
pub struct SystemOverview {
    pub cpu_usage_percent: f64,
    pub memory_usage_percent: f64,
    pub disk_usage_percent: f64,
    pub network_throughput_mbps: f64,
    pub load_average_1m: f64,
    pub uptime_seconds: u64,
    pub active_connections: u64,
}

/// Application status information
#[derive(Debug, Serialize, Deserialize)]
pub struct ApplicationStatus {
    pub total_requests: u64,
    pub requests_per_second: f64,
    pub error_rate_percent: f64,
    pub avg_response_time_ms: f64,
    pub active_agents: u64,
    pub database_connections: u64,
    pub cache_hit_ratio_percent: f64,
    pub ai_api_calls_per_minute: f64,
}

/// Performance metrics for charts
#[derive(Debug, Serialize, Deserialize)]
pub struct PerformanceMetrics {
    pub response_time_percentiles: ResponseTimePercentiles,
    pub throughput_timeline: Vec<ThroughputPoint>,
    pub error_rate_timeline: Vec<ErrorRatePoint>,
    pub resource_usage_timeline: Vec<ResourceUsagePoint>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ResponseTimePercentiles {
    pub p50: f64,
    pub p95: f64,
    pub p99: f64,
    pub p99_9: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ThroughputPoint {
    pub timestamp: SystemTime,
    pub requests_per_second: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorRatePoint {
    pub timestamp: SystemTime,
    pub error_rate_percent: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ResourceUsagePoint {
    pub timestamp: SystemTime,
    pub cpu_percent: f64,
    pub memory_percent: f64,
    pub disk_percent: f64,
}

/// Trace summary for dashboard
#[derive(Debug, Serialize, Deserialize)]
pub struct TraceSummary {
    pub trace_id: String,
    pub start_time: SystemTime,
    pub duration_ms: u64,
    pub span_count: usize,
    pub service_count: usize,
    pub error_count: usize,
    pub root_operation: String,
    pub status: TraceStatus,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum TraceStatus {
    Success,
    Error,
    Timeout,
    Partial,
}

/// Overall health status
#[derive(Debug, Serialize, Deserialize)]
pub struct HealthStatus {
    pub overall: HealthLevel,
    pub components: HashMap<String, ComponentHealth>,
    pub last_check: SystemTime,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum HealthLevel {
    Healthy,
    Degraded,
    Unhealthy,
    Unknown,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ComponentHealth {
    pub status: HealthLevel,
    pub message: String,
    pub last_check: SystemTime,
    pub response_time_ms: Option<f64>,
}

/// Dashboard API endpoints response types
#[derive(Debug, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
    pub timestamp: SystemTime,
}

impl DashboardApi {
    /// Create a new dashboard API
    pub fn new(
        metrics_collector: Arc<MetricsCollector>,
        prometheus_exporter: Arc<PrometheusExporter>,
        otel_tracer: Arc<OtelTracer>,
    ) -> Self {
        Self {
            metrics_collector,
            prometheus_exporter,
            otel_tracer,
            alert_thresholds: AlertThresholds::default(),
            audit_logger: None,
            dashboard_config: DashboardConfig::default(),
        }
    }
    
    /// Set alert thresholds
    pub fn with_alert_thresholds(mut self, thresholds: AlertThresholds) -> Self {
        self.alert_thresholds = thresholds;
        self
    }
    
    /// Add audit logging
    pub fn with_audit_logger(mut self, audit_logger: AuditLogger) -> Self {
        self.audit_logger = Some(audit_logger);
        self
    }
    
    /// Set dashboard configuration
    pub fn with_config(mut self, config: DashboardConfig) -> Self {
        self.dashboard_config = config;
        self
    }
    
    /// Initialize the dashboard API
    pub async fn initialize(&self) -> AppResult<()> {
        info!("📊 Initializing Dashboard API");
        
        if let Some(audit_logger) = &self.audit_logger {
            let _ = audit_logger.log_system_event(
                "dashboard_api_initialized",
                serde_json::json!({
                    "dashboard_title": self.dashboard_config.title,
                    "refresh_interval": self.dashboard_config.refresh_interval_seconds,
                    "real_time_enabled": self.dashboard_config.enable_real_time_updates,
                    "api_enabled": true
                }),
                true,
                None,
            ).await;
        }
        
        info!("✅ Dashboard API initialized successfully");
        Ok(())
    }
    
    /// Get complete dashboard data
    pub async fn get_dashboard_data(&self) -> AppResult<ApiResponse<DashboardData>> {
        let start_time = SystemTime::now();
        
        let snapshot = self.metrics_collector.get_metrics_snapshot().await;
        let alerts = self.metrics_collector.check_alerts(&self.alert_thresholds).await;
        let health = self.get_health_status().await?;
        
        let dashboard_data = DashboardData {
            timestamp: SystemTime::now(),
            system_overview: self.build_system_overview(&snapshot).await,
            application_status: self.build_application_status(&snapshot).await,
            performance_metrics: self.build_performance_metrics(&snapshot).await,
            active_alerts: alerts,
            recent_traces: self.get_recent_traces().await?,
            health_status: health,
        };
        
        // Log API access
        if let Some(audit_logger) = &self.audit_logger {
            let _ = audit_logger.log_system_event(
                "dashboard_data_accessed",
                serde_json::json!({
                    "response_time_ms": start_time.elapsed().unwrap_or_default().as_millis(),
                    "alerts_count": dashboard_data.active_alerts.len(),
                    "traces_count": dashboard_data.recent_traces.len()
                }),
                false,
                None,
            ).await;
        }
        
        Ok(ApiResponse {
            success: true,
            data: Some(dashboard_data),
            error: None,
            timestamp: SystemTime::now(),
        })
    }
    
    /// Get Prometheus metrics endpoint
    pub async fn get_prometheus_metrics(&self) -> AppResult<String> {
        self.prometheus_exporter.export_metrics().await
    }
    
    /// Get specific trace details
    pub async fn get_trace_details(&self, trace_id: &str) -> AppResult<ApiResponse<Trace>> {
        if let Some(trace) = self.otel_tracer.get_trace(trace_id).await {
            Ok(ApiResponse {
                success: true,
                data: Some(trace),
                error: None,
                timestamp: SystemTime::now(),
            })
        } else {
            Ok(ApiResponse {
                success: false,
                data: None,
                error: Some(format!("Trace {} not found", trace_id)),
                timestamp: SystemTime::now(),
            })
        }
    }
    
    /// Get current alerts
    pub async fn get_alerts(&self) -> AppResult<ApiResponse<Vec<Alert>>> {
        let alerts = self.metrics_collector.check_alerts(&self.alert_thresholds).await;
        
        Ok(ApiResponse {
            success: true,
            data: Some(alerts),
            error: None,
            timestamp: SystemTime::now(),
        })
    }
    
    /// Get health status
    pub async fn get_health_status(&self) -> AppResult<HealthStatus> {
        let snapshot = self.metrics_collector.get_metrics_snapshot().await;
        let mut components = HashMap::new();
        
        // Check system health
        let system_health = if snapshot.system_metrics.cpu_usage_percent > 90.0 
            || snapshot.system_metrics.memory_usage_percent > 90.0 {
            ComponentHealth {
                status: HealthLevel::Unhealthy,
                message: "High resource usage".to_string(),
                last_check: SystemTime::now(),
                response_time_ms: None,
            }
        } else if snapshot.system_metrics.cpu_usage_percent > 75.0 
            || snapshot.system_metrics.memory_usage_percent > 80.0 {
            ComponentHealth {
                status: HealthLevel::Degraded,
                message: "Elevated resource usage".to_string(),
                last_check: SystemTime::now(),
                response_time_ms: None,
            }
        } else {
            ComponentHealth {
                status: HealthLevel::Healthy,
                message: "System resources normal".to_string(),
                last_check: SystemTime::now(),
                response_time_ms: None,
            }
        };
        
        components.insert("system".to_string(), system_health);
        
        // Check application health
        let error_rate = if snapshot.application_metrics.total_requests > 0 {
            (snapshot.application_metrics.failed_requests as f64 / 
             snapshot.application_metrics.total_requests as f64) * 100.0
        } else {
            0.0
        };
        
        let app_health = if error_rate > 5.0 {
            ComponentHealth {
                status: HealthLevel::Unhealthy,
                message: format!("High error rate: {:.2}%", error_rate),
                last_check: SystemTime::now(),
                response_time_ms: Some(snapshot.application_metrics.avg_response_time_ms),
            }
        } else if error_rate > 2.0 {
            ComponentHealth {
                status: HealthLevel::Degraded,
                message: format!("Elevated error rate: {:.2}%", error_rate),
                last_check: SystemTime::now(),
                response_time_ms: Some(snapshot.application_metrics.avg_response_time_ms),
            }
        } else {
            ComponentHealth {
                status: HealthLevel::Healthy,
                message: "Application healthy".to_string(),
                last_check: SystemTime::now(),
                response_time_ms: Some(snapshot.application_metrics.avg_response_time_ms),
            }
        };
        
        components.insert("application".to_string(), app_health);
        
        // Determine overall health
        let overall = if components.values().any(|c| matches!(c.status, HealthLevel::Unhealthy)) {
            HealthLevel::Unhealthy
        } else if components.values().any(|c| matches!(c.status, HealthLevel::Degraded)) {
            HealthLevel::Degraded
        } else {
            HealthLevel::Healthy
        };
        
        Ok(HealthStatus {
            overall,
            components,
            last_check: SystemTime::now(),
        })
    }
    
    /// Get configuration
    pub async fn get_config(&self) -> ApiResponse<DashboardConfig> {
        ApiResponse {
            success: true,
            data: Some(self.dashboard_config.clone()),
            error: None,
            timestamp: SystemTime::now(),
        }
    }
    
    /// Update alert thresholds
    pub async fn update_alert_thresholds(&mut self, thresholds: AlertThresholds) -> AppResult<ApiResponse<AlertThresholds>> {
        self.alert_thresholds = thresholds.clone();
        
        if let Some(audit_logger) = &self.audit_logger {
            let _ = audit_logger.log_system_event(
                "alert_thresholds_updated",
                serde_json::json!({
                    "cpu_critical": thresholds.cpu_usage_critical,
                    "memory_critical": thresholds.memory_usage_critical,
                    "error_rate_critical": thresholds.error_rate_critical
                }),
                true,
                None,
            ).await;
        }
        
        Ok(ApiResponse {
            success: true,
            data: Some(thresholds),
            error: None,
            timestamp: SystemTime::now(),
        })
    }
    
    /// Build system overview
    async fn build_system_overview(&self, snapshot: &MetricsSnapshot) -> SystemOverview {
        let sys = &snapshot.system_metrics;
        
        SystemOverview {
            cpu_usage_percent: sys.cpu_usage_percent,
            memory_usage_percent: sys.memory_usage_percent,
            disk_usage_percent: sys.disk_usage_percent,
            network_throughput_mbps: (sys.network_bytes_in + sys.network_bytes_out) as f64 / 1_000_000.0,
            load_average_1m: sys.load_average.one_minute,
            uptime_seconds: sys.timestamp.duration_since(UNIX_EPOCH)
                .unwrap_or_default().as_secs(),
            active_connections: sys.tcp_connections,
        }
    }
    
    /// Build application status
    async fn build_application_status(&self, snapshot: &MetricsSnapshot) -> ApplicationStatus {
        let app = &snapshot.application_metrics;
        
        let error_rate = if app.total_requests > 0 {
            (app.failed_requests as f64 / app.total_requests as f64) * 100.0
        } else {
            0.0
        };
        
        ApplicationStatus {
            total_requests: app.total_requests,
            requests_per_second: app.total_requests as f64 / 60.0, // Simplified calculation
            error_rate_percent: error_rate,
            avg_response_time_ms: app.avg_response_time_ms,
            active_agents: app.agent_operations.active_agents,
            database_connections: app.database_connections_active + app.database_connections_idle,
            cache_hit_ratio_percent: app.cache_hit_ratio,
            ai_api_calls_per_minute: app.agent_operations.ai_api_calls as f64 / 60.0,
        }
    }
    
    /// Build performance metrics
    async fn build_performance_metrics(&self, snapshot: &MetricsSnapshot) -> PerformanceMetrics {
        let app = &snapshot.application_metrics;
        
        PerformanceMetrics {
            response_time_percentiles: ResponseTimePercentiles {
                p50: app.avg_response_time_ms,
                p95: app.p95_response_time_ms,
                p99: app.p99_response_time_ms,
                p99_9: app.p99_response_time_ms * 1.1, // Approximation
            },
            throughput_timeline: vec![], // Would be populated from historical data
            error_rate_timeline: vec![], // Would be populated from historical data
            resource_usage_timeline: vec![], // Would be populated from historical data
        }
    }
    
    /// Get recent traces
    async fn get_recent_traces(&self) -> AppResult<Vec<TraceSummary>> {
        let active_spans = self.otel_tracer.get_active_spans().await;
        let mut traces = Vec::new();
        
        // This is a simplified implementation
        // In a real system, you'd query completed traces from storage
        for span in active_spans.iter().take(self.dashboard_config.max_traces_displayed) {
            if span.parent_span_id.is_none() { // Root spans only
                traces.push(TraceSummary {
                    trace_id: span.trace_id.clone(),
                    start_time: span.start_time,
                    duration_ms: span.duration_ms.unwrap_or(0),
                    span_count: 1, // Simplified
                    service_count: 1,
                    error_count: if span.status != crate::telemetry::opentelemetry::SpanStatus::Ok { 1 } else { 0 },
                    root_operation: span.operation_name.clone(),
                    status: match span.status {
                        crate::telemetry::opentelemetry::SpanStatus::Ok => TraceStatus::Success,
                        crate::telemetry::opentelemetry::SpanStatus::Error => TraceStatus::Error,
                        crate::telemetry::opentelemetry::SpanStatus::Timeout => TraceStatus::Timeout,
                        _ => TraceStatus::Partial,
                    },
                });
            }
        }
        
        Ok(traces)
    }
}

impl Default for DashboardConfig {
    fn default() -> Self {
        Self {
            title: "SirsiNexus Dashboard".to_string(),
            refresh_interval_seconds: 5,
            max_traces_displayed: 50,
            alert_retention_hours: 24,
            enable_real_time_updates: true,
            theme: DashboardTheme::Auto,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::telemetry::metrics::MetricsCollector;
    use std::time::Duration;
    
    #[tokio::test]
    async fn test_dashboard_api_initialization() {
        let collector = Arc::new(MetricsCollector::new(Duration::from_secs(1)));
        let prometheus = Arc::new(PrometheusExporter::new(collector.clone(), "test".to_string()));
        let tracer = Arc::new(OtelTracer::new("test".to_string(), "1.0.0".to_string()));
        
        let dashboard = DashboardApi::new(collector, prometheus, tracer);
        let result = dashboard.initialize().await;
        assert!(result.is_ok());
    }
    
    #[tokio::test]
    async fn test_get_dashboard_data() {
        let collector = Arc::new(MetricsCollector::new(Duration::from_secs(1)));
        collector.initialize().await.unwrap();
        
        let prometheus = Arc::new(PrometheusExporter::new(collector.clone(), "test".to_string()));
        let tracer = Arc::new(OtelTracer::new("test".to_string(), "1.0.0".to_string()));
        
        let dashboard = DashboardApi::new(collector, prometheus, tracer);
        dashboard.initialize().await.unwrap();
        
        let response = dashboard.get_dashboard_data().await.unwrap();
        assert!(response.success);
        assert!(response.data.is_some());
    }
    
    #[tokio::test]
    async fn test_health_status() {
        let collector = Arc::new(MetricsCollector::new(Duration::from_secs(1)));
        let prometheus = Arc::new(PrometheusExporter::new(collector.clone(), "test".to_string()));
        let tracer = Arc::new(OtelTracer::new("test".to_string(), "1.0.0".to_string()));
        
        let dashboard = DashboardApi::new(collector, prometheus, tracer);
        let health = dashboard.get_health_status().await.unwrap();
        
        assert!(matches!(health.overall, HealthLevel::Healthy));
        assert!(health.components.contains_key("system"));
        assert!(health.components.contains_key("application"));
    }
    
    #[tokio::test]
    async fn test_alert_threshold_update() {
        let collector = Arc::new(MetricsCollector::new(Duration::from_secs(1)));
        let prometheus = Arc::new(PrometheusExporter::new(collector.clone(), "test".to_string()));
        let tracer = Arc::new(OtelTracer::new("test".to_string(), "1.0.0".to_string()));
        
        let mut dashboard = DashboardApi::new(collector, prometheus, tracer);
        
        let mut new_thresholds = AlertThresholds::default();
        new_thresholds.cpu_usage_critical = 95.0;
        
        let response = dashboard.update_alert_thresholds(new_thresholds.clone()).await.unwrap();
        assert!(response.success);
        assert_eq!(dashboard.alert_thresholds.cpu_usage_critical, 95.0);
    }
}
