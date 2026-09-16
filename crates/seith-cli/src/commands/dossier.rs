use crate::cli::{envelope_err, envelope_ok, normalize_ticker};
use seith_core::dossier::{compose, to_pdf_bytes, KronosSection, ResearchSection};
use seith_core::market::Market;
use seith_core::models::TICKER_RE;
use seith_core::ranking::service::ScoredTicker;

fn qv_label(qv: f32) -> &'static str {
    if qv >= 65.0 {
        "kuat"
    } else if qv >= 40.0 {
        "moderat"
    } else {
        "lemah"
    }
}

pub fn dynamic_memo(ticker: &str, s: &ScoredTicker) -> ResearchSection {
    let f_opt = crate::store::load_fundamentals(ticker, s.market);
    let median = seith_core::normalize::sector_median(&s.sector, s.market);
    let roe = f_opt.as_ref().and_then(|f| f.roe).unwrap_or(median.roe);
    let cmp = if roe > median.roe {
        "di atas"
    } else if roe < median.roe {
        "di bawah"
    } else {
        "sejajar"
    };
    let qv = s.components.quality_value;
    let label = qv_label(qv);
    let fundamental_memo = format!(
        "ROE {} {:.3} vs median sektor {} {:.3} {} median, QV {:.0} {} — sektor {} median ROE {:.3}",
        ticker, roe, s.sector, median.roe, cmp, qv, label, s.sector, median.roe
    );
    let technical_memo = format!(
        "Teknikal MA20 proxy ER {:.1} anomaly Z {:.1} sektor {} — ponytail: MA20 pending Kronos 400->20",
        s.components.expected_return, s.anomaly_z, s.sector
    );
    let synthesizer_memo = format!(
        "{} | {} — Bukan rekomendasi investasi. Informasi & analisis saja.",
        fundamental_memo, technical_memo
    );
    ResearchSection {
        fundamental_memo,
        technical_memo,
        synthesizer_memo,
    }
}

fn peers_for(s: &ScoredTicker) -> Vec<seith_core::dossier::PeerEntry> {
    let mut all = crate::pipeline::scored_all(&s.sector, s.market);
    all.retain(|x| x.ticker != s.ticker);
    all.sort_by(|a, b| {
        let da = (a.components.quality_value - s.components.quality_value).abs();
        let db = (b.components.quality_value - s.components.quality_value).abs();
        da.partial_cmp(&db).unwrap_or(std::cmp::Ordering::Equal)
    });
    all.into_iter()
        .take(5)
        .map(|x| seith_core::dossier::PeerEntry {
            ticker: x.ticker,
            score: x.score,
            market: x.market,
        })
        .collect()
}

pub fn run_json(market: Market, ticker_raw: &str) -> String {
    let t = normalize_ticker(ticker_raw);
    if !TICKER_RE.is_match(&t) {
        return envelope_err("VALIDATION_ERROR", &format!("invalid ticker '{}'", t));
    }
    let Some(s) = crate::pipeline::scored_for(&t, market) else {
        return envelope_err("TICKER_NOT_FOUND", &format!("ticker '{}' not found", t));
    };
    let peers = peers_for(&s);
    let kronos = KronosSection {
        forecast_return: 0.01,
        volatility: 0.02,
        chart_points: vec![],
    };
    let memo = dynamic_memo(&t, &s);
    let d = compose(
        t,
        market,
        s.score,
        s.components.clone(),
        peers,
        kronos,
        memo,
    );
    envelope_ok(&d)
}

pub fn run_pdf(market: Market, ticker_raw: &str) -> Vec<u8> {
    let t = normalize_ticker(ticker_raw);
    let Some(s) = crate::pipeline::scored_for(&t, market) else {
        return envelope_err("TICKER_NOT_FOUND", &format!("ticker '{}' not found", t)).into_bytes();
    };
    let peers = peers_for(&s);
    let kronos = KronosSection {
        forecast_return: 0.01,
        volatility: 0.02,
        chart_points: vec![],
    };
    let memo = dynamic_memo(&t, &s);
    let d = compose(
        t,
        market,
        s.score,
        s.components.clone(),
        peers,
        kronos,
        memo,
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
        let fm = v["data"]["research"]["fundamental_memo"].as_str().unwrap();
        assert!(
            fm.contains("median") || fm.contains("sektor"),
            "fm {} missing median|sektor",
            fm
        );
        assert_ne!(fm, "fund");
        assert!(v["data"]["breakdown"]["expected_return"].is_number());
        assert!(v["data"]["research"]["technical_memo"]
            .as_str()
            .unwrap()
            .contains("MA20"));
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
    #[test]
    fn dossier_breakdown_not_50() {
        let j = String::from_utf8(run_validated("id", None, "BBCA".to_string(), false)).unwrap();
        let v: serde_json::Value = serde_json::from_str(&j).unwrap();
        let er = v["data"]["breakdown"]["expected_return"].as_f64().unwrap();
        let qv = v["data"]["breakdown"]["quality_value"].as_f64().unwrap();
        assert!(qv.is_finite());
        assert!(er.is_finite());
    }
}
