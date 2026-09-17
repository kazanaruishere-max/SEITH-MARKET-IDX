# Task 01 — Web Bloomberg Polish

## Goal
Polish `apps/web` to Bloomberg×TradingView density — `#0B0E14/#11151F/#1A1F2E #24242e` `Inter 800+JetBrains Mono tabular 8pt rounded6 shadow-card glass 1360px` hero 4 KPI + sector strip 5 + heatmap treemap + screener bar+flag sticky + pagination — factual not generic.

## Context
- SSOT: `AGENTS §3c/§6c/§8c` + `docs/prd §4` + `docs/api-spec §3` + `apps/web/app/page.tsx 105l` hero KPI 4 + sector strip 5 pills `FINANCE/ENERGY/CONSUMER/INFRA/OTHER avg` + `app/ranking/page.tsx` TV chips + `app/backtest/page.tsx` KPI bars + `app/dossier/[ticker]/page.tsx` 4 bars 30/20/30/20 + `components/Heatmap100.tsx` treemap 5× + `RankingTable.tsx` bar+flag + `BacktestChart.tsx` Area emerald/amber `ReferenceLine -8%` + `app/layout.tsx` glass 1360px + `app/globals.css` glass/tabular + `tailwind.config.js` bloomberg tokens + `lib/api.ts` rank nullable + `research/backtest-100.json 296c`
- Dependensi: H21 factual wiring done (PR #40 OPEN `health db + is_mock_mode + 3 memo + catch logged + chart honest + credit 296`)
- Branch: `handoff/22-accessibility` worktree `../seith-wt/handoff-22` from `handoff/21-zero-gap 7902b84` — Z2 `apps/web` primary

## Scope In / Out
In: `apps/web/app/page.tsx` (hero KPI 4 + sector strip 5 avg + breadcrumb `as_of live/degraded`) + `apps/web/app/ranking/page.tsx` (TV chips `market/sector/sort/order pageSize50`) + `apps/web/app/backtest/page.tsx` (KPI bars + excluded pills) + `apps/web/app/dossier/[ticker]/page.tsx` (4 bars + peer5 table) + `apps/web/components/Heatmap100.tsx` (treemap 5 sectors avg color `r239→amber→emerald 0-100` padded 100) + `apps/web/components/RankingTable.tsx` (bar width + flag pill `|Z|>2` sticky) + `apps/web/components/BacktestChart.tsx` (Area emerald/amber + `ReferenceLine -8%`) + `apps/web/components/{DossierKronosChart,MetricsTable,StackedTop20,ScatterERvsZ}.tsx` + `apps/web/app/layout.tsx` (glass 1360px + header `Ranking/Backtest/Dossier` + disclaimer `Bukan rekomendasi`) + `apps/web/app/globals.css` (glass/tabular focus) + `apps/web/tailwind.config.js` (bloomberg tokens) + `apps/web/lib/api.ts` (zod envelope)
Out: `crates/seith-api` health wiring (02), `DossierPDF.tsx` 9-section (03), `vercel.json` (04), `data/seith.db` seed, `sectors-client` live 25c

## Todo
- [ ] `todowrite in_progress` before Implement; `completed` only after Verify hijau + Block `✅/⚠️/🔻/♻️`

## Bagian — Surgical Breakdown
| Bag | File | Fn/Struct | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `apps/web/app/page.tsx` | hero + sector strip | hero gradient `from-[#11151F] via-[#11151F] to-[#0f1320]` rounded 16px `shadow-card` KPI 4 `Universe/avg/flagged|Z|>2/pipeline 400→20` sector strip 5 `Link ?sector=` + bar width `pct=max(8,round(avg))%` + breadcrumb `IDX › Sectors 100 › Market Intelligence as_of live/degraded` | KPI missing or `avg="-"` always |
| b | `apps/web/app/ranking/page.tsx` | screener | `searchParams market|sector|sort|order|page|pageSize` `market??"id"` `fetchRanking` + `fetchRanking pageSize100 allForCharts` `scatterItems: expected_return 50 fallback z: anomalyZ\|anomaly.z` `stackItems: components filter` chips sticky `sort mispricing/anomaly order desc/asc` pagination `total 25 if FINANCE` | `pageSize>50` not clamped |
| c | `apps/web/components/Heatmap100.tsx` | treemap | `use client` color `r239,68,68→amber251,191,36→emerald16,185,129 clamped 0-100` treemap by `FINANCE/ENERGY/CONSUMER/INFRA/OTHER` padded 100 `"-"` cells `as_of live/degraded` header | heatmap 0 cells |
| d | `apps/web/components/RankingTable.tsx` | screener bar+flag | sorted `mispricingScore desc` `barWidth score%` `scoreColor >70 emerald >=40 amber else red` `flagDot |Z|>2` pagination footer `No data` guard | bar 0% all |
| e | `apps/web/components/BacktestChart.tsx` | Area | `LineChart` `Area emerald/amber` `ReferenceLine y=-8%` `CartesianGrid #24242e` `XAxis/YAxis #a1a1aa 9-10px` `Tooltip #11151F` | chart empty `[]` no axis |
| f | `apps/web/app/layout.tsx` + `globals.css` + `tailwind.config.js` | Bloomberg grade | `layout max-w 1360 glass bg-[#0B0E14] header sticky Inter/JetBrains Mono` `globals.css --bg #0B0E14 --card #11151F --panel #1A1F2E --border #24242e .card/.kpi/.pill shadow-card` `tailwind content app+components colors bloomberg/mispricing font mono JetBrains` | glass missing or `bg-white` |
| g | `apps/web/app/page.tsx` + `components/*.tsx` | a11y | keyboard nav Tab/Shift-Tab focus-visible ring, skip-link, aria-label sector pills + ranking table, contrast ≥4.5:1 zinc-400 on #0B0E14, chart non-color alt (pattern/label) | a11y fail axe |

## Deliverables + Acceptance
- `GET / 200 125k css true` hero KPI 4 + sector strip 5 pills with avg 1-decimal + bar `pct%` + `All 100 →` + heatmap treemap 5 sectors + `Top 10 mispricing — preview AA leaderboard` + `RankingTable top10` + `Bukan rekomendasi` footer — no white flash
- `GET /ranking?market=id&sector=FINANCE → 20/25 pagination.total 25` screener `market id|sg` `FINANCE/ENERGY/CONSUMER/INFRA/OTHER` chips + `sort mispricing/anomaly` + scatter `expected_return vs |Z|` + stacked Top20 + bar+flag sticky rank
- `GET /backtest → 4 KPI bars + excluded pills ticker·reason + equity_area 12 vs IHSG` + `GET /dossier/BBCA → 4 bars 30/20/30/20 + peer5 QV distance cap±50% + 3 memo distinct + KronosComponent`
- `pnpm lint 0 && typecheck 0 && test 6/6 && build 4 routes (/ /ranking /backtest /dossier/[ticker]) 87.3k shared` + a11y: Tab focus-visible ring on all interactive, axe 0 serious

## Verification
```
pnpm --dir apps/web lint → 0
pnpm --dir apps/web typecheck → 0
pnpm --dir apps/web build → 4 routes (Route app / /ranking /backtest /dossier/[ticker] 87.3k)
curl -s http://127.0.0.1:3000/ | grep -c "BLOOMBERG GRADE" → 1
curl -s http://127.0.0.1:3000/ranking?market=id&sector=FINANCE | grep -c "Heatmap\|RankingTable" → ≥1
curl -s http://127.0.0.1:8181/health | jq '.data.schema, .data.db'
```

## Peran + Skill
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T1 | sub-agent | `seith-market-intelligence` + `seith-design` + `no-ai-slop` + `design-taste-frontend` + `high-end-visual-design` | `seith-design-reviewer` | Implement→Verify TDD `fn<50 file200-400 nesting≤4` |

## Next
Task 02 data factual wiring depends on this Bloomberg density staying factual (no fake data).
