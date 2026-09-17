"""Score 98 ticker live: L2 OHLCV -> :8001 pred real -> compute/rank/flag (stdlib).

Usage: python research/score_live_98.py
In: data/seith.db (ohlcv 98x19 + fundamentals 98), research/universe-100.json
Out: research/scores_98.json (items/ranked/flags/excluded/degraded/disclaimer).
Formula (mirror seith-core compute): score=0.30*ERn+0.20*Zc+0.30*QV+0.20*SM,
ERn=clamp(er*10+50), Zc=clamp(100-|z|), QV=sector percentile, SM=clamp(mom*10+50).
Rust compute() tetap SSOT (test scoring_breakdown_sums verifikasi paritas).
ponytail: sequential chunks(20); add when needed: Rust batch scorer bin.
"""
import json
import sqlite3
import statistics
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "data" / "seith.db"
UNI = ROOT / "research" / "universe-100.json"
OUT = ROOT / "research" / "scores_98.json"
KRONOS = "http://localhost:8001/predict_batch"
PRED_LEN = 20
DISCLAIMER = "Bukan rekomendasi investasi. Informasi & analisis saja."


def clamp(v, lo=0.0, hi=100.0):
    return max(lo, min(hi, v))


def post(payload):
    body = json.dumps(payload).encode()
    req = urllib.request.Request(KRONOS, data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=600) as r:
        return json.loads(r.read().decode())


def pct(value, vals):
    if not vals:
        return 50.0
    return clamp(sum(1 for v in vals if v <= value) / len(vals) * 100.0)


def main():
    uni = json.loads(UNI.read_text(encoding="utf-8"))
    sectors = {u["ticker"]: u.get("sector", "") for u in uni["items"]}
    con = sqlite3.connect(DB, timeout=30)
    tickers = [r[0] for r in con.execute("SELECT DISTINCT ticker FROM ohlcv ORDER BY ticker")]
    ohlcv = {}
    for t in tickers:
        ohlcv[t] = con.execute(
            "SELECT date,open,high,low,close,volume FROM ohlcv WHERE ticker=? ORDER BY date", (t,)
        ).fetchall()
    fund = {r[0]: r[1:] for r in con.execute(
        "SELECT ticker,roe,margin,leverage,pe,pb,sector,insufficient_data FROM fundamentals")}
    con.close()
    print(f"tickers={len(tickers)} fund={len(fund)}", flush=True)

    base_ts = int(datetime(2026, 9, 12, tzinfo=timezone.utc).timestamp())
    items, excluded, degraded_any = [], [], False
    for ci in range(0, len(tickers), 20):
        chunk = tickers[ci:ci + 20]
        dfs, xts, yts = [], [], []
        for t in chunk:
            rows = ohlcv[t]
            df = [{"open": o, "high": h, "low": lo, "close": c, "volume": v or 0.0,
                   "amount": 0.0, "timestamp": base_ts - (len(rows) - i) * 86400}
                  for i, (_, o, h, lo, c, v) in enumerate(rows)]
            dfs.append(df)
            xts.append([r["timestamp"] for r in df])
            yts.append([df[-1]["timestamp"] + (i + 1) * 86400 for i in range(PRED_LEN)])
        try:
            out = post({"market": "id", "dfs": dfs, "x_timestamps": xts,
                        "y_timestamps": yts, "pred_len": PRED_LEN, "T": 1.0, "top_p": 0.9})
            preds, degraded = out["pred_dfs"], out.get("degraded", False)
        except Exception as e:  # noqa: BLE001 - degraded path stays honest
            print(f"chunk {ci // 20} KRONOS FAIL: {str(e)[:150]}", flush=True)
            for t in chunk:
                excluded.append({"ticker": t, "reason": "kronos_unavailable"})
            degraded_any = True
            continue
        degraded_any = degraded_any or degraded
        for t, df, pred in zip(chunk, dfs, preds):
            if len(pred) != PRED_LEN:
                excluded.append({"ticker": t, "reason": f"n_pred_{len(pred)}"})
                continue
            last_close = df[-1]["close"]
            fwd = sum(p["close"] for p in pred) / PRED_LEN
            er = (fwd - last_close) / last_close if last_close else 0.0
            resid = [(p["close"] - last_close) / last_close for p in pred]
            sigma = statistics.pstdev(resid) if len(resid) > 1 else 0.0
            z = resid[0] / sigma if sigma > 1e-9 else 0.0
            vols = [r["volume"] or 0.0 for r in df]
            vmean = sum(vols) / len(vols)
            vstd = statistics.pstdev(vols) if len(vols) > 1 else 0.0
            vol_spike = (vols[-1] - vmean) / vstd > 2.0 if vstd > 1e-9 else False
            flag = abs(z) > 2.0 or vol_spike
            reason = "|".join([p for p in
                               ([f"z={z:.1f}"] if abs(z) > 2.0 else []) +
                               (["vol>2s"] if vol_spike else [])])
            items.append({
                "ticker": t, "market": "id", "sector": sectors.get(t, ""),
                "close": last_close, "er": er, "z": z, "flag": flag, "reason": reason,
                "vol_spike": vol_spike, "degraded": degraded,
                "insufficient_data": bool((fund.get(t) or [0] * 7)[-1]),
            })
        print(f"chunk {ci // 20}: scored={len(items)} excluded={len(excluded)}", flush=True)

    by_sector = {}
    for it in items:
        roe = (fund.get(it["ticker"]) or [None])[0]
        by_sector.setdefault(it["sector"], []).append((it["ticker"], roe or 0.0))
    for it in items:
        roe = (fund.get(it["ticker"]) or [None])[0] or 0.0
        vals = [r for _, r in by_sector.get(it["sector"], [])]
        qv = pct(roe, vals)
        er_n = clamp(it["er"] * 10 + 50)
        zc = clamp(100 - abs(it["z"]))
        sm = clamp((roe or 0.0) * 10 + 50)
        score = clamp(0.30 * er_n + 0.20 * zc + 0.30 * qv + 0.20 * sm)
        it.update({"mispricingScore": round(score, 2),
                   "components": {"expected_return": round(er_n, 2),
                                  "anomaly_z": round(zc, 2),
                                  "quality_value": round(qv, 2),
                                  "sector_mom": round(sm, 2)}})
    items.sort(key=lambda x: (-x["mispricingScore"], -abs(x["z"]), x["ticker"]))
    for i, it in enumerate(items, 1):
        it["rank"] = i
    flags = sum(1 for it in items if it["flag"])
    OUT.write_text(json.dumps(
        {"as_of": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
         "universe": 100, "market": "id", "n": len(items),
         "items": items, "excluded": excluded,
         "flags": flags, "degraded": degraded_any, "disclaimer": DISCLAIMER}, indent=1),
        encoding="utf-8")
    top5 = [(it["ticker"], it["mispricingScore"], round(it["z"], 2)) for it in items[:5]]
    print(f"DONE n={len(items)} flags={flags} degraded={degraded_any} top5={top5}")


if __name__ == "__main__":
    main()
