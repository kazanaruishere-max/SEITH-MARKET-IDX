pub mod analysis;
pub mod envelope;
pub mod handlers;
pub mod kronos;
pub mod repository;

use axum::{
    routing::{get, post},
    Router,
};
use repository::DynRepository;
use std::sync::Arc;

pub fn router(repo: DynRepository) -> Router {
    Router::new()
        .route("/health", get(handlers::health))
        .route("/api/v1/health", get(handlers::health))
        .route("/api/v1/ranking", get(handlers::ranking))
        .route("/api/v1/tickers/:ticker/score", get(handlers::score))
        .route("/api/v1/tickers/:ticker/dossier", get(handlers::dossier))
        .route("/api/v1/anomalies", get(handlers::anomalies))
        .route("/api/v1/scan", post(handlers::scan))
        .with_state(repo)
}

pub fn router_memory() -> Router {
    let repo: DynRepository = Arc::new(repository::SqliteRepository::new(
        "file:seith_api_mem?mode=memory&cache=shared",
    ));
    router(repo)
}
