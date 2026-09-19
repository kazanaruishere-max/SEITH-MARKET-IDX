# Task 04 — Security Description (DES) Dossier Sheet (Z2)

## Goal
Implementasi halaman riset ekuitas per emiten `/dossier/[ticker]` berstandar Bloomberg Security Description (`DES`): header banner institusional dengan link resmi `idx.co.id`, grafik koridor volatilitas Kronos 20-titik riil, matriks benchmark 5 peer sejenis, dan nota riset sintesis AI institusional (TradingAgents-Lite).

## Context
- SSOT: `docs/prd.md §4 Synthesized research & Comparative` + `docs/api-spec.md §3 GET /v1/tickers/:ticker/dossier`
- File: `apps/web/app/dossier/[ticker]/page.tsx`, `apps/web/components/DossierKronosChart.tsx`

## Scope In / Out
- In:
  - `page.tsx`: Banner DES emiten lengkap (Ticker, Nama Perseroan resmi, Sektor, Close Rp, Skor Mispricing, Rank), tombol export PDF vektor, matriks perbandingan 5 peer sejenis berbasis jarak Quality/Value (QV distance) dan band kapitalisasi ±50%, nota riset sintesis 3-agent (Fundamental, Technical, Synthesizer) berstempel model `nemotron-3.5-lightning:free`.
  - `DossierKronosChart.tsx`: Grafik koridor kuantitatif Kronos foundation model 20-titik proyeksi riil (garis amber putus-putus) dengan terowongan volatilitas `±2σ` (area shading transparan merah), tooltip interaktif IDR, dan status horison 400→20 hari bursa.
- Out: Perubahan backend dossier composer.

## Verification
```powershell
pnpm --dir apps/web lint -> 0
pnpm --dir apps/web typecheck -> 0
Invoke-WebRequest http://localhost:3000/dossier/BBCA -> 200 OK
```
