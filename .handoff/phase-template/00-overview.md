# Phase NN — Topic — Overview

## Goal
One-sentence win objective — derived insight gate MI mana yang dikunci fase ini.

## Context
- SSOT: `AGENTS.md §X` + `docs/prd.md §` + `docs/spec.md §` + `docs/api-spec.md §` + `docs/tdd-plan.md §` + `docs/kronos-notes.md` (jika Kronos) + `docs/notes/00-readme.md` ritual 3Q
- Skill wajib: `skill://seith-market-intelligence` di awal session T1/T2
- Branch: `handoff/NN-topic` (flat, AGENTS §8b) — docs: `.handoff/phase-NN-topic/`

## Scope In / Out
In: ... (crate/file yang disentuh fase ini)
Out: ... (defer ke fase berikutnya, eksplisit)

## WBS — Task Breakdown
| # | Task file | Slice | Depedensi |
|---|---|---|---|
| 01 | `01-*.md` | ... | — |
| 02 | `02-*.md` | ... | 01 |
| ... | ... | ... | ... |

Dependensi antar-fase: H1 → H2 (Kronos) → H4 (Scoring) → H5 (Hybrid Delivery) — jelaskan.

## Definition of Done — Phase
Fase done HANYA jika semua hijau (AGENTS §7):
1. `cargo fmt --check && cargo clippy -- -D warnings` bersih per crate
2. `cargo test -- --nocapture` (+ `uv run pytest -q` / `pnpm test` jika sentuh sidecar/FE) — assertion meaningful, no assertion-less
3. `refactor-cleaner` scan pass: `fn <50`, `file 200-400`, `nesting ≤4`, `no dead code` + `♻️ Refactor:` per task
4. Dual-review `rust-reviewer ∥ security-reviewer` pass + `seith-phase-gate`
5. `verification-loop` pass (paste output nyata, no fabrikasi)
6. Docs sinkron (`prd/spec/api-spec/tdd-plan/adr/README`) — `doc-updater` cek drift
7. Accountability Block per task: `✅ Terverifikasi: <cmd> → <output> / ⚠️ Belum / 🔻 Risiko`

## Peran + Skill + Sub-agent Matrix (Wajib)
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead Otak T0 | opencode sini | `seith-market-intelligence` + `seith-dev` | — | Understand→Plan→Document, approve overview |
| Founder | User | — | — | keputusan strategis threshold/go-live |
| PM Autonomous | `seith-pm` | `git-worktree-manager` + gate `fmt/clippy/test` | — | orkestrasi worktree/branch, **veto merge jika fail** |
| Arsitek | `architect` | `senior-architect` | `architect` | SEBELUM coding — audit struktur fase |
| Planner | `planner` | `tdd-workflow` | `planner` | forward-test dependency fase berikutnya |
| Eksekutor T1/T2 | sub-agent | `seith-market-intelligence` + `tdd-workflow` + `verification-loop` | `explore` jika debug luas | Implement→Verify→Refactor TDD red-green |
| Desainer Test | `tdd-guide` | `tdd-guide` | `tdd-guide` | matrix fixtures + boundary tests |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` + `rust-reviewer` | tiap crate baru |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | key/validation/rate limit — mandatory pra-freeze |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca tiap task Boy Scout §5b — gate wajib |
| Doc | `doc-updater` | `remember`+`handoff` | `doc-updater` | sinkron docs tiap merge |

## Branch & Worktree (AGENTS §8b)
- Branch: `handoff/NN-topic` — `git worktree add ../seith-wt/handoff-NN -b handoff/NN-topic`
- Paralel opsional: `handoff/NN/topic/t1-*` vs `t2-*` (file beda) → PR ke parent → squash-merge ke `main` → hapus worktree
- Tiap session T1/T2 wajib `skill://seith-market-intelligence` di awal

## Verification (paste output nyata)
```
cargo fmt --check → 
cargo clippy -- -D warnings → 
cargo test -- --nocapture → 
uv run pytest -q (jika sidecar) → 
pnpm lint/typecheck (jika FE) → 
sqlite3 data/seith.db ... (jika cache) → 
```

## Risks & Mitigasi
- Risiko 1 — mitigasi + deteksi cara
- Risiko 2 — ...

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/NN-topic` + task `NN-*.md` + ritual 3Q
