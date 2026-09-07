use crate::market::Market;
use crate::scoring::components::Components;
use serde::{Deserialize, Serialize};

pub const DISCLAIMER: &str = "Bukan rekomendasi investasi. Informasi & analisis saja.";

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PeerEntry {
    pub ticker: String,
    pub score: f32,
    pub market: Market,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct KronosSection {
    pub forecast_return: f64,
    pub volatility: f64,
    pub chart_points: Vec<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ResearchSection {
    pub fundamental_memo: String,
    pub technical_memo: String,
    pub synthesizer_memo: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Dossier {
    pub ticker: String,
    pub market: Market,
    pub score: f32,
    pub breakdown: Components,
    pub peer_comparison: Vec<PeerEntry>,
    pub kronos: KronosSection,
    pub research: ResearchSection,
    pub degraded: bool,
    pub disclaimer: String,
}

pub fn compose(
    ticker: String,
    market: Market,
    score: f32,
    breakdown: Components,
    peers: Vec<PeerEntry>,
    kronos: KronosSection,
    research: ResearchSection,
) -> Dossier {
    Dossier {
        ticker,
        market,
        score,
        breakdown,
        peer_comparison: peers,
        kronos,
        research,
        degraded: false,
        disclaimer: DISCLAIMER.to_string(),
    }
}

pub fn to_pdf_bytes(d: &Dossier) -> Vec<u8> {
    let body = format!(
        "BT /F1 12 Tf 50 750 Td (SEITH Dossier {} {} {:.1}) Tj ET\nBT 50 730 Td ({}) Tj ET\n",
        d.ticker,
        d.market.as_str(),
        d.score,
        d.disclaimer
    );
    let mut out = Vec::new();
    out.extend_from_slice(b"%PDF-1.4\n");
    out.extend_from_slice(
        format!(
            "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >> endobj\n4 0 obj << /Length {} >> stream\n",
            body.len()
        )
        .as_bytes(),
    );
    out.extend_from_slice(body.as_bytes());
    out.extend_from_slice(b"\nendstream endobj\nxref\n0 5\n0000000000 65535 f \ntrailer << /Root 1 0 R /Size 5 >>\nstartxref\n0\n%%EOF");
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn compose_always_has_disclaimer() {
        let d = compose(
            "BBCA".to_string(),
            Market::Id,
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
                fundamental_memo: "a".into(),
                technical_memo: "b".into(),
                synthesizer_memo: "c".into(),
            },
        );
        assert_eq!(d.disclaimer, DISCLAIMER);
    }
    #[test]
    fn pdf_starts_with_header() {
        let d = compose(
            "BBCA".to_string(),
            Market::Id,
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
                fundamental_memo: "a".into(),
                technical_memo: "b".into(),
                synthesizer_memo: "c".into(),
            },
        );
        assert!(to_pdf_bytes(&d).starts_with(b"%PDF"));
    }
    #[test]
    fn compose_market_preserved() {
        let d = compose(
            "DBS".to_string(),
            Market::Sg,
            70.0,
            Components {
                expected_return: 50.0,
                anomaly_z: 50.0,
                quality_value: 50.0,
                sector_mom: 50.0,
            },
            vec![],
            KronosSection {
                forecast_return: 0.0,
                volatility: 0.0,
                chart_points: vec![],
            },
            ResearchSection {
                fundamental_memo: "".into(),
                technical_memo: "".into(),
                synthesizer_memo: "".into(),
            },
        );
        assert_eq!(d.market, Market::Sg);
    }
}
