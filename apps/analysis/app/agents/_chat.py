"""9router Chat Completions helper — httpx OpenAI-compatible bridge.

Shared retry + timeout + fallback logic for the 3 agents.
- timeout 15s per call
- 1 retry on transient failure (timeout / 5xx)
- never raises; returns "" on total failure so caller falls back to template
"""
from __future__ import annotations

import logging
from typing import Any

import httpx

logger = logging.getLogger(__name__)

TIMEOUT = 15.0
MAX_RETRIES = 1
MODEL = "gpt-4o-mini"

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


def _payload(kind: str, user_content: str) -> dict[str, Any]:
    return {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": _SYSTEM_PROMPTS[kind]},
            {"role": "user", "content": user_content},
        ],
    }


async def post_chat(
    llm_url: str,
    kind: str,
    user_content: str,
) -> str:
    """POST to 9router /v1/chat/completions; retry once on transient error.

    Returns memo content string. Empty string == failure (caller falls back).
    """
    url = f"{llm_url.rstrip('/')}/chat/completions"
    body = _payload(kind, user_content)
    for attempt in range(MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient(timeout=TIMEOUT) as client:
                r = await client.post(url, json=body)
                r.raise_for_status()
                data = r.json()
            msg = data["choices"][0]["message"]["content"]
            if isinstance(msg, str) and msg:
                return msg.strip()
        except (httpx.TimeoutException, httpx.HTTPStatusError) as exc:
            logger.debug("%s attempt %d failed: %s", kind, attempt, exc)
    return ""
