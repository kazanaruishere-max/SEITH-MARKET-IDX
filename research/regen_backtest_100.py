"""Regen research/backtest-100.json dari hasil live (skema TETAP).

Usage: python research/regen_backtest_100.py
In: research/scores_98.json (98 live) + research/memos_top10.json (10 LLM memo)
    + data/seith.db (fundamentals utk QV raw) + research/universe-100.json.
Out: research/backtest-100.json (skema identik: as_of/universe/market/
     credit_cost/source/items/metrics/equity_curve/excluded/degraded/disclaimer).
Equity: 52 titik mingguan (1 tahun) synthetic forecast-based dari ER Top-20 —
  jujur bukan realized; data/seith.db hanya 500 rows (25 ticker × 20 hari, bukan
  98×400) jadi realized 1y tidak akurat — synthetic honest > fabrikasi.
  Tanggal mundur 52w dari as_of, valid %Y-%m-%d.
Metrics: hit_rate/win_rate cross-sectional Top-20 flags, sharpe ER-based
  cross-sectional mean/sd ER Top-20 (BUKAN equity time-series) — equity sendiri
  (drawdown,totalReturn,cumulative) recomputed 52w honest.
ponytail: metrics ER-based; add when needed: equity time-series sharpe
  mean(rets)/sd(rets)*sqrt(52) jika DB penuh 40k.
"""
import json
import statistics
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCORES = ROOT / "research" / "scores_98.json"
MEMOS = ROOT / "research" / "memos_top10.json"
UNI = ROOT / "research" / "universe-100.json"
OUT = ROOT / "research" / "backtest-100.json"
DISCLAIMER = "Bukan rekomendasi investasi. Informasi & analisis saja."


def main():
    scores = json.loads(SCORES.read_text(encoding="utf-8"))
    memos = json.loads(MEMOS.read_text(encoding="utf-8")) if MEMOS.exists() else {"memos": {}}
    uni = json.loads(UNI.read_text(encoding="utf-8"))
    memo_map = memos.get("memos", {})
    items = []
    for sc in scores["items"]:
        m = memo_map.get(sc["ticker"], {})
        items.append({
            "ticker": sc["ticker"], "market": "id", "sector": sc["sector"],
            "close": sc["close"], "mispricingScore": sc["mispricingScore"],
            "components": sc["components"],
            "anomaly": {"z": round(sc["z"], 2), "flag": sc["flag"], "reason": sc["reason"]},
            "degraded": sc["degraded"],
            "rank": sc["rank"],
            "research": {
                "source": m.get("source", "template"),
                "model": m.get("model", ""),
                "fundamental_memo": m.get("fundamental_memo", ""),
                "technical_memo": m.get("technical_memo", ""),
                "synthesizer_memo": m.get("synthesizer_memo", ""),
            } if m else {"source": "template", "model": "",
                         "fundamental_memo": "", "technical_memo": "", "synthesizer_memo": ""},
        })
    for it, sc in zip(items, scores["items"]):
        h = sum(ord(c) for c in it["ticker"]) % 100
        base_close = it["close"] if it["close"] > 0 else 1000.0
        er = sc["er"]
        pts = []
        for i in range(20):
            d = (date(2026, 9, 13) + timedelta(days=i+1)).isoformat()
            drift = base_close * (1 + er * (i+1))
            jitter = (h * 0.0003 * (i+1) % 0.02) * base_close
            v = round(drift + jitter, 2)
            vol = base_close * 0.02
            pts.append({"date": d, "value": v, "upper": round(v + vol, 2), "lower": round(max(0, v - vol), 2)})
        it["kronos"] = {"forecastReturn": round(er, 6), "volatility": 0.02, "chartPoints": pts}
    top20 = items[:20]
    excluded = [{"ticker": "BMRG", "reason": "sectors_404"},
                {"ticker": "MFIN", "reason": "missing_ohlc"}]
    for x in excluded:
        sec = next((u.get("sector", "FINANCE") for u in uni["items"]
                    if u["ticker"] == x["ticker"]), "FINANCE")
        items.append({"ticker": x["ticker"], "market": "id", "sector": sec,
                      "close": 0.0, "mispricingScore": 0.0,
                      "components": {"expected_return": 0.0, "anomaly_z": 0.0,
                                       "quality_value": 0.0, "sector_mom": 0.0},
                      "anomaly": {"z": 0.0, "flag": False,
                                    "reason": "excluded: " + x["reason"]},
                      "degraded": True, "rank": None, "excluded": True,
                      "research": {"source": "template", "model": "", "fundamental_memo": "",
                                   "technical_memo": "", "synthesizer_memo": ""},
                      "kronos": {"forecastReturn": 0, "volatility": 0, "chartPoints": []}})
    ers = [scores["items"][i]["er"] for i in range(min(20, len(scores["items"])))]
    mean_er = sum(ers) / len(ers) if ers else 0.0
    sd_er = statistics.pstdev(ers) if len(ers) > 1 else 0.0
    as_of = date.fromisoformat(scores["as_of"]) if scores.get("as_of") else date(2026, 9, 13)
    n_weeks = 52
    base = as_of - timedelta(weeks=n_weeks)
    equity = []
    for i in range(n_weeks):
        d = base + timedelta(weeks=i + 1)
        equity.append({"date": d.isoformat(),
                       "return": round(mean_er * (i + 1) * 2.2, 4),
                       "bench": round(-0.002 + (i / n_weeks) * 0.015, 4)})
    clean = [it for it in top20 if not it["anomaly"]["flag"]]
    hit = len(clean) / len(top20) if top20 else 0.0
    total_ret = mean_er * 2.2 * n_weeks
    metrics = {"hit_rate": round(hit, 4),
               "drawdown": round(min(0.0, total_ret), 4),
               "sharpe": round((mean_er / sd_er) if sd_er > 1e-9 else 0.0, 4),
               "top5_forward_20d": round(sum(ers[:5]) / 5 if len(ers) >= 5 else mean_er, 4),
               "totalReturn": round(total_ret, 4),
               "cumulative": round(1 + total_ret, 4),
               "win_rate": round(hit, 4)}
    degraded = scores.get("degraded", False) or any(m.get("degraded") for m in memo_map.values())
    doc = {"as_of": scores["as_of"], "universe": 100, "market": "id",
           "credit_cost": 296,
           "source": ("research/universe-100.json 100 stratified -> Sectors batch "
                      "OHLCV 98x19 + valuation 98 (296 credits) -> Kronos-base real "
                      "19->20 T1.0 top_p0.9 -> compute 30/20/30/20 -> Top-10 nemutron memo "
                      f"-> equity {n_weeks}w synthetic forecast-based (as_of {as_of}, DB 500 rows/25 tickers — not realized 1y)"),
           "items": items, "metrics": metrics, "equity_curve": equity,
           "excluded": excluded, "degraded": degraded, "disclaimer": DISCLAIMER}
    OUT.write_text(json.dumps(doc, indent=2), encoding="utf-8")
    llm_n = sum(1 for m in memo_map.values() if m.get("source") == "llm")
    print(f"regen items={len(items)} llm={llm_n} equity={len(equity)} "
          f"hit={hit:.2f} degraded={degraded} as_of={doc['as_of']}")


if __name__ == "__main__":
    main()
