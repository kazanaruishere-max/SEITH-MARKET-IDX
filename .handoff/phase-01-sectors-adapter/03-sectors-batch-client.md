# Task 03 — Sectors REST Batch Client per Market (Id|Sg)

## Goal
Kunci Sectors REST batch client: batched per sektor per market, endpoint `/v2/indonesia/transaction/daily` vs `/v2/singapore/transaction/daily`, key `market:sector:ticker:date`, TTL 24h raw / 1h ranking, retry 1x, `reqwest` — hemat 1000 credits via CompositeCache, no `Sectors key` leak ke log/client.

## Context
- SSOT: `AGENTS.md §2 Market + §3 Architecture Snapshot + §4 Hard Rules 4 Secrets + §6 Contract` + `docs/prd.md §5 Pipeline [1] Sectors Batch+Cache` + `docs/spec.md §2 Pipeline [1] + §5 DataFlow` + `docs/api-spec.md §5 Sectors Mapping + §8 Errors` + `docs/tdd-plan.md §3-7 Sectors Adapter` + `docs/adr/0001-stack` cache composite + `docs/notes/00-readme.md` + `skill://seith-market-intelligence` + `seith-dev`
- Dependensi: `01-market-enum-models.md` (Market enum + OhlcvRow) + `02-cache-trait-composite.md` (CompositeCache trait + L1+L2) — client tulis ke cache via `CompositeCache set`
- Branch: `handoff/01-sectors-adapter` atau `handoff/01-sectors-adapter/t2-cache` (T2: `02+03` cache+client)
- Fondasi: `1000 credits` → batch + cache; `SECTORS_API_KEY` env-only via `seith-core/src/config.rs` fail-fast + `redact.rs` sanitize; Rocks/Kronos belum perlu

## Scope In / Out
In: `crates/sectors-client/src/lib.rs` polish (re-export `Market`, `OhlcvRow`, `Cache`), `crates/sectors-client/src/client.rs` (struct `SectorsClient { http: reqwest::Client, base_url: String, api_key: Redacted, cache: CompositeCache }` + `fn fetch_ohlcv(&self, market:Market, ticker:&str, sector:&str, date:Option<&str>)->Result<Vec<OhlcvRow>, Error>` + `fn fetch_ohlcv_batch(market, tickers: &[String], sector:&str)` batched per sektor, `market.as_str()` untuk endpoint + cache key, `X-API-Key` header, `timeout 10s retry 1x`, `mockito` untuk test), `crates/sectors-client/src/batch.rs` opsional (chunk tickers per 20, concurrent `join_all` dengan limit), `crates/seith-core/src/config.rs` (`AppConfig::from_env()` parse `SECTORS_API_KEY` + `MARKET` default `Id` + `LLM_BASE_URL`), `crates/seith-core/src/redact.rs` (`Redacted` wrapper + `sanitize_error`).
Out: Cleansing `normalize.rs` (`04`), envelope/handlers (`05`), Kronos bridge (`H2`), `9router` — hanya fetch raw + cache write, tidak cleansing/normalize.

## Deliverables + Acceptance
- `crates/seith-core/src/config.rs`:
  - `struct AppConfig { sectors_api_key: Redacted, market: Market, llm_base_url: String }` + `fn from_env()->Result<Self, ConfigError>` fail-fast jika `SECTORS_API_KEY` missing (error message tidak echo key), `MARKET` default `Id` jika unset, `LLM_BASE_URL` default `http://localhost:20128/v1`
  - Acceptance: `from_env()` with `SECTORS_API_KEY=foo` → ok, missing → `Err(ConfigError::MissingKey)` + `redact` test key tidak muncul di `format!("{:?}", err)`
- `crates/seith-core/src/redact.rs` (sudah ada, polish):
  - `struct Redacted(String)` `Debug` → `"***"`, `Deref` → inner untuk http header, `fn sanitize_error(msg:&str)->String` replace key pattern
  - Acceptance: `format!("{:?}", Redacted("0843...".into())) == "***"`, `sanitize_error` no leak
