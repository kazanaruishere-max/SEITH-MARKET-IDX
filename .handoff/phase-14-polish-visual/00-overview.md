# Phase 14 — Polish Visual — Overview

## Goal
Ubah scaffold polos (ranking text+ScoreBadge, 1 chart 12 titik, PDF generik) menjadi MI Bloomberg-professional visual dense — 4 grafik MVP + 9-section PDF vector + ipynb 7+3 sel — agar juri 40% usability paham 60s tanpa baca teks, dan 30% depth verifiable via ipynb offline.

## Context
- SSOT: `AGENTS.md §3c Seven Zones + §5 Commands + §7 DoD + §8d Todo + §8c Ownership + §6c no-ai-slop Tier-1` + `docs/prd.md §7 Journey §8 40/30/30` + `docs/spec.md §2 Pipeline §4 Scoring` + `docs/api-spec.md §7 Sectors Mapping + §9 sidecars + §10 9router + §3b envelope` + `docs/tdd-plan.md §6+§9` + `docs/kronos-notes.md` + `docs/notes/00-readme.md` ritual 3Q + `research/money-leak-backtest.ipynb` 7 sel existing
- Prereq DONE: `main d46a77d` = H13 live-100 merged (100 items as_of 2026-09-13, 10/10 llm memo, equity 12, excluded 2) — `cargo 89 passed clippy 0 fmt 0` + `pnpm lint 0 build 4 routes` verify; `seith-api :8181` serve `GET /api/v1/backtest?market=id` live; `.env` SECTORS_API_KEY server-only (fix serve.rs load_dotenv tanpa dep baru)
- Audit polos (user report): `RankingTable` text+ScoreBadge, `TopLeaks` list, `BacktestChart` single equity 12 line, `MetricsTable` angka, `DossierPDF StackedPDF dummy w 30/20/30/20 + chartPoints []` → ADES PDF generik AI; heatmap/distro/sector treemap/stacked components tidak ada
- Design target: Bloomberg terminal dense — token lock `bg #0B0E14 card #11151F border #27272a/#1A1F2E text #a1a1aa/#e4e4e7 accent amber #fbbf24 emerald #10b981 red #ef4444 grid #27272a dashed 3 3`, font `JetBrains Mono ticker/score/rank + Inter body + Tabular-nums`
- Skill wajib: `skill://seith-market-intelligence` awal session T1/T2 + `skill://design-taste-frontend` + `skill://no-ai-slop` Tier-1 + `skill://verification-loop` akhir + `skill://seith-phase-gate` + `skill://git-worktree-manager`
- Research MI (parallel explore): Bloomberg Terminal, Koyfin, TradingView MI patterns — heatmap 10×10 rank→score, treemap sektor, scatter ER vs |Z|, stacked components — best-practice via web research delegasi explore agent di eksekusi, bukan plan

## Scope In / Out
In: Z2 `apps/web` token + 4 grafik MVP (G1 heatmap 10×10 + G3 stacked Top-20 + G4 scatter ER vs |Z| + G6 equity area+drawdown) + dossier web chart 400+20 real snapshot + Z5 `research/money-leak-backtest.ipynb` sel 8-10 (tabel 100 + 2×2 plotly + memo 10) + `research/backtest-100.json` snapshot kronos 20 + Z2 `DossierPDF` 9-section Bloomberg vector rects heatmap mini + chart vector + Z6 `.handoff/phase-14-polish-visual/` + Z7 `scripts/` no-new-dep
Out: quant engine Slice A (H15), 7 grafik full (G2 hist/G5 sektor extra masuk H15 jika sisa waktu), video 1m/3m, Freeze H6, vendor read-only, `push --force`, dep baru (recharts + plotly existing only)

## WBS — Task Breakdown
| # | Task file | Slice | Depedensi |
|---|---|---|---|
| 01 | `01-web-visual.md` | T1: web 4 MVP visuals + dossier chart real | — |
| 02 | `02-ipynb-output.md` | T2: ipynb sel 8 tabel 100 + sel 9 2×2 plotly + sel 10 memo 10 → html | 01 (snapshot kronos 20) |
| 03 | `03-pdf-dossier.md` | T1/T2: PDF 9-section Bloomberg vector rects + chart vector + gate | 01 |

Dependensi antar-fase: `H13 d46a77d live → H14 polish (01→02/03) → H15 quant Slice A → H6 Freeze 30 Sep 23:59 WIB`. Cross-zona import dilarang §3c. `9router :20128` NEVER kill. Deadline 16 hari sisa.

## Todo (`todowrite` WAJIB — AGENTS §8d)
- Buka `todowrite` setelah Plan: 1 task file = 1 todo item, exactly-one `in_progress`, update realtime.
- `completed` hanya setelah Verification hijau + Accountability Block. PM veto jika tanpa jejak.

