use axum::{
    extract::{Query, State},
    http::{HeaderMap, HeaderName, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use seith_core::market::Market;
use seith_core::SCHEMA_VERSION;
use serde::Deserialize;
use serde_json::json;
use std::str::FromStr;

use crate::envelope::Envelope;
use crate::repository::DynRepository;

static SCHEMA_HEADER: HeaderName = HeaderName::from_static("x-schema-version");

fn schema_headers() -> HeaderMap {
    let mut h = HeaderMap::new();
    h.insert(
        SCHEMA_HEADER.clone(),
        HeaderValue::from_static(SCHEMA_VERSION),
    );
    h
}

#[derive(Debug, Deserialize)]
pub struct RankingQuery {
    pub market: Option<String>,
    pub lookback: Option<u16>,
}

pub async fn health() -> Response {
    let body = Envelope::ok(json!({"status":"ok","schema":SCHEMA_VERSION}));
    let mut res = Json(body).into_response();
    res.headers_mut().insert(
        SCHEMA_HEADER.clone(),
        HeaderValue::from_static(SCHEMA_VERSION),
    );
    res
}

pub async fn ranking(
    State(_repo): State<DynRepository>,
    Query(q): Query<RankingQuery>,
) -> Response {
    if let Some(lb) = q.lookback {
        if lb > 512 {
            return error_response(
                StatusCode::UNPROCESSABLE_ENTITY,
                "VALIDATION_ERROR",
                "max_context 512 exceeded",
            );
        }
    }
    let market = match q.market {
        None => Market::Id,
        Some(ref s) => match Market::from_str(s) {
            Ok(m) => m,
            Err(_) => {
                return error_response(
                    StatusCode::UNPROCESSABLE_ENTITY,
                    "VALIDATION_ERROR",
                    format!("invalid market ''{s}'', expected id|sg"),
                )
            }
        },
    };
    let data = json!({"market": market.as_str(), "items": []});
    let body = Envelope::ok(data);
    let mut res = (StatusCode::OK, Json(body)).into_response();
    res.headers_mut().insert(
        SCHEMA_HEADER.clone(),
        HeaderValue::from_static(SCHEMA_VERSION),
    );
    res
}

fn error_response(status: StatusCode, code: &str, msg: impl Into<String>) -> Response {
    let body: Envelope<serde_json::Value> = Envelope::err(code, msg);
    let mut res = (status, schema_headers(), Json(body)).into_response();
    res.headers_mut().insert(
        SCHEMA_HEADER.clone(),
        HeaderValue::from_static(SCHEMA_VERSION),
    );
    res
}
