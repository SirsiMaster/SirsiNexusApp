use ::opentelemetry::KeyValue;
use opentelemetry_otlp::WithExportConfig;
use opentelemetry_sdk::{Resource, runtime::Tokio};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use crate::error::AppResult;
use crate::config::AppConfig;

pub mod error;
pub mod performance;
pub mod metrics;
pub mod prometheus;
pub mod opentelemetry;
pub mod dashboard;

pub use error::{TelemetryError, Result as TelemetryResult};
pub use performance::{PerformanceMonitor, PerformanceMetric, PerformanceReport, RequestTimer};

/// Initialize telemetry with app config
pub async fn init(config: &AppConfig) -> AppResult<()> {
    init_tracing(&config.telemetry.service_name, Some(&config.telemetry.otlp_endpoint))
}

/// Initialize OpenTelemetry tracing with OTLP exporter
pub fn init_tracing(service_name: &str, otlp_endpoint: Option<&str>) -> AppResult<()> {
    let tracer = opentelemetry_otlp::new_pipeline()
        .tracing()
        .with_exporter(
            opentelemetry_otlp::new_exporter()
                .tonic()
                .with_endpoint(otlp_endpoint.unwrap_or("http://localhost:4317"))
        )
        .with_trace_config(
            opentelemetry_sdk::trace::config().with_resource(Resource::new(vec![
                KeyValue::new("service.name", service_name.to_string()),
                KeyValue::new("service.version", env!("CARGO_PKG_VERSION")),
            ]))
        )
        .install_batch(Tokio)
        .map_err(|e| crate::error::AppError::Configuration(format!("Failed to initialize tracing: {}", e)))?;

    // Only initialize if no global subscriber is already set
    match tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "sirsi_core=debug,tower_http=debug".into())
        ))
        .with(tracing_subscriber::fmt::layer())
        .with(tracing_opentelemetry::layer().with_tracer(tracer))
        .try_init() {
        Ok(_) => {},
        Err(e) => {
            // If tracing is already initialized, just log a warning
            eprintln!("Warning: Tracing subscriber already initialized: {}", e);
        }
    }

    Ok(())
}

/// Initialize metrics collection
pub fn init_metrics() -> PerformanceMonitor {
    PerformanceMonitor::new()
}

/// Graceful shutdown of telemetry
pub fn shutdown_telemetry() {
    ::opentelemetry::global::shutdown_tracer_provider();
}
