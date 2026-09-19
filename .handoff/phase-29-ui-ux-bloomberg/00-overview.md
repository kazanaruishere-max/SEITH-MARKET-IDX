# Phase 29 — Bloomberg × TradingView Terminal UI/UX Overhaul — Overview

## Goal
Merombak antarmuka web SEITH (`apps/web`) menjadi **Bloomberg Terminal × TradingView Financial Grade** dengan visual grafik kaya (global weighted treemap, anomaly deviation radar, multi-factor scatter, Kronos quant corridor, dan Strategy Tester curve), layout proporsional & responsif (mobile & desktop), serta **KEPATUHAN 100% PADA DATA NYATA DAN FAKTA (ZERO FABRIKASI)**.

## Context
- SSOT: `AGENTS.md §3c (Seven Zones: Zona 2 apps/web)` + `docs/prd.md §4 (Derived) & §8 (40% Usability)` + `docs/api-spec.md §3b` + `docs/notes/00-readme.md`
- Branch: `handoff/29-ui-ux-bloomberg` dari `main 8ad94a0`
- Skills loaded: `design-taste-frontend` + `no-ai-slop` + `verification-loop`
- Design Read: *Financial Intelligence Terminal for technical analysts, Bloomberg Terminal × TradingView language, Visual Density 8, Sharp Industrial Radii (rounded-[4px] s/d rounded-[6px]), High-Contrast Tabular JetBrains Mono.*

## Hard Rules (Integritas Data & Kualitas)
1. **ZERO FABRIKASI**: Semua angka, ticker, harga close Rp, skor, rank, komponen, z-score, dan metrik wajib bersumber langsung dari response API `/api/v1/*` dan `research/backtest-100.json`. Dilarang mengarang persentase fiktif, berita palsu, atau data dummy.
2. **Proporsionalitas Visual**:
   - Treemap: rasio luas sektor proporsional dengan bobot/jumlah emiten riil (`FINANCE 25 > OTHER 15`). Sel emiten adaptif berbasis dimensi riil (besar menampilkan avatar+ticker+harga+skor, sedang ticker+skor, kecil ticker saja).
   - Layout Grid: Ketinggian modular seimbang antara kolom kiri (Treemap) dan kolom kanan (Radar + Metrics) di desktop.
   - Responsif: Beradaptasi elegan dari mobile (<768px: single-column stack, scroll horizontal pada tabel data) hingga widescreen desktop (1080p/1440p: 12-col cockpit density).
3. **Anti-AI Slop & Anti-Generik**:
   - Hapus pill bulat generik (`rounded-full`) berlebihan, ganti dengan terminal badges tajam (`rounded-[4px]`, border crisp `#232B3E`).
   - Monospace tabular (`tabular-nums font-mono`) rata kanan untuk seluruh angka finansial.
   - Disclaimer wajib di setiap tampilan: `Bukan rekomendasi investasi. Informasi & analisis saja.`
4. **Zona 2 Terisolasi**: Perubahan hanya di `apps/web/*`. Dilarang menyentuh Rust core, Python sidecar, atau skema API.

## Scope In / Out
- **In**:
  - `apps/web/app/globals.css`: Token warna Bloomberg Obsidian/Slate/Amber/Emerald/Red, utilities sharp terminal, scrollbar industrial.
  - `apps/web/app/layout.tsx`: Real ticker tape bar + Bloomberg command header + Quick Ticker jump input + status telemetri.
  - `apps/web/app/page.tsx`: Bloomberg telemetry cards + responsive 12-col layout + Top 10 leader table preview.
  - `apps/web/components/Heatmap100.tsx`: Adaptive density treemap, aspect ratio terjaga, proporsi sektor 100% fakta.
  - `apps/web/components/TopLeaks.tsx`: Anomaly deviation horizontal meter (-3σ s/d +3σ) berbasis z-score riil.
  - `apps/web/components/MetricsTable.tsx`: Panel metrik terstruktur institusional, pemisah tegas Live Signal vs Proyeksi Sintetis.
  - `apps/web/components/RankingTable.tsx`: TradingView screener grid, stacked micro-bars 4 pilar riil, instant search filter, status badge tajam.
  - `apps/web/app/ranking/page.tsx`: Toolbar screener multi-sektor + dual quant visual panels (Stacked Top-20 + Scatter ER vs |Z|).
  - `apps/web/app/dossier/[ticker]/page.tsx` & `DossierKronosChart.tsx`: Bloomberg DES security description sheet + quant corridor 20-titik riil.
  - `apps/web/app/backtest/page.tsx` & `BacktestChart.tsx`: TradingView strategy tester performance curve 52-minggu riil vs IHSG benchmark.
