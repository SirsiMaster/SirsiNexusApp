// OpenTelemetry Integration
// Provides distributed tracing, spans, and advanced observability

use std::{
    collections::HashMap,
    sync::Arc,
    time::SystemTime,
};
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use tracing::{info, debug};
use uuid::Uuid;

use crate::{
    error::{AppError, AppResult},
    telemetry::metrics::MetricsCollector,
};
use crate::audit::AuditLogger;

/// OpenTelemetry tracer and span manager
#[derive(Debug)]
pub struct OtelTracer {
    service_name: String,
    service_version: String,
    active_spans: Arc<RwLock<HashMap<String, TraceSpan>>>,
    traces: Arc<RwLock<HashMap<String, Trace>>>,
    metrics_collector: Option<Arc<MetricsCollector>>,
    audit_logger: Option<AuditLogger>,
    sampling_rate: f64,
    export_endpoint: Option<String>,
}

/// Trace span information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TraceSpan {
    pub span_id: String,
    pub trace_id: String,
    pub parent_span_id: Option<String>,
    pub operation_name: String,
    pub start_time: SystemTime,
    pub end_time: Option<SystemTime>,
    pub duration_ms: Option<u64>,
    pub status: SpanStatus,
    pub tags: HashMap<String, String>,
    pub events: Vec<SpanEvent>,
    pub component: String,
    pub service_name: String,
}

/// Complete trace with all spans
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Trace {
    pub trace_id: String,
    pub spans: Vec<TraceSpan>,
    pub start_time: SystemTime,
    pub end_time: Option<SystemTime>,
    pub duration_ms: Option<u64>,
    pub service_names: Vec<String>,
    pub operation_count: usize,
    pub error_count: usize,
}

/// Span status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum SpanStatus {
    Ok,
    Error,
    Timeout,
    Cancelled,
    Unknown,
}

/// Span event (log within a span)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpanEvent {
    pub timestamp: SystemTime,
    pub name: String,
    pub attributes: HashMap<String, String>,
}

/// Distributed tracing context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TraceContext {
    pub trace_id: String,
    pub span_id: String,
    pub flags: u8,
    pub baggage: HashMap<String, String>,
}

/// OpenTelemetry resource attributes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceAttributes {
    pub service_name: String,
    pub service_version: String,
    pub service_instance_id: String,
    pub deployment_environment: String,
    pub host_name: String,
    pub process_pid: u32,
    pub runtime_name: String,
    pub runtime_version: String,
}

impl OtelTracer {
    /// Create a new OpenTelemetry tracer
    pub fn new(service_name: String, service_version: String) -> Self {
        Self {
            service_name,
            service_version,
            active_spans: Arc::new(RwLock::new(HashMap::new())),
            traces: Arc::new(RwLock::new(HashMap::new())),
            metrics_collector: None,
            audit_logger: None,
            sampling_rate: 1.0, // 100% sampling by default
            export_endpoint: None,
        }
    }
    
    /// Set metrics collector for integration
    pub fn with_metrics_collector(mut self, collector: Arc<MetricsCollector>) -> Self {
        self.metrics_collector = Some(collector);
        self
    }
    
    /// Add audit logging
    pub fn with_audit_logger(mut self, audit_logger: AuditLogger) -> Self {
        self.audit_logger = Some(audit_logger);
        self
    }
    
    /// Set sampling rate (0.0 to 1.0)
    pub fn with_sampling_rate(mut self, rate: f64) -> Self {
        self.sampling_rate = rate.clamp(0.0, 1.0);
        self
    }
    
    /// Set export endpoint for traces
    pub fn with_export_endpoint(mut self, endpoint: String) -> Self {
        self.export_endpoint = Some(endpoint);
        self
    }
    
    /// Initialize the OpenTelemetry tracer
    pub async fn initialize(&self) -> AppResult<()> {
        info!("🔍 Initializing OpenTelemetry distributed tracing");
        
        if let Some(audit_logger) = &self.audit_logger {
            let _ = audit_logger.log_system_event(
                "opentelemetry_tracer_initialized",
                serde_json::json!({
                    "service_name": self.service_name,
                    "service_version": self.service_version,
                    "sampling_rate": self.sampling_rate,
                    "export_endpoint": self.export_endpoint,
                    "tracing_enabled": true
                }),
                true,
                None,
            ).await;
        }
        
        info!("✅ OpenTelemetry tracer initialized successfully");
        Ok(())
    }
    
