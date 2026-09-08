# Task 02 — Visual Spec (TopLeaks + BacktestChart + Metrics)

## Goal
Spesifikasi visual Bloomberg `#0B0E14` untuk hasil backtest real — `TopLeaks` Top5, `BacktestChart` recharts, `MetricsTable`, `ScoreBadge` stacked.

## Context
- SSOT: `apps/web/tailwind.config.js` (Bloomberg `bg #0B0E14 card #11151F panel #1A1F2E border #27272a`, `mispricing low #ef4444 mid #fbbf24 high #10b981`, `JetBrains Mono`) + `apps/web/components/ScoreBadge.tsx 14L` + `RankingTable.tsx` (sort mispricingScore desc, empty `No data`) + `app/layout.tsx bg-[#0B0E14]` + `app/page.tsx hero static` + `app/ranking/page.tsx RSC fetchRanking` + `app/dossier/[ticker]/page.tsx` + `lib/api.ts:42L` + `research/backtest-100.json` contract (phase 09 02) + `crates/seith-core/src/scoring/calculator.rs: 30/20/30/20` + `kronos/chartPoints + anomaly |Z|>2`
- Branch: `handoff/10-web-visual` — Z2 `apps/web` components + Z6 handoff — docs-only
- Skill: `skill://seith-market-intelligence` + `skill://design-taste-frontend` + `skill://no-ai-slop` Tier-1 + ritual 3Q

## Scope In / Out
In: Z2 `apps/web/components/TopLeaks.tsx + BacktestChart.tsx + MetricsTable.tsx + ScoreBadge.tsx stacked 30/20/30/20` spec + `app/page.tsx hero TopLeaks` + `app/dossier/[ticker]/page.tsx kronos.chartPoints line + peerComparison + research memo tabs + disclaimer tiap view` — docs-only: no code, `recharts 2.12.7` installed 0 import → wired in spec
Out: Z1 crate logic, Z3 `data/seith.db` write, `apps/kronos-sidecar` no edit, `ValuationGapMap/Screener` H7b

## Bagian — Surgical Breakdown
| Bag | File | Struktur | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `apps/web/components/TopLeaks.tsx` spec | `Top5 sort=anomaly pageSize=5 minZ2.0` hero on `app/page.tsx` | `rank ticker market sector |Z| flag reason` table, `flag` red badge `|Z|>2`, `market toggle id/sg` isolated, `disclaimer` always, `fetchAnomalies` zod | `Glob TopLeaks` 1, `pnpm test` TopLeaks 5 |
| b | `apps/web/components/BacktestChart.tsx` spec | `recharts Line (actual zinc `#a1a1aa` vs forecast amber dashed `#fbbf24` + Area ±2σ red 10% `fillOpacity 0.1`) + capital vs IHSG `fillBetween` | `chartPoints: Vec<Value>` (kronos 400 grey +20 blue) + `backtest.equity_curve` line, `ResponsiveContainer 100%` | `grep recharts apps/web -r` → >0 |
| c | `apps/web/components/MetricsTable.tsx + ScoreBadge stacked` spec | `MetricsTable: Sharpe/maxDD/win rate/totalReturn/cumulative` + `ScoreBadge: 4 segmen 30ER/20|Z|/30QV/20SM stacked bar` + `degraded:true` banner | `Components {expected_return,anomaly_z,quality_value,sector_mom}` → stacked | `cargo fmt` 0 |
| d | `apps/web/app/dossier/[ticker]/page.tsx` enh | `kronos.chartPoints Line` + `peerComparison[3] table per market` + `research fundamental/technical/synthesizer tabs` + `degraded` + `disclaimer` tiap view | dossier `score+breakdown+peer+kronos+research` → visual | `pnpm typecheck 0` |

## Deliverables + Acceptance
- Visual spec for `TopLeaks Top5 |Z| desc badge red` + `BacktestChart recharts Line+Area ±2σ` + `MetricsTable Sharpe/maxDD` + `ScoreBadge stacked 30/20/30/20` + dossier `chartPoints + peer + memo tabs + disclaimer` — docs-only, no code
- Fixes `recharts` dead dep (0 import → wired) + `TopLeaks` missing gap (Phase 7) — `no-ai-slop` + `design-taste-frontend` Z2
- `fn<50` N/A docs-only, `gitleaks 0`, `cargo fmt --check 0 + clippy --all-targets 0 + cargo test 145 + pnpm lint/typecheck 0` no drift

## Verification
```
cargo fmt --check → 0 / cargo clippy --all-targets → 0 / cargo test → 145 passed
pnpm --dir apps/web lint → 0 / pnpm --dir apps/web typecheck → 0
# future after impl:
# grep recharts apps/web -r → components/BacktestChart.tsx
# Glob TopLeaks → components/TopLeaks.tsx
# pnpm test → TopLeaks 5 + BacktestChart 3
gitleaks detect → 0
```

## Accountability Block — Task 02
- ✅ Terverifikasi: `cargo fmt 0 + clippy --all-targets 0 + test 145 + pnpm 0` no drift, `recharts 2.12.7` dead dep noted → spec wired
- ⚠️ Belum: component code — deferred to handoff/10-impl, `TopLeaks` 0 until then
- 🔻 Risiko: `TopLeaks` hero without `sort=anomaly` in `lib/api.ts` → mitigasi 01 api-contract first
- ♻️ Refactor: keep visual narrow, DRY with 01+03, `file200-400` future

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent |
|---|---|---|---|
| Designer FE | `design-taste-frontend` | `design-taste-frontend` + `no-ai-slop` | — |

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/10-web-visual` + task `02-visual-spec.md` + `skill://design-taste-frontend` + ritual 3Q
