use std::collections::HashMap;
use std::sync::Arc;
use tokio::time::Duration;
use crate::error::{AppError, AppResult};
use tracing::{info, warn};
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthStatus {
    pub is_healthy: bool,
    pub details: HashMap<String, String>,
}

pub struct HealthCheck {
    pub name: String,
    pub check: Arc<dyn Fn() -> AppResult<bool> + Send + 'static>,
    pub interval: Duration,
}

pub struct HealthMonitor {
    checks: Vec<HealthCheck>,
    status: HashMap<String, HealthStatus>,
}

impl HealthMonitor {
    pub fn new() -> Self {
        Self {
            checks: Vec::new(),
            status: HashMap::new(),
        }
    }

    pub fn add_check<F>(&mut self, name: &str, interval: Duration, check: F)
    where
        F: Fn() -> AppResult<bool> + Send + 'static,
    {
        let check = HealthCheck {
            name: name.to_string(),
            check: Arc::new(check),
            interval,
        };
        self.checks.push(check);
    }

    pub async fn run(&mut self) {
        for hc in &self.checks {
            let check_name = hc.name.clone();
            let check_fn = hc.check.clone();

            match check_fn() {
                Ok(healthy) => {
                    self.status.insert(
                        check_name.clone(),
                        HealthStatus {
                            is_healthy: healthy,
                            details: HashMap::new(),
                        },
                    );

                    info!("✅ Health check '{}' is healthy", check_name);
                }
                Err(e) => {
                    warn!("❌ Health check '{}' failed: {}", check_name, e);
                    self.status.insert(
                        check_name.clone(),
                        HealthStatus {
                            is_healthy: false,
                            details: HashMap::from([("error".into(), e.to_string())]),
                        },
                    );
                }
            }
        }
    }

    pub fn report(&self) -> HashMap<String, HealthStatus> {
        self.status.clone()
    }
}

#[derive(Debug)]
pub struct SystemMetrics {
    pub cpu_usage_percent: f64,
    pub memory_usage_percent: f64,
}

impl SystemMetrics {
    pub fn gather_metrics() -> AppResult<Self> {
        // Mock implementation for gathering system metrics
        Ok(Self {
            cpu_usage_percent: 38.5,
            memory_usage_percent: 62.2,
        })
    }
}

