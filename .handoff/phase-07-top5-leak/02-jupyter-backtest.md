# Task 02 — Jupyter money-leak-backtest.ipynb 7 Cells Plotly

## Goal
`research/money-leak-backtest.ipynb` 7 cells `plotly` `actual zinc vs forecast amber dashed + ±2σ red 10%` + `StackedBar 30/20/30/20` + `hist |Z|>2` — load `fixtures/bbca-400/sector-median/illiquid/kronos-pred-20.json` 0 credit + `20 ticker Excel venue` placeholder `read_excel`.

## Context
- SSOT: `docs/research/ 3 files de244cd` + `vendor/Kronos examples prediction_example.py matplotlib 3.9.3` → `plotly` upgrade path + `docs/spec.md §2[3] Kronos 400→20 T1.0/p0.9 §4 Scoring 0-100 §2[5] Ranking+Flag |Z|>2 vs vol>2σ` + `crates/seith-core/src/{scoring,anomaly,normalize,kronos} + tests/fixtures/` + `research/pyproject.toml` 01 + `skill://seith-kronos` + `skill://seith-market-intelligence` + `skill://verification-loop` + `skill://git-worktree-manager` + `skill://no-ai-slop`

## Scope In / Out
In: Z5 `research/money-leak-backtest.ipynb` 7 cells `plotly offline` + optional `research/money-leak-backtest.py` export `jupyter nbconvert` — Z5 only
Out: `apps/kronos-sidecar` no edit, `apps/web` (03), `crates/*` verify only, `data/seith.db` verify only, `vendor/*` read-only

## Bagian — Surgical (1 bag = 1 cell <50 lines)
| Bag | Cell | Content `plotly` | Acceptance | Test FAIL |
|---|---|---|---|---|
| 02a | 1 setup | `import json pandas numpy plotly.graph_objects` + `load fixtures/bbca-ohlcv-400.json (400) + sector-median.json + illiquid.json + kronos-pred-20.json` `KRONOS_MOCK` comment | `fixtures 400 rows + sector median` | `no fixtures→FAIL` |
| 02b | 2 cleansing | `cleanse_ohlcv volume null→0 OHLC 0→excluded + insufficient_data` demo `illiquid` + `x/y_timestamp derive` + `Excel 20 ticker read_excel placeholder` | `excluded list + volume 0` | `no excluded→FAIL` |
| 02c | 3 kronos | `mock predict 400→20 vs kronos-pred-20.json + predict_batch guard lookback+pred≤512` `T1.0 top_p0.9` | `forecast 20 closes` | `no 20→FAIL` |
| 02d | 4 Z/σ | `ER=(forecast-last)/last Z=(actual-forecast)/σ rolling 20 std fallback sector vol if sample 1` + `plotly Line actual #e4e4e7 vs forecast #f59e0b dashed + Area ±2σ rgba(239,68,68,0.1)` mirror design-spec | `Z calc + plotly fig` | `no Z→FAIL` |
| 02e | 5 vol Leak | `vol Z=(vol-mean)/σ vol flag vol>2σ without ROE/margin catalyst reason string` + `plotly Bar red dot` | `vol>2σ reason` | `no reason→FAIL` |
| 02f | 6 score | `score 0-100 = 0.30*ER_z+0.20*(100-|Z|)+0.30*QV+0.20*SM clamp + stacked Bar 4 amber/zinc/emerald/blue` + `Top5 sort |Z| desc table` | `score breakdown` | `no stack→FAIL` |
| 02g | 7 backtest | `metrics Sharpe maxDD win rate cumulative degraded:true branch forecast=0 if σ 1-sample fallback` `degraded` viz + `PNG+CSV excluded` output | `degraded true viz` | `no degraded→FAIL` |

## Deliverables + Acceptance
- `research/money-leak-backtest.ipynb` `nbformat 4` valid — 7 cells `plotly offline fig.show()` — `uv --project research run jupyter nbconvert --to notebook --execute --allow-errors` 0 — 0 Sectors hit `KRONOS_MOCK` comment — `20 ticker Excel` `read_excel` placeholder
- `research/money-leak-backtest.py` optional export via `nbconvert`
- Constraint: `file 200-400` per ipynb meta, `cell <50`, `plotly==5.* pinned` `ponytail: matplotlib 3.9.3 vendor, upgrade to plotly when Z-band needed` — `no-ai-slop` — `research/pyproject.toml plotly==5.*` single source + `research/.python-version 3.11`

## Verification
```
uv --project research run jupyter nbconvert --to notebook --execute research/money-leak-backtest.ipynb --allow-errors → 0
grep -r plotly research/pyproject.toml → ok
grep -r "KRONOS_MOCK" research/money-leak-backtest.ipynb → ok
cargo test → 143 (no drift)
```

### Accountability Block
```
✅ Terverifikasi: <cmd> → <output> paste nyata
⚠️ Belum: TopLeaks hero (03)
🔻 Risiko: ipynb tidak nbformat valid → mitigasi nbconvert execute 0
♻️ Refactor: extract 7 Zones table + Z calc σ fallback fn
```

## Peran + Skill
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T1 Z5 | sub-agent | `seith-market-intelligence`+`tdd-workflow`+`verification-loop`+`no-ai-slop` | `explore` | Jupyter 7 cells TDD |
| PM | `seith-pm` | gate | — | veto if `apps/kronos-sidecar` mixed |

## Next
`skill://seith-market-intelligence` + `handoff/07-top5-leak` + `02-jupyter-backtest.md` + ritual 3Q: gate? `Z+vol+score Top5`. jebakan? `σ 1-sample fallback`. test FAIL? `nbconvert 0`.
