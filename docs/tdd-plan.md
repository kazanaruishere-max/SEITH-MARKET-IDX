# TDD Plan — SEITH (Rust Core + Kronos-base Sidecar + 9router + CompositeCache)

## 1. Philosophy
Red → Green → Refactor, satu slice terverifikasi per session. Tanpa failing test dulu = tidak implement. MI gagal jika scoring/anomaly tidak teruji — coverage meaningful di critical path, bukan angka kosmetik.

## 2. Pipeline Workflow (Locked — Intelligence Loop `60s Ranking → Deep Dossier`)
```
[1] Sectors Batch+CompositeCache (market=id default) → [2] Normalize & Cleansing (Rust) → [3] Kronos Sidecar :8001/predict_batch → [4] Scoring 0-100 → [5] Ranking+Flag → [6] Agents Lite :8002 → 9router :20128 → [7] Dossier → [8] Axum+CLI+FE
```
Gerbang pengujian: cleansing (missing volume→0, rasio→sector median per market, OHLC missing→exclude, lookback>512→422) + CompositeCache (L1→L2→Sectors) + REST sidecar (timeout/fallback degraded) + 9router liveness/fallback + market enum — pipeline tidak boleh crash di emiten illiquid, saat LLM down, atau saat L1 miss.

## 3. Critical Paths (wajib 80%+ meaningful)
1) **scoring-engine** (`crates/seith-core`) — composite Mispricing Score 0-100, clamp, breakdown per komponen, explainability, per-market percentile (Id vs Sg terpisah).
2) **anomaly-detector** (Rust) — Z=(actual-forecast)/σ, flag |Z|>2, volume spike tanpa katalis fundamental, `reason` wajib.
3) **sectors-adapter + cleansing + CompositeCache** (`crates/sectors-client` + `seith-core/normalize` + `Cache` trait) — normalize OHLCV→DataFrame `open/high/low/close/volume?/amount?` + `x/y_timestamp` + `market` enum (Id/Sg), fundamentals→Quality/Value, **cleansing**: volume/amount missing→0, rasio missing→sector median fallback per market + `insufficient_data` flag, OHLC missing→exclude+reason, **cache**: `trait Cache<K,V>` → `MokaCache` L1 (24h raw / 1h ranking, <1ms) + `SqliteCache` L2 (`data/seith.db`, ~2ms, persistent) + `CompositeCache` (L1 miss → L2 hit → fetch Sectors → tulis L1+L2), batch, equal lookback guard.
4) **kronos-bridge** (Rust→Python :8001) — HTTP `/predict` & `/predict_batch` (Kronos-base + Tokenizer-base), `max_context 512` guard, T/top_p passthrough, timeout 30s retry1 fallback `degraded:true`.
5) **analysis-bridge** (Rust→Python :8002 → 9router :20128) — `POST /synthesize` Fund/Tech/Synth via 9router, timeout 15s, fallback template memo, disclaimer injection, `degraded` flag.
6) **dossier-compose** (Rust) — merge score+peer+Kronos+lite-agent memo, disclaimer injection, branch pdf vs json.
7) **cli contract** (`crates/seith-cli` clap) — `ranking`, `dossier`, `scan` dengan `--market id|sg` (default id), emits envelope JSON identik dengan REST (no drift, verifiable tanpa browser).

Non-critical (util, UI presentational): test ringan.

## 4. Layers
- **Unit (Rust):** pure fn `score`, `normalize`, `cleanse`, `z`, `Cache` impl — no IO. `cargo test` + fixtures. Mock Sectors/Kronos/9router di boundary. `CompositeCache` unit: L1 miss → L2 hit, L2 miss → fetch, TTL expiry.
- **Integration (Rust Axum + CLI):** handler/CLI → repository → CompositeCache/kronos/9router mock. `axum-test`/`wiremock`/`mockito` + `assert_cmd` untuk CLI + `rusqlite` in-memory untuk L2. Assert envelope `{success,data,error,pagination}`, assert `excluded` untuk illiquid, assert `degraded`/`insufficient_data`, assert CLI JSON ≡ REST JSON (termasuk `?market=sg`), assert `sqlite3 data/seith.db` persist after restart (mock).
- **Python sidecar:** `uv run pytest -q --cov` untuk `kronos-sidecar` & `analysis` adapter; mock `KronosPredictor` deterministik; mock 9router `httpx` via `respx`.
- **Contract/E2E (2-3):** `GET /v1/ranking` happy (market=id default) + `GET /v1/ranking?market=sg` + `GET /v1/tickers/BOGUS/score` → 404/422 + `POST /v1/scan` dengan ticker missing→`excluded` + dossier `disclaimer` presence + `seith dossier BBCA --json` ≡ `GET /dossier/BBCA` . 9router mock via `mockito` (Rust) / `respx` (Python). Playwright hanya untuk FE.

