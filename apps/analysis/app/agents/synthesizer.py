"""Synthesizer agent — Sintesis Lite.

Calls 9router /v1/chat/completions with both fundamental + technical memos;
falls back to `template_memo.synthesize_memo` + disclaimer on failure.
"""
from __future__ import annotations

import logging

from ..disclaimer import inject as inject_disclaimer
from ..schemas import SynthesizeRequest
from ..template_memo import synthesize_memo
from ._chat import post_chat

logger = logging.getLogger(__name__)

def _payload(req: SynthesizeRequest, fundamental: str, technical: str) -> str:
    return (
        f"Ticker: {req.ticker} pasar {req.market.value} sektor {req.sector}. "
        f"Fundamental: {fundamental} "
        f"Teknikal: {technical} "
        "Berikan 1 paragraf (2-3 kalimat) dengan verdict singkat "
        "(netral/buy/caution) berdasarkan data numerik di atas."
    )

async def run(
    req: SynthesizeRequest,
    llm_url: str,
    fundamental: str,
    technical: str,
) -> str:
    """Return synthesizer memo; on 9router failure fall back to template."""
    memo = await post_chat(
        llm_url, "synthesizer", _payload(req, fundamental, technical), model=req.llm_model()
    )
    if memo:
        return inject_disclaimer(memo)
    logger.info("synthesizer template fallback for %s", req.ticker)
    return inject_disclaimer(synthesize_memo(req))
