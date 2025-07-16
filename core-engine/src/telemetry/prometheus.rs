// Prometheus Metrics Exporter
// Provides standardized metrics export for Prometheus monitoring

use std::{
    collections::HashMap,
    fmt::Write,
    sync::Arc,
    time::UNIX_EPOCH,
};
use tracing::{info, warn, debug};

use crate::{
    error::AppResult,
    telemetry::metrics::{MetricsCollector, MetricsSnapshot},
};
use crate::audit::AuditLogger;

/// Prometheus metrics exporter
#[derive(Debug)]
pub struct PrometheusExporter {
    metrics_collector: Arc<MetricsCollector>,
    custom_labels: HashMap<String, String>,
    namespace: String,
    audit_logger: Option<AuditLogger>,
}

/// Prometheus metric type
#[derive(Debug, Clone)]
pub enum PrometheusMetricType {
    Counter,
    Gauge,
    Histogram,
    Summary,
}

/// Prometheus metric definition
#[derive(Debug, Clone)]
pub struct PrometheusMetric {
    pub name: String,
    pub metric_type: PrometheusMetricType,
    pub help: String,
    pub labels: HashMap<String, String>,
    pub value: f64,
    pub timestamp: Option<i64>,
}

/// Prometheus histogram bucket
#[derive(Debug, Clone)]
pub struct PrometheusBucket {
    pub upper_bound: f64,
    pub count: u64,
}

impl PrometheusExporter {
    /// Create a new Prometheus exporter
    pub fn new(
        metrics_collector: Arc<MetricsCollector>,
        namespace: String,
    ) -> Self {
        Self {
            metrics_collector,
            custom_labels: HashMap::new(),
            namespace,
            audit_logger: None,
        }
    }
    
    /// Add custom labels to all exported metrics
    pub fn with_labels(mut self, labels: HashMap<String, String>) -> Self {
        self.custom_labels = labels;
        self
    }
    
    /// Add audit logging
    pub fn with_audit_logger(mut self, audit_logger: AuditLogger) -> Self {
        self.audit_logger = Some(audit_logger);
        self
    }
    
    /// Initialize the Prometheus exporter
    pub async fn initialize(&self) -> AppResult<()> {
        info!("🔧 Initializing Prometheus metrics exporter");
        
        if let Some(audit_logger) = &self.audit_logger {
            let _ = audit_logger.log_system_event(
                "prometheus_exporter_initialized",
                serde_json::json!({
                    "namespace": self.namespace,
                    "custom_labels_count": self.custom_labels.len(),
                    "exporter_enabled": true
                }),
                true,
                None,
            ).await;
        }
        
        info!("✅ Prometheus exporter initialized successfully");
        Ok(())
    }
    
    /// Export metrics in Prometheus format
    pub async fn export_metrics(&self) -> AppResult<String> {
        let snapshot = self.metrics_collector.get_metrics_snapshot().await;
        let mut output = String::new();
        
        // Add metadata
        writeln!(output, "# TYPE sirsi_nexus_info gauge")?;
        writeln!(output, "# HELP sirsi_nexus_info Information about the SirsiNexus instance")?;
        writeln!(
            output, 
            "sirsi_nexus_info{{namespace=\"{}\",version=\"1.0.0\"}} 1",
            self.namespace
        )?;
        writeln!(output)?;
        
        // Export counter metrics
        self.export_counters(&mut output, &snapshot).await?;
        
        // Export gauge metrics
        self.export_gauges(&mut output, &snapshot).await?;
        
        // Export system metrics
        self.export_system_metrics(&mut output, &snapshot).await?;
        
        // Export application metrics
        self.export_application_metrics(&mut output, &snapshot).await?;
        
        debug!("📊 Exported {} lines of Prometheus metrics", output.lines().count());
        
        if let Some(audit_logger) = &self.audit_logger {
            let _ = audit_logger.log_system_event(
                "prometheus_metrics_exported",
                serde_json::json!({
                    "metrics_count": output.lines().count(),
                    "export_timestamp": snapshot.timestamp.duration_since(UNIX_EPOCH)?.as_secs(),
                    "namespace": self.namespace
                }),
                false,
                None,
            ).await;
        }
        
        Ok(output)
    }
    