- `crates/sectors-client/src/client.rs`:
  - `SectorsClient::new(api_key: Redacted, cache: CompositeCache, base_url: String)` + `fetch_ohlcv` → check `CompositeCache::get(key)` L1→L2 hit → return cached `Vec<OhlcvRow>` (JSON String→Vec); miss → `reqwest GET {base_url}{market.base_path()}?ticker={ticker}` + `X-API-Key: api_key.0` + `timeout 10s` → `Vec<OhlcvRow>` → `CompositeCache::set(key, json)` L1+L2 → return
  - `fetch_ohlcv_batch` → `chunks(20)` + `futures::join_all` atau sequential (simple dulu) per sektor, collect `Vec<OhlcvRow>` per ticker, handle `422` jika ticker invalid
  - Error: `thiserror` `SectorsError { Transport, Auth(401→ rotate key), NotFound(404), Validation(422), RateLimit(429), Server(5xx) }` — tidak leak key di `Display`
  - Acceptance: `cargo test -p sectors-client` ≥5 tests dengan `mockito`: `fetch_ohlcv cache hit no http call` (insert L1, fetch → hit, `mock.assert 0`), `fetch_ohlcv cache miss → http → cache write → second fetch hit`, `market Id → /v2/indonesia/transaction/daily?q=BBCA` vs `Sg → /v2/singapore/transaction/daily?q=DBS`, `invalid ticker → 422 Validation`, `SECTORS_API_KEY leak not in error Display`, TTL mocked via `created_at` future? Skip H1 (covered by `02`)
- `crates/sectors-client/src/lib.rs`: `pub mod client; pub mod cache;` (atau `pub mod batch`) + re-export `pub use seith_core::{Market, OhlcvRow, Cache, CompositeCache, MokaCache, SqliteCache, AppConfig, Redacted}`
- Constraint: `fn <50`, `file 200-400`, `nesting ≤4`, `no unwrap` di reqwest/rusqlite, `cargo fmt+clippy` clean, `♻️ Refactor:`
- Fixtures: `mockito` server stub `GET /v2/indonesia/transaction/daily` → `tests/fixtures/bbca-ohlcv-400.json` subset (5 rows) + `GET /v2/singapore/transaction/daily` → `dbs-sg-ohlcv-400.json` subset

## Verification (paste output nyata)
```
cargo fmt --check → 0
cargo clippy -p seith-core -p sectors-client -- -D warnings → 0
cargo test -p seith-core -- --nocapture → pass (config redact)
cargo test -p sectors-client -- --nocapture → pass (mockito: cache hit, cache miss→http→write, market endpoint, 422)
cargo test -- --nocapture → pass
# SECTORS_API_KEY leak grep: rg "0843|SECTORS_API_KEY=[a-z0-9]{10,}" --no-leak
```
+ Accountability Block: `✅ cargo test -p sectors-client → 5 passed (mockito 2 endpoint Id/Sg) / ⚠️ Belum: batch concurrency + rate limit / 🔻 Key leak via Display — deteksi: redact test / ♻️ Refactor: extract cache_key fn, split client vs batch`

## Peran + Skill + Sub-agent (task ini)
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T2 Cache+Client | sub-agent | `seith-market-intelligence` + `tdd-workflow` | `tdd-guide` (mockito fixtures Id vs Sg) | Implement→Verify→Refactor TDD red-green |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | key env-only, redact, rate limit |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | `reqwest` error handling, `Cache` integration |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca task |

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/01-sectors-adapter/t2-cache` + task `03-sectors-batch-client.md` + ritual 3Q: 1) gate MI? Sectors batch+cache hemat credits. 2) jebakan? `market` endpoint switch + `X-API-Key` header + key redact. 3) test FAIL? `mockito Id vs Sg endpoint`, `cache hit no http`, `error Display no leak`.
