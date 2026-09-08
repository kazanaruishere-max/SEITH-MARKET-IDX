# Task 02 — Backtest Pipeline Design

## Goal
Desain pipeline backtest real dari `fetch_ohlcv_batch` sampai `backtest-100.json` sebagai kontrak verifiable untuk web.

## Context
- SSOT: `crates/sectors-client/src/batch.rs:chunks(20)` + `crates/seith-core/src/normalize.rs` (OHLC required→excluded, volume→0, median fallback, lookback>512→422) + `crates/seith-core/src/kronos/types.rs: PredictBatchInput` + `crates/seith-core/src/scoring/calculator.rs: 0.30*ER+0.20*(100-|Z|)+0.30*QV+0.20*SM` + `crates/seith-core/src/anomaly/traits.rs: flag |Z|>2 OR vol>2σ` + `crates/seith-core/src/ranking/service.rs: sort Mispricing desc |Z| tie-break` + `research/validation-report.md: BBCA 61 rows`
- Branch: `handoff/09-100-backtest` — Z5 docs/research + Z1 verify only
- Skill: `skill://seith-market-intelligence` + `skill://seith-kronos` + ritual 3Q

## Scope In / Out
In: Z5 `docs/research/backtest-contract.md` (new) or `docs/tdd-plan.md` update + `research/money-leak-backtest.ipynb` design spec (7 cells, no code yet) — docs-only
Out: Z1 crate logic, Z2 kronos-sidecar :8001 impl, `data/seith.db` write (03), apps/web (phase 10)

## Bagian — Surgical Breakdown
| Bag | File | Struktur | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `docs/research/backtest-contract.md` | Flow `Sectors batch chunks20×5 (Authorization /v2/daily/{symbol}/, 1 credit/200, 401|403 free) → CompositeCache L1→L2 → normalize → Kronos predict_batch 400→20 T1.0 top_p0.9 equal guard → Score 0-100 → Flag |Z|>2 → Rank` | sequential no concurrency, `excluded:[{ticker,reason}]` on OHLC missing / WAF 403 | `cargo test 145` still green |
| b | `docs/research/backtest-contract.md` | `backtest-100.json` schema | `{"as_of":"2026-09-08","universe":100,"items":[{"ticker","market","sector","close","mispricingScore","components":{...},"anomaly":{z,flag,reason},"rank"}],"metrics":{"hit_rate","drawdown","top5_forward_20d","sharpe"},"equity_curve":[{"date","return","bench"}]}` — verifiable | `jq .items | length research/backtest-100.json → 100` (future) |
| c | `research/money-leak-backtest.ipynb` spec | 7 cells design: 01 load `universe-100.json` + Sectors fetch or `bbca-ohlcv-400.json` fallback → 02 normalize + `sector-median.json` → 03 Kronos 400→20 (or `kronos-pred-20.json`) → 04 Score → 05 Rank + Top5 anomalies → 06 metrics (Sharpe/maxDD/win rate) → 07 equity vs IHSG plot | `nbconvert --execute --allow-errors` future, `KRONOS_MOCK=1` for CI, `plotly==5.*` isolated `research/pyproject.toml` | `grep plotly apps/kronos-sidecar/pyproject.toml → 0` |
| d | `docs/api-spec.md` companion | `GET /api/v1/backtest` (new) or static `research/backtest-100.json` served via `GET /api/v1/backtest?market=id` → envelope `{success,data:{items,metrics,equity_curve}, pagination, disclaimer}` | web can fetch without notebook rerun | `cargo fmt` 0 |

## Deliverables + Acceptance
- `docs/research/backtest-contract.md` with flow, schema, credit log `~200`, WAF fallback, `KRONOS_MOCK=1` note — no crate edit
- `research/money-leak-backtest.ipynb` design doc (or stub) — 7 cells spec, future execute
- `fn<50` N/A docs-only, `gitleaks 0`, `cargo fmt --check 0 + clippy --all-targets 0 + cargo test 145` no drift

## Verification
```
cargo fmt --check → 0 / cargo clippy --all-targets -- -D warnings → 0 / cargo test → 145 passed
grep plotly apps/kronos-sidecar/pyproject.toml → 0 (isolated)
jq .metrics research/backtest-100.json → hit_rate etc (future)
```

## Accountability Block — Task 02
- ✅ Terverifikasi: `cargo fmt 0 + clippy --all-targets 0 + test 145 + uv 17 + pnpm 0` no drift, backtest flow docs covers 8 gerbang + WAF fallback
- ⚠️ Belum: notebook execute + `backtest-100.json` generate — deferred to implement
- 🔻 Risiko: KRONOS_MOCK hides OOM — mitigasi manual 7 cells real Kronos proof
- ♻️ Refactor: keep schema narrow, DRY with 03

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent |
|---|---|---|---|
| Docs+Arch | `architect` | `senior-architect` + `seith-kronos` | — |

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/09-100-backtest` + task `02-backtest-pipeline.md` + ritual 3Q
