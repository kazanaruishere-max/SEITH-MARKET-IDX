# Phase 21 — Zero-Gap Hardening — Overview

## Goal
Tutup 100% sisa gap generic → factual: API DB-real, sidecar honest, web/research honest — tanpa klaim fake.

## Context
- SSOT: `AGENTS.md §3c §6/§6c/§8c` + `docs/prd §4-5` + `docs/spec §2/§4` + `docs/api-spec §3` + `docs/tdd-plan §7` + `docs/kronos-notes` + `research/backtest-100.json` + `research/universe-100.json` + `docs/notes/00-readme ritual 3Q`
- Skill wajib: `skill://seith-market-intelligence` awal T1/T2 + `skill://no-ai-slop` + `skill://verification-loop` akhir
- Branch: `handoff/21-zero-gap` flat AGENTS §8b — docs `.handoff/phase-21-zero-gap/` — worktree `../seith-wt/handoff-21`
- Dep: Phase 20 (CLI 01-05 wired 20/25 synthetic honest 0c) → 21 (API/sidecar/web/freeze)
- Zona: Z1 `crates/seith-api, seith-core, sectors-client` Z2 `apps/kronos-sidecar, analysis, web` Z3 `data/seith.db` Z4 `tests/fixtures` Z5 `docs/research/vendor` Z6 `.handoff` Z7 `scripts,.opencode,.github`

## Scope In / Out
In: Z1 `handlers.rs, backtest_data.rs, repository.rs, envelope.rs` + `kronos/client.rs, analysis/client.rs` wiring DB; Z2 `apps/kronos-sidecar/app/main.py health is_mock_mode, apps/analysis/app/main.py+template_memo, apps/web/app/page|ranking|backtest catch+chart`; Z3 `data/seith.db` live counts; Z4 `sector-median.json` 6 sektors (done); Z5 `docs/api-spec credit 296 vs 200 reconcile`; Z7 `ci.yml web hard-fail, freeze, AGENTS §10 sync`
Out: live Sectors batch 25c fetch (gated 21.5 optional pre-freeze), Kronos 102M download (gated, stay MOCK=1 until 21.2 green), STI sg live

## WBS — Task Breakdown
| # | Task file | Slice | Dep |
|---|---|---|---|
| 01 | `01-api-wire.md` | API real DB (`backtest-100.json` pinned → `SqliteRepository` + `CompositeCache`) envelope peer5 | — |
| 02 | `02-sidecar-honest.md` | Sidecar honest: `health is_mock_mode()` + template wording sync + dossier 3 memo distinct | 01 |
| 03 | `03-web-research-honest.md` | Web/research honest: catch log + chartPoints empty honest + credit 296 reconcile + html gitignore | 02 |
| 04 | `04-freeze-gate.md` | Freeze gate: `AGENTS §10 7→9 sync` + `ci.yml web hard-fail` + `pnpm build 4 routes` + push 23 | 03 |

Live gated optional (not DoD, add when video needs 30% tech depth): `01b sectors batch 20 25c` + `Kronos warm MOCK=0`

## Todo
- `todowrite` WAJIB exactly-one `in_progress` per task, update realtime, `completed` only after Verify hijau + Accountability Block. PM veto if no trace.

## Definition of Done — Phase
1. `cargo fmt --check && cargo clippy -- -D warnings` 0 per crate
2. `cargo test -- --nocapture` green + `pnpm lint/typecheck/build 4 routes` 0
3. `refactor-cleaner` pass `fn<50 file200-400 nesting≤4` + `♻️ Refactor:` per task
4. Dual-review `seith-code-reviewer + seith-data-reviewer + seith-quant-reviewer + seith-security-reviewer` pass
5. `verification-loop` + `gitleaks 0` + `sqlite3 data/seith.db "SELECT COUNT(*) FROM ohlcv; SELECT COUNT(DISTINCT ticker) FROM fundamentals WHERE sector='FINANCE'"`
6. Docs sync `api-spec credit 296, AGENTS §10, README §4/§8`
7. Accountability `✅/⚠️/🔻/♻️` per task no fabrikasi

## Peran + Skill
| Peran | Eksekutor | Skill | Kapan |
|---|---|---|---|
| Lead T0 | opencode sini | `seith-market-intelligence` v2 + `seith-ops` | Plan+Verify |
| PM | `seith-pm` | `git-worktree-manager` | veto if gate fail |
| Code | `seith-code-reviewer` | `coding-standards` | fn<50 clippy |
| Data | `seith-data-reviewer` | `seith-data` | DB + lineage 296c |
| Quant | `seith-quant-reviewer` | `seith-quant` | 30/20/30/20 |
| Security | `seith-security-reviewer` | `security-review` | secrets server-only |
| Design | `seith-design-reviewer` | `seith-design` + `no-ai-slop` | web honest |

## Branch & Worktree
- `git worktree add ../seith-wt/handoff-21 -b handoff/21-zero-gap` — `/.wt/` ignore — file outside 7 Zones = veto (temp already 0, html ignored)
- Phase 20 worktree `handoff-20` remains for PR merge; 21 parallel file-disjoint (no overlap `handlers` vs `store/pipeline`)
- Tiap T1/T2 `skill://seith-market-intelligence` awal

## Verification
```
cargo fmt --check → 0
cargo clippy -- -D warnings → 0
cargo test -- --nocapture → 89+ green
pnpm --dir apps/web lint typecheck build → 0 4 routes
sqlite3 data/seith.db "SELECT COUNT(*) FROM ohlcv; SELECT COUNT(DISTINCT ticker) FROM fundamentals;"
curl :8181/health → X-Schema-Version 1.0.0
curl :8001/health → model mock/degraded honest
gh pr checks 6 contexts strict green
```

## Risks
- DB still synthetic honest → mitigate `ponytail MA20 pending Kronos 400→20` never claim real Sectors until 01b
- Credit blow 25c → gated 01b needs founder approval before fetch
- Health fake `Kronos-base` while `_fell_back` → fix is_mock_mode 1-line

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/21-zero-gap` + task `01-api-wire.md` + ritual 3Q
