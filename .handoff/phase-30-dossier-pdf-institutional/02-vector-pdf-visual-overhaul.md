# Task 02 — Vector PDF Visual Overhaul (`@react-pdf/renderer`)

## Objective
Menggantikan layout PDF sederhana dengan arsitektur dokumen 2-halaman berstandar institusional (Bloomberg Intelligence / Goldman Sachs style) menggunakan palet warna gelap industri (`#07090E`, `#0D111A`, `#1E2638`), tipografi tajam, dan elemen SVG terstruktur.

## Key Sections

### Halaman 1: Executive Intelligence & Quantitative Valuation
1. **Security Header Banner (Bloomberg DES Style)**:
   - Ticker besar (`BBCA`), Nama Resmi Emiten (`PT Bank Central Asia Tbk`), Sektor (`FINANCE`), Rank (#4 / 100).
   - Harga Penutupan Terakhir (`Rp 6.325`), Badge Skor Mispricing Finviz (`75.3 / 100` Hijau/Merah).
   - Indikator Status Anomaly: `NORMAL (Z: +0.09)` atau `ANOMALY FLAGGED (|Z| > 2.0)`.
2. **Executive Synthesis (TradingAgents-Lite Consensus)**:
   - Box tesis ringkas derivatif (Synthesizer Verdict) berlatar kontras dengan border amber tipis.
3. **4-Pillar Factor Decomposition**:
   - Bar visual multi-warna proporsional: Expected Return (30%), Anomaly |Z| (20%), Quality / Value (30%), Sector Momentum (20%).
   - Baris angka numerik per pilar dengan label jelas.
4. **Kronos Quantitative Projection Corridor (400 → 20 Day Horizon)**:
   - Grafik SVG vektor nyata:
     - Garis grid horizontal dan sumbu harga Rupiah (Rp Min → Rp Max).
     - Area koridor volatilitas `±2σ` (shading merah transparan).
     - Garis proyeksi forward Kronos (amber 1.5pt).
     - Label horizon waktu (`D+1`, `D+5`, `D+10`, `D+15`, `D+20`).
     - Tampilan transparan `DEGRADED / NO INFERENCE DATA` jika data titik kosong.
5. **Peer Benchmark Matrix (Same Sector · QV Distance ±50%)**:
   - Tabel 5 peer terverifikasi dengan kolom Ticker, Skor Mispricing, dan QV Distance.

### Halaman 2: Multi-Agent Research Deep Dive & Metodologi
6. **Multi-Agent Research Deep Dive**:
   - **Fundamental Agent Memo**: Evaluasi rasio keuangan (ROE, margin, solvabilitas, PE/PB).
   - **Technical Agent Memo**: Momentum teknikal, pola harga, dan deviasi volatilitas.
   - **Synthesizer Verdict**: Ringkasan tesis komprehensif.
7. **Anomaly Radar & Money Leak Gauge**:
   - Meter deviasi horizontal SVG (-3σ s/d +3σ) dengan penanda ambang batas anomali `±2σ`.
8. **Metodologi & Data Lineage**:
   - Sumber resmi: Sectors REST API, CompositeCache (Moka L1 + SQLite WAL L2 `data/seith.db`).
   - Model Fondasi K-line Kronos-base 102.3M (AAAI 2026, 12B tokens) + 9router LLM.
   - Validasi Backtest: Top-20 Signal Accuracy 85%, Drawdown -6.23%.
9. **Mandatory Compliance Disclaimer**:
   - *"Bukan rekomendasi investasi. Informasi & analisis saja."* di footer setiap halaman.
