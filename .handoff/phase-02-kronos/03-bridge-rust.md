# Task 03 — Rust Bridge `seith-core/src/kronos/` :8001

## Goal
Kunci `seith-core/src/kronos/` bridge `KronosRepository` `KronosClient base_url timeout 30s retry1` dengan guard `max_context 512 →422` + `degraded:true` fallback — Rust → Python :8001 HTTP solid.

## Context
- SSOT: `AGENTS.md §3c Seven Zones + §5b/§6/§6c/§8c` + `docs/spec.md §2[3] §3 Quant §7b` + `docs/api-spec.md §9 Sidecar Contracts` + `docs/tdd-plan.md §3 critical 4) kronos-bridge + §7 Boundaries 422` + `docs/kronos-notes.md max_context 512` + `docs/notes/00-readme.md ritual 3Q` + `skill://seith-market-intelligence` + `skill://seith-kronos` + `skill://no-ai-slop`
- Dependensi: `01` sidecar contract (shape `PredictRequest` + guard 512)
- Branch: `handoff/02-kronos` atau `handoff/02-kronos/t1-bridge` (T1 Rust: 03)
- Contract: `POST /predict` & `/predict_batch` input `{market, df, x_timestamp, y_timestamp, pred_len, T, top_p}` output `{pred_df|pred_dfs, degraded}` — `api-spec §9`
- Decision approved: bridge di `seith-core/src/kronos/` (no crate baru) — `seith-api` thin wiring only

## Scope In / Out
In: Zona 1 `crates/seith-core/src/kronos/mod.rs` + `types.rs` + `client.rs` + `error.rs` + `crates/seith-core/src/lib.rs` export + `crates/seith-core/src/config.rs` tambah `KRONOS_URL` (`http://localhost:8001` default) + Zona 1 `crates/seith-api/src/kronos.rs` (repository impl thin) — zona 1 domain/infra
Out: Python sidecar `app/main.py + predictor.py` (01+02, zona 2), verify e2e CI green (04), scoring H4, analysis :8002 H3 — tidak disentuh

## Bagian — Surgical Breakdown (WAJIB dipisah, 1 bagian = 1 fn/struct <50 baris)
| Bag | File | Struktur / Fn | Acceptance | Test FAIL |
|---|---|---|---|---|
| 03a | `src/kronos/types.rs` | `struct PredictInput {market:Market, df:Vec<OhlcvRow>, x_timestamp:Vec<i64>, y_timestamp:Vec<i64>, pred_len:u16, t:f32, top_p:f32}` + `PredictOutput {pred_df:Vec<OhlcvRow>, degraded:bool}` + `PredictBatchInput {market, dfs:Vec<Vec<OhlcvRow>>, x_timestamps, y_timestamps, pred_len, t, top_p}` + `BatchOutput {pred_dfs, degraded}` `deny_unknown_fields` | `serde round-trip` + `pred_len 600 → validator 422` | `deny unknown→422` |
| 03b | `src/kronos/error.rs` | `enum KronosError { Validation(String) 422, Timeout, Upstream(String) 502, Serde }` `thiserror` `Display` no leak | `KronosError::Validation("max_context 512").to_string() contains 512` | `unwrap in Display` |
| 03c | `src/kronos/client.rs` | `trait KronosRepository { async fn predict(&self, input: PredictInput) -> Result<PredictOutput, KronosError>; async fn predict_batch(&self, input: PredictBatchInput) -> Result<BatchOutput, KronosError> }` | `trait object Send+Sync` compile | — |
| 03d | `src/kronos/client.rs` | `struct KronosClient { http: reqwest::Client, base_url: String }` `new(base_url)` `timeout 30s` `with_retry1()` | `new("http://localhost:8001")` timeout 30s | `timeout 0→Err` |
| 03e | `src/kronos/client.rs` | `fn validate(input: &PredictInput) -> Result<(), KronosError>` guard `pred_len>512 →422` + `df.len()+pred_len>512 →422 max_context 512` + `df.len()==x_timestamp.len()` + `equal guard batch` else `422` | `400+20=420 ok` `500+20=520→422` `unequal 400 vs 380→422` | `lookback 520→422` |
| 03f | `src/kronos/client.rs` | `async fn predict_batch(&self, input) -> Result<BatchOutput>` validate → `POST {base}/predict_batch JSON` `T 1.0 top_p 0.9` `timeout 30s retry1` on `Timeout` → retry once → `Upstream degraded:true` fallback `Ok(BatchOutput{degraded:true, pred_dfs:vec![]})` | `mockito 200 → degraded false` `delay 31s → degraded true fallback` | `retry missing → hang` |
| 03g | `src/config.rs` | `KRONOS_URL env` `env::var("KRONOS_URL").unwrap_or("http://localhost:8001")` `AppConfig {kronos_url:String}` `from_env fail-fast` no secret log | `KRONOS_URL not set → default :8001` | `KRONOS_URL="not-a-url"→Err` |
| 03h | `src/kronos/mod.rs` | `pub mod types; pub mod error; pub mod client;` `pub use types::*` `pub use error::KronosError` `pub use client::{KronosRepository, KronosClient}` | `cargo check 0` | — |
| 03i | `src/lib.rs` | `pub mod kronos;` export + `pub const SCHEMA_VERSION` unchanged | `cargo check 0` | — |
| 03j | `crates/seith-api/src/kronos.rs` | `struct KronosService { client: KronosClient }` thin wiring `impl KronosRepository for KronosService` delegasi | `seith-api` compile | — |
| 03k | `tests` | `#[cfg(test)]` `mockito` ≥7 tests: `guard 512→422`, `equal guard→422`, `market Id tag`, `market Sg tag`, `timeout→degraded true`, `200→degraded false`, `pred_len 20 ok` | 7 passed no `unwrap` | assertion-less fail |