## 5. Tooling (Verification Gate)
- **Rust:** `cargo fmt --check && cargo clippy -- -D warnings && cargo test -- --nocapture` ; CLI: `cargo test -p seith-cli` ; L2: `cargo test -p sectors-client -- --nocapture` (moka+rusqlite)
- **Python sidecar:** `uv run ruff check . && uv run pytest -q` (keduanya: `apps/kronos-sidecar` dan `apps/analysis`)
- **FE (Next.js):** `pnpm lint && pnpm typecheck && pnpm test`
- **Cache check:** `sqlite3 data/seith.db "SELECT count(*) FROM ohlcv;"` ; L1 vs L2 hit rate log.
- **9router check:** `Invoke-WebRequest http://localhost:20128/v1/models` 200 sebelum dossier integration test; mock jika offline.
- Mock: `mockito`/`wiremock` untuk Sectors/Kronos/9router; Kronos predictor mock deterministik fixture.

## 6. Workflow per Handoff (T1/T2 wajib skill://seith-market-intelligence di awal)
1) Tulis failing test untuk slice berikutnya (mis. `score clamp 0-100`, `cleanse missing OHLC → exclude`, `CompositeCache L1 miss → L2 hit`, `market sg → sg endpoint`, `kronos timeout → degraded`, `9router down → template memo`).
2) Implement minimal (immutable return, fn <50 baris, nesting ≤4).
3) Green → refactor → `cargo fmt`/`clippy`.
4) Run gate, commit `test:`/`feat:` dengan output nyata.

## 7. Fixtures & Boundaries
- Sectors OHLCV: 400 rows BBCA (IDX) + illiquid fixture (volume null, ROE null, OHLC null → exclude) + SG fixture (DBS daily from `/v2/singapore/transaction/daily`) untuk market param test.
- Sector median fixture per market untuk cleansing (fallback QV Id vs Sg terpisah).
- Kronos: fixture forecast return 2.1%, σ 1.0 → Z 2.1; `predict_batch` equal lookback/pred_len guard; timeout fixture.
- 9router: fixture `chat.completions` success + failure (timeout) untuk degraded path.
- Cache: fixture `data/seith.db` in-memory (rusqlite `:memory:`), TTL 24h raw / 1h ranking, key `market:sector:ticker:date`.
- Validation: ticker `^[A-Z0-9]{3,6}$`, market `id|sg` (default id), lookback>512→422, tickers>50→422.
- CLI: fixture `seith ranking --json` dan `seith ranking --market sg --json` envelope snapshot.

## 8. What Not to Test
Internals Kronos, Sectors API itself, LLM prose exact (assert shape + disclaimer + degraded flag, bukan string equality), SQLite durability beyond trait (mocked).

## 9. Checklist Before Claim Done
- `cargo test` (incl. seith-cli + sectors-client CompositeCache) + `uv run pytest` pass, assertion meaningful (no assertion-less test).
- `cargo clippy` clean (`-D warnings`), `cargo fmt --check` clean.
- `pnpm lint/typecheck` clean jika sentuh FE.
- 9router fallback path teruji (degraded:true) — MI tetap lolos tanpa LLM.
- CompositeCache L1→L2→Sectors path teruji, TTL dan market key teruji.
- Accountability block dengan output perintah nyata (no fabrikasi).

## 10. Risks
- LLM 9router flaky/down → assert `degraded` + template memo fallback, dossier tetap valid (LLM opsional Track 3).
- Kredit overuse → CompositeCache L1+L2 mock single fetch/ticker/market/hari, 100% gratis, no Redis 30MB.
- Kronos-base 102.3M berat → sidecar timeout + degraded fallback teruji, pre-compute overnight.
- Illiquid data → cleansing tests jamin pipeline tidak crash, ticker di-exclude dengan reason transparan.
- CLI/REST drift + market param drift → contract test envelope identik per market.
