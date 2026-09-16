# Phase 12 — Overall 100-Ready — Overview

## Goal
Kunci overall 100% siap implement: backend real + web lengkap + governance sinkron dalam 3 commit split, lolos PM gate sebelum Freeze H6.

## Context
- SSOT: `AGENTS.md §3c Seven Zones + §7 DoD + §8d Todo + §8c Ownership` + `docs/prd.md §4 Derived §7 Journey §8 40/30/30` + `docs/spec.md §2 Pipeline 8 §4 Scoring` + `docs/api-spec.md §3 pinned live + §3b Web Contract` + `docs/tdd-plan.md §6+§9` + `docs/notes/00-readme.md` ritual 3Q
- Skill wajib: `skill://seith-market-intelligence` awal + `skill://verification-loop` akhir + `skill://seith-phase-gate` + `skill://git-worktree-manager`
- Base: `main bbdf39a` — dirty 21 modified (464+/121-) + 9 untracked (Z1 `backtest_data.rs` 162L, Z2 7 file web, Z5 `research/uv.lock` 157KB)
- Keputusan locked: fase `12-overall-100-ready`, branch baru dari `bbdf39a`, `research/uv.lock` → gitignore, 3-commit split `feat(api)+feat(web)+chore(governance)`
- Zona: Z1 backend real + Z2 web complete + Z5/Z6/Z7 governance docs — cross-zona import dilarang §3c, `9router :20128` NEVER kill

## Scope In / Out
In: Z1 `backtest_data.rs + handlers.rs + lib.rs + tests/api.rs 7 test` + Z2 `api.ts + next.config.js + 4 routes + 5 komponen + api.test.ts 6` + Z5 `api-spec §3b + tdd-plan §6` + Z6 `.handoff/phase-12/` 00-04 + Z7 `.gitignore research/uv.lock`
Out: logic scoring baru, E2E100 live Sectors batch (butuh approval kredit), Freeze H6, video 1m/3m, `vendor/` read-only, `push --force`

## WBS — Task Breakdown
| # | Task file | Slice | Depedensi |
|---|---|---|---|
| 01 | `01-backend-real.md` | Z1 wire backtest-100 real: ranking total100/FINANCE25, BBCA 61.3/rank44, peer5, minZ2, scan, pdf | — |
| 02 | `02-web-complete.md` | Z2 proxy rewrites + 4 routes + TopLeaks/BacktestChart/MetricsTable/DossierPDF + api.test 6 | 01 |
| 03 | `03-governance-docs.md` | AGENTS §8d + skills + template + api-spec §3b + gitignore uv.lock | 02 |
| 04 | `04-pm-gate-freeze.md` | PM gate 9-poin + dual-review + 3-commit plan + freeze-check | 03 |

## Todo (`todowrite` WAJIB — AGENTS §8d)
- 1 task file = 1 todo item, exactly-one `in_progress`, update realtime.
- `completed` hanya setelah Verification hijau + Accountability Block. PM veto jika tanpa jejak.

Dependensi antar-fase: `H11 bed4fe9 E2E docs → H12 overall wiring (backend→web→governance→gate) → H6 Freeze → Submit 30 Sep`. Cross-zona dilarang §3c.

## Definition of Done — Phase 12
1. `cargo fmt --check → 0` + `cargo clippy --all-targets -- -D warnings → 0` per crate
2. `cargo test → 87+ passed` (7 baru real meaningful, no assertion-less) + `pnpm lint/typecheck/test/build → 0/0/6/5-routes` + `uv --project apps/analysis run pytest -q → 17`
3. `refactor-cleaner` pass: `fn<50 file200-400 nesting≤4 no dead code` + `♻️ Refactor:` per task
4. Dual-review `rust-reviewer ∥ security-reviewer` PASS + `seith-phase-gate` + `gitleaks → 0`
5. `grep -r SECTORS_API_KEY apps/web → 0` + `grep -r plotly apps/kronos-sidecar → 0`
6. Docs sinkron + `doc-updater` no-drift + 7 Zones map benar
7. Accountability `✅/⚠️/🔻/♻️` per task + output nyata no fabrikasi + `todowrite` trace ada

## Peran + Skill + Sub-agent Matrix
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead T0 | opencode sini | `seith-market-intelligence` + `verification-loop` | — | Understand→Plan→Document, approve 00, verify delegasi |
| Founder | User | — | — | lock 12/branch-baru/gitignore-uvlock/3-split + go-live/freeze |
| PM | `seith-pm` | `git-worktree-manager` + gate fmt/clippy/test | `seith-pm` | orkestrasi handoff-12 + **veto merge jika gate/reviewer/zone fail** |
| Eksekutor T1 | sub-agent | `seith-market-intelligence` + `tdd-workflow` + `verification-loop` | `explore` | 01 backend + 02 web (file-disjoint) |
| Eksekutor T2 | sub-agent | `seith-market-intelligence` + `tdd-workflow` | `explore` | 03 governance + 04 gate (file-disjoint) |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | Z1 `backtest_data.rs` + handlers fn<50 |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | key server-only, no log secret, disclaimer always — MANDATORY |
| Refactor | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | Boy Scout §5b pasca tiap task |
| Doc | `doc-updater` | `remember`+`handoff`+`no-ai-slop` | `doc-updater` | sinkron api-spec/tdd-plan/AGENTS tiap commit |

## Branch & Worktree (AGENTS §8b + §3c)
- Branch: `handoff/12-overall-100-ready` dari `main bbdf39a` — `git worktree add ../seith-wt/handoff-12 -b handoff/12-overall-100-ready bbdf39a` — DONE
- Worktree `../seith-wt/handoff-12` — Z1+Z2+Z5+Z6+Z7 — T1 01+02 vs T2 03+04 paralel file-disjoint aman
- Tiap session wajib `skill://seith-market-intelligence` + ritual 3Q + `todowrite` exactly-one `in_progress`
- Commit split: `feat(api)` → `feat(web)` → `chore(governance)` → squash-merge `main` → hapus worktree/branch lama 09/10/11

## Verification (paste output nyata)
```
cargo fmt --check → 0
cargo clippy --all-targets -- -D warnings → 0
cargo test → 87+ passed
pnpm --dir apps/web lint → 0 / typecheck → 0 / test → 6 passed / build → 5 routes
uv --project apps/analysis run pytest -q → 17 passed
grep -r SECTORS_API_KEY apps/web → 0
grep -r plotly apps/kronos-sidecar → 0
gitleaks detect --no-git -v → 0
```

## Risks & Mitigasi
- Dirty main 21 files vs worktree bersih — mitigasi cherry-pick surgical per zona, deteksi `git diff --stat` per commit
- `research/uv.lock` 157KB noise — mitigasi gitignore + hapus lokal, deteksi `git status --short research/ → bersih`
- Serve `:8181`/web `:3000` lock `target/debug` — mitigasi stop via PID port spesifik, deteksi `Get-NetTCPConnection -LocalPort 8181`
- `9router :20128` ikut mati jika blanket kill node — mitigasi TIDAK PERNAH kill, deteksi `Invoke-WebRequest :20128/v1/models → 200`

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/12-overall-100-ready` + task `01-backend-real.md` → `02` → `03` → `04` + ritual 3Q + `verification-loop` + `seith-pm` gate MANDATORY
