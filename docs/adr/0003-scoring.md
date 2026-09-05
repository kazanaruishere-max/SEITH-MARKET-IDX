# ADR 0003 — Scoring Mispricing 0-100 Explainability

- Formula `0.30*ER_norm (Kronos forecast z) + 0.20*(100-|Z|_norm) + 0.30*QV (ROE/margin/leverage PE/PB sector percentile per market) + 0.20*SectorMom`, clamp 0-100.
- Explainable breakdown per component store. Hypothesis H4 backtest validation vs sector median noise Id vs Sg.
- Flag `|Z|>2` or volume `>2σ` without catalyst → `flag=true` + `reason`. Cleansing: missing volume/amount→0, rasio→sector median + `insufficient_data:true`, OHLC missing→exclude.
