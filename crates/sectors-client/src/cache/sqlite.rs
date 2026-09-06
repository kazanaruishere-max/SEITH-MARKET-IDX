use std::sync::{Arc, Mutex};

use chrono::{SecondsFormat, Utc};
use rusqlite::{params, Connection};

const MIGRATION: &str = include_str!("../../../../migrations/001_cache.sql");
const BUSY_TIMEOUT_MS: u64 = 3000;
const DEFAULT_TTL_SECS: i64 = 86400;
const RANKING_TTL_SECS: i64 = 3600;

pub struct SqliteCache {
    pub path: String,
    conn: Arc<Mutex<Connection>>,
}

impl SqliteCache {
    pub fn new(path: impl Into<String>) -> Self {
        let path = path.into();
        let conn = Self::open_conn(&path).expect("sqlite open");
        Self {
            path,
            conn: Arc::new(Mutex::new(conn)),
        }
    }

    fn open_conn(path: &str) -> rusqlite::Result<Connection> {
        let conn = if path == ":memory:" {
            Connection::open_in_memory()?
        } else {
            Connection::open(path)?
        };
        conn.busy_timeout(std::time::Duration::from_millis(BUSY_TIMEOUT_MS))?;
        conn.execute_batch("PRAGMA journal_mode=WAL;")?;
        conn.execute_batch(&format!("PRAGMA busy_timeout={BUSY_TIMEOUT_MS};"))?;
        conn.execute_batch(MIGRATION)?;
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS kv_store (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                expires_at TEXT NOT NULL
            );",
        )?;
        Ok(conn)
    }

    fn now_rfc3339() -> String {
        Utc::now().to_rfc3339_opts(SecondsFormat::Secs, true)
    }

    fn expiry_rfc3339(ttl_secs: i64) -> String {
        (Utc::now() + chrono::Duration::seconds(ttl_secs))
            .to_rfc3339_opts(SecondsFormat::Secs, true)
    }

    pub fn get(&self, key: &str) -> Option<String> {
        let conn = self.conn.lock().ok()?;
        let (value, expires_at): (String, String) = conn
            .query_row(
                "SELECT value, expires_at FROM kv_store WHERE key=?1",
                params![key],
                |row| Ok((row.get(0)?, row.get(1)?)),
            )
            .ok()?;
        if is_expired(&expires_at) {
            let _ = conn.execute("DELETE FROM kv_store WHERE key=?1", params![key]);
            return None;
        }
        Some(value)
    }

    pub fn set(&self, key: String, value: String) {
        let _ = self.set_with_ttl(key, value, DEFAULT_TTL_SECS);
    }

    pub fn set_with_ttl(&self, key: String, value: String, ttl_secs: i64) -> rusqlite::Result<()> {
        let conn = self
            .conn
            .lock()
            .map_err(|_| rusqlite::Error::InvalidParameterName("lock".into()))?;
        let expires_at = Self::expiry_rfc3339(ttl_secs);
        let _now = Self::now_rfc3339();
        conn.execute(
            "INSERT INTO kv_store (key, value, expires_at) VALUES (?1,?2,?3)
             ON CONFLICT(key) DO UPDATE SET value=excluded.value, expires_at=excluded.expires_at",
            params![key, value, expires_at],
        )?;
        Ok(())
    }

    pub fn set_ranking(&self, key: String, value: String) -> rusqlite::Result<()> {
        self.set_with_ttl(key, value, RANKING_TTL_SECS)
    }

    pub fn invalidate(&self, key: &str) {
        if let Ok(conn) = self.conn.lock() {
            let _ = conn.execute("DELETE FROM kv_store WHERE key=?1", params![key]);
        }
    }

    pub fn busy_timeout_ms(&self) -> u64 {
        BUSY_TIMEOUT_MS
    }
}

fn is_expired(expires_at: &str) -> bool {
    let Ok(exp) = chrono::DateTime::parse_from_rfc3339(expires_at) else {
        return true;
    };
    exp.with_timezone(&Utc) < Utc::now()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn mem() -> SqliteCache {
        SqliteCache::new(":memory:")
    }

    #[test]
    fn round_trip() {
        let c = mem();
        c.set("k1".to_string(), "v1".to_string());
        assert_eq!(c.get("k1"), Some("v1".to_string()));
    }

    #[test]
    fn missing_is_none() {
        let c = mem();
        assert_eq!(c.get("nope"), None);
    }

    #[test]
    fn ttl_expiry_negative() {
        let c = mem();
        c.set_with_ttl("k".to_string(), "v".to_string(), -1)
            .unwrap();
        assert_eq!(c.get("k"), None);
    }

    #[test]
    fn overwrite_value() {
        let c = mem();
        c.set("k".to_string(), "v1".to_string());
        c.set("k".to_string(), "v2".to_string());
        assert_eq!(c.get("k"), Some("v2".to_string()));
    }

    #[test]
    fn invalidate_removes() {
        let c = mem();
        c.set("k".to_string(), "v".to_string());
        c.invalidate("k");
        assert_eq!(c.get("k"), None);
    }

    #[test]
    fn ranking_ttl_positive_hit() {
        let c = mem();
        c.set_ranking("rk".to_string(), "rv".to_string()).unwrap();
        assert_eq!(c.get("rk"), Some("rv".to_string()));
    }

    #[test]
    fn busy_timeout_is_3000() {
        let c = mem();
        assert_eq!(c.busy_timeout_ms(), 3000);
    }
}
