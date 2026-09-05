# Task 03 — Sectors REST Batch Client per Market

## Goal
Kunci `SectorsClient` batched per sektor, endpoint `Id` vs `Sg`, `X-API-Key` `Redacted`, `timeout 10s retry 1x`, key `market:sector:ticker:date` — hemat 1000 credits, no leak.

## Context
- SSOT: `AGENTS.md §2 §4` + `prd §5 [1]` + `adrs 0001` + `tdd-plan §3` + `skill://seith-market-intelligence`
- Dependensi: `01` Market + `02` CompositeCache
- Branch: `handoff/01-sectors-adapter/t2-cache` (T2 lanjut `02→03`)

## Scope In / Out
In: `seith-core/config.rs`, `redact.rs`, `sectors-client/client.rs, batch.rs, lib.rs`
Out: cleansing (`04`), envelope (`05`)

## Bagian — Surgical Breakdown
| Bag | File | Struktur / Fn | Acceptance | Test FAIL |
|---|---|---|---|---|
| 03a | `redact.rs` | `struct Redacted(String)` `Debug="***"` `Deref` `sanitize_error()` | `format Debug == "***"` no leak | `Display leak` |
| 03b | `config.rs` | `AppConfig {api_key:Redacted, market:Market, llm/kronos/analysis url}` `from_env() fail-fast` `ConfigError::MissingKey` | `missing→Err` no echo | `MARKET=xx → Err` |
| 03c | `client.rs` | `SectorsClient {http:Client, base_url, api_key, cache}` `new()` `timeout 10s` | `new` compile | — |
| 03d | `client.rs` | `fetch_ohlcv(market,ticker,sector)` cache-first `get→http GET {base}{market.base_path()}?ticker= + X-API-Key → set` | `mockito Id→/indonesia, Sg→/singapore` | `endpoint mismatch` |
| 03e | `batch.rs` | `fetch_ohlcv_batch(market,tickers,sector)` `chunks(20)` sequential (simple) + `SectorsError Auth 401 NotFound 404 Validation 422 RateLimit 429` | `cache hit no http` `miss→http→write→hit` | `422 invalid ticker` |
| 03f | `lib.rs` | `pub mod client/cache` `pub use seith_core::Market,OhlcvRow,Cache` | re-export | `cargo check` 0 |
| 03g | `tests` | `mockito` ≥5 tests Id vs Sg, hit/miss, 422, no leak | `error Display no key` | 5 passed |

## Deliverables (per Bagian)
- 03a: `redact.rs` polish 30-40 baris
- 03b: `config.rs` 60-90 baris, `MARKET` default `Id`, `LLM_BASE_URL` default `:20128`
- 03c-e: `client.rs` 120-180 + `batch.rs` 40-60 baris
- Constraint: `fn <50`, `file 200-400`, `no unwrap` reqwest `?`, `♻️ Refactor:`

## Verification
```
cargo fmt --check → 0
cargo clippy -p seith-core -p sectors-client -- -D warnings → 0
cargo test -p sectors-client -- --nocapture → ≥5 mockito passed
rg "SECTORS_API_KEY=[a-z0-9]{10,}" → no leak
```

## Peran + Skill + Sub-agent
| Peran | Skill | Sub-agent |
|---|---|---|
| T2 | `seith-market-intelligence`+`tdd-workflow` | `tdd-guide` mockito |
| `security-reviewer` | `security-review` | `security-reviewer` |
| `rust-reviewer` | `code-reviewer` | `code-reviewer` |
| `refactor-cleaner` | `coding-standards` | `refactor-cleaner` |

## Next Session Prompt
`skill://seith-market-intelligence` + `handoff/01/t2-cache` + `03` + 3Q: `endpoint switch` + `X-API-Key` + `redact`.
