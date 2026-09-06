import os


def get_device() -> str:
    return "cpu"


def _is_mock() -> bool:
    return os.getenv("KRONOS_MOCK", "0") == "1"


def predict(df, x_timestamp, y_timestamp, pred_len, T=1.0, top_p=0.9):
    last_close = 0.0
    if df:
        last = df[-1]
        last_close = float(last.close if hasattr(last, "close") else last.get("close", 0))
        if last_close == 0:
            last_close = 100.0
    else:
        last_close = 100.0
    out = []
    for i in range(pred_len):
        v = last_close * (1 + 0.001 * (i + 1))
        out.append(
            {
                "open": v,
                "high": v * 1.005,
                "low": v * 0.995,
                "close": v,
                "volume": 0.0,
                "amount": 0.0,
                "timestamp": int(y_timestamp[i]) if i < len(y_timestamp) else 0,
            }
        )
    return out


def predict_batch(dfs, x_timestamps, y_timestamps, pred_len, T=1.0, top_p=0.9):
    results = []
    for idx, df in enumerate(dfs):
        xt = x_timestamps[idx] if idx < len(x_timestamps) else []
        yt = y_timestamps[idx] if idx < len(y_timestamps) else []
        results.append(predict(df, xt, yt, pred_len, T, top_p))
    return results
