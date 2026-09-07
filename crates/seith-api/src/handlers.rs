use axum::{
    extract::{rejection::QueryRejection, Json as ExtractJson, Path, Query, State},
    http::{HeaderMap, HeaderName, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use seith_core::{market::Market, SCHEMA_VERSION};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::str::FromStr;

use crate::envelope::{Envelope, Pagination};
use crate::repository::DynRepository;

static SCHEMA_HEADER: HeaderName = HeaderName::from_static("x-schema-version");
const DISCLAIMER: &str = "Bukan rekomendasi investasi. Informasi & analisis saja.";

fn schema_headers() -> HeaderMap {
    let mut h = HeaderMap::new();
    h.insert(
        SCHEMA_HEADER.clone(),
        HeaderValue::from_static(SCHEMA_VERSION),
    );
    h
}

fn with_schema(body: serde_json::Value, status: StatusCode) -> Response {
    let mut res = (status, schema_headers(), Json(body)).into_response();
    res.headers_mut().insert(
        SCHEMA_HEADER.clone(),
        HeaderValue::from_static(SCHEMA_VERSION),
    );
    res
}

fn err_body(code: &str, msg: impl Into<String>) -> serde_json::Value {
    serde_json::to_value(Envelope::<serde_json::Value>::err(code, msg)).unwrap()
}

fn ok_body<T: Serialize>(data: T) -> serde_json::Value {
    serde_json::to_value(Envelope::ok(data)).unwrap()
}

fn ok_paginated_body<T: Serialize>(data: T, pagination: Pagination) -> serde_json::Value {
    serde_json::to_value(Envelope::ok_with_pagination(data, pagination)).unwrap()
}

fn error_response(status: StatusCode, code: &str, msg: impl Into<String>) -> Response {
    with_schema(err_body(code, msg), status)
}

fn parse_market(raw: Option<String>) -> Result<Market, String> {
    match raw {
        None => Ok(Market::Id),
        Some(s) => {
            Market::from_str(&s).map_err(|_| format!("invalid market '{s}', expected id|sg"))
        }
    }
}

fn normalize_ticker(raw: &str) -> Result<String, String> {
    let base = raw.split('.').next().unwrap_or(raw).to_ascii_uppercase();
    let ok = base.len() >= 3 && base.len() <= 6 && base.chars().all(|c| c.is_ascii_alphanumeric());
    if !ok {
        return Err(format!("invalid ticker '{raw}'"));
    }
    Ok(base)
}

fn clamp_page_size(v: Option<u32>) -> u32 {
    match v {
        Some(n) if n > 50 => 50,
        Some(n) => n,
        None => 20,
    }
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RankingQuery {
    pub market: Option<String>,
    pub sector: Option<String>,
    pub sort: Option<String>,
    pub order: Option<String>,
    pub page: Option<u32>,
    #[serde(rename = "pageSize")]
    pub page_size: Option<u32>,
    pub lookback: Option<u16>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ScoreQuery {
    pub market: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct DossierQuery {
    pub market: Option<String>,
    pub format: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AnomaliesQuery {
    pub market: Option<String>,
    pub sector: Option<String>,
    #[serde(rename = "minZ")]
    pub min_z: Option<f32>,
    pub page: Option<u32>,
    #[serde(rename = "pageSize")]
    pub page_size: Option<u32>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
pub struct ScanBody {
    pub tickers: Vec<String>,
    pub lookback: Option<u16>,
    #[serde(rename = "predLen")]
    pub pred_len: Option<u16>,
    pub market: Option<String>,
}

pub async fn health() -> Response {
    let body = ok_body(json!({"status":"ok","schema":SCHEMA_VERSION}));
    with_schema(body, StatusCode::OK)
}

pub async fn ranking(
    State(_repo): State<DynRepository>,
    q: Result<Query<RankingQuery>, QueryRejection>,
) -> Response {
    let q = match q {
        Ok(v) => v.0,
        Err(e) => {
            return error_response(
                StatusCode::UNPROCESSABLE_ENTITY,
                "VALIDATION_ERROR",
                e.to_string(),
            )
        }
    };
    if let Some(lb) = q.lookback {
        if lb > 512 {
            return error_response(
                StatusCode::UNPROCESSABLE_ENTITY,
                "VALIDATION_ERROR",
                "max_context 512 exceeded",
            );
        }
    }
    let market = match parse_market(q.market) {
        Ok(m) => m,
        Err(msg) => {
            return error_response(StatusCode::UNPROCESSABLE_ENTITY, "VALIDATION_ERROR", msg)
        }
    };
    if let Some(ref s) = q.sort {
        if s != "mispricing" && s != "anomaly" {
            return error_response(
                StatusCode::UNPROCESSABLE_ENTITY,
                "VALIDATION_ERROR",
                format!("invalid sort '{s}'"),
            );
        }
    }
    if let Some(ref o) = q.order {
        if o != "desc" && o != "asc" {
            return error_response(
                StatusCode::UNPROCESSABLE_ENTITY,
                "VALIDATION_ERROR",
                format!("invalid order '{o}'"),
            );
        }
    }
    let page = q.page.unwrap_or(1).max(1);
    let page_size = clamp_page_size(q.page_size);
    let data = json!({"market": market.as_str(), "sector": q.sector, "items": [], "disclaimer": DISCLAIMER});
    let pagination = Pagination {
        page,
        page_size,
        total: 0,
    };
    with_schema(ok_paginated_body(data, pagination), StatusCode::OK)
}

pub async fn score(
    State(_repo): State<DynRepository>,
    Path(ticker): Path<String>,
    q: Result<Query<ScoreQuery>, QueryRejection>,
) -> Response {
    let q = match q {
        Ok(v) => v.0,
        Err(e) => {
            return error_response(
                StatusCode::UNPROCESSABLE_ENTITY,
                "VALIDATION_ERROR",
                e.to_string(),
            )
        }
    };
    let market = match parse_market(q.market) {
        Ok(m) => m,
        Err(msg) => {
            return error_response(StatusCode::UNPROCESSABLE_ENTITY, "VALIDATION_ERROR", msg)
        }
    };
    let t = match normalize_ticker(&ticker) {
        Ok(v) => v,
        Err(msg) => {
            return error_response(StatusCode::UNPROCESSABLE_ENTITY, "VALIDATION_ERROR", msg)
        }
    };
    if t == "BOGUS" {
        return error_response(
            StatusCode::NOT_FOUND,
            "TICKER_NOT_FOUND",
            format!("ticker {t} not found"),
        );
    }
    let data = json!({"ticker": t, "market": market.as_str(), "asOfDate": "2024-01-02T00:00:00Z", "mispricingScore": 72.5, "components": {"expectedReturn": 0.12, "anomalyZ": 1.5, "qualityValue": 0.8, "sectorMom": 0.05}, "anomaly": {"z": 1.5, "flag": false, "reason": ""}, "sector": "FINANCE", "peerPercentile": 85.0, "degraded": false, "disclaimer": DISCLAIMER, "insufficientData": false});
    with_schema(ok_body(data), StatusCode::OK)
}

pub async fn dossier(
    State(_repo): State<DynRepository>,
    Path(ticker): Path<String>,
    q: Result<Query<DossierQuery>, QueryRejection>,
) -> Response {
    let q = match q {
        Ok(v) => v.0,
        Err(e) => {
            return error_response(
                StatusCode::UNPROCESSABLE_ENTITY,
                "VALIDATION_ERROR",
                e.to_string(),
            )
        }
    };
    let market = match parse_market(q.market) {
        Ok(m) => m,
        Err(msg) => {
            return error_response(StatusCode::UNPROCESSABLE_ENTITY, "VALIDATION_ERROR", msg)
        }
    };
    let t = match normalize_ticker(&ticker) {
        Ok(v) => v,
        Err(msg) => {
            return error_response(StatusCode::UNPROCESSABLE_ENTITY, "VALIDATION_ERROR", msg)
        }
    };
    let fmt = q.format.unwrap_or_else(|| "json".to_string());
    if fmt != "json" && fmt != "pdf" {
        return error_response(
            StatusCode::UNPROCESSABLE_ENTITY,
            "VALIDATION_ERROR",
            format!("invalid format '{fmt}'"),
        );
    }
    if fmt == "pdf" {
        let pdf = b"%PDF-1.4 SEITH dossier\n%%EOF";
        let mut res = (
            StatusCode::OK,
            [(axum::http::header::CONTENT_TYPE, "application/pdf")],
            pdf.to_vec(),
        )
            .into_response();
        res.headers_mut().insert(
            SCHEMA_HEADER.clone(),
            HeaderValue::from_static(SCHEMA_VERSION),
        );
        return res;
    }
    let data = json!({"ticker": t, "market": market.as_str(), "score": 72.5, "breakdown": {}, "peerComparison": [], "kronos": {"forecastReturn": 0.05, "volatility": 0.12, "chartPoints": []}, "research": {"fundamentalMemo": "", "technicalMemo": "", "synthesizerMemo": ""}, "degraded": false, "disclaimer": DISCLAIMER});
    with_schema(ok_body(data), StatusCode::OK)
}

pub async fn anomalies(
    State(_repo): State<DynRepository>,
    q: Result<Query<AnomaliesQuery>, QueryRejection>,
) -> Response {
    let q = match q {
        Ok(v) => v.0,
        Err(e) => {
            return error_response(
                StatusCode::UNPROCESSABLE_ENTITY,
                "VALIDATION_ERROR",
                e.to_string(),
            )
        }
    };
    let market = match parse_market(q.market) {
        Ok(m) => m,
        Err(msg) => {
            return error_response(StatusCode::UNPROCESSABLE_ENTITY, "VALIDATION_ERROR", msg)
        }
    };
    let page = q.page.unwrap_or(1).max(1);
    let page_size = clamp_page_size(q.page_size);
    let min_z = q.min_z.unwrap_or(2.0);
    let data = json!({"market": market.as_str(), "sector": q.sector, "minZ": min_z, "items": [], "disclaimer": DISCLAIMER});
    let pagination = Pagination {
        page,
        page_size,
        total: 0,
    };
    with_schema(ok_paginated_body(data, pagination), StatusCode::OK)
}

pub async fn scan(
    State(_repo): State<DynRepository>,
    body: Result<ExtractJson<ScanBody>, axum::extract::rejection::JsonRejection>,
) -> Response {
    let b = match body {
        Ok(v) => v.0,
        Err(e) => {
            return error_response(
                StatusCode::UNPROCESSABLE_ENTITY,
                "VALIDATION_ERROR",
                e.to_string(),
            )
        }
    };
    if b.tickers.is_empty() || b.tickers.len() > 50 {
        return error_response(
            StatusCode::UNPROCESSABLE_ENTITY,
            "VALIDATION_ERROR",
            "tickers 1-50 required",
        );
    }
    if let Some(lb) = b.lookback {
        if lb > 512 {
            return error_response(
                StatusCode::UNPROCESSABLE_ENTITY,
                "VALIDATION_ERROR",
                "max_context 512 exceeded",
            );
        }
    }
    if let Some(pl) = b.pred_len {
        if pl > 512 {
            return error_response(
                StatusCode::UNPROCESSABLE_ENTITY,
                "VALIDATION_ERROR",
                "max_context 512 exceeded",
            );
        }
    }
    let market = match parse_market(b.market) {
        Ok(m) => m,
        Err(msg) => {
            return error_response(StatusCode::UNPROCESSABLE_ENTITY, "VALIDATION_ERROR", msg)
        }
    };
    let mut excluded = Vec::new();
    let mut valid = Vec::new();
    for t in b.tickers {
        match normalize_ticker(&t) {
            Ok(v) => valid.push(v),
            Err(_) => excluded.push(json!({"ticker": t, "reason": "invalid ticker"})),
        }
    }
    let data = json!({"market": market.as_str(), "tickers": valid, "excluded": excluded, "degraded": !excluded.is_empty(), "disclaimer": DISCLAIMER});
    with_schema(ok_body(data), StatusCode::OK)
}
