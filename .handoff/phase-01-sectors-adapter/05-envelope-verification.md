# Task 05 — Envelope + Repository Pattern + Contract Verification

## Goal
Kunci Axum envelope `{success,data,error,pagination}` + `SCHEMA_VERSION` + repository pattern + contract `CLI JSON ≡ REST JSON` stub + `config.rs` fail-fast + `redact.rs` no leak — fondasi verifiable H5 hybrid `Rest ↔ CLI` tanpa drift + offline `data/seith.db` persist verified.

## Context
- SSOT: `AGENTS.md §6 API envelope WAJIB + §6c Anti AI Slop Tier-1` + `docs/spec.md §2 Pipeline [8] Hybrid Delivery` + `docs/api-spec.md §1-3 Schemas+Envelope+Market param + §9-10 sidecar+9router` + `docs/tdd-plan.md §4-6 Layers Integration + Contract/E2E` + `docs/adr/0002-wire` envelope transport `SCHEMA_VERSION` + `docs/notes/00-readme.md` + `skill://seith-market-intelligence` + `verification-loop`
- Dependensi: `01` Market+models + `02` Cache + `03` Sectors client + `04` Cleansing — task 05 compose minimal Axum + repo trait agar `cargo test` + `contract` + `sqlite3 persist` verified sebelum H2
- Branch: `handoff/01-sectors-adapter` (parent) — merge T1(`01+04`) + T2(`02+03`) dulu, baru 05 di parent agar envelope cover semua slice H1
- Fondasi: `Envelope` konsisten prevent drift `CLI (seith-cli clap)` vs `REST (/api/v1/*)` vs `Sectors mapping` — juri verifiable `cargo test` + `sqlite3 data/seith.db` survive restart (anti-pattern #10)

## Scope In / Out
In: `crates/seith-api/src/lib.rs` (Axum `Router` + `GET /health` + `GET /api/v1/ranking?market=id|sg` stub return envelope + `?market` query parse `Market::from_str` default `Id` → `422` jika invalid), `crates/seith-api/src/envelope.rs` (`struct Envelope<T> { success:bool, data:Option<T>, error:Option<ApiError>, pagination:Option<Pagination> }` + `ApiError {code, message}` + `SCHEMA_VERSION` header), `crates/seith-api/src/repository.rs` (`trait Repository { fn get_ohlcv(&self, market:Market, ticker:&str)->Result<Vec<OhlcvRow>> }` + `struct SqliteRepository { path:String }` stub), `crates/seith-core/src/config.rs` + `redact.rs` polish jika belum di `03`, `apps/web` tidak sentuh H1 (defer H5).
Out: Scoring 0-100 (`H4`), Kronos bridge (`H2`), Agents Lite (`H3`), `seith-cli` full (`H5`), Next.js FE + dossier PDF (`H5`) — hanya envelope+repo stub + contract verify, tidak full handler ranking/dossier.

## Deliverables + Acceptance
- `crates/seith-api/src/envelope.rs`:
  - `pub struct Envelope<T: Serialize> { pub success: bool, pub data: Option<T>, pub error: Option<ApiError>, pub pagination: Option<Pagination> }` + `pub struct ApiError { pub code: String, pub message: String }` (`VALIDATION_ERROR 422`, `NOT_FOUND 404`, `INTERNAL 500`) + `pub struct Pagination { pub page:u32, pub per_page:u32, pub total:u64 }` — `Serialize` identik `seith-cli` JSON
  - `impl<T> Envelope { pub fn ok(data:T)->Self {success:true} pub fn err(code:&str, msg:&str)->Self {success:false} }` + `From` untuk `SCHEMA_VERSION` header `X-Schema-Version: 1.0.0`
  - Acceptance: `serde_json round-trip Envelope<Vec<OhlcvRow>>` + `Envelope::err("VALIDATION_ERROR","max_context 512").success==false` + `deny_unknown_fields` di inner `T` tetap enforce
- `crates/seith-api/src/repository.rs`:
  - `pub trait Repository: Send+Sync { fn get_ohlcv(&self, market:Market, ticker:&str, date:&str) -> Result<Vec<OhlcvRow>, RepoError>; fn save_ohlcv(&self, market:Market, rows: Vec<OhlcvRow>) -> Result<(), RepoError>; }` + `pub struct SqliteRepository { path: String }` `impl Repository` via `rusqlite` (open `data/seith.db`, `PRAGMA journal_mode=WAL`, `INSERT OR REPLACE` per `market:ticker:date` key) — stub minimal, reuse `migrations/001_cache.sql`
  - Acceptance: `SqliteRepository::new(":memory:").save_ohlcv(Market::Id, rows) → get_ohlcv == rows` round-trip (rusqlite `:memory:`)
- `crates/seith-api/src/lib.rs`:
  - `pub mod envelope; pub mod repository; pub mod handlers;` + `pub fn router(repo: Arc<dyn Repository>) -> Router` + `GET /health → Envelope::ok(json!({"status":"ok","schema":SCHEMA_VERSION}))` + `GET /api/v1/ranking?market=id|sg` stub → `if market parse fail → Envelope::err 422 VALIDATION_ERROR` else `Envelope::ok(vec![])` (empty, real ranking H4)
  - Acceptance: `cargo test -p seith-api` `axum-test` atau `reqwest` against `tokio::spawn(router)` → `GET /health → 200 success:true` + `GET /api/v1/ranking?market=sg → 200 success:true` + `GET /api/v1/ranking?market=xx → 422 success:false VALIDATION_ERROR` + `X-Schema-Version: 1.0.0` header present
- `crates/seith-cli` (H1 stub, full H5) — tidak wajib H1, tapi contract test prepare: `assert CLI JSON ≡ REST JSON` shape `Envelope` identik (defer file, catat di DoD H1)
- Constraint: `fn <50`, `file 200-400`, `nesting ≤4`, `no dead code`, `cargo fmt+clippy` clean, `♻️ Refactor:`, prose handoff cek `skill://no-ai-slop` Tier-1 warn (H5 hard fail)
- Verification tambahan: `sqlite3 data/seith.db "SELECT count(*) FROM ohlcv;"` persist after `cargo test -p seith-api` (integration `#[ignore]` jika file lock) + `gitleaks` no `SECTORS_API_KEY` leak + `cargo fmt --check` 0

## Verification (paste output nyata)
```
cargo fmt --check → 0
cargo clippy -p seith-core -p seith-api -p sectors-client -- -D warnings → 0
cargo test -p seith-core -- --nocapture → pass (market+models+normalize)
cargo test -p sectors-client -- --nocapture → pass (cache+client)
cargo test -p seith-api -- --nocapture → pass (envelope round-trip, GET /health 200, GET /ranking?market=xx 422, SqliteRepository :memory:)
cargo test -- --nocapture → pass (workspace)
sqlite3 data/seith.db "SELECT name FROM sqlite_master WHERE type='table';" → ohlcv fundamentals ranking_cache
# contract: rg "Envelope" crates/seith-api crates/seith-cli → shape identik (manual H1, automated H5)
```
+ Accountability Block: `✅ cargo test -p seith-api → 4 passed / ⚠️ Belum: full ranking handler H4 / 🔻 Envelope drift CLI vs REST — deteksi: contract test H5 / ♻️ Refactor: extract envelope ok/err helper fn<50`

## Peran + Skill + Sub-agent (task ini)
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead T0 | opencode sini | `seith-market-intelligence` + `verification-loop` | — | compose parent merge T1+T2 → 05, verify phase gate |
| PM Autonomous | `seith-pm` | `git-worktree-manager` + gate `fmt/clippy/test` | — | orkestrasi merge `t1-core` + `t2-cache` → `handoff/01` → PR ke `main`, **veto jika gate fail** |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | `seith-api` envelope + handlers |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | market validation `422`, no leak `redact`, `X-Schema-Version` |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca phase — full scan `fn<50 file200-400` |
| Doc | `doc-updater` | `remember`+`handoff` | `doc-updater` | sinkron `api-spec §1-3` + `tdd-plan §4-6` |

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/01-sectors-adapter` + task `05-envelope-verification.md` (closing phase) → ritual 3Q: 1) gate MI? envelope verifiable + persist offline. 2) jebakan? `?market` param default `Id` vs `422` invalid, `SCHEMA_VERSION` header. 3) test FAIL? `GET /health 200`, `ranking?market=xx 422`, `SqliteRepository :memory: round-trip` + `sqlite3 data/seith.db` persist.