    /// Export counter metrics
    async fn export_counters(
        &self,
        output: &mut String,
        snapshot: &MetricsSnapshot,
    ) -> AppResult<()> {
        for (name, value) in &snapshot.counters {
            let metric_name = self.format_metric_name(name);
            
            writeln!(output, "# TYPE {} counter", metric_name)?;
            writeln!(output, "# HELP {} Total number of {}", metric_name, name.replace('_', " "))?;
            
            let labels = self.format_labels(&HashMap::new());
            writeln!(output, "{}{} {}", metric_name, labels, value)?;
            writeln!(output)?;
        }
        Ok(())
    }
    
    /// Export gauge metrics
    async fn export_gauges(
        &self,
        output: &mut String,
        snapshot: &MetricsSnapshot,
    ) -> AppResult<()> {
        for (name, value) in &snapshot.gauges {
            let metric_name = self.format_metric_name(name);
            
            writeln!(output, "# TYPE {} gauge", metric_name)?;
            writeln!(output, "# HELP {} Current value of {}", metric_name, name.replace('_', " "))?;
            
            let labels = self.format_labels(&HashMap::new());
            writeln!(output, "{}{} {}", metric_name, labels, value)?;
            writeln!(output)?;
        }
        Ok(())
    }
    
    /// Export system metrics
    async fn export_system_metrics(
        &self,
        output: &mut String,
        snapshot: &MetricsSnapshot,
    ) -> AppResult<()> {
        let sys = &snapshot.system_metrics;
        
        // CPU metrics
        writeln!(output, "# TYPE {}_cpu_usage_percent gauge", self.namespace)?;
        writeln!(output, "# HELP {}_cpu_usage_percent Current CPU usage percentage", self.namespace)?;
        writeln!(output, "{}_cpu_usage_percent{} {}", 
                self.namespace, self.format_labels(&HashMap::new()), sys.cpu_usage_percent)?;
        writeln!(output)?;
        
        // Memory metrics
        writeln!(output, "# TYPE {}_memory_usage_bytes gauge", self.namespace)?;
        writeln!(output, "# HELP {}_memory_usage_bytes Current memory usage in bytes", self.namespace)?;
        writeln!(output, "{}_memory_usage_bytes{} {}", 
                self.namespace, self.format_labels(&HashMap::new()), sys.memory_usage_bytes)?;
        
        writeln!(output, "# TYPE {}_memory_total_bytes gauge", self.namespace)?;
        writeln!(output, "# HELP {}_memory_total_bytes Total memory available in bytes", self.namespace)?;
        writeln!(output, "{}_memory_total_bytes{} {}", 
                self.namespace, self.format_labels(&HashMap::new()), sys.memory_total_bytes)?;
        
        writeln!(output, "# TYPE {}_memory_usage_percent gauge", self.namespace)?;
        writeln!(output, "# HELP {}_memory_usage_percent Current memory usage percentage", self.namespace)?;
        writeln!(output, "{}_memory_usage_percent{} {}", 
                self.namespace, self.format_labels(&HashMap::new()), sys.memory_usage_percent)?;
        writeln!(output)?;
        
        // Disk metrics
        writeln!(output, "# TYPE {}_disk_usage_bytes gauge", self.namespace)?;
        writeln!(output, "# HELP {}_disk_usage_bytes Current disk usage in bytes", self.namespace)?;
        writeln!(output, "{}_disk_usage_bytes{} {}", 
                self.namespace, self.format_labels(&HashMap::new()), sys.disk_usage_bytes)?;
        
        writeln!(output, "# TYPE {}_disk_usage_percent gauge", self.namespace)?;
        writeln!(output, "# HELP {}_disk_usage_percent Current disk usage percentage", self.namespace)?;
        writeln!(output, "{}_disk_usage_percent{} {}", 
                self.namespace, self.format_labels(&HashMap::new()), sys.disk_usage_percent)?;
        writeln!(output)?;
        
        // Network metrics
        writeln!(output, "# TYPE {}_network_bytes_total counter", self.namespace)?;
        writeln!(output, "# HELP {}_network_bytes_total Total network bytes transferred", self.namespace)?;
        
        let mut in_labels = HashMap::new();
        in_labels.insert("direction".to_string(), "in".to_string());
        writeln!(output, "{}_network_bytes_total{} {}", 
                self.namespace, self.format_labels(&in_labels), sys.network_bytes_in)?;
        
        let mut out_labels = HashMap::new();
        out_labels.insert("direction".to_string(), "out".to_string());
        writeln!(output, "{}_network_bytes_total{} {}", 
                self.namespace, self.format_labels(&out_labels), sys.network_bytes_out)?;
        writeln!(output)?;
        
        // Load average
        writeln!(output, "# TYPE {}_load_average gauge", self.namespace)?;
        writeln!(output, "# HELP {}_load_average System load average", self.namespace)?;
        
        let mut load_1m_labels = HashMap::new();
        load_1m_labels.insert("period".to_string(), "1m".to_string());
        writeln!(output, "{}_load_average{} {}", 
                self.namespace, self.format_labels(&load_1m_labels), sys.load_average.one_minute)?;
        
        let mut load_5m_labels = HashMap::new();
        load_5m_labels.insert("period".to_string(), "5m".to_string());
        writeln!(output, "{}_load_average{} {}", 
                self.namespace, self.format_labels(&load_5m_labels), sys.load_average.five_minutes)?;
        
        let mut load_15m_labels = HashMap::new();
        load_15m_labels.insert("period".to_string(), "15m".to_string());
        writeln!(output, "{}_load_average{} {}", 
                self.namespace, self.format_labels(&load_15m_labels), sys.load_average.fifteen_minutes)?;
        writeln!(output)?;
        
        Ok(())
    }
    
