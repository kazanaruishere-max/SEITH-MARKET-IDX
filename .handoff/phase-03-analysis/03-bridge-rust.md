# Task 03 — Rust Bridge `seith-core/src/analysis/` :8002

## Goal
Kunci `seith-core/src/analysis/` bridge `AnalysisRepository` `AnalysisClient base_url timeout 15s retry1` dengan fallback `degraded:true template memo numeric` + disclaimer injection — Rust → Python :8002 HTTP solid.

## Context
- SSOT: `AGENTS.md §3c Seven Zones + §4 Tier-0 NEVER kill 9router + §5b/§6/§6c/§8c` + `docs/spec.md §2[6] §3 Research §7b` + `docs/api-spec.md §9 Analysis` + `docs/tdd-plan.md §3 critical 5) analysis-bridge §7 Boundaries 422` + `docs/notes/00-readme.md ritual 3Q` + `skill://seith-market-intelligence` + `skill://seith-dev` + `skill://no-ai-slop`
- Dependensi: `01` sidecar contract (shape `SynthesizeRequest` + ticker regex)
- Branch: `handoff/03-analysis` atau `handoff/03-analysis-t1-bridge` (T1 Rust: 03)
- Contract: `POST /synthesize` input `{market, ticker, fundamentals, kronos_signal, sector}` output `{fundamental_memo, technical_memo, synthesizer_memo, degraded, disclaimer}` — `api-spec §9`
- Decision founder 2026-09-06: bridge di `seith-core/src/analysis/` (no crate baru, pattern H1+H2 Phase 02)
- `LLM_BASE_URL` (sudah ada `config.rs:32-33` H1) + `ANALYSIS_URL` (sudah ada `config.rs:36-37` H2) env-only default `:20128` + `:8002`

## Scope In / Out
In: Zona 1 `crates/seith-core/src/analysis/{mod.rs,types.rs,client.rs,error.rs}` + `crates/seith-core/src/lib.rs` export + `crates/seith-api/src/analysis.rs` thin wiring — zona 1 domain/infra
Out: Python sidecar `app/{main,predictor,schemas,agents}/*.py` (01+02, zona 2), verify e2e CI green (04), scoring H4, hybrid H5 — tidak disentuh

## Bagian — Surgical Breakdown (1 bagian = 1 fn/struct <50 baris)
| Bag | File | Struktur / Fn | Acceptance | Test FAIL |
|---|---|---|---|---|
| 03a | `src/analysis/types.rs` | `struct Fundamentals {sector:String, roe/margin/leverage/pe/pb:Option<f64>}` + `KronosSignal {expected_return:f64, anomaly_z:f64, volatility:Option<f64>}` + `SynthesizeInput {market:Market, ticker:String, fundamentals:Fundamentals, kronos_signal:KronosSignal, sector:String}` + `SynthesizeOutput {fundamental_memo:String, technical_memo:String, synthesizer_memo:String, degraded:bool, disclaimer:String}` `#[serde(deny_unknown_fields)]` | `serde round-trip` + `ticker regex 422` | `deny unknown→422` |
| 03b | `src/analysis/error.rs` | `enum AnalysisError { Validation(String) 422, Timeout, Upstream(String) 502, Serde }` `thiserror` `Display` no leak | `AnalysisError::Validation("ticker regex").to_string() contains regex` | `unwrap in Display` |
| 03c | `src/analysis/client.rs` | `trait AnalysisRepository: Send + Sync` `fn synthesize(&self, input: SynthesizeInput) -> impl std::future::Future<Output = Result<SynthesizeOutput, AnalysisError>> + Send` (RPITIT stable 1.75, mirror H2 client.rs) | `trait object Send+Sync` compile | — |
| 03d | `src/analysis/client.rs` | `struct AnalysisClient { http: reqwest::Client, base_url: String }` `new(base_url)` `timeout 15s` | `new("http://localhost:8002")` timeout 15s | `timeout 0→Err` |
| 03e | `src/analysis/client.rs` | `fn validate(input: &SynthesizeInput) -> Result<(), AnalysisError>` guard `ticker regex ^[A-Z0-9]{3,6}$ →422` else | `ticker="ab"→422` `ticker="bbca"→422` `ticker="BBCA" ok` | `lax regex` |
| 03f | `src/analysis/client.rs` | `async fn synthesize(&self, input) -> Result<SynthesizeOutput>` validate → `POST {base}/synthesize JSON` `timeout 15s retry1` on `Timeout | Upstream` → fallback `Ok(SynthesizeOutput{degraded:true, memos:"[template-fallback-rs]".to_string(), disclaimer:DISCLAIMER.to_string()})` | `mockito 200 → degraded false` `delay 16s → degraded true fallback` | `retry missing → hang` |
| 03g | `src/analysis/client.rs` | `const DISCLAIMER: &str = "Bukan rekomendasi investasi. Informasi & analisis saja."` + `fn template_memo(input: &SynthesizeInput) -> SynthesizeOutput` numeric deterministic: `fundamental=f"ROE {roe:.2%} margin {margin:.2%} PE {pe:.1f}"` + `technical=f"ER {er:.2%} Z {z:.2f}"` + `synthesizer=f"verdict {verdict} {z:.2f}"` | `template_memo(BBCA, roe=0.18) contains "ROE 18.00%"` | `template prose equality` |
| 03h | `src/analysis/mod.rs` | `pub mod types; pub mod error; pub mod client;` `pub use types::*` `pub use error::AnalysisError` `pub use client::{AnalysisRepository, AnalysisClient}` | `cargo check 0` | — |
| 03i | `src/lib.rs` | `pub mod analysis;` export + `pub const SCHEMA_VERSION` unchanged | `cargo check 0` | — |
| 03j | `crates/seith-api/src/analysis.rs` | `struct AnalysisService { client: AnalysisClient }` thin wiring `impl AnalysisRepository for AnalysisService` delegasi | `seith-api` compile | — |
| 03k | `tests` | `#[cfg(test)]` `mockito` ≥7 tests: `ticker regex→422`, `market Id tag`, `market Sg tag`, `timeout→degraded true`, `200→degraded false`, `disclaimer presence`, `template fallback numeric` | 7 passed no `unwrap` | assertion-less fail |

