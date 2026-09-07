"""Technical analysis agent — Technical Analyst Lite.

Calls 9router /v1/chat/completions with kronos signal; falls back to
`template_memo.technical_memo` + disclaimer on failure.
"""
from __future__ import annotations

import logging

from ..disclaimer import inject as inject_disclaimer
from ..schemas import SynthesizeRequest
from ..template_memo import technical_memo
from ._chat import post_chat

logger = logging.getLogger(__name__)


def _payload(req: SynthesizeRequest) -> str:
    s = req.kronos_signal
    return (
        f"Ticker: {req.ticker} pasar {req.market.value}. "
        f"Expected return {s.expected_return:.4f} anomaly_z {s.anomaly_z:.4f} "
        f"volatility {s.volatility}."
    )


async def run(req: SynthesizeRequest, llm_url: str) -> str:
    """Return technical memo; on 9router failure fall back to template."""
    memo = await post_chat(llm_url, "technical", _payload(req))
    if memo:
        return inject_disclaimer(memo)
    logger.info("technical template fallback for %s", req.ticker)
    return inject_disclaimer(technical_memo(req))
