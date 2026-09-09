# Task 02 — Visual Spec (TopLeaks + BacktestChart + Metrics + Dossier 2-Page ID)

## Goal
Spesifikasi visual Bloomberg `#0B0E14` untuk hasil backtest real — `TopLeaks` Top5, `BacktestChart` recharts, `MetricsTable`, `ScoreBadge` stacked, dan `DossierPDF` 2-page 9-section ID profesional (bukan yapping, data real MI 20y).

## Context
- SSOT: `apps/web/tailwind.config.js` (Bloomberg `bg #0B0E14 card #11151F panel #1A1F2E border #27272a`, `mispricing low #ef4444 mid #fbbf24 high #10b981`, `JetBrains Mono`) + `apps/web/components/ScoreBadge.tsx 14L` + `RankingTable.tsx` (sort mispricingScore desc, empty `No data`) + `app/layout.tsx bg-[#0B0E14]` + `app/page.tsx hero static` + `app/ranking/page.tsx RSC fetchRanking` + `app/dossier/[ticker]/page.tsx` + `lib/api.ts:42L` + `research/backtest-100.json` contract (phase 09 02) + `crates/seith-core/src/scoring/calculator.rs: 30/20/30/20` + `kronos/chartPoints 400→20 T1.0 top_p0.9 vol ±2σ` + `anomaly |Z|>2` + `crates/seith-core/src/dossier.rs:29-39 Dossier {ticker,market,score,breakdown,peerComparison[5],kronos, research, degraded, disclaimer}` + `docs/research/money-leak-radar-thesis.md`
- Branch: `handoff/10-web-visual` — Z2 `apps/web` components + Z6 handoff — docs-only
- Skill: `skill://seith-market-intelligence` + `skill://design-taste-frontend` + `skill://no-ai-slop` Tier-1 + ritual 3Q
- Keputusan founder 2026-09-08: 2-page LOCK + peer rule `QV distance + cap band ±50%` + bahasa `ID` (market id default, disclaimer ID, persona IDX; EN toggle future `lang` param, bukan duplikat)

## Scope In / Out
In: Z2 `apps/web/components/TopLeaks.tsx + BacktestChart.tsx + MetricsTable.tsx + ScoreBadge.tsx stacked 30/20/30/20 + DossierPDF.tsx 2-page 9-section ID` spec + `app/page.tsx hero TopLeaks` + `app/dossier/[ticker]/page.tsx kronos.chartPoints line + peerComparison 5 + research memo tabs + disclaimer tiap view + Download PDF blob` — docs-only: no code, `recharts 2.12.7` installed 0 import → wired in spec + `@react-pdf/renderer 3.4.4` wired for DossierPDF
Out: Z1 crate logic (`dossier.rs to_pdf_bytes` upgrade deferred to H10-impl CLI fallback), Z3 `data/seith.db` write (phase 09), `apps/kronos-sidecar` no edit, `vendor/*` read-only, full `ValuationGapMap/Screener` deferred H7b

