# Phase 07 — Top 5 Leak + Jupyter 20 Ticker Plotly (research/ Isolated) — Overview

## Goal
Kunci `Money Leak Radar Top 5 + Jupyter 20 ticker plotly isolated research/` — `?sort=anomaly&minZ=2.0&pageSize=5` + `Score 0-100 stacked` + `Z/σ` viz — tanpa sentuh `apps/kronos-sidecar` production.

## Context
- SSOT: `AGENTS.md §3c Seven Zones §8b Branch §8c Ownership §7 DoD 10` + `docs/spec.md §2[3] Kronos 400→20 §4 Scoring 30/20/30/20 §7b` + `docs/api-spec.md §1 envelope §3 ranking/anomalies §4 schemas §6 Repository §10 9router` + `docs/tdd-plan.md §3 P6-7 §9 Checklist` + `docs/adr/0001-0006` + `docs/research/ 3 files de244cd` + `docs/kronos-notes.md` + `2508.02739v1.pdf` + `vendor/Kronos examples` + `skill://seith-market-intelligence` + `skill://no-ai-slop` Tier-1 + `skill://design-taste-frontend` Z2 + `skill://verification-loop` + `skill://git-worktree-manager`
- Prereq DONE: `main de244cd` H1→H5 Hybrid `143 tests` `pnpm 3` `uv 34` + H6 handoff #30 merged `a58d9d3` (implement pending) + `docs/research gap-win thesis 100 stratified` — H7 hanya Top5 Leak + Notebook P0, no full scan 960
- Keputusan founder lock: `20 ticker` pejabat · `plotly` · `research/pyproject.toml baru` terpisah — `apps/kronos-sidecar` FastAPI production tidak dicampur `jupyter/plotly` — `Top 5 Leak dulu` 40% Usability
- Zona terdampak: Z5 `research/` + Z2 `apps/web` + Z6 `.handoff/phase-07-top5-leak` — Z1 `crates/*` verify only, Z3 `data/seith.db` verify only, `apps/kronos-sidecar` **no edit**

## Scope In / Out
In (7 Zones — luar zona = PM veto):
- Z5 `research/pyproject.toml` uv isolated `jupyterlab + ipykernel + plotly + pandas (+ polars opsional)` · `research/money-leak-backtest.ipynb` 7 cells `plotly` `actual zinc vs forecast amber dashed + ±2σ red 10%` + `StackedBar 30/20/30/20` + `hist |Z|>2` + load `fixtures/bbca-400/sector-median/illiquid/kronos-pred-20.json` 0 credit + placeholder `20 ticker Excel venue read_excel`
- Z2 `apps/web/lib/api.ts` add `sort/order` + `components/TopLeaks.tsx` + `app/page.tsx` hero Top5 `GET /ranking?pageSize=5&sort=anomaly` + `app/ranking/page.tsx` enh `MarketToggle + sector filter + sort` + `pnpm test 3→4`
- Z6 `.handoff/phase-07-top5-leak/00-overview.md + 01-03-*.md` + Z7 `scripts` no edit
Out: `apps/kronos-sidecar` `apps/analysis` `:8001/:8002` logic (verify only, no `plotly` add), `crates/*` logic (verify only), `data/seith.db` migration (verify only), `full JSON dump` defer via L2, `ValuationGapMap/Screener/KronosChart 20` defer H7b, `vendor/*` read-only

## WBS — Task Breakdown
| # | Task file | Slice | Depedensi |
|---|---|---|---|
| 01 | `01-research-pyproject.md` | `research/pyproject.toml` isolated uv | — |
| 02 | `02-jupyter-backtest.md` | `research/money-leak-backtest.ipynb` 7 cells Plotly | 01 |
| 03 | `03-web-top5-leak.md` | `apps/web TopLeaks hero + ranking enh` | 01 (butuh `|Z|` thesis) |

Dependensi antar-fase: `H5 DONE Hybrid → H6 handoff Freeze (docs) → H7 THIS Top5 Leak (P0 win thesis) → H7b GapMap/Screener (P1) → H6 implement Freeze gate → Submit 30 Sep` — `research/` Z5 isolated, `apps/kronos-sidecar` untouched (§3c).

