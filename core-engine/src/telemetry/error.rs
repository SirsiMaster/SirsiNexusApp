use thiserror::Error;

#[derive(Error, Debug)]
pub enum TelemetryError {
    #[error("Failed to initialize tracer: {0}")]
    TracerInitError(String),

    #[error("Failed to initialize metrics: {0}")]
    MetricsInitError(String),

    #[error("Failed to export telemetry data: {0}")]
    ExportError(String),

    #[error("Invalid configuration: {0}")]
    ConfigError(String),
}

pub type Result<T> = std::result::Result<T, TelemetryError>;
