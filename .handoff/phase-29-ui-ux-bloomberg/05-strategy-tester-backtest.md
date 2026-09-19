# Task 05 — Strategy Tester Backtest Simulation (Z2)

## Goal
Implementasi halaman simulasi strategi `/backtest` ala TradingView Strategy Tester: kartu telemetri metrik kuantitatif terverifikasi, kurva ekuitas portofolio SEITH Top-10 vs Benchmark IHSG 52-pekan riil, dan audit log lengkap 100 emiten universe.

## Context
- SSOT: `docs/api-spec.md §3 GET /v1/backtest` + `README.md §8 & §15`
- File: `apps/web/app/backtest/page.tsx`, `apps/web/components/BacktestChart.tsx`

## Scope In / Out
- In:
  - `page.tsx`: Strategy header banner dengan ringkasan periode simulasi mingguan riil, 4 kartu KPI performa (`Signal Accuracy Top-20: 85%`, `Sharpe Ratio ER-based: -0.02`, `Max Drawdown: -6.23%`, `Cumulative Return: -6.23%`), pill transparansi data lineage (simulasi 52-pekan forecast-based, 500 baris DB riil), audit log 100 emiten ranking lengkap.
  - `BacktestChart.tsx`: Dual line chart TradingView style (Garis solid emerald untuk portofolio SEITH, garis amber putus-putus untuk IHSG Benchmark, area merah transparan untuk drawdown periods, tooltip persentase riil).
- Out: Perubahan perhitungan kuantitatif backtest di backend.

## Verification
```powershell
pnpm --dir apps/web lint -> 0
pnpm --dir apps/web typecheck -> 0
Invoke-WebRequest http://localhost:3000/backtest -> 200 OK
```
