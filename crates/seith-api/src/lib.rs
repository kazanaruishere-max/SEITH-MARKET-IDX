pub mod analysis;
pub mod envelope;
pub mod handlers;
pub mod kronos;
pub mod repository;

use axum::{routing::get, Router};
use repository::DynRepository;
use std::sync::Arc;

pub fn router(repo: DynRepository) -> Router {
    Router::new()
        .route("/health", get(handlers::health))
        .route("/api/v1/health", get(handlers::health))
        .route("/api/v1/ranking", get(handlers::ranking))
        .with_state(repo)
}

pub fn router_memory() -> Router {
    let repo: DynRepository = Arc::new(repository::SqliteRepository::new(
        "file:seith_api_mem?mode=memory&cache=shared",
    ));
    router(repo)
}
