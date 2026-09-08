# API Spec — SEITH (Rust Axum / Track 3 Market Intelligence)

## 1. Conventions
- Base: `/api/v1` (Rust Axum + Tokio) — shared oleh Web (Next.js) dan CLI (`seith-cli` via reqwest). Hybrid: CLI outputs envelope JSON sama.
- Envelope: `{ success: boolean, data?: T, error?: {code,message,details}, pagination?: {page,pageSize,total} }`
- Auth: `SECTORS_API_KEY` + `LLM_BASE_URL=http://localhost:20128/v1` server-only (env), never ke client/CLI.
- Validation: `validator` crate + `serde` deny_unknown_fields di boundary, fail fast. Market: `enum Market { Id, Sg }` default `Id`, ticker `^[A-Z0-9]{3,6}$`, `lookback<=512`.
- Rate limit: 60/min (ranking/score), 10/min (`POST /scan`), via `tower-http`.
- Disclaimer: setiap insight response sertakan `disclaimer: "Bukan rekomendasi investasi. Informasi & analisis saja."`
- Cache: CompositeCache — `moka` L1 (hot <1ms, 24h raw / 1h ranking) + `SQLite` L2 `data/seith.db` (~2ms, persistent, 100% gratis). Key `market:sector:ticker:date`. Redis 30MB ditolak (IDX raw ~45MB tidak muat), Supabase defer H5 (butuh cloud multi-instance).

## 2. Pipeline Workflow (Locked — Intelligence Loop `60s Ranking → Deep Dossier`)
```
[1] Sectors Batch+Cache (CompositeCache, market=id default) → [2] Normalize & Cleansing (Rust seith-core: open/high/low/close WAJIB, volume/amount→0.0, rasio→sector median fallback + insufficient_data, lookback>512→422) → [3] Kronos-base :8001 POST /predict_batch (400→20, T1.0 top_p0.9, equal guard, 30s timeout retry1 fallback degraded:true) → [4] Scoring Rust 0-100 (30%ER+20%(100-|Z|)+30%QV+20%SM, clamp) → [5] Ranking+Flag (|Z|>2 or volume>2σ) → [6] Agents Lite :8002 POST /synthesize (Fund/Tech/Synth → 9router :20128/v1) → [7] Dossier JSON→PDF → [8] Axum + seith-cli + Next.js
```
Market: default `id` (IDX ~900 emiten), `sg` optional flag via `?market=sg` / `--market sg` — STI stretch H5 (hemat 1000 credits, sector median per market terpisah). Rust↔Python via REST sidecar (bukan PyO3).

## 3. Endpoints

### GET /health
→ `200 { success:true, data:{status:"ok", version, market:"id", sidecars:{kronos:"up|down", analysis:"up|down", llm:"up|down"}, cache:{l1:"ok", l2:"ok"}, degraded:bool} }`
Liveness: Sectors reachable, kronos :8001, analysis :8002, 9router :20128, l2 `data/seith.db` readable.

### GET /v1/ranking
Query: `market?: "id"|"sg" (default id), sector?: string (IDX sector code), sort?: "mispricing"|"anomaly" (default mispricing), order?: "desc"|"asc" (default desc), page?: u32 (default 1), pageSize?: u32 (default 20, max 50)`
Response `data: Vec<{ ticker, name, sector, market, mispricingScore: f32 0-100, components:{expectedReturn, anomalyZ, qualityValue, sectorMom}, anomalyFlag: bool, rank: u32, degraded?: bool, insufficientData?: bool }>` + `pagination` + `disclaimer`
Behavior: Cleansing gate sebelum scoring; missing OHLC → exclude (tidak crash pipeline). Tanpa cache hit (L1→L2 miss) → fetch Sectors → tulis L1+L2.
CLI: `seith ranking --sector FINANCE --json` ≡ `GET /v1/ranking?sector=FINANCE` ; `seith ranking --market sg --sector FINANCE` ≡ `?market=sg`

### GET /v1/tickers/:ticker/score
Params: `ticker` (`^[A-Z0-9]{3,6}$`, normalized dari `BBCA.JK`) | Query: `market?: "id"|"sg" (default id)`
Response: `{ ticker, market, asOfDate: ISO8601, mispricingScore, components, anomaly:{z, flag, reason}, sector, peerPercentile, degraded, disclaimer, insufficientData }`
Errors: `404 TICKER_NOT_FOUND` (termasuk exclude karena cleansing), `422 VALIDATION_ERROR`, `502 UPSTREAM_ERROR`
CLI: `seith score BBCA --json` ; `seith score DBS --market sg`

### GET /v1/tickers/:ticker/dossier
Params: `ticker` | Query: `market?: "id"|"sg" (default id), format?: "json"|"pdf" (default json)`
Response json: `{ ticker, market, score, breakdown, peerComparison: Vec<{ticker,score, market}>, kronos:{forecastReturn, volatility, chartPoints: Vec<OHLC>}, research:{fundamentalMemo, technicalMemo, synthesizerMemo}, degraded, disclaimer }`
Dossier research via TradingAgents-Lite → 9router; fallback memo deterministik jika 9router down (`degraded:true` tetap lolos MI karena LLM opsional). Sector peer per market.
PDF: `Content-Type: application/pdf` streaming. No execution advice.
CLI: `seith dossier BBCA --pdf` ≡ `GET /v1/tickers/BBCA/dossier?format=pdf`

### GET /v1/anomalies
Query: `market?: "id"|"sg" (default id), sector?, minZ?: f32 (default 2.0), page?, pageSize?`
Response: tickers `|Z|>minZ` atau volume spike >2σ, sort `|Z|` desc per market. Pure derived insight.

