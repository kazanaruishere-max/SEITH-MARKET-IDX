# Task 03 — Journey Integration (hero → ranking → dossier 2-page → backtest → PDF)

## Goal
Spesifikasi integrasi journey web `hero TopLeaks → ranking 60s → dossier 2-page ID deep dive → backtest vs IHSG → PDF export` sebagai 40% usability — dossier 9-section data real (peer QV+cap, visual Line±2σ).

## Context
- SSOT: `apps/web/app/page.tsx` (hero static `Ranking →`), `app/ranking/page.tsx` (RSC fetchRanking SSOT, `market=id` default), `app/dossier/[ticker]/page.tsx` (RSC fetchDossier + `Download PDF → /dossier?format=pdf&lang=id`), `app/layout.tsx` (`bg-[#0B0E14]` + disclaimer `Bukan rekomendasi`), `lib/api.ts:42L fetchRanking/fetchDossier` + `components/DossierPDF.tsx 2-page 9-section spec (02)` + `envelope.rs + SCHEMA_VERSION 1.0.0` + `crates/seith-core/src/dossier.rs:29-39 Dossier` + `docs/prd.md §7 Journey 60s→dossier→PDF §8 Judging 40/30/30` + `docs/spec.md §2 Pipeline 8 gerbang §4 Scoring` + `phase-09 00-03` (backtest-100.json contract) + `phase-10 01 api-contract (lang=id peer[5]) + 02 visual-spec (9-section)`
- Branch: `handoff/10-web-visual` — Z2 `apps/web` journey + Z6 handoff — docs-only, keputusan founder 2026-09-08: 2-page LOCK + peer `QV+cap±50%` + bahasa `ID`
- Skill: `skill://seith-market-intelligence` + `skill://design-taste-frontend` + `skill://no-ai-slop` Tier-1 + ritual 3Q

## Scope In / Out
In: Z2 `apps/web/app/page.tsx hero TopLeaks Top5 + app/ranking/page.tsx 60s sortable (Mispricing desc |Z| tie-break, Anomaly desc) + app/dossier/[ticker]/page.tsx 2-page (gauge 0-100 + stacked 30/20/30/20 + peer5 QV+cap + kronos chartPoints 400→20 + research 3 tabs ID) + app/backtest/page.tsx (backtest equity vs IHSG + metrics) + components/DossierPDF.tsx 2-page PDF + lib/api.ts fetchRanking/fetchAnomalies/fetchBacktest/fetchDossier(lang) + next.config.js rewrites` + `@react-pdf/renderer 3.4.4` — docs-only: no code
Out: Z1 crate logic (`dossier.rs to_pdf_bytes` upgrade deferred to H10-impl), Z3 `data/seith.db` write (phase 09), `apps/kronos-sidecar` no edit, `vendor/*` read-only

## Bagian — Surgical Breakdown
| Bag | File | Struktur | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `apps/web/app/page.tsx` | hero `TopLeaks` Top5 `sort=anomaly pageSize=5 minZ2.0` + CTA `Lihat Ranking →` + `api/v1/health` link | `fetchAnomalies({market:id,minZ:2.0,pageSize:5,sort:"anomaly"})` RSC `cache:no-store` + error box red + `disclaimer Bukan rekomendasi tiap view` | `pnpm test` TopLeaks hero |
| b | `apps/web/app/ranking/page.tsx` | RSC `fetchRanking({market,sector,sort,order,page,pageSize,minZ})` sortable `mispricingScore desc` / `anomalyZ desc`, `RankingTable` + `ScoreBadge stacked 30/20/30/20` + `insufficient_data` amber icon + pagination `page/pageSize/total` | `searchParams market=id default, sector filter, sort toggle` — `Top5` highlight red `#ef4444` | `pnpm lint 0 + typecheck 0` |
| c | `apps/web/app/dossier/[ticker]/page.tsx` | RSC `fetchDossier(ticker,market,"json","id")` + `upper+strip .JK` → gauge 0-100 + `breakdown stacked 30/20/30/20` + `peerComparison[5] QV distance+cap±50% per market` tabel + `BacktestChart kronos.chartPoints 400→20 Line zinc/amber + Area ±2σ` + `research fundamental/technical/synthesizer tabs ID` + `degraded` amber banner + `disclaimer` + `Download PDF → /dossier?format=pdf&lang=id blob` + `DossierPDF preview` | dossier `{ticker,score,breakdown,peer[5],kronos:{forecastReturn,volatility,chartPoints[20],volBand},research:{fundamentalMemo,technicalMemo,synthesizerMemo ID},degraded,disclaimer}` → visual 1:1 web vs PDF 2-page | `pnpm typecheck 0` |
| d | `apps/web/app/backtest/page.tsx` | new route `GET /api/v1/backtest?market=id` → `research/backtest-100.json {as_of,universe:100,items[100],metrics:{hit_rate,drawdown,sharpe,top5_forward_20d},equity_curve vs IHSG}` → `BacktestChart Area capital vs IHSG` + `MetricsTable Sharpe/maxDD/winRate` | web `hasil akhir dari backtest` — data real `Authorization /v2/daily/{symbol}/` + `SEITH-MARKET-IDX memo ID` | `pnpm test` backtest |
| e | `apps/web/components/DossierPDF.tsx` | `@react-pdf/renderer Document 2 Page A4 612x792 Bloomberg #0B0E14` — Page1 sections 1-6, Page2 sections 7-9 — `Helvetica/JetBrains Mono` — chart `Svg Line 400 grey +20 amber dashed + Area ±2σ red 10%` | 9-section ID (Cover/Executive/Bukti/Valuation/Peer/Anomali ll Page1 + Katalis/Metodologi/Annex Page2) + footer `Bukan rekomendasi + SCHEMA_VERSION + x-schema-version` tiap page + peer `QV+cap` reason | `Glob DossierPDF` 1 / `pnpm typecheck 0` |
| f | `apps/web/lib/api.ts` + `next.config.js` | `fetchRanking + fetchAnomalies + fetchBacktest + fetchDossier(ticker,{market,format,lang})` zod `RankingQuery/AnomalyQuery/BacktestQuery/DossierQuery(lang)+peer[5]` + `next.config.js rewrites: [{source:'/api/v1/:path*', destination:'http://localhost:8181/api/v1/:path*'}]` + `NEXT_PUBLIC_API_BASE` prod | `baseUrl()=process.env.NEXT_PUBLIC_API_BASE ?? ""` + `fetchEnvelope + x-schema-version` + `lang=id default` + `grep SECTORS_API_KEY apps/web -r → 0` | `pnpm build` no 404 without env / `pnpm test` 6 cases |

