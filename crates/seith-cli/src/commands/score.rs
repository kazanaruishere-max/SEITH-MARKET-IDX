use crate::cli::{envelope_err, envelope_ok, normalize_ticker};
use seith_core::market::Market;
use seith_core::models::TICKER_RE;

pub fn run(market: Market, ticker_raw: String) -> String {
    let t = normalize_ticker(&ticker_raw);
    if !TICKER_RE.is_match(&t) {
        return envelope_err("VALIDATION_ERROR", &format!("invalid ticker '{}'", t));
    }
    let Some(s) = crate::pipeline::scored_for(&t, market) else {
        return envelope_err("TICKER_NOT_FOUND", &format!("ticker '{t}' not found"));
    };
    let data = serde_json::json!({
        "ticker": s.ticker,
        "market": s.market.as_str(),
        "sector": s.sector,
        "mispricingScore": s.score,
        "components": s.components,
        "anomaly": {"z": s.anomaly_z, "flag": s.flag, "reason": s.reason},
        "disclaimer": crate::cli::DISCLAIMER
    });
    envelope_ok(data)
}

pub fn run_validated(raw: &str, sub: Option<&str>, ticker: String) -> String {
    let m = match crate::cli::effective_market(raw, sub) {
        Ok(v) => v,
        Err(e) => return envelope_err("VALIDATION_ERROR", &e),
    };
    run(m, ticker)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn score_ok() {
        let j = run_validated("id", None, "BBCA".to_string());
        let v: serde_json::Value = serde_json::from_str(&j).unwrap();
        assert_eq!(v["success"], true);
        assert_eq!(v["data"]["ticker"], "BBCA");
    }
    #[test]
    fn score_jk() {
        let j = run_validated("id", None, "BBCA.JK".to_string());
        let v: serde_json::Value = serde_json::from_str(&j).unwrap();
        assert_eq!(v["data"]["ticker"], "BBCA");
    }
    #[test]
    fn score_bad() {
        let j = run_validated("id", None, "ab".to_string());
        let v: serde_json::Value = serde_json::from_str(&j).unwrap();
        assert_eq!(v["error"]["code"], "VALIDATION_ERROR");
    }
    #[test]
    fn score_scores_differ() {
        let a = run_validated("id", None, "BBCA".to_string());
        let b = run_validated("id", None, "BBRI".to_string());
        let va: serde_json::Value = serde_json::from_str(&a).unwrap();
        let vb: serde_json::Value = serde_json::from_str(&b).unwrap();
        assert_eq!(va["success"], true);
        assert_eq!(vb["success"], true);
        let sa = va["data"]["mispricingScore"].as_f64().unwrap();
        let sb = vb["data"]["mispricingScore"].as_f64().unwrap();
        assert!((sa - sb).abs() > 0.01, "scores {sa} vs {sb} should differ");
        assert!(va["data"]["components"].is_object());
        assert!(va["data"]["anomaly"]["z"].is_number());
    }
}