    /// Start a new span
    pub async fn start_span(
        &self,
        operation_name: &str,
        component: &str,
        parent_context: Option<&TraceContext>,
    ) -> AppResult<TraceSpan> {
        // Check sampling decision
        if !self.should_sample() {
            return Err(AppError::Validation("Span not sampled".to_string()));
        }
        
        let span_id = self.generate_span_id();
        let trace_id = match parent_context {
            Some(ctx) => ctx.trace_id.clone(),
            None => self.generate_trace_id(),
        };
        
        let span = TraceSpan {
            span_id: span_id.clone(),
            trace_id: trace_id.clone(),
            parent_span_id: parent_context.map(|ctx| ctx.span_id.clone()),
            operation_name: operation_name.to_string(),
            start_time: SystemTime::now(),
            end_time: None,
            duration_ms: None,
            status: SpanStatus::Ok,
            tags: HashMap::new(),
            events: Vec::new(),
            component: component.to_string(),
            service_name: self.service_name.clone(),
        };
        
        // Store active span
        {
            let mut active_spans = self.active_spans.write().await;
            active_spans.insert(span_id.clone(), span.clone());
        }
        
        // Update metrics
        if let Some(metrics) = &self.metrics_collector {
            metrics.increment_counter("otel_spans_started", 1).await;
            metrics.set_gauge("otel_active_spans", self.active_spans.read().await.len() as i64).await;
        }
        
        debug!("🔍 Started span: {} ({})", operation_name, span_id);
        Ok(span)
    }
    
    /// Finish a span
    pub async fn finish_span(&self, span_id: &str, status: SpanStatus) -> AppResult<()> {
        let span = {
            let mut active_spans = self.active_spans.write().await;
            active_spans.remove(span_id)
        };
        
        if let Some(mut span) = span {
            let end_time = SystemTime::now();
            let duration = end_time.duration_since(span.start_time)?;
            
            span.end_time = Some(end_time);
            span.duration_ms = Some(duration.as_millis() as u64);
            span.status = status.clone();
            
            // Add to trace
            self.add_span_to_trace(&span).await?;
            
            // Update metrics
            if let Some(metrics) = &self.metrics_collector {
                metrics.increment_counter("otel_spans_finished", 1).await;
                metrics.observe_histogram("otel_span_duration_ms", span.duration_ms.unwrap() as f64).await;
                
                if status != SpanStatus::Ok {
                    metrics.increment_counter("otel_spans_error", 1).await;
                }
                
                // Record operation-specific metrics
                metrics.record_agent_operation(
                    &span.operation_name,
                    span.duration_ms.unwrap() as f64,
                    status == SpanStatus::Ok,
                    span.tags.contains_key("ai_api_call"),
                ).await;
            }
            
            debug!("🏁 Finished span: {} ({}ms)", span.operation_name, span.duration_ms.unwrap());
        }
        
        Ok(())
    }
    
    /// Add tags to a span
    pub async fn add_span_tags(&self, span_id: &str, tags: HashMap<String, String>) -> AppResult<()> {
        let mut active_spans = self.active_spans.write().await;
        if let Some(span) = active_spans.get_mut(span_id) {
            span.tags.extend(tags);
        }
        Ok(())
    }
    
    /// Add an event to a span
    pub async fn add_span_event(
        &self,
        span_id: &str,
        event_name: &str,
        attributes: HashMap<String, String>,
    ) -> AppResult<()> {
        let mut active_spans = self.active_spans.write().await;
        if let Some(span) = active_spans.get_mut(span_id) {
            span.events.push(SpanEvent {
                timestamp: SystemTime::now(),
                name: event_name.to_string(),
                attributes,
            });
        }
        Ok(())
    }
    
    /// Create trace context for propagation
    pub fn create_trace_context(&self, span: &TraceSpan) -> TraceContext {
        TraceContext {
            trace_id: span.trace_id.clone(),
            span_id: span.span_id.clone(),
            flags: 0x01, // Sampled
            baggage: HashMap::new(),
        }
    }
    
    /// Parse trace context from headers
    pub fn parse_trace_context(&self, traceparent: &str) -> AppResult<TraceContext> {
        // Parse W3C Trace Context format: 00-{trace_id}-{span_id}-{flags}
        let parts: Vec<&str> = traceparent.split('-').collect();
        if parts.len() != 4 {
            return Err(AppError::Validation("Invalid traceparent format".to_string()));
        }
        
        let trace_id = parts[1].to_string();
        let span_id = parts[2].to_string();
        let flags = u8::from_str_radix(parts[3], 16)?;
        
        Ok(TraceContext {
            trace_id,
            span_id,
            flags,
            baggage: HashMap::new(),
        })
    }
    
    /// Format trace context for headers
    pub fn format_trace_context(&self, context: &TraceContext) -> String {
        format!("00-{}-{}-{:02x}", context.trace_id, context.span_id, context.flags)
    }
    
    /// Get complete trace
    pub async fn get_trace(&self, trace_id: &str) -> Option<Trace> {
        let traces = self.traces.read().await;
        traces.get(trace_id).cloned()
    }
    
