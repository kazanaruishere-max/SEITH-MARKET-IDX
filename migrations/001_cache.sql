-- 001_cache.sql — CompositeCache L2 (SQLite) — 100% gratis, persist survive restart
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS ohlcv (
  market TEXT NOT NULL, -- 'id' | 'sg'
  ticker TEXT NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD
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
  roe REAL,
  margin REAL,
  leverage REAL,
  pe REAL,
  pb REAL,
  sector TEXT,
  insufficient_data INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  PRIMARY KEY (market, ticker, date)
);

CREATE TABLE IF NOT EXISTS ranking_cache (
  market TEXT NOT NULL,
  sector TEXT NOT NULL, -- '' for all
  as_of_date TEXT NOT NULL,
  data TEXT NOT NULL, -- JSON envelope array
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  expires_at TEXT NOT NULL,
  PRIMARY KEY (market, sector, as_of_date)
);
