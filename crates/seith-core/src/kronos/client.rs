use std::time::Duration;

use reqwest::Client;
use serde::{Deserialize, Serialize};

use crate::kronos::error::KronosError;
use crate::kronos::types::{BatchOutput, PredictBatchInput, PredictInput, PredictOutput};
use crate::market::Market;
use crate::models::OhlcvRow;

const MAX_CONTEXT: usize = 512;
const TIMEOUT_SECS: u64 = 30;

pub trait KronosRepository: Send + Sync {
    fn predict(
        &self,
        input: PredictInput,
    ) -> impl std::future::Future<Output = Result<PredictOutput, KronosError>> + Send;
    fn predict_batch(
        &self,
        input: PredictBatchInput,
    ) -> impl std::future::Future<Output = Result<BatchOutput, KronosError>> + Send;
}

#[derive(Debug, Clone)]
pub struct KronosClient {
    http: Client,
    base_url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct OhlcvWire {
    open: f64,
    high: f64,
    low: f64,
    close: f64,
    volume: Option<f64>,
    amount: Option<f64>,
    timestamp: i64,
}

#[derive(Debug, Clone, Serialize)]
struct PredictWire {
    market: String,
    df: Vec<OhlcvWire>,
    x_timestamp: Vec<i64>,
    y_timestamp: Vec<i64>,
    pred_len: u16,
    #[serde(rename = "T")]
    t: f32,
    top_p: f32,
}

#[derive(Debug, Clone, Serialize)]
struct BatchWire {
    market: String,
    dfs: Vec<Vec<OhlcvWire>>,
    x_timestamps: Vec<Vec<i64>>,
    y_timestamps: Vec<Vec<i64>>,
    pred_len: u16,
    #[serde(rename = "T")]
    t: f32,
    top_p: f32,
}

#[derive(Debug, Deserialize)]
struct PredictResp {
    pred_df: Vec<OhlcvWire>,
    degraded: bool,
}

#[derive(Debug, Deserialize)]
struct BatchResp {
    pred_dfs: Vec<Vec<OhlcvWire>>,
    degraded: bool,
}

fn to_wire(rows: &[OhlcvRow]) -> Vec<OhlcvWire> {
    rows.iter()
        .map(|r| OhlcvWire {
            open: r.open,
            high: r.high,
            low: r.low,
            close: r.close,
            volume: r.volume,
            amount: r.amount,
            timestamp: r.x_timestamp.unwrap_or(r.date.timestamp()),
        })
        .collect()
}

fn from_wire(w: OhlcvWire, market: Market) -> OhlcvRow {
    use chrono::{TimeZone, Utc};
    let dt = Utc
        .timestamp_opt(w.timestamp, 0)
        .single()
        .unwrap_or(Utc::now());
    OhlcvRow {
        ticker: "PRED".to_string(),
        market,
        date: dt,
        open: w.open,
        high: w.high,
        low: w.low,
        close: w.close,
        volume: w.volume,
        amount: w.amount,
        x_timestamp: Some(w.timestamp),
        y_timestamp: Some(w.timestamp),
    }
}

fn validate_predict(input: &PredictInput) -> Result<(), KronosError> {
    if input.pred_len as usize > MAX_CONTEXT {
        return Err(KronosError::Validation("max_context 512".to_string()));
    }
    if input.df.len() + input.pred_len as usize > MAX_CONTEXT {
        return Err(KronosError::Validation("max_context 512".to_string()));
    }
    if input.df.is_empty() {
        return Err(KronosError::Validation("df must not be empty".to_string()));
    }
    if input.df.len() != input.x_timestamp.len() {
        return Err(KronosError::Validation("equal lookback".to_string()));
    }
    if input.df.len() != input.y_timestamp.len() {
        return Err(KronosError::Validation("equal lookback".to_string()));
    }
    Ok(())
}

fn validate_batch(input: &PredictBatchInput) -> Result<(), KronosError> {
    if input.pred_len as usize > MAX_CONTEXT {
        return Err(KronosError::Validation("max_context 512".to_string()));
    }
    if input.dfs.is_empty() {
        return Err(KronosError::Validation("dfs must not be empty".to_string()));
    }
    let first = input.dfs[0].len();
    if first == 0 {
        return Err(KronosError::Validation("dfs must not be empty".to_string()));
    }
    if first + input.pred_len as usize > MAX_CONTEXT {
        return Err(KronosError::Validation("max_context 512".to_string()));
    }
    for df in &input.dfs {
        if df.len() != first {
            return Err(KronosError::Validation("equal lookback".to_string()));
        }
    }
    if input.x_timestamps.len() != input.dfs.len() {
        return Err(KronosError::Validation("equal lookback".to_string()));
    }
    if input.y_timestamps.len() != input.dfs.len() {
        return Err(KronosError::Validation("equal lookback".to_string()));
    }
    Ok(())
}

impl KronosClient {
    pub fn new(base_url: impl Into<String>) -> Result<Self, KronosError> {
        let http = Client::builder()
            .timeout(Duration::from_secs(TIMEOUT_SECS))
            .build()
            .map_err(|e| KronosError::Upstream(e.to_string()))?;
        let url = base_url.into().trim_end_matches('/').to_string();
        if url.is_empty() {
            return Err(KronosError::Validation("base_url empty".to_string()));
        }
        Ok(Self {
            http,
            base_url: url,
        })
    }

