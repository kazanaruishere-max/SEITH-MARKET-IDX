# Task 05 — Envelope + Repository + Contract Verify

## Goal
Kunci `Envelope<T> {success,data,error,pagination}` + `Repository` WAL + `GET /health` + `?market` `422` + `X-Schema-Version` — fondasi verifiable hybrid REST↔CLI tanpa drift #10.

## Context
- SSOT: `AGENTS.md §6 envelope` + `spec §2 [8]` + `api-spec §1-3` + `adr 0002 SCHEMA_VERSION` + `tdd-plan §4-6` + `skill://seith-market-intelligence` + `verification-loop`
- Dependensi: `01` Market + `02` Cache + `03` Client + `04` Cleansing — closing phase, merge T1+T2 dulu
- Branch: `handoff/01-sectors-adapter` parent (05 di parent setelah T1/T2 merge)

## Scope In / Out
In: `seith-api/envelope.rs`, `repository.rs`, `lib.rs` (+ `handlers.rs` optional), `seith-core/config+redact` polish
Out: scoring H4, Kronos H2, Agents H3, seith-cli full H5, FE H5

## Bagian — Surgical Breakdown
| Bag | File | Struktur / Fn | Acceptance | Test FAIL |
|---|---|---|---|---|
| 05a | `envelope.rs` | `struct Envelope<T> {success:bool, data:Option<T>, error:Option<ApiError>, pagination:Option<Pagination>}` `ApiError{code,message}` `Pagination` `fn ok(data)->Self` `fn err(code,msg)->Self` `SCHEMA_VERSION` header | `Envelope::ok(vec![]).success==true`, `err VALIDATION_ERROR success==false` + `serde round-trip` | `success false` |
| 05b | `repository.rs` | `trait Repository:Send+Sync {get_ohlcv(market,ticker,date)->Vec<OhlcvRow>, save_ohlcv(market,rows)}` `SqliteRepository {path}` WAL `INSERT OR REPLACE` | `:memory: save→get round-trip` | `persist FAIL` |
| 05c | `lib.rs` | `pub mod envelope,repository,handlers` `router(repo:Arc<dyn Repository>)->Router` `GET /health 200 {status:"ok",schema}` `GET /api/v1/ranking?market=id|sg` `FromStr` default Id `422` invalid + `X-Schema-Version:1.0.0` header | `health 200`, `market=sg 200`, `market=xx 422 VALIDATION_ERROR` | `xx → 422` |
| 05d | `verify` | `sqlite3 data/seith.db SELECT name FROM sqlite_master` + `gitleaks` no `SECTORS_API_KEY` + `skill://no-ai-slop` Tier-1 warn | `tables exist` + `no leak` | `leak→FAIL` |
| 05e | `tests` | `axum-test` ≥4 `Envelope round-trip`, `GET /health 200`, `ranking?market=sg 200`, `ranking?market=xx 422`, `SqliteRepository :memory:` | 4 passed | — |

## Deliverables (per Bagian)
- 05a: `envelope.rs` 80-120 baris, `Serialize` identik `seith-cli` JSON
- 05b: `repository.rs` 80-120 baris, `rusqlite WAL busy_timeout 3000`, reuse `001_cache.sql`
- 05c: `lib.rs` 60-90 baris + `handlers.rs` optional guard `lookback>512→422` stub
- Constraint: `fn <50`, `file 200-400`, `nesting ≤4`, `no unwrap` `?`, `cargo fmt+clippy` clean, `♻️ Refactor:`

## Verification
```
cargo fmt --check → 0
cargo clippy -p seith-core -p seith-api -p sectors-client -- -D warnings → 0
cargo test -p seith-api -- --nocapture → ≥4 passed
cargo test -- --nocapture → pass
sqlite3 data/seith.db "SELECT name FROM sqlite_master WHERE type='table';" → ohlcv fundamentals ranking_cache
```

## Peran + Skill + Sub-agent
| Peran | Skill | Sub-agent | Kapan |
|---|---|---|---|
| Lead T0 | `seith-market-intelligence`+`verification-loop` | — | compose parent T1+T2→05 |
| PM | `git-worktree-manager` | — | merge `t1-core`+`t2-cache`→parent → PR, **veto jika fail** |
| `rust-reviewer` | `code-reviewer` | `code-reviewer` | seith-api |
| `security-reviewer` | `security-review` | `security-reviewer` | market `422` + redact |
| `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca phase |
| `doc-updater` | `remember`+`handoff` | `doc-updater` | sinkron api-spec |

## Next Session Prompt
`skill://seith-market-intelligence` + `handoff/01-sectors-adapter` + `05-envelope-verification.md` + 3Q: `?market default Id` + `SCHEMA_VERSION` + `envelope CLI≡REST`.
