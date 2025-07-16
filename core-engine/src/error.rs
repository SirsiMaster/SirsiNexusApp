use axum::{http::StatusCode, response::{IntoResponse, Response}, Json};
use serde_json::json;
use thiserror::Error;
use validator::ValidationErrors;

#[derive(Debug, Error)]
pub enum Error {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    
    #[error("Authentication error: {0}")]
    Auth(String),
    
    #[error("Authorization error: {0}")]
    Forbidden(String),
    
    #[error("Unauthorized: {0}")]
    Unauthorized(String),
    
    #[error("Security error: {0}")]
    Security(String),
    
    #[error("Invalid input: {0}")]
    InvalidInput(String),
    
    #[error("Not found: {0}")]
    NotFound(String),
    
    #[error("Internal error: {0}")]
    Internal(String),
    
    #[error("Validation error: {0}")]
    Validation(String),
    
    #[error("Configuration error: {0}")]
    Configuration(String),
    
    #[error("Connection error: {0}")]
    Connection(String),
    
    #[error("Serialization error: {0}")]
    Serialization(String),
    
    #[error("External service error: {0}")]
    ExternalService(String),
    
    #[error("External error: {0}")]
    External(String),
    
    #[error("Server error: {0}")]
    Server(String),
    
    #[error("JSON serialization error: {0}")]
    JsonSerialization(#[from] serde_json::Error),
    
    #[error("Resource limit exceeded: {0}")]
    ResourceLimit(String),
    
    #[error("Not supported: {0}")]
    NotSupported(String),
    
    #[error("Agent not found: {0}")]
    AgentNotFound(String),
    
    #[error("Communication error: {0}")]
    CommunicationError(String),
}

impl IntoResponse for Error {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            Error::Auth(msg) => (StatusCode::UNAUTHORIZED, msg),
            Error::Forbidden(msg) => (StatusCode::FORBIDDEN, msg),
            Error::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, msg),
            Error::Security(msg) => (StatusCode::FORBIDDEN, msg),
            Error::Database(e) => (StatusCode::INTERNAL_SERVER_ERROR, format!("Database error: {}", e)),
            Error::InvalidInput(msg) => (StatusCode::BAD_REQUEST, msg),
            Error::NotFound(msg) => (StatusCode::NOT_FOUND, msg),
            Error::Internal(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
            Error::Validation(msg) => (StatusCode::BAD_REQUEST, msg),
            Error::Configuration(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
            Error::Connection(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
            Error::Serialization(msg) => (StatusCode::BAD_REQUEST, msg),
            Error::ExternalService(msg) => (StatusCode::BAD_GATEWAY, msg),
            Error::External(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
            Error::Server(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
            Error::JsonSerialization(e) => (StatusCode::BAD_REQUEST, format!("JSON error: {}", e)),
            Error::ResourceLimit(msg) => (StatusCode::TOO_MANY_REQUESTS, msg),
            Error::NotSupported(msg) => (StatusCode::NOT_IMPLEMENTED, msg),
            Error::AgentNotFound(msg) => (StatusCode::NOT_FOUND, msg),
            Error::CommunicationError(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
        };

        let body = Json(json!({
            "error": error_message,
        }));

        (status, body).into_response()
    }
}

impl From<ValidationErrors> for Error {
    fn from(errors: ValidationErrors) -> Self {
        let error_messages: Vec<String> = errors
            .field_errors()
            .iter()
            .map(|(field, errors)| {
                let messages: Vec<String> = errors
                    .iter()
                    .map(|error| {
                        error.message
                            .as_ref()
                            .map(|msg| msg.to_string())
                            .unwrap_or_else(|| format!("Invalid {}", field))
                    })
                    .collect();
                format!("{}: {}", field, messages.join(", "))
            })
            .collect();
        
        Error::Validation(error_messages.join("; "))
    }
}

impl From<std::fmt::Error> for Error {
    fn from(err: std::fmt::Error) -> Self {
        Error::Internal(err.to_string())
    }
}

impl From<std::time::SystemTimeError> for Error {
    fn from(err: std::time::SystemTimeError) -> Self {
        Error::Internal(err.to_string())
    }
}

impl From<std::io::Error> for Error {
    fn from(err: std::io::Error) -> Self {
        Error::Internal(err.to_string())
    }
}

impl From<std::num::ParseIntError> for Error {
    fn from(err: std::num::ParseIntError) -> Self {
        Error::Validation(format!("Parse error: {}", err))
    }
}

impl From<anyhow::Error> for Error {
    fn from(err: anyhow::Error) -> Self {
        Error::External(err.to_string())
    }
}

pub type Result<T> = std::result::Result<T, Error>;

// Type aliases for backward compatibility
pub type AppError = Error;
pub type AppResult<T> = Result<T>;
