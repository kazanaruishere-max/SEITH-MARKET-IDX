# Task 01 — Axum API + Envelope + Market Validation

## Goal
Expand `crates/seith-api` — 6 endpoints Axum `/api/v1/*` envelope `{success,data,error,pagination}` + `x-schema-version: SCHEMA_VERSION` + `Market Id|Sg` validation `422` + pagination `page/pageSize max50`.

## Context
- SSOT: `docs/api-spec.md §1 envelope §3 endpoints §4 schemas §6 Repository §7 mapping` + `docs/spec.md §2[8] Hybrid` + `AGENTS.md §3c Z1 §6 contract §6c no-ai-slop` + `crates/seith-api/src/{lib 24L,envelope 119L,handlers 87L,repository}` existing + `crates/seith-core/src/market.rs Market::from_str` + `SCHEMA_VERSION 1.0.0`

## Scope In / Out
In: Z1 `crates/seith-api/src/{handlers.rs, lib.rs, envelope.rs}` + `crates/seith-api/tests/api.rs` — Axum handlers only
Out: `seith-cli` (02), `seith-core/dossier.rs` compose logic (02), `apps/web` (03), sidecars `:8001/:8002` (verify only)

## Bagian — Surgical (1 bag = 1 fn ≤50 baris)
| Bag | File | Fn / Struct | Acceptance | Test FAIL |
|---|---|---|---|---|
| 01a | `handlers.rs` | `RankingQuery {market,sector,sort,order,page,pageSize} + fn ranking(State, Query)` validate `Market::from_str` 422 + `lookback>512→422` + `pageSize max50 clamp` + `deny_unknown_fields 422` + `sort/order enum` return `Envelope::ok_with_pagination(data,pagination)` + `disclaimer` | `?market=sg` ok, `?market=xx→422 VALIDATION_ERROR`, `pageSize 100→50`, `?sort=bad→422` | `invalid market 200→FAIL` |
| 01b | `handlers.rs` | `fn score(State, Path<ticker>, Query<market>)` ticker `^[A-Z0-9]{3,6}$` normalize `BBCA.JK→BBCA` 422 if fail, market default Id, repo fetch → 404 `TICKER_NOT_FOUND` if exclude, else `Envelope::ok(ScoreResponse{mispricingScore,components,anomaly,disclaimer})` | `BBCA.JK→BBCA 200`, `BOGUS→404` | `BBCA.JK 422→FAIL` |
| 01c | `handlers.rs` | `fn dossier(State, Path<ticker>, Query{market,format})` `format=json|pdf` default json, json → `Envelope::ok(DossierJson{peerComparison,kronos,chartPoints,research})`, pdf → `Content-Type: application/pdf` bytes | `?format=pdf → pdf header`, `?format=json → envelope` | `pdf returns json→FAIL` |
| 01d | `handlers.rs` | `fn anomalies(State, Query{market,sector,minZ,page,pageSize})` filter `|Z|>minZ default 2.0` sort `|Z| desc` per market + pagination | `minZ=1.5 returns more` | `sort asc→FAIL` |
| 01e | `handlers.rs` | `fn scan(State, Json<ScanBody{tickers 1-50,lookback, predLen, market}>)` validate `lookback<=512 && predLen<=512` + `tickers.len 1-50` → 422, cleansing exclude → `excluded:[{ticker,reason}]` + `degraded` | `51 tickers→422`, `lookback 600→422` | `excluded missing→FAIL` |
| 01f | `lib.rs` | `pub fn router(repo: DynRepository) -> Router` wire `GET /health /api/v1/health /api/v1/ranking /api/v1/tickers/:ticker/score /api/v1/tickers/:ticker/dossier /api/v1/anomalies POST /api/v1/scan` + `tower-http trace+limit` | `router has 7 routes` | `missing route→FAIL` |
| 01g | `tests/api.rs` | `#[tokio::test] 6 integration` mockito + `Envelope` assert `success/x-schema-version/pagination/disclaimer` | 6 passed | `envelope drift→FAIL` |

## Deliverables + Acceptance
- `handlers.rs 180-300L` `fn<50 nesting≤4 no unwrap ?+thiserror` — Axum `Response` + `schema_headers()` per endpoint
- `lib.rs +20L` + `tests/api.rs 6 cases` — `cargo test -p seith-api 6+5 envelope=11 passed`
- 7 Zones Z1 only — `seith-core` no import `sectors-client` — PM veto if cross-zona

## Verification
```
cargo fmt --check → 0
cargo clippy -p seith-api -- -D warnings → 0
cargo test -p seith-api -- --nocapture → 11 passed (5 envelope + 6 api)
curl /api/v1/ranking?market=xx → 422 VALIDATION_ERROR
curl /api/v1/ranking?market=sg&pageSize=100 → pageSize 50 clamp
```

### Accountability Block
```
✅ Terverifikasi: <cmd> → <output> paste nyata
⚠️ Belum: CLI envelope (02), Web consume (03)
🔻 Risiko: market sg noise campur Id → mitigasi Market::from_str strict + key market:sector:ticker:date
♻️ Refactor: extract validate_market(), schema_headers(), error_response() fn<50
```

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead | opencode | `seith-market-intelligence` | — | approve 01 |
| T1 API | sub-agent | `seith-market-intelligence`+`tdd-workflow`+`verification-loop`+`git-worktree-manager`+`no-ai-slop` | `tdd-guide` | TDD envelope+market 422 |
| Arsitek | `architect` | `senior-architect` | `architect` | SEBELUM 01 — audit 7 Zones |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | handlers edge — `no-ai-slop` Tier-1 |
| PM | `seith-pm` | `git-worktree-manager`+gate `fmt/clippy/test` | — | veto jika gate fail — `security-reviewer` mandatory |

## Next
`skill://seith-market-intelligence` + `handoff/05-hybrid-t1-api` + `01-api-axum-envelope.md` + ritual 3Q: gate MI mana? envelope derived only. jebakan? market 422 + pageSize max50 + x-schema-version. test FAIL? invalid market→422, pageSize clamp, ticker 404.
