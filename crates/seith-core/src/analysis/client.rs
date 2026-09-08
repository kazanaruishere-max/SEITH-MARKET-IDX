use std::time::Duration;

use once_cell::sync::Lazy;
use regex::Regex;
use reqwest::Client;
use serde::{Deserialize, Serialize};

use crate::analysis::error::AnalysisError;
use crate::analysis::types::{SynthesizeInput, SynthesizeOutput};

pub const DISCLAIMER: &str = "Bukan rekomendasi investasi. Informasi & analisis saja.";
const TIMEOUT_SECS: u64 = 15;

static TICKER_RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"^[A-Z0-9]{3,6}$").unwrap());

pub trait AnalysisRepository: Send + Sync {
    fn synthesize(
        &self,
        input: SynthesizeInput,
    ) -> impl std::future::Future<Output = Result<SynthesizeOutput, AnalysisError>> + Send;
}

#[derive(Debug, Clone)]
pub struct AnalysisClient {
    http: Client,
    base_url: String,
    model: String,
    fallback_model: String,
    api_key: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct FundamentalsWire {
    sector: String,
    roe: Option<f64>,
    margin: Option<f64>,
    leverage: Option<f64>,
    pe: Option<f64>,
    pb: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct KronosSignalWire {
    expected_return: f64,
    anomaly_z: f64,
    volatility: Option<f64>,
}

#[derive(Debug, Clone, Serialize)]
struct SynthesizeWire {
    model: String,
    market: String,
    ticker: String,
    fundamentals: FundamentalsWire,
    kronos_signal: KronosSignalWire,
    sector: String,
}

#[derive(Debug, Deserialize)]
struct SynthesizeResp {
    fundamental_memo: String,
    technical_memo: String,
    synthesizer_memo: String,
    degraded: bool,
    disclaimer: String,
}

fn validate_ticker(ticker: &str) -> Result<(), AnalysisError> {
    if !TICKER_RE.is_match(ticker) {
        return Err(AnalysisError::Validation(
            "ticker regex ^[A-Z0-9]{3,6}$".to_string(),
        ));
    }
    Ok(())
}

fn format_opt_pct(v: Option<f64>) -> String {
    v.map(|val| format!("{:.2}%", val * 100.0))
        .unwrap_or_else(|| "N/A".to_string())
}

fn format_opt_num(v: Option<f64>) -> String {
    v.map(|val| format!("{:.1}", val))
        .unwrap_or_else(|| "N/A".to_string())
}

pub fn template_memo(input: &SynthesizeInput) -> SynthesizeOutput {
    let f = &input.fundamentals;
    let k = &input.kronos_signal;
    let fund_memo = format!(
        "Analisis Fundamental {}: Sektor {}, ROE {}, Margin {}, Leverage {}, PE {}, PB {}.",
        input.ticker,
        f.sector,
        format_opt_pct(f.roe),
        format_opt_pct(f.margin),
        format_opt_num(f.leverage),
        format_opt_num(f.pe),
        format_opt_num(f.pb)
    );
    let tech_memo = format!(
        "Analisis Teknikal {}: Expected Return {:.2}%, Anomaly Z {:.2}, Volatilitas {}.",
        input.ticker,
        k.expected_return * 100.0,
        k.anomaly_z,
        format_opt_pct(k.volatility)
    );
    let verdict = if k.anomaly_z.abs() > 2.0 {
        "Anomali Terdeteksi"
    } else if k.expected_return > 0.05 {
        "Potensi Bullish"
    } else if k.expected_return < -0.05 {
        "Potensi Bearish"
    } else {
        "Netral"
    };
    let synth_memo = format!(
        "Sintesis {}: Verdict {} dengan skor Z {:.2} dan ER {:.2}%.",
        input.ticker,
        verdict,
        k.anomaly_z,
        k.expected_return * 100.0
    );
    SynthesizeOutput {
        fundamental_memo: fund_memo,
        technical_memo: tech_memo,
        synthesizer_memo: synth_memo,
        degraded: true,
        disclaimer: DISCLAIMER.to_string(),
    }
}

impl AnalysisClient {
    pub fn new(base_url: impl Into<String>) -> Result<Self, AnalysisError> {
        let http = Client::builder()
            .timeout(Duration::from_secs(TIMEOUT_SECS))
            .build()
            .map_err(|e| AnalysisError::Upstream(e.to_string()))?;
        let url = base_url.into().trim_end_matches('/').to_string();
        if url.is_empty() {
            return Err(AnalysisError::Validation("base_url empty".to_string()));
        }
        let model =
            std::env::var("SEITH_LLM_MODEL").unwrap_or_else(|_| "SEITH-MARKET-IDX".to_string());
        let fallback_model = std::env::var("SEITH_LLM_FALLBACK_MODEL")
            .unwrap_or_else(|_| "Seith-AI-Trading".to_string());
        let api_key = std::env::var("SEITH_API_KEY").unwrap_or_default();
        Ok(Self {
            http,
            base_url: url,
            model,
            fallback_model,
            api_key,
        })
    }

    pub fn with_model(mut self, model: impl Into<String>) -> Self {
        self.model = model.into();
        self
    }

    pub fn with_fallback_model(mut self, m: impl Into<String>) -> Self {
        self.fallback_model = m.into();
        self
    }

    pub fn with_api_key(mut self, k: impl Into<String>) -> Self {
        self.api_key = k.into();
        self
    }

    pub fn base_url(&self) -> &str {
        &self.base_url
    }

    pub fn model(&self) -> &str {
        &self.model
    }

    async fn post_json<T, R>(&self, path: &str, body: &T) -> Result<R, AnalysisError>
    where
        T: Serialize + Send + Sync,
        R: for<'de> Deserialize<'de>,
    {
        let url = format!("{}{}", self.base_url, path);
        let mut last_err: Option<AnalysisError> = None;
        for attempt in 0..2 {
            let mut req = self.http.post(&url).json(body);
            if !self.api_key.is_empty() {
                req = req.header("Authorization", format!("Bearer {}", self.api_key));
            }
            let res = req.send().await;
            match res {
                Ok(r) => {
                    if !r.status().is_success() {
                        let s = r.status().as_u16();
                        if s == 422 {
                            return Err(AnalysisError::Validation("validation error".to_string()));
                        }
                        if (s == 429 || (500..=599).contains(&s)) && attempt == 0 {
                            last_err = Some(AnalysisError::Upstream(format!("status {s}")));
                            continue;
                        }
                        return Err(AnalysisError::Upstream(format!("status {s}")));
                    }
                    let parsed = r
                        .json::<R>()
                        .await
                        .map_err(|e| AnalysisError::Serde(e.to_string()))?;
                    return Ok(parsed);
                }
                Err(e) if e.is_timeout() || e.is_connect() => {
                    tracing::warn!(attempt, error=%e, "analysis sidecar retry");
                    last_err = Some(AnalysisError::Timeout);
                    continue;
                }
                Err(e) => {
                    return Err(AnalysisError::Upstream(e.to_string()));
                }
            }
        }
        Err(last_err.unwrap_or(AnalysisError::Timeout))
    }
}

impl AnalysisRepository for AnalysisClient {
    async fn synthesize(&self, input: SynthesizeInput) -> Result<SynthesizeOutput, AnalysisError> {
        validate_ticker(&input.ticker)?;
        let wire = SynthesizeWire {
            model: self.model.clone(),
            market: input.market.as_str().to_string(),
            ticker: input.ticker.clone(),
            fundamentals: FundamentalsWire {
                sector: input.fundamentals.sector.clone(),
                roe: input.fundamentals.roe,
                margin: input.fundamentals.margin,
                leverage: input.fundamentals.leverage,
                pe: input.fundamentals.pe,
                pb: input.fundamentals.pb,
            },
            kronos_signal: KronosSignalWire {
                expected_return: input.kronos_signal.expected_return,
                anomaly_z: input.kronos_signal.anomaly_z,
                volatility: input.kronos_signal.volatility,
            },
            sector: input.sector.clone(),
        };
        match self
            .post_json::<SynthesizeWire, SynthesizeResp>("/synthesize", &wire)
            .await
        {
            Ok(r) => Ok(SynthesizeOutput {
                fundamental_memo: r.fundamental_memo,
                technical_memo: r.technical_memo,
                synthesizer_memo: r.synthesizer_memo,
                degraded: r.degraded,
                disclaimer: if r.disclaimer.is_empty() {
                    DISCLAIMER.to_string()
                } else {
                    r.disclaimer
                },
            }),
            Err(AnalysisError::Validation(e)) => Err(AnalysisError::Validation(e)),
            Err(AnalysisError::Timeout) => {
                tracing::warn!(ticker = %input.ticker, "analysis timeout, fallback to template memo");
                Ok(template_memo(&input))
            }
            Err(AnalysisError::Upstream(e)) => {
                tracing::warn!(ticker = %input.ticker, error = %e, "analysis upstream error, fallback to template memo");
                Ok(template_memo(&input))
            }
            Err(AnalysisError::Serde(e)) => {
                tracing::warn!(ticker = %input.ticker, error = %e, "analysis serde error, fallback to template memo");
                Ok(template_memo(&input))
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::analysis::{Fundamentals, KronosSignal};
    use crate::market::Market;
    use serde_json::json;

    fn sample_input(ticker: &str, market: Market) -> SynthesizeInput {
        SynthesizeInput {
            market,
            ticker: ticker.to_string(),
            fundamentals: Fundamentals {
                sector: "FINANCE".to_string(),
                roe: Some(0.18),
                margin: Some(0.35),
                leverage: Some(5.2),
                pe: Some(14.5),
                pb: Some(2.1),
            },
            kronos_signal: KronosSignal {
                expected_return: 0.08,
                anomaly_z: 2.35,
                volatility: Some(0.15),
            },
            sector: "FINANCE".to_string(),
        }
    }

    #[tokio::test]
    async fn ticker_regex_422() {
        let client = AnalysisClient::new("http://localhost:8002").unwrap();
        let bad_inputs = vec![
            sample_input("bbca", Market::Id),
            sample_input("AB", Market::Id),
            sample_input("TOOLONGTICKER", Market::Id),
            sample_input("BB-CA", Market::Id),
        ];
        for input in bad_inputs {
            let err = client.synthesize(input).await.unwrap_err();
            assert!(matches!(err, AnalysisError::Validation(_)));
            assert!(err.to_string().contains("ticker regex"));
        }
    }

    #[tokio::test]
    async fn market_id_tag() {
        let mut server = mockito::Server::new_async().await;
        let resp_body = json!({
            "fundamental_memo": "Fundamental BBCA ok",
            "technical_memo": "Technical BBCA ok",
            "synthesizer_memo": "Synthesizer BBCA ok",
            "degraded": false,
            "disclaimer": DISCLAIMER
        });
        let mock = server
            .mock("POST", "/synthesize")
            .match_body(mockito::Matcher::PartialJson(json!({
                "market": "id",
                "ticker": "BBCA",
                "model": "SEITH-MARKET-IDX"
            })))
            .with_status(200)
            .with_header("content-type", "application/json")
            .with_body(resp_body.to_string())
            .create_async()
            .await;

        let client = AnalysisClient::new(server.url()).unwrap();
        let input = sample_input("BBCA", Market::Id);
        let out = client.synthesize(input).await.unwrap();

        mock.assert_async().await;
        assert!(!out.degraded);
        assert_eq!(out.disclaimer, DISCLAIMER);
        assert_eq!(out.fundamental_memo, "Fundamental BBCA ok");
    }

    #[tokio::test]
    async fn market_sg_tag() {
        let mut server = mockito::Server::new_async().await;
        let resp_body = json!({
            "fundamental_memo": "Fundamental D05 ok",
            "technical_memo": "Technical D05 ok",
            "synthesizer_memo": "Synthesizer D05 ok",
            "degraded": false,
            "disclaimer": DISCLAIMER
        });
        let mock = server
            .mock("POST", "/synthesize")
            .match_body(mockito::Matcher::PartialJson(json!({
                "market": "sg",
                "ticker": "D05",
                "model": "SEITH-MARKET-IDX"
            })))
            .with_status(200)
            .with_header("content-type", "application/json")
            .with_body(resp_body.to_string())
            .create_async()
            .await;

        let client = AnalysisClient::new(server.url()).unwrap();
        let input = sample_input("D05", Market::Sg);
        let out = client.synthesize(input).await.unwrap();

        mock.assert_async().await;
        assert!(!out.degraded);
        assert_eq!(out.synthesizer_memo, "Synthesizer D05 ok");
    }

    #[tokio::test]
    async fn timeout_degraded_true_fallback() {
        let client = AnalysisClient::new("http://127.0.0.1:1").unwrap();
        let input = sample_input("BBCA", Market::Id);
        let out = client.synthesize(input).await.unwrap();
        assert!(out.degraded);
        assert!(out.fundamental_memo.contains("ROE 18.00%"));
        assert!(out.technical_memo.contains("8.00%"));
        assert_eq!(out.disclaimer, DISCLAIMER);
    }

    #[tokio::test]
    async fn upstream_500_degraded_true_fallback() {
        let mut server = mockito::Server::new_async().await;
        server
            .mock("POST", "/synthesize")
            .with_status(500)
            .create_async()
            .await;

        let client = AnalysisClient::new(server.url()).unwrap();
        let input = sample_input("BBCA", Market::Id);
        let out = client.synthesize(input).await.unwrap();

        assert!(out.degraded);
        assert!(out.synthesizer_memo.contains("Verdict"));
        assert_eq!(out.disclaimer, DISCLAIMER);
    }

    #[tokio::test]
    async fn synthesize_200_degraded_false() {
        let mut server = mockito::Server::new_async().await;
        let resp_body = json!({
            "fundamental_memo": "Fund insight",
            "technical_memo": "Tech insight",
            "synthesizer_memo": "Synth insight",
            "degraded": false,
            "disclaimer": DISCLAIMER
        });
        server
            .mock("POST", "/synthesize")
            .with_status(200)
            .with_header("content-type", "application/json")
            .with_body(resp_body.to_string())
            .create_async()
            .await;

        let client = AnalysisClient::new(server.url()).unwrap();
        let input = sample_input("BBCA", Market::Id);
        let out = client.synthesize(input).await.unwrap();

        assert!(!out.degraded);
        assert_eq!(out.fundamental_memo, "Fund insight");
        assert_eq!(out.technical_memo, "Tech insight");
        assert_eq!(out.synthesizer_memo, "Synth insight");
        assert_eq!(out.disclaimer, DISCLAIMER);
    }

    #[test]
    fn template_fallback_numeric_deterministic() {
        let input = sample_input("BBRI", Market::Id);
        let out = template_memo(&input);
        assert!(out.degraded);
        assert!(out.fundamental_memo.contains("ROE 18.00%"));
        assert!(out.fundamental_memo.contains("Margin 35.00%"));
        assert!(out.fundamental_memo.contains("PE 14.5"));
        assert!(out.technical_memo.contains("8.00%"));
        assert!(out.technical_memo.contains("2.35"));
        assert!(out.synthesizer_memo.contains("Anomali Terdeteksi"));
        assert_eq!(out.disclaimer, DISCLAIMER);
    }

    #[test]
    fn env_model_default() {
        std::env::remove_var("SEITH_LLM_MODEL");
        let c = AnalysisClient::new("http://localhost:8002").unwrap();
        assert_eq!(c.model(), "SEITH-MARKET-IDX");
    }

    #[test]
    fn env_model_override() {
        std::env::set_var("SEITH_LLM_MODEL", "SEITH-MARKET-IDX");
        let c = AnalysisClient::new("http://localhost:8002").unwrap();
        assert_eq!(c.model(), "SEITH-MARKET-IDX");
        std::env::remove_var("SEITH_LLM_MODEL");
    }
}
