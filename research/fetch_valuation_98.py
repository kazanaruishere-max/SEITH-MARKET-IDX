"""Fetch valuation+financials per 98 ticker -> L2 fundamentals (stdlib only).

Usage: python research/fetch_valuation_98.py <SECTORS_API_KEY>
Out: L2 fundamentals + research/valuation_98.out.json (summary+excluded).
Skips BMRG (known 404 billed) + MFIN (no OHLCV, unscorable) to save credits.
ponytail: sequential + 3s gap; add when needed: asyncio + jitter.
"""
import json
import sqlite3
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
UNI = ROOT / "research" / "universe-100.json"
DB = ROOT / "data" / "seith.db"
OUT = ROOT / "research" / "valuation_98.out.json"
BASE = "https://api.sectors.app/v2/company/report"
UA = "SEITH-Market-Intelligence/1.0"
GAP = 3.0
SKIP = {"BMRG": "sectors_404_known", "MFIN": "missing_ohlc_unscorable"}
DISCLAIMER = "Bukan rekomendasi investasi. Informasi & analisis saja."


def get(api_key, ticker):
    params = urllib.parse.urlencode({"sections": "valuation,financials"})
    req = urllib.request.Request(f"{BASE}/{ticker}/?{params}", headers={
        "Authorization": api_key, "User-Agent": UA, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, json.loads(r.read().decode()), None
    except urllib.error.HTTPError as e:
        try:
            wait = float(e.headers.get("Retry-After") or 0) or None
        except ValueError:
            wait = None
        try:
            err = e.read().decode()[:200]
        except Exception:  # noqa: BLE001 - best-effort error body
            err = str(e)[:200]
        return e.code, {"error": err}, wait
    except Exception as e:  # noqa: BLE001 - network boundary, reason recorded
        return -1, {"error": str(e)[:200]}, None


def get_retry(api_key, ticker, tries=4):
    wait = 10.0
    for _ in range(tries):
        status, body, hint = get(api_key, ticker)
        if status != 429:
            return status, body
        time.sleep(hint or wait)
        wait = min(wait * 2, 120.0)
    return 429, {"error": "rate-limited after retries"}


def pick(body):
    """Extract (pe, pb, roe, margin, leverage, year) or None."""
    try:
        hv = (body.get("valuation", {}).get("historical_valuation") or [])
        hv = [x for x in hv if isinstance(x, dict)]
        last_v = hv[-1] if hv else {}
        hr = (body.get("financials", {}).get("historical_financial_ratio") or [])
        hr = [x for x in hr if isinstance(x, dict)]
        last_r = hr[-1] if hr else {}
        prof = last_r.get("profitability", {}) or {}
        lev = last_r.get("leverage", {}) or {}
        return {
            "pe": last_v.get("pe"), "pb": last_v.get("pb"),
            "roe": prof.get("roe"), "margin": prof.get("net_profit_margin"),
            "leverage": lev.get("debt_to_equity_ratio"),
            "year": last_v.get("year") or last_r.get("year"),
        }
    except (AttributeError, IndexError, TypeError):
        return None


def main():
    api_key = sys.argv[1] if len(sys.argv) > 1 else ""
    if len(api_key) < 20:
        print("SECTORS_API_KEY missing/short", file=sys.stderr)
        return 2
    uni = json.loads(UNI.read_text(encoding="utf-8"))
    items = [u for u in uni["items"] if u["ticker"] not in SKIP]
    sectors = {u["ticker"]: u.get("sector", "") for u in uni["items"]}
    con = sqlite3.connect(DB, timeout=30)
    con.execute("PRAGMA journal_mode=WAL;")
    con.execute("PRAGMA busy_timeout=3000;")
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    done = {r[0] for r in con.execute("SELECT DISTINCT ticker FROM fundamentals")}
    todo = [u for u in items if u["ticker"] not in done]
    print(f"resume: {len(done)} have fundamentals, {len(todo)} to fetch", flush=True)
    excluded = [{"ticker": t, "reason": r} for t, r in SKIP.items()]
    fetched, insuff = 0, 0
    for i, u in enumerate(todo):
        t = u["ticker"]
        status, body = get_retry(api_key, t)
        if status != 200 or not isinstance(body, dict):
            excluded.append({"ticker": t, "reason": f"sectors_{status}"})
            print(f"[{i + 1}/{len(todo)}] {t} EXCLUDED sectors_{status}", flush=True)
        else:
            p = pick(body)
            if not p:
                excluded.append({"ticker": t, "reason": "unparseable_report"})
                print(f"[{i + 1}/{len(todo)}] {t} EXCLUDED unparseable", flush=True)
            else:
                missing = [kk for kk in ("pe", "pb", "roe", "margin", "leverage") if p[kk] is None]
                con.execute(
                    "INSERT OR REPLACE INTO fundamentals"
                    " (market,ticker,date,roe,margin,leverage,pe,pb,sector,insufficient_data)"
                    " VALUES (?,?,?,?,?,?,?,?,?,?)",
                    ("id", t, today, p["roe"], p["margin"], p["leverage"],
                     p["pe"], p["pb"], sectors.get(t, ""), 1 if missing else 0),
                )
                fetched += 1
                insuff += 1 if missing else 0
                print(f"[{i + 1}/{len(todo)}] {t} pe={p['pe']} pb={p['pb']} "
                      f"roe={p['roe']} missing={missing}", flush=True)
        con.commit()
        time.sleep(GAP)
    total = con.execute("SELECT count(*) FROM fundamentals").fetchone()[0]
    con.close()
    OUT.write_text(json.dumps(
        {"fetched_this_run": fetched, "insufficient": insuff, "total": total,
         "excluded": excluded, "disclaimer": DISCLAIMER}, indent=1), encoding="utf-8")
    print(f"DONE fetched={fetched} insuff={insuff} total={total} excluded={len(excluded)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
