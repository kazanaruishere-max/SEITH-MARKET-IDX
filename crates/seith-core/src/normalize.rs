use std::collections::HashMap;

use once_cell::sync::Lazy;

use crate::market::Market;
use crate::models::{Excluded, Fundamentals, OhlcvRow, SectorMedian};

#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
#[error("{message}")]
pub struct ValidationError {
    pub code: String,
    pub message: String,
}

pub fn is_missing_ohlc(row: &OhlcvRow) -> bool {
    let vals = [row.open, row.high, row.low, row.close];
    vals.iter().any(|v| *v == 0.0 || !v.is_finite())
}

pub fn cleanse_ohlcv(rows: Vec<OhlcvRow>) -> CleansedBatch {
    let mut cleaned = Vec::new();
    let mut excluded = Vec::new();
    for mut r in rows {
        if is_missing_ohlc(&r) {
            tracing::warn!(ticker = %r.ticker, reason = "missing_ohlc", "exclude ohlc missing");
            excluded.push(Excluded {
                ticker: r.ticker.clone(),
                reason: "missing_ohlc".to_string(),
            });
            continue;
        }
        if r.volume.is_none() {
            r.volume = Some(0.0);
        }
        if r.amount.is_none() {
            r.amount = Some(0.0);
        }
        let ts = r.date.timestamp();
        r.x_timestamp = Some(ts);
        r.y_timestamp = Some(ts + 86400);
        cleaned.push(r);
    }
    let insufficient = !excluded.is_empty();
    CleansedBatch {
        rows: cleaned,
        excluded,
        insufficient_data: insufficient,
    }
}

#[derive(Debug, Clone)]
pub struct CleansedBatch {
    pub rows: Vec<OhlcvRow>,
    pub excluded: Vec<Excluded>,
    pub insufficient_data: bool,
}

pub fn cleanse_fundamentals(mut f: Fundamentals, median: &SectorMedian) -> (Fundamentals, bool) {
    let mut flag = false;
    if f.roe.is_none() {
        f.roe = Some(median.roe);
        flag = true;
    }
    if f.margin.is_none() {
        f.margin = Some(median.margin);
        flag = true;
    }
    if f.leverage.is_none() {
        f.leverage = Some(median.leverage);
        flag = true;
    }
    if f.pe.is_none() {
        f.pe = Some(median.pe);
        flag = true;
    }
    if f.pb.is_none() {
        f.pb = Some(median.pb);
        flag = true;
    }
    let fallback = f.roe.is_some() && median.roe == 0.0;
    let insufficient = flag || fallback;
    (f, insufficient)
}

static MEDIAN_MAP: Lazy<HashMap<(Market, String), SectorMedian>> = Lazy::new(|| {
    let raw = include_str!("../../../tests/fixtures/sector-median.json");
    let parsed: HashMap<String, HashMap<String, SectorMedian>> =
        serde_json::from_str(raw).expect("sector-median.json parse");
    let mut out = HashMap::new();
    for (mk, inner) in parsed {
        let market = if mk == "id" { Market::Id } else { Market::Sg };
        for (sector, median) in inner {
            out.insert((market, sector), median);
        }
    }
    out
});

pub fn sector_median(sector: &str, market: Market) -> SectorMedian {
    MEDIAN_MAP
        .get(&(market, sector.to_string()))
        .cloned()
        .unwrap_or(SectorMedian {
            roe: 0.0,
            margin: 0.0,
            leverage: 0.0,
            pe: 0.0,
            pb: 0.0,
        })
}

