use seith_core::market::Market;

use crate::client::{SectorsClient, SectorsError};

impl SectorsClient {
    pub async fn fetch_ohlcv_batch(
        &self,
        market: Market,
        tickers: &[String],
        sector: &str,
    ) -> Vec<(String, Result<String, SectorsError>)> {
        let mut out = Vec::new();
        for chunk in tickers.chunks(20) {
            for ticker in chunk {
                let res = self.fetch_ohlcv(market, ticker, sector).await;
                out.push((ticker.clone(), res));
            }
        }
        out
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    fn client(server_url: &str) -> SectorsClient {
        SectorsClient::new(server_url, "test-key-12345678901234567890", ":memory:")
    }
    #[tokio::test]
    async fn batch_100_chunks_all_fetched_in_order() {
        let mut server = mockito::Server::new_async().await;
        let tickers: Vec<String> = (0..100).map(|i| format!("T{i:03}")).collect();
        let mut mocks = Vec::new();
        for t in &tickers {
            let path = format!("/v2/daily/{t}/");
            let m = server
                .mock("GET", path.as_str())
                .match_header("authorization", "test-key-12345678901234567890")
                .with_status(200)
                .with_body(r#"{"ok":true}"#)
                .expect(1)
                .create_async()
                .await;
            mocks.push(m);
        }
        let c = client(&server.url());
        let out = c.fetch_ohlcv_batch(Market::Id, &tickers, "FINANCE").await;
        assert_eq!(out.len(), 100);
        assert!(out.iter().all(|(_, r)| r.is_ok()));
        assert_eq!(out[0].0, "T000");
        assert_eq!(out[99].0, "T099");
        for m in mocks {
            m.assert_async().await;
        }
    }
    #[tokio::test]
    async fn batch_waf_403_maps_auth_no_leak() {
        let mut server = mockito::Server::new_async().await;
        server
            .mock("GET", "/v2/daily/BBCA/")
            .match_header("authorization", "test-key-12345678901234567890")
            .with_status(403)
            .create_async()
            .await;
        let c = client(&server.url());
        let out = c
            .fetch_ohlcv_batch(Market::Id, &["BBCA".to_string()], "FINANCE")
            .await;
        assert_eq!(out.len(), 1);
        let err = out[0].1.as_ref().unwrap_err();
        assert!(matches!(err, SectorsError::Auth));
        assert!(!format!("{err}").contains("test-key"));
    }
    #[tokio::test]
    async fn batch_partial_404_excluded_pattern() {
        let mut server = mockito::Server::new_async().await;
        server
            .mock("GET", "/v2/daily/BBCA/")
            .with_status(200)
            .with_body(r#"{"ok":true}"#)
            .create_async()
            .await;
        server
            .mock("GET", "/v2/daily/BMRG/")
            .with_status(404)
            .create_async()
            .await;
        let c = client(&server.url());
        let tickers = vec!["BBCA".to_string(), "BMRG".to_string()];
        let out = c.fetch_ohlcv_batch(Market::Id, &tickers, "FINANCE").await;
        assert!(out[0].1.is_ok());
        assert!(matches!(
            out[1].1.as_ref().unwrap_err(),
            SectorsError::NotFound
        ));
    }
}
