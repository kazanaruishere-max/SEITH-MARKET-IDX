# Task 01 — Scoring Engine 0-100

## Goal
Kunci `seith-core/src/scoring/{mod,components,calculator}.rs` `compute(er, anomaly_z, qv, sm) -> {score 0-100, components{expectedReturn, anomalyZ, qualityValue, sectorMom}}` clamp explainable.

## Context
- SSOT: `AGENTS.md §3c §7b §6 §6c §8c` + `docs/spec.md §4 Scoring 0-100` + `docs/api-spec.md §3-4 schemas` + `docs/tdd-plan.md §3 critical 1) scoring-engine 80%` + `docs/notes/00-readme.md ritual 3Q` + `skill://seith-market-intelligence` + `skill://tdd-workflow` + `skill://no-ai-slop` + `spec §2[4]`

## Scope In / Out
In: Zona 1 `crates/seith-core/src/scoring/mod.rs + components.rs + calculator.rs` + tests `9 passed` — zona 1
Out: `anomaly` (02), `ranking` (03), `analysis` `kronos` `normalize` touchless — verify only 04

## Bagian — Surgical Breakdown (WAJIB dipisah, 1 bagian = 1 fn ≤50 baris)
| Bag | File | Struktur / Fn | Acceptance | Test FAIL |
|---|---|---|---|---|
| 01a | `scoring/components.rs` | `struct Components {expected_return: f32, anomaly_z: f32, quality_value: f32, sector_mom: f32}` `#[derive(Serialize,Deserialize,PartialEq)]` `deny_unknown_fields` | `serde round-trip` + `deny unknown 422` | `deny unknown→422` |
| 01b | `scoring/calculator.rs` | `fn z_normalize(er: f32) -> f32` `clamp(er*10+50,0,100)` map z→0-100 | `z 0.5→55` `z -2→30` | `z inf→clamp` |
| 01c | `scoring/calculator.rs` | `fn qv_percentile(value: f32, sector_vals: &[f32]) -> f32` `percentile per market sort+index` `100*(rank/total)` | `value median→50` `max→100` `empty→50.0` | `divider 0 → 50.0 no panic` |
| 01d | `scoring/calculator.rs` | `fn sector_mom(median: Option<f32>) -> f32` `median*10+50 clamp` fallback 50 | `None→50.0` `median 0.02→70` | `median inf→100` |
| 01e | `scoring/calculator.rs` | `fn compute(er, anomaly_z, qv, sm) -> {score, components}` `0.30*ER_z +0.20*(100-|Z|_norm)+0.30*QV+0.20*SM clamp0-100` simpan components | `all 50→50` `all 0→40` | `div 0 → no panic clamp` |
| 01f | `scoring/mod.rs` | `pub mod components; pub mod calculator; pub use components::Components` `pub use calculator::compute` | `cargo check 0` | — |
| 01g | `crates/seith-core/src/lib.rs` | `pub mod scoring;` replace placeholder | `cargo check 0` | — |
| 01h | `tests` | `#[cfg(test)]` `9 tests` | 9 passed | `all fail → no guess` |

## Deliverables + Acceptance (per Bagian)
- 01a: `components.rs 60-80 baris` — Acceptance: `serde deny_unknown_fields degrade:false` + `Components clone Serializable`
- 01b-e: `calculator.rs 120-180 baris` — Acceptance: `fn <50` `clamp pixel-perfect 3.243` `no unwrap` `?` + `thiserror`
- 01g: `lib.rs +1` + `tests 9 passed` — Acceptance: `mock: crate features be fixed, core engine be tested`
- Constraint: `file 200-400` `fn <50 nesting≤4` `no unwrap` (`?` + `thiserror`) `♻️ Refactor:` + `cargo fmt+clippy 0`
- 7 Zones: file baru wajib zona 1 — cross-zona `seith-core ↛ sectors-client` — PM veto jika di luar

## Verification
```
cargo fmt --check → 0
cargo clippy -p seith-core -- -D warnings → 0
cargo test -p seith-core -- --nocapture → ≥9 passed (z clamp, qv percentile empty→50, sm fall 50, compute 40-50)
cargo check → 0
refactor-cleaner scan §8c → pass (fn<50 file200-400 nesting≤4)
skill://no-ai-slop detect → pass (Tier-1 warn)
```

### Accountability Block
```
✅ Terverifikasi: <cmd> → <output> (paste nyata, no fabrikasi)
⚠️ Belum: anomaly flag (02), ranking sort (03)
🔻 Risiko: divider=0 → mitigasi: guard divider.abs()<EPS return 0.0 mid
♻️ Refactor: extract format_opt_pct(), split types/client fn<50
```

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead Otak T0 | opencode sini | `seith-market-intelligence`+`verification-loop` | — | approve 01 |
| T1 Scoring | sub-agent | `seith-market-intelligence`+`tdd-workflow`+`verification-loop` | `tdd-guide` | TDD components + calculator 9 kasus |
| Arsitek | sub-agent `architect` | `senior-architect` | `architect` | **SEBELUM coding 01** — audit scoring sizing |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | `calculator.rs` edge cases |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | input validation `0-100 clamp` |
| PM Autonomous | `seith-pm` | `git-worktree-manager`+gate | — | **veto merge jika fail — ownership §8c 7 Zones** |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca task — `fn<50` |
| Doc | `doc-updater` | `remember`+`handoff` | `doc-updater` | cek drift |

> Ownership §8c: tiap agent tanggung jawab penuh code/logic/testing/structure & rapih (§8c)

## Next Session Prompt
`skill://seith-market-intelligence` + `skill://tdd-workflow` + `handoff/04-scoring-t1-scoring` + `01-scoring-engine.md` + ritual 3Q: 1) gate MI mana? `components breakdown` wajib di dossier H5 — tanpa ini Tech Depth 0. 2) jebakan? `z_normalize clamp + qv percentile empty 50 + sm fallback 50 + div 0`. 3) test FAIL apa? `compute all 50→50, all 0→40`, `z inf→clamp`, `divider 0→50.0`, `deny unknown 422`.