### POST /v1/scan
Body: `{ tickers: Vec<String> (1-50), lookback?: u16 (default 400, max 512), predLen?: u16 (default 20), market?: "id"|"sg" (default id) }`
Behavior: Validasi `lookback<=512 && predLen<=512` (max_context 512), equal lookback/predLen, Sectors cleansing → exclude invalid (response sertakan `excluded: Vec<{ticker,reason}>`, `degraded`). Delegasi ke Kronos :8001 `POST /predict_batch` dengan market tag.
CLI: `seith scan --tickers BBCA,BMRI,BBRI --json` ; `--market sg`

## 4. Schemas (Rust validator)
```rust
#[derive(Deserialize, Validate)]
struct RankingQuery {
  #[validate(custom(function="validate_market"))] market: Option<String>, // "id"|"sg"
  sector: Option<String>,
  #[validate(range(min=1))] page: Option<u32>,
  #[validate(range(min=1, max=50))] page_size: Option<u32>,
}
Ticker: regex = r"^[A-Z0-9]{3,6}$"
Market: enum Id | Sg { default Id }
ScoreResponse { ticker: String, market: Market, mispricing_score: f32, components: Components, degraded: bool, insufficient_data: bool }
```

## 5. Errors (envelope error.code)
`VALIDATION_ERROR 422` (ticker, market, lookback>512), `NOT_FOUND 404`, `RATE_LIMITED 429`, `UPSTREAM_ERROR 502 (Sectors/Kronos/9router/SQLite)`, `INTERNAL 500`. Cleansing exclude bukan error global — ticker di-skip dengan reason di `excluded`.

## 6. Repository Pattern (Rust)
`trait SectorsRepository { fetch_ohlcv(market, ticker), fetch_fundamentals(market, ticker) }` (reqwest + CompositeCache L1+L2)
`trait KronosRepository { predict, predict_batch }` (HTTP bridge :8001)
`trait AnalysisRepository { synthesize }` (HTTP bridge :8002 → 9router :20128)
`trait ScoreRepository { compute_score, rank }`
`trait Cache<K,V> { get, set, invalidate }` → `MokaCache`, `SqliteCache`, `CompositeCache<Moka,Sqlite>`
Handler Axum + CLI reuse trait sama (no drift).

## 7. Sectors Mapping
Sectors OHLCV — ID `GET /v2/daily/{symbol}/` (e.g. `/v2/daily/BBCA/?start=2025-08-01&end=2025-08-02` → `[{symbol:"BBCA.JK", date, open, high, low, close, volume, market_cap}]`) + SG `GET /v2/sgx/daily/{symbol}/` (e.g. `/v2/sgx/daily/D05/`) — header `Authorization: <SECTORS_API_KEY>` (drift `X-API-Key` removed; drift `?ticker=` query removed; `market.rs base_path()` → `/v2/daily` Id / `/v2/sgx/daily` Sg) per `docs.sectors.app`. Status: `200 billed 1 credit`, `401|403 → Auth (error 1010 free, not billed)`, `404 billed 1 credit (resource not found)`, `429 free`. Missing `volume/amount` → 0.0; missing rasio → sector median fallback per market + `insufficient_data:true` (see `tests/fixtures/sector-median.json` + `docs/research/money-leak-radar-thesis.md`); `lookback>512 → 422` (`max_context 512`). Batch `sectors-client/src/batch.rs` `chunks(20)` sequential (100 = 5×20, ~200 credits OHLCV 400 + Valuation; WAF 403 fallback `excluded:[{ticker,reason}]`). Cache key `market:sector:ticker:date` (`crates/sectors-client/src/cache/mod.rs`) → `CompositeCache` L1 `moka <1ms` (24h raw / 1h ranking) + L2 `SQLite WAL data/seith.db ~2ms` (`migrations/001_cache.sql` `ohlcv/fundamentals/ranking_cache/kv_store`, `busy_timeout 3000`). DataFrame `{open,high,low,close,volume?,amount?}` + `x_timestamp/y_timestamp` dari `date`. Verified live: `BBCA 8300 2025-08-01` + `61 rows 2025-08-01→2026-08-10` + `9router SEITH-MARKET-IDX PONG nvidia/nemotron-3.5-lightning:free` (`research/validation-report.md`).

## 8. Example
`GET /api/v1/ranking?sector=FINANCE&pageSize=10` → IDX 10 ticker ranked by `mispricingScore` (market=id default).
`GET /api/v1/ranking?market=sg&sector=FINANCE&pageSize=10` → STI variant (stretch H5).
`seith ranking --sector FINANCE --json` → envelope JSON identik REST (verifiable via CLI tanpa browser).

## 9. Sidecar Contracts
- **Kronos :8001** Python `uv` FastAPI: `POST /predict` & `/predict_batch` — input `{market, df, x_timestamp, y_timestamp, pred_len, T, top_p}`, output `pred_df`. Rust bridge timeout 30s retry1 fallback `degraded:true`. HF `NeoQuasar/Kronos-base` + `Tokenizer-base` 102.3M.
- **Analysis :8002** Python `uv` FastAPI: `POST /synthesize` — input `{market, ticker, fundamentals, kronosSignal, sector}`, output `{fundamentalMemo, technicalMemo, synthesizerMemo}` via `httpx → 9router http://localhost:20128/v1/chat/completions`. Timeout 15s, fallback template memo jika down.

## 10. LLM via 9router (Track 3 Opsional = Fleksibel)
LLM opsional untuk MI — dossier tetap valid jika 9router down (`degraded:true`, score+risk tetap). 9router OpenAI-compatible → ganti model tanpa ubah code, tanpa modal LLM eksternal, 100% gratis. Check liveness: `Invoke-WebRequest http://localhost:20128/v1/models` 200 sebelum dossier. Integration test mock 9router via `mockito`.
