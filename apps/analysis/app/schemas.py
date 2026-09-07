"""Pydantic schemas for SEITH Analysis Sidecar.

Contract SSOT for `POST /synthesize` + `GET /health`.
All models use `extra="forbid"` and strict validators to keep the wire contract
clean. Ticker regex `^[A-Z0-9]{3,6}$` mirrors `seith-core` Rust domain rule.
"""
from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

DISCLAIMER_DEFAULT = (
    "Bukan rekomendasi investasi. Informasi & analisis saja."
)


class MarketEnum(str, Enum):
    id = "id"
    sg = "sg"


class FundamentalsIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    sector: str = Field(min_length=1, max_length=64)
    roe: float
    margin: float
    leverage: float = Field(ge=0.0)
    pe: float | None = None
    pb: float | None = None


class KronosSignalIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    expected_return: float
    anomaly_z: float
    volatility: float | None = None


class SynthesizeRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    market: MarketEnum
    ticker: str
    fundamentals: FundamentalsIn
    kronos_signal: KronosSignalIn
    sector: str = Field(min_length=1, max_length=64)

    @field_validator("ticker")
    @classmethod
    def _ticker_regex(cls, v: str) -> str:
        if not v.isascii() or not v.isupper() or not v.isalnum():
            raise ValueError("ticker regex")
        if len(v) < 3 or len(v) > 6:
            raise ValueError("ticker regex")
        return v

    @model_validator(mode="after")
    def _sector_match(self) -> SynthesizeRequest:
        if self.sector != self.fundamentals.sector:
            raise ValueError("sector mismatch")
        return self


class SynthesizeResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    fundamental_memo: str = Field(min_length=1)
    technical_memo: str = Field(min_length=1)
    synthesizer_memo: str = Field(min_length=1)
    degraded: bool
    disclaimer: str = DISCLAIMER_DEFAULT
