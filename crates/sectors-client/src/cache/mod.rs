pub mod composite;
pub mod sqlite;

pub use composite::CompositeCache;
pub use sqlite::SqliteCache;

use seith_core::market::Market;

pub fn cache_key(market: &Market, sector: &str, ticker: &str, date: &str) -> String {
    format!("{}:{}:{}:{}", market.as_str(), sector, ticker, date)
}

#[cfg(test)]
mod tests {
    use super::*;
    use seith_core::market::Market;

    #[test]
    fn key_id_vs_sg_isolated() {
        let k_id = cache_key(&Market::Id, "FINANCE", "BBCA", "2026-09-06");
        let k_sg = cache_key(&Market::Sg, "FINANCE", "DBS", "2026-09-06");
        assert_ne!(k_id, k_sg);
        assert!(k_id.starts_with("id:"));
        assert!(k_sg.starts_with("sg:"));
    }

    #[test]
    fn key_format_four_parts() {
        let k = cache_key(&Market::Id, "TECH", "BBRI", "2026-01-01");
        assert_eq!(k, "id:TECH:BBRI:2026-01-01");
    }

    #[test]
    fn same_inputs_same_key() {
        let a = cache_key(&Market::Id, "FINANCE", "BBCA", "2026-09-06");
        let b = cache_key(&Market::Id, "FINANCE", "BBCA", "2026-09-06");
        assert_eq!(a, b);
    }
}
