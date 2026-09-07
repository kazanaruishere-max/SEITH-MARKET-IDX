# Task 02 — Anomaly Detector |Z|>2 + Volume >2σ

## Goal
Kunci `seith-core/src/anomaly/{mod,traits,volume}.rs` `calc_z=(actual-forecast)/σ + flag |Z|>2 atau volume>2σ + reason wajib` deterministik no LLM.

## Context
- SSOT: `AGENTS.md §3c §6 Contract Rules §8c` + `docs/spec.md §2[5] §4 anomaly` + `docs/api-spec.md §3 anomalies §4-5 §6 Repository trait Anomaly` + `docs/tdd-plan.md §3 critical 2) anomaly-detector 80%` + `docs/notes/00-readme.md ritual 3Q` + `skill://seith-market-intelligence` + `skill://tdd-workflow` + `skill://no-ai-slop`

## Scope In / Out
In: Zona 1 `crates/seith-core/src/anomaly/mod.rs + traits.rs + volume.rs` + tests `9 passed` + Z1 `crates/seith-core/src/lib.rs` export — zona 1
Out: `scoring` (01), `ranking` (03), `analysis/kronos` bridges — verify only 04

## Bagian — Surgical Breakdown (1 bagian = 1 fn ≤50 baris)
| Bag | File | Struktur / Fn | Acceptance | Test FAIL |
|---|---|---|---|---|
| 02a | `anomaly/traits.rs` | `struct AnomalyInput {actual: f32, forecast: f32, sigma: f32, volume: f32, vol_mean: f32, vol_std: f32}` | `serde round-trip` `deny unknown 422` | `sigma 0→guard` |
| 02b | `anomaly/traits.rs` | `fn calc_z(actual, forecast, sigma: f32) -> f32` `if sigma.abs()<EPS 0.0 else (actual-forecast)/sigma` | `forecast==actual→0` `sigma 0→0` | `sigma 0 panic` |
| 02c | `anomaly/traits.rs` | `fn flag_z(z: f32) -> bool` `|z|>2.0` + `reason: Option<String> = Some("anomaly_z")` if flag | `z 2.1→true` `z 1.9→false` | `z 2.0→false edge` |
| 02d | `anomaly/volume.rs` | `fn volume_spike(volume, mean, std: f32) -> bool` `(volume-mean)/std >2.0` guard `std<EPS false` | `mean100 std10 vol125→true` `std0→false` | `std 0 panic` |
| 02e | `anomaly/volume.rs` | `fn anomaly_flag(input: AnomalyInput) -> {flag: bool, reason: String}` `flag = flag_z || volume_spike` `reason = "z=2.3\|vol>2σ"` if flag else `""` | `z 3.0→flag true reason "z"` `vol spike→true reason "vol"` | `no reason` |
| 02f | `anomaly/mod.rs` | `pub mod traits; pub mod volume; pub use traits::{calc_z, flag_z}; pub use volume::{volume_spike, anomaly_flag}` | `cargo check 0` | — |
| 02g | `crates/seith-core/src/lib.rs` | `pub mod anomaly;` export | `cargo check 0` | — |
| 02h | `tests` | `#[cfg(test)]` `9 tests` | 9 passed `z 0/2.1/vol spike/market` | `assert-less fail` |

## Deliverables + Acceptance (per Bagian)
- 02a-b: `traits.rs 80-100 baris` — Acceptance: `calc_z deterministic` `sigma 0 guard no panic` `z_normalize mirror scoring 01b`
- 02c-e: `volume.rs 80-120 baris` — Acceptance: `flag_z |Z|>2` `volume_spike >2σ` `reason wajib if flag` `anomaly_flag compose both`
- 02f-g: `mod.rs 10+6` + `lib.rs +1` — Acceptance: `cargo check 0` + `cargo clippy 0`
- 02h: `9 tests` — Acceptance: `z 0.0/2.1/2.5 clamp` `vol 125>2σ true` `std 0 false` `combined flag` `market Id/Sg indifferent`
- Constraint: `file 200-400` `fn <50 nesting≤4` `no unwrap` (`?` + `thiserror` if validation) `♻️ Refactor:` + `cargo fmt+clippy 0`
- 7 Zones: file baru wajib zona 1 — cross-zona `seith-core ↛ sectors-client` — PM veto jika di luar

## Verification
```
cargo fmt --check → 0
cargo clippy -p seith-core -- -D warnings → 0
cargo test -p seith-core -- --nocapture → ≥9 passed (z 0, z 2.1 flag true, z 1.9 false, vol spike, std 0 guard, combined)
cargo check → 0
refactor-cleaner scan §8c → pass (fn<50 file200-400 nesting≤4)
skill://no-ai-slop detect → pass (Tier-1 warn)
```

### Accountability Block
```
✅ Terverifikasi: <cmd> → <output> (paste nyata, no fabrikasi)
⚠️ Belum: ranking sort paginate (03), verify green (04)
🔻 Risiko: sigma 0 panic → mitigasi: guard EPS return 0.0 + flag false
♻️ Refactor: extract calc_vol_z(), split traits vs volume fn<50
```

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead Otak T0 | opencode sini | `seith-market-intelligence`+`verification-loop` | — | approve 02 |
| T2 Anomaly | sub-agent | `seith-market-intelligence`+`tdd-workflow`+`verification-loop` | `tdd-guide` | TDD z+volume 9 kasus |
| Arsitek | sub-agent `architect` | `senior-architect` | `architect` | **SEBELUM coding 02** — audit anomaly sizing |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | `volume.rs` edge sigma 0 |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | input validation `reason` no inject |
| PM Autonomous | `seith-pm` | `git-worktree-manager`+gate | — | **veto merge jika fail — ownership §8c 7 Zones** |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca task — `fn<50` |
| Doc | `doc-updater` | `remember`+`handoff` | `doc-updater` | cek drift |

> Ownership §8c: tiap agent tanggung jawab penuh code/logic/testing/structure & rapih (§8c)

## Next Session Prompt
`skill://seith-market-intelligence` + `skill://tdd-workflow` + `handoff/04-scoring-t2-anomaly` + `02-anomaly-detector.md` + ritual 3Q: 1) gate MI mana? `flag |Z|>2` derived insight pure — tanpa ini anomaly empty. 2) jebakan? `sigma 0→0 guard + vol std 0→false + reason wajib if flag` . 3) test FAIL apa? `z 2.1→flag true`, `vol 125>2σ→true`, `sigma 0 no panic`, `reason "z=..."`.