## Definition of Done — Phase 14
Fase done HANYA jika semua hijau (AGENTS §7 + §5b + §6c + §8c):
1. `cargo fmt --check && cargo clippy -- -D warnings` 0 per crate
2. `cargo test 89+` + `pnpm lint 0 / typecheck 0 / build 4 routes (/, /ranking, /dossier/[ticker], /backtest)` + `research nbconvert --execute money-leak-backtest.ipynb --to html 0` (10 sel) + `uv run pytest -q` jika sentuh sidecar
3. Visual gate: `recharts traces ≥4` (heatmap+stack+scatter+equity area), `plotly traces ≥4` ipynb, `DossierPDF` 9 sections render, `grep -r SECTORS_API_KEY apps/web → 0`, `grep -r plotly apps/kronos-sidecar → 0`, `Invoke-WebRequest :20128/v1/models → 200`
4. `refactor-cleaner` pass: `fn <50 file 200-400 nesting≤4 no dead code` + `♻️ Refactor:` per task
5. Dual-review `rust-reviewer ∥ security-reviewer` pass + `seith-phase-gate`
6. `verification-loop` pass + `gitleaks` no leak + docs sinkron `doc-updater`
7. Accountability Block per task `✅/⚠️/🔻/♻️` + output nyata no fabrikasi + `no-ai-slop` Tier-1 scan pass prose `delve/leverage/robust/Important to note`

## Peran + Skill + Sub-agent Matrix (Wajib — AGENTS §8 + §8c)
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead Otak T0 | opencode sini | `seith-market-intelligence` + `seith-dev` | — | Understand→Plan→Document, approve overview, verify delegasi |
| Founder | User | — | — | approve scope 4 vs 7 grafik + shoot video |
| PM Autonomous | `seith-pm` | `git-worktree-manager` + gate `fmt/clippy/test/build/nbconvert` | — | orkestrasi worktree `handoff/14`, **veto merge jika gate/reviewer/zone fail** — CHECK H14 |
| Eksekutor T1 web | sub-agent | `seith-market-intelligence` + `design-taste-frontend` + `tdd-workflow` + `verification-loop` | `explore` web research Bloomberg/Koyfin | 01 web visuals |
| Eksekutor T2 ipynb | sub-agent | `seith-market-intelligence` + `tdd-workflow` | `explore` plotly | 02 ipynb sel 8-10 |
| Eksekutor T1/T2 pdf | sub-agent | `seith-market-intelligence` + `design-taste-frontend` + `no-ai-slop` | — | 03 PDF Bloomberg |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | web `recharts` + repo `backtest_data.rs` |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | SECTORS_API_KEY server-only, no secret di pdf/log |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca tiap task Boy Scout §5b |
| Doc | `doc-updater` | `remember`+`handoff`+`no-ai-slop` | `doc-updater` | sinkron docs tiap merge |

## Branch & Worktree (AGENTS §8b + §3c)
- Branch: `handoff/14-polish-visual` dari `main d46a77d` — `git worktree add ../seith-wt/handoff-14 -b handoff/14-polish-visual`
- Paralel opsional (file-disjoint): `handoff/14/t1-web` (apps/web) vs `handoff/14/t2-ipynb` (research/*.ipynb) → PR ke parent → squash-merge ke `main` → hapus worktree
- Tiap session T1/T2 wajib `skill://seith-market-intelligence` di awal — semua AI agent bertanggung jawab penuh atas `code/logic/testing/structure & rapih` (§8c)
- File baru WAJIB di zona benar (1-7) — PM veto jika di luar zona

## Verification (paste output nyata — §8c)
```
cargo fmt --check → 0
cargo clippy --all-targets -- -D warnings → 0
cargo test → 89+ passed
pnpm --dir apps/web lint → 0 / typecheck → 0 / build → 4 routes
recharts traces ≥4 (G1 heatmap + G3 stacked + G4 scatter + G6 equity area)
cd research && uv run jupyter nbconvert --execute money-leak-backtest.ipynb --to html → 0 (10 sel)
grep -r SECTORS_API_KEY apps/web → 0
grep -r plotly apps/kronos-sidecar → 0
Invoke-WebRequest http://localhost:20128/v1/models → 200
refactor-cleaner scan → fn<50 file200-400 nesting≤4 pass
```
+ Accountability Block `✅/⚠️/🔻/♻️` per task — no fabrikasi

## Risks & Mitigasi
- Heatmap 10×10 100 rects berat di @react-pdf — mitigasi vector rects `@react-pdf/renderer` enteng (100 rects OK), deteksi `build` + render PDF `ADSE` 2 halaman.
- Kronos 400→20 snapshot butuh regen JSON — mitigasi patch `regen_backtest_100.py` tambah `kronos.chartPoints 20` snapshot deterministik, deteksi `backtest-100.json items[0].kronos.chartPoints length 20`.
- Recharts vs plotly leakage — mitigasi `grep plotly apps/kronos-sidecar →0`, `grep recharts research →0`, deteksi CI.
- 16 hari deadline polish ketahan shoot 1m — mitigasi MVP 4 grafik dulu (G2/G5/G7 masuk H15 jika sisa waktu), deteksi shoot dry-run juri 60s.

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/14-polish-visual` + task `01-web-visual.md` → `02-ipynb-output.md` → `03-pdf-dossier.md` + ritual 3Q + `design-taste-frontend` + `verification-loop` + `seith-pm` gate CHECK H14 MANDATORY → H15 quant Slice A
