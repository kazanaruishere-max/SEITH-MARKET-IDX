use axum::{
    extract::{rejection::QueryRejection, Json as ExtractJson, Path, Query, State},
    http::{HeaderMap, HeaderName, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use seith_core::{dossier, market::Market, scoring::components::Components, SCHEMA_VERSION};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::str::FromStr;

use crate::backtest_data as bd;
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
    (status, schema_headers(), Json(body)).into_response()
}

fn err_body(code: &str, msg: impl Into<String>) -> serde_json::Value {
    serde_json::to_value(Envelope::<serde_json::Value>::err(code, msg))
        .unwrap_or_else(|_| json!({"success": false, "error": {"code": "SERIALIZE_ERROR"}}))
}

fn ok_body<T: Serialize>(data: T) -> serde_json::Value {
    serde_json::to_value(Envelope::ok(data))
        .unwrap_or_else(|_| json!({"success": false, "error": {"code": "SERIALIZE_ERROR"}}))
}

fn ok_paginated_body<T: Serialize>(data: T, pagination: Pagination) -> serde_json::Value {
    serde_json::to_value(Envelope::ok_with_pagination(data, pagination))
        .unwrap_or_else(|_| json!({"success": false, "error": {"code": "SERIALIZE_ERROR"}}))
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

fn check_lookback(v: Option<u16>) -> Option<Response> {
    if let Some(n) = v {
        if n > 512 {
            return Some(error_response(
                StatusCode::UNPROCESSABLE_ENTITY,
                "VALIDATION_ERROR",
                "max_context 512 exceeded",
            ));
        }
    }
    None
}

fn check_sort(v: &Option<String>) -> Option<Response> {
    if let Some(s) = v {
        if s != "mispricing" && s != "anomaly" {
            return Some(error_response(
                StatusCode::UNPROCESSABLE_ENTITY,
                "VALIDATION_ERROR",
                format!("invalid sort '{s}'"),
            ));
        }
    }
    None
}

fn check_order(v: &Option<String>) -> Option<Response> {
    if let Some(o) = v {
        if o != "desc" && o != "asc" {
            return Some(error_response(
                StatusCode::UNPROCESSABLE_ENTITY,
                "VALIDATION_ERROR",
                format!("invalid order '{o}'"),
            ));
        }
    }
    None
}

fn check_format(v: &str) -> Option<Response> {
    if v != "json" && v != "pdf" {
        return Some(error_response(
            StatusCode::UNPROCESSABLE_ENTITY,
            "VALIDATION_ERROR",
            format!("invalid format '{v}'"),
        ));
    }
    None
}

fn check_lang(v: &Option<String>) -> Option<Response> {
    if let Some(s) = v {
        let lower = s.to_ascii_lowercase();
        if lower != "id" && lower != "en" {
            return Some(error_response(
                StatusCode::UNPROCESSABLE_ENTITY,
                "VALIDATION_ERROR",
                format!("invalid lang '{s}'"),
            ));
        }
    }
    None
}

fn normalize_lang(v: Option<String>) -> String {
    v.map(|s| s.to_ascii_lowercase())
        .unwrap_or_else(|| "id".to_string())
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
    pub lang: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct BacktestQuery {
    pub market: Option<String>,
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
    if let Some(r) = check_lookback(q.lookback) {
        return r;
    }
    let market = match parse_market(q.market) {
        Ok(m) => m,
        Err(msg) => {
            return error_response(StatusCode::UNPROCESSABLE_ENTITY, "VALIDATION_ERROR", msg)
        }
    };
    if let Some(r) = check_sort(&q.sort) {
        return r;
    }
    if let Some(r) = check_order(&q.order) {
        return r;
    }
    let page = q.page.unwrap_or(1).max(1);
    let page_size = clamp_page_size(q.page_size);
    let sort = q.sort.unwrap_or_else(|| "mispricing".to_string());
    let order = q.order.unwrap_or_else(|| "desc".to_string());
    let mstr = market.as_str().to_string();
    let (items, total) = match bd::load_backtest_value().await {
        Some(v) => {
            let sel = bd::select_items(&v, &mstr, q.sector.as_deref());
            let sorted = bd::sort_ranking(sel, sort == "anomaly", order == "asc");
            let total = sorted.len() as u64;
            let slice = bd::page_slice(&sorted, page, page_size);
            let base = ((page - 1) * page_size) as usize;
            let mapped: Vec<serde_json::Value> = slice
                .iter()
                .enumerate()
                .map(|(i, it)| bd::to_ranking_item(it, base + i + 1))
                .collect();
            (mapped, total)
        }
        None => (Vec::new(), 0),
    };
    let data = json!({"market": market.as_str(), "sector": q.sector, "sort": sort, "order": order, "items": items, "disclaimer": DISCLAIMER});
    let pagination = Pagination {
        page,
        page_size,
        total,
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
    let mstr = market.as_str().to_string();
    let found = bd::load_backtest_value()
        .await
        .and_then(|v| bd::find_item(&v, &t, &mstr));
    let data = match found {
        Some(it) => {
            json!({"ticker": t, "market": market.as_str(), "asOfDate": "2026-09-08T00:00:00Z", "mispricingScore": bd::f64_of(&it, "mispricingScore"), "components": it.get("components").cloned().unwrap_or(json!({})), "anomaly": it.get("anomaly").cloned().unwrap_or(json!({})), "sector": bd::str_of(&it, "sector"), "close": bd::f64_of(&it, "close"), "rank": it.get("rank").cloned().unwrap_or(json!(0)), "peerPercentile": 85.0, "degraded": false, "disclaimer": DISCLAIMER, "insufficientData": false})
        }
        None => {
            return error_response(
                StatusCode::NOT_FOUND,
                "TICKER_NOT_FOUND",
                format!("ticker {t} not found"),
            )
        }
    };
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
    if let Some(r) = check_lang(&q.lang) {
        return r;
    }
    let lang = normalize_lang(q.lang);
    let fmt = q.format.unwrap_or_else(|| "json".to_string());
    if let Some(r) = check_format(&fmt) {
        return r;
    }
    let mstr = market.as_str().to_string();
    let loaded = bd::load_backtest_value().await;
    let found = loaded.as_ref().and_then(|v| bd::find_item(v, &t, &mstr));
    if fmt == "pdf" {
        let peers = loaded
            .as_ref()
            .zip(found.as_ref())
            .map(|(v, it)| bd::peer_five(v, it))
            .unwrap_or_default();
        return pdf_response(dossier_pdf(&t, market, found.as_ref(), peers.len()));
    }
    let it = match found {
        Some(v) => v,
        None => {
            return error_response(
                StatusCode::NOT_FOUND,
                "TICKER_NOT_FOUND",
                format!("ticker {t} not found"),
            )
        }
    };
    let peers = loaded
        .as_ref()
        .map(|v| bd::peer_five(v, &it))
        .unwrap_or_default();
    let (fund_memo, tech_memo, synth_memo) = bd::research_of(&it).unwrap_or_else(|| {
        let m = bd::dossier_memo(&it, peers.len());
        (m.clone(), m.clone(), m)
    });
    let kronos_val = it
        .get("kronos")
        .cloned()
        .unwrap_or(json!({"forecastReturn": 0.05, "volatility": 0.12, "chartPoints": []}));
    let chart_empty = kronos_val
        .get("chartPoints")
        .and_then(|v| v.as_array())
        .map(|a| a.is_empty())
        .unwrap_or(true);
    let kronos_degraded = chart_empty;
    let data = json!({"ticker": t, "market": market.as_str(), "lang": lang, "score": bd::f64_of(&it, "mispricingScore"), "breakdown": it.get("components").cloned().unwrap_or(json!({})), "peerComparison": peers, "kronos": kronos_val, "research": {"fundamentalMemo": fund_memo, "technicalMemo": tech_memo, "synthesizerMemo": synth_memo}, "anomaly": it.get("anomaly").cloned().unwrap_or(json!({})), "sector": bd::str_of(&it, "sector"), "rank": it.get("rank").cloned().unwrap_or(json!(0)), "degraded": kronos_degraded, "disclaimer": DISCLAIMER});
    with_schema(ok_body(data), StatusCode::OK)
}

fn pdf_response(pdf: Vec<u8>) -> Response {
    (
        StatusCode::OK,
        [
            (axum::http::header::CONTENT_TYPE, "application/pdf"),
            (
                axum::http::header::CONTENT_DISPOSITION,
                "inline; filename=\"dossier.pdf\"",
            ),
            (SCHEMA_HEADER.clone(), SCHEMA_VERSION),
        ],
        pdf,
    )
        .into_response()
}

fn dossier_pdf(
    ticker: &str,
    market: Market,
    found: Option<&serde_json::Value>,
    peer_count: usize,
) -> Vec<u8> {
    let (score, comps, fund_memo, tech_memo, synth_memo) = match found {
        Some(it) => {
            let c = it.get("components");
            let co = Components {
                expected_return: c
                    .and_then(|x| x.get("expected_return"))
                    .and_then(|x| x.as_f64())
                    .unwrap_or(50.0) as f32,
                anomaly_z: c
                    .and_then(|x| x.get("anomaly_z"))
                    .and_then(|x| x.as_f64())
                    .unwrap_or(50.0) as f32,
                quality_value: c
                    .and_then(|x| x.get("quality_value"))
                    .and_then(|x| x.as_f64())
                    .unwrap_or(50.0) as f32,
                sector_mom: c
                    .and_then(|x| x.get("sector_mom"))
                    .and_then(|x| x.as_f64())
                    .unwrap_or(50.0) as f32,
            };
            let (f, t, s) = bd::research_of(it).unwrap_or_else(|| {
                let m = bd::dossier_memo(it, peer_count);
                (m.clone(), m.clone(), m)
            });
            (bd::f64_of(it, "mispricingScore") as f32, co, f, t, s)
        }
        None => (
            72.5,
            Components {
                expected_return: 50.0,
                anomaly_z: 50.0,
                quality_value: 50.0,
                sector_mom: 50.0,
            },
            String::new(),
            String::new(),
            String::new(),
        ),
    };
    let kronos_sec = found
        .and_then(|it| it.get("kronos"))
        .map(|k| dossier::KronosSection {
            forecast_return: k
                .get("forecastReturn")
                .and_then(|v| v.as_f64())
                .unwrap_or(0.05),
            volatility: k.get("volatility").and_then(|v| v.as_f64()).unwrap_or(0.12),
            chart_points: k
                .get("chartPoints")
                .and_then(|v| v.as_array())
                .cloned()
                .unwrap_or_default(),
        })
        .unwrap_or(dossier::KronosSection {
            forecast_return: 0.05,
            volatility: 0.12,
            chart_points: vec![],
        });
    let d = dossier::compose(
        ticker.to_string(),
        market,
        score,
        comps,
        Vec::new(),
        kronos_sec,
        dossier::ResearchSection {
            fundamental_memo: fund_memo,
            technical_memo: tech_memo,
            synthesizer_memo: synth_memo,
        },
    );
    dossier::to_pdf_bytes(&d)
}

pub async fn backtest(
    State(_repo): State<DynRepository>,
    q: Result<Query<BacktestQuery>, QueryRejection>,
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
    if let Err(msg) = parse_market(q.market.clone()) {
        return error_response(StatusCode::UNPROCESSABLE_ENTITY, "VALIDATION_ERROR", msg);
    }
    match bd::load_backtest_value().await {
        Some(v) => with_schema(ok_body(v), StatusCode::OK),
        None => {
            tracing::warn!("backtest file missing");
            error_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                "UPSTREAM_ERROR",
                "backtest data unavailable",
            )
        }
    }
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
    let min_z = q.min_z.unwrap_or(2.0).clamp(0.0, 10.0);
    let mstr = market.as_str().to_string();
    let (items, total) = match bd::load_backtest_value().await {
        Some(v) => {
            let mut sel: Vec<serde_json::Value> = bd::select_items(&v, &mstr, q.sector.as_deref())
                .into_iter()
                .filter(|it| bd::z_of(it).abs() >= min_z as f64 || bd::flag_of(it))
                .collect();
            sel = bd::sort_ranking(sel, true, false);
            let total = sel.len() as u64;
            let slice = bd::page_slice(&sel, page, page_size);
            let base = ((page - 1) * page_size) as usize;
            let mapped: Vec<serde_json::Value> = slice
                .iter()
                .enumerate()
                .map(|(i, it)| {
                    let mut item = bd::to_ranking_item(it, base + i + 1);
                    if let Some(reason) = it.get("anomaly").and_then(|a| a.get("reason")) {
                        item["reason"] = reason.clone();
                    }
                    item
                })
                .collect();
            (mapped, total)
        }
        None => (Vec::new(), 0),
    };
    let data = json!({"market": market.as_str(), "sector": q.sector, "minZ": min_z, "items": items, "disclaimer": DISCLAIMER});
    let pagination = Pagination {
        page,
        page_size,
        total,
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
    if let Some(r) = check_lookback(b.lookback) {
        return r;
    }
    if let Some(r) = check_lookback(b.pred_len) {
        return r;
    }
    if b.lookback.unwrap_or(0) as u32 + b.pred_len.unwrap_or(0) as u32 > 512 {
        return error_response(
            StatusCode::UNPROCESSABLE_ENTITY,
            "VALIDATION_ERROR",
            "max_context 512 exceeded",
        );
    }
    let market = match parse_market(b.market) {
        Ok(m) => m,
        Err(msg) => {
            return error_response(StatusCode::UNPROCESSABLE_ENTITY, "VALIDATION_ERROR", msg)
        }
    };
    let mstr = market.as_str().to_string();
    let loaded = bd::load_backtest_value().await;
    let mut excluded = Vec::new();
    let mut results = Vec::new();
    for t in b.tickers {
        match normalize_ticker(&t) {
            Ok(v) => match loaded.as_ref().and_then(|x| bd::find_item(x, &v, &mstr)) {
                Some(it) => results.push(json!({"ticker": v, "market": mstr, "mispricingScore": bd::f64_of(&it, "mispricingScore"), "anomaly": it.get("anomaly").cloned().unwrap_or(json!({})), "sector": bd::str_of(&it, "sector"), "rank": it.get("rank").cloned().unwrap_or(json!(0))})),
                None => excluded.push(json!({"ticker": t, "reason": "ticker not in universe-100"})),
            },
            Err(_) => excluded.push(json!({"ticker": t, "reason": "invalid ticker"})),
        }
    }
    let data = json!({"market": market.as_str(), "results": results, "tickers": results.iter().map(|r| r["ticker"].clone()).collect::<Vec<_>>(), "excluded": excluded, "degraded": !excluded.is_empty(), "disclaimer": DISCLAIMER});
    with_schema(ok_body(data), StatusCode::OK)
}
