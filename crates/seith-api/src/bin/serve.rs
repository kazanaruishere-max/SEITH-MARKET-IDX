use seith_api::{repository::SqliteRepository, router};
use seith_core::config::AppConfig;
use std::{net::SocketAddr, sync::Arc};
use tracing_subscriber::EnvFilter;

fn load_dotenv() {
    let Ok(s) = std::fs::read_to_string(".env") else {
        return;
    };
    for line in s.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        if let Some((k, v)) = line.split_once('=') {
            let k = k.trim();
            let v = v.trim().trim_matches('"').trim_matches('\'');
            if std::env::var(k).is_err() {
                std::env::set_var(k, v);
            }
        }
    }
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    load_dotenv();
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