    pub fn base_url(&self) -> &str {
        &self.base_url
    }

    async fn post_json<T, R>(&self, path: &str, body: &T) -> Result<R, KronosError>
    where
        T: Serialize + Send + Sync,
        R: for<'de> Deserialize<'de>,
    {
        let url = format!("{}{}", self.base_url, path);
        let mut last_err: Option<KronosError> = None;
        for attempt in 0..2 {
            let res = self.http.post(&url).json(body).send().await;
            match res {
                Ok(r) => {
                    if !r.status().is_success() {
                        let s = r.status().as_u16();
                        if s == 422 {
                            return Err(KronosError::Validation("max_context 512".to_string()));
                        }
                        return Err(KronosError::Upstream(format!("status {s}")));
                    }
                    let parsed = r
                        .json::<R>()
                        .await
                        .map_err(|e| KronosError::Serde(e.to_string()))?;
                    return Ok(parsed);
                }
                Err(e) if e.is_timeout() || e.is_connect() => {
                    tracing::warn!(attempt, error=%e, "kronos retry");
                    last_err = Some(KronosError::Timeout);
                    continue;
                }
                Err(e) => {
                    return Err(KronosError::Upstream(e.to_string()));
                }
            }
        }
        Err(last_err.unwrap_or(KronosError::Timeout))
    }
}

impl KronosRepository for KronosClient {
    async fn predict(&self, input: PredictInput) -> Result<PredictOutput, KronosError> {
        validate_predict(&input)?;
        let wire = PredictWire {
            market: input.market.as_str().to_string(),
            df: to_wire(&input.df),
            x_timestamp: input.x_timestamp.clone(),
            y_timestamp: input.y_timestamp.clone(),
            pred_len: input.pred_len,
            t: input.t,
            top_p: input.top_p,
        };
        match self
            .post_json::<PredictWire, PredictResp>("/predict", &wire)
            .await
        {
            Ok(r) => Ok(PredictOutput {
                pred_df: r
                    .pred_df
                    .into_iter()
                    .map(|w| from_wire(w, input.market))
                    .collect(),
                degraded: r.degraded,
            }),
            Err(KronosError::Timeout) => Ok(PredictOutput {
                pred_df: vec![],
                degraded: true,
            }),
            Err(KronosError::Upstream(_)) => Ok(PredictOutput {
                pred_df: vec![],
                degraded: true,
            }),
            Err(e) => Err(e),
        }
    }

