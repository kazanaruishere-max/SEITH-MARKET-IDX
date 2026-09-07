# Phase 06 — Freeze Kit (Repo Public + Video + Gate) — Overview

## Goal
Kunci `H6 Freeze` — repo public `19 Aug–30 Sep 2026` + `cargo fmt/clippy/test 143` + `pnpm 3` + `uv 34` + `gitleaks 0` + `teaser 1m + judging 3m CLI+Web` + no push after submit — verifiable freeze.

## Context
- SSOT: `AGENTS.md §1a Piagam §4 Tier-0 §7 DoD 10 §8 Skill Matrix §8b Branch §8c Ownership` + `docs/spec.md §6 Non-Functional §7 Handoff Slice §7b Seven Zones` + `docs/prd.md` Freeze gate + `docs/api-spec.md §10 9router` + `docs/tdd-plan.md §9 Checklist` + `docs/adr/0001-0005` + `scripts/freeze-check.sh` + `.github/workflows/freeze-check.yml` + `.gitleaks.toml` + `skill://seith-market-intelligence` + `skill://verification-loop` + `skill://no-ai-slop`
- Prereq DONE: `main eafaea2` H1→H5 Hybrid `cargo fmt 0 clippy 0 test 143` `pnpm lint 0 typecheck 0 test 3` `uv 17+17` — H6 hanya gate/ops, no logic baru, no migration
- Wire existing: `crates/{seith-core,seith-api,seith-cli,sectors-client}` + `apps/{web,kronos-sidecar,analysis}` + `data/seith.db` WAL no edit — H6 verify only
- Repo: `https://github.com/kazanaruishere-max/SEITH-MARKET-IDX` public — branch `handoff/06-freeze` flat per §8b — `/.wt/` gitignore
- Zona terdampak: Z5 `docs/` + Z6 `.handoff/phase-06-freeze` + Z7 `scripts/.github/.githooks/.opencode` — Z1+Z2+Z3 verify only, no code

## Scope In / Out
In (7 Zones — luar zona = PM veto):
- Z5 `docs/{prd,spec,api-spec,tdd-plan,kronos-notes,notes/00-readme,design-spec}.md` + `README.md 7 Zones` + `docs/adr/0005-hybrid + 0006-freeze` sinkron main
- Z6 `.handoff/phase-06-freeze/00-overview.md + 01-04-*.md`
- Z7 `scripts/freeze-check.sh` + `.github/workflows/{ci,freeze-check}.yml` + `.gitleaks.toml` + `.pre-commit-config.yaml` + `.githooks/pre-commit` + `protection.json` 6 contexts `rust/audit/python-kronos/python-analysis/web/freeze strict:true enforce_admins require 1 review`
- Z7 `LICENSE AGPL-3.0` + repo public badge `19 Aug–30 Sep 2026` — verify `created_at` via API
Out: `crates/*` logic (verify only, no scoring new), `apps/kronos-sidecar+analysis` `:8001/:8002` logic (mock only), `apps/web` feature (verify only), `data/seith.db` WAL (no migration), `vendor/*` read-only ADR 0002

## WBS — Task Breakdown
| # | Task file | Slice | Depedensi |
|---|---|---|---|
| 01 | `01-docs-sync.md` | Docs SSOT + README 7 Zones + ADR 0006 | — |
| 02 | `02-security-freeze.md` | Security mandatory + gitleaks + freeze-check + protection 6 | 01 |
| 03 | `03-video-demo.md` | Teaser 1m + judging 3m CLI+Web screen record + checklist | 01 |
| 04 | `04-verify-freeze.md` | Verify freeze gate paste nyata no fabrikasi | 01-03 |

Dependensi antar-fase: `H5 DONE Hybrid (Axum 7 routes + CLI + Web) → H6 THIS Freeze (gate + video + no-push) → Submit portal → freeze no commit after submit except leaked key via #support` — cross-zona `seith-core ↛ sectors-client` tetap, `apps/* ↛ crates/*` via envelope.