## Deliverables + Acceptance (per Bagian)
- 03a-b: `types.rs` 60-90 baris + `error.rs` 30-40 baris — Acceptance: `Deny unknown_fields` + `Market` serde `id|sg` + `KronosError 422/502` `Display` no leak
- 03c-f: `client.rs` 120-180 baris, `fn <50`, `nesting ≤4`, `reqwest` `Client::builder().timeout(30s).build()?`, `?` no `unwrap`, `tracing::warn!` on retry/degraded, `market.as_str()` tag in JSON
- 03g: `config.rs` +10 baris `KRONOS_URL` — Acceptance: `env missing→default :8001` + `cargo test config` pass
- 03h-j: `mod.rs` 10 baris + `lib.rs` +1 + `seith-api/kronos.rs` 20-30 baris thin — Acceptance: `cargo check 0` workspace
- 03k: `mockito` 80-120 baris 7 tests — Acceptance: `guard + degraded` meaningful assertions
- Constraint: `file 200-400` typical max 800 `seith-core` crate, `fn <50`, `no unwrap` (`?` + `thiserror`), `cargo fmt+clippy 0`, `♻️ Refactor:`
- 7 Zones: file baru wajib zona 1 `crates/seith-core/src/kronos/*` + `crates/seith-api/src/kronos.rs` — cross-zona `seith-core ↛ sectors-client` tetap, `apps/* ↛ crates/*` dilarang — PM veto jika di luar

## Verification
```
cargo fmt --check → 0
cargo clippy -p seith-core -p seith-api -- -D warnings → 0
cargo test -p seith-core -- --nocapture → ≥7 passed (guard 512, equal, degraded, market tag)
cargo test -- --nocapture → pass workspace
cargo test -p seith-core -- kronos → --nocapture (mockito predict_batch 400→20)
gitleaks detect --no-banner --source . → 0
refactor-cleaner scan §8c → pass (fn<50 file200-400 nesting≤4)
skill://no-ai-slop detect → pass (Tier-1 warn)
```

### Accountability Block
```
✅ Terverifikasi: <cmd> → <output> (paste nyata, no fabrikasi)
⚠️ Belum: verify CI python-kronos hijau (04), predictor real load (02)
🔻 Risiko: guard hanya di Rust tanpa di Python → mitigasi: guard duplikat dua lapis 01b+03e
♻️ Refactor: extract validate_max_context(), split types vs client fn<50
```

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead Otak T0 | opencode sini | `seith-market-intelligence`+`seith-kronos`+`verification-loop` | — | approve 03 |
| T1 Bridge | sub-agent | `seith-market-intelligence`+`seith-kronos`+`tdd-workflow` | `tdd-guide` | TDD guard + mockito degraded |
| Arsitek | sub-agent `architect` | `senior-architect` | `architect` | SEBELUM coding — audit `seith-core/kronos` sizing + REST boundary |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer`+`rust-reviewer` | `client.rs` reqwest error + `?` |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | `KRONOS_URL` env-only, `512 guard`, no secret log |
| PM Autonomous | `seith-pm` | `git-worktree-manager`+gate | — | veto jika gate fail — §8c 7 Zones |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca task — fn<50 |

> §8c: semua agent bertanggung jawab penuh code/logic/testing/structure & rapih 7 Zones — cross-zona import liar = violation

## Next Session Prompt
`skill://seith-market-intelligence` + `skill://seith-kronos` + `handoff/02-kronos/t1-bridge` + `03-bridge-rust.md` + ritual 3Q:
1) Gate MI? Bridge `degraded:true` — ranking H4 tetap jalan tanpa Kronos.
2) Jebakan? `max_context 512` dua lapis + `timeout 30s retry1` + `market tag` + `mockito delay`.
3) Test FAIL apa? `lookback 520→422`, `unequal→422`, `delay 31s→degraded true`, `Id vs Sg tag`.
