# Task 04 — Freeze Gate

## Goal
`AGENTS §10` 7→9 sync + `ci.yml web` soft-fail → hard-fail + `pnpm build 4 routes` + `push 23` check — harness verifiable pre-freeze.

## Context
- SSOT: `AGENTS.md §10 Skill Proyek` (7 listed) vs `.opencode/opencode.json` (9 actual: seith-market-intelligence, seith-dev, seith-kronos, seith-data, seith-design, seith-quant, seith-ops, seith-phase-gate, verification-loop) + `.github/workflows/ci.yml` web job `|| echo pending` + `protection.json` 6 contexts strict + `git log ahead 23` unpushed
- Dependensi: 03-web-research-honest done (web lint/build honest)
- Branch: `handoff/21-zero-gap` — Z7 `.github, .opencode, AGENTS.md` Z2 `apps/web`

## Scope In / Out
In: `AGENTS.md §10` (sync 9), `.opencode/opencode.json` if needed, `.github/workflows/ci.yml` (web hard-fail), `apps/web/package.json` build scripts verify — Z7+Z2
Out: `crates/*` wiring (01), `apps/kronos-sidecar|analysis` health (02), `docs/api-spec` credit (03), live Sectors 25c (gated)

## Todo
- [ ] `todowrite in_progress` before; `completed` only after Verify hijau + `gh pr checks` green

## Bagian — Surgical Breakdown
| Bag | File | Fn/Struct | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `AGENTS.md` §10 | Skill table | list 9 skills matching `opencode.json` (seith-market-intelligence, seith-dev, seith-kronos, seith-data, seith-design, seith-quant, seith-ops, seith-phase-gate, verification-loop) + `tdd-workflow, git-worktree-manager` noted as internal; `grep -c "seith-data" AGENTS.md` ≥1 | still 7 → fail |
| b | `.github/workflows/ci.yml` | `jobs.web` | `run: pnpm --dir apps/web lint && pnpm --dir apps/web typecheck && pnpm --dir apps/web build` hard-fail (no `|| echo pending`); `pnpm install` cache correct | `echo pending` still present → fail |
| c | `apps/web` | build | `pnpm --dir apps/web build` outputs `4 routes` (/,/ranking,/backtest,/dossier/[ticker]) `next build` 0; `pnpm lint` 0 `pnpm typecheck` 0 | build !=4 routes → fail |
| d | `git` | push 23 | `git log origin/main..HEAD --oneline | wc -l` =23 documented; `git status` clean except `data/seith.db` ignored; `gh pr checks` 6 contexts `rust,audit,python-kronos,python-analysis,web,freeze` strict green before merge | `web` still pending soft → fail |

## Deliverables + Acceptance
- `grep -c "seith-data" AGENTS.md` ≥1 && `grep -c "seith-ops" AGENTS.md` ≥1 && `grep -c "verification-loop" AGENTS.md` ≥1
- `grep -c "echo pending" .github/workflows/ci.yml` =0
- `pnpm --dir apps/web build 2>&1 | grep -c "Route"` ≥4
- `gitleaks detect --no-git` 0 + `cargo fmt --check` 0 `cargo clippy -- -D warnings` 0 `cargo test -- --nocapture` 89+ green

## Verification
```
grep -n "seith-" AGENTS.md | head -20
grep -n "echo pending" .github/workflows/ci.yml || echo "hard-fail ok"
pnpm --dir apps/web lint -- --max-warnings 0
pnpm --dir apps/web typecheck
pnpm --dir apps/web build | tail -20
cargo fmt --check; cargo clippy -- -D warnings; cargo test -- --nocapture | tail -20
git status --short
```

## Peran + Skill
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T1 | sub-agent | `seith-market-intelligence` + `seith-ops` + `verification-loop` | `seith-pm` | Implement→Verify |

## Next
Phase 21 done → `seith-phase-gate` + `verification-loop` + PR `handoff/21-zero-gap → main` squash after `handoff/20` merge.
