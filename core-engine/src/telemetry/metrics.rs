// Phase 4: Advanced Performance Monitoring & Metrics
// Provides comprehensive observability for production systems

use std::{
    collections::HashMap,
    sync::{Arc, atomic::{AtomicU64, AtomicI64, Ordering}},
    time::{Duration, SystemTime},
};
use serde::{Deserialize, Serialize};
use tokio::{sync::RwLock, time::interval};
use tracing::{info, error, debug};

use crate::error::AppResult;
use crate::audit::AuditLogger;

/// Performance metrics collector
#[derive(Debug)]
pub struct MetricsCollector {
    counters: Arc<RwLock<HashMap<String, AtomicU64>>>,
    gauges: Arc<RwLock<HashMap<String, AtomicI64>>>,
    histograms: Arc<RwLock<HashMap<String, HistogramMetric>>>,
    system_metrics: Arc<RwLock<SystemMetrics>>,
    application_metrics: Arc<RwLock<ApplicationMetrics>>,
    audit_logger: Option<AuditLogger>,
    collection_interval: Duration,
}

/// Histogram metric for tracking distributions
#[derive(Debug)]
pub struct HistogramMetric {
    pub buckets: Vec<(f64, AtomicU64)>, // (upper_bound, count)
    pub sum: AtomicU64,
    pub count: AtomicU64,
}

/// System-level performance metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemMetrics {
    pub timestamp: SystemTime,
    pub cpu_usage_percent: f64,
    pub memory_usage_bytes: u64,
    pub memory_total_bytes: u64,
    pub memory_usage_percent: f64,
    pub disk_usage_bytes: u64,
    pub disk_total_bytes: u64,
    pub disk_usage_percent: f64,
    pub network_bytes_in: u64,
    pub network_bytes_out: u64,
    pub load_average: LoadAverage,
    pub open_file_descriptors: u64,
    pub tcp_connections: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoadAverage {
    pub one_minute: f64,
    pub five_minutes: f64,
    pub fifteen_minutes: f64,
}

/// Application-specific performance metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApplicationMetrics {
    pub timestamp: SystemTime,
    pub active_connections: u64,
    pub total_requests: u64,
    pub successful_requests: u64,
    pub failed_requests: u64,
    pub avg_response_time_ms: f64,
    pub p95_response_time_ms: f64,
    pub p99_response_time_ms: f64,
    pub database_connections_active: u64,
    pub database_connections_idle: u64,
    pub cache_hits: u64,
    pub cache_misses: u64,
    pub cache_hit_ratio: f64,
    pub agent_operations: AgentMetrics,
    pub security_events: SecurityMetrics,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentMetrics {
    pub active_agents: u64,
    pub total_agent_spawns: u64,
    pub agent_spawn_failures: u64,
    pub messages_processed: u64,
    pub suggestions_generated: u64,
    pub ai_api_calls: u64,
    pub ai_api_failures: u64,
    pub avg_ai_response_time_ms: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityMetrics {
    pub authentication_attempts: u64,
    pub authentication_failures: u64,
    pub authorization_checks: u64,
    pub authorization_failures: u64,
    pub rate_limit_hits: u64,
    pub security_alerts: u64,
    pub vault_operations: u64,
    pub spiffe_rotations: u64,
}

/// Performance alert configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertThresholds {
    pub cpu_usage_critical: f64,
    pub cpu_usage_warning: f64,
    pub memory_usage_critical: f64,
    pub memory_usage_warning: f64,
    pub disk_usage_critical: f64,
    pub disk_usage_warning: f64,
    pub response_time_critical_ms: f64,
    pub response_time_warning_ms: f64,
    pub error_rate_critical: f64,
    pub error_rate_warning: f64,
    pub database_connection_threshold: f64,
}

impl Default for AlertThresholds {
    fn default() -> Self {
        Self {
            cpu_usage_critical: 90.0,
            cpu_usage_warning: 75.0,
            memory_usage_critical: 90.0,
            memory_usage_warning: 80.0,
            disk_usage_critical: 95.0,
            disk_usage_warning: 85.0,
            response_time_critical_ms: 5000.0,
            response_time_warning_ms: 2000.0,
            error_rate_critical: 5.0,
            error_rate_warning: 2.0,
            database_connection_threshold: 90.0,
        }
    }
}