pub async fn run_health_checks() -> AppResult<String> {
    let mut health_monitor = HealthMonitor::new();

    health_monitor.add_check("database", Duration::from_secs(30), || {
        // Simplified example health check
        Ok(true)
    });

    health_monitor.run().await;

    let status_report = health_monitor.report();

    serde_json::to_string(&status_report).map_err(|e| AppError::Internal(format!("Serialization error: {}", e)))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Arc;
    use std::sync::atomic::{AtomicBool, Ordering};
    use tokio::time::Duration;

    #[test]
    fn test_health_monitor_creation() {
        let monitor = HealthMonitor::new();
        assert_eq!(monitor.checks.len(), 0);
        assert_eq!(monitor.status.len(), 0);
    }

    #[test]
    fn test_health_monitor_add_check() {
        let mut monitor = HealthMonitor::new();
        monitor.add_check("test_check", Duration::from_secs(30), || Ok(true));
        assert_eq!(monitor.checks.len(), 1);
        assert_eq!(monitor.checks[0].name, "test_check");
    }

    #[tokio::test]
    async fn test_health_monitor_run_successful_check() {
        let mut monitor = HealthMonitor::new();
        monitor.add_check("healthy_check", Duration::from_secs(30), || Ok(true));
        
        monitor.run().await;
        
        let status = monitor.report();
        assert_eq!(status.len(), 1);
        assert!(status.contains_key("healthy_check"));
        assert!(status["healthy_check"].is_healthy);
    }

    #[tokio::test]
    async fn test_health_monitor_run_failed_check() {
        let mut monitor = HealthMonitor::new();
        monitor.add_check("failing_check", Duration::from_secs(30), || {
            Err(AppError::Internal("Test failure".to_string()))
        });
        
        monitor.run().await;
        
        let status = monitor.report();
        assert_eq!(status.len(), 1);
        assert!(status.contains_key("failing_check"));
        assert!(!status["failing_check"].is_healthy);
        assert!(status["failing_check"].details.contains_key("error"));
    }

    #[tokio::test]
    async fn test_health_monitor_multiple_checks() {
        let mut monitor = HealthMonitor::new();
        monitor.add_check("check1", Duration::from_secs(30), || Ok(true));
        monitor.add_check("check2", Duration::from_secs(60), || Ok(false));
        monitor.add_check("check3", Duration::from_secs(15), || {
            Err(AppError::Internal("Check 3 failed".to_string()))
        });
        
        monitor.run().await;
        
        let status = monitor.report();
        assert_eq!(status.len(), 3);
        
        // Check 1 should be healthy
        assert!(status["check1"].is_healthy);
        
        // Check 2 should be unhealthy but not due to error
        assert!(!status["check2"].is_healthy);
        
        // Check 3 should be unhealthy due to error
        assert!(!status["check3"].is_healthy);
        assert!(status["check3"].details.contains_key("error"));
    }

    #[test]
    fn test_health_status_serialization() {
        let mut details = HashMap::new();
        details.insert("key1".to_string(), "value1".to_string());
        
        let status = HealthStatus {
            is_healthy: true,
            details,
        };
        
        let serialized = serde_json::to_string(&status).unwrap();
        assert!(serialized.contains("is_healthy"));
        assert!(serialized.contains("details"));
    }

    #[test]
    fn test_system_metrics_gathering() {
        let metrics = SystemMetrics::gather_metrics().unwrap();
        assert!(metrics.cpu_usage_percent >= 0.0);
        assert!(metrics.memory_usage_percent >= 0.0);
    }

    #[tokio::test]
    async fn test_run_health_checks_function() {
        let result = run_health_checks().await;
        assert!(result.is_ok());
        
        let json_string = result.unwrap();
        assert!(!json_string.is_empty());
        
        // Parse JSON to ensure it's valid
        let parsed: serde_json::Value = serde_json::from_str(&json_string).unwrap();
        assert!(parsed.is_object());
    }

    #[tokio::test]
    async fn test_health_monitor_state_persistence() {
        let mut monitor = HealthMonitor::new();
        
        // Add a check that uses shared state
        let counter = Arc::new(AtomicBool::new(false));
        let counter_clone = counter.clone();
        
        monitor.add_check("stateful_check", Duration::from_secs(30), move || {
            let current = counter_clone.load(Ordering::Relaxed);
            counter_clone.store(!current, Ordering::Relaxed);
            Ok(true)
        });
        
        monitor.run().await;
        
        let status = monitor.report();
        assert!(status["stateful_check"].is_healthy);
        assert!(counter.load(Ordering::Relaxed)); // Should be flipped to true
    }

    #[tokio::test]
    async fn test_health_monitor_error_handling() {
        let mut monitor = HealthMonitor::new();
        
        // Add a check that panics (wrapped in Result)
        monitor.add_check("panic_check", Duration::from_secs(30), || {
            // This should be caught and handled gracefully
            Err(AppError::Internal("Simulated panic".to_string()))
        });
        
        monitor.run().await;
        
        let status = monitor.report();
        assert!(!status["panic_check"].is_healthy);
        assert!(status["panic_check"].details.get("error").unwrap().contains("Simulated panic"));
    }

    #[test]
    fn test_health_status_creation() {
        let status = HealthStatus {
            is_healthy: false,
            details: HashMap::from([("reason".to_string(), "Test reason".to_string())]),
        };
        
        assert!(!status.is_healthy);
        assert_eq!(status.details.get("reason").unwrap(), "Test reason");
    }

    #[test]
    fn test_health_check_interval_setting() {
        let mut monitor = HealthMonitor::new();
        let interval = Duration::from_secs(45);
        
        monitor.add_check("interval_check", interval, || Ok(true));
        
        assert_eq!(monitor.checks[0].interval, interval);
    }
}
