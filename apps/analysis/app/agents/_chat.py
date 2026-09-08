"""9router Chat Completions helper — httpx OpenAI-compatible bridge.

Shared retry + timeout + fallback logic for the 3 agents.
- timeout 15s per call
- 1 retry on transient failure (timeout / 5xx)
- fallback to SEITH_LLM_FALLBACK_MODEL on 429/5xx
- never raises; returns "" on total failure so caller falls back to template
"""
from __future__ import annotations

import logging
import os
from typing import Any

import httpx

logger = logging.getLogger(__name__)

TIMEOUT = 15.0
MAX_RETRIES = 1


def _model() -> str:
    return os.getenv("SEITH_LLM_MODEL", "SEITH-MARKET-IDX")


def _fallback_model() -> str:
    return os.getenv("SEITH_LLM_FALLBACK_MODEL", "Seith-AI-Trading")


def _api_key() -> str:
    return os.getenv("SEITH_API_KEY", "")


_SYSTEM_PROMPTS = {
    "fundamental": (
        "Anda analis fundamental sekaligus. Berikan ringkasan singkat (1 kalimat, "
        "<60 kata) tentang kualitas keuangan emiten Indonesia/Singapura berdasarkan "
        "ROE, margin, leverage, PER, PB. No boilerplate, no disclaimer injection."
    ),
    "technical": (
        "Anda analis teknikal. Ringkaskan sinyal momentum dan volatilitas "
        "(expected return, Z-score, volatilitas) dalam 1 kalimat <50 kata. "
        "Tandai |Z|>2 sebagai potensi anomali. No boilerplate."
    ),
    "synthesizer": (
        "Anda synthesiser. Gabungkan catatan fundamental + teknikal ke dalam 1 "
        "paragraf (2-3 kalimat) dengan verdict singkat (netral/buy/caution). "
        "Tekankan data numerik. No boilerplate, no disclaimer."
    ),
}


def _payload(kind: str, user_content: str, model: str | None = None) -> dict[str, Any]:
    return {
        "model": model or _model(),
        "messages": [
            {"role": "system", "content": _SYSTEM_PROMPTS[kind]},
            {"role": "user", "content": user_content},
        ],
    }


def _headers() -> dict[str, str]:
    k = _api_key()
    return {"Authorization": f"Bearer {k}"} if k else {}


async def post_chat(
    llm_url: str,
    kind: str,
    user_content: str,
    model: str | None = None,
) -> str:
    """POST to 9router /v1/chat/completions; retry once on transient error.

    Returns memo content string. Empty string == failure (caller falls back).
    Falls back to SEITH_LLM_FALLBACK_MODEL on 429/5xx.
    """
    url = f"{llm_url.rstrip('/')}/chat/completions"
    primary = model or _model()
    fallback = _fallback_model()
    models = [primary] if primary == fallback else [primary, fallback]
    for m in models:
        body = _payload(kind, user_content, m)
        hdrs = _headers()
        for attempt in range(MAX_RETRIES + 1):
            try:
                async with httpx.AsyncClient(timeout=TIMEOUT) as client:
                    r = await client.post(url, json=body, headers=hdrs)
                    r.raise_for_status()
                    data = r.json()
                msg = data["choices"][0]["message"]["content"]
                if isinstance(msg, str) and msg:
                    return msg.strip()
                return ""
            except httpx.HTTPStatusError as exc:
                s = exc.response.status_code
                if s == 429 or 500 <= s <= 599:
                    logger.debug("%s model %s status %s attempt %d", kind, m, s, attempt)
                    if m == primary and models[-1] == fallback:
                        break
                    if attempt < MAX_RETRIES:
                        continue
                return ""
            except (httpx.TimeoutException, httpx.ConnectError) as exc:
                logger.debug("%s attempt %d failed: %s", kind, attempt, exc)
                if attempt < MAX_RETRIES:
                    continue
                break
            except Exception as exc:  # noqa: BLE001
                logger.debug("%s failed: %s", kind, exc)
                break
        if m == primary and fallback != primary:
            continue
        break
    return ""