## Deliverables + Acceptance
- Journey `hero TopLeaks → ranking 60s → dossier 2-page ID deep dive → backtest equity vs IHSG → PDF 9-section export` spec — docs-only, no code
- Dossier 2-page 9-section ID: Page1 `Cover/Executive/Mispricing/Valuation/Peer QV+cap±50%/Anomali` + Page2 `Katalis/Risk Metodologi/Annex 20 rows+credit+equity` — peer `BMRI vs BBCA QV delta`, visual `Line 400→20 + Area ±2σ` vector, disclaimer tiap footer
- `pnpm lint 0 typecheck 0` no drift (prove), `gitleaks 0` (`NEXT_PUBLIC_API_BASE` only, no `SECTORS_API_KEY` in web), `cargo fmt --check 0 + clippy --all-targets 0 + cargo test 145 + uv 17` no drift + `DossierPDF` consumes `peer[5]`
- 40% usability: `60s ranking → deep dossier 2-page → export PDF` story beats + Bloomberg dark `#0B0E14/#11151F` + `JetBrains Mono` numbers — `design-taste-frontend` + `no-ai-slop` + `lang=id` (EN future `?lang=en` toggle)
- Constraint: docs-only, no `apps/kronos-sidecar` edit (`grep plotly →0`), no `dossier.rs` edit yet (deferred to H10-impl `ponytail: bitmap PNG XObject → printpdf vector`)

## Verification
```
cargo fmt --check → 0 / cargo clippy --all-targets -- -D warnings → 0 / cargo test → 145 passed / uv --project apps/analysis run pytest -q --cov → 17 passed 96%
pnpm --dir apps/web lint → 0 / pnpm --dir apps/web typecheck → 0 / pnpm --dir apps/web test → pending (after impl, TopLeaks + BacktestChart + DossierPDF)
grep -r SECTORS_API_KEY apps/web → 0
grep -r plotly apps/kronos-sidecar/pyproject.toml → 0
grep -r "peerComparison" crates/seith-core/src/dossier.rs → 1
gitleaks detect --no-git -v → 0
# future after impl:
# curl http://localhost:8181/api/v1/tickers/BBCA/dossier?format=json&lang=id → 200 peer[5] QV+cap
# curl http://localhost:8181/api/v1/tickers/BBCA/dossier?format=pdf&lang=id → 200 %PDF-1.4 2 pages
```

## Accountability Block — Task 03
- ✅ Terverifikasi: `cargo fmt 0 + clippy --all-targets 0 + test 145 + pnpm 0` no drift, journey `hero→ranking→dossier 2-page 9-section→backtest→PDF` spec covers `apps/web` all routes + `DossierPDF` + `lang=id`
- ⚠️ Belum: journey code + `DossierPDF` + `next.config.js` — deferred to handoff/10-impl, `recharts/@react-pdf` 0 import until then
- 🔻 Risiko: `recharts` installed 0 import + `DossierPDF` peer[5] real QV+cap belum teruji — mitigasi 02 peer rule doc + 03 journey doc first, deteksi `cargo test scoring/components` + `pnpm test DossierPDF`
- ♻️ Refactor: keep journey narrow DRY 01+02, `DossierPDF` single Document 2 Page (no split file), `file200-400`

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill WAJIB | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead T0 | opencode sini | `seith-market-intelligence` + `verification-loop` + `seith-phase-gate` | — | Understand→Plan→Document + verify journey+PDF |
| Founder | User | — | — | approve hero TopLeaks + dossier 2-page 9-section + ID LOCK |
| PM | `seith-pm` | `git-worktree-manager` + gate `fmt/clippy/test` | `seith-pm` | orkestrasi `handoff/10-web-visual` + veto if zone fail |
| Arsitek | `architect` | `senior-architect` | `architect` | SEBELUM 03 — audit journey + Dossier struct |
| Designer FE | `design-taste-frontend` | `design-taste-frontend` + `no-ai-slop` | — | 03 journey + DossierPDF Bloomberg `#0B0E14` |
| Eksekutor | sub-agent (later) | `seith-market-intelligence` + `tdd-workflow` + `verification-loop` | `explore` | Implement later — currently docs-only |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | 03 journey verify Z1 no edit (dossier.rs observe) |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | verify no secret in `NEXT_PUBLIC_*`, Authorization not log, disclaimer always |
| Refactor | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | docs-only skip; implement phase gate |
| Doc | `doc-updater` | `remember`+`handoff`+`no-ai-slop` | `doc-updater` | sinkron apps/web journey + dossier 9-section |

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/10-web-visual` + task `03-journey-integration.md` + ritual 3Q + `skill://design-taste-frontend` + `skill://no-ai-slop`
