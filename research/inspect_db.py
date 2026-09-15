"""Inspect L2 data/seith.db (stdlib only)."""
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
c = sqlite3.connect(ROOT / "data" / "seith.db")
print("total", c.execute("SELECT count(*) FROM ohlcv").fetchone()[0])
print("tickers", c.execute("SELECT count(DISTINCT ticker) FROM ohlcv").fetchone()[0])
print("counts", sorted({r[0] for r in c.execute("SELECT count(*) FROM ohlcv GROUP BY ticker")}))
print("dates", c.execute("SELECT min(date),max(date) FROM ohlcv").fetchone())
print("vol>0 tickers", c.execute("SELECT count(DISTINCT ticker) FROM ohlcv WHERE volume>0").fetchone()[0])
print("bbca last3", c.execute("SELECT date,close,volume FROM ohlcv WHERE ticker='BBCA' ORDER BY date DESC LIMIT 3").fetchall())
