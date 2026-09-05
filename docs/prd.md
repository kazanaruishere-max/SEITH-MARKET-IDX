# PRD — SEITH Market Intelligence (Track 3 Reveal)

## 1. One-Sentence Problem
Retail dan analis pemula IDX kesulitan membedakan saham murah yang berkualitas vs value trap karena screening BEI generik hanya menampilkan data mentah tanpa skor derivatif yang explainable dan komparasi sektor.

## 2. Persona (MI = `Reveal`)
- **Rina — Retail 26, <50jt** — butuh ranking harian yang paham dalam 60 detik, bukan tabel raw PE/PB. Job: pilih 5 kandidat berkualitas cepat.
- **Budi — Analyst Junior 29** — butuh dossier komparasi peer + anomaly flag untuk briefing pagi. Job: justify pick dengan evidence.
- **Non-persona:** trader butuh auto-execution (dilarang semua track — SEITH hanya informasi & analisis).

## 3. Vision
SEITH mengubah data Sectors mentah menjadi **insight derivatif yang bisa dipakai hari ini**: skor mispricing explainable, ranking sektor-aware, flag anomali, dan dossier 1 halaman per emiten. Cabut Sectors = produk mati (core source).

## 4. Core Derived Insights (memenuhi `What qualifies` MI)
- **Mispricing Score 0-100** — komposit: Kronos-base Expected Return (30%) + Anomaly Z (20%) + Quality/Value Sectors (30%) + Sector Momentum (20%). Explainable per komponen — bukan black box.
- **IDX Anomaly Rank** — ranking harian cross-sector & intra-sector, derivasi penuh.
- **Anomaly Flag** — forecast vs actual divergence |Z|>2, volume spike vs fundamentals — `Anomaly detection`.
- **Comparative Dossier** — 1-page per ticker: score breakdown + peer rank + TradingAgents-Lite synthesis (Fundamental/Technical/Synthesizer via 9router) + disclaimer — `Synthesized research` + `Comparative analysis`.
- **Screener custom logic** — filter & rank dengan logika tim sendiri, bukan filter PE>X generik.

Raw display/visual ulang tanpa skor/ranking/anomali/komparasi/research = FAIL track.

## 5. Pipeline Workflow — Intelligence Loop `60s Ranking → Deep Dossier` (Locked)

Satu-satunya workflow win. `analisa → signal` saja TIDAK cukup untuk 40% usability.

```
[1] Sectors Batch+Cache (Rust, CompositeCache, market=id default) ─┐
     1000 credits, moka L1 (<1ms, hot) + SQLite L2 data/seith.db (~2ms, persistent, 100% gratis)
     key market:sector:ticker:date, batched per sektor, 24h TTL raw / 1h ranking
     market=sg optional flag (STI stretch H5, tidak default — hemat credits, cegah median noise)
                                ▼
[2] Normalize & Cleansing (Rust seith-core)  ← Data Cleansing Gate
     open/high/low/close WAJIB (missing → exclude + reason, 422)
     volume/amount missing → 0.0
     rasio (ROE/margin/leverage/PE/PB) missing → sector median, fallback 0.0 + flag insufficient_data
     lookback >512 → 422 (max_context Kronos-base)
     timestamp x_timestamp/y_timestamp derived dari date
                                ▼
[3] Kronos-base Sidecar (Python uv :8001, HTTP) — predict_batch 400→20, T=1.0 top_p=0.9
     HTTP POST /predict_batch (equal lookback/pred_len guard), fallback deterministik jika down (degraded:true)
                                ▼
[4] Scoring Engine (Rust) — Mispricing 0-100 explainable
     30% ER (Kronos forecast) + 20% (100-|Z|) + 30% QV (Sectors Quality/Value) + 20% SectorMom
     clamp 0-100, simpan tiap komponen untuk breakdown
                                ▼
[5] Ranking + Anomaly Flag (Rust)
     sort mispricing desc; flag jika |Z|>2 atau volume spike >2σ tanpa katalis fundamental
                                ▼
[6] TradingAgents-Lite (Python LangGraph :8002, Fund/Tech/Synth only, Sectors adapter → 9router :20128)
     hanya untuk dossier Top-N (hemat LLM), tanpa Trader execution, disclaimer injection
     LLM via 9router http://localhost:20128/v1 (OpenAI-compatible), no modal eksternal
                                ▼
[7] Comparative Dossier 1-Page (Rust compose)
     score breakdown + peerComparison + kronos chartPoints + research memo → JSON → PDF export
                                ▼
[8] Hybrid Delivery — Rust API (Axum /api/v1/*, envelope) + seith-cli (clap) + Next.js 14 FE (consume Rust API)
     CLI:  `seith ranking --sector FINANCE` | `seith ranking --market sg --sector FINANCE` | `seith dossier BBCA --pdf` | `seith scan --tickers BBCA,BMRI`
     Web:  `GET /api/v1/ranking?market=id`, `/dossier/:ticker?market=sg` — 60s comprehension untuk Rina
     Keduanya share crates/seith-core + seith-api (contract sama, verifiable)
```

