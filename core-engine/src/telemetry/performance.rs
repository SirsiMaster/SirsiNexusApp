use std::collections::HashMap;
use std::time::{Duration, Instant};
use std::sync::Arc;
use tokio::sync::RwLock;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::error::AppResult;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceMetric {
    pub id: Uuid,
    pub metric_name: String,
    pub value: f64,
    pub unit: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub tags: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceReport {
    pub report_id: Uuid,
    pub timeframe_start: chrono::DateTime<chrono::Utc>,
    pub timeframe_end: chrono::DateTime<chrono::Utc>,
    pub metrics: Vec<PerformanceMetric>,
    pub summary: PerformanceSummary,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceSummary {
    pub avg_response_time_ms: f64,
    pub p95_response_time_ms: f64,
    pub p99_response_time_ms: f64,
    pub total_requests: u64,
    pub error_rate: f64,
    pub throughput_rps: f64,
}

#[derive(Debug, Clone)]
pub struct RequestTimer {
    start_time: Instant,
    operation_name: String,
    tags: HashMap<String, String>,
}

impl RequestTimer {
    pub fn new(operation_name: String) -> Self {
        Self {
            start_time: Instant::now(),
            operation_name,
            tags: HashMap::new(),
        }
    }

    pub fn with_tag(mut self, key: String, value: String) -> Self {
        self.tags.insert(key, value);
        self
    }

    pub fn finish(self, performance_monitor: &PerformanceMonitor) {
        let duration = self.start_time.elapsed();
        performance_monitor.record_timing(
            self.operation_name,
            duration,
            self.tags,
        );
    }
}

#[derive(Debug)]
pub struct PerformanceMonitor {
    metrics: Arc<RwLock<Vec<PerformanceMetric>>>,
    enabled: bool,
}

impl Default for PerformanceMonitor {
    fn default() -> Self {
        Self::new()
    }
}

impl PerformanceMonitor {
    pub fn new() -> Self {
        Self {
            metrics: Arc::new(RwLock::new(Vec::new())),
            enabled: true,
        }
    }

    pub fn disable(&mut self) {
        self.enabled = false;
    }

    pub fn enable(&mut self) {
        self.enabled = true;
    }

    pub fn start_timer(&self, operation_name: &str) -> RequestTimer {
        RequestTimer::new(operation_name.to_string())
    }

    pub fn record_timing(&self, operation_name: String, duration: Duration, tags: HashMap<String, String>) {
        if !self.enabled {
            return;
        }

        let metric = PerformanceMetric {
            id: Uuid::new_v4(),
            metric_name: format!("{}.duration", operation_name),
            value: duration.as_millis() as f64,
            unit: "milliseconds".to_string(),
            timestamp: chrono::Utc::now(),
            tags,
        };

        tokio::spawn({
            let metrics = self.metrics.clone();
            async move {
                let mut metrics_guard = metrics.write().await;
                metrics_guard.push(metric);
                
                // Keep only last 10,000 metrics to prevent memory leak
                if metrics_guard.len() > 10000 {
                    metrics_guard.drain(0..5000);
                }
            }
        });
    }

    pub fn record_counter(&self, metric_name: String, value: f64, tags: HashMap<String, String>) {
        if !self.enabled {
            return;
        }

        let metric = PerformanceMetric {
            id: Uuid::new_v4(),
            metric_name,
            value,
            unit: "count".to_string(),
            timestamp: chrono::Utc::now(),
            tags,
        };

        tokio::spawn({
            let metrics = self.metrics.clone();
            async move {
                let mut metrics_guard = metrics.write().await;
                metrics_guard.push(metric);
                
                if metrics_guard.len() > 10000 {
                    metrics_guard.drain(0..5000);
                }
            }
        });
    }

    pub fn record_gauge(&self, metric_name: String, value: f64, tags: HashMap<String, String>) {
        if !self.enabled {
            return;
        }

        let metric = PerformanceMetric {
            id: Uuid::new_v4(),
            metric_name,
            value,
            unit: "gauge".to_string(),
            timestamp: chrono::Utc::now(),
            tags,
        };

        tokio::spawn({
            let metrics = self.metrics.clone();
            async move {
                let mut metrics_guard = metrics.write().await;
                metrics_guard.push(metric);
                
                if metrics_guard.len() > 10000 {
                    metrics_guard.drain(0..5000);
                }
            }
        });
    }

    pub async fn get_performance_report(&self, 
        start_time: chrono::DateTime<chrono::Utc>,
        end_time: chrono::DateTime<chrono::Utc>
    ) -> AppResult<PerformanceReport> {
        let metrics_guard = self.metrics.read().await;
        
        let filtered_metrics: Vec<PerformanceMetric> = metrics_guard
            .iter()
            .filter(|metric| metric.timestamp >= start_time && metric.timestamp <= end_time)
            .cloned()
            .collect();

        let summary = self.calculate_summary(&filtered_metrics);

        Ok(PerformanceReport {
            report_id: Uuid::new_v4(),
            timeframe_start: start_time,
            timeframe_end: end_time,
            metrics: filtered_metrics,
            summary,
        })
    }

    fn calculate_summary(&self, metrics: &[PerformanceMetric]) -> PerformanceSummary {
        let request_timings: Vec<f64> = metrics
            .iter()
            .filter(|m| m.metric_name.ends_with(".duration"))
            .map(|m| m.value)
            .collect();

        let total_requests = request_timings.len() as u64;
        
        let avg_response_time_ms = if !request_timings.is_empty() {
            request_timings.iter().sum::<f64>() / request_timings.len() as f64
        } else {
            0.0
        };

        let (p95_response_time_ms, p99_response_time_ms) = if !request_timings.is_empty() {
            let mut sorted_timings = request_timings.clone();
            sorted_timings.sort_by(|a, b| a.partial_cmp(b).unwrap());
            
            let p95_idx = (sorted_timings.len() as f64 * 0.95) as usize;
            let p99_idx = (sorted_timings.len() as f64 * 0.99) as usize;
            
            let p95 = sorted_timings.get(p95_idx).copied().unwrap_or(0.0);
            let p99 = sorted_timings.get(p99_idx).copied().unwrap_or(0.0);
            
            (p95, p99)
        } else {
            (0.0, 0.0)
        };

        let error_count = metrics
            .iter()
            .filter(|m| m.metric_name.contains("error"))
            .count() as f64;

        let error_rate = if total_requests > 0 {
            error_count / total_requests as f64
        } else {
            0.0
        };

        // Calculate throughput (requests per second)
        let timeframe_duration = if !metrics.is_empty() {
            let timestamps: Vec<chrono::DateTime<chrono::Utc>> = metrics.iter().map(|m| m.timestamp).collect();
            let min_time = timestamps.iter().min().unwrap();
            let max_time = timestamps.iter().max().unwrap();
            (*max_time - *min_time).num_seconds() as f64
        } else {
            1.0
        };

        let throughput_rps = if timeframe_duration > 0.0 {
            total_requests as f64 / timeframe_duration
        } else {
            0.0
        };

        PerformanceSummary {
            avg_response_time_ms,
            p95_response_time_ms,
            p99_response_time_ms,
            total_requests,
            error_rate,
            throughput_rps,
        }
    }

    pub async fn get_metrics_count(&self) -> usize {
        let metrics_guard = self.metrics.read().await;
        metrics_guard.len()
    }

    pub async fn clear_metrics(&self) {
        let mut metrics_guard = self.metrics.write().await;
        metrics_guard.clear();
    }
}

// Convenience macros for performance monitoring
#[macro_export]
macro_rules! perf_timer {
    ($monitor:expr, $operation:expr) => {
        $monitor.start_timer($operation)
    };
    ($monitor:expr, $operation:expr, $($key:expr => $value:expr),*) => {
        {
            let mut timer = $monitor.start_timer($operation);
            $(
                timer = timer.with_tag($key.to_string(), $value.to_string());
            )*
            timer
        }
    };
}

#[macro_export]
macro_rules! perf_counter {
    ($monitor:expr, $metric:expr, $value:expr) => {
        $monitor.record_counter($metric.to_string(), $value, std::collections::HashMap::new())
    };
    ($monitor:expr, $metric:expr, $value:expr, $($key:expr => $val:expr),*) => {
        {
            let mut tags = std::collections::HashMap::new();
            $(
                tags.insert($key.to_string(), $val.to_string());
            )*
            $monitor.record_counter($metric.to_string(), $value, tags)
        }
    };
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::time::{sleep, Duration as TokioDuration};

    #[tokio::test]
    async fn test_performance_monitor_timing() {
        let monitor = PerformanceMonitor::new();
        
        let timer = monitor.start_timer("test_operation");
        sleep(TokioDuration::from_millis(10)).await;
        timer.finish(&monitor);

        // Wait for async metric recording
        sleep(TokioDuration::from_millis(100)).await;

        let count = monitor.get_metrics_count().await;
        assert_eq!(count, 1);
    }

    #[tokio::test]
    async fn test_performance_report() {
        let monitor = PerformanceMonitor::new();
        
        // Record some test metrics
        monitor.record_timing(
            "api_request".to_string(),
            Duration::from_millis(100),
            HashMap::new()
        );
        monitor.record_timing(
            "api_request".to_string(),
            Duration::from_millis(200),
            HashMap::new()
        );

        // Wait for async processing
        sleep(TokioDuration::from_millis(100)).await;

        let start_time = chrono::Utc::now() - chrono::Duration::minutes(1);
        let end_time = chrono::Utc::now() + chrono::Duration::minutes(1);

        let report = monitor.get_performance_report(start_time, end_time).await.unwrap();
        assert_eq!(report.summary.total_requests, 2);
        assert_eq!(report.summary.avg_response_time_ms, 150.0);
    }
}