    /// Get all active spans
    pub async fn get_active_spans(&self) -> Vec<TraceSpan> {
        let active_spans = self.active_spans.read().await;
        active_spans.values().cloned().collect()
    }
    
    /// Export traces in OTLP format
    pub async fn export_traces(&self, trace_ids: Vec<String>) -> AppResult<String> {
        let mut export_data = Vec::new();
        
        {
            let traces = self.traces.read().await;
            for trace_id in trace_ids {
                if let Some(trace) = traces.get(&trace_id) {
                    export_data.push(trace.clone());
                }
            }
        }
        
        let export = TraceExport {
            resource_attributes: self.get_resource_attributes().await,
            traces: export_data,
            export_timestamp: SystemTime::now(),
        };
        
        let json = serde_json::to_string_pretty(&export)?;
        
        if let Some(metrics) = &self.metrics_collector {
            metrics.increment_counter("otel_traces_exported", export.traces.len() as u64).await;
        }
        
        debug!("📤 Exported {} traces", export.traces.len());
        Ok(json)
    }
    
    /// Start a traced HTTP request
    pub async fn start_http_request(
        &self,
        method: &str,
        url: &str,
        headers: &HashMap<String, String>,
    ) -> AppResult<(TraceSpan, TraceContext)> {
        // Check for incoming trace context
        let parent_context = headers.get("traceparent")
            .and_then(|tp| self.parse_trace_context(tp).ok());
        
        let span = self.start_span(
            &format!("HTTP {}", method),
            "http_server",
            parent_context.as_ref(),
        ).await?;
        
        // Add HTTP-specific tags
        let mut tags = HashMap::new();
        tags.insert("http.method".to_string(), method.to_string());
        tags.insert("http.url".to_string(), url.to_string());
        tags.insert("component".to_string(), "http".to_string());
        
        self.add_span_tags(&span.span_id, tags).await?;
        
        let context = self.create_trace_context(&span);
        Ok((span, context))
    }
    
    /// Start a traced database operation
    pub async fn start_database_operation(
        &self,
        operation: &str,
        table: &str,
        parent_context: Option<&TraceContext>,
    ) -> AppResult<TraceSpan> {
        let span = self.start_span(
            &format!("DB {}", operation),
            "database",
            parent_context,
        ).await?;
        
        // Add database-specific tags
        let mut tags = HashMap::new();
        tags.insert("db.operation".to_string(), operation.to_string());
        tags.insert("db.table".to_string(), table.to_string());
        tags.insert("component".to_string(), "database".to_string());
        
        self.add_span_tags(&span.span_id, tags).await?;
        Ok(span)
    }
    
    /// Start a traced AI API call
    pub async fn start_ai_api_call(
        &self,
        model: &str,
        prompt_tokens: u32,
        parent_context: Option<&TraceContext>,
    ) -> AppResult<TraceSpan> {
        let span = self.start_span(
            "AI API Call",
            "ai_service",
            parent_context,
        ).await?;
        
        // Add AI-specific tags
        let mut tags = HashMap::new();
        tags.insert("ai.model".to_string(), model.to_string());
        tags.insert("ai.prompt_tokens".to_string(), prompt_tokens.to_string());
        tags.insert("ai_api_call".to_string(), "true".to_string());
        tags.insert("component".to_string(), "ai".to_string());
        
        self.add_span_tags(&span.span_id, tags).await?;
        Ok(span)
    }
    
    /// Add span to trace
    async fn add_span_to_trace(&self, span: &TraceSpan) -> AppResult<()> {
        let mut traces = self.traces.write().await;
        
        let trace = traces.entry(span.trace_id.clone())
            .or_insert_with(|| Trace {
                trace_id: span.trace_id.clone(),
                spans: Vec::new(),
                start_time: span.start_time,
                end_time: None,
                duration_ms: None,
                service_names: Vec::new(),
                operation_count: 0,
                error_count: 0,
            });
        
        trace.spans.push(span.clone());
        trace.operation_count += 1;
        
        if span.status != SpanStatus::Ok {
            trace.error_count += 1;
        }
        
        if !trace.service_names.contains(&span.service_name) {
            trace.service_names.push(span.service_name.clone());
        }
        
        // Update trace timing
        if span.start_time < trace.start_time {
            trace.start_time = span.start_time;
        }
        
        if let Some(end_time) = span.end_time {
            if trace.end_time.is_none() || end_time > trace.end_time.unwrap() {
                trace.end_time = Some(end_time);
                
                if let Ok(duration) = end_time.duration_since(trace.start_time) {
                    trace.duration_ms = Some(duration.as_millis() as u64);
                }
            }
        }
        
        Ok(())
    }
    