Integrasi Rust ↔ Python via **REST sidecar** (bukan PyO3/maturin): Rust Axum standalone + 2 Python sidecar HTTP (`:8001 /predict_batch`, `:8002 /synthesize → 9router`). Cache via `trait Cache` (Composite moka L1 + SQLite L2 `data/seith.db`), Redis 30MB ditolak (tidak muat IDX raw 45MB), Supabase defer H5. Alasan: 100% gratis, persist survive restart, offline demo juri. Market `enum Market {Id, Sg}` default `Id`.

## 6. Scope In / Out
In: Rust core (Axum+Tokio) + CompositeCache (moka L1 + SQLite L2) + sectors-client batch + market enum Id/Sg (default id) + Kronos-base sidecar (uv, HTTP, NeoQuasar/Kronos-base + Tokenizer-base, max_context 512, lookback 400→pred 20, predict_batch) + TradingAgents-Lite 3-agent copy workflow (Fund/Tech/Synth, Sectors adapter, via 9router, tanpa Trader execution) + Scoring Engine Rust + Ranking/Anomaly/Dossier API (`?market` param) + **Hybrid CLI (seith-cli clap) + Web (Next.js consume Rust API)** + 9router LLM provider + disclaimer. 100% gratis (no paid Redis).
Out: Auto trade execution, rekomendasi beli/jual, realtime websocket, auth kompleks, display mentah tanpa derivasi.
Vendor: `vendor/TradingAgents` & `vendor/Kronos` hanya referensi ter-pin (read-only, ADR 0002) — workflow di-copy minimal ke `apps/analysis`, bukan fork full repo.

## 7. User Journey (60s → deep dive)
1) Landing/Web atau `seith ranking` CLI (default IDX, `market=sg` opsional) → ranking hari ini / pilih sektor → 2) List rank Mispricing Score + flag → 3) Klik ticker atau `seith dossier BBCA` → Dossier (breakdown + peer + Kronos chart + agent memo + disclaimer) → 4) Export PDF/share.

## 8. Success Metrics — Judging 40/30/30
- **40% Usability:** task paham ranking <60s (Web) dan CLI verifiable, 5-user test >90% completion, bisa dipakai hari ini tanpa manual. IDX primary story.
- **30% Video & Storytelling:** teaser 1-min (screen recording CLI+Web working) + judging 3-min (problem→audience→workflow end-to-end), async 1-8 Okt. STI sebagai bonus comparative IDX vs SG di H5.
- **30% Tech Depth:** Sectors inovatif & verifiable di repo (commit history), Kronos-base batch + custom scoring Rust + CompositeCache + 9router + market-agnostic trait, cache hit >80%, no fake demo, hybrid CLI+Web share core, 100% gratis infra.

## 9. Constraints (Track Rules)
Sectors MCP/REST wajib core; 1000 credits → CompositeCache moka+SQLite. Market default `MARKET=id`, `MARKET=sg` optional. Kronos-base 102.3M: butuh GPU, fallback CPU/pre-compute. TradingAgents-Lite via 9router, tanpa execution, LLM opsional Track 3 (fallback degraded:true tetap lolos). `bukan rekomendasi investasi` di setiap insight view. Repo public dibuat dalam build period 19 Aug–30 Sep 2026, freeze saat submit. 9router :20128 NEVER kill.

## 10. Risks
- Kronos-base berat → GPU atau pre-compute overnight; fallback deterministik.
- LLM 9router down → dossier tetap lolos MI (synthesized research degradasi, score+peer tetap), flag degraded.
- Data missing/illiquid → ditangani cleansing gate §5 (sector median + insufficient_data), pipeline tidak crash.
- CLI/Web drift → share seith-core crate, contract test envelope sama.
- Cache 30MB Redis → ditolak; SQLite file ~45MB muat IDX raw, survive restart, offline demo.
