# Task 02 — Ipynb Output 7+3 Sel (Z5)

## Goal
`money-leak-backtest.ipynb` 10 sel (7 existing + 3 baru) — tabel 100 + 2×2 plotly dark + memo 10 — `nbconvert --execute → html` 0 error, 30% depth verifiable offline.

## Context
- SSOT: `research/money-leak-backtest.ipynb` 7 sel + `research/pyproject.toml plotly 5.24.1 isolated research/.venv` + `research/backtest-100.json 100 live + kronos 20 snapshot` + `research/memos_top10.json 10 llm` + `research/scores_98.json 98 ER/Z` + `AGENTS §3c Z5`
- Dependensi: 01 snapshot kronos 20 (item.kronos.chartPoints)
- Skill: `skill://seith-market-intelligence` + `tdd-workflow` + `verification-loop`; plotly isolated

## Scope In / Out
In: Z5 `research/money-leak-backtest.ipynb` sel 8 (DataFrame 100), sel 9 (Fig 2×2 plotly_dark: hist ER + scatter ER vs |Z| + stacked Top-20 + heatmap mini), sel 10 (memo 10 fund/tech/synth + pie llm 10 vs template 90) + `research/.venv` isolated
Out: web visuals (01), PDF (03), quant engine (H15)

## Todo (`todowrite` WAJIB — AGENTS §8d)
- [ ] Buka todo `in_progress` sebelum Implement; `completed` hanya setelah Verification hijau.

## Bagian — Surgical Breakdown
| Bag | Aksi | Acceptance | Test FAIL |
|---|---|---|---|
| a | Sel 8 Tabel 100: `DataFrame [ticker sector close mispricingScore ER |Z| QV SM flag rank research_source]` sort Score desc, `display(20)` + `assert len 100` | 100 rows, `SECTORS_API_KEY` 0 | fixture 12 titik |
| b | Sel 9 Fig 2×2 plotly_dark (offline): hist ER 98 (20 bins), scatter ER vs |Z| 98 dots flag red `|Z|>2`, stacked bar Top-20 4 segs, heatmap mini 10×10 | 4 traces `len(fig.data)≥4` | 1 trace equity doang |
| c | Sel 10 Memo 10: loop `memos_top10.json` + `backtest items research` → Fund/Tech/Synth prose ID truncated 300 + `Bukan rekomendasi...` + pie `llm 10 vs template 90` | 10 memos render, pie 10/90 | Top-10 hilang |

## Deliverables + Acceptance
- `research/money-leak-backtest.ipynb` 10 sel + `nbconvert --execute → html` artifact + `fn<50 file200-400` per sel + `♻️ Refactor:` wajib

## Verification (paste output nyata — §8c)
```
cd research && uv run jupyter nbconvert --execute money-leak-backtest.ipynb --to html → 0 (10 sel)
python -c "import nbformat; nb=nbformat.read(open('research/money-leak-backtest.ipynb'),as_version=4); print(len(nb.cells))" → 10
grep -r plotly apps/kronos-sidecar → 0
grep -r SECTORS_API_KEY research → 0
```

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T2 ipynb | sub-agent | `seith-market-intelligence` + `tdd-workflow` + `verification-loop` | `explore` plotly | Implement→Verify 02 |
| Doc | `doc-updater` | `remember`+`handoff`+`no-ai-slop` | `doc-updater` | ipynb prose audit |

## Next Session Prompt
`skill://seith-market-intelligence` + `handoff/14` + `02-ipynb-output.md` ritual 3Q → `03-pdf-dossier.md`
