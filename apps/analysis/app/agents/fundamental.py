"""Fundamental analysis agent — Fund Analyst Lite.

Calls 9router /v1/chat/completions with fundamental data; falls back to
`template_memo.fundamental_memo` + disclaimer on failure.
"""
from __future__ import annotations

import logging

from ..disclaimer import inject as inject_disclaimer
from ..schemas import SynthesizeRequest
from ..template_memo import fundamental_memo
from ._chat import post_chat

logger = logging.getLogger(__name__)

def _payload(req: SynthesizeRequest) -> str:
    f = req.fundamentals
    return (
        f"Ticker: {req.ticker} sektor {f.sector} pasar {req.market.value}. "
        f"ROE {f.roe:.4f} margin {f.margin:.4f} leverage {f.leverage:.2f} "
        f"PE {f.pe} PB {f.pb}."
    )

async def run(req: SynthesizeRequest, llm_url: str) -> str:
    """Return fundamental memo; on 9router failure fall back to template."""
    memo = await post_chat(llm_url, "fundamental", _payload(req), model=req.llm_model())
    if memo:
        return inject_disclaimer(memo)
    logger.info("fundamental template fallback for %s", req.ticker)
    return inject_disclaimer(fundamental_memo(req))
