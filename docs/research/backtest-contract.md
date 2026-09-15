# Backtest Contract — 100 Ticker Stratified (SSOT for Web)

> **Sectors → CompositeCache L1→L2 → normalize → Kronos 400→20 → Score 30/20/30/20 → Flag |Z|>2 → Rank → research/backtest-100.json → Web recharts**

## Flow (Sequentiel, No Concurrency)
1. **Fetch** `research/universe-100.json` 100 stratified `FINANCE25/ENERGY20/CONSUMER20/INFRA20/OTHER15` — per market isolated (`market:sector:ticker:date`).
2. **Batch** `crates/sectors-client/src/batch.rs:chunks(20) ×5` sequential — header `Authorization: <SECTORS_API_KEY>` + path `/v2/daily/{symbol}/` — cost `1 credit/200` (OHLCV) + Valuation — total `~200 credits`. Status: `200→text, 401|403→Auth free (error 1010), 404 billed 1 (resource not found), 422 Validation, 429→RateLimit backoff`.
3. **Fallback** `excluded:[{ticker,reason}]` on `OHLC missing→excluded`, `403 WAF`, `404 unknown` — fallback `tests/fixtures/bbca-ohlcv-400.json` + `sector-median.json`.
4. **Normalize** `crates/seith-core/src/normalize.rs` — `OHLC 0/nan→excluded`, `volume/amount None→0`, `x_timestamp/y_timestamp`, `sector_median per Market` (`median_map lazy`).
5. **Kronos** `crates/seith-core/src/kronos/types.rs` `PredictBatchInput 400→20 T1.0 top_p0.9 equal guard, max_context 512 lokback>512→422`, `:8001 POST /predict_batch` 30s retry1→`degraded:true`, `KRONOS_MOCK=1` for CI.
6. **Score** `crates/seith-core/src/scoring/calculator.rs` `Mispricing 0-100 = 30%ER + 20%(100-|Z|) + 30%QV + 20%SM` clamp — stores `Components`.
7. **Flag** `crates/seith-core/src/anomaly/traits.rs` `calc_z=(actual-forecast)/σ` → `flag |Z|>2 OR vol>2σ` (`volume.rs`) — `reason` string.
8. **Rank** `crates/seith-core/src/ranking/service.rs` `rank() Mispricing desc → |Z| tie-break` + `paginate(page,page_size max50)` + `sector_filter` + `SortKind Mispricing|Anomaly`.
9. **Synthesize** `apps/analysis :8002 POST /synthesize` Fund/Tech/Synth → `9router :20128/v1 SEITH-MARKET-IDX` (8 free `nvidia/nemotron-3.5-lightning:free cost 0` + fallback `Seith-AI-Trading`), Top-N only, `15s retry1`.
10. **Persist** `data/seith.db` WAL `busy_timeout 3000` — `migrations/001_cache.sql` `ohlcv/fundamentals/ranking_cache` + runtime `kv_store` — TTL `86400 raw / 3600 ranking` — `SqliteRepository::new auto-mkdir`.
11. **Emit** `research/backtest-100.json` + `research/money-leak-backtest.ipynb` 7 cells `plotly==5.*` isolated (`grep plotly apps/kronos-sidecar →0`).

## Schema `research/backtest-100.json` (Verifiable)
```json
{
  "as_of": "2026-09-08",
  "universe": 100,
  "market": "id",
  "credit_cost": 200,
  "items": [
    {"ticker":"BBCA","market":"id","sector":"FINANCE","close":8300,"mispricingScore":72.5,"components":{"expected_return":55,"anomaly_z":1.2,"quality_value":60,"sector_mom":70},"anomaly":{"z":1.2,"flag":false,"reason":""},"rank":1,"degraded":false}
  ],
  "metrics": {"hit_rate":0.62,"drawdown":-0.08,"sharpe":1.1,"top5_forward_20d":0.12,"totalReturn":0.45,"cumulative":1.45,"win_rate":0.58},
  "equity_curve": [{"date":"2025-08-01","return":0.01,"bench":-0.002}],
  "excluded": [{"ticker":"ZZZZ","reason":"missing_ohlc"}],
  "degraded": false,
  "disclaimer": "Bukan rekomendasi investasi. Informasi & analisis saja."
}
```

## API Companion — Serve Static or Live
- `GET /api/v1/backtest?market=id` → `envelope {success,data:{items,metrics,equity_curve},pagination,disclaimer} + x-schema-version` — serves `research/backtest-100.json` static (web `GET /api/v1/backtest` via `next.config.js rewrites /api/v1 → 8181` + `NEXT_PUBLIC_API_BASE`).
- Alternative live: compute on demand via `ranking/service.rs` + `CompositeCache` (L1<1ms L2~2ms) — credit free until TTL.

## Gates
- `research/money-leak-backtest.ipynb` 7 cells `plotly offline fig.show()` — `nbconvert --execute --allow-errors` 0 — `KRONOS_MOCK=1` CI, `plotly==5.*` isolated `research/pyproject.toml`.
- `jq .items | length research/backtest-100.json → 100` — future after implement.
- `pnpm test lib/api.test.ts` + `recharts Line + Area ±2σ` — phase 10 `BacktestChart.tsx`.

## Risks
- WAF `403 error 1010` transient (BBCA `200→403` observed) — `excluded` + `chunks(20)` sequential.
- `KRONOS_MOCK` hides OOM — manual 7 cells real Kronos proof required for `85+ win`.