## Definition of Done — Phase 06
1. `cargo fmt --check 0` + `cargo clippy -- -D warnings 0` per crate `seith-core/seith-api/seith-cli/sectors-client`
2. `cargo test 143` (core 84 + api 23 + cli 16 + sectors 20) + `pnpm lint 0 typecheck 0 test 3` + `uv 17+17` hijau — assertion meaningful, paste nyata
3. `gitleaks 0` + `grep SECTORS_API_KEY=[^ ]{10,}` 0 + `.env` not tracked + `SECTORS_API_KEY` revoked note — `security-reviewer` PASS mandatory pra-freeze
4. `architect` sign-off + `rust-reviewer ∥ security-reviewer` dual-review PASS + `seith-phase-gate` hijau
5. `scripts/freeze-check.sh` 0 + `gh api repos/.../branches/main/protection` `strict:true 6 contexts + enforce_admins + 1 review` — `protection.json` match
6. `refactor-cleaner` pass `fn<50 file200-400 nesting≤4 no dead code no unwrap` + `♻️ Refactor:` per task
7. Docs sinkron `spec §2[8] + §6 + §7b + prd + api-spec + tdd-plan + adr/0006-freeze + README 7 Zones` — `doc-updater` no drift
8. Video `teaser 1m (screen CLI ranking --json + dossier --pdf + Web /ranking + /dossier/<ticker>)` + `judging 3m (problem→audience→workflow 60s Ranking→Dossier)` checklist — `scripts/` stub or link
9. Accountability `✅/⚠️/🔻/♻️` per task + `verification-loop` paste nyata no fabrikasi — `no-ai-slop` Tier-1 warn
10. Repo public `created 19 Aug–30 Sep 2026` verified + freeze `no push after portal submit` — `/.wt/` gitignore

## Peran + Skill + Sub-agent Matrix
| Peran | Eksekutor | Skill WAJIB | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead Otak T0 | opencode sini | `seith-market-intelligence` + `verification-loop` | — | Understand→Plan→Document + verify 04 |
| Founder | User | — | — | approve freeze/submit timing |
| PM Autonomous | `seith-pm` | `git-worktree-manager`+gate `fmt/clippy/test` + `senior-pm` | `seith-pm` | orkestrasi `handoff/06-freeze` + veto if gate fail |
| Arsitek | `architect` | `senior-architect` | `architect` | **SEBELUM freeze** — sign-off struktur + 7 Zones |
| Planner | `planner` | `tdd-workflow` | `planner` | forward `H6 → Submit` checklist |
| Eksekutor T1 | sub-agent | `seith-market-intelligence`+`tdd-workflow`+`verification-loop`+`git-worktree-manager`+`no-ai-slop`+`design-taste-frontend`+`seith-phase-gate` | `explore` | 01 docs sync + 03 video |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | crate `seith-core` + `seith-api` gate — `no-ai-slop` |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | **mandatory pra-freeze** — secrets/gitleaks/validation |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca tiap task — `design-taste` untuk docs if needed |
| Doc | `doc-updater` | `remember`+`handoff`+`no-ai-slop`+`design-taste-frontend` | `doc-updater` | sinkron docs tiap merge — `adr/0006` — Tier-1 prose Z5 |
| Gate Fase | `seith-phase-gate` | `seith-phase-gate`+`verification-loop` | — | penutupan fase dual-review `rust-reviewer ∥ security-reviewer` |

## Branch & Worktree
- Branch flat `handoff/06-freeze` dari `main eafaea2` — `git worktree add ../seith-wt/handoff-06 -b handoff/06-freeze` — `/.wt/` gitignore — `handoff/05` removed
- Paralel: `1 terminal cukup` (verify only, file tidak clash) — opsi `T1 docs+video ∥ T2 security+freeze` jika butuh — `target/` shared no clash
- Tiap session wajib `skill://seith-market-intelligence` + ritual 3Q `docs/notes/00-readme.md` + `no-ai-slop` Tier-1

## Verification
```
cargo fmt --check → 0
cargo clippy -- -D warnings → 0
cargo test → 143 passed (84+23+16+20)
pnpm lint → 0 / pnpm typecheck → 0 / pnpm test → 3 passed
uv run pytest -q → 17+17 (kronos 15s + analysis 6s)
./scripts/freeze-check.sh → 0 (no secret in track)
gh api repos/.../branches/main/protection → strict:true 6 contexts enforce_admins
refactor-cleaner → fn<50 file200-400 nesting≤4 pass
```

## Risks & Mitigasi
- `secret leak SECTORS_API_KEY` → `grep + gitleaks` 0 + `.env` not tracked + rotate note + `protection` block
- `repo private or created outside 19 Aug–30 Sep` → `gh api repos/... --jq .created_at + .private` verify before submit
- `video >1m/3m or missing CLI+Web demo` → checklist `teaser 1m screen record + judging 3m problem→workflow` — stub `docs/video-checklist.md`
- `push after freeze` → `freeze-check.sh` + `protection strict:true` — submit lalu `git` read-only

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/06-freeze` + task `01-docs-sync.md` + ritual 3Q
