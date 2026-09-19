# Task 01 — Terminal Shell & Real Data Ticker Strip (Z2)

## Goal
Implementasi shell antarmuka Bloomberg Terminal × TradingView dengan Ticker Tape riil (tanpa persentase fiktif), Command Header bar dengan Quick Ticker jump input (`TICKER <GO>`), serta styling tajam industrial pada `globals.css` dan `layout.tsx`.

## Context
- SSOT: `AGENTS.md §3c Z2` + `docs/api-spec.md §3b`
- Branch: `handoff/29-ui-ux-bloomberg`
- File: `apps/web/app/globals.css`, `apps/web/app/layout.tsx`, `apps/web/components/TickerTape.tsx`, `apps/web/components/QuickSearch.tsx`

## Scope In / Out
- In:
  - `globals.css`: Variabel warna Obsidian `--bg: #07090E`, Card `--card: #0D111A`, Border `--border: #1E2638`, Amber `--amber: #F59E0B`, Emerald `--emerald: #089981`, Red `--red: #F23645`. Utility `.terminal-card`, `.terminal-kpi`, `.terminal-btn`. Scrollbar tipis 6px tanpa round pill.
  - `TickerTape.tsx`: Ticker strip atas dengan data riil dari `/api/v1/ranking` (Close Rp, Skor Mispricing, Rank, Anomaly Badge `!Z`). Dilarang persentase fiktif.
  - `QuickSearch.tsx`: Kolom input command cepat ala terminal Bloomberg (`TICKER <GO> e.g. BBCA ↵`) untuk langsung melompat ke `/dossier/[ticker]`.
  - `layout.tsx`: Integrasi Ticker Tape + Command Header + Telemetry status pill (`● LIVE 100`) + Footer institusional.
- Out: Perubahan logika backend atau schema API.

## Verification
```powershell
pnpm --dir apps/web lint -> 0
pnpm --dir apps/web typecheck -> 0
pnpm --dir apps/web test -> 6 passed
pnpm --dir apps/web build -> 6/6 routes pass
```
