"""Bahasa Indonesia disclaimer injected at every memo boundary.

Track 3 rule: every research insight MUST carry
`bukan rekomendasi investasi` disclaimer.
"""
from __future__ import annotations

DISCLAIMER = "Bukan rekomendasi investasi. Informasi & analisis saja."


def inject(memo: str) -> str:
    """Append disclaimer suffix to a memo; idempotent."""
    if not memo:
        return DISCLAIMER
    if memo.endswith(DISCLAIMER):
        return memo
    sep = "" if memo.endswith((".", "!", "?")) else " "
    return f"{memo}{sep}{DISCLAIMER}"
