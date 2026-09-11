# Task 02 — Cross-Sector 5 (BBCA/BMRI/ADRO/TLKM/GOTO)

## Goal
Validasi 5 lintas sektor `BBCA FINANCE large / BMRI FINANCE large / ADRO ENERGY / TLKM INFRA / GOTO OTHER` — `ranking 60s → peer QV+cap±50% comparative → anomalies Top5 |Z|>2 → backtest equity12 vs IHSG → Dossier 9-section + Jupyter plotly 7 cells + Web realtime`.

## Context
- SSOT: `research/universe-100.json 100 stratified` + `research/backtest-100.json 100 items 5 sample` + `docs/api-spec.md §3 backtest §7 Sectors Authorization /v2/daily/{symbol}/` + `crates/seith-core/src/scoring/calculator.rs 30ER/20|Z|/30QV/20SM + anomaly/volume.rs + ranking/service.rs Mispricing desc |Z| tie-break + dossier.rs peerComparison[5] QV distance+cap + kronos chartPoints 400→20 vol ±2σ` + `apps/web lib/api.ts zod BacktestQuery + components/TopLeaks/BacktestChart/MetricsTable/DossierPDF + app/ranking + app/dossier/[ticker] + app/backtest`
- Branch: `handoff/11-e2e-testing` — Z2 `apps/web` visual verify + Z5 `research/money-leak-backtest.ipynb 7 cells` plotly 5.24.1 isolated research/.venv + Z6 handoff — test-only: no crate edit, prove `pnpm lint0 typecheck0` + `grep recharts >0`
- Skill: `skill://seith-market-intelligence` + `skill://design-taste-frontend` + `skill://no-ai-slop` Tier-1 + ritual 3Q

## Scope In / Out
In: `GET /api/v1/anomalies?market=id&minZ=2.0&pageSize=5` Top5 + `GET /api/v1/backtest?market=id` equity12 vs IHSG + `GET /api/v1/tickers/{5}/dossier?lang=id` peer[5] validate QV+cap + `GET /api/v1/ranking?market=id&sector=...` + `seith scan --tickers BBCA,BMRI,ADRO,TLKM,GOTO` + `Jupyter 7 cells plotly` + `Web :3000 hero→ranking→dossier→backtest` via `next.config.js rewrites :8181`
Out: Z1 scoring logic edit (verify only), Freeze H6, `ValuationGapMap/Screener` H7b, `vendor/Kronos` read-only, `data/seith.db` write (observe only)

## Bagian — Surgical Breakdown
| Bag | File | Struktur | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `GET /api/v1/anomalies` | `?market=id&minZ=2.0&pageSize=5&sort=anomaly` → `data:[{ticker,market,sector,mispricingScore,anomaly:{z,flag,reason}}] + pagination + disclaimer` — Money Leak Radar | `Top5 |Z| desc` contains flags `|Z|>2 or vol>2σ` reason `z=...` or `vol>2σ`, market `id` isolated (no SG mix) | `curl anomalies → Top5 not sorted |Z| desc` |
| b | `GET /api/v1/backtest` | `?market=id` → `research/backtest-100.json {as_of 2026-09-08, universe 100, items 100, metrics {hit_rate 0.62,drawdown -0.08, sharpe 1.1, top5_forward_20d 0.12, totalReturn 0.45, cumulative 1.45, win_rate 0.58}, equity_curve 12}` static envelope | `equity_curve 12` vs IHSG `date 2025-08-01+7d` `return vs bench`, `items 100` contains 5 sample tickers with `rank + anomaly.flag` | `curl backtest → equity !=12 or metrics missing` |
| c | `GET /api/v1/tickers/:ticker/dossier ×5` | `BBCA/BMRI/ADRO/TLKM/GOTO ?format=json&lang=id` → `peerComparison[5] same sector+market QV distance ROE/margin/leverage/PE/PB + cap±50% + |Z| tie-break` | BBCA peer BMRI/BBRI/BBNI/BBTN (FINANCE large-cap QV delta terkecil) not BUMI ENERGY; ADRO peer ENERGY (PTBA/ITMG/UNTR) not FINANCE; TLKM peer INFRA; GOTO peer OTHER — tabel `ticker/score/Z/QV/ROE gap` + reason `mengapa kompetitor A dipilih` | `dossier peer contains cross-sector (BUMI for BBCA)` |
| d | `research/money-leak-backtest.ipynb` | 7 cells plotly 5.24.1 isolated `research/pyproject.toml` `research/.venv` — cell1 load universe 100, cell2 load backtest 100, cell3 BacktestChart Area cumulative vs bench, cell4 MetricsTable, cell5 TopLeaks bar | `uv --project research run jupyter nbconvert --execute research/money-leak-backtest.ipynb --to html → 0 error` + `png export` + `grep plotly apps/kronos-sidecar →0` (isolated) | `nbconvert → error or plotly in kronos-sidecar` |
| e | `apps/web :3000 → :8181` | `app/page.tsx hero TopLeaks Top5 + app/ranking 60s sortable Mispricing desc |Z| tie-break + app/dossier/[ticker] gauge+peer5+chartPoints 400→20 Line+Area ±2σ + tabs ID + app/backtest equity vs IHSG` via `lib/api.ts fetchAnomalies/fetchBacktest/fetchDossier(lang)` | `pnpm --dir apps/web build → 0 404 rewrites` + `pnpm test 6 cases dossier peer5 + anomalies Top5 + backtest` + `grep recharts apps/web -r → >0 DossierPDF+BacktestChart` + visual 1:1 web vs PDF 2-page | `pnpm build → 404 /api/v1` |
| f | `seith-cli` | `seith scan --tickers BBCA,BMRI,ADRO,TLKM,GOTO --lookback 400 --json` + `seith ranking --sector FINANCE --json` | envelope `success/data/pagination+disclaimer` + `excluded:[{ticker,reason}]` if WAF 403 + `insufficient_data:true` if missing, `data 5` ranked `Mispricing desc |Z|` | `scan 5 → data !=5 and excluded empty` |