## Definition of Done — Phase 07 Top5 Leak Fokus Dokumen
1. `research/pyproject.toml` uv isolated `jupyterlab + ipykernel + plotly + pandas` — `uv --project research sync` 0 + `uv --project research run jupyter --version` + `plotly==*` pinned
2. `research/money-leak-backtest.ipynb` 7 cells `nbformat` valid + 0 credit `fixtures` + `plotly` offline `fig.show()` + `20 ticker Excel` placeholder `read_excel`
3. `apps/web` `TopLeaks 5` `fetchRanking sort/anomaly minZ 2.0` + `app/page.tsx` hero + `ranking` enh + `pnpm lint 0 typecheck 0 test 4`
4. `cargo fmt 0` + `cargo clippy -- -D warnings 0` + `cargo test 143` + `uv 34` unchanged `apps/kronos-sidecar` no drift
5. `refactor-cleaner` `fn<50 file200-400 nesting≤4 no dead code no unwrap` + `♻️ Refactor:` per task — `no-ai-slop` Tier-1 warn + `design-taste-frontend` Z2
6. `seith-phase-gate` `rust-reviewer ∥ security-reviewer` PASS + `architect` sign-off 7 Zones
7. Docs sinkron `docs/research/ 3 + spec §2[3] + api-spec §3` + `adr` no new (use `0005 hybrid`) — `doc-updater` no drift
8. Accountability `✅/⚠️/🔻/♻️` per task + `verification-loop` paste nyata no fabrikasi
9. `apps/kronos-sidecar/pyproject.toml` tidak mengandung `jupyter/plotly` — verify `grep`
10. Repo 7 Zones `research/` vs `apps/kronos-sidecar/` isolated — PM veto if mixed

## Peran + Skill + Sub-agent Matrix
| Peran | Eksekutor | Skill WAJIB | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead Otak T0 | opencode sini | `seith-market-intelligence` + `verification-loop` | — | Understand→Plan→Document + verify 03 |
| Founder | User | — | — | approve 20 ticker + Top5 dulu |
| PM Autonomous | `seith-pm` | `git-worktree-manager`+gate `fmt/clippy/test` + `senior-pm` | `seith-pm` | orkestrasi `handoff/07-top5-leak` + veto if `apps/kronos-sidecar` mixed |
| Arsitek | `architect` | `senior-architect` | `architect` | **SEBELUM coding** — audit Z5 vs Z2 isolated |
| Eksekutor T1 | sub-agent | `seith-market-intelligence`+`tdd-workflow`+`verification-loop`+`git-worktree-manager`+`no-ai-slop`+`design-taste-frontend` | `explore` | 01-02 Z5 research + 03 Z2 web |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | `seith-core` no drift — `no-ai-slop` |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | `research` no secret log |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca tiap task — `design-taste` Z2 |

## Branch & Worktree
- Branch flat `handoff/07-top5-leak` dari `main de244cd` — `git worktree add ../seith-wt/handoff-07 -b handoff/07-top5-leak` — `/.wt/` gitignore — existing `handoff/06-freeze` merged #30
- `1 terminal cukup` fokus dokumen dulu — opsi `2 terminal` T1 Z5 + T2 Z2 jika implement paralel — `target/` no clash `7 Zones` isolated
- Tiap session wajib `skill://seith-market-intelligence` + ritual 3Q `docs/notes/00-readme.md` + `no-ai-slop` Tier-1

## Verification
```
cargo fmt --check → 0
cargo clippy -- -D warnings → 0
cargo test → 143 passed
uv --project research run jupyter --version → 0
uv run pytest -q (both sidecars) → 17+17
pnpm lint → 0 / pnpm typecheck → 0 / pnpm test → 4 passed (TopLeaks)
grep -r plotly apps/kronos-sidecar/pyproject.toml → 0 (isolated)
refactor-cleaner → fn<50 file200-400 nesting≤4 pass
```

## Risks & Mitigasi
- `jupyter/plotly masuk apps/kronos-sidecar` → PM veto + `grep plotly apps/kronos-sidecar/pyproject.toml → 0` + isolated `research/pyproject.toml`
- `ipynb tidak nbformat valid` → `uv --project research run jupyter nbconvert --to notebook --execute research/money-leak-backtest.ipynb --allow-errors` 0
- `Top5 Leak tanpa |Z|` → `fetchRanking sort=anomaly minZ 2.0` via `seith-api` `anomalies` — `Bloomberg #0B0E14` hero must have `disclaimer` always

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/07-top5-leak` + task `01-research-pyproject.md` + ritual 3Q
