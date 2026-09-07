use crate::cli::{envelope_err, envelope_ok};
use seith_core::market::Market;

pub fn run(market: Market, sector: Option<String>) -> String {
    let data = serde_json::json!({"market": market.as_str(), "sector": sector, "items": []});
    envelope_ok(data)
}

pub fn run_validated(raw_market: &str, sub_market: Option<&str>, sector: Option<String>) -> String {
    let m = match crate::cli::effective_market(raw_market, sub_market) {
        Ok(v) => v,
        Err(e) => return envelope_err("VALIDATION_ERROR", &e),
    };
    run(m, sector)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn ranking_sg_json() {
        let j = run_validated("sg", None, Some("FINANCE".to_string()));
        let v: serde_json::Value = serde_json::from_str(&j).unwrap();
        assert_eq!(v["success"], true);
        assert_eq!(v["data"]["market"], "sg");
    }
    #[test]
    fn ranking_bad_market_422() {
        let j = run_validated("xx", None, None);
        let v: serde_json::Value = serde_json::from_str(&j).unwrap();
        assert_eq!(v["success"], false);
        assert_eq!(v["error"]["code"], "VALIDATION_ERROR");
    }
}
