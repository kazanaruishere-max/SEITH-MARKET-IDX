use clap::{Parser, Subcommand};
use seith_core::market::Market;
use std::str::FromStr;

pub const DISCLAIMER: &str = "Bukan rekomendasi investasi. Informasi & analisis saja.";

#[derive(Parser, Debug)]
#[command(name = "seith", version, about = "SEITH Market Intelligence CLI")]
pub struct Cli {
    #[arg(long, global = true, default_value = "id")]
    pub market: String,
    #[arg(long, global = true, default_value_t = false)]
    pub json: bool,
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand, Debug)]
pub enum Commands {
    Ranking {
        #[arg(long)]
        sector: Option<String>,
        #[arg(long)]
        market: Option<String>,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    Score {
        ticker: String,
        #[arg(long)]
        market: Option<String>,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    Dossier {
        ticker: String,
        #[arg(long, default_value_t = false)]
        pdf: bool,
        #[arg(long)]
        market: Option<String>,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    Scan {
        #[arg(long)]
        tickers: String,
        #[arg(long)]
        market: Option<String>,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
}

pub fn normalize_ticker(raw: &str) -> String {
    raw.split('.')
        .next()
        .unwrap_or(raw)
        .trim()
        .to_ascii_uppercase()
}

pub fn parse_market(s: &str) -> Result<Market, String> {
    Market::from_str(s).map_err(|e| e.to_string())
}

pub fn effective_market(global: &str, sub: Option<&str>) -> Result<Market, String> {
    let raw = sub.unwrap_or(global);
    parse_market(raw)
}

pub fn envelope_ok<T: serde::Serialize>(data: T) -> String {
    serde_json::to_string(
        &serde_json::json!({"success": true, "data": data, "disclaimer": DISCLAIMER}),
    )
    .unwrap_or_else(|_| r#"{"success":true}"#.to_string())
}

pub fn envelope_err(code: &str, msg: &str) -> String {
    serde_json::to_string(
        &serde_json::json!({"success": false, "error": {"code": code, "message": msg}}),
    )
    .unwrap_or_else(|_| r#"{"success":false}"#.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn normalize_jk() {
        assert_eq!(normalize_ticker("BBCA.JK"), "BBCA");
    }
    #[test]
    fn normalize_lower() {
        assert_eq!(normalize_ticker("bbca.jk"), "BBCA");
    }
    #[test]
    fn market_ok() {
        assert!(parse_market("sg").is_ok());
        assert!(parse_market("id").is_ok());
    }
    #[test]
    fn market_bad() {
        assert!(parse_market("xx").is_err());
    }
    #[test]
    fn envelope_success() {
        let j = envelope_ok(serde_json::json!({"market":"sg"}));
        assert!(j.contains(r#""success":true"#));
    }
}
