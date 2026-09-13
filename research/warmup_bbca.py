"""Warm-up predict_batch real 1 ticker dari L2 (BBCA)."""
import json
import sqlite3
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
c = sqlite3.connect(ROOT / "data" / "seith.db")
rows = c.execute(
    "SELECT date,open,high,low,close,volume FROM ohlcv WHERE ticker='BBCA' ORDER BY date"
).fetchall()
print("bbca rows:", len(rows))
assert len(rows) == 19, rows
import datetime

base = datetime.datetime(2026, 9, 12, tzinfo=datetime.timezone.utc)
df = [
    {"open": o, "high": h, "low": lo, "close": cl, "volume": v or 0.0,
     "amount": 0.0, "timestamp": int(base.timestamp()) - (19 - i) * 86400}
    for i, (_, o, h, lo, cl, v) in enumerate(rows)
]
xt = [r["timestamp"] for r in df]
yt = [xt[-1] + (i + 1) * 86400 for i in range(20)]
body = json.dumps({"market": "id", "dfs": [df], "x_timestamps": [xt],
                   "y_timestamps": [yt], "pred_len": 20, "T": 1.0, "top_p": 0.9}).encode()
req = urllib.request.Request("http://localhost:8001/predict_batch", data=body,
                             headers={"Content-Type": "application/json"})
with urllib.request.urlopen(req, timeout=600) as r:
    out = json.loads(r.read().decode())
preds = out["pred_dfs"][0]
print("n_pred:", len(preds), "degraded:", out["degraded"])
print("first close:", preds[0]["close"], "last close:", preds[-1]["close"])
assert len(preds) == 20 and not out["degraded"]
print("REAL OK" if abs(preds[0]["close"] - 6325 * 1.001) > 1e-6 else "MOCK SUSPECT")
