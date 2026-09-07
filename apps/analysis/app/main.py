"""SEITH Analysis Sidecar FastAPI :8002.

Endpoints:
- GET  /health      -> sidecar status, 9router reachability flag, model marker
- POST /synthesize  -> 3-agent Lite research memo (Fund/Tech/Synth)

Delegates to `app.agents.*` when available (Task 02); falls back to numeric
template memo + disclaimer whenever the 9router is down or returns non-2xx.
"""
from __future__ import annotations

import logging
import os
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException, status

from .disclaimer import inject as inject_disclaimer
from .schemas import DISCLAIMER_DEFAULT, SynthesizeRequest, SynthesizeResponse
from .template_memo import fundamental_memo, synthesize_memo, technical_memo

logger = logging.getLogger(__name__)

app = FastAPI(title="seith-analysis")

DEFAULT_LLM_BASE_URL = "http://localhost:20128/v1"
LLM_HEALTH_TIMEOUT = float(os.getenv("SEITH_LLM_HEALTH_TIMEOUT", "2.0"))


def _llm_base_url() -> str:
    return os.getenv("LLM_BASE_URL", DEFAULT_LLM_BASE_URL).rstrip("/")


async def _nine_router_status() -> str:
    """Probe 9router liveness; non-2xx/timeout -> 'down'."""
    try:
        async with httpx.AsyncClient(timeout=LLM_HEALTH_TIMEOUT) as client:
            r = await client.get(f"{_llm_base_url()}/models")
            return "up" if r.status_code == 200 else "down"
    except httpx.HTTPError:
        return "down"


@app.get("/health")
async def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "nine_router": await _nine_router_status(),
        "max_context": 512,
        "model": "3-agent-lite",
        "disclaimer": DISCLAIMER_DEFAULT,
    }


async def _run_one(coro) -> tuple[str, bool]:
    """Await a single agent coroutine; degraded branch returns empty str."""
    try:
        out = await coro
        if isinstance(out, str) and out:
            return out, False
    except Exception as exc:  # noqa: BLE001
        logger.debug("agent execution failed: %s", exc)
    return "", True


async def _build_response(req: SynthesizeRequest, llm_url: str) -> SynthesizeResponse:
    """Build the 3-memo response, falling back to template when agents fail.

    Agents imported lazily so the sidecar still boots without them installed.
    """
    try:
        from .agents import fundamental_run, synthesizer_run, technical_run

        fund, f_deg = await _run_one(fundamental_run(req, llm_url))
        tech, t_deg = await _run_one(technical_run(req, llm_url))
        synth, s_deg = await _run_one(synthesizer_run(req, llm_url, fund, tech))
        degraded = f_deg or t_deg or s_deg
        return SynthesizeResponse(
            fundamental_memo=fund or inject_disclaimer(fundamental_memo(req)),
            technical_memo=tech or inject_disclaimer(technical_memo(req)),
            synthesizer_memo=synth or inject_disclaimer(synthesize_memo(req)),
            degraded=degraded,
        )
    except ImportError:
        return SynthesizeResponse(
            fundamental_memo=inject_disclaimer(fundamental_memo(req)),
            technical_memo=inject_disclaimer(technical_memo(req)),
            synthesizer_memo=inject_disclaimer(synthesize_memo(req)),
            degraded=True,
        )


@app.post("/synthesize", response_model=SynthesizeResponse)
async def synthesize(req: SynthesizeRequest) -> SynthesizeResponse:
    if not DISCLAIMER_DEFAULT:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="disclaimer missing",
        )
    return await _build_response(req, _llm_base_url())
