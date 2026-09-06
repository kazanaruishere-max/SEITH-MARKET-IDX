use thiserror::Error;

#[derive(Debug, Error)]
pub enum KronosError {
    #[error("VALIDATION_ERROR: {0}")]
    Validation(String),
    #[error("TIMEOUT")]
    Timeout,
    #[error("UPSTREAM_ERROR: {0}")]
    Upstream(String),
    #[error("SERDE_ERROR: {0}")]
    Serde(String),
}
