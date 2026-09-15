# Task 04 — PM Gate + Freeze (GATE)

## Goal
Lolos PM gate 9-poin + dual-review, eksekusi 3-commit split, siap Freeze H6.

## Context
- SSOT: `AGENTS.md §7 DoD §8 PM veto` + `.opencode/agents/seith-pm/AGENT.md` DoD + `.handoff/README.md` lifecycle
- Skill: `seith-phase-gate` + `verification-loop` + `git-worktree-manager`
- Gate MANDATORY sebelum merge `main` — PM veto jika 1 poin fail

## Scope In / Out
In: 9-poin check + `rust-reviewer ∥ security-reviewer` + 3 commit (`feat(api)`, `feat(web)`, `chore(governance)`) + worktree cleanup 09/10/11.
Out: implement kode baru, push tanpa approval, `push --force`.

## Bagian — Surgical
| Bag | Gate | Command | Pass |
|---|---|---|---|
| a | fmt | `cargo fmt --check` | 0 |
| b | clippy | `cargo clippy --all-targets -- -D warnings` | 0 |
| c | cargo test | `cargo test` | 87+ pass |
| d | web | `pnpm lint/typecheck/test/build` | 0/0/6/5-routes |
| e | sidecar | `uv --project apps/analysis run pytest -q` | 17 pass |
| f | dual-review | `rust-reviewer ∥ security-reviewer` | PASS |
| g | leak scan | `gitleaks` + `grep SECTORS apps/web → 0` + `grep plotly kronos-sidecar → 0` | 0/0/0 |
| h | docs+todo | `doc-updater` no-drift + `todowrite` trace ada | PASS |
| i | 3-commit | `feat(api)` → `feat(web)` → `chore(governance)` | split bersih |

## Deliverables + Acceptance
- Komentar PM: `PM gate: PASS — <cmd> → <output> — veto? N`
- 3 commit terpisah per zona, revert aman per zona
- `git worktree list` hanya `main + handoff-12`, branch 09/10/11 dihapus pasca-merge
- `scripts/freeze-check.sh` siap jalan menuju H6

## Verification + Accountability
```
cargo fmt --check → 0
cargo clippy --all-targets -- -D warnings → 0
cargo test → 87+ passed
pnpm --dir apps/web lint → 0 / typecheck → 0 / test → 6 / build → 5 routes
uv --project apps/analysis run pytest -q → 17 passed
gitleaks detect --no-git -v → 0
```
- ✅ Terverifikasi: <cmd> → <output>
- ⚠️ Belum: <apa>
- 🔻 Risiko: <1-2> — deteksi: <cara>
- ♻️ Refactor: <apa>

## Peran
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| PM | `seith-pm` | `git-worktree-manager` + gate | `seith-pm` | gate 04, veto jika fail |
| Lead T0 | opencode sini | `seith-phase-gate` + `verification-loop` | — | squash-merge main |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | Z1 sign-off |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | MANDATORY pra-freeze |
| Founder | User | — | — | approve push + freeze |

## Next Session Prompt
`skill://seith-market-intelligence` + `handoff/12` + `04-pm-gate-freeze.md` + ritual 3Q → Freeze H6 → Submit 30 Sep
