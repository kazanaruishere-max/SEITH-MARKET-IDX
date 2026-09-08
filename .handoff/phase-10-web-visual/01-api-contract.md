# Task 01 — API Contract (ranking + anomalies Top5 + dossier + backtest)

## Goal
Spesifikasi kontrak API yang akan dikonsumsi web untuk hasil backtest real — envelope `success/data/error/pagination + x-schema-version`.

## Context
- SSOT: `docs/api-spec.md §1 Conventions (envelope, Auth Authorization, validator, rate limit, disclaimer, CompositeCache key market:sector:ticker:date)` + `§3 Endpoints (ranking/score/dossier/anomalies/scan) §4 Schemas §7 Sectors Mapping already patched Authorization + /v2/daily/{symbol}/` + `crates/seith-api/src/handlers.rs:215 items:[] stub + envelope.rs + bin/serve.rs:8181 + lib.rs SCHEMA_VERSION 1.0.0` + `crates/seith-api/src/envelope.rs` + `apps/web/lib/api.ts:42L fetchRanking/fetchDossier` + `apps/web/lib/api.test.ts:3 cases`
- Branch: `handoff/10-web-visual` dari `main ab411df` — worktree `../seith-wt/handoff-10` — Z2 `apps/web lib/api.ts + next.config.js + NEXT_PUBLIC_API_BASE` + Z1 verify only + Z6 handoff
- Skill: `skill://seith-market-intelligence` + `skill://no-ai-slop` Tier-1 + ritual 3Q

## Scope In / Out
In: Z2 `apps/web/lib/api.ts` zod schemas `sort/order/minZ/degraded/insufficientData` + `next.config.js rewrites /api/v1 → 8181` + `NEXT_PUBLIC_API_BASE` handling + `docs/api-spec.md §3` update (add `GET /api/v1/backtest` if new) — docs-only: no fetch impl yet, prove `cargo fmt/clippy/test` 0 drift
Out: Z1 crate handler logic edit (verify only, ranking wire deferred PR34), Z3 `data/seith.db` write (phase 09 impl), `apps/kronos-sidecar` no edit, `vendor/*`

## Bagian — Surgical Breakdown
| Bag | File | Struktur | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `docs/api-spec.md §3` | `GET /api/v1/ranking?market=id&sector&sort=mispricing|anomaly&order=desc&page&pageSize&lookback≤512` + `GET /api/v1/anomalies?market=id&sector&minZ=2.0&page&pageSize` Top5 | `data:{market,sector,items:[{ticker,mispricingScore,anomaly:{z,flag,reason}}],disclaimer}+pagination+disclaimer` + `sort=anomaly pageSize=5 minZ2.0` is Money Leak Radar Top5 | `curl /api/v1/anomalies?market=id&minZ=2.0&pageSize=5 → 200 Top5 |Z| desc` (future) |
| b | `docs/api-spec.md §3` | `GET /api/v1/tickers/:ticker/dossier?format=json\|pdf` + `GET /api/v1/backtest?market=id` (new static `research/backtest-100.json` or live) | dossier `{ticker,score,breakdown,peerComparison[3],kronos:{forecastReturn,volatility,chartPoints[]},research:{fundamentalMemo,technicalMemo,synthesizerMemo},degraded}` → `research/backtest-100.json {as_of,universe:100,items,metrics:{hit_rate,drawdown,sharpe,top5_forward_20d},equity_curve}` envelope | `curl /api/v1/backtest → 200 equity_curve` (future) |
| c | `apps/web/lib/api.ts` spec | `fetchRanking({market,sector,sort,order,page,pageSize,minZ})` + `fetchAnomalies + fetchBacktest + fetchDossier` + zod `rankingDataSchema/scoreDataSchema/dossierDataSchema/backtestDataSchema + envSchema + Pagination` | `baseUrl()=process.env.NEXT_PUBLIC_API_BASE ?? ""` + `fetchEnvelope(path,schema)` + `x-schema-version` check + `Authorization` not in client | `pnpm test lib/api.test.ts` 3→5 cases (ranking sg/dossier BBCA/disclaimer + anomalies Top5 + backtest) |
| d | `apps/web/next.config.js` spec | `rewrites: [{source:'/api/v1/:path*', destination:'http://localhost:8181/api/v1/:path*'}]` + `NEXT_PUBLIC_API_BASE=http://localhost:8181` env handling | dev `localhost:3000/api/v1/ranking → 8181` without CORS, prod `NEXT_PUBLIC_API_BASE` override | `pnpm build` no 404 without env |

## Deliverables + Acceptance
- `docs/api-spec.md §3` updated with `anomalies Top5` + `backtest` contract + `lib/api.ts` zod schemas `sort/order/minZ/degraded/insufficientData` + envelope — no crate edit
- `apps/web/lib/api.ts` contract doc + `next.config.js` rewrites doc — docs-only, no fetch impl yet
- `fn<50` N/A docs-only, `gitleaks 0`, `cargo fmt --check 0 + clippy --all-targets 0 + cargo test 145 + uv 17 + pnpm lint/typecheck 0` no drift (prove)

## Verification
```
cargo fmt --check → 0 / cargo clippy --all-targets -- -D warnings → 0 / cargo test → 145 passed / uv --project apps/analysis run pytest -q --cov → 17 passed 96%
pnpm --dir apps/web lint → 0 / pnpm --dir apps/web typecheck → 0
grep SEITH_LLM_MODEL .env.example → 1 / grep Authorization crates/sectors-client/src/client.rs → 1 / grep SECTORS_API_KEY apps/web -r → 0
# future after impl:
# curl http://localhost:8181/api/v1/anomalies?market=id&minZ=2.0&pageSize=5 → 200 Top5
# curl http://localhost:8181/api/v1/backtest?market=id → 200 {equity_curve, metrics}
gitleaks detect --no-git -v → 0 leak
```

## Accountability Block — Task 01
- ✅ Terverifikasi: `cargo fmt 0 + clippy --all-targets 0 + test 145 + uv 17 + pnpm 0` no drift, `docs/api-spec.md §7` already patched Authorization, api-spec §3 contract covers Top5 + backtest
- ⚠️ Belum: fetch impl + `next.config.js` code — deferred to phase 10 implement (handoff/10-impl)
- 🔻 Risiko: `NEXT_PUBLIC_*` leak `SECTORS_API_KEY` to client — mitigasi `NEXT_PUBLIC_API_BASE` only, server-only `SECTORS_API_KEY` via `Redacted` — deteksi `grep SECTORS_API_KEY apps/web -r → 0`
- ♻️ Refactor: docs-only — keep contract narrow, DRY with 02+03

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent |
|---|---|---|---|
| API Designer | `architect` | `senior-architect` + `no-ai-slop` | — |
| Docs | `doc-updater` | `remember`+`handoff`+`no-ai-slop` | — |

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/10-web-visual` + task `01-api-contract.md` + ritual 3Q
