use crate::cli::{envelope_err, envelope_ok, normalize_ticker};
use seith_core::dossier::{compose, to_pdf_bytes, KronosSection, ResearchSection};
use seith_core::market::Market;
use seith_core::models::TICKER_RE;
use seith_core::scoring::components::Components;

pub fn run_json(market: Market, ticker_raw: &str) -> String {
    let t = normalize_ticker(ticker_raw);
    if !TICKER_RE.is_match(&t) {
        return envelope_err("VALIDATION_ERROR", &format!("invalid ticker '{}'", t));
    }
    let d = compose(
        t.clone(),
        market,
        80.0,
        Components {
            expected_return: 50.0,
            anomaly_z: 50.0,
            quality_value: 50.0,
            sector_mom: 50.0,
        },
        vec![],
        KronosSection {
            forecast_return: 0.01,
            volatility: 0.02,
            chart_points: vec![],
        },
        ResearchSection {
            fundamental_memo: "fund".into(),
            technical_memo: "tech".into(),
            synthesizer_memo: "synth".into(),
        },
    );
    envelope_ok(&d)
}

pub fn run_pdf(market: Market, ticker_raw: &str) -> Vec<u8> {
    let t = normalize_ticker(ticker_raw);
    let d = compose(
        t,
        market,
        80.0,
        Components {
            expected_return: 50.0,
            anomaly_z: 50.0,
            quality_value: 50.0,
            sector_mom: 50.0,
        },
        vec![],
        KronosSection {
            forecast_return: 0.01,
            volatility: 0.02,
            chart_points: vec![],
        },
        ResearchSection {
            fundamental_memo: "fund".into(),
            technical_memo: "tech".into(),
            synthesizer_memo: "synth".into(),
        },
    );
    to_pdf_bytes(&d)
}

pub fn run_validated(raw: &str, sub: Option<&str>, ticker: String, pdf: bool) -> Vec<u8> {
    let m = match crate::cli::effective_market(raw, sub) {
        Ok(v) => v,
        Err(e) => return envelope_err("VALIDATION_ERROR", &e).into_bytes(),
    };
    let t = normalize_ticker(&ticker);
    if !TICKER_RE.is_match(&t) {
        return envelope_err("VALIDATION_ERROR", &format!("invalid ticker '{}'", t)).into_bytes();
    }
    if pdf {
        run_pdf(m, &ticker)
    } else {
        run_json(m, &ticker).into_bytes()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn dossier_json_ok() {
        let j = String::from_utf8(run_validated("id", None, "BBCA.JK".to_string(), false)).unwrap();
        let v: serde_json::Value = serde_json::from_str(&j).unwrap();
        assert_eq!(v["data"]["ticker"], "BBCA");
        assert!(v["data"]["disclaimer"].as_str().unwrap().contains("Bukan"));
    }
    #[test]
    fn dossier_pdf() {
        let b = run_validated("id", None, "BBCA.JK".to_string(), true);
        assert!(b.starts_with(b"%PDF"));
    }
    #[test]
    fn dossier_bad_market() {
        let b = run_validated("xx", None, "BBCA".to_string(), false);
        let v: serde_json::Value = serde_json::from_str(&String::from_utf8(b).unwrap()).unwrap();
        assert_eq!(v["error"]["code"], "VALIDATION_ERROR");
    }
}