## Deliverables + Acceptance (per Bagian)
- 03a-b: `types.rs` 60-90 baris + `error.rs` 30-40 baris — Acceptance: `Deny unknown_fields` + `Market` serde `id|sg` + `AnalysisError 422/502` `Display` no leak
- 03c-g: `client.rs` 180-220 baris, `fn <50`, `nesting ≤4`, `reqwest` `Client::builder().timeout(15s).build()?`, `?` no `unwrap`, `tracing::warn!` on retry/degraded, `market.as_str()` tag in JSON
- 03h-j: `mod.rs` 10 baris + `lib.rs` +1 + `seith-api/analysis.rs` 20-30 baris thin — Acceptance: `cargo check 0` workspace
- 03k: `mockito` 80-120 baris 7 tests — Acceptance: `guard + degraded` meaningful assertions
- Constraint: `file 200-400` typical max 800 `seith-core` crate, `fn <50`, `no unwrap` (`?` + `thiserror`), `cargo fmt+clippy 0`, `♻️ Refactor:`
- 7 Zones: file baru wajib zona 1 `crates/seith-core/src/analysis/*` + `crates/seith-api/src/analysis.rs` — cross-zona `seith-core ↛ sectors-client` tetap, `apps/* ↛ crates/*` dilarang — PM veto jika di luar

## Verification
```
cargo fmt --check → 0
cargo clippy -p seith-core -p seith-api -- -D warnings → 0
cargo test -p seith-core -- --nocapture → ≥7 passed (ticker regex 422, market Id/Sg, degraded, disclaimer)
cargo test -- --nocapture → pass workspace
cargo test -p seith-core -- analysis → --nocapture (mockito synthesize 200, timeout degraded)
gitleaks detect --no-banner --source . → 0
refactor-cleaner scan §8c → pass (fn<50 file200-400 nesting≤4)
skill://no-ai-slop detect → pass (Tier-1 warn)
```

### Accountability Block
```
✅ Terverifikasi: <cmd> → <output> (paste nyata, no fabrikasi)
⚠️ Belum: verify CI python-analysis hijau (04), predictor real load (02)
🔻 Risiko: guard hanya di Rust tanpa di Python → mitigasi: guard duplikat dua lapis 01c+03e + template fallback dua lapis
♻️ Refactor: extract template_memo_fn(), split types vs client fn<50
```

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead Otak T0 | opencode sini | `seith-market-intelligence`+`seith-dev`+`verification-loop` | — | approve 03 |
| T1 Bridge | sub-agent | `seith-market-intelligence`+`tdd-workflow` | `tdd-guide` | TDD guard + mockito degraded |
| Arsitek | sub-agent `architect` | `senior-architect` | `architect` | SEBELUM coding — audit `seith-core/analysis` sizing + REST boundary |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer`+`rust-reviewer` | `client.rs` reqwest error + `?` |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | `LLM_BASE_URL+ANALYSIS_URL` env-only, no secret log, 9router Tier-0 |
| PM Autonomous | `seith-pm` | `git-worktree-manager`+gate | — | veto jika gate fail — §8c 7 Zones |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca task — fn<50 |

> §8c: semua agent bertanggung jawab penuh code/logic/testing/structure & rapih 7 Zones — cross-zona import liar = violation

## Next Session Prompt
`skill://seith-market-intelligence` + `skill://seith-dev` + `handoff/03-analysis-t1-bridge` + `03-bridge-rust.md` + ritual 3Q:
1) Gate MI? Bridge `degraded:true template` — research memo di dossier H5 tetap ada tanpa 9router.
2) Jebakan? `ticker regex 422` + `timeout 15s retry1` + `template numeric dua lapis` + `disclaimer always inject` + `9router NEVER kill`.
3) Test FAIL apa? `ticker="bbca"→422`, `timeout→degraded true`, `Id vs Sg tag`, `disclaimer present`, `template numeric`.
