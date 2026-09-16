# Task 03 — PDF Dossier Bloomberg 9-Section (Z2)

## Goal
`DossierPDF.tsx` 9-section A4 vector `#0B0E14` — unlock ADES generik jadi Bloomberg: chart vector 400+20 + heatmap mini rects 100 + stacked real + lineage 296 credits — `design-taste-frontend` + `no-ai-slop` pass.

## Context
- SSOT: `apps/web/components/DossierPDF.tsx` 90 lines + `@react-pdf/renderer` vector + `crates/seith-core/src/dossier/*` + `research/backtest-100.json kronos 20` + `AGENTS §3c Z2 + §6c no-ai-slop Tier-1`
- Dependensi: 01 snapshot kronos 20 + web chart pattern
- Skill: `skill://seith-market-intelligence` + `skill://design-taste-frontend` + `skill://no-ai-slop` + `verification-loop`

## Scope In / Out
In: Z2 `DossierPDF.tsx` refactor (StyleSheet Helvetica 8pt, page `#0B0E14` card `#11151F` border `#27272a` h2 `amber #fbbf24 uppercase 9pt`) + 9 sections: 1 Cover ScoreBadge color `>70 emerald 40-70 amber <40 red` + 2 Exec Intel synth + 3 Mispricing stacked real (bukan dummy) + 4 Kronos chart vector Line 400→20 + Area ±2σ + 5 Peer 5 table + 6 Anomaly + 7 Katalis Fund/Tech/Synth ID + 8 Metodologi lineage + 9 Annex + heatmap mini 10×10 vector rects + `x-schema-version` footer + `no-ai-slop` scan
Out: ipynb (02), quant engine (H15)

## Todo (`todowrite` WAJIB — AGENTS §8d)
- [ ] Buka todo `in_progress` sebelum Implement; `completed` hanya setelah Verification hijau.

## Bagian — Surgical Breakdown
| Bag | Aksi | Acceptance | Test FAIL |
|---|---|---|---|
| a | Style token Bloomberg: `s.page #0B0E14 color #e4e4e7 padding 18 Helvetica 8` + `s.header #11151F` + `s.h2 9 #fbbf24 uppercase` + `ScoreBadgePDF 10` | `design-taste-frontend` audit pass | generik AI `cutting-edge` prose lolos |
| b | Bar real: `StackedPDF` pakai `b.{expected_return,anomaly_z,quality_value,sector_mom}` real `/100*width` bukan dummy 30/20/30/20 | LPPF 50.02/99.91/100/76.58 render proporsional | dummy flat lagi |
| c | Chart vector: `@react-pdf/renderer Svg` Line 400 actual `#a1a1aa` + 20 forecast `#fbbf24 dashed` + Area ±2σ `#ef4444 10%` dari `kronos.chartPoints` | ADES 2-page vector, not text | text `Sparkline zinc + amber dashed` lagi |
| d | Heatmap mini: 10×10 rects `100` cells color `score 0-100 red→amber→emerald` di Section 3/5 | 100 rects, no raster | no heatmap |
| e | Gate: `pnpm build 2 pages` + `no-ai-slop detect` prose PDF | `delve/leverage/robust` 0 | `Important to note` lolos |

## Deliverables + Acceptance
- `apps/web/components/DossierPDF.tsx` 9-section Bloomberg vector + `fn<50 file200-400` + `♻️ Refactor:` wajib

## Verification (paste output nyata — §8c)
```
pnpm --dir apps/web build → 4 routes + dossier pdf vector 2 pages
cargo fmt --check → 0 / cargo clippy → 0
grep -r SECTORS_API_KEY apps/web → 0
skill://no-ai-slop scan apps/web/components/DossierPDF.tsx → 0 banned
Invoke-WebRequest :20128/v1/models → 200 (NEVER kill)
```

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T2 pdf | sub-agent | `seith-market-intelligence` + `design-taste-frontend` + `no-ai-slop` + `verification-loop` | — | Implement→Verify 03 |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | no secret di pdf/log |

## Next Session Prompt
`skill://seith-market-intelligence` + `handoff/14` + `03-pdf-dossier.md` ritual 3Q → H15 quant Slice A → Freeze H6