    async fn predict_batch(&self, input: PredictBatchInput) -> Result<BatchOutput, KronosError> {
        validate_batch(&input)?;
        let wire = BatchWire {
            market: input.market.as_str().to_string(),
            dfs: input.dfs.iter().map(|d| to_wire(d)).collect(),
            x_timestamps: input.x_timestamps.clone(),
            y_timestamps: input.y_timestamps.clone(),
            pred_len: input.pred_len,
            t: input.t,
            top_p: input.top_p,
        };
        match self
            .post_json::<BatchWire, BatchResp>("/predict_batch", &wire)
            .await
        {
            Ok(r) => Ok(BatchOutput {
                pred_dfs: r
                    .pred_dfs
                    .into_iter()
                    .map(|dfs| {
                        dfs.into_iter()
                            .map(|w| from_wire(w, input.market))
                            .collect::<Vec<_>>()
                    })
                    .collect(),
                degraded: r.degraded,
            }),
            Err(KronosError::Timeout) => Ok(BatchOutput {
                pred_dfs: vec![],
                degraded: true,
            }),
            Err(KronosError::Upstream(_)) => Ok(BatchOutput {
                pred_dfs: vec![],
                degraded: true,
            }),
            Err(e) => Err(e),
        }
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    use chrono::{TimeZone, Utc};
    use serde_json::json;
    fn rws(n: usize, m: Market) -> Vec<OhlcvRow> {
        (0..n)
            .map(|i| OhlcvRow {
                ticker: "BBCA".to_string(),
                market: m,
                date: Utc.with_ymd_and_hms(2024, 1, 1, 0, 0, 0).unwrap()
                    + chrono::Duration::days(i as i64),
                open: 100.0,
                high: 101.0,
                low: 99.0,
                close: 100.5,
                volume: Some(1000.0),
                amount: Some(100000.0),
                x_timestamp: Some(1704067200 + i as i64 * 86400),
                y_timestamp: Some(1704153600 + i as i64 * 86400),
            })
            .collect()
    }
    fn ts(n: usize, len: usize) -> Vec<Vec<i64>> {
        vec![(0..len).map(|i| 1704067200 + i as i64 * 86400).collect(); n]
    }
    #[tokio::test]
    async fn guard_512_validation() {
        let c = KronosClient::new("http://localhost:8001").unwrap();
        let rows = rws(500, Market::Id);
        let input = PredictBatchInput {
            market: Market::Id,
            dfs: vec![rows],
            x_timestamps: ts(1, 500),
            y_timestamps: ts(1, 500),
            pred_len: 20,
            t: 1.0,
            top_p: 0.9,
        };
        let err = c.predict_batch(input).await.unwrap_err();
        assert!(matches!(err, KronosError::Validation(_)));
        assert!(err.to_string().contains("512"));
    }
    #[tokio::test]
    async fn equal_guard_422() {
        let c = KronosClient::new("http://localhost:8001").unwrap();
        let a = rws(400, Market::Id);
        let b = rws(380, Market::Id);
        let input = PredictBatchInput {
            market: Market::Id,
            dfs: vec![a, b],
            x_timestamps: vec![vec![1; 400], vec![1; 400]],
            y_timestamps: vec![vec![1; 400], vec![1; 400]],
            pred_len: 20,
            t: 1.0,
            top_p: 0.9,
        };
        let err = c.predict_batch(input).await.unwrap_err();
        assert!(err.to_string().contains("equal lookback"));
    }
    #[tokio::test]
    async fn market_id_tag() {
        let mut s = mockito::Server::new_async().await;
        let body = json!({"pred_dfs":[[{"open":1.0,"high":1.0,"low":1.0,"close":1.0,"volume":0.0,"amount":0.0,"timestamp":1704067200}]],"degraded":false});
        s.mock("POST", "/predict_batch")
            .with_status(200)
            .with_header("content-type", "application/json")
            .with_body(body.to_string())
            .create_async()
            .await;
        let c = KronosClient::new(s.url()).unwrap();
        let rows = rws(400, Market::Id);
        let input = PredictBatchInput {
            market: Market::Id,
            dfs: vec![rows],
            x_timestamps: ts(1, 400),
            y_timestamps: ts(1, 400),
            pred_len: 20,
            t: 1.0,
            top_p: 0.9,
        };
        let out = c.predict_batch(input).await.unwrap();
        assert!(!out.degraded);
        assert_eq!(out.pred_dfs.len(), 1);
    }
    #[tokio::test]
    async fn market_sg_tag() {
        let mut s = mockito::Server::new_async().await;
        let body = json!({"pred_dfs":[[{"open":1.0,"high":1.0,"low":1.0,"close":1.0,"volume":0.0,"amount":0.0,"timestamp":1704067200}]],"degraded":false});
        s.mock("POST", "/predict_batch")
            .with_status(200)
            .with_header("content-type", "application/json")
            .with_body(body.to_string())
            .create_async()
            .await;
        let c = KronosClient::new(s.url()).unwrap();
        let rows = rws(400, Market::Sg);
        let input = PredictBatchInput {
            market: Market::Sg,
            dfs: vec![rows],
            x_timestamps: ts(1, 400),
            y_timestamps: ts(1, 400),
            pred_len: 20,
            t: 1.0,
            top_p: 0.9,
        };
        let out = c.predict_batch(input).await.unwrap();
        assert!(!out.degraded);
        assert_eq!(out.pred_dfs[0][0].market, Market::Sg);
    }
    #[tokio::test]
    async fn degraded_on_upstream() {
        let mut s = mockito::Server::new_async().await;
        s.mock("POST", "/predict_batch")
            .with_status(500)
            .create_async()
            .await;
        let c = KronosClient::new(s.url()).unwrap();
        let rows = rws(400, Market::Id);
        let input = PredictBatchInput {
            market: Market::Id,
            dfs: vec![rows],
            x_timestamps: ts(1, 400),
            y_timestamps: ts(1, 400),
            pred_len: 20,
            t: 1.0,
            top_p: 0.9,
        };
        let out = c.predict_batch(input).await.unwrap();
        assert!(out.degraded);
        assert!(out.pred_dfs.is_empty());
    }
    #[tokio::test]
    async fn pred_len_20_ok_420() {
        let mut s = mockito::Server::new_async().await;
        let preds: Vec<serde_json::Value> = (0..20).map(|i| json!({"open":1.0,"high":1.0,"low":1.0,"close":1.0,"volume":0.0,"amount":0.0,"timestamp": 1704067200 + i})).collect();
        let body = json!({"pred_dfs":[preds],"degraded":false});
        s.mock("POST", "/predict_batch")
            .with_status(200)
            .with_header("content-type", "application/json")
            .with_body(body.to_string())
            .create_async()
            .await;
        let c = KronosClient::new(s.url()).unwrap();
        let rows = rws(400, Market::Id);
        let input = PredictBatchInput {
            market: Market::Id,
            dfs: vec![rows],
            x_timestamps: ts(1, 400),
            y_timestamps: ts(1, 400),
            pred_len: 20,
            t: 1.0,
            top_p: 0.9,
        };
        let out = c.predict_batch(input).await.unwrap();
        assert!(!out.degraded);
        assert_eq!(out.pred_dfs[0].len(), 20);
    }
    #[tokio::test]
    async fn timeout_degraded_fallback() {
        let c = KronosClient::new("http://127.0.0.1:1").unwrap();
        let rows = rws(400, Market::Id);
        let input = PredictBatchInput {
            market: Market::Id,
            dfs: vec![rows],
            x_timestamps: ts(1, 400),
            y_timestamps: ts(1, 400),
            pred_len: 20,
            t: 1.0,
            top_p: 0.9,
        };
        let out = c.predict_batch(input).await.unwrap();
        assert!(out.degraded);
    }
}
