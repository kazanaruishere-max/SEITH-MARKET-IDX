from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _ohlcv(n, base=100.0):
    out = []
    for i in range(n):
        v = base + i * 0.01
        out.append(
            {
                "open": v,
                "high": v + 1,
                "low": v - 1,
                "close": v,
                "volume": 1000.0,
                "amount": 100000.0,
                "timestamp": i,
            }
        )
    return out


def _payload(n=400, pred_len=20, market="id"):
    df = _ohlcv(n)
    return {
        "market": market,
        "df": df,
        "x_timestamp": list(range(n)),
        "y_timestamp": list(range(n, n + pred_len)),
        "pred_len": pred_len,
    }


def test_health_200():
    r = client.get("/health")
    assert r.status_code == 200
    j = r.json()
    assert j["status"] == "ok"
    assert j["max_context"] == 512
    assert j["model"] in ("mock", "Kronos-base")
    assert j["device"] in ("cpu", "cuda")


def test_predict_400_to_20_ok():
    r = client.post("/predict", json=_payload(400, 20))
    assert r.status_code == 200
    j = r.json()
    assert len(j["pred_df"]) == 20
    assert j["degraded"] is False
    assert all("close" in x for x in j["pred_df"])


def test_predict_volume_none_to_zero():
    p = _payload(10, 5)
    for row in p["df"]:
        row["volume"] = None
        row["amount"] = None
    r = client.post("/predict", json=p)
    assert r.status_code == 200
    assert all(v["volume"] == 0.0 for v in r.json()["pred_df"])


def test_predict_pred_len_600_guard_422():
    r = client.post("/predict", json=_payload(10, 600))
    assert r.status_code == 422


def test_predict_500_plus_20_exceeds_512():
    r = client.post("/predict", json=_payload(500, 20))
    assert r.status_code == 422
    assert "max_context 512" in str(r.json())


def test_predict_batch_3x400_ok():
    df = _ohlcv(400)
    xt = [list(range(400)) for _ in range(3)]
    yt = [list(range(400, 420)) for _ in range(3)]
    body = {
        "market": "id",
        "dfs": [df, df, df],
        "x_timestamps": xt,
        "y_timestamps": yt,
        "pred_len": 20,
    }
    r = client.post("/predict_batch", json=body)
    assert r.status_code == 200
    j = r.json()
    assert len(j["pred_dfs"]) == 3
    assert all(len(x) == 20 for x in j["pred_dfs"])
    assert j["degraded"] is False


def test_predict_batch_unequal_422():
    df400 = _ohlcv(400)
    df380 = _ohlcv(380)
    body = {
        "market": "id",
        "dfs": [df400, df380],
        "x_timestamps": [list(range(400)), list(range(380))],
        "y_timestamps": [list(range(400, 420)), list(range(380, 400))],
        "pred_len": 20,
    }
    r = client.post("/predict_batch", json=body)
    assert r.status_code == 422
    assert "equal lookback" in str(r.json())


def test_predict_batch_empty_422():
    body = {
        "market": "id",
        "dfs": [],
        "x_timestamps": [],
        "y_timestamps": [],
        "pred_len": 20,
    }
    r = client.post("/predict_batch", json=body)
    assert r.status_code == 422

