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
