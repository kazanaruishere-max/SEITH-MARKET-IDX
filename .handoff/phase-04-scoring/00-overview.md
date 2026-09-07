# Phase 04 — Scoring 0-100 + Ranking + Anomaly Flag — Overview

## Goal
Kunci pipeline `[4-5] Scoring 0-100 (30% ER + 20% (100-|Z|) + 30% QV + 20% SectorMom) + Ranking + Flag |Z|>2 atau volume spike >2σ` explainable — jantung lolos MI Track 3 (derived insight gate #4).

## Context
- SSOT: `AGENTS.md §2-6c §3c Seven Zones §4 Tier-0 §7 DoD 10 §8 Skill Matrix §8b Branch §8c Ownership` + `docs/spec.md §2[4-5] §4 Scoring 0-100` + `docs/api-spec.md §2 Workflow [4-5] §3 Ranking/Score/Anomalies §4 Schemas §6 Repository trait Cache Is Scoring` + `docs/tdd-plan.md §3 critical 1) scoring-engine + 2) anomaly-detector §4 Layers Unit/Integration §7 Fixtures` + `docs/notes/00-readme.md ritual 3Q` + `docs/adr/0001 stack + 0002 wire + 0004 agents-lite` + `skill://seith-market-intelligence` + `skill://no-ai-slop`
- Skill wajib tiap session T1/T2: `skill://seith-market-intelligence` (awal) + `skill://tdd-workflow` + `skill://verification-loop` (akhir) + `skill://no-ai-slop` Tier-1 warn
- Branch: `handoff/04-scoring` (flat, AGENTS §8b) — docs: `.handoff/phase-04-scoring/` (1 fase = 1 folder, 4 tasks + overview). Template: `.handoff/phase-template/00-overview.md` mirror H2+H3
- Phase 1 DONE `main 9bb0e48` + Phase 2 DONE `main bad4808` (Kronos :8001 + bridge `seith-core/src/kronos/*` guard 512 degraded) + Phase 3 DONE `main 5a323de` (Analysis :8002 + bridge `seith-core/src/analysis/*` 3-agent Lite 01+02 → 81 passed)
- Fixtures ready: `tests/fixtures/bbca-ohlcv-400.json + dbs-sg-ohlcv-400.json + illiquid-ohlcv.json + sector-median.json + kronos-pred-20.json + 9router-success/failure.json`
- Existing debt: `crates/seith-core/src/scoring.rs:1 placeholder()` — H4 THIS ganti total

## Scope In / Out
In (7 Zones — file baru di luar zona = violation PM veto):
- Z1 `crates/seith-core/src/scoring/{mod.rs,components.rs,calculator.rs}` + `crates/seith-core/src/anomaly/{mod.rs,traits.rs,volume.rs}` + `crates/seith-core/src/ranking/{mod.rs,service.rs}` + `crates/seith-core/src/lib.rs` export + Z1 `crates/seith-api/src/ranking.rs` wiring + `crates/seith-cli/src/commands/ranking.rs` stub (optional thin)
- Z4 `tests/fixtures/scoring-examples.json` (preset 7 contoh score clamped breakdown)
- Z5 `docs/spec.md §2[4-5] + api-spec.md §3-4 + tdd-plan.md §3/7` sinkron — Z5 SSOT
- Z6 `.handoff/phase-04-scoring/00-overview.md + 01-04-*.md`
- Z7 CI `rust` badge hijau (sudah strict, no new job)
Out: `apps/*` `:8001/:8002/:3000` (H2+H3 done — не входят, no edit), `apps/web` (H5 zona 2 Next.js), `dossier` PDF JSON→PDF (H5), `seith-cli rank/scan/score full` (H5 reuse trait), freeze kit (H6 zona 7), Scoring H5 polish.

## WBS — Task Breakdown (1 task = 1 file, surgical <50 baris/fn)
| # | Task file | Slice | Deliverable inti | Dependensi |
|---|---|---|---|---|
| 01 | `01-scoring-engine.md` | Scoring 0-100 components | `seith-core/src/scoring/{mod,components,calculator}.rs` `compute(er, anomaly_z, qv, sm) -> {score, components}` `clamp0-100` + `z_normalize(er) serde deny_unknown_fields` | — |
| 02 | `02-anomaly-detector.md` | Anomaly flag + volume | `seith-core/src/anomaly/{mod,traits,volume}.rs` `trait Anomaly {flag(|Z|>2, volume>2σ, reason), z=(actual-forecast)/σ}` deterministik fallback `degraded:false` no LLM | 01 (qv+z dependencies, mirror H3) |
| 03 | `03-ranking-repository.md` | Ranking + cache | `seith-core/src/ranking/{mod,service}.rs + seith-api/src/ranking.rs` `rank(vec<Score>) sort desc + by Sector` paginate `page/pageSize max50` + `ScoreRepository trait` reuse core | 01+02 |
| 04 | `04-verify-e2e.md` | Verify CI green | `cargo test -p seith-core scoring 9 + anomaly 9 + ranking paginate` + `cargo test --workspace 81→99` + docs SSOT + `seith-phase-gate` dual-review + PM audit | 01-03 |

Dependensi antar-fase: **H1 DONE (Sectors cleanse) → H2 DONE (Kronos ER) → H3 DONE (Analysis memo) → H4 THIS Scoring 0-100 (butuh ER Z QV SM) → H5 Hybrid dossier/ranking (butuh semua) → H6 Freeze**.

## Definition of Done — Phase 04
1. `cargo fmt --check` bersih per crate + `cargo clippy -- -D warnings` 0
2. `cargo test -p seith-core -- --nocapture` `≥9 scoring` + `≥9 anomaly` + `≥4 ranking` paginate, clamp, percentile, per-market, `fundamentalMemo` memo-less anomaly still flag, `cargo test --workspace` `81→~99`
3. `cargo test --workspace 81→~99` semua pass (no `divider=0` panic, clamp0-100 calc edge)
4. `uv run pytest -q` `apps/kronos-sidecar 17 + apps/analysis 17` masih pass (no drift H2+H3)
5. `fn<50 file200-400 ` `nesting≤4 no dead code immutable` + **7 Zones §3c** — `refactor-cleaner` pass + `♻️ Refactor:` per task
6. Dual-review `rust-reviewer + security-reviewer` pass
7. `seith-phase-gate + verification-loop` pass (paste nyata, no fabrikasi) + `gitleaks 0` + `no-ai-slop Tier-1 warn`
8. Docs sinkron `spec §2[4-5] + api-spec §3-4 + tdd-plan §3/7 + AGENTS §3c` — `doc-updater` cek drift
9. Accountability Block `✅/⚠️/🔻/♻️` per task + **semua AI agent §8c code/logic/testing/structure & rapih** — PM veto jika tidak rapih
10. File baru WAJIB di zona benar (1-7) — cross-zona import liar = violation

## Peran + Skill + Sub-agent Matrix (Wajib — AGENTS §8)
| Peran | Eksekutor | Skill WAJIB | Sub-agent | Kapan — Phase 04 |
|---|---|---|---|---|
| **Lead Otak T0** | opencode sini | `seith-market-intelligence` + `verification-loop` | — | Understand→Plan→Document, tulis/approve `00-overview.md`, verify delegasi |
| Founder | User | — | — | approve weights 30/20/30/20 fix, go-live/freeze |
| **PM Autonomous** | `seith-pm` `.opencode/agents/seith-pm/` | `git-worktree-manager` + gate `fmt/clippy/test` + `senior-pm` | `seith-pm` | orkestrasi `handoff/04-scoring` + worktree, **veto merge jika gate/reviewer/zone fail** |
| **Arsitek reviewer** | sub-agent `architect` | `senior-architect` | `architect` | **SEBELUM coding 01+02** — audit scoring sizing + ranking boundary + 7 Zones |
| **Planner** | sub-agent `planner` | `tdd-workflow` | `planner` | forward-test H5 dossier dependency `components breakdown` |
| **Eksekutor T1/T2** | sub-agent | `seith-market-intelligence` (awal wajib) + `tdd-workflow` + `verification-loop` | `explore` jika debug luas | T1 scoring 01 ∥ T2 anomaly 02 (file beda, no clash) → 03 ranking |
| **Desainer Test** | `tdd-guide` | `tdd-guide` + `tdd-workflow` | `tdd-guide` | matrix 9+9 kasus: clamp Z percentile flag insufficient_data |
| **Reviewer Rust** | `rust-reviewer` | `code-reviewer` | `code-reviewer` + `rust-reviewer` | crate `seith-core/{scoring,anomaly,ranking}` |
| **Reviewer Security** | `security-reviewer` | `security-review` | `security-reviewer` | input validation `score 0-100` breakdown ~ no secret log |
| **Refactor WAJIB** | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | **pasca tiap task 01-04** Boy Scout §5b — gate wajib |
| **Doc + Handoff** | `doc-updater` | `remember` + `handoff` | `doc-updater` | sinkron `spec/api-spec/tdd-plan` tiap merge |

## Branch & Worktree (AGENTS §8b + §3c + §8c)
- Branch flat: `handoff/04-scoring` (dari `main`) — `git worktree add ../seith-wt/handoff-04 -b handoff/04-scoring` — `/.wt/` gitignore
- Paralel T1/T2 (file beda, 7 Zones terpisah, tidak tabrak `target/`):
  - `T1 Scoring 01+03left` (Z1 `seith-core/src/scoring/*`) → `handoff/04-scoring-t1-scoring`
  - `T2 Anomaly 02+03right` (Z1 `seith-core/src/anomaly/*`) → `handoff/04-scoring-t2-anomaly`
  - Lifecycle: `git worktree add ../seith-wt/handoff-04-t1 -b handoff/04-scoring-t1-scoring` → TDD red-green → `cargo fmt --check && cargo clippy -- -D warnings && cargo test` → `refactor-cleaner` §8c → dual-review → PR ke parent → code-reviewer → squash-merge → PR ke `main` → `seith-phase-gate` → Lead merge → hapus
- Tiap session T1/T2 wajib `skill://seith-market-intelligence` di awal + baca `docs/notes/00-readme.md` ritual 3Q + **semua AI agent bertanggung jawab penuh** (§8c)

## Verification — Phase 04 (paste output nyata, no fabrikasi)
```
cargo fmt --check → 0
cargo clippy -p seith-core -- -D warnings → 0
cargo test -p seith-core -- --nocapture → scoring 9 + anomaly 9 + ranking 4 paginate
cargo test --workspace → 81→~99 passed
uv run pytest -q --cov → 17+17 34 (unchanged)
gitleaks 0
refactor-cleaner fn<50 file200-400 nesting≤4 pass
cargo check → 0
```

## Risks & Mitigasi — Scoring
| Risiko | Akibat | Mitigasi | Deteksi |
|---|---|---|---|
| `divider=0` calc panic `z/(excess)` | DoD 2→99 crash clamp | guard `if divider.abs()<EPS return 0.0` | test `all sigma 0` → `score fin` |
| percentile per-market Vs per-sector | Score noise lookback, wrong peer | `percentile per market (Id vs Sg terpisah)` | test `QV Id vs Sg different median` |
| insufficient_data flag miss T1/T2 | Deemed always sufficient, Track 3 fail | deterministic fallback numeric + flag `insufficient_data:true` | test `insufficient_data_flag_on_fallback` |
| write scope `anomaly` ke `file500` | file size PR veto | audit T3 diff `file 200-400 max500` check | `git diff --stat` audit |

## Next Session Prompt
`skill://seith-market-intelligence` + `skill://tdd-workflow` + `handoff/04-scoring` + task `01-scoring-engine.md` + ritual 3Q: 1) gate MI mana? `components breakdown` wajib di dossier H5 — tanpa ini 40% usability kosong. 2) jebakan? `z_normalize(er) clamp` + `qv percentile per market` + `sm median sector` + `|Z|>2` . 3) test FAIL apa? `score clamp0-100`, `З percentile`, `volume spike >2σ`, `insufficient_data flag`.