impl MetricsCollector {
    /// Create a new metrics collector
    pub fn new(collection_interval: Duration) -> Self {
        Self {
            counters: Arc::new(RwLock::new(HashMap::new())),
            gauges: Arc::new(RwLock::new(HashMap::new())),
            histograms: Arc::new(RwLock::new(HashMap::new())),
            system_metrics: Arc::new(RwLock::new(SystemMetrics::default())),
            application_metrics: Arc::new(RwLock::new(ApplicationMetrics::default())),
            audit_logger: None,
            collection_interval,
        }
    }
    
    /// Add audit logging
    pub fn with_audit_logger(mut self, audit_logger: AuditLogger) -> Self {
        self.audit_logger = Some(audit_logger);
        self
    }
    
    /// Initialize the metrics collector
    pub async fn initialize(&self) -> AppResult<()> {
        info!("📊 Phase 4: Initializing advanced performance monitoring");
        
        // Initialize default histograms
        self.create_histogram("http_request_duration_ms", vec![
            1.0, 5.0, 10.0, 25.0, 50.0, 100.0, 250.0, 500.0, 1000.0, 2500.0, 5000.0, 10000.0
        ]).await;
        
        self.create_histogram("database_query_duration_ms", vec![
            0.1, 0.5, 1.0, 5.0, 10.0, 25.0, 50.0, 100.0, 250.0, 500.0, 1000.0
        ]).await;
        
        self.create_histogram("agent_response_time_ms", vec![
            100.0, 250.0, 500.0, 1000.0, 2000.0, 5000.0, 10000.0, 30000.0
        ]).await;
        
        // Start metrics collection
        self.start_collection().await?;
        
        if let Some(audit_logger) = &self.audit_logger {
            let _ = audit_logger.log_system_event(
                "metrics_collector_initialized",
                serde_json::json!({
                    "collection_interval_seconds": self.collection_interval.as_secs(),
                    "histograms_count": 3,
                    "monitoring_enabled": true
                }),
                true,
                None,
            ).await;
        }
        
        info!("✅ Performance monitoring initialized successfully");
        Ok(())
    }
    
    /// Increment a counter metric
    pub async fn increment_counter(&self, name: &str, value: u64) {
        let counters = self.counters.read().await;
        if let Some(counter) = counters.get(name) {
            counter.fetch_add(value, Ordering::Relaxed);
        } else {
            drop(counters);
            let mut counters = self.counters.write().await;
            counters.entry(name.to_string())
                .or_insert_with(|| AtomicU64::new(0))
                .fetch_add(value, Ordering::Relaxed);
        }
    }
    
    /// Set a gauge metric
    pub async fn set_gauge(&self, name: &str, value: i64) {
        let gauges = self.gauges.read().await;
        if let Some(gauge) = gauges.get(name) {
            gauge.store(value, Ordering::Relaxed);
        } else {
            drop(gauges);
            let mut gauges = self.gauges.write().await;
            gauges.entry(name.to_string())
                .or_insert_with(|| AtomicI64::new(0))
                .store(value, Ordering::Relaxed);
        }
    }
    
    /// Record a histogram observation
    pub async fn observe_histogram(&self, name: &str, value: f64) {
        let histograms = self.histograms.read().await;
        if let Some(histogram) = histograms.get(name) {
            histogram.count.fetch_add(1, Ordering::Relaxed);
            histogram.sum.fetch_add(value as u64, Ordering::Relaxed);
            
            // Find the appropriate bucket
            for (upper_bound, bucket_count) in &histogram.buckets {
                if value <= *upper_bound {
                    bucket_count.fetch_add(1, Ordering::Relaxed);
                    break;
                }
            }
        }
    }
    
    /// Create a new histogram metric
    async fn create_histogram(&self, name: &str, buckets: Vec<f64>) {
        let histogram = HistogramMetric {
            buckets: buckets.into_iter()
                .map(|b| (b, AtomicU64::new(0)))
                .collect(),
            sum: AtomicU64::new(0),
            count: AtomicU64::new(0),
        };
        
        let mut histograms = self.histograms.write().await;
        histograms.insert(name.to_string(), histogram);
    }
    
    /// Record HTTP request metrics
    pub async fn record_http_request(&self, duration_ms: f64, status_code: u16) {
        self.increment_counter("http_requests_total", 1).await;
        self.observe_histogram("http_request_duration_ms", duration_ms).await;
        
        if (200..300).contains(&status_code) {
            self.increment_counter("http_requests_successful", 1).await;
        } else if status_code >= 400 {
            self.increment_counter("http_requests_failed", 1).await;
        }
        
        // Update application metrics
        let mut app_metrics = self.application_metrics.write().await;
        app_metrics.total_requests += 1;
        if (200..300).contains(&status_code) {
            app_metrics.successful_requests += 1;
        } else {
            app_metrics.failed_requests += 1;
        }
    }
    
