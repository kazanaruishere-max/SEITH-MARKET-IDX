# Task 04 — Verify E2E + Contract + CI Green

## Goal
Gate `seith-phase-gate` hijau — `cargo test --workspace` + `cargo test -p seith-api -p seith-cli` + `pnpm lint/typecheck/test` + `uv pytest 17+17` + contract `CLI --json ≡ REST envelope` + docs SSOT sinkron.

## Context
- SSOT: `docs/tdd-plan.md §3 paths 6-7 §4 Layers §5 Tooling §9 Checklist` + `docs/api-spec.md §3-10` + `AGENTS.md §7 DoD 10 §8c` + `skill://verification-loop` + `crates/seith-api/tests/api.rs 6` + `crates/seith-cli tests 4` + `apps/web vitest 3`

## Scope In / Out
In: Z1+Z2+Z7 verify only — `cargo fmt/clippy/test` + `pnpm lint/typecheck/test` + `gitleaks` + `refactor-cleaner` + `doc-updater` drift check + `seith-phase-gate` dual-review — no new code
Out: New feature code (01-03), sidecar logic `:8001/:8002` (mock only)

## Bagian — Surgical
| Bag | Cmd | Acceptance | Test FAIL |
|---|---|---|---|
| 04a | `cargo fmt --check` per crate `seith-api,seith-cli,seith-core` | 0 | `fmt fail→FAIL` |
| 04b | `cargo clippy -- -D warnings -p seith-api -p seith-cli -p seith-core` | 0 | `clippy warn→FAIL` |
| 04c | `cargo test -- --nocapture` workspace `81→99+` (5 envelope + 6 api + 4 cli + 6 ranking 04) | all passed | `1 fail→FAIL` |
| 04d | `pnpm lint && pnpm typecheck && pnpm test` in `apps/web` | 0 + 3 passed | `lint fail→FAIL` |
| 04e | `uv run pytest -q` in `apps/kronos-sidecar` + `apps/analysis` | 17+17 unchanged | `drift→FAIL` |
| 04f | Contract `cargo run -p seith-cli -- ranking --market sg --json` vs `curl /api/v1/ranking?market=sg` + `tests/fixtures/ranking-snapshot.json` (Z4) envelope `success/data/pagination/disclaimer/x-schema-version` identik — mockito | identik | `drift→FAIL` |
| 04g | `gitleaks detect --no-git` + `refactor-cleaner fn<50 file200-400 nesting≤4` + `doc-updater` `spec/api-spec/tdd-plan/README 7 Zones` sinkron | 0 + pass | `leak→FAIL` |

## Deliverables
- Paste output nyata 04a-g — no fabrikasi — `Accountability Block ✅/⚠️/🔻/♻️` per task 01-04 complete
- `seith-phase-gate` `rust-reviewer ∥ security-reviewer` PASS comment on PR

## Verification
```
cargo fmt --check → 0
cargo clippy -- -D warnings → 0
cargo test -- --nocapture → 99+ passed
cargo test -p seith-cli → 4 passed
pnpm lint/typecheck/test → 0 / 0 / 3 passed
uv run pytest -q → 17+17
gitleaks → 0 leaks
refactor-cleaner → fn<50 file200-400 nesting≤4 pass
```

### Accountability Block
```
✅ Terverifikasi: <paste 04a-g output nyata>
⚠️ Belum: H6 Freeze
🔻 Risiko: 9router down → degraded:true tetap lolos MI — deteksi mock failure fixture
♻️ Refactor: consolidate validate_market() seith-core/market.rs shared
```

## Peran + Skill
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead | opencode | `verification-loop` | — | run 04a-g paste |
| PM | `seith-pm` | gate `fmt/clippy/test` | `seith-pm` | veto if 1 fail |
| Reviewer | `rust-reviewer`+`security-reviewer` | `code-reviewer`+`security-review` | — | dual-review PASS |
| Refactor | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | scan 01-03 |

## Next
`skill://seith-market-intelligence` + `handoff/05-hybrid` + `04-verify-e2e.md` + ritual 3Q: gate MI mana? `Hybrid envelope derived only`. jebakan? `CLI/REST drift + market 422 + pageSize max50`. test FAIL? `envelope drift, market xx 422, 51 tickers 422`.
