use crate::cli::{envelope_err, envelope_ok, normalize_ticker};
use seith_core::market::Market;
use seith_core::models::TICKER_RE;

pub fn run(market: Market, tickers_raw: &str) -> String {
    let list: Vec<String> = tickers_raw
        .split(',')
        .map(normalize_ticker)
        .filter(|s| !s.is_empty())
        .collect();
    if list.is_empty() || list.len() > 50 {
        return envelope_err("VALIDATION_ERROR", "tickers 1-50 required");
    }
    for t in &list {
        if !TICKER_RE.is_match(t) {
            return envelope_err("VALIDATION_ERROR", &format!("invalid ticker '{}'", t));
        }
    }
    let excluded: Vec<serde_json::Value> = vec![];
    envelope_ok(
        serde_json::json!({"market": market.as_str(), "tickers": list, "excluded": excluded}),
    )
}

pub fn run_validated(raw: &str, sub: Option<&str>, tickers: String) -> String {
    let m = match crate::cli::effective_market(raw, sub) {
        Ok(v) => v,
        Err(e) => return envelope_err("VALIDATION_ERROR", &e),
    };
    run(m, &tickers)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn scan_ok() {
        let j = run_validated("id", None, "BBCA,BMRI".to_string());
        let v: serde_json::Value = serde_json::from_str(&j).unwrap();
        assert_eq!(v["success"], true);
    }
    #[test]
    fn scan_51_fail() {
        let tickers = (0..51)
            .map(|i| format!("T{:03}", i))
            .collect::<Vec<_>>()
            .join(",");
        let j = run_validated("id", None, tickers);
        let v: serde_json::Value = serde_json::from_str(&j).unwrap();
        assert_eq!(v["error"]["code"], "VALIDATION_ERROR");
    }
    #[test]
    fn scan_bad_market() {
        let j = run_validated("xx", None, "BBCA".to_string());
        let v: serde_json::Value = serde_json::from_str(&j).unwrap();
        assert_eq!(v["error"]["code"], "VALIDATION_ERROR");
    }
}
