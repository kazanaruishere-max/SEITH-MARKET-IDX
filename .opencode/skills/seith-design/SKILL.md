# Skill: seith-design — Bloomberg Polish & No-AI-Slop (SEITH 20y)

## Purpose
Satu token, satu grafik, satu kata — tidak generik AI. Bloomberg dense, bukan bento. 20 tahun: satu shade salah, juri 40% usability kabur.

## When to Use
Trigger: `polish`, `visual`, `chart`, `heatmap`, `dossier`, `pdf`, `bloomberg`, `recharts`, `plotly`, `ADEs`, `generik`, `visualisasi`. Setiap session yang sentuh `apps/web/**` atau `research/*.ipynb` atau `DossierPDF.tsx` WAJIB load skill ini + `seith-market-intelligence` + `no-ai-slop` + `design-taste-frontend`.

## Todo
`skill://seith-design` → audit token:line → `todowrite` → Implement → `pnpm lint/build 4 routes` → `verification-loop` — `grep SECTORS_API_KEY apps/web 0` sebelum `completed`.

## Token Lock (Phase-12 Audit Real — d46a77d)
- **Warna:** bg `#0B0E14` (layout.tsx), card `#11151F`, border `#27272a`/`#1A1F2E`, text `#a1a1aa`/`#e4e4e7`, grid `#27272a dashed 3 3`, accent `amber #fbbf24` (40-70), `emerald #10b981 >70`, `red #ef4444 <40`, vol band `#ef4444 10%` area
- **Font:** `JetBrains Mono` ticker/score/rank mono 10-12px, `Inter` body 13-14px, header `uppercase tracking-wide 10px`, angka `Tabular-nums`
- **Layout:** `max-w-6xl 12-col grid`, card `rounded-xl border border-zinc-800`, header `sticky top-0 backdrop-blur`, footer `Bukan rekomendasi investasi` tiap route (Tier-0), chart `height 260` (BacktestChart)
- **Scan:** `grep "#0B0E14" apps/web/app/layout.tsx` 1, `grep "scoreColor" apps/web/components/ScoreBadge.tsx` amber/emerald/red exact, `grep "JetBrains|Tabular" apps/web` 1+

## Grafik MI Profesional (4 MVP — H14)
- **G1 Heatmap 100** — 10×10 grid rank→score `red→amber→emerald` 100 cells — `recharts Scatter` color scale 0-100 — `backtest-100.json 100 live`
- **G3 Stacked Top-20** — BarStack 20×4 `ER amber 30 + Z yellow 20 + QV emerald 30 + SM sky 20` real `components` — sum==score, bukan dummy `w 30/20/30/20`
- **G4 Scatter ER vs |Z|** — 98 dots `x=ER(50.02 LPPF) y=|Z|(0.09-0.65) size=close` — flag `|Z|>2` red, bukan kosong
- **G6 Equity Area** — `Area SEITH #a1a1aa vs IHSG #fbbf24 dashed 5 5 + drawdown shade -8%` + tooltip delta — `equity_curve 12`
- **Dossier web/PDF:** Line 400 actual `#a1a1aa` + 20 forecast `#fbbf24 dashed` + Area ±2σ; Stacked real values; heatmap mini 10×10 vector rects `@react-pdf/renderer` (100 rects, no raster)

## Stack Lock
- **Web:** `recharts` only — `grep plotly apps/web 0`, `grep plotly apps/kronos-sidecar 0` — existing `BacktestChart Line/Area` reuse
- **Ipynb:** `plotly 5.24.1` isolated `research/.venv` — offline `fig.show()` — `nbconvert --execute → html` 0 error, 7→10 sel
- **PDF:** `@react-pdf/renderer` vector — Helvetica 8pt, page `#0B0E14`, 9 sections, `x-schema-version 1.0.0`, `Svg Line 400→20`

## No-AI-Slop Gate (AGENTS §6c Tier-1)
- **Banned words:** `delve|leverage|robust|cutting-edge|crucial|tapestry|landscape|harness|unlock|elevate` — scan `no-ai-slop` 0
- **Banned patterns:** `It's not X it's Y` binary, `Important to note` throat-clear, `:` reveal colon, `—` em-dash crutch, `Firstly Secondly`
- **One string = one file violation** — `grep "delve|leverage" apps/web/components/DossierPDF.tsx` 0 — no exception phase H14 hard fail

## Commands
```powershell
pnpm --dir apps/web lint; pnpm --dir apps/web build # 4 routes
grep -r "SECTORS_API_KEY" apps/web # → 0
grep -r "plotly" apps/kronos-sidecar # → 0
grep "#0B0E14" apps/web/app/layout.tsx # → 1
.\research\.venv\Scripts\python -c "import nbformat; print(len(nbformat.read(open('research/money-leak-backtest.ipynb'),as_version=4).cells))"
```

## Docs Map
`AGENTS.md §6c` + `docs/prd.md §7` + `apps/web/app/layout.tsx` + `apps/web/components/*` + `research/money-leak-backtest.ipynb`

## Judging Lens
40% Usability — 60s Ranking→Dossier→PDF tanpa baca teks; 30% Video — visual shoot 1m/3m; 30% Depth — verifiable lineage (skill seith-data).

## References
`apps/web/app/layout.tsx` (`#0B0E14`), `apps/web/components/ScoreBadge.tsx` (amber/emerald/red), `apps/web/components/DossierPDF.tsx` (9 sections), `research/money-leak-backtest.ipynb` (7→10)