pub fn validate_lookback(lookback: usize, pred_len: usize) -> Result<(), ValidationError> {
    if lookback > 512 || pred_len > 512 || lookback + pred_len > 512 {
        return Err(ValidationError {
            code: "VALIDATION_ERROR".to_string(),
            message: "max_context 512".to_string(),
        });
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::market::Market;
    use crate::models::{Fundamentals, OhlcvRow};
    use chrono::{TimeZone, Utc};

    fn utc(y: i32, m: u32, d: u32) -> chrono::DateTime<Utc> {
        Utc.with_ymd_and_hms(y, m, d, 0, 0, 0)
            .single()
            .expect("utc")
    }

    fn row_with(ticker: &str, open: f64, volume: Option<f64>) -> OhlcvRow {
        OhlcvRow {
            ticker: ticker.to_string(),
            market: Market::Id,
            date: utc(2024, 6, 1),
            open,
            high: 9600.0,
            low: 9400.0,
            close: 9550.0,
            volume,
            amount: None,
            x_timestamp: None,
            y_timestamp: None,
        }
    }

    #[test]
    fn is_missing_ohlc_detects_zero_and_nan() {
        assert!(is_missing_ohlc(&row_with("BBCA", 0.0, Some(1.0))));
        let mut r = row_with("BBCA", 9500.0, Some(1.0));
        r.open = f64::NAN;
        assert!(is_missing_ohlc(&r));
        assert!(!is_missing_ohlc(&row_with("BBCA", 9500.0, Some(1.0))));
    }

    #[test]
    fn cleanse_volume_null_to_zero() {
        let rows = vec![row_with("BBCA", 9500.0, None)];
        let out = cleanse_ohlcv(rows);
        assert_eq!(out.rows.len(), 1);
        assert_eq!(out.rows[0].volume, Some(0.0));
        assert_eq!(out.rows[0].amount, Some(0.0));
        assert!(out.excluded.is_empty());
    }

    #[test]
    fn cleanse_missing_ohlc_excluded() {
        let rows = vec![row_with("BBCA", 0.0, Some(1.0))];
        let out = cleanse_ohlcv(rows);
        assert_eq!(out.rows.len(), 0);
        assert_eq!(out.excluded.len(), 1);
        assert_eq!(out.excluded[0].reason, "missing_ohlc");
    }

    #[test]
    fn cleanse_illiquid_fixture() {
        let rows = vec![row_with("BBCA", 9500.0, None), row_with("EXCL", 0.0, None)];
        let out = cleanse_ohlcv(rows);
        assert_eq!(out.rows.len(), 1);
        assert_eq!(out.excluded.len(), 1);
        assert_eq!(out.excluded[0].ticker, "EXCL");
    }

    #[test]
    fn x_y_timestamp_derived() {
        let rows = vec![row_with("BBCA", 9500.0, Some(1.0))];
        let out = cleanse_ohlcv(rows);
        let r = &out.rows[0];
        let ts = r.date.timestamp();
        assert_eq!(r.x_timestamp, Some(ts));
        assert_eq!(r.y_timestamp, Some(ts + 86400));
    }

    #[test]
    fn cleanse_missing_roe_median() {
        let f = Fundamentals {
            ticker: "BBCA".to_string(),
            market: Market::Id,
            sector: "FINANCE".to_string(),
            roe: None,
            margin: Some(0.1),
            leverage: Some(0.5),
            pe: Some(10.0),
            pb: Some(1.0),
        };
        let median = sector_median("FINANCE", Market::Id);
        let (out, flag) = cleanse_fundamentals(f, &median);
        assert!(out.roe.is_some());
        assert!(flag);
        assert_eq!(out.roe.expect("roe"), median.roe);
    }

    #[test]
    fn sector_median_id_vs_sg_different() {
        let id = sector_median("FINANCE", Market::Id);
        let sg = sector_median("FINANCE", Market::Sg);
        assert_ne!(id.roe, sg.roe);
    }

    #[test]
    fn validate_lookback_guard() {
        assert!(validate_lookback(520, 20).is_err());
        assert!(validate_lookback(400, 20).is_ok());
        assert!(validate_lookback(400, 112).is_ok());
        assert!(validate_lookback(500, 13).is_err());
        let e = validate_lookback(520, 20).expect_err("should err");
        assert_eq!(e.code, "VALIDATION_ERROR");
        assert!(e.message.contains("512"));
    }

    #[test]
    fn insufficient_data_flag_on_fallback() {
        let f = Fundamentals {
            ticker: "BBCA".to_string(),
            market: Market::Id,
            sector: "UNKNOWN".to_string(),
            roe: None,
            margin: None,
            leverage: None,
            pe: None,
            pb: None,
        };
        let median = sector_median("UNKNOWN", Market::Id);
        let (_, flag) = cleanse_fundamentals(f, &median);
        assert!(flag);
    }
}
