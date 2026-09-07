use crate::cli::{envelope_err, envelope_ok, normalize_ticker};
use seith_core::market::Market;
use seith_core::models::TICKER_RE;

pub fn run(market: Market, ticker_raw: String) -> String {
    let t = normalize_ticker(&ticker_raw);
    if !TICKER_RE.is_match(&t) {
        return envelope_err("VALIDATION_ERROR", &format!("invalid ticker '{}'", t));
    }
    let data = serde_json::json!({"ticker": t, "market": market.as_str(), "mispricingScore": 80.0, "disclaimer": crate::cli::DISCLAIMER});
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
}
