"""Tests for `apps/analysis` FastAPI contract.

All HTTP exercised through `TestClient(app)` — no real 9router calls,
no real network. Validation boundary is the unit under test.
"""
from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app
from app.schemas import DISCLAIMER_DEFAULT

client = TestClient(app)


def _payload(ticker: str = "BBCA", market: str = "id") -> dict:
    return {
        "market": market,
        "ticker": ticker,
        "fundamentals": {
            "sector": "FINANCE",
            "roe": 0.18,
            "margin": 0.12,
            "leverage": 1.5,
            "pe": 18.4,
            "pb": 2.7,
        },
        "kronos_signal": {
            "expected_return": 0.04,
            "anomaly_z": 1.2,
            "volatility": 0.21,
        },
        "sector": "FINANCE",
    }


def test_health_200_has_keys():
    r = client.get("/health")
    assert r.status_code == 200, r.text
    j = r.json()
    assert j["status"] == "ok"
    assert j["nine_router"] in {"up", "down"}
    assert j["max_context"] == 512
    assert j["model"] == "3-agent-lite"
    assert j["disclaimer"] == DISCLAIMER_DEFAULT


def test_synthesize_200_returns_three_memos():
    r = client.post("/synthesize", json=_payload("BBCA"))
    assert r.status_code == 200, r.text
    j = r.json()
    for key in ("fundamental_memo", "technical_memo", "synthesizer_memo"):
        assert isinstance(j[key], str) and len(j[key]) > 0, key
    assert isinstance(j["degraded"], bool)
    assert j["disclaimer"] == DISCLAIMER_DEFAULT
    assert DISCLAIMER_DEFAULT in j["fundamental_memo"]


def test_synthesize_market_sg_accepted():
    r = client.post("/synthesize", json=_payload("D05", "sg"))
    assert r.status_code == 200, r.text
    assert "sg" in r.json()["synthesizer_memo"]


def test_synthesize_ticker_lowercase_422():
    r = client.post("/synthesize", json=_payload("bbca"))
    assert r.status_code == 422, r.text
    assert "ticker regex" in str(r.json()).lower() or "ticker" in str(r.json()).lower()


def test_synthesize_ticker_too_short_422():
    r = client.post("/synthesize", json=_payload("AB"))
    assert r.status_code == 422, r.text


def test_synthesize_market_invalid_422():
    body = _payload("BBCA")
    body["market"] = "xx"
    r = client.post("/synthesize", json=body)
    assert r.status_code == 422, r.text


def test_synthesize_extra_field_422():
    body = _payload("BBCA")
    body["unexpected"] = True
    r = client.post("/synthesize", json=body)
    assert r.status_code == 422, r.text


def test_synthesize_sector_mismatch_422():
    body = _payload("BBCA")
    body["sector"] = "ENERGY"
    r = client.post("/synthesize", json=body)
    assert r.status_code == 422, r.text
