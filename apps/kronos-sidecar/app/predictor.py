import os

MAX_CONTEXT = 512

_model = None
_tokenizer = None
_predictor = None


def _is_mock() -> bool:
    return os.getenv("KRONOS_MOCK", "0") == "1"


def get_device() -> str:
    if _is_mock():
        return "cpu"
    try:
        import torch

        return "cuda" if torch.cuda.is_available() else "cpu"
    except Exception:  # noqa: BLE001
        return "cpu"


class MockPredictor:
    def predict(self, df, x_timestamp, y_timestamp, pred_len, T=1.0, top_p=0.9):
        return _mock_forecast(df, y_timestamp, pred_len)

    def predict_batch(self, dfs, x_timestamps, y_timestamps, pred_len, T=1.0, top_p=0.9):
        out = []
        for i, df in enumerate(dfs):
            yt = y_timestamps[i] if i < len(y_timestamps) else []
            xt = x_timestamps[i] if i < len(x_timestamps) else []
            out.append(self.predict(df, xt, yt, pred_len, T, top_p))
        return out


def _mock_forecast(df, y_timestamp, pred_len):
    last_close = 100.0
    if df:
        last = df[-1]
        try:
            last_close = float(last.close)
        except AttributeError:
            last_close = float(last.get("close", 100.0) if isinstance(last, dict) else 100.0)
        if last_close == 0:
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


def load_predictor(mock=None):
    global _model, _tokenizer, _predictor
    use_mock = _is_mock() if mock is None else mock
    if use_mock:
        return MockPredictor()
    if _predictor is not None:
        return _predictor
    try:
        from model import Kronos, KronosPredictor
        from model.KronosTokenizer import KronosTokenizer

        _tokenizer = KronosTokenizer.from_pretrained("NeoQuasar/Kronos-Tokenizer-base")
        _model = Kronos.from_pretrained("NeoQuasar/Kronos-base")
        _predictor = KronosPredictor(_model, _tokenizer, device=get_device(), max_context=MAX_CONTEXT)
        return _predictor
    except Exception:  # noqa: BLE001
        return MockPredictor()


def _validate_context(n, pred_len):
    if pred_len > MAX_CONTEXT:
        raise ValueError("max_context 512")
    if n + pred_len > MAX_CONTEXT:
        raise ValueError("max_context 512")


def _df_from_ohlcv(rows):
    out = []
    for r in rows:
        try:
            o = float(r.open)
            h = float(r.high)
            lo = float(r.low)
            c = float(r.close)
        except AttributeError:
            o = float(r.get("open", 0))
            h = float(r.get("high", 0))
            lo = float(r.get("low", 0))
            c = float(r.get("close", 0))
        if o == 0 and h == 0 and lo == 0 and c == 0:
            continue
        v = r.volume if hasattr(r, "volume") else r.get("volume", None) if isinstance(r, dict) else None
        a = r.amount if hasattr(r, "amount") else r.get("amount", None) if isinstance(r, dict) else None
        v = 0.0 if v is None else float(v)
        a = 0.0 if a is None else float(a)
        ts = int(r.timestamp) if hasattr(r, "timestamp") else int(r.get("timestamp", 0))
        out.append({"open": o, "high": h, "low": lo, "close": c, "volume": v, "amount": a, "timestamp": ts})
    return out


def predict(df, x_timestamp, y_timestamp, pred_len, T=1.0, top_p=0.9):
    _validate_context(len(df), pred_len)
    predictor = load_predictor()
    if isinstance(predictor, MockPredictor):
        return predictor.predict(df, x_timestamp, y_timestamp, pred_len, T, top_p)
    clean = _df_from_ohlcv(df)
    return predictor.predict(clean, x_timestamp, y_timestamp, pred_len, T, top_p)


def predict_batch(dfs, x_timestamps, y_timestamps, pred_len, T=1.0, top_p=0.9):
    if not dfs:
        raise ValueError("equal lookback")
    first = len(dfs[0])
    _validate_context(first, pred_len)
    for df in dfs:
        if len(df) != first:
            raise ValueError("equal lookback")
    if len(x_timestamps) != len(dfs) or len(y_timestamps) != len(dfs):
        raise ValueError("equal lookback")
    predictor = load_predictor()
    if isinstance(predictor, MockPredictor):
        return predictor.predict_batch(dfs, x_timestamps, y_timestamps, pred_len, T, top_p)
    return predictor.predict_batch(dfs, x_timestamps, y_timestamps, pred_len, T, top_p)


def to_ohlcv_list(pred_df):
    if not pred_df:
        return []
    out = []
    for r in pred_df:
        if isinstance(r, dict):
            out.append(
                {
                    "open": float(r.get("open", 0)),
                    "high": float(r.get("high", 0)),
                    "low": float(r.get("low", 0)),
                    "close": float(r.get("close", 0)),
                    "volume": float(r.get("volume", 0) or 0),
                    "amount": float(r.get("amount", 0) or 0),
                    "timestamp": int(r.get("timestamp", 0)),
                }
            )
        else:
            out.append(
                {
                    "open": float(r.open),
                    "high": float(r.high),
                    "low": float(r.low),
                    "close": float(r.close),
                    "volume": float(getattr(r, "volume", 0) or 0),
                    "amount": float(getattr(r, "amount", 0) or 0),
                    "timestamp": int(getattr(r, "timestamp", 0)),
                }
            )
    return out
