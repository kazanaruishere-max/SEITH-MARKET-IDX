# Task 02 — Overview Dashboard, Adaptive Treemap & Anomaly Radar (Z2)

## Goal
Implementasi halaman utama `/` dengan Bloomberg Telemetry Deck 4-blok, Stock Treemap adaptif proporsional (area sektor ∝ bobot riil emiten, konten sel adaptif terhadap luas piksel), dan Anomaly Deviation Radar horizontal (-3σ s/d +3σ).

## Context
- SSOT: `docs/prd.md §4` + `docs/spec.md §2` + `docs/notes/00-readme.md`
- File: `apps/web/app/page.tsx`, `apps/web/components/Heatmap100.tsx`, `apps/web/components/TopLeaks.tsx`, `apps/web/components/MetricsTable.tsx`

## Scope In / Out
- In:
  - `page.tsx`: Telemetry deck 4 blok (`UNIVERSE COVERAGE 100`, `MEAN MISPRICING`, `ANOMALY ALERTS`, `PIPELINE STATUS`), Quick Sector Selector bar (`[ALL 100] [FINANCE 25]...`), modular 12-column cockpit grid.
  - `Heatmap100.tsx`: Global squarify per sektor (`FINANCE 25 > OTHER 15`). Di dalam sel: Adaptive Density berbasis dimensi piksel riil (besar = avatar + ticker + harga Rp + skor; sedang = ticker + skor; kecil = ticker; mikro = blok warna tanpa teks meluber).
  - `TopLeaks.tsx`: Horizontal anomaly meter (-3σ s/d +3σ) dengan garis tengah 0σ dan penanda ambang batas ±2σ berbasis skor Z riil.
  - `MetricsTable.tsx`: Tampilan metrik terstruktur institusional dengan pemisah tegas `Live Signal Metrics (Top-20)` vs `Synthetic Projection (52w) NOT REALIZED`.
- Out: Data mock / fiktif (semua angka 100% dari API `/api/v1/ranking`, `/api/v1/anomalies`, `/api/v1/backtest`).

## Verification
```powershell
pnpm --dir apps/web lint -> 0
pnpm --dir apps/web typecheck -> 0
Invoke-WebRequest http://localhost:3000/ -> 200 OK
```
