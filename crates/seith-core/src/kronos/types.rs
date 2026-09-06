use serde::{Deserialize, Serialize};

use crate::market::Market;
use crate::models::OhlcvRow;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct PredictInput {
    pub market: Market,
    pub df: Vec<OhlcvRow>,
    pub x_timestamp: Vec<i64>,
    pub y_timestamp: Vec<i64>,
    pub pred_len: u16,
    pub t: f32,
    pub top_p: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct PredictOutput {
    pub pred_df: Vec<OhlcvRow>,
    pub degraded: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct PredictBatchInput {
    pub market: Market,
    pub dfs: Vec<Vec<OhlcvRow>>,
    pub x_timestamps: Vec<Vec<i64>>,
    pub y_timestamps: Vec<Vec<i64>>,
    pub pred_len: u16,
    pub t: f32,
    pub top_p: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct BatchOutput {
    pub pred_dfs: Vec<Vec<OhlcvRow>>,
    pub degraded: bool,
}
