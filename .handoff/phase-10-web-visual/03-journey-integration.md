# Task 03 — Journey Integration (page hero → ranking → dossier → backtest → PDF)

## Goal
Spesifikasi integrasi journey web `page hero TopLeaks → ranking 60s → dossier deep dive → backtest → PDF` sebagai 40% usability.

## Context
- SSOT: `apps/web/app/page.tsx` (hero static `Ranking →`), `app/ranking/page.tsx` (RSC fetchRanking SSOT, `market=id` default), `app/dossier/[ticker]/page.tsx` (RSC fetchDossier + `Download PDF → /dossier?format=pdf`), `app/layout.tsx` (`bg-[#0B0E14]` + disclaimer `Bukan rekomendasi`), `lib/api.ts:42L` + `envelope.rs` + `docs/prd.md §7 Journey 60s→dossier→PDF §8 Judging 40/30/30` + `docs/spec.md §2 Pipeline 8 gerbang` + `phase-09 00-03` (backtest-100.json contract) + `phase-10 01 api-contract + 02 visual-spec`
- Branch: `handoff/10-web-visual` — Z2 `apps/web` journey + Z6 handoff — docs-only
- Skill: `skill://seith-market-intelligence` + `skill://no-ai-slop` Tier-1 + ritual 3Q

## Scope In / Out
In: Z2 `apps/web/app/page.tsx hero TopLeaks Top5 + app/ranking/page.tsx 60s sortable (Mispricing desc |Z| tie-break, Anomaly desc) + app/dossier/[ticker]/page.tsx (score gauge 0-100 + stacked 30/20/30/20 + peer3 + kronos chartPoints Line + research 3 tabs) + app/backtest/page.tsx (new backtest equity vs IHSG + metrics) + lib/api.ts fetchRanking/fetchAnomalies/fetchBacktest/fetchDossier` + `@react-pdf/renderer` 1-page PDF — docs-only: no code
Out: Z1 crate logic, Z3 `data/seith.db` write (phase 09), `apps/kronos-sidecar` no edit, `vendor/*`

## Bagian — Surgical Breakdown
| Bag | File | Struktur | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `apps/web/app/page.tsx` | hero `TopLeaks` Top5 `sort=anomaly pageSize=5 minZ2.0` + CTA `Lihat Ranking →` + `api/v1/health` link | `fetchAnomalies({market:id,minZ:2.0,pageSize:5,sort:"anomaly"})` RSC `cache:no-store` + error box red + `disclaimer` | `pnpm test` TopLeaks hero |
| b | `apps/web/app/ranking/page.tsx` | RSC `fetchRanking({market,sector,sort,order,page,pageSize})` sortable `mispricingScore desc` / `anomalyZ desc`, `RankingTable` + `ScoreBadge stacked` + `insufficient_data` icon + pagination `page/pageSize/total` | `searchParams market=id default, sector filter, sort toggle` | `pnpm lint 0 + typecheck 0` |
| c | `apps/web/app/dossier/[ticker]/page.tsx` | RSC `fetchDossier(ticker,market,"json")` + upper+strip `.JK` → score gauge 0-100 + `breakdown stacked` + `peerComparison[3] per market` + `BacktestChart kronos.chartPoints` + `research fundamental/technical/synthesizer tabs` + `degraded` banner + `disclaimer` + `Download PDF → /dossier?format=pdf blob` | dossier `{ticker,score,breakdown,peer,kronos, research}` visual | `pnpm typecheck 0` |
| d | `apps/web/app/backtest/page.tsx` | new route `GET /api/v1/backtest?market=id` → `backtest-100.json {equity_curve,metrics:{hit_rate,drawdown,sharpe,top5_forward_20d}}` → `BacktestChart` + `MetricsTable` | web `hasil akhir dari backtest` — data real `Authorization /v2/daily/{symbol}/` + `SEITH-MARKET-IDX` memo | `pnpm test` backtest |
| e | `apps/web/lib/api.ts` + `next.config.js` | `fetchRanking + fetchAnomalies + fetchBacktest + fetchDossier` zod `RankingQuery/AnomalyQuery/BacktestQuery/DossierQuery` + `next.config.js rewrites: [{source:'/api/v1/:path*', destination:'http://localhost:8181/api/v1/:path*'}]` + `NEXT_PUBLIC_API_BASE` prod | `baseUrl()=process.env.NEXT_PUBLIC_API_BASE ?? ""` + `fetchEnvelope + x-schema-version` + `grep SECTORS_API_KEY apps/web -r → 0` | `pnpm build` no 404 without env |

## Deliverables + Acceptance
- Journey `hero TopLeaks → ranking 60s → dossier deep dive → backtest → PDF` spec — docs-only, no code
- `pnpm lint 0 typecheck 0` no drift (prove), `gitleaks 0` (`NEXT_PUBLIC_API_BASE` only, no `SECTORS_API_KEY` in web), `cargo fmt --check 0 + clippy --all-targets 0 + cargo test 145 + uv 17` no drift
- 40% usability: `60s ranking → deep dossier → export PDF` story beats + Bloomberg dark `#0B0E14/#11151F` + `JetBrains Mono` numbers — `design-taste-frontend` + `no-ai-slop`
- Constraint: docs-only, no `apps/kronos-sidecar` edit (`grep plotly →0`)

## Verification
```
cargo fmt --check → 0 / cargo clippy --all-targets → 0 / cargo test → 145 passed / uv --project apps/analysis run pytest -q --cov → 17 passed 96%
pnpm --dir apps/web lint → 0 / pnpm --dir apps/web typecheck → 0 / pnpm --dir apps/web test → pending (after impl, TopLeaks + BacktestChart)
grep -r SECTORS_API_KEY apps/web → 0
grep -r plotly apps/kronos-sidecar/pyproject.toml → 0
gitleaks detect → 0
```

## Accountability Block — Task 03
- ✅ Terverifikasi: `cargo fmt 0 + clippy --all-targets 0 + test 145 + pnpm 0` no drift, journey `hero→ranking→dossier→backtest→PDF` spec covers `apps/web` all routes
- ⚠️ Belum: journey code — deferred to handoff/10-impl, `next.config.js` 0 until then
- 🔻 Risiko: `recharts` installed 0 import stays until 02 impl — mitigasi verify `grep recharts`
- ♻️ Refactor: keep journey narrow, DRY with 01+02

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent |
|---|---|---|---|
| Journey Lead | T0 | `seith-market-intelligence` + `verification-loop` + `design-taste-frontend` | — |

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/10-web-visual` + task `03-journey-integration.md` + ritual 3Q + `skill://design-taste-frontend`
