"""Targeted re-fetch for missing Top-10 memos (nemutron)."""
import json
import sqlite3
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCORES = ROOT / "research" / "scores_98.json"
MEMOS = ROOT / "research" / "memos_top10.json"
MODEL = "nemutron"
DISCLAIMER = "Bukan rekomendasi investasi. Informasi & analisis saja."


def synth(ticker, sector, fund, sig):
    body = {"model": MODEL, "market": "id", "ticker": ticker,
            "fundamentals": {"sector": sector, "roe": fund[0], "margin": fund[1],
                             "leverage": fund[2] or 0.0, "pe": fund[3], "pb": fund[4]},
            "kronos_signal": {"expected_return": sig[0], "anomaly_z": sig[1]},
            "sector": sector}
    req = urllib.request.Request("http://localhost:8002/synthesize",
                                 data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=300) as r:
        return json.loads(r.read().decode())


def main():
    scores = json.loads((ROOT / "research" / "scores_98.json").read_text(encoding="utf-8"))
    memos = json.loads((ROOT / "research" / "memos_top10.json").read_text(encoding="utf-8"))
    uni = json.loads((ROOT / "research" / "universe-100.json").read_text(encoding="utf-8"))
    sectors = {u["ticker"]: u.get("sector", "") for u in uni["items"]}
    top10 = scores["items"][:10]
    con = sqlite3.connect(ROOT / "data" / "seith.db", timeout=30)
    memo_map = memos.get("memos", {})
    missing = [sc for sc in top10 if sc["ticker"] not in memo_map or memo_map.get(sc["ticker"], {}).get("source") != "llm"]
    print(f"to fetch: {[m['ticker'] for m in missing]}", flush=True)
    llm_n, degraded_n = 0, 0
    for i, sc in enumerate(missing):
        t = sc["ticker"]
        fund = con.execute(
            "SELECT roe,margin,leverage,pe,pb FROM fundamentals WHERE ticker=?", (t,)).fetchone()
        try:
            out = synth(t, sectors.get(t, ""), fund, (sc["er"], sc["z"]))
            if out.get("degraded"):
                degraded_n += 1
            else:
                llm_n += 1
            memo_map[t] = {"rank": sc["rank"], "source": "llm" if not out.get("degraded") else "template",
                           "model": MODEL, "degraded": out.get("degraded", False),
                           "fundamental_memo": out["fundamental_memo"],
                           "technical_memo": out["technical_memo"],
                           "synthesizer_memo": out["synthesizer_memo"]}
            print(f"[{i + 1}/{len(missing)}] {t} degraded={out.get('degraded')} "
                  f"len={len(out.get('synthesizer_memo',''))}", flush=True)
        except Exception as e:  # noqa: BLE001 - degraded path stays honest
            degraded_n += 1
            memo_map[t] = {"rank": sc["rank"], "source": "error", "model": MODEL,
                           "degraded": True, "error": str(e)[:200]}
            print(f"[{i + 1}/{len(missing)}] {t} ERROR {str(e)[:150]}", flush=True)
        time.sleep(2)
    con.close()
    memos["memos"] = memo_map
    memos["llm_ok"] = sum(1 for m in memo_map.values() if m.get("source") == "llm")
    memos["degraded"] = sum(1 for m in memo_map.values() if m.get("degraded"))
    (ROOT / "research" / "memos_top10.json").write_text(json.dumps(memos, indent=1), encoding="utf-8")
    print(f"DONE llm_ok={llm_n} degraded={degraded_n} total_memos={len(memo_map)}")


if __name__ == "__main__":
    main()