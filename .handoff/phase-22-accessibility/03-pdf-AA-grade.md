# Task 03 — PDF AA-Grade

## Goal
`DossierPDF.tsx` 2-page A4 `595×792` vector 9-section AA-spec dense tabular — `Cover/Executive/3 memo/Mispricing 30/20/30/20/Valuation/Peer5/Anomali/Katalis/Metodologi/Annex` + `Kronos 400→20 Line+Area ±2σ` + `SCHEMA_VERSION 1.0.0` footer + `disclaimer tiap page` — not generic 1-page skeleton.

## Context
- SSOT: `AGENTS §6c no-ai-slop + design-taste-frontend` + `docs/api-spec §3 dossier 9-section` + `docs/kronos-notes 400→20 T1.0 top_p0.9 512ctx` + `research/backtest-100.json kronos chartPoints 20` + `apps/web/app/dossier/[ticker]/page.tsx 4 bars 30/20/30/20 + peer5 QV distance cap±50% + |Z| tie + 3 memo distinct` + `apps/web/components/DossierKronosChart.tsx honest` + `apps/web/components/DossierPDF.tsx @react-pdf/renderer` + `crates/seith-core/src/dossier.rs compose/to_pdf_bytes %PDF` + reference `https://artificialanalysis.ai/downloads/AA-Openness-Index-Spec_V1-0.pdf` AA density `methodology versioned tubular KPI + chart + annex`
- Dependensi: 02-data-factual-wiring done (3 memo distinct factual, `health db` honest)
- Branch: `handoff/22-accessibility` worktree `../seith-wt/handoff-22` — Z2 `apps/web` Z5 `docs`

## Scope In / Out
In: `apps/web/components/DossierPDF.tsx` (2p vector AA) + `apps/web/app/dossier/[ticker]/DossierClient.tsx` (dual download `PDFDownloadLink` + `downloadBlob pdf`) + `apps/web/app/dossier/[ticker]/page.tsx` if needed (memo wiring) + `crates/seith-core/src/dossier.rs` if `SCHEMA_VERSION` footer wiring + `apps/web/lib/api.ts` pdf blob
Out: `apps/kronos-sidecar` health (done 02), `vercel.json` (04), `AGENTS §10` (04), `sectors-client` live 25c (gated 22.5)

## Todo
- [ ] `todowrite in_progress` before; `completed` only after Verify hijau + Block

## Bagian — Surgical Breakdown
| Bag | File | Fn/Struct | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `apps/web/components/DossierPDF.tsx` | `DossierDoc` page1 | `Document + Font.register Inter/JetBrains Mono + Page A4 595×842 (A4, not Letter 612×792) padding 24 gap 12` sections `Cover ticker/market score 0-100 large + Executive 3 memo cards Fund/Tech/Synth distinct` `Mispricing 4 bars 30%ER/20% (100-|Z|)/30%QV/20%SM` + `Valuation QV percentile table ROE/margin/lev/PE/PB vs sector_median` | cover missing ticker |
| b | `apps/web/components/DossierPDF.tsx` | `DossierDoc` page1 cont | `Peer5 table ticker/score/market/sector/qvDistance + cap±50% badge + |Z| tie-break` `Anomali flag |Z|>2 vol>2σ badge + reason "z= + |vol>2σ"` `Kronos Line 400→20 amber dashed T1.0 top_p0.9 + Area ±2σ band volBand` vector not bitmap | peer empty |
| c | `apps/web/components/DossierPDF.tsx` | `DossierDoc` page2 | `Katalis pending QoQ note "catalyst check: not_available_yet — QoQ EPS history not in snapshot"` never `no EPS change` fake + `Metodologi Sectors /v2/daily Composite moka L1 <1ms SQLite WAL busy3000 TTL24h/1h key market:sector:ticker:date + Kronos 400→20 512ctx T1.0 top_p0.9 + 30/20/30/20 formula` `Annex peer JSON` `footer tiap page disclaimer "Bukan rekomendasi investasi. Informasi & analisis saja." + SCHEMA_VERSION 1.0.0 + as_of` | Metodologi generic prose |
| d | `apps/web/components/DossierPDF.tsx` | styles | `StyleSheet.create page bg #0B0E14 text zinc-300 header #11151F border #24242e rounded 6 shadow-card table tabular JetBrains Mono` Bloomberg tokens `Inter 800` AA density `4pt gap 6px padding` not generik Tailwind bento | style `bg-white` |
| e | `apps/web/app/dossier/[ticker]/DossierClient.tsx` | download | `PDFDownloadLink document={<DossierDoc ...>} fileName="SEITH-{ticker}-{market}-dossier.pdf"` + `downloadBlob` fallback `fetch /api/v1/tickers/:ticker/dossier?format=pdf` → blob `application/pdf` `a.click` + loading `downloading` state | download 404 |
| f | `apps/web/lib/api.ts` | pdf blob | `fetchDossier(ticker,market,"pdf") → blob` zod `envelope` strict `disclaimer` field present + client `DossierPDF` renders same Kronos Line+Area vector (both paths verified) | blob not PDF |

## Deliverables + Acceptance
- `curl /api/v1/tickers/BBCA/dossier?market=id&format=pdf -o /tmp/x.pdf && head -c 4 /tmp/x.pdf` → `%PDF` + `pdfinfo | grep Pages → 2` + `strings | grep -c disclaimer ≥2`
- Browser `Preview dossier BBCA → Download PDF` dual path works + `GET /dossier/BBCA → 4 bars + peer5 table 5 rows + 3 memo distinct cards + Kronos chart Line+Area`
- `pnpm lint 0 && typecheck 0 && build 4 routes` + `grep banned-words prose 0` (`delve/leverage/robust/cutting-edge` except financial `leverage`) + `no-ai-slop` pass
- `fn<50 file200-400 nesting≤4` `seith-design-reviewer` Bloomberg tokens `#0B0E14/#11151F/#1A1F2E` verified

## Verification
```
pnpm --dir apps/web lint → 0
pnpm --dir apps/web typecheck → 0
pnpm --dir apps/web build → 4 routes
curl -s "http://127.0.0.1:8181/api/v1/tickers/BBCA/dossier?market=id&format=pdf" -o /tmp/d.pdf && head -c 4 /tmp/d.pdf && echo "pdf ok"
curl -s "http://127.0.0.1:8181/api/v1/tickers/BBCA/dossier?market=id" | jq '.data.research | .fundamentalMemo[0:60], .technicalMemo[0:60]'
curl -s http://127.0.0.1:3000/dossier/BBCA | grep -c "Kronos 400" || echo "ssr check"
```

## Peran + Skill
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T1 | sub-agent | `seith-market-intelligence` + `seith-design` + `high-end-visual-design` + `no-ai-slop` | `seith-design-reviewer` + `seith-doc-reviewer` (prose) | Implement→Verify |

## Next
Task 04 Vercel deploy depends on 4 routes build + PDF `%PDF` header.
