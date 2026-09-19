# Task 03 — Screener Ranking Grid & Dual Factor Panels (Z2)

## Goal
Implementasi halaman screener `/ranking` ala TradingView Screener: tabel data densitas tinggi dengan sticky header, bar dekomposisi 4 pilar kuantitatif, status cleansing transparan (`EXCLUDED // REASON`), serta dual visual panels (`StackedTop20` & `ScatterERvsZ`).

## Context
- SSOT: `docs/api-spec.md §3 GET /v1/ranking` + `apps/web/components/RankingTable.tsx`
- File: `apps/web/app/ranking/page.tsx`, `apps/web/components/RankingTable.tsx`, `apps/web/components/ScoreBadge.tsx`, `apps/web/components/StackedTop20.tsx`, `apps/web/components/ScatterERvsZ.tsx`

## Scope In / Out
- In:
  - `RankingTable.tsx`: Tabel data terminal padat, monospace tabular-nums rata kanan untuk angka Close Rp & Skor, dekomposisi 4 pilar visual, status badge `ALERT !Z` atau `EXCLUDED // REASON` transparan.
  - `ScoreBadge.tsx`: Badge skor tajam terminal (`rounded-[2px]`, border crisp `#1E2638`, palet gelap terkalibrasi).
  - `StackedTop20.tsx`: Visualisasi stacked factor decomposition (30% ER / 20% |Z| / 30% QV / 20% SM) untuk 20 emiten teratas.
  - `ScatterERvsZ.tsx`: Scatter plot korelasi multi-faktor antara Kronos Expected Return vs |Z| Anomaly Deviation dengan quadrant crosshair.
  - `ranking/page.tsx`: Screener toolbar terminal style dengan tombol sektor tajam, toggle sorting, dan server pagination.
- Out: Perubahan schema ranking backend.

## Verification
```powershell
pnpm --dir apps/web lint -> 0
pnpm --dir apps/web typecheck -> 0
Invoke-WebRequest http://localhost:3000/ranking -> 200 OK
```
