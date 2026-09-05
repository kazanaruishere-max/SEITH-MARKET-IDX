# 02 — Kronos Kritis (102.3M, 512 ctx) — Baca Sebelum Sentuh Forecast

> Sumber: `2508.02739v1.pdf` (AAAI 2026) + `docs/kronos-notes.md`. Kronos bukan `predict(price)` biasa — dia quantization + autoregressive.

## Apa Itu Kronos

- **Tokenizer hierarkis K-line:** quantize OHLCV kontinu → discrete token, bukan feed raw price.
- **Decoder-only Transformer** pre-train 45+ exchange — belum tentu fit IDX small-cap illiquid.
- **Varian locked:** `NeoQuasar/Kronos-base` 102.3M + `NeoQuasar/Kronos-Tokenizer-base`, `max_context 512`.

## API yang Kita Pakai

```python
tokenizer = KronosTokenizer.from_pretrained("NeoQuasar/Kronos-Tokenizer-base")
model = Kronos.from_pretrained("NeoQuasar/Kronos-base")
predictor = KronosPredictor(model, tokenizer, max_context=512)
pred_df = predictor.predict(df, x_timestamp, y_timestamp, pred_len=20, T=1.0, top_p=0.9)
# df wajib: open/high/low/close, optional volume/amount (missing → 0)
# predict_batch: butuh equal lookback & pred_len per series, handle norm/denorm per series
```

## 6 Jebakan yang Mematikan Pipeline

| Jebakan | Akibat | Koreksi |
|---|---|---|
| `lookback 400 + pred 20 = 420` aman, tapi `500+20=520 >512` | `422`/`panic` sidecar | Guard di Rust boundary `lookback>512 → 422` (AGENTS §5) |
| `predict_batch` series beda `lookback` | Shape mismatch, crash | Validasi equal guard sebelum `POST /predict_batch` |
| `volume/amount` null tidak di-0 | NaN forecast | Cleansing gate `volume/amount missing → 0.0` |
| `x_timestamp` tidak kontinyu (hari libur IDX) | Tokenizer misaligned | Derivasi dari `date` Sectors, jangan isi gap |
| Pakai full universe 900 ticker sekaligus | OOM 102M GPU, timeout 30s | Hanya **Top-N** untuk dossier, ranking pre-compute overnight |
| `T=1.0/top_p=0.9` dianggap deterministik | Z tidak stabil | Z = (actual-forecast)/σ butuh `sample_count>1` untuk σ real; jika `sample_count=1` maka σ proxy fallback |

## Anomaly Z

`Z = (actual_close - forecast_close) / σ_forecast`. Flag `|Z|>2`. Jika `σ` dari single sample → gunakan fallback `sector volatility` agar tidak false flag.

## Fallback

Sidecar `:8001` down/timeout 30s retry1 → response `degraded:true, forecast=0, insufficientData?` — ranking tetap lolos MI (skor QV+SectorMom tetap), jangan crash.

## 3 Pertanyaan Sebelum Code Kronos

1. Apakah `df` sudah 0-isi `volume/amount` & `open/high/low/close` WAJIB ada?
2. Apakah `lookback + predLen ≤512` & semua series equal?
3. Apakah fallback `degraded` + test timeout sudah ada?
