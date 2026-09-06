use anyhow::Result;
use chrono::{DateTime, TimeZone, Utc};
use rusqlite::{params, Connection, OpenFlags};
use seith_core::market::Market;
use seith_core::models::OhlcvRow;
use std::str::FromStr;
use std::sync::{Arc, Mutex, OnceLock};

pub trait Repository: Send + Sync {
    fn get_ohlcv(&self, market: Market, ticker: &str) -> Result<Vec<OhlcvRow>>;
    fn save_ohlcv(&self, rows: &[OhlcvRow]) -> Result<usize>;
}

#[derive(Debug, Clone)]
pub struct SqliteRepository {
    pub path: String,
    mem: Arc<OnceLock<Mutex<Connection>>>,
}

impl SqliteRepository {
    pub fn new(path: impl Into<String>) -> Self {
        Self {
            path: path.into(),
            mem: Arc::new(OnceLock::new()),
        }
    }

    pub fn memory() -> Self {
        Self::new(":memory:")
    }

    fn is_mem(&self) -> bool {
        self.path == ":memory:"
            || (self.path.starts_with("file:") && self.path.contains("mode=memory"))
    }

    fn mem_conn(&self) -> Result<std::sync::MutexGuard<'_, Connection>> {
        let m = self.mem.get_or_init(|| {
            let c = open_conn(&self.path).expect("open mem conn");
            init_schema(&c).expect("init mem schema");
            Mutex::new(c)
        });
        m.lock().map_err(|_| anyhow::anyhow!("mutex poisoned"))
    }

    fn conn(&self) -> Result<Connection> {
        let conn = open_conn(&self.path)?;
        init_schema(&conn)?;
        Ok(conn)
    }
}

fn open_conn(path: &str) -> Result<Connection> {
    let is_mem_uri = path.starts_with("file:") && path.contains("mode=memory");
    if path == ":memory:" || is_mem_uri {
        let conn = if path == ":memory:" {
            Connection::open_in_memory()?
        } else {
            Connection::open_with_flags(
                path,
                OpenFlags::SQLITE_OPEN_READ_WRITE
                    | OpenFlags::SQLITE_OPEN_CREATE
                    | OpenFlags::SQLITE_OPEN_URI,
            )?
        };
        conn.execute_batch("PRAGMA foreign_keys=ON; PRAGMA busy_timeout=3000;")?;
        Ok(conn)
    } else {
        if let Some(parent) = std::path::Path::new(path).parent() {
            if !parent.as_os_str().is_empty() {
                let _ = std::fs::create_dir_all(parent);
            }
        }
        let conn = Connection::open(path)?;
        conn.execute_batch(
            "PRAGMA journal_mode=WAL; PRAGMA busy_timeout=3000; PRAGMA foreign_keys=ON;",
        )?;
        Ok(conn)
    }
}

fn init_schema(conn: &Connection) -> Result<()> {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS ohlcv (
          market TEXT NOT NULL,
          ticker TEXT NOT NULL,
          date TEXT NOT NULL,
          open REAL NOT NULL,
          high REAL NOT NULL,
          low REAL NOT NULL,
          close REAL NOT NULL,
          volume REAL NOT NULL DEFAULT 0,
          amount REAL NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
          PRIMARY KEY (market, ticker, date)
        );
        CREATE INDEX IF NOT EXISTS idx_ohlcv_ticker_date ON ohlcv(market, ticker, date);
        CREATE TABLE IF NOT EXISTS fundamentals (
          market TEXT NOT NULL,
          ticker TEXT NOT NULL,
          date TEXT NOT NULL,
          roe REAL, margin REAL, leverage REAL, pe REAL, pb REAL,
          sector TEXT,
          insufficient_data INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
          PRIMARY KEY (market, ticker, date)
        );
        CREATE TABLE IF NOT EXISTS ranking_cache (
          market TEXT NOT NULL,
          sector TEXT NOT NULL,
          as_of_date TEXT NOT NULL,
          data TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
          expires_at TEXT NOT NULL,
          PRIMARY KEY (market, sector, as_of_date)
        );
        ",
    )?;
    Ok(())
}

impl Repository for SqliteRepository {
    fn get_ohlcv(&self, market: Market, ticker: &str) -> Result<Vec<OhlcvRow>> {
        if self.is_mem() {
            let conn = self.mem_conn()?;
            return query_ohlcv(&conn, market, ticker);
        }
        let conn = self.conn()?;
        query_ohlcv(&conn, market, ticker)
    }

