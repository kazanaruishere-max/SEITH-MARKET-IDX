# Task 01 — Web Visual 4 MVP (Z2)

## Goal
4 grafik MI profesional tampil di 4 routes live data — heatmap 100 + stacked Top-20 + scatter ER vs |Z| + equity area+drawdown — reuse recharts, Bloomberg #0B0E14, no polos.

## Context
- SSOT: `AGENTS.md §3c Z2 + §6c no-ai-slop + §8c` + `docs/prd.md §7 Journey` + `apps/web/app/*` + `apps/web/components/{RankingTable,BacktestChart,TopLeaks,ScoreBadge}` + `apps/web/lib/api.ts` fetch live `:8181` + `research/backtest-100.json 100 live`
- Dependensi: H13 `d46a77d` live (100 items, 10 memo, equity 12); `:8181` + `NEXT rewrites :8181` verified; `recharts` existing, `plotly` isolated research
- Skill: `skill://seith-market-intelligence` + `skill://design-taste-frontend` + `tdd-workflow` + `verification-loop`; explore Bloomberg/Koyfin pattern

## Scope In / Out
In: Z2 `apps/web/components/{Heatmap,StackedTop20,ScatterERvsZ,EquityArea, TreemapSector (stretch)}` + route wiring `/{ranking,backtest,dossier/[ticker]}` + dossier web chart 400+20 snapshot (patch regen) + token audit `#0B0E14/#11151F/#27272a #fbbf24/#10b981/#ef4444 JetBrains Mono/Inter/Tabular-nums`
Out: ipynb sel 8-10 (02), PDF 9-section (03), quant engine (H15), video

## Todo (`todowrite` WAJIB — AGENTS §8d)
- [ ] Buka todo `in_progress` sebelum Implement; `completed` hanya setelah Verification hijau.

## Bagian — Surgical Breakdown
| Bag | Aksi | Acceptance | Test FAIL |
|---|---|---|---|
| a | Token lock: audit `layout.tsx/globals.css/tailwind.config.js` — bg `#0B0E14` card `#11151F` border `#27272a`/`#1A1F2E` text `#a1a1aa/#e4e4e7` accent `amber/fbbf24 emerald/10b981 red/ef4444` Mono `JetBrains Mono` | `no-ai-slop` scan `delve/leverage/robust` 0 | generik AI prose `cutting-edge robust` lolos |
| b | Regen snapshot kronos 20: patch `research/regen_backtest_100.py` tambah `item.kronos: {forecast, chartPoints: 20}` deterministik (no live :8001) | `backtest-100.json items[0].kronos.chartPoints.length==20` | chart web kosong `[]` lagi |
| c | G1 Heatmap 100: `Heatmap100.tsx` 10×10 grid rank→score color 0-100 `red→amber→emerald` + tooltip ticker/sector | 100 cells, `SECTORS_API_KEY` 0 di web | heatmap dummy tidak match `mispricingScore` |
| d | G3 Stacked Top-20: `StackedTop20.tsx` BarStack 20 tickers × 4 segs `ER(amber 30) + Z(yellow 20) + QV(emerald 30) + SM(sky 20)` real `components` | 20 bars × 4 segments sum==score | dummy `w 30/20/30/20` flat lagi |
| e | G4 Scatter ER vs |Z|: `ScatterERvsZ.tsx` dot per ticker `x=ER y=|Z| size=close` + quadrant flag `|Z|>2` | 98 dots, flag red | kosong tanpa kronos |
| f | G6 Equity upgrade: `BacktestChart.tsx` Area SEITH vs IHSG + drawdown shade `-8%` + tooltip delta `return-bench` | traces≥2 area, shade visible | single line 12 titik polos lagi |
| g | Dossier web chart: `DossierClient` Line 400 actual `#a1a1aa` + 20 forecast `#fbbf24 dashed` + Area ±2σ `#ef4444 10%` dari `kronos.chartPoints` | LPPF ADES render 400+20 | PDF generik terulang di web |

## Deliverables + Acceptance
- `apps/web/components/*` 4 MPV traces + dossier chart + `app/{page,ranking,backtest,dossier}` wiring live + `research/backtest-100.json` kronos 20 snapshot
- `pnpm build 4 routes` + rerender 100; `fn<50 file200-400` + `♻️ Refactor:` wajib

## Verification (paste output nyata — §8c)
```
pnpm --dir apps/web lint → 0 / typecheck → 0 / build → 4 routes (/, /ranking, /dossier/[ticker], /backtest)
cargo fmt --check → 0 / cargo clippy → 0
grep -r SECTORS_API_KEY apps/web → 0
curl :8181/api/v1/backtest?market=id → items 100 kronos 20
Invoke-WebRequest :20128/v1/models → 200 (NEVER kill)
```
+ Accountability Block `✅/⚠️/🔻/♻️` + `♻️ Refactor: <apa>`

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T1 web | sub-agent | `seith-market-intelligence` + `design-taste-frontend` + `tdd-workflow` + `verification-loop` | `explore` Bloomberg pattern | Implement→Verify 01 |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | recharts + backtest_data.rs |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | no secret leakage web |

## Next Session Prompt
`skill://seith-market-intelligence` + `handoff/14` + `01-web-visual.md` ritual 3Q → `02-ipynb-output.md`
