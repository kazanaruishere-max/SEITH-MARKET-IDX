# Design Spec — SEITH (Bloomberg Dark + Taste)

Skill: `design-taste-frontend` wajib di H00a & H5. Estetika Bloomberg — bukan dashboard generik.

## 1. Principles
- Explainable 60s: ranking paham dalam 60 detik; score breakdown selalu terlihat (stacked bar 4 komponen).
- Data-dense, zero chrome: panel border-zinc-800, no gradient, table row 32px, monospace angka.
- Derived insight first: raw hanya di tooltip/detail, primary view = Mispricing 0-100 + flag.
- Disclaimer sticky: `Bukan rekomendasi investasi` di footer tiap insight view.

## 2. IA & Flows
- `/` Landing: hero Bloomberg (ticker tape) + ranking preview Top 10 + CTA `Lihat Ranking` + market toggle `IDX|SG`.
- `/ranking` Ranking: filter sector (select) + sort `mispricing|anomaly` + market toggle + table virtualized + pagination 20 + badge degraded/insufficient.
- `/dossier/[ticker]` Dossier 1-page: header ticker+sector+market+score 0-100 (large), breakdown BarStack, Kronos Line (forecast vs actual + Z-band ±2σ), peer table 5, research memo 3-paragraph (Fund/Tech/Synth via 9router), disclaimer, Export PDF button.
- `/anomalies` Anomalies: table `|Z|>2` sort desc + sparkline.
- CLI parity: `seith ranking --sector FINANCE --market sg --json` ≡ `GET /ranking?market=sg`.

## 3. Wireframe Low-fi
- Figma: `research/figma-link.md` placeholder. v0 prompt: `Bloomberg Terminal dark, data table dense, amber mispricing`. H00a low-fi hand-drawn cukup; H5 hi-fi via taste skill.

## 4. Design Tokens (Bloomberg Dark)
- Background: `#0B0E14` (canvas), `#11151F` (card), `#1A1F2E` (panel)
- Border: `zinc-800 (#27272a)`, `zinc-700`
- Text: `zinc-100` primary, `zinc-400` muted, `amber-400` mispricing, `emerald-500` QV, `red-500` anomaly
- Mispricing gradient 0-100: HSL `0 (red, 0) → 120 (green, 100)` via `hsl(${score*1.2}, 80%, 50%)`
- Font: `JetBrains Mono` angka (score, OHLC), `Inter` body, size 12/14 table, 24/32 score hero
- Spacing: 8pt base (`4,8,16,24`), radius `6px`, shadow `none` (Bloomberg flat)
- Taste audit: no generic purple gradient, strict pre-flight via `skill://design-taste-frontend`.

## 5. Component Map (shadcn)
- `Card` (ranking row, dossier panel), `Badge` (anomalyFlag red, insufficient amber, degraded zinc), `Table` (virtualized `@tanstack/react-virtual` 900 rows), `Tabs` (market Id/Sg), `Select` (sector), `Skeleton` (ranking loading), `EmptyState` (no data), `Button` (Export PDF), `Tooltip` (raw PE/PB on hover), `Toaster` (degraded).

## 6. Data Viz & Table Spec (recharts locked)
- **BarStack Score Breakdown:** `recharts BarChart stacked` 4 segmen (ER amber, |Z| zinc, QV emerald, SectorMom blue) height 12px per row ranking, 32px dossier.
- **Kronos Line:** `LineChart` 2 lines `actual close` (zinc-100) vs `forecast` (amber dashed) + `Area` Z-band `±2σ` (red 10% opacity). X timestamp, Y price. Tooltip show Z value.
- **Peer Table:** 5 rows, columns ticker | score | QV | ER | flag. Sort by score desc. Virtualized.
- Recharts props: `ResponsiveContainer width 100% height 200`, `CartesianGrid stroke #27272a`, `Tooltip contentStyle #11151F`.

## 7. States
- Loading: `Skeleton` table 10 rows shimmer.
- Empty: `No tickers for sector FINANCE` + CTA clear filter.
- Error: `502 UPSTREAM_ERROR` banner + retry.
- Degraded: `badge degraded:true` (Kronos/9router down) + tooltip `forecast 0 fallback`.
- Insufficient: `badge insufficient_data` amber + footnote `rasio pakai median sektor`.

## 8. Responsive & A11y
- Breakpoints: `360 (mobile table → card stack), 768, 1024, 1440` (desktop dense).
- WCAG AA: amber `#fbbf24` on `#0B0E14` contrast 7.2:1 pass; red `#ef4444` on dark pass. Keyboard nav table (arrow + enter dossier).
- Focus ring `amber-400` 2px.

## 9. PDF Dossier Layout 1-Page (web react-to-pdf)
- `@react-pdf/renderer` or `react-to-pdf` in `apps/web` — **bukan Rust printpdf** (ADR 0001). Render dossier component → PDF `A4` 1-page: header (logo SEITH + ticker + score 0-100 large + disclaimer), BarStack breakdown, Kronos chart (static SVG), peer table 5, 3 memos (Fund/Tech/Synth), footer disclaimer. Reuse component, no Rust bloat. CLI `seith dossier BBCA --pdf` proxy to `GET /api/v1/tickers/BBCA/dossier?format=pdf` (web renderer or Axum proxy).

## 10. Perf & SEO
- Perf: ranking `<2s` cached (L1 <1ms, L2 ~2ms) → skeleton immediate, ISR 1h. Dossier `<8s` (Kronos 30s timeout + 9router 15s). Bundle `recharts ~120KB` acceptable H5 velocity over visx custom.
- SEO: `next/metadata` per page `title: SEITH | Ranking IDX`, `description: Mispricing Score 0-100`.
- Taste gate: H5 run `skill design-taste-frontend` audit before merge — fail if contrast <4.5:1 or mispricing gradient not HSL.
