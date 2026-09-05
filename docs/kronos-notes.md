# Kronos Notes — Distilasi 2508.02739v1.pdf (AAAI 2026)

- Foundation model K-line (OHLCV) first open-source, 45+ exchanges pre-train.
- 2-stage: (1) hierarchical discrete tokenizer quantize OHLCV → tokens, (2) decoder-only autoregressive Transformer.
- Variants: mini 4.1M/2048 ctx, small 24.7M/512, **base 102.3M/512 (locked)**, large 499M (closed).
- API: `KronosTokenizer.from_pretrained(NeoQuasar/Kronos-Tokenizer-base)`, `Kronos.from_pretrained(NeoQuasar/Kronos-base)`, `KronosPredictor(model, tokenizer, max_context=512)`.
- `predict(df, x_timestamp, y_timestamp, pred_len, T=1.0, top_p=0.9, sample_count=1)` → `pred_df` (open/high/low/close/volume/amount). `predict_batch` requires equal lookback/pred_len, handles norm/denorm per series.
- Constraints: `max_context 512` → `lookback + pred_len ≤512`; recommend `lookback 400 → pred 20`. Missing `volume/amount` → fill 0. Temperature/top_p controls sampling.
- Fine-tune: qlib pipeline demo, not prod. Raw signals need risk neutralization for pure alpha.
- Usage SEITH: `predict_batch` for ranking scan, T1.0 top_p0.9, timeout 30s, fallback degraded. See `apps/kronos-sidecar`.