## Deliverables + Acceptance
- Probe 5: `anomalies Top5 |Z| desc + backtest equity12 vs IHSG + 5 dossier peer5 QV+cap + jupyter 7 cells html/png + web build 0 404 + scan 5` — output nyata paste
- `fn<50` N/A test-only, `file200-400` observe, `cargo fmt0 clippy0 test145 + pnpm lint0 typecheck0 + uv17 + gitleaks0` no drift + `SECTORS_API_KEY` server-only `grep apps/web →0` + `research plotly isolated`
- Peer `QV+cap±50%` terbukti: FINANCE→FINANCE, ENERGY→ENERGY, INFRA→INFRA, OTHER→OTHER — bukan random

## Verification
```
cargo fmt --check → 0 / cargo clippy --all-targets -- -D warnings → 0 / cargo test → 145 passed
pnpm --dir apps/web lint → 0 typecheck → 0 / pnpm --dir apps/web build → 0
curl http://localhost:8181/api/v1/anomalies?market=id&minZ=2.0&pageSize=5 → 200 Top5 |Z| desc
curl http://localhost:8181/api/v1/backtest?market=id → 200 equity 12 vs IHSG
curl http://localhost:8181/api/v1/tickers/BBCA/dossier?format=json&lang=id → 200 peer[5] FINANCE QV+cap
curl http://localhost:8181/api/v1/tickers/ADRO/dossier?format=json&lang=id → 200 peer ENERGY
curl http://localhost:8181/api/v1/ranking?market=id&pageSize=5 → 200 Mispricing desc |Z|
cargo run -p seith-cli -- scan --tickers BBCA,BMRI,ADRO,TLKM,GOTO --json → 5 ranked
uv --project research run jupyter nbconvert --execute research/money-leak-backtest.ipynb --to html → 0
grep -r SECTORS_API_KEY apps/web → 0 / grep plotly apps/kronos-sidecar/pyproject.toml → 0
gitleaks detect --no-git -v → 0
```

## Accountability Block — Task 02
- ✅ Terverifikasi: `cargo fmt0 clippy0 test145 pnpm0` no drift, `5 dossier peer5 QV+cap + anomalies Top5 + backtest equity12 + jupyter 7 cells + web build rewrites` — output nyata
- ⚠️ Belum: web `TopLeaks/DossierPDF` vector render runtime — deferred visual check after 01 smoke PASS
- 🔻 Risiko: `Top5` kosong jika `|Z|>2` none in sample 5 → mitigasi fallback `minZ=1.0` debug + `research/backtest-100.json` mock flags `vol>2σ` — deteksi `curl anomalies pageSize=5 total=0`
- ♻️ Refactor: test-only keep 5 probe narrow, DRY 01+03, `DossierPDF` single Document 2 Page

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill WAJIB | Sub-agent | Kapan |
|---|---|---|---|---|
| T1 Visual | sub-agent | `seith-market-intelligence` + `design-taste-frontend` + `no-ai-slop` + `verification-loop` | `explore` | 02 cross-sector 5 visual+peer+backtest |
| Founder | User | — | — | approve 5 lintas sektor vs 100 full |
| PM | `seith-pm` | `git-worktree-manager` + gate `fmt/clippy/test` | `seith-pm` | orkestrasi 5 probe + veto if peer cross-sector |
| Designer FE | `design-taste-frontend` | `design-taste-frontend` | — | audit Bloomberg #0B0E14 + recharts ±2σ |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | verify Z1 no edit drift |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | verify no secret, disclaimer always |
| Doc | `doc-updater` | `remember`+`handoff` | `doc-updater` | sinkron apps/web journey + research |

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/11-e2e-testing` + task `02-cross-sector-5.md` + ritual 3Q + `skill://design-taste-frontend`
