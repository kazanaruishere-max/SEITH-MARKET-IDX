from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, model_validator


class MarketEnum(str, Enum):
    id = "id"
    sg = "sg"


class OhlcvIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    open: float
    high: float
    low: float
    close: float
    volume: float | None = None
    amount: float | None = None
    timestamp: int


class PredictRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    market: MarketEnum
    df: list[OhlcvIn]
    x_timestamp: list[int]
    y_timestamp: list[int]
    pred_len: int = Field(ge=1, le=512)
    T: float = Field(default=1.0)
    top_p: float = Field(default=0.9)

    @model_validator(mode="after")
    def check_max_context(self):
        if len(self.df) == 0:
            raise ValueError("df must not be empty")
        if len(self.df) + self.pred_len > 512:
            raise ValueError("max_context 512")
        if len(self.x_timestamp) != len(self.df):
            raise ValueError("equal lookback")
        if len(self.y_timestamp) != self.pred_len:
            raise ValueError("equal lookback")
        return self


class PredictBatchRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    market: MarketEnum
    dfs: list[list[OhlcvIn]]
    x_timestamps: list[list[int]]
    y_timestamps: list[list[int]]
    pred_len: int = Field(ge=1, le=512)
    T: float = Field(default=1.0)
    top_p: float = Field(default=0.9)

    @model_validator(mode="after")
    def check_batch(self):
        if not self.dfs or len(self.dfs) == 0:
            raise ValueError("dfs must not be empty")
        first_len = len(self.dfs[0])
        if first_len == 0:
            raise ValueError("dfs must not be empty")
        if first_len + self.pred_len > 512:
            raise ValueError("max_context 512")
        for df in self.dfs:
            if len(df) != first_len:
                raise ValueError("equal lookback")
        if len(self.x_timestamps) != len(self.dfs):
            raise ValueError("equal lookback")
        if len(self.y_timestamps) != len(self.dfs):
            raise ValueError("equal lookback")
        for i, df in enumerate(self.dfs):
            if len(self.x_timestamps[i]) != len(df):
                raise ValueError("equal lookback")
            if len(self.y_timestamps[i]) != self.pred_len:
                raise ValueError("equal lookback")
        return self
