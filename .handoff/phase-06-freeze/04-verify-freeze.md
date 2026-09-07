# Task 04 — Verify Freeze Gate

## Goal
Gate `seith-phase-gate` hijau — `cargo fmt 0 clippy 0 test 143 pnpm 3 uv 34 gitleaks 0 protection 6` — paste nyata no fabrikasi.

## Context
- SSOT: `docs/tdd-plan.md §9 Checklist` + `AGENTS.md §7 DoD 10 §8 Cadence` + `skill://verification-loop` + `crates/*` + `apps/web` + `apps/{kronos,analysis}` + `scripts/freeze-check.sh` + `protection 6`

## Scope In / Out
In: Z1+Z2+Z7 verify only — `fmt/clippy/test + pnpm + uv + gitleaks + refactor-cleaner + freeze-check + protection + repo public` — no new code
Out: New logic (01-03), sidecars `:8001/:8002` live (mock only)

## Bagian — Surgical
| Bag | Cmd | Acceptance | Test FAIL |
|---|---|---|---|
| 04a | `cargo fmt --check` | 0 | `fail→FAIL` |
| 04b | `cargo clippy -- -D warnings` | 0 | `warn→FAIL` |
| 04c | `cargo test` `143` + `cargo test -p seith-cli 16` | all passed | `1 fail→FAIL` |
| 04d | `pnpm lint && pnpm typecheck && pnpm test` `apps/web` | `0 + 0 + 3` | `fail→FAIL` |
| 04e | `uv run pytest -q` `kronos 17 + analysis 17` | `17+17` | `drift→FAIL` |
| 04f | `gitleaks detect --no-git` + `grep SECTORS_API_KEY` + `freeze-check.sh` | `0 + 0 + 0` | `leak→FAIL` |
| 04g | `gh api repos/.../branches/main/protection` + `gh api repos/... --jq .private + .created_at` + `curl http://localhost:20128/v1/models →200 or degraded:true mocked` (api-spec §10 9router) | `strict:true 6 + public + 2026 + 9router 200/degraded` | `private→FAIL` |
| 04h | `refactor-cleaner fn<50 file200-400 nesting≤4` + `doc-updater drift` + `arch+security` PASS | pass | `fail→FAIL` |

## Deliverables
- Paste `04a-h` nyata — `Accountability ✅/⚠️/🔻/♻️` per task 01-04 + `seith-phase-gate` dual-review PASS

## Verification
```
cargo fmt --check → 0
cargo clippy -- -D warnings → 0
cargo test → 143 passed
pnpm lint/typecheck/test → 0 / 0 / 3
uv pytest → 17+17
gitleaks → 0
./scripts/freeze-check.sh → 0
gh api protection → strict:true 6
gh api repos --jq → private false created_at 2026-0x-xx
refactor-cleaner → fn<50 pass
```

### Accountability
```
✅ Terverifikasi: <paste 04a-h nyata>
⚠️ Belum: Submit portal
🔻 Risiko: push after freeze → mitigasi protection strict + read-only after submit
♻️ Refactor: consolidate validate_market() seith-core/market.rs
```

## Peran + Skill
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead | opencode | `verification-loop` | — | run 04a-h paste |
| PM | `seith-pm` | gate `fmt/clippy/test` | `seith-pm` | veto if 1 fail |
| Reviewer | `rust-reviewer`+`security-reviewer` | `code-reviewer`+`security-review` | — | dual-review PASS mandatory |
| Refactor | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | scan 01-03 |
| Arsitek | `architect` | `senior-architect` | `architect` | sign-off |

## Next
`skill://seith-market-intelligence` + `handoff/06-freeze` + `04-verify-freeze.md` + ritual 3Q: gate? `freeze no push`. jebakan? `secret in history`. test FAIL? `gitleaks 1`.
