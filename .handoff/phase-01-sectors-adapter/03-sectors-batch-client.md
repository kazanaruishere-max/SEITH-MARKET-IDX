# Task 03 — Sectors REST Batch Client per Market

## Goal
Kunci `SectorsClient` batched per sektor, endpoint `Id` vs `Sg`, `X-API-Key` `Redacted`, `timeout 10s retry 1x`, key `market:sector:ticker:date` — hemat 1000 credits, no leak.

## Context
- SSOT: `AGENTS.md §3c Seven Zones + §6c/§8c + §2 Market + §4 Secrets` + `docs/spec.md §7b Zones` + `prd §5 [1]` + `spec §2 [1]` + `tdd-plan §3` + `docs/notes/00-readme.md` ritual 3Q + `adr 0001` + `skill://seith-market-intelligence` + `skill://no-ai-slop`
- Dependensi: `01` Market + `02` CompositeCache
- Branch: `handoff/01-sectors-adapter/t2-cache` (T2 lanjut `02→03`)

## Scope In / Out
In: zona 1 `crates/seith-core/config.rs, redact.rs` + zona 1 `crates/sectors-client/client.rs, batch.rs, lib.rs` + zona 7 `scripts/check-9router.*` (verifikasi 9router :20128)
Out: cleansing (`04`), envelope (`05`), zona 2/3/4/5/6 di luar scope

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

## Deliverables + Acceptance (per Bagian)
- 03a: `redact.rs` polish 30-40 baris — Acceptance: `Debug=="***"` no leak
- 03b: `config.rs` 60-90 baris, `MARKET` default `Id`, `LLM_BASE_URL` default `:20128` — Acceptance: `from_env missing→Err MissingKey` no echo
- 03c-e: `client.rs` 120-180 + `batch.rs` 40-60 baris — Acceptance: `mockito Id /indonesia Sg /singapore` + `cache hit no http`
- 03f-g: `lib.rs` re-export + `mockito ≥5`
- Constraint: `fn <50`, `file 200-400`, `nesting ≤4`, `no unwrap` reqwest `?`, `cargo fmt+clippy` clean, `♻️ Refactor:`
- 7 Zones: file baru wajib zona 1 (`crates/*`) / zona 7 (`scripts/*`) sesuai `AGENTS.md §3c` + `spec §7b`; cross-zona import liar dilarang (`seith-core` ↛ `sectors-client`)

## Verification
```
cargo fmt --check → 0
cargo clippy -p seith-core -p sectors-client -- -D warnings → 0
cargo test -p sectors-client -- --nocapture → ≥5 mockito passed
rg "SECTORS_API_KEY=[a-z0-9]{10,}" → no leak
gitleaks detect --no-banner --source . → no leak
refactor-cleaner scan §8c → fn<50 file 200-400 nesting≤4 no dead code pass
skill://no-ai-slop detect → pass (Tier-1 warn H1-H4, hard fail H5)
```

### Accountability Block
```
✅ Terverifikasi: <cmd> → <output> (paste nyata)
⚠️ Belum: batch concurrency + rate limit
🔻 Risiko: key leak via Display — deteksi: redact test
♻️ Refactor: extract cache_key + split client vs batch fn<50
```

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead Otak T0 | opencode sini | `seith-market-intelligence`+`verification-loop` | — | approve 03 |
| T2 Cache+Client | sub-agent | `seith-market-intelligence`+`tdd-workflow`+`verification-loop` | `tdd-guide` | TDD mockito Id vs Sg |
| Arsitek | sub-agent `architect` | `senior-architect` | `architect` | review `client.rs` structure |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | key env-only + redact |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | reqwest error handling |
| PM Autonomous | `seith-pm` | `git-worktree-manager`+gate | — | **veto merge jika fail — ownership §8c 7 Zones** |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca task |
| Doc | `doc-updater` | `remember`+`handoff` | `doc-updater` | sinkron tdd-plan |

> Ownership §8c: tiap agent tanggung jawab Code+Logic+Testing+Structure & Rapih 7 Zones — pelanggaran = PM veto merge ke `main`.

## Next Session Prompt
`skill://seith-market-intelligence` + `handoff/01-sectors-adapter/t2-cache` + `03-sectors-batch-client.md` + ritual 3Q:
1) Gate MI? Sectors batch+cache hemat 1000 credits — fondasi hemat.
2) Jebakan? `market` endpoint switch + `X-API-Key` header + key redact no leak.
3) Test FAIL apa? `mockito Id vs Sg endpoint`, `cache hit no http`, `error Display no key`.
