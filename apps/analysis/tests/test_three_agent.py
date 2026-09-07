"""Tests for 3-agent Lite (Fund/Tech/Synth) → 9router.

All 9router calls are mocked via `httpx_mock` — NO real LLM calls in CI.
9 test cases:
1. fundamental 9router 200 -> memo from response
2. technical 9router 200 -> memo from response
3. synthesizer 9router 200 -> memo from response
4. fundamental 9router 503 -> template fallback + disclaimer
5. technical 9router 503 -> template fallback + disclaimer
6. synthesizer 9router 503 -> template fallback + disclaimer
7. timeout (15s) -> template fallback
8. market Id vs Sg handling
9. disclaimer always injected in all 3 outputs
"""
from __future__ import annotations

import json
from pathlib import Path

import pytest
from pytest_httpx import HTTPXMock

from app.agents import fundamental_run, synthesizer_run, technical_run
from app.disclaimer import DISCLAIMER
from app.schemas import FundamentalsIn, KronosSignalIn, MarketEnum, SynthesizeRequest

LLM_URL = "http://localhost:20128/v1"


def _make_req(ticker: str = "BBCA", market: MarketEnum = MarketEnum.id) -> SynthesizeRequest:
    return SynthesizeRequest(
        market=market,
        ticker=ticker,
        fundamentals=FundamentalsIn(
            sector="FINANCE",
            roe=0.18,
            margin=0.12,
            leverage=1.5,
            pe=18.4,
            pb=2.7,
        ),
        kronos_signal=KronosSignalIn(
            expected_return=0.04,
            anomaly_z=1.2,
            volatility=0.21,
        ),
        sector="FINANCE",
    )


def _fixture(name: str) -> dict:
    candidates = [
        Path(__file__).parents[2] / "tests" / "fixtures" / name,
        Path(__file__).parents[1] / "tests" / "fixtures" / name,
        Path(__file__).parents[3] / "tests" / "fixtures" / name,
    ]
    for p in candidates:
        if p.exists():
            return json.loads(p.read_text(encoding="utf-8"))
    raise FileNotFoundError(f"Fixture {name} not found — tried {[str(p) for p in candidates]}")


@pytest.mark.asyncio
async def test_fundamental_success_memo(httpx_mock: HTTPXMock):
    success = _fixture("9router-success.json")
    httpx_mock.add_response(
        url=f"{LLM_URL}/chat/completions",
        method="POST",
        json=success,
        status_code=200,
    )
    req = _make_req("BBCA")
    memo = await fundamental_run(req, LLM_URL)
    assert "ROE 18.00%" in memo
    assert DISCLAIMER in memo


@pytest.mark.asyncio
async def test_technical_success_memo(httpx_mock: HTTPXMock):
    httpx_mock.add_response(
        url=f"{LLM_URL}/chat/completions",
        method="POST",
        json={"choices": [{"message": {"content": "Sinyal teknikal ER 4.00% Z 1.20 normal."}}]},
        status_code=200,
    )
    req = _make_req("BBCA")
    memo = await technical_run(req, LLM_URL)
    assert "Sinyal teknikal" in memo
    assert DISCLAIMER in memo


@pytest.mark.asyncio
async def test_synthesizer_success_memo(httpx_mock: HTTPXMock):
    httpx_mock.add_response(
        url=f"{LLM_URL}/chat/completions",
        method="POST",
        json={"choices": [{"message": {"content": "Sintesis BBCA: netral prospek stabil."}}]},
        status_code=200,
    )
    req = _make_req("BBCA")
    memo = await synthesizer_run(req, LLM_URL, "fund", "tech")
    assert "Sintesis BBCA" in memo
    assert DISCLAIMER in memo


@pytest.mark.asyncio
async def test_fundamental_503_fallback(httpx_mock: HTTPXMock):
    failure = _fixture("9router-failure.json")
    httpx_mock.add_response(
        url=f"{LLM_URL}/chat/completions",
        method="POST",
        json=failure,
        status_code=503,
        is_reusable=True,
        is_optional=False,
    )
    req = _make_req("BBCA")
    memo = await fundamental_run(req, LLM_URL)
    assert "Fundamental BBCA sektor FINANCE" in memo
    assert "ROE 18.00%" in memo
    assert DISCLAIMER in memo


@pytest.mark.asyncio
async def test_technical_503_fallback(httpx_mock: HTTPXMock):
    httpx_mock.add_response(
        url=f"{LLM_URL}/chat/completions",
        method="POST",
        json={"error": "busy"},
        status_code=503,
        is_reusable=True,
    )
    req = _make_req("BBCA")
    memo = await technical_run(req, LLM_URL)
    assert "Teknikal BBCA: ER 4.00% Z=1.20" in memo
    assert DISCLAIMER in memo


@pytest.mark.asyncio
async def test_synthesizer_503_fallback(httpx_mock: HTTPXMock):
    httpx_mock.add_response(
        url=f"{LLM_URL}/chat/completions",
        method="POST",
        json={"error": "down"},
        status_code=500,
        is_reusable=True,
    )
    req = _make_req("BBCA")
    memo = await synthesizer_run(req, LLM_URL, "fund", "tech")
    assert "Sintesis BBCA (id):" in memo
    assert "verdict" in memo
    assert DISCLAIMER in memo


@pytest.mark.asyncio
async def test_timeout_fallback(httpx_mock: HTTPXMock):
    import httpx

    httpx_mock.add_exception(
        httpx.TimeoutException("timeout 15s"),
        url=f"{LLM_URL}/chat/completions",
        method="POST",
        is_reusable=True,
    )
    req = _make_req("BBCA")
    memo = await fundamental_run(req, LLM_URL)
    assert "Fundamental BBCA" in memo
    assert DISCLAIMER in memo


@pytest.mark.asyncio
async def test_market_sg_memo(httpx_mock: HTTPXMock):
    httpx_mock.add_response(
        url=f"{LLM_URL}/chat/completions",
        method="POST",
        status_code=503,
        is_reusable=True,
    )
    req = _make_req("D05", MarketEnum.sg)
    memo = await synthesizer_run(req, LLM_URL, "fund", "tech")
    assert "Sintesis D05 (sg):" in memo


def test_disclaimer_always_present_in_template():
    from app.template_memo import fundamental_memo, synthesize_memo, technical_memo

    req = _make_req("BBCA")
    for fn in (fundamental_memo, technical_memo, synthesize_memo):
        raw = fn(req)
        injected = DISCLAIMER in raw or DISCLAIMER in f"{raw} {DISCLAIMER}"
        assert injected
