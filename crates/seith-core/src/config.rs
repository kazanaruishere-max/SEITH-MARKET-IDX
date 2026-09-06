use anyhow::{Context, Result};

use crate::{market::Market, redact::Redacted};
use std::str::FromStr;

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub sectors_api_key: Redacted,
    pub market: Market,
    pub llm_base_url: String,
    pub kronos_url: String,
    pub analysis_url: String,
}

#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("missing env {0}")]
    MissingKey(&'static str),
}

impl AppConfig {
    pub fn from_env() -> Result<Self> {
        let raw_key = std::env::var("SECTORS_API_KEY")
            .context("SECTORS_API_KEY missing — set in .env (server-only)")?;
        if raw_key.len() < 20 {
            anyhow::bail!("SECTORS_API_KEY too short");
        }
        let market = std::env::var("MARKET")
            .map(|v| Market::from_str(&v))
            .unwrap_or(Ok(Market::default()))
            .map_err(|e| anyhow::anyhow!(e))?;
        let llm_base_url = std::env::var("LLM_BASE_URL")
            .unwrap_or_else(|_| "http://localhost:20128/v1".to_string());
        let kronos_url =
            std::env::var("KRONOS_URL").unwrap_or_else(|_| "http://localhost:8001".to_string());
        let analysis_url =
            std::env::var("ANALYSIS_URL").unwrap_or_else(|_| "http://localhost:8002".to_string());
        Ok(Self {
            sectors_api_key: Redacted(raw_key),
            market,
            llm_base_url,
            kronos_url,
            analysis_url,
        })
    }
}
