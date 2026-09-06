# Task 05 — Envelope + Repository + Contract Verify

## Goal
Kunci `Envelope<T> {success,data,error,pagination}` + `Repository` WAL + `GET /health` + `?market` `422` + `X-Schema-Version` — fondasi verifiable hybrid REST↔CLI tanpa drift #10.

## Context
- SSOT: `AGENTS.md §3c Seven Zones + §6 envelope + §6c Anti AI Slop + §8c Agent Ownership` + `spec §2 [8] Hybrid Delivery + §7b Zones` + `api-spec §1-3 Schemas+Envelope+Market param` + `adr 0002 SCHEMA_VERSION` + `tdd-plan §4-6 Layers Integration` + `docs/notes/00-readme.md` ritual 3Q + `skill://seith-market-intelligence` + `skill://no-ai-slop` + `verification-loop`
- Dependensi: `01` Market + `02` Cache + `03` Client + `04` Cleansing — closing phase, merge T1+T2 dulu
- Branch: `handoff/01-sectors-adapter` parent (05 di parent setelah T1+T2 merge)

## Scope In / Out
In: zona 1 delivery `seith-api/envelope.rs, repository.rs, lib.rs, handlers.rs` + zona 1 `seith-core/config+redact` polish (7 Zones §3c)
Out: scoring H4 (zona 1), Kronos H2 (zona 2 `apps/kronos-sidecar`), Agents H3 (zona 2 `apps/analysis`), `seith-cli` full H5 + `apps/web` FE H5 (zona 1+2) — cross-zona import dilarang §3c

## Bagian — Surgical Breakdown
| Bag | File | Struktur / Fn | Acceptance | Test FAIL |
|---|---|---|---|---|
| 05a | `envelope.rs` | `struct Envelope<T> {success:bool, data:Option<T>, error:Option<ApiError>, pagination:Option<Pagination>}` `ApiError{code,message}` `Pagination` `fn ok(data)->Self` `fn err(code,msg)->Self` | `ok success==true`, `err VALIDATION_ERROR success==false` + `serde round-trip` | `success false` |
| 05b | `repository.rs` | `trait Repository:Send+Sync {get_ohlcv(market,ticker,date)->Vec<OhlcvRow>, save_ohlcv(market,rows)}` `SqliteRepository {path}` WAL `INSERT OR REPLACE` `PRAGMA busy_timeout 3000` | `:memory: save→get round-trip` | `persist FAIL` |
| 05c | `lib.rs` | `pub mod envelope,repository,handlers` `router(repo:Arc<dyn Repository>)->Router` `GET /health 200 {status:"ok",schema:SCHEMA_VERSION}` | `health 200` | `health 404` |
| 05d | `handlers.rs` | `GET /api/v1/ranking?market=id|sg` `FromStr` default Id `422` invalid + `X-Schema-Version:1.0.0` header | `market=sg 200`, `market=xx 422 VALIDATION_ERROR` | `xx→422` |
| 05e | `verify` | `sqlite3 data/seith.db SELECT name FROM sqlite_master` + `gitleaks` no `SECTORS_API_KEY` | `tables exist` + `no leak` | `leak→FAIL` |
| 05f | `tests` | `axum-test` ≥4 + `skill://no-ai-slop` Tier-1 warn | 4 passed + `no-ai-slop pass` | — |
| 05g | `contract` | `CLI JSON Envelope ≡ REST JSON` shape identik stub (full H5) | shape identik | `drift→FAIL` |

## Deliverables + Acceptance (per Bagian)
- 05a: `envelope.rs` 80-120 baris, `Serialize` identik `seith-cli` JSON — Acceptance: `ok/err round-trip`
- 05b: `repository.rs` 80-120 baris, `rusqlite WAL busy_timeout 3000`, reuse `001_cache.sql` — Acceptance: `:memory: round-trip`
- 05c: `lib.rs` 60-90 baris — Acceptance: `router health 200` + `X-Schema-Version`
- 05d: `handlers.rs` 60-90 baris guard `lookback>512→422` + `?market` `422` — Acceptance: `sg 200 xx 422`
- 05e-g: `verify + tests + contract` stub
- Constraint: `fn <50`, `file 200-400`, `nesting ≤4`, `no unwrap` `?`, `cargo fmt+clippy` clean, 7 Zones `seith-api` zona 1 + `data/` zona 3, `♻️ Refactor:` — §8c

## Verification
```
cargo fmt --check → 0
cargo clippy -p seith-core -p seith-api -p sectors-client -- -D warnings → 0
cargo test -p seith-api -- --nocapture → ≥4 passed
cargo test -- --nocapture → pass
sqlite3 data/seith.db "SELECT name FROM sqlite_master WHERE type='table';" → ohlcv fundamentals ranking_cache (zona 3)
refactor-cleaner scan §8c → fn<50 file200-400 nesting≤4 pass
skill://no-ai-slop detect → pass (Tier-1 warn)
```

### Accountability Block
```
✅ Terverifikasi: <cmd> → <output> (paste nyata)
⚠️ Belum: full ranking handler H4
🔻 Risiko: envelope drift CLI vs REST — deteksi: contract test H5
♻️ Refactor: extract envelope ok/err helper fn<50
```

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead Otak T0 | opencode sini | `seith-market-intelligence`+`verification-loop` | — | compose parent T1+T2→05, verify phase gate |
| PM Autonomous | `seith-pm` | `git-worktree-manager`+gate `fmt/clippy/test` | — | merge `t1-core`+`t2-cache`→parent → PR, **veto jika gate fail** |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | `seith-api` envelope+handlers |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | market `422` + `redact` no leak |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca phase — `fn<50 file200-400` §8c |
| Doc + Handoff | `doc-updater` | `remember`+`handoff` | `doc-updater` | sinkron `api-spec §1-3` + tdd-plan — 7 Zones |

> §8c Ownership: semua agent bertanggung jawab penuh `code/logic/testing/structure & rapih` — `fn<50 file200-400` + 7 Zones; PM veto jika tidak rapih
| Desainer Test | `tdd-guide` | `tdd-guide` | `tdd-guide` | `axum-test` matrix + fixtures |
| Doc + Handoff | `doc-updater` | `remember`+`handoff` | `doc-updater` | sinkron `api-spec §1-3` + tdd-plan |
| Arsitek | `architect` | `senior-architect` | `architect` | review `envelope.rs` + `handlers.rs` |

## Next Session Prompt
`skill://seith-market-intelligence` + `handoff/01-sectors-adapter` + `05-envelope-verification.md` + ritual 3Q:
1) Gate MI? Envelope verifiable + persist offline — anti #10 drift.
2) Jebakan? `?market` default `Id` vs `422` invalid + `SCHEMA_VERSION` header + `WAL` persist.
3) Test FAIL apa? `GET /health 200`, `ranking?market=xx 422`, `SqliteRepository :memory: round-trip`, `sqlite3 persist`, `CLI Envelope ≡ REST`.
