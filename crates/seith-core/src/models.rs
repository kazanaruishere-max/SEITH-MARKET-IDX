use chrono::{DateTime, Utc};
use once_cell::sync::Lazy;
use regex::Regex;
use serde::{Deserialize, Serialize};
use validator::Validate;

use crate::market::Market;

pub static TICKER_RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"^[A-Z0-9]{3,6}$").unwrap());

#[derive(Debug, Clone, Serialize, Deserialize, Validate, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct OhlcvRow {
    #[validate(regex(path = *TICKER_RE))]
    pub ticker: String,
    pub market: Market,
    pub date: DateTime<Utc>,
    pub open: f64,
    pub high: f64,
    pub low: f64,
    pub close: f64,
    pub volume: Option<f64>,
    pub amount: Option<f64>,
    pub x_timestamp: Option<i64>,
    pub y_timestamp: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct Fundamentals {
    #[validate(regex(path = *TICKER_RE))]
    pub ticker: String,
    pub market: Market,
    pub sector: String,
    pub roe: Option<f64>,
    pub margin: Option<f64>,
    pub leverage: Option<f64>,
    pub pe: Option<f64>,
    pub pb: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct SectorMedian {
    pub roe: f64,
    pub margin: f64,
    pub leverage: f64,
    pub pe: f64,
    pub pb: f64,
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;

    fn utc(y: i32, m: u32, d: u32) -> DateTime<Utc> {
        Utc.with_ymd_and_hms(y, m, d, 0, 0, 0).unwrap()
    }

    #[test]
    fn ohlcv_round_trip() {
        let row = OhlcvRow {
            ticker: "BBCA".to_string(),
            market: Market::Id,
            date: utc(2024, 1, 2),
            open: 9510.0,
            high: 9520.0,
            low: 9483.0,
            close: 9493.0,
            volume: Some(1001000.0),
            amount: Some(9502493000.0),
            x_timestamp: Some(1704153600),
            y_timestamp: Some(1704240000),
        };
        let s = serde_json::to_string(&row).unwrap();
        let d: OhlcvRow = serde_json::from_str(&s).unwrap();
        assert_eq!(d, row);
        assert!(d.validate().is_ok());
    }

    #[test]
    fn ohlcv_deny_unknown_fields() {
        let json = r#"{"ticker":"BBCA","market":"id","date":"2024-01-02T00:00:00Z","open":1,"high":1,"low":1,"close":1,"unknown":1}"#;
        assert!(serde_json::from_str::<OhlcvRow>(json).is_err());
    }

    #[test]
    fn ohlcv_ticker_reject_short() {
        let row = OhlcvRow {
            ticker: "ab".to_string(),
            market: Market::Id,
            date: utc(2024, 1, 2),
            open: 1.0,
            high: 1.0,
            low: 1.0,
            close: 1.0,
            volume: None,
            amount: None,
            x_timestamp: None,
            y_timestamp: None,
        };
        assert!(row.validate().is_err());
    }

    #[test]
    fn ohlcv_ticker_reject_lowercase() {
        let row = OhlcvRow {
            ticker: "bbca".to_string(),
            market: Market::Id,
            date: utc(2024, 1, 2),
            open: 1.0,
            high: 1.0,
            low: 1.0,
            close: 1.0,
            volume: None,
            amount: None,
            x_timestamp: None,
            y_timestamp: None,
        };
        assert!(row.validate().is_err());
    }

    #[test]
    fn fundamentals_round_trip() {
        let f = Fundamentals {
            ticker: "BBCA".to_string(),
            market: Market::Sg,
            sector: "FINANCE".to_string(),
            roe: Some(0.12),
            margin: Some(0.18),
            leverage: Some(0.45),
            pe: Some(14.2),
            pb: Some(1.8),
        };
        let s = serde_json::to_string(&f).unwrap();
        let d: Fundamentals = serde_json::from_str(&s).unwrap();
        assert_eq!(d, f);
        assert!(d.validate().is_ok());
    }

    #[test]
    fn fundamentals_deny_unknown() {
        let json = r#"{"ticker":"BBCA","market":"id","sector":"FINANCE","unknown":1}"#;
        assert!(serde_json::from_str::<Fundamentals>(json).is_err());
    }

    #[test]
    fn sector_median_round_trip() {
        let m = SectorMedian {
            roe: 0.12,
            margin: 0.18,
            leverage: 0.45,
            pe: 14.2,
            pb: 1.8,
        };
        let s = serde_json::to_string(&m).unwrap();
        let d: SectorMedian = serde_json::from_str(&s).unwrap();
        assert_eq!(d, m);
    }

    #[test]
    fn ohlcv_date_utc_aware() {
        let row = OhlcvRow {
            ticker: "BBCA".to_string(),
            market: Market::Id,
            date: utc(2024, 6, 1),
            open: 9500.0,
            high: 9600.0,
            low: 9400.0,
            close: 9550.0,
            volume: None,
            amount: None,
            x_timestamp: None,
            y_timestamp: None,
        };
        let s = serde_json::to_string(&row).unwrap();
        assert!(s.contains("2024-06-01"));
        let d: OhlcvRow = serde_json::from_str(&s).unwrap();
        assert_eq!(d.date, row.date);
    }

    #[test]
    fn ticker_valid_boundaries() {
        for t in ["A12", "ABCDEF", "BBCA", "123456"] {
            let row = OhlcvRow {
                ticker: t.to_string(),
                market: Market::Id,
                date: utc(2024, 1, 2),
                open: 1.0,
                high: 1.0,
                low: 1.0,
                close: 1.0,
                volume: None,
                amount: None,
                x_timestamp: None,
                y_timestamp: None,
            };
            assert!(row.validate().is_ok(), "ticker {t} should pass");
        }
        for t in ["AB", "ABCDEFG", "AB-C", ""] {
            let row = OhlcvRow {
                ticker: t.to_string(),
                market: Market::Id,
                date: utc(2024, 1, 2),
                open: 1.0,
                high: 1.0,
                low: 1.0,
                close: 1.0,
                volume: None,
                amount: None,
                x_timestamp: None,
                y_timestamp: None,
            };
            assert!(row.validate().is_err(), "ticker {t} should fail");
        }
    }
}
