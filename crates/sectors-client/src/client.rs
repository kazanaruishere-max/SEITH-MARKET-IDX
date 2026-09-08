use std::time::Duration;

use seith_core::{market::Market, redact::Redacted};

use crate::cache::{cache_key, CompositeCache};

#[derive(Debug, thiserror::Error)]
pub enum SectorsError {
    #[error("auth failed")]
    Auth,
    #[error("not found")]
    NotFound,
    #[error("validation error: {0}")]
    Validation(String),
    #[error("rate limited")]
    RateLimit,
    #[error("upstream {0}")]
    Upstream(String),
}

pub struct SectorsClient {
    http: reqwest::Client,
    base_url: String,
    api_key: Redacted,
    cache: CompositeCache,
}

impl SectorsClient {
    pub fn new(
        base_url: impl Into<String>,
        api_key: impl Into<String>,
        l2_path: impl Into<String>,
    ) -> Self {
        let http = reqwest::Client::builder()
            .timeout(Duration::from_secs(10))
            .build()
            .expect("client build");
        Self {
            http,
            base_url: base_url.into(),
            api_key: Redacted(api_key.into()),
            cache: CompositeCache::new(10_000, l2_path),
        }
    }

    fn endpoint(&self, market: &Market) -> String {
        format!("{}{}", self.base_url, market.base_path())
    }

    fn today_key(&self, market: &Market, sector: &str, ticker: &str) -> String {
        let date = chrono::Utc::now().format("%Y-%m-%d").to_string();
        cache_key(market, sector, ticker, &date)
    }

    pub async fn fetch_ohlcv(
        &self,
        market: Market,
        ticker: &str,
        sector: &str,
    ) -> Result<String, SectorsError> {
        let key = self.today_key(&market, sector, ticker);
        if let Some(v) = self.cache.get(&key) {
            return Ok(v);
        }
        let body = self.fetch_http(market, ticker).await?;
        self.cache.set(key, body.clone());
        Ok(body)
    }

    async fn fetch_http(&self, market: Market, ticker: &str) -> Result<String, SectorsError> {
        let url = format!("{}/{ticker}/", self.endpoint(&market));
        let resp = self
            .http
            .get(&url)
            .header("Authorization", self.api_key.0.as_str())
            .send()
            .await
            .map_err(|e| SectorsError::Upstream(e.to_string()))?;
        match resp.status().as_u16() {
            200 => resp
                .text()
                .await
                .map_err(|e| SectorsError::Upstream(e.to_string())),
            401 | 403 => Err(SectorsError::Auth),
            404 => Err(SectorsError::NotFound),
            422 => Err(SectorsError::Validation("invalid ticker".into())),
            429 => Err(SectorsError::RateLimit),
            c => Err(SectorsError::Upstream(format!("status {c}"))),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn client(server_url: &str) -> SectorsClient {
        SectorsClient::new(server_url, "test-key-12345678901234567890", ":memory:")
    }

    #[tokio::test]
    async fn fetch_id_endpoint() {
        let mut server = mockito::Server::new_async().await;
        let m = server
            .mock("GET", "/v2/daily/BBCA/")
            .match_header("authorization", "test-key-12345678901234567890")
            .with_status(200)
            .with_body(r#"{"ticker":"BBCA"}"#)
            .create_async()
            .await;
        let c = client(&server.url());
        let body = c.fetch_ohlcv(Market::Id, "BBCA", "FINANCE").await.unwrap();
        assert_eq!(body, r#"{"ticker":"BBCA"}"#);
        m.assert_async().await;
    }

    #[tokio::test]
    async fn fetch_sg_endpoint() {
        let mut server = mockito::Server::new_async().await;
        let m = server
            .mock("GET", "/v2/sgx/daily/D05/")
            .match_header("authorization", "test-key-12345678901234567890")
            .with_status(200)
            .with_body(r#"{"ticker":"D05"}"#)
            .create_async()
            .await;
        let c = client(&server.url());
        let body = c.fetch_ohlcv(Market::Sg, "D05", "FINANCE").await.unwrap();
        assert_eq!(body, r#"{"ticker":"D05"}"#);
        m.assert_async().await;
    }

    #[tokio::test]
    async fn cache_hit_no_http() {
        let mut server = mockito::Server::new_async().await;
        let m = server
            .mock("GET", "/v2/daily/BBCA/")
            .match_header("authorization", "test-key-12345678901234567890")
            .with_status(200)
            .with_body("cached-body")
            .expect(1)
            .create_async()
            .await;
        let c = client(&server.url());
        let first = c.fetch_ohlcv(Market::Id, "BBCA", "FINANCE").await.unwrap();
        assert_eq!(first, "cached-body");
        m.assert_async().await;
        let second = c.fetch_ohlcv(Market::Id, "BBCA", "FINANCE").await.unwrap();
        assert_eq!(second, "cached-body");
    }

    #[tokio::test]
    async fn maps_422_validation() {
        let mut server = mockito::Server::new_async().await;
        server
            .mock("GET", "/v2/daily/BAD/")
            .match_header("authorization", "test-key-12345678901234567890")
            .with_status(422)
            .create_async()
            .await;
        let c = client(&server.url());
        let err = c
            .fetch_ohlcv(Market::Id, "BAD", "FINANCE")
            .await
            .unwrap_err();
        assert!(matches!(err, SectorsError::Validation(_)));
    }

    #[tokio::test]
    async fn maps_401_auth_no_leak() {
        let mut server = mockito::Server::new_async().await;
        server
            .mock("GET", "/v2/daily/BBCA/")
            .match_header("authorization", "test-key-12345678901234567890")
            .with_status(401)
            .create_async()
            .await;
        let c = client(&server.url());
        let err = c
            .fetch_ohlcv(Market::Id, "BBCA", "FINANCE")
            .await
            .unwrap_err();
        assert!(matches!(err, SectorsError::Auth));
        let msg = format!("{err}");
        assert!(!msg.contains("test-key"));
    }

    #[test]
    fn redacted_debug_is_stars() {
        let r = Redacted("super-secret-key-123".to_string());
        assert_eq!(format!("{r:?}"), "***");
        assert_eq!(format!("{r}"), "***");
    }
}