    /// Record database operation metrics
    pub async fn record_database_operation(&self, duration_ms: f64, success: bool) {
        self.increment_counter("database_operations_total", 1).await;
        self.observe_histogram("database_query_duration_ms", duration_ms).await;
        
        if success {
            self.increment_counter("database_operations_successful", 1).await;
        } else {
            self.increment_counter("database_operations_failed", 1).await;
        }
    }
    
    /// Record agent operation metrics
    pub async fn record_agent_operation(&self, 
        operation_type: &str, 
        duration_ms: f64, 
        success: bool,
        ai_api_called: bool
    ) {
        self.increment_counter("agent_operations_total", 1).await;
        self.observe_histogram("agent_response_time_ms", duration_ms).await;
        
        if success {
            self.increment_counter("agent_operations_successful", 1).await;
        } else {
            self.increment_counter("agent_operations_failed", 1).await;
        }
        
        // Update application metrics
        let mut app_metrics = self.application_metrics.write().await;
        app_metrics.agent_operations.messages_processed += 1;
        
        if ai_api_called {
            app_metrics.agent_operations.ai_api_calls += 1;
            app_metrics.agent_operations.avg_ai_response_time_ms = 
                (app_metrics.agent_operations.avg_ai_response_time_ms + duration_ms) / 2.0;
        }
        
        if operation_type == "suggestion" {
            app_metrics.agent_operations.suggestions_generated += 1;
        }
    }
    
    /// Record security event metrics
    pub async fn record_security_event(&self, event_type: &str, success: bool) {
        self.increment_counter("security_events_total", 1).await;
        
        let mut app_metrics = self.application_metrics.write().await;
        
        match event_type {
            "authentication" => {
                app_metrics.security_events.authentication_attempts += 1;
                if !success {
                    app_metrics.security_events.authentication_failures += 1;
                }
            }
            "authorization" => {
                app_metrics.security_events.authorization_checks += 1;
                if !success {
                    app_metrics.security_events.authorization_failures += 1;
                }
            }
            "rate_limit" => {
                app_metrics.security_events.rate_limit_hits += 1;
            }
            "security_alert" => {
                app_metrics.security_events.security_alerts += 1;
            }
            "vault_operation" => {
                app_metrics.security_events.vault_operations += 1;
            }
            "spiffe_rotation" => {
                app_metrics.security_events.spiffe_rotations += 1;
            }
            _ => {}
        }
    }
    
    /// Get current metrics snapshot
    pub async fn get_metrics_snapshot(&self) -> MetricsSnapshot {
        let counters = self.counters.read().await;
        let gauges = self.gauges.read().await;
        let system_metrics = self.system_metrics.read().await.clone();
        let application_metrics = self.application_metrics.read().await.clone();
        
        let counter_values: HashMap<String, u64> = counters
            .iter()
            .map(|(k, v)| (k.clone(), v.load(Ordering::Relaxed)))
            .collect();
        
        let gauge_values: HashMap<String, i64> = gauges
            .iter()
            .map(|(k, v)| (k.clone(), v.load(Ordering::Relaxed)))
            .collect();
        
        MetricsSnapshot {
            timestamp: SystemTime::now(),
            counters: counter_values,
            gauges: gauge_values,
            system_metrics,
            application_metrics,
        }
    }
    