    fn save_ohlcv(&self, rows: &[OhlcvRow]) -> Result<usize> {
        if self.is_mem() {
            let conn = self.mem_conn()?;
            return exec_save(&conn, rows);
        }
        let mut conn = self.conn()?;
        let tx = conn.transaction()?;
        let mut count = 0;
        for r in rows {
            tx.execute(
                "INSERT OR REPLACE INTO ohlcv (market,ticker,date,open,high,low,close,volume,amount) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)",
                params![
                    r.market.as_str(),
                    r.ticker,
                    r.date.format("%Y-%m-%dT%H:%M:%SZ").to_string(),
                    r.open,
                    r.high,
                    r.low,
                    r.close,
                    r.volume.unwrap_or(0.0),
                    r.amount.unwrap_or(0.0),
                ],
            )?;
            count += 1;
        }
        tx.commit()?;
        Ok(count)
    }
}

fn query_ohlcv(conn: &Connection, market: Market, ticker: &str) -> Result<Vec<OhlcvRow>> {
    let mut stmt = conn.prepare(
        "SELECT market,ticker,date,open,high,low,close,volume,amount FROM ohlcv WHERE market=?1 AND ticker=?2 ORDER BY date",
    )?;
    let rows = stmt.query_map(params![market.as_str(), ticker], |row| {
        let m_str: String = row.get(0)?;
        let t: String = row.get(1)?;
        let d_str: String = row.get(2)?;
        let open: f64 = row.get(3)?;
        let high: f64 = row.get(4)?;
        let low: f64 = row.get(5)?;
        let close: f64 = row.get(6)?;
        let volume: f64 = row.get(7)?;
        let amount: f64 = row.get(8)?;
        Ok((m_str, t, d_str, open, high, low, close, volume, amount))
    })?;
    let mut out = Vec::new();
    for r in rows {
        let (m_str, t, d_str, open, high, low, close, volume, amount) = r?;
        let m = Market::from_str(&m_str).unwrap_or(Market::Id);
        let date = parse_date(&d_str);
        out.push(OhlcvRow {
            ticker: t,
            market: m,
            date,
            open,
            high,
            low,
            close,
            volume: Some(volume),
            amount: Some(amount),
            x_timestamp: None,
            y_timestamp: None,
        });
    }
    Ok(out)
}

fn exec_save(conn: &Connection, rows: &[OhlcvRow]) -> Result<usize> {
    let mut count = 0;
    for r in rows {
        conn.execute(
            "INSERT OR REPLACE INTO ohlcv (market,ticker,date,open,high,low,close,volume,amount) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)",
            params![
                r.market.as_str(),
                r.ticker,
                r.date.format("%Y-%m-%dT%H:%M:%SZ").to_string(),
                r.open,
                r.high,
                r.low,
                r.close,
                r.volume.unwrap_or(0.0),
                r.amount.unwrap_or(0.0),
            ],
        )?;
        count += 1;
    }
    Ok(count)
}

fn parse_date(s: &str) -> DateTime<Utc> {
    if let Ok(dt) = s.parse::<DateTime<Utc>>() {
        return dt;
    }
    if let Ok(d) = chrono::NaiveDate::parse_from_str(s, "%Y-%m-%d") {
        return Utc.from_utc_datetime(&d.and_hms_opt(0, 0, 0).unwrap());
    }
    Utc::now()
}

pub type DynRepository = Arc<dyn Repository>;

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;

    fn sample_row(ticker: &str, market: Market) -> OhlcvRow {
        OhlcvRow {
            ticker: ticker.to_string(),
            market,
            date: Utc.with_ymd_and_hms(2024, 1, 2, 0, 0, 0).unwrap(),
            open: 100.0,
            high: 110.0,
            low: 90.0,
            close: 105.0,
            volume: Some(1000.0),
            amount: Some(105000.0),
            x_timestamp: None,
            y_timestamp: None,
        }
    }

    #[test]
    fn memory_round_trip() {
        let repo = SqliteRepository::new(format!(":memory:"));
        let row = sample_row("BBCA", Market::Id);
        let n = repo.save_ohlcv(&[row.clone()]).unwrap();
        assert_eq!(n, 1);
        let got = repo.get_ohlcv(Market::Id, "BBCA").unwrap();
        assert_eq!(got.len(), 1);
        assert_eq!(got[0].ticker, "BBCA");
        assert_eq!(got[0].close, 105.0);
    }

    #[test]
    fn insert_or_replace() {
        let repo = SqliteRepository::new(format!(":memory:"));
        let mut row = sample_row("BBRI", Market::Id);
        repo.save_ohlcv(&[row.clone()]).unwrap();
        row.close = 200.0;
        repo.save_ohlcv(&[row.clone()]).unwrap();
        let got = repo.get_ohlcv(Market::Id, "BBRI").unwrap();
        assert_eq!(got.len(), 1);
        assert_eq!(got[0].close, 200.0);
    }
}