- **Out**:
  - Backend Rust / sidecar Python / SQLite schema / API endpoints (tetap utuh).

## Hasil Audit & Hardening (code-reviewer & security-reviewer)

1. **Zero Data Fabrication (`DossierKronosChart`)**:
   - Jika `chartPoints` kosong atau inferensi Kronos tidak tersedia, komponen menampilkan banner `DEGRADED / NO INFERENCE DATA`.
   - Fallback 20 titik flat sintetis dihapus total untuk menjamin integritas data (zero fabrication).

2. **Routing & Navigasi**:
   - Seluruh tautan internal di `apps/web` (`<a>`) dimigrasikan ke Next.js `<Link>`.
   - Navigasi antar-halaman berjalan instan via client-side routing tanpa full page reload.

3. **Aksesibilitas (a11y)**:
   - `Heatmap100`: Sel kecil dilengkapi elemen `<span className="sr-only">` dan atribut `aria-label` lengkap (ticker, nama emiten, harga, skor) untuk screen reader.
   - `RankingTable`: Header kolom tabel memakai `scope="col"` pada setiap elemen `<th>`, dan kontainer tabel diberi `aria-label="Tabel Ranking Emiten IDX"`.

4. **Keamanan & Validasi Input**:
   - `QuickSearch`: Validasi ticker ketat via regex `^[A-Z0-9]{1,6}$` dan pembatasan input `maxLength={6}` untuk mencegah malformed parameter / path traversal client-side.
   - `companyProfiles`: Lookup profil emiten menggunakan `Object.hasOwn(companyProfiles, ticker)` untuk mencegah prototype pollution.
   - `DossierClient`: Error handling eksplisit dengan boundary state, dan pembentukan query URL via `URLSearchParams`.
   - `fetchEnvelope`: Pengecekan HTTP status eksplisit (`res.ok`) sebelum parsing payload JSON envelope.

## Tasks Breakdown
| # | Task | Scope | Status |
|---|---|---|---|
| 01 | Global Styles & Shell | `globals.css` + `layout.tsx` (Real ticker tape + Terminal Header) | pending |
| 02 | Overview Terminal Dashboard | `page.tsx` + `Heatmap100.tsx` (Adaptive) + `TopLeaks.tsx` | pending |
| 03 | Screener Ranking Grid | `ranking/page.tsx` + `RankingTable.tsx` + `ScoreBadge.tsx` | pending |
| 04 | Dossier Security Description (DES) | `dossier/[ticker]/page.tsx` + `DossierKronosChart.tsx` | pending |
| 05 | Strategy Backtest Tester | `backtest/page.tsx` + `BacktestChart.tsx` | pending |
| 06 | Verification & Quality Gate | `pnpm lint`, `typecheck`, `test`, `build` -> PR tanpa freeze | pending |

## Definition of Done (DoD)
1. `pnpm --dir apps/web lint` -> 0 errors.
2. `pnpm --dir apps/web typecheck` -> 0 errors.
3. `pnpm --dir apps/web test` -> pass.
4. `pnpm --dir apps/web build` -> 6/6 routes pass.
5. 100% data riil & fakta (no placeholder percentages/prices).
6. Tampilan responsif di mobile (375px) dan desktop (1440px).
