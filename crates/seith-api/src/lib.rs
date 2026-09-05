use axum::{routing::get, Router};
use serde_json::json;

async fn health() -> axum::Json<serde_json::Value> {
    axum::Json(
        json!({"success": true, "data": {"status": "ok", "version": env!("CARGO_PKG_VERSION")}}),
    )
}

pub fn router() -> Router {
    Router::new()
        .route("/health", get(health))
        .route("/api/v1/health", get(health))
}
