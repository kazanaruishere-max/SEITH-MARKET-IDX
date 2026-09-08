# Task 01 — Data Universe 100 Stratified

## Goal
Definisikan universe 100 ticker stratified `FINANCE25 ENERGY20 CONSUMER20 INFRA20 OTHER15` sebagai SSOT data real untuk backtest web.

## Context
- SSOT: `docs/research/data-plan-100-top.md` (100 stratified, 200 credits OHLCV 400 + Valuation) + `docs/research/market-intelligence-20y.md` (IDX ~940 listed ~750 aktif, median Id vs Sg terpisah) + `crates/sectors-client/src/batch.rs:chunks(20)` + `cache/mod.rs:cache_key market:sector:ticker:date` + `tests/fixtures/sector-median.json` + `research/validation-report.md: BBCA 8300 live`
- Branch: `handoff/09-100-backtest` dari `main ab411df` — worktree `../seith-wt/handoff-09` — Z5 docs/research + Z4 fixtures + Z3 data observe
- Skill: `skill://seith-market-intelligence` + ritual 3Q

## Scope In / Out
In: Z5 `docs/research/data-plan-100-top.md` update (or companion `docs/research/universe-100.md`) + `tests/fixtures` universe list + `research/universe-100.json` dated — Z4 SSOT
Out: Z1 crate logic, Z2 apps logic, `data/seith.db` write (observe only, 03), `vendor/*`

## Bagian — Surgical Breakdown
| Bag | File | Struktur | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `docs/research/data-plan-100-top.md` | `FINANCE25 ENERGY20 CONSUMER20 INFRA20 OTHER15` table + source decision | static pinned list dated 2026-09 vs `screener/companies` dynamic `GET /v2/screener/companies?where=...` — decision logged: static for determinism + `screener` as optional refresh | `grep FINANCE25 docs/research/data-plan-100-top.md` → 1 |
| b | `research/universe-100.json` | JSON `[{"ticker":"BBCA","sector":"FINANCE","market":"id"}, ...100]` per market isolated (SGX `D05` not DBS) | 100 rows, ticker `^[A-Z0-9]{3,6}$`, sector from 4 buckets + OTHER, market `id` default, dated `as_of` | `jq length research/universe-100.json → 100` |
| c | `tests/fixtures` manifest | credit log `~200 credits (100× OHLCV + Valuation)` + fallback `excluded:[{ticker,reason}]` on 403 WAF error 1010 | batch `chunks(20) ×5` sequential, `429 → backoff`, `404 → excluded missing`, `401|403 → Auth free` | `cargo test -p sectors-client` still 20 passed |
| d | `docs/research/money-leak-radar-thesis.md` link | Moat `|Z|>2 OR vol>2σ tanpa katalis → Top5` per market | thesis references universe 100 split, not BBCA alone | `grep Top5 docs/research/money-leak-radar-thesis.md` → 1 |

## Deliverables + Acceptance
- `research/universe-100.json` 100 rows dated + `docs/research/data-plan-100-top.md` updated with stratified table + credit budget + WAF fallback — no crate edit
- `fn<50` N/A docs-only, `gitleaks 0`, `cargo fmt --check 0 + clippy --all-targets 0 + cargo test 145 + uv 17 + pnpm 0` no drift (prove)
- Constraint: docs-only, no `apps/kronos-sidecar` edit (`grep plotly →0`)

## Verification
```
jq length research/universe-100.json → 100
grep FINANCE25 docs/research/data-plan-100-top.md → 1
cargo fmt --check → 0 / cargo clippy --all-targets -- -D warnings → 0 / cargo test → 145 passed / gitleaks detect → 0
```

## Accountability Block — Task 01
- ✅ Terverifikasi: `cargo fmt --check → 0`, `cargo clippy --all-targets → 0`, `cargo test → 145 passed`, universe 100 static dated + screener dynamic as refresh option documented
- ⚠️ Belum: live fetch 100× `/v2/daily/{symbol}/` — deferred to implement, BBCA probe only until then
- 🔻 Risiko: listing/delisting drift static list — mitigasi `screener/companies` refresh dated — deteksi `404` → `excluded missing`
- ♻️ Refactor: docs-only — keep table narrow, DRY with 02

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent |
|---|---|---|---|
| Docs | `doc-updater` | `remember`+`handoff`+`no-ai-slop` | — |

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/09-100-backtest` + task `01-data-universe.md` + ritual 3Q