## Bagian — Surgical Breakdown
| Bag | File | Struktur | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `apps/web/components/TopLeaks.tsx` spec | `Top5 sort=anomaly pageSize=5 minZ2.0` hero on `app/page.tsx` — fetch `GET /api/v1/anomalies?market=id&minZ=2.0&pageSize=5&sort=anomaly` | `rank ticker market sector |Z| flag reason` table, `flag` red badge `|Z|>2`, `market toggle id/sg` isolated, `disclaimer` always, `fetchAnomalies` zod `AnomalyQuery` | `Glob TopLeaks` 1, `pnpm test` TopLeaks 5 |
| b | `apps/web/components/BacktestChart.tsx` spec | `recharts Line actual zinc #a1a1aa vs forecast amber dashed #fbbf24` + `Area ±2σ red 10% fillOpacity 0.1` + `capital vs IHSG fillBetween` | `chartPoints: Vec<Value>` (kronos 400 grey +20 amber) + `backtest.equity_curve` line, `ResponsiveContainer 100%` height 280, `Tooltip` ID | `grep recharts apps/web -r` → >0 (BacktestChart.tsx) |
| c | `apps/web/components/MetricsTable.tsx + ScoreBadge stacked` spec | `MetricsTable: Sharpe/maxDD/win rate/totalReturn/cumulative equity vs IHSG` + `ScoreBadge: 4 segmen 30ER/20|Z|/30QV/20SM stacked bar JetBrains Mono` + `degraded:true` amber banner | `Components {expected_return,anomaly_z,quality_value,sector_mom}` → stacked widths 30/20/30/20 + tooltip per segmen `ER: X%` | `cargo fmt` 0 |
| d | `apps/web/components/DossierPDF.tsx` spec (NEW — 2-page 9-section ID) | `@react-pdf/renderer 3.4.4` Document 2 Page A4 `size 612x792` Bloomberg dark header `#0B0E14` — Page1: sections 1-6, Page2: sections 7-9 — font `Helvetica/JetBrains Mono` embed | 9-section ID terstruktur (lihat Deliverables) — data real dari `Dossier` struct, visual chart SVG→PDF vector via `recharts` snapshot + `Area ±2σ`, peer table 5, disclaimer tiap footer `Bukan rekomendasi investasi` | `Glob DossierPDF` 1, `pnpm typecheck 0` |
| e | `apps/web/app/dossier/[ticker]/page.tsx` enh | `RSC fetchDossier(ticker,market,"json",lang=id)` + `upper+strip .JK` → gauge 0-100 + `breakdown stacked` + `peerComparison[5] per market` + `BacktestChart kronos.chartPoints 400→20` + `research fundamental/technical/synthesizer tabs ID` + `degraded` banner + `disclaimer` + `Download PDF → /dossier?format=pdf&lang=id blob` button | dossier `{ticker,score,breakdown,peer[5],kronos:{forecastReturn,volatility,chartPoints[20],volBand},research:{fundamentalMemo,technicalMemo,synthesizerMemo},degraded,disclaimer}` → visual 1:1 PDF web | `pnpm typecheck 0` |
| f | `Peer rule` spec (logic doc) | `same sector+market(Id)` wajib → `QV distance` terdekat (`ROE/margin/leverage/PE/PB` Euclidean vs median per market `sector_mom fallback50`) + filter `cap band ±50%` + tie-break `|Z| desc` — select 5 | Ticker BBCA FINANCE large-cap → peer BMRI/BBRI/BBNI/BBTN/MEGA (QV delta terkecil, bukan random/BUMI miner), tabel kolom `ticker/score/Z/QV/ROE gap vs median` + alasan `mengapa kompetitor A dipilih` | `grep peerComparison crates/seith-core -r` → Dossier.peer_comparison[5] |

## Deliverables + Acceptance — Dossier 2-Page 9-Section ID (MI 20y)
- **Page 1 — Intel:**
  1. **Cover** — `{ticker} {market} {sector} date as_of score 0-100 badge (low#ef4444 mid#fbbf24 high#10b981) + degraded amber if true + SCHEMA_VERSION x-schema-version + market lang=id` — header `#0B0E14`
  2. **Executive Intel — Mengapa ticker ini** — `rank # / TopLeak |Z|>2 reason + vol>2σ tanpa katalis ROE/margin` + `synthesizer_memo` 1-kalimat thesis ID (bukan yapping) — verifiable `derived insight` gate
  3. **Bukti Mispricing — Mengapa A=80 Mengapa B=40** — stacked bar `30ER(ER Kronos 400→20)/20(100-|Z|)/30QV(qv_percentile per market)/20SM(sector_mom per market)` vs `sector median per market` + `calc_z EPS` + `qv_percentile per market` — pakai `scoring/calculator.rs + components.rs`
  4. **Valuation Deep Dive** — `ROE/margin/leverage PE/PB Valuation` vs median FINANCE + `insufficient_data:true` flag + `normalize.rs: OHLC wajib else excluded/volume→0/median fallback + lookback≤512` + sparkline 400 actual zinc + 20 forecast amber + band vol ±2σ red 10%
  5. **Peer Benchmark — Mengapa Kompetitor A** — `5 peers same sector+market` rule `QV distance + cap±50% + |Z| tie-break` — tabel `ticker/score/Z/QV/ROE gap vs median` — narasi `BMRI dipilih vs BBCA karena FINANCE QV delta 2.1 (ROE gap 0.8pp, leverage mirip) + same large-cap; bukan BUMI karena ENERGY beda bisnis`
  6. **Radar Anomali (Money Leak)** — `flag |Z|>2 atau vol>2σ` + volume spike bar + `reason` + `excluded:[{ticker,reason}]` jika ada
