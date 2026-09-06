import json
import pathlib

import pytest

from app.predictor import (
    MockPredictor,
    _df_from_ohlcv,
    load_predictor,
    predict,
    predict_batch,
    to_ohlcv_list,
)


def _ohlcv_dict(n, base=100.0):
    return [
        {"open": base + i * 0.01, "high": base + i * 0.01 + 1, "low": base + i * 0.01 - 1, "close": base + i * 0.01, "volume": 1000.0, "amount": 100000.0, "timestamp": i}
        for i in range(n)
    ]


def _ohlcv_objs(n):
    from app.schemas import OhlcvIn

    return [OhlcvIn(open=100 + i * 0.01, high=101 + i * 0.01, low=99 + i * 0.01, close=100 + i * 0.01, volume=1000.0, amount=100000.0, timestamp=i) for i in range(n)]


def test_mock_predict_400_to_20_deterministic():
    df = _ohlcv_objs(400)
    a = predict(df, list(range(400)), list(range(400, 420)), 20)
    b = predict(df, list(range(400)), list(range(400, 420)), 20)
    assert len(a) == 20
    assert a == b
    assert all(v["volume"] == 0.0 for v in a)


def test_mock_predict_batch_3x400_ok():
    dfs = [_ohlcv_objs(400) for _ in range(3)]
    xt = [list(range(400)) for _ in range(3)]
    yt = [list(range(400, 420)) for _ in range(3)]
    out = predict_batch(dfs, xt, yt, 20)
    assert len(out) == 3
    assert all(len(x) == 20 for x in out)


def test_mock_predict_unequal_raises():
    dfs = [_ohlcv_objs(400), _ohlcv_objs(380)]
    xt = [list(range(400)), list(range(380))]
    yt = [list(range(400, 420)), list(range(380, 400))]
    with pytest.raises(ValueError, match="equal lookback"):
        predict_batch(dfs, xt, yt, 20)


def test_mock_predict_lookback_520_raises():
    df = _ohlcv_objs(500)
    with pytest.raises(ValueError, match="max_context 512"):
        predict(df, list(range(500)), list(range(500, 520)), 20)


def test_df_from_ohlcv_volume_none_to_zero():
    rows = [{"open": 1, "high": 2, "low": 0.5, "close": 1.5, "volume": None, "amount": None, "timestamp": 0}]
    out = _df_from_ohlcv(rows)
    assert out[0]["volume"] == 0.0
    assert out[0]["amount"] == 0.0


def test_to_ohlcv_list_len_20():
    df = _ohlcv_objs(10)
    pred = predict(df, list(range(10)), list(range(10, 30)), 20)
    lst = to_ohlcv_list(pred)
    assert len(lst) == 20
    assert all("close" in x for x in lst)


def test_mock_T_top_p_passthrough():
    df = _ohlcv_objs(100)
    a = predict(df, list(range(100)), list(range(100, 120)), 20, T=0.5, top_p=0.8)
    assert len(a) == 20


def test_load_predictor_mock_no_torch():
    p = load_predictor(mock=True)
    assert isinstance(p, MockPredictor)


@pytest.mark.slow
def test_fixture_kronos_pred_20_exists():
    p = pathlib.Path(__file__).parents[2] / "tests" / "fixtures" / "kronos-pred-20.json"
    if not p.exists():
        p = pathlib.Path(__file__).parents[3] / "tests" / "fixtures" / "kronos-pred-20.json"
    assert p.exists()
    data = json.loads(p.read_text())
    assert len(data) == 20
    assert all("close" in x for x in data)