    /// Export application metrics
    async fn export_application_metrics(
        &self,
        output: &mut String,
        snapshot: &MetricsSnapshot,
    ) -> AppResult<()> {
        let app = &snapshot.application_metrics;
        
        // HTTP metrics
        writeln!(output, "# TYPE {}_http_requests_total counter", self.namespace)?;
        writeln!(output, "# HELP {}_http_requests_total Total number of HTTP requests", self.namespace)?;
        writeln!(output, "{}_http_requests_total{} {}", 
                self.namespace, self.format_labels(&HashMap::new()), app.total_requests)?;
        
        writeln!(output, "# TYPE {}_http_requests_successful_total counter", self.namespace)?;
        writeln!(output, "# HELP {}_http_requests_successful_total Total number of successful HTTP requests", self.namespace)?;
        writeln!(output, "{}_http_requests_successful_total{} {}", 
                self.namespace, self.format_labels(&HashMap::new()), app.successful_requests)?;
        
        writeln!(output, "# TYPE {}_http_requests_failed_total counter", self.namespace)?;
        writeln!(output, "# HELP {}_http_requests_failed_total Total number of failed HTTP requests", self.namespace)?;
        writeln!(output, "{}_http_requests_failed_total{} {}", 
                self.namespace, self.format_labels(&HashMap::new()), app.failed_requests)?;
        
        // Response time metrics
        writeln!(output, "# TYPE {}_http_response_time_ms gauge", self.namespace)?;
        writeln!(output, "# HELP {}_http_response_time_ms HTTP response time in milliseconds", self.namespace)?;
        
        let mut avg_labels = HashMap::new();
        avg_labels.insert("percentile".to_string(), "avg".to_string());
        writeln!(output, "{}_http_response_time_ms{} {}", 
                self.namespace, self.format_labels(&avg_labels), app.avg_response_time_ms)?;
        
        let mut p95_labels = HashMap::new();
        p95_labels.insert("percentile".to_string(), "95".to_string());
        writeln!(output, "{}_http_response_time_ms{} {}", 
                self.namespace, self.format_labels(&p95_labels), app.p95_response_time_ms)?;
        
        let mut p99_labels = HashMap::new();
        p99_labels.insert("percentile".to_string(), "99".to_string());
        writeln!(output, "{}_http_response_time_ms{} {}", 
                self.namespace, self.format_labels(&p99_labels), app.p99_response_time_ms)?;
        writeln!(output)?;
        
        // Database metrics
        writeln!(output, "# TYPE {}_database_connections gauge", self.namespace)?;
        writeln!(output, "# HELP {}_database_connections Number of database connections", self.namespace)?;
        
        let mut active_labels = HashMap::new();
        active_labels.insert("state".to_string(), "active".to_string());
        writeln!(output, "{}_database_connections{} {}", 
                self.namespace, self.format_labels(&active_labels), app.database_connections_active)?;
        
        let mut idle_labels = HashMap::new();
        idle_labels.insert("state".to_string(), "idle".to_string());
        writeln!(output, "{}_database_connections{} {}", 
                self.namespace, self.format_labels(&idle_labels), app.database_connections_idle)?;
        writeln!(output)?;
        
        // Cache metrics
        writeln!(output, "# TYPE {}_cache_operations_total counter", self.namespace)?;
        writeln!(output, "# HELP {}_cache_operations_total Total number of cache operations", self.namespace)?;
        
        let mut hits_labels = HashMap::new();
        hits_labels.insert("result".to_string(), "hit".to_string());
        writeln!(output, "{}_cache_operations_total{} {}", 
                self.namespace, self.format_labels(&hits_labels), app.cache_hits)?;
        
        let mut misses_labels = HashMap::new();
        misses_labels.insert("result".to_string(), "miss".to_string());
        writeln!(output, "{}_cache_operations_total{} {}", 
                self.namespace, self.format_labels(&misses_labels), app.cache_misses)?;
        
        writeln!(output, "# TYPE {}_cache_hit_ratio_percent gauge", self.namespace)?;
        writeln!(output, "# HELP {}_cache_hit_ratio_percent Cache hit ratio percentage", self.namespace)?;
        writeln!(output, "{}_cache_hit_ratio_percent{} {}", 
                self.namespace, self.format_labels(&HashMap::new()), app.cache_hit_ratio)?;
        writeln!(output)?;
        
        // Agent metrics
        writeln!(output, "# TYPE {}_agent_operations_total counter", self.namespace)?;
        writeln!(output, "# HELP {}_agent_operations_total Total number of agent operations", self.namespace)?;
        writeln!(output, "{}_agent_operations_total{} {}", 
                self.namespace, self.format_labels(&HashMap::new()), app.agent_operations.messages_processed)?;
        
        writeln!(output, "# TYPE {}_agent_active gauge", self.namespace)?;
        writeln!(output, "# HELP {}_agent_active Number of active agents", self.namespace)?;
        writeln!(output, "{}_agent_active{} {}", 
                self.namespace, self.format_labels(&HashMap::new()), app.agent_operations.active_agents)?;
        
        writeln!(output, "# TYPE {}_ai_api_calls_total counter", self.namespace)?;
        writeln!(output, "# HELP {}_ai_api_calls_total Total number of AI API calls", self.namespace)?;
        writeln!(output, "{}_ai_api_calls_total{} {}", 
                self.namespace, self.format_labels(&HashMap::new()), app.agent_operations.ai_api_calls)?;
        
        writeln!(output, "# TYPE {}_ai_response_time_ms gauge", self.namespace)?;
        writeln!(output, "# HELP {}_ai_response_time_ms Average AI API response time in milliseconds", self.namespace)?;
        writeln!(output, "{}_ai_response_time_ms{} {}", 
                self.namespace, self.format_labels(&HashMap::new()), app.agent_operations.avg_ai_response_time_ms)?;
        writeln!(output)?;
        
        // Security metrics
        writeln!(output, "# TYPE {}_security_events_total counter", self.namespace)?;
        writeln!(output, "# HELP {}_security_events_total Total number of security events", self.namespace)?;
        
        let mut auth_labels = HashMap::new();
        auth_labels.insert("event_type".to_string(), "authentication".to_string());
        writeln!(output, "{}_security_events_total{} {}", 
                self.namespace, self.format_labels(&auth_labels), app.security_events.authentication_attempts)?;
        
        let mut auth_fail_labels = HashMap::new();
        auth_fail_labels.insert("event_type".to_string(), "authentication_failure".to_string());
        writeln!(output, "{}_security_events_total{} {}", 
                self.namespace, self.format_labels(&auth_fail_labels), app.security_events.authentication_failures)?;
        
        let mut authz_labels = HashMap::new();
        authz_labels.insert("event_type".to_string(), "authorization".to_string());
        writeln!(output, "{}_security_events_total{} {}", 
                self.namespace, self.format_labels(&authz_labels), app.security_events.authorization_checks)?;
        
        let mut rate_limit_labels = HashMap::new();
        rate_limit_labels.insert("event_type".to_string(), "rate_limit".to_string());
        writeln!(output, "{}_security_events_total{} {}", 
                self.namespace, self.format_labels(&rate_limit_labels), app.security_events.rate_limit_hits)?;
        
        writeln!(output)?;
        
        Ok(())
    }
    
