# Phase NN — Topic — Overview

## Goal
One-sentence win objective — derived insight gate MI mana yang dikunci fase ini.

## Context
- SSOT: `AGENTS.md §3c Seven Zones + §6/§6c/§8c` + `docs/prd.md §` + `docs/spec.md §` + `docs/api-spec.md §` + `docs/tdd-plan.md §` + `docs/kronos-notes.md` (jika Kronos) + `docs/notes/00-readme.md` ritual 3Q
- Skill wajib: `skill://seith-market-intelligence` di awal session T1/T2 + `skill://no-ai-slop` Tier-1 + `skill://verification-loop` di akhir
- Branch: `handoff/NN-topic` (flat, AGENTS §8b) — docs: `.handoff/phase-NN-topic/` — 7 Zones §3c
- Zona terdampak: sebut zona 1-7 mana yang disentuh fase ini (crates/apps/data/tests/docs/.handoff/scripts)

## Scope In / Out
In: ... (crate/file per zona yang disentuh, eksplisit per zona 1-7)
Out: ... (defer ke fase berikutnya, eksplisit)

## WBS — Task Breakdown
| # | Task file | Slice | Depedensi |
|---|---|---|---|
| 01 | `01-*.md` | ... | — |
| 02 | `02-*.md` | ... | 01 |
| ... | ... | ... | ... |

Dependensi antar-fase: H1 → H2 (Kronos) → H4 (Scoring) → H5 (Hybrid Delivery) — jelaskan. Cross-zona import dilarang (§3c).

## Definition of Done — Phase
Fase done HANYA jika semua hijau (AGENTS §7 + §5b + §6c + §8c):
1. `cargo fmt --check && cargo clippy -- -D warnings` bersih per crate
2. `cargo test -- --nocapture` (+ `uv run pytest -q` / `pnpm test` jika sentuh sidecar/FE) — assertion meaningful, no assertion-less
3. `refactor-cleaner` scan pass: `fn <50`, `file 200-400`, `nesting ≤4`, `no dead code` + `♻️ Refactor:` per task — §8c Structure & Rapih
4. Dual-review `rust-reviewer ∥ security-reviewer` pass + `seith-phase-gate`
5. `verification-loop` pass (paste output nyata, no fabrikasi) + `gitleaks` no leak
6. Docs sinkron (`prd/spec/api-spec/tdd-plan/adr/README`) — `doc-updater` cek drift — 7 Zones map
7. Accountability Block per task: `✅ Terverifikasi: <cmd> → <output> / ⚠️ Belum / 🔻 Risiko / ♻️ Refactor:` — §8c

## Peran + Skill + Sub-agent Matrix (Wajib — AGENTS §8 + §8c)
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead Otak T0 | opencode sini | `seith-market-intelligence` + `seith-dev` | — | Understand→Plan→Document, approve overview, verify delegasi (§8c) |
| Founder | User | — | — | keputusan strategis threshold/go-live |
| PM Autonomous | `seith-pm` | `git-worktree-manager` + gate `fmt/clippy/test` | — | orkestrasi worktree/branch, **veto merge jika gate/reviewer/zone fail** |
| Arsitek | `architect` | `senior-architect` | `architect` | SEBELUM coding — audit struktur + 7 Zones (§3c) |
| Planner | `planner` | `tdd-workflow` | `planner` | forward-test dependency fase berikutnya |
| Eksekutor T1/T2 | sub-agent | `seith-market-intelligence` + `tdd-workflow` + `verification-loop` | `explore` jika debug luas | Implement→Verify→Refactor TDD red-green — **wajib terstruktur & rapih §8c** |
| Desainer Test | `tdd-guide` | `tdd-guide` | `tdd-guide` | matrix fixtures + boundary tests |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` + `rust-reviewer` | tiap crate baru |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | key/validation/rate limit — mandatory pra-freeze |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca tiap task Boy Scout §5b — gate wajib |
| Doc | `doc-updater` | `remember`+`handoff` | `doc-updater` | sinkron docs tiap merge — 7 Zones |

## Branch & Worktree (AGENTS §8b + §3c)
- Branch: `handoff/NN-topic` — `git worktree add ../seith-wt/handoff-NN -b handoff/NN-topic` — `/.wt/` gitignore (§8b)
- Paralel opsional: `handoff/NN/topic/t1-*` vs `t2-*` (file beda, 7 Zones terpisah) → PR ke parent → squash-merge ke `main` → hapus worktree
- Tiap session T1/T2 wajib `skill://seith-market-intelligence` di awal — semua AI agent bertanggung jawab penuh atas `code/logic/testing/structure & rapih` (§8c)
- File baru WAJIB di zona benar (1-7) — PM veto jika di luar zona

## Verification (paste output nyata — §8c)
```
cargo fmt --check → 
cargo clippy -- -D warnings → 
cargo test -- --nocapture → 
uv run pytest -q (jika sidecar) → 
pnpm lint/typecheck (jika FE) → 
sqlite3 data/seith.db ... (jika cache) → 
refactor-cleaner scan → fn<50 file200-400 nesting≤4 pass
```
+ Accountability Block `✅/⚠️/🔻/♻️` per task — no fabrikasi

## Risks & Mitigasi
- Risiko 1 — mitigasi + deteksi cara
- Risiko 2 — ...

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/NN-topic` + task `NN-*.md` + ritual 3Q
