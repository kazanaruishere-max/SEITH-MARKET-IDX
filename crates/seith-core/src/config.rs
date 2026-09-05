use anyhow::{Context, Result};

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub sectors_api_key: String,
    pub market: String,
    pub llm_base_url: String,
    pub kronos_url: String,
    pub analysis_url: String,
}

impl AppConfig {
    pub fn from_env() -> Result<Self> {
        let sectors_api_key = std::env::var("SECTORS_API_KEY")
            .context("SECTORS_API_KEY missing — set in .env (server-only)")?;
        if sectors_api_key.len() < 20 {
            anyhow::bail!("SECTORS_API_KEY too short");
        }
        let market = std::env::var("MARKET").unwrap_or_else(|_| "id".to_string());
        if market != "id" && market != "sg" {
            anyhow::bail!("MARKET must be id|sg");
        }
        let llm_base_url = std::env::var("LLM_BASE_URL")
            .unwrap_or_else(|_| "http://localhost:20128/v1".to_string());
        let kronos_url =
            std::env::var("KRONOS_URL").unwrap_or_else(|_| "http://localhost:8001".to_string());
        let analysis_url =
            std::env::var("ANALYSIS_URL").unwrap_or_else(|_| "http://localhost:8002".to_string());
        Ok(Self {
            sectors_api_key,
            market,
            llm_base_url,
            kronos_url,
            analysis_url,
        })
    }
}