    /// Generate unique span ID
    fn generate_span_id(&self) -> String {
        format!("{:016x}", rand::random::<u64>())
    }
    
    /// Generate unique trace ID
    fn generate_trace_id(&self) -> String {
        format!("{:032x}", rand::random::<u128>())
    }
    
    /// Check if span should be sampled
    fn should_sample(&self) -> bool {
        rand::random::<f64>() < self.sampling_rate
    }
    
    /// Get resource attributes
    async fn get_resource_attributes(&self) -> ResourceAttributes {
        ResourceAttributes {
            service_name: self.service_name.clone(),
            service_version: self.service_version.clone(),
            service_instance_id: Uuid::new_v4().to_string(),
            deployment_environment: std::env::var("ENVIRONMENT").unwrap_or_else(|_| "development".to_string()),
            host_name: hostname::get().unwrap_or_else(|_| "unknown".into()).to_string_lossy().to_string(),
            process_pid: std::process::id(),
            runtime_name: "rust".to_string(),
            runtime_version: std::env::var("RUSTC_VERSION").unwrap_or_else(|_| "unknown".to_string()),
        }
    }
}

/// Trace export format
#[derive(Debug, Serialize, Deserialize)]
pub struct TraceExport {
    pub resource_attributes: ResourceAttributes,
    pub traces: Vec<Trace>,
    pub export_timestamp: SystemTime,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::telemetry::metrics::MetricsCollector;
    use std::time::Duration;
    
    #[tokio::test]
    async fn test_otel_tracer_initialization() {
        let tracer = OtelTracer::new("test-service".to_string(), "1.0.0".to_string());
        let result = tracer.initialize().await;
        assert!(result.is_ok());
    }
    
    #[tokio::test]
    async fn test_span_lifecycle() {
        let tracer = OtelTracer::new("test-service".to_string(), "1.0.0".to_string());
        tracer.initialize().await.unwrap();
        
        let span = tracer.start_span("test_operation", "test_component", None).await.unwrap();
        assert_eq!(span.operation_name, "test_operation");
        assert_eq!(span.status, SpanStatus::Ok);
        
        let result = tracer.finish_span(&span.span_id, SpanStatus::Ok).await;
        assert!(result.is_ok());
    }
    
    #[tokio::test]
    async fn test_trace_context_parsing() {
        let tracer = OtelTracer::new("test-service".to_string(), "1.0.0".to_string());
        
        let traceparent = "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01";
        let context = tracer.parse_trace_context(traceparent).unwrap();
        
        assert_eq!(context.trace_id, "4bf92f3577b34da6a3ce929d0e0e4736");
        assert_eq!(context.span_id, "00f067aa0ba902b7");
        assert_eq!(context.flags, 0x01);
    }
    
    #[tokio::test]
    async fn test_trace_context_formatting() {
        let tracer = OtelTracer::new("test-service".to_string(), "1.0.0".to_string());
        
        let context = TraceContext {
            trace_id: "4bf92f3577b34da6a3ce929d0e0e4736".to_string(),
            span_id: "00f067aa0ba902b7".to_string(),
            flags: 0x01,
            baggage: HashMap::new(),
        };
        
        let formatted = tracer.format_trace_context(&context);
        assert_eq!(formatted, "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01");
    }
    
    #[tokio::test]
    async fn test_http_request_tracing() {
        let tracer = OtelTracer::new("test-service".to_string(), "1.0.0".to_string());
        tracer.initialize().await.unwrap();
        
        let headers = HashMap::new();
        let (span, context) = tracer.start_http_request("GET", "/api/test", &headers).await.unwrap();
        
        assert_eq!(span.operation_name, "HTTP GET");
        assert_eq!(span.component, "http_server");
        assert!(!context.trace_id.is_empty());
    }
    
    #[tokio::test]
    async fn test_span_tags_and_events() {
        let tracer = OtelTracer::new("test-service".to_string(), "1.0.0".to_string());
        tracer.initialize().await.unwrap();
        
        let span = tracer.start_span("test_operation", "test", None).await.unwrap();
        
        let mut tags = HashMap::new();
        tags.insert("user_id".to_string(), "123".to_string());
        tracer.add_span_tags(&span.span_id, tags).await.unwrap();
        
        let mut event_attrs = HashMap::new();
        event_attrs.insert("action".to_string(), "cache_miss".to_string());
        tracer.add_span_event(&span.span_id, "cache_event", event_attrs).await.unwrap();
        
        let active_spans = tracer.get_active_spans().await;
        assert_eq!(active_spans.len(), 1);
        assert!(active_spans[0].tags.contains_key("user_id"));
        assert_eq!(active_spans[0].events.len(), 1);
    }
}
