"""Numeric deterministic template memo generators.

Pure functions — no LLM call. Used as fallback when 9router is down
(`degraded:true`) and as the deterministic baseline for tests. Bahasa Indonesia
ringkas, no AI wording, no prose equality — only numeric facts.
"""
from __future__ import annotations

from .schemas import SynthesizeRequest

_ANOMALY_THRESHOLD = 2.0


def _fmt_pct(x: float) -> str:
    return f"{x * 100:.2f}%"


def _verdict(z: float) -> str:
    if abs(z) >= _ANOMALY_THRESHOLD:
        return "caution"
    if z > 0.5:
        return "buy"
    if z < -0.5:
        return "caution"
    return "netral"


def fundamental_memo(req: SynthesizeRequest) -> str:
    f = req.fundamentals
    pe = "n/a" if f.pe is None else f"{f.pe:.1f}"
    pb = "n/a" if f.pb is None else f"{f.pb:.1f}"
    return (
        f"Fundamental {req.ticker} sektor {req.sector}: "
        f"ROE {_fmt_pct(f.roe)} margin {_fmt_pct(f.margin)} "
        f"leverage {f.leverage:.2f}x PE {pe} PB {pb}."
    )


def technical_memo(req: SynthesizeRequest) -> str:
    s = req.kronos_signal
    vol = "n/a" if s.volatility is None else f"{s.volatility:.2f}"
    flag = " anomali" if abs(s.anomaly_z) > _ANOMALY_THRESHOLD else ""
    return (
        f"Teknikal {req.ticker}: ER {_fmt_pct(s.expected_return)} "
        f"Z={s.anomaly_z:.2f}{flag} volatilitas {vol}."
    )


def synthesize_memo(req: SynthesizeRequest) -> str:
    v = _verdict(req.kronos_signal.anomaly_z)
    return (
        f"Sintesis {req.ticker} ({req.market.value}): "
        f"fundamental {_fmt_pct(req.fundamentals.roe)} ROE, "
        f"teknikal Z={req.kronos_signal.anomaly_z:.2f}, "
        f"verdict {v}."
    )