- **Page 2 — Verifiability + Annex:**
  7. **Katalis & Risiko** — `Fund memo + Tech memo → Synth` ID tabs + `DISCLAIMER: dossier.rs:5 Bukan rekomendasi investasi` always footer tiap page
  8. **Metodologi & Verifiabilitas** — `Sectors Authorization /v2/daily/{symbol}/ + Valuation + Company Overview sector` source + `data/seith.db WAL busy_timeout 3000 TTL 86400/3600 key market:sector:ticker:date` + `Kronos-base 102.3M 512ctx 12B K-line 2508.02739v1.pdf T1.0 top_p0.9 y_timestamp=20` + `%PDF-1.4` lineage + `research/backtest-100.json as_of 2026-09-08`
  9. **Annex — Data Mentah 20 Baris + Credit Log + Ekuitas vs IHSG** — `OHLCV 20 terbaru` tabel + `credit ~200 OHLCV400+Valuation` + `backtest equity_curve vs IHSG cumulative (BacktestChart mini) + hit_rate/drawdown/sharpe/top5_forward_20d` dari `research/backtest-100.json` (H9)
- Visual di PDF: `ScoreBadge stacked 30/20/30/20` + `Line 400→20 actual vs forecast` + `Area ±2σ` + `Peer heatmap` — vector via `@react-pdf/renderer` `Svg/Line/Area` (chart snapshot SVG string), CLI fallback `dossier.rs to_pdf_bytes` tetap Helvetica multi-page text→table manual `ponytail: bitmap base64 PNG XObject ~30LOC → upgrade printpdf when need vector`
- Bahasa `ID` default, envelope `?lang=id|en` future toggle — LLM memo generate `ID` dulu, `EN` via translate later (bukan duplikat page)
- `fn<50` N/A docs-only, `gitleaks 0`, `cargo fmt --check 0 + clippy --all-targets 0 + cargo test 145 + pnpm lint/typecheck 0` no drift

## Verification
```
cargo fmt --check → 0 / cargo clippy --all-targets -- -D warnings → 0 / cargo test → 145 passed
pnpm --dir apps/web lint → 0 / pnpm --dir apps/web typecheck → 0
# future after impl:
# grep recharts apps/web -r → components/BacktestChart.tsx + DossierPDF.tsx
# Glob TopLeaks → components/TopLeaks.tsx / Glob DossierPDF → components/DossierPDF.tsx
# pnpm test → TopLeaks 5 + BacktestChart 3 + DossierPDF 2
gitleaks detect --no-git -v → 0 leak
grep SECTORS_API_KEY apps/web -r → 0
grep plotly apps/kronos-sidecar/pyproject.toml → 0
```

## Accountability Block — Task 02
- ✅ Terverifikasi: `cargo fmt 0 + clippy --all-targets 0 + test 145 + pnpm 0` no drift, `recharts 2.12.7 + @react-pdf/renderer 3.4.4` dead → spec wired (Line+Area±2σ + DossierPDF 2-page), TopLeaks gap closed
- ⚠️ Belum: component code — deferred to handoff/10-impl, `TopLeaks/DossierPDF` 0 until then
- 🔻 Risiko: `TopLeaks` tanpa `sort=anomaly` di `lib/api.ts` + `DossierPDF` tanpa `peerComparison[5]` real (QV+cap rule belum teruji) — mitigasi 01 api-contract + 02 peer rule doc first, deteksi `cargo test scoring/components`
- ♻️ Refactor: keep visual narrow DRY 01+03, `file200-400` future, `DossierPDF` single Document 2 Page (no split file)

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill WAJIB | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead T0 | opencode sini | `seith-market-intelligence` + `verification-loop` + `seith-phase-gate` | — | Understand→Plan→Document + verify visual+PDF |
| Founder | User | — | — | approve 2-page 9-section + peer QV+cap + ID LOCK |
| PM | `seith-pm` | `git-worktree-manager` + gate `fmt/clippy/test` | `seith-pm` | orkestrasi `handoff/10-web-visual` + veto if zone fail |
| Arsitek | `architect` | `senior-architect` | `architect` | SEBELUM 02 — audit 100 universe vs WAF 403 + Dossier struct |
| Designer FE | `design-taste-frontend` | `design-taste-frontend` + `no-ai-slop` | — | 02 visual spec + DossierPDF Bloomberg `#0B0E14` |
| Eksekutor | sub-agent (later) | `seith-market-intelligence` + `tdd-workflow` + `verification-loop` | `explore` | Implement later — currently docs-only |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | 02 visual verify Z1 no edit (dossier.rs observe) |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | verify no secret in `NEXT_PUBLIC_*`, Authorization not log, disclaimer always |
| Refactor | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | docs-only skip; implement phase gate |
| Doc | `doc-updater` | `remember`+`handoff`+`no-ai-slop` | `doc-updater` | sinkron apps/web design + dossier 9-section |

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/10-web-visual` + task `02-visual-spec.md` + `skill://design-taste-frontend` + ritual 3Q + `skill://no-ai-slop`
