use seith_api::{repository::SqliteRepository, router};
use seith_core::config::AppConfig;
use std::{net::SocketAddr, sync::Arc};
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();
    let cfg = AppConfig::from_env()?;
    tracing::info!(market = %cfg.market, "seith-api start");
    let repo: seith_api::repository::DynRepository =
        Arc::new(SqliteRepository::new("data/seith.db"));
    let app = router(repo);
    let addr: SocketAddr = std::env::var("SEITH_API_BIND")
        .unwrap_or_else(|_| "0.0.0.0:8080".into())
        .parse()?;
    let listener = tokio::net::TcpListener::bind(addr).await?;
    tracing::info!(%addr, "listening");
    axum::serve(listener, app).await?;
    Ok(())
}
