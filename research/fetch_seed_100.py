"""Seed L2 data/seith.db dari Sectors /v2/daily (stdlib only, uv --no-project).

Usage: python research/fetch_seed_100.py <SECTORS_API_KEY>
Out: data/seith.db (ohlcv) + research/fetch_seed_100.out.json (summary+excluded).
ponytail: sequential + 3s gap; add when needed: asyncio + jitter.
"""
import json
import sqlite3
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
UNI = ROOT / "research" / "universe-100.json"
DB = ROOT / "data" / "seith.db"
OUT = ROOT / "research" / "fetch_seed_100.out.json"
MIG = ROOT / "migrations" / "001_cache.sql"
BASE = "https://api.sectors.app/v2/daily"
DISCLAIMER = "Bukan rekomendasi investasi. Informasi & analisis saja."
GAP = 3.0
UA = "SEITH-Market-Intelligence/1.0"


def fetch(api_key, ticker):
    req = urllib.request.Request(
        f"{BASE}/{ticker}/",
        headers={"Authorization": api_key, "User-Agent": UA, "Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, json.loads(r.read().decode()), None
    except urllib.error.HTTPError as e:
        hint = e.headers.get("Retry-After")
        try:
            wait = float(hint) if hint else None
        except ValueError:
            wait = None
        try:
            err = e.read().decode()[:200]
        except Exception:  # noqa: BLE001 - best-effort error body
            err = str(e)[:200]
        return e.code, {"error": err}, wait
    except Exception as e:  # noqa: BLE001 - network boundary, reason recorded
        return -1, {"error": str(e)[:200]}, None


def fetch_retry(api_key, ticker, tries=4):
    wait = 10.0
    for _ in range(tries):
        status, body, hint = fetch(api_key, ticker)
        if status != 429:
            return status, body
        time.sleep(hint or wait)
        wait = min(wait * 2, 120.0)
    return 429, {"error": "rate-limited after retries"}


def main():
    api_key = sys.argv[1] if len(sys.argv) > 1 else ""
    if len(api_key) < 20:
        print("SECTORS_API_KEY missing/short", file=sys.stderr)
        return 2
    uni = json.loads(UNI.read_text(encoding="utf-8"))
    items = uni["items"]
    DB.parent.mkdir(exist_ok=True)
    con = sqlite3.connect(DB, timeout=30)
    con.execute("PRAGMA journal_mode=WAL;")
    con.execute("PRAGMA busy_timeout=3000;")
    con.executescript(MIG.read_text(encoding="utf-8"))
    done = {r[0] for r in con.execute("SELECT DISTINCT ticker FROM ohlcv")}
    excluded, fetched, rows = [], 0, 0
    todo = [u for u in items if u["ticker"] not in done]
    print(f"resume: {len(done)} seeded, {len(todo)} to fetch", flush=True)
    for i, u in enumerate(todo):
        t, sector = u["ticker"], u.get("sector", "")
        status, body = fetch_retry(api_key, t)
        if status != 200 or not isinstance(body, list):
            excluded.append({"ticker": t, "reason": f"sectors_{status}"})
            print(f"[{i + 1}/{len(todo)}] {t} EXCLUDED sectors_{status}", flush=True)
        else:
            n = 0
            for b in body:
                try:
                    vals = [float(b.get(k) or 0) for k in ("open", "high", "low", "close")]
                except (TypeError, ValueError):
                    continue
                if all(v == 0 for v in vals):
                    continue  # missing OHLC -> skip row (gate C)
                con.execute(
                    "INSERT OR REPLACE INTO ohlcv"
                    " (market,ticker,date,open,high,low,close,volume,amount)"
                    " VALUES (?,?,?,?,?,?,?,?,?)",
                    ("id", t, str(b.get("date", "")), *vals,
                     float(b.get("volume") or 0), float(b.get("amount") or 0)),
                )
                n += 1
            if n == 0:
                excluded.append({"ticker": t, "reason": "missing_ohlc"})
            else:
                fetched += 1
                rows += n
            print(f"[{i + 1}/{len(todo)}] {t} rows={n} sector={sector}", flush=True)
        con.commit()
        time.sleep(GAP)
    total = con.execute("SELECT count(*) FROM ohlcv").fetchone()[0]
    tickers = con.execute("SELECT count(DISTINCT ticker) FROM ohlcv").fetchone()[0]
    con.close()
    OUT.write_text(json.dumps(
        {"fetched_this_run": fetched, "rows_this_run": rows, "total": total,
         "distinct_tickers": tickers, "excluded": excluded,
         "disclaimer": DISCLAIMER}, indent=1), encoding="utf-8")
    print(f"DONE fetched={fetched} rows={rows} total={total} tickers={tickers} excluded={len(excluded)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
