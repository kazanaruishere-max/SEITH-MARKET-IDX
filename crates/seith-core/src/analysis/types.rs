use serde::{Deserialize, Serialize};

use crate::market::Market;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct Fundamentals {
    pub sector: String,
    pub roe: Option<f64>,
    pub margin: Option<f64>,
    pub leverage: Option<f64>,
    pub pe: Option<f64>,
    pub pb: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct KronosSignal {
    pub expected_return: f64,
    pub anomaly_z: f64,
    pub volatility: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct SynthesizeInput {
    pub market: Market,
    pub ticker: String,
    pub fundamentals: Fundamentals,
    pub kronos_signal: KronosSignal,
    pub sector: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct SynthesizeOutput {
    pub fundamental_memo: String,
    pub technical_memo: String,
    pub synthesizer_memo: String,
    pub degraded: bool,
    pub disclaimer: String,
}