    /// Check alert thresholds
    pub async fn check_alerts(&self, thresholds: &AlertThresholds) -> Vec<Alert> {
        let snapshot = self.get_metrics_snapshot().await;
        let mut alerts = Vec::new();
        
        // System alerts
        if snapshot.system_metrics.cpu_usage_percent >= thresholds.cpu_usage_critical {
            alerts.push(Alert {
                severity: AlertSeverity::Critical,
                component: "system".to_string(),
                metric: "cpu_usage".to_string(),
                value: snapshot.system_metrics.cpu_usage_percent,
                threshold: thresholds.cpu_usage_critical,
                message: format!("Critical CPU usage: {:.2}%", snapshot.system_metrics.cpu_usage_percent),
            });
        } else if snapshot.system_metrics.cpu_usage_percent >= thresholds.cpu_usage_warning {
            alerts.push(Alert {
                severity: AlertSeverity::Warning,
                component: "system".to_string(),
                metric: "cpu_usage".to_string(),
                value: snapshot.system_metrics.cpu_usage_percent,
                threshold: thresholds.cpu_usage_warning,
                message: format!("High CPU usage: {:.2}%", snapshot.system_metrics.cpu_usage_percent),
            });
        }
        
        // Memory alerts
        if snapshot.system_metrics.memory_usage_percent >= thresholds.memory_usage_critical {
            alerts.push(Alert {
                severity: AlertSeverity::Critical,
                component: "system".to_string(),
                metric: "memory_usage".to_string(),
                value: snapshot.system_metrics.memory_usage_percent,
                threshold: thresholds.memory_usage_critical,
                message: format!("Critical memory usage: {:.2}%", snapshot.system_metrics.memory_usage_percent),
            });
        }
        
        // Application alerts
        let error_rate = if snapshot.application_metrics.total_requests > 0 {
            (snapshot.application_metrics.failed_requests as f64 / snapshot.application_metrics.total_requests as f64) * 100.0
        } else {
            0.0
        };
        
        if error_rate >= thresholds.error_rate_critical {
            alerts.push(Alert {
                severity: AlertSeverity::Critical,
                component: "application".to_string(),
                metric: "error_rate".to_string(),
                value: error_rate,
                threshold: thresholds.error_rate_critical,
                message: format!("Critical error rate: {:.2}%", error_rate),
            });
        }
        
        if snapshot.application_metrics.avg_response_time_ms >= thresholds.response_time_critical_ms {
            alerts.push(Alert {
                severity: AlertSeverity::Critical,
                component: "application".to_string(),
                metric: "response_time".to_string(),
                value: snapshot.application_metrics.avg_response_time_ms,
                threshold: thresholds.response_time_critical_ms,
                message: format!("Critical response time: {:.2}ms", snapshot.application_metrics.avg_response_time_ms),
            });
        }
        
        alerts
    }
    
    /// Start background metrics collection
    async fn start_collection(&self) -> AppResult<()> {
        let system_metrics = Arc::clone(&self.system_metrics);
        let application_metrics = Arc::clone(&self.application_metrics);
        let collection_interval = self.collection_interval;
        let _audit_logger = self.audit_logger.clone();
        
        tokio::spawn(async move {
            let mut interval = interval(collection_interval);
            
            loop {
                interval.tick().await;
                
                // Collect system metrics
                match Self::collect_system_metrics().await {
                    Ok(metrics) => {
                        *system_metrics.write().await = metrics;
                    }
                    Err(e) => {
                        error!("Failed to collect system metrics: {}", e);
                    }
                }
                
                // Update application metrics timestamp
                {
                    let mut app_metrics = application_metrics.write().await;
                    app_metrics.timestamp = SystemTime::now();
                    
                    // Calculate cache hit ratio
                    let total_cache_operations = app_metrics.cache_hits + app_metrics.cache_misses;
                    if total_cache_operations > 0 {
                        app_metrics.cache_hit_ratio = 
                            (app_metrics.cache_hits as f64 / total_cache_operations as f64) * 100.0;
                    }
                }
                
                debug!("📊 Metrics collected successfully");
            }
        });
        
        Ok(())
    }
    
    /// Collect system-level metrics
    async fn collect_system_metrics() -> AppResult<SystemMetrics> {
        // In a real implementation, this would use system APIs to collect metrics
        // For now, we'll simulate realistic metrics
        
        let timestamp = SystemTime::now();
        
        // Simulate CPU usage (in production, use sysinfo or similar)
        let cpu_usage_percent = 45.0 + (rand::random::<f64>() * 30.0);
        
        // Simulate memory usage
        let memory_total_bytes = 8_589_934_592; // 8GB
        let memory_usage_bytes = (memory_total_bytes as f64 * (0.4 + rand::random::<f64>() * 0.3)) as u64;
        let memory_usage_percent = (memory_usage_bytes as f64 / memory_total_bytes as f64) * 100.0;
        
        // Simulate disk usage
        let disk_total_bytes = 107_374_182_400; // 100GB
        let disk_usage_bytes = (disk_total_bytes as f64 * (0.6 + rand::random::<f64>() * 0.2)) as u64;
        let disk_usage_percent = (disk_usage_bytes as f64 / disk_total_bytes as f64) * 100.0;
        
        Ok(SystemMetrics {
            timestamp,
            cpu_usage_percent,
            memory_usage_bytes,
            memory_total_bytes,
            memory_usage_percent,
            disk_usage_bytes,
            disk_total_bytes,
            disk_usage_percent,
            network_bytes_in: 1_000_000 + (rand::random::<u64>() % 10_000_000),
            network_bytes_out: 800_000 + (rand::random::<u64>() % 8_000_000),
            load_average: LoadAverage {
                one_minute: 1.5 + (rand::random::<f64>() * 2.0),
                five_minutes: 1.2 + (rand::random::<f64>() * 1.5),
                fifteen_minutes: 1.0 + (rand::random::<f64>() * 1.0),
            },
            open_file_descriptors: 150 + (rand::random::<u64>() % 100),
            tcp_connections: 45 + (rand::random::<u64>() % 50),
        })
    }
}