    /// Format metric name with namespace
    fn format_metric_name(&self, name: &str) -> String {
        format!("{}_{}", self.namespace, name)
    }
    
    /// Format labels for Prometheus output
    fn format_labels(&self, additional_labels: &HashMap<String, String>) -> String {
        let mut all_labels = self.custom_labels.clone();
        all_labels.extend(additional_labels.clone());
        
        if all_labels.is_empty() {
            return String::new();
        }
        
        let labels: Vec<String> = all_labels
            .iter()
            .map(|(k, v)| format!("{}=\"{}\"", k, v))
            .collect();
        
        format!("{{{}}}", labels.join(","))
    }
    
    /// Export metrics to a file
    pub async fn export_to_file(&self, file_path: &str) -> AppResult<()> {
        let metrics = self.export_metrics().await?;
        tokio::fs::write(file_path, metrics).await?;
        
        info!("📁 Exported Prometheus metrics to {}", file_path);
        Ok(())
    }
    
    /// Get metrics in JSON format for debugging
    pub async fn export_json(&self) -> AppResult<String> {
        let snapshot = self.metrics_collector.get_metrics_snapshot().await;
        Ok(serde_json::to_string_pretty(&snapshot)?)
    }
    
    /// Validate Prometheus metrics format
    pub async fn validate_metrics(&self) -> AppResult<bool> {
        let metrics = self.export_metrics().await?;
        
        // Basic validation - check for required format elements
        let lines: Vec<&str> = metrics.lines().collect();
        let mut has_help = false;
        let mut has_type = false;
        let mut has_metrics = false;
        
        for line in lines {
            if line.starts_with("# HELP") {
                has_help = true;
            } else if line.starts_with("# TYPE") {
                has_type = true;
            } else if !line.starts_with('#') && !line.trim().is_empty() {
                has_metrics = true;
            }
        }
        
        let is_valid = has_help && has_type && has_metrics;
        
        if !is_valid {
            warn!("⚠️ Prometheus metrics validation failed");
        } else {
            debug!("✅ Prometheus metrics validation passed");
        }
        
        Ok(is_valid)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::telemetry::metrics::MetricsCollector;
    use std::time::Duration;
    
    #[tokio::test]
    async fn test_prometheus_exporter_initialization() {
        let collector = Arc::new(MetricsCollector::new(Duration::from_secs(1)));
        let exporter = PrometheusExporter::new(collector, "test".to_string());
        
        let result = exporter.initialize().await;
        assert!(result.is_ok());
    }
    
    #[tokio::test]
    async fn test_metrics_export() {
        let collector = Arc::new(MetricsCollector::new(Duration::from_secs(1)));
        collector.initialize().await.unwrap();
        
        // Add some test metrics
        collector.increment_counter("test_requests", 100).await;
        collector.set_gauge("test_connections", 42).await;
        
        let exporter = PrometheusExporter::new(collector, "test".to_string());
        let metrics = exporter.export_metrics().await.unwrap();
        
        assert!(metrics.contains("test_test_requests"));
        assert!(metrics.contains("test_test_connections"));
        assert!(metrics.contains("# TYPE"));
        assert!(metrics.contains("# HELP"));
    }
    
    #[tokio::test]
    async fn test_metrics_validation() {
        let collector = Arc::new(MetricsCollector::new(Duration::from_secs(1)));
        collector.initialize().await.unwrap();
        
        let exporter = PrometheusExporter::new(collector, "test".to_string());
        let is_valid = exporter.validate_metrics().await.unwrap();
        
        assert!(is_valid);
    }
    
    #[tokio::test]
    async fn test_custom_labels() {
        let collector = Arc::new(MetricsCollector::new(Duration::from_secs(1)));
        
        let mut labels = HashMap::new();
        labels.insert("environment".to_string(), "test".to_string());
        labels.insert("service".to_string(), "core-engine".to_string());
        
        let exporter = PrometheusExporter::new(collector, "test".to_string())
            .with_labels(labels);
        
        let formatted_labels = exporter.format_labels(&HashMap::new());
        assert!(formatted_labels.contains("environment=\"test\""));
        assert!(formatted_labels.contains("service=\"core-engine\""));
    }
    
    #[tokio::test]
    async fn test_json_export() {
        let collector = Arc::new(MetricsCollector::new(Duration::from_secs(1)));
        collector.initialize().await.unwrap();
        
        let exporter = PrometheusExporter::new(collector, "test".to_string());
        let json = exporter.export_json().await.unwrap();
        
        assert!(json.contains("timestamp"));
        assert!(json.contains("counters"));
        assert!(json.contains("gauges"));
    }
}
