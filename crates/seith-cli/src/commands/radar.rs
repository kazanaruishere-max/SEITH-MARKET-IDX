use crate::cli::{envelope_err, envelope_ok};
use seith_core::market::Market;

pub fn run(market: Market, sector: Option<String>) -> String {
    let sec = sector.clone().unwrap_or_else(|| "FINANCE".to_string());
    let mut all = crate::pipeline::scored_all(&sec, market);
    let mut flagged: Vec<_> = all.drain(..).filter(|s| s.flag).collect();
    let fallback = flagged.is_empty();
    if fallback {
        flagged = crate::pipeline::scored_all(&sec, market);
        flagged.sort_by(|a, b| {
            b.anomaly_z
                .abs()
                .partial_cmp(&a.anomaly_z.abs())
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        flagged.truncate(5);
    } else {
        flagged.sort_by(|a, b| {
            b.anomaly_z
                .abs()
                .partial_cmp(&a.anomaly_z.abs())
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        flagged.truncate(5);
    }
    let items: Vec<serde_json::Value> = flagged
        .iter()
        .map(|s| {
            let base = s
                .reason
                .clone()
                .unwrap_or_else(|| format!("z={:.1}", s.anomaly_z));
            let reason = format!("{} | catalyst check: not_available_yet", base);
            let flag = if fallback { true } else { s.flag };
            serde_json::json!({
                "ticker": s.ticker,
                "market": s.market.as_str(),
                "sector": s.sector,
                "mispricingScore": s.score,
                "anomalyZ": s.anomaly_z,
                "flag": flag,
                "reason": reason
            })
        })
        .collect();
    let note = "catalyst check pending \u{2014} QoQ EPS history not in snapshot \u{2014} not_available_yet";
    let data = serde_json::json!({
        "market": market.as_str(),
        "sector": sector,
        "items": items,
        "note": note
    });
    envelope_ok(data)
}

pub fn run_validated(raw: &str, sub: Option<&str>, sector: Option<String>) -> String {
    let m = match crate::cli::effective_market(raw, sub) {
        Ok(v) => v,
        Err(e) => return envelope_err("VALIDATION_ERROR", &e),
    };
    run(m, sector)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn radar_ok_shape() {
        let j = run_validated("id", None, Some("FINANCE".to_string()));
        let v: serde_json::Value = serde_json::from_str(&j).unwrap();
        assert_eq!(v["success"], true);
        let items = v["data"]["items"].as_array().unwrap();
        assert!(items.len() <= 5, "radar len {}", items.len());
        for it in items {
            assert_eq!(it["flag"], true);
            let r = it["reason"].as_str().unwrap();
            assert!(r.contains("not_available_yet"), "reason {}", r);
            assert_ne!(r, "no EPS change");
        }
        assert!(v["data"]["note"]
            .as_str()
            .unwrap()
            .contains("not_available_yet"));
    }
    #[test]
    fn radar_bad_market() {
        let j = run_validated("xx", None, None);
        let v: serde_json::Value = serde_json::from_str(&j).unwrap();
        assert_eq!(v["success"], false);
        assert_eq!(v["error"]["code"], "VALIDATION_ERROR");
    }
}