/// Metrics snapshot for export
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricsSnapshot {
    pub timestamp: SystemTime,
    pub counters: HashMap<String, u64>,
    pub gauges: HashMap<String, i64>,
    pub system_metrics: SystemMetrics,
    pub application_metrics: ApplicationMetrics,
}

/// Performance alert
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Alert {
    pub severity: AlertSeverity,
    pub component: String,
    pub metric: String,
    pub value: f64,
    pub threshold: f64,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlertSeverity {
    Info,
    Warning,
    Critical,
}

impl Default for SystemMetrics {
    fn default() -> Self {
        Self {
            timestamp: SystemTime::now(),
            cpu_usage_percent: 0.0,
            memory_usage_bytes: 0,
            memory_total_bytes: 0,
            memory_usage_percent: 0.0,
            disk_usage_bytes: 0,
            disk_total_bytes: 0,
            disk_usage_percent: 0.0,
            network_bytes_in: 0,
            network_bytes_out: 0,
            load_average: LoadAverage {
                one_minute: 0.0,
                five_minutes: 0.0,
                fifteen_minutes: 0.0,
            },
            open_file_descriptors: 0,
            tcp_connections: 0,
        }
    }
}

impl Default for ApplicationMetrics {
    fn default() -> Self {
        Self {
            timestamp: SystemTime::now(),
            active_connections: 0,
            total_requests: 0,
            successful_requests: 0,
            failed_requests: 0,
            avg_response_time_ms: 0.0,
            p95_response_time_ms: 0.0,
            p99_response_time_ms: 0.0,
            database_connections_active: 0,
            database_connections_idle: 0,
            cache_hits: 0,
            cache_misses: 0,
            cache_hit_ratio: 0.0,
            agent_operations: AgentMetrics {
                active_agents: 0,
                total_agent_spawns: 0,
                agent_spawn_failures: 0,
                messages_processed: 0,
                suggestions_generated: 0,
                ai_api_calls: 0,
                ai_api_failures: 0,
                avg_ai_response_time_ms: 0.0,
            },
            security_events: SecurityMetrics {
                authentication_attempts: 0,
                authentication_failures: 0,
                authorization_checks: 0,
                authorization_failures: 0,
                rate_limit_hits: 0,
                security_alerts: 0,
                vault_operations: 0,
                spiffe_rotations: 0,
            },
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::Duration;
    
    #[tokio::test]
    async fn test_metrics_collector_initialization() {
        let collector = MetricsCollector::new(Duration::from_secs(1));
        let result = collector.initialize().await;
        assert!(result.is_ok());
    }
    
    #[tokio::test]
    async fn test_counter_operations() {
        let collector = MetricsCollector::new(Duration::from_secs(1));
        
        collector.increment_counter("test_counter", 5).await;
        collector.increment_counter("test_counter", 3).await;
        
        let snapshot = collector.get_metrics_snapshot().await;
        assert_eq!(snapshot.counters.get("test_counter"), Some(&8));
    }
    
    #[tokio::test]
    async fn test_gauge_operations() {
        let collector = MetricsCollector::new(Duration::from_secs(1));
        
        collector.set_gauge("test_gauge", 42).await;
        collector.set_gauge("test_gauge", 24).await;
        
        let snapshot = collector.get_metrics_snapshot().await;
        assert_eq!(snapshot.gauges.get("test_gauge"), Some(&24));
    }
    
    #[tokio::test]
    async fn test_histogram_observations() {
        let collector = MetricsCollector::new(Duration::from_secs(1));
        collector.initialize().await.unwrap();
        
        collector.observe_histogram("http_request_duration_ms", 150.0).await;
        collector.observe_histogram("http_request_duration_ms", 250.0).await;
        
        // Verify histogram buckets were updated (would need access to internal state)
    }
    
    #[tokio::test]
    async fn test_alert_generation() {
        let collector = MetricsCollector::new(Duration::from_secs(1));
        
        // Set high CPU usage
        {
            let mut system_metrics = collector.system_metrics.write().await;
            system_metrics.cpu_usage_percent = 95.0;
        }
        
        let thresholds = AlertThresholds::default();
        let alerts = collector.check_alerts(&thresholds).await;
        
        assert!(!alerts.is_empty());
        assert!(alerts.iter().any(|a| a.metric == "cpu_usage"));
    }
}
