# Task 04 — Verify E2E + CI Green + Docs Sync

## Goal
Kunci `cargo test -p seith-core scoring 9 + anomaly 9 + ranking 4 + cargo test --workspace 81→~99 + docs SSOT ✅ seith-phase-gate + PM audit` — Phase 04 DONE gap-free 100%.

## Context
- SSOT: `AGENTS.md §7 DoD 10 §5b Boy Scout §6c Anti Slop §8c 7 Zones` + `docs/spec.md §2[4-5] §7b` + `docs/api-spec.md §2 Workflow [4-5] §3 Ranking/Score/Anomalies §4 Schemas §6 Repository trait` + `docs/tdd-plan.md §3 critical 1+2 §4 Layers §7 Fixtures §9 Checklist` + `docs/notes/00-readme.md ritual 3Q` + `skill://seith-market-intelligence` + `skill://no-ai-slop` + `skill://seith-phase-gate` + `skill://verification-loop`

## Scope In / Out
In: Zona 1 `crates/seith-core/src/{scoring,anomaly,ranking}/*` (verify tests) + Z2 `apps/kronos-sidecar 17 + apps/analysis 17` masih pass + Z5 `docs/spec.md + api-spec.md + tdd-plan.md` sync (tambah `scoring critical 1+2` done flag) + Z6 `.handoff/phase-04-scoring/00-overview + 01-04 *.md` final polish + Z7 `.github/workflows/ci.yml` `rust` badge hijau (sudah strict, refresh check `cargo test` merged branch)
Out: Impl baru fitur — hanya `verify + docs sync + gate` — no new logic

## Bagian — Surgical Breakdown (1 bagian = 1 verify slice ≤50 baris)
| Bag | File/Step | Verify | Acceptance | Test FAIL |
|---|---|---|---|---|
| 04a | `cargo fmt + clippy` | `cargo fmt --check →0` `cargo clippy -p seith-core -p seith-api -p sectors-client -- -D warnings →0` per crate | `fmt 0 clippy 0` no `unwrap` | `clippy warn→fail CI` |
| 04b | `cargo test Rust` | `cargo test -p seith-core -- --nocapture` `scoring 9 + anomaly 9 + ranking 4 paginate` + `cargo test -- --nocapture` workspace | `≥22 Phase04 tests passed` + `workspace 81→~99` meaningful | `div 0 panic` `clamp missing` |
| 04c | `uv/ci` | `cd apps/kronos-sidecar && uv run pytest -q 17` + `cd apps/analysis && uv run pytest -q 17` unchanged | `34 passed` fast <20s | `drift H2+H3` |
| 04d | `docs sync` | `doc-updater` sync `spec §2[4-5] scoring 0-100 + anomaly flag` + `api-spec §3-4` `RankingQuery pageSize max50` + `tdd-plan §3/7` scoring critical 1+2 done | `docs diff 0` no drift `phase-03→04` H4 | `spec drift → PR checklist fail` |
| 04e | `refactor + gitleaks + no-ai-slop` | `refactor-cleaner scan §8c` `fn<50 file200-400 nesting≤4 no dead code` + `gitleaks detect --no-banner →0` + `skill://no-ai-slop detect → pass` | `scan pass` + `♻️ Refactor:` per task 01-04 | `file 500 bars → veto` `banned word delve→warn` |
| 04f | `seith-phase-gate` | dual-review `rust-reviewer ∥ security-reviewer` + `seith-phase-gate` protocol — `00-overview` DoD 10 check + PM gap audit | `gate PASS` + `PM 100% siap implementasi` | `gate FAIL → revert` |

## Deliverables + Acceptance (per Bagian)
- 04a-b: paste output nyata per command (no fabrikasi) — Acceptance: `fmt 0` `clippy 0` `cargo test 99 passed` `uv pytest 34 passed` — AGENTS §1a `Bukti > klaim`
- 04c: `34 passed unchanged` — Acceptance: `no drift H2+H3` + `scoring 0-100 not regression`
- 04d: `docs 3 files sync` — Acceptance: `spec §2[4-5] scoring 0-100 + anomaly flag` + `api-spec §3-4` `pageSize max50` + `tdd-plan §3 critical 1+2`
- 04e: `Accountability Block 01-04` per task `✅/⚠️/🔻/♻️` lengkap — Acceptance: `PM veto if missing ♻️`
- 04f: `seith-phase-gate` + `verification-loop` output paste — Acceptance: `gate PASS` sebelum PR `#NN` ke `main`
- Constraint: `file 200-400` typical (docs), `fn <50` (if script), `♻️ Refactor: <apa>` wajib per task — §8c Structure & Rapih

## Verification (paste output nyata — no fabrikasi)
```
cargo fmt --check → 0
cargo clippy -p seith-core -p seith-api -p sectors-client -- -D warnings → 0
cargo test -p seith-core -- --nocapture → scoring 9 + anomaly 9 + ranking 4 paginate
cargo test -- --nocapture → 81→~99 passed workspace (46 Phase1+2+3 +22 Phase04)
uv run pytest -q → 17+17 34 (unchanged)
gitleaks detect --no-banner --source . → 0
refactor-cleaner scan §8c → fn<50 file200-400 nesting≤4 pass
skill://no-ai-slop detect → pass (Tier-1 warn)
seith-phase-gate → PASS (rust-reviewer ∥ security-reviewer PASS)
```

### Accountability Block
```
✅ Terverifikasi: cargo fmt 0 | clippy 0 | cargo test ~99 passed | ruff 0 | pytest 34 passed | gitleaks 0 | docs sync spec§2[4-5] api-spec§3-4 tdd-plan§3
⚠️ Belum: H5 hybrid `seith-cli rank/scan/score full` (reuse trait ranking service)
🔻 Risiko: divider=0 → mitigasi: guard `if divider.abs()<EPS return 0.0` + `rank stable` + `refactor-cleaner scan`
♻️ Refactor: extract paginate_page(), split sector_filter vs rank fn<50, docs sync §7b 7 Zones
```

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead Otak T0 | opencode sini | `seith-market-intelligence`+`verification-loop` | — | final verify, approve PR |
| PM Autonomous | `seith-pm` `.opencode/agents/seith-pm/` | `git-worktree-manager`+gate `fmt/clippy/test`+`senior-pm` | `seith-pm` | **cek 100% siap implementasi + gap 0** — veto jika gate fail |
| Desainer Test | `tdd-guide` | `tdd-guide`+`tdd-workflow` | `tdd-guide` | matrix 9+9 kasus scoring anomaly |
| Reviewer Rust ∥ Security | `rust-reviewer` + `security-reviewer` | `code-reviewer`+`security-review` | `code-reviewer`+`security-reviewer` | dual-review gate |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca verify scan §8c |
| Doc | `doc-updater` | `remember`+`handoff` | `doc-updater` | sync spec/api-spec/tdd-plan |

> §8c: semua agent bertanggung jawab penuh code/logic/testing/structure & rapih (§8c) — pelanggaran = PM veto + gate FAIL

## Next Session Prompt
`skill://seith-market-intelligence` + `handoff/04-scoring` + `04-verify-e2e.md` + ritual 3Q: 1) gate MI mana? `scoring 0-100 clamp` — tanpa ini 0% derived. 2) jebakan? `z_normalize clamp + qv percentile empty 50 + sm fall 50 + div 0 + ranking stable`. 3) test FAIL apa? `cargo test -p seith-core scoring 9→anomaly 9→ranking 4`.
