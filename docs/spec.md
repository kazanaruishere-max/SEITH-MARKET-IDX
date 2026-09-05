# SPEC — SEITH Architecture & Domains (Market Intelligence — Rust + Kronos-base)

## 1. Architecture Snapshot

```
Sectors REST/MCP (1000 credits, CompositeCache, batch) ─┐
  market=id (default) | sg (flag)                       ▼
                         ┌─ seith-cli (Rust clap) ─────┐
                         │  ranking | dossier | scan   │
                         ▼                             │
                  [ Rust API - Axum + Tokio ]  ← REST /api/v1/* + envelope + market enum
                         │                             │
           ┌─────────────┼──────────────┐               │
           ▼             ▼              ▼               │
    sectors-client  scoring-engine  kronos-bridge ─→ Python sidecar (uv) Kronos-base :8001
    (CompositeCache) (Rust crate)   (HTTP /predict)   NeoQuasar/Kronos-base + Tokenizer-base
     moka L1 + SQLite L2                              predict_batch lookback 400→20, max_context 512
     data/seith.db 24h TTL                             │
           │             │              │               │
           └──────┬──────┘              ▼               │
                  ▼              tradingagents-lite (uv, LangGraph) :8002
               dossier           Fund/Tech/Synth only, Sectors adapter ─→ 9router :20128/v1
                         ┌─ Next.js 14 FE (consume Rust API) + WS ───────┘
```

Hybrid delivery: **Rust CLI (`seith-cli` via `clap`) = kontrak inti verifiable** + **Web (Next.js consume Rust API) = usability 40%**. Share `crates/seith-core` + `seith-api`.

Whitepaper `2508.02739v1.pdf` (AAAI 2026): Kronos tokenizer hierarkis untuk K-line OHLCV, foundation model decoder-only; diringkas di `docs/kronos-notes.md` (H2) untuk tuning 512 ctx, 102.3M params, sampling T/top_p.

### 1b. Tech Stack & Framework (locked)

| Layer | Stack | Framework |
|---|---|---|
| Core | Rust edition 2021 | Axum + Tokio, serde, validator, chrono, reqwest, thiserror/anyhow, tracing, tower-http |
| Cache | Composite | moka L1 (hot, <1ms) + SQLite L2 (`data/seith.db`, ~2ms, persistent) — trait `Cache`, Redis 30MB ditolak (tidak muat IDX raw 45MB), Supabase defer H5 |
| CLI | Rust | clap — `seith ranking --sector FINANCE`, `seith ranking --market sg --sector FINANCE`, `seith dossier BBCA --pdf`, `seith scan --tickers BBCA,BMRI` |
| Quant sidecar | Python uv | FastAPI + Uvicorn, torch, Kronos-base (`apps/kronos-sidecar :8001`) |
| Research sidecar | Python uv | FastAPI, LangGraph-inspired, httpx → 9router (`apps/analysis :8002`) |
| LLM | 9router | `http://localhost:20128/v1/chat/completions` (OpenAI-compatible), `LLM_BASE_URL`, Tier-0 NEVER kill |
| Web | Next.js 14 | App Router + TS + Tailwind + shadcn, Zod (FE), pnpm |
| Test | Rust+Python+FE | cargo test+mockito, uv pytest+ruff, pnpm test |

## 2. Pipeline Workflow — Intelligence Loop `60s Ranking → Deep Dossier` (Locked)

`analisa → signal` saja TIDAK cukup untuk 40% usability.

```
[1] Sectors Batch+Cache (Rust, CompositeCache) ─┐
     1000 credits, moka L1 + SQLite L2 data/seith.db, key market:sector:ticker:date
     market=id default, market=sg optional flag (STI stretch H5), batched per sektor, 24h TTL raw / 1h ranking
     L1 miss → L2 hit → fetch Sectors → tulis L1+L2; Redis 30MB tidak dipakai (IDX raw ~45MB)
                                ▼
[2] Normalize & Cleansing (Rust seith-core)  ← Data Cleansing Gate (anti-crash IDX illiquid)
     open/high/low/close WAJIB — missing → exclude ticker + reason "missing_ohlc", 422 di boundary
     volume/amount missing → 0.0 (Kronos butuh kolom, diisi nol)
     rasio (ROE/margin/leverage/PE/PB) missing → sector median, fallback 0.0 + flag insufficient_data
     lookback >512 → 422 (max_context Kronos-base guard)
     x_timestamp/y_timestamp derived dari Sectors date
                                ▼
[3] Kronos-base Sidecar (Python uv :8001, HTTP predict_batch 400→20, T=1.0 top_p=0.9)
     Rust reqwest → POST /predict_batch (equal lookback/pred_len guard), timeout 30s retry 1x
     fallback deterministik jika sidecar down (degraded:true, forecast=0)
     Integration: REST sidecar (bukan PyO3/maturin) — hindari GIL+Tokio clash, T1 Rust & T2 Python paralel
                                ▼
[4] Scoring Engine (Rust) — Mispricing 0-100 explainable
     30% ER (Kronos forecast z-norm) + 20% (100-|Z|) + 30% QV (Sectors Quality/Value sector-percentile) + 20% SectorMom
     clamp 0-100, simpan tiap komponen untuk breakdown; sector median per market (Id vs Sg terpisah)
                                ▼
[5] Ranking + Anomaly Flag (Rust)
     sort mispricing desc (market-wide & per-sektor per market); flag jika |Z|>2 atau volume spike >2σ tanpa katalis
                                ▼
[6] TradingAgents-Lite (Python LangGraph :8002/synthesize, Fund/Tech/Synth only, Sectors adapter → 9router :20128)
     hanya untuk dossier Top-N (hemat LLM), tanpa Trader execution, prompt guard + disclaimer injection
     Vendor: copy workflow dari github.com/TauricResearch/TradingAgents — 3-agent Lite (Analyst→Synthesizer pola), bukan fork full repo. `vendor/TradingAgents` read-only referensi (ADR 0002).
                                ▼
[7] Comparative Dossier 1-Page (Rust compose)
     score breakdown + peerComparison + kronos chartPoints + research memo → JSON → PDF export
                                ▼
[8] Hybrid Delivery — Rust API (Axum /api/v1/*, envelope + market enum) + seith-cli (clap) + Next.js FE (consume Rust API)
```

Cleansing gate memastikan pipeline tidak crash di emiten illiquid/missing — robustness = Tech Depth 30%. CompositeCache memastikan offline demo juri (L2 SQLite survive restart, tanpa Sectors hit, tanpa paid Redis).

## 3. Domains

- **Market Data:** OHLCV daily Sectors → DataFrame `open/high/low/close/volume?/amount?` + `x_timestamp/y_timestamp`; fundamentals → `{roe, margin, leverage, pe, pb, sector, market}`. Missing handling via §2. Market enum `Id|Sg`.
- **Quant (Kronos-base):** Expected return, volatility proxy, anomaly Z = (actual - forecast)/σ_forecast. Batch via `predict_batch`.
- **Research (Lite):** Fundamental memo (quality/value Sectors), Technical memo (Kronos signal + momentum), Synthesizer 1-paragraph take + bull/bear points. No execution, selalu disclaimer. LLM via 9router.
- **Intelligence:** Composite scoring, ranking, anomaly detection, dossier generation — semua derived, bukan display mentah.

## 4. Scoring — Mispricing Score 0-100 (explainable, jantung lolos MI)

- Kronos Expected Return (30%): z-normalized forecast return → 0-100.
- Anomaly Z (20%): `100 - |Z|_norm` — divergence tinggi = flag, bukan skor tinggi.
- Quality/Value (30%): ROE, margin stability, leverage, PE/PB sector-percentile → composite (percentile per market).
- Sector Momentum (20%): median sektor & relative strength.
Formula: `score = 0.30*ER_norm + 0.20*(100-|Z|_norm) + 0.30*QV + 0.20*SM`, clamp 0-100. Simpan tiap komponen untuk breakdown. Flag jika `|Z|>2` atau volume spike `>2σ`.

## 5. Data Flow & Caching

- Sectors fetch batched per sektor per market, key `market:sector:ticker:date`, cache Composite: L1 moka (hot) + L2 SQLite `data/seith.db` (tables `ohlcv,fundamentals,ranking_cache`, TTL 24h raw / 1h ranking). Pre-compute ranking overnight hemat 1000 credits. L2 persist → offline demo juri tanpa Sectors hit.
- Kronos sidecar batch; payload validated, fallback `degraded:true` jika down.
- TradingAgents-Lite hanya Top-N via 9router → hemat cost/latensi; dossier tetap lolos MI jika 9router down (LLM opsional Track 3).
- CLI dan Web share core crate — contract test envelope sama mencegah drift. Redis 30MB ditolak (IDX raw ~45MB, tidak muat), Supabase defer H5 jika butuh cloud multi-instance.

## 6. Non-Functional

- Perf: ranking <2s cached (L1 <1ms, L2 ~2ms), dossier <8s (9router <3s). Credit hit <200/hari via cache.
- Security: Sectors key + LLM_BASE_URL env-only server, rate limit 60/min (scan 10/min), no secret di log, input validation ketat (market enum, ticker regex).
- Compliance: disclaimer tiap insight, no auto-trade, repo public 19 Aug–30 Sep, freeze saat submit. 9router NEVER kill — check `Invoke-WebRequest http://localhost:20128/v1/models` 200 sebelum dossier.

## 7. Handoff Slice (Founder Model)

H1 Sectors Adapter+Cache (Rust CompositeCache + Market enum) → H2 Kronos Service (sidecar :8001 + bridge) → H3 Agents Surgery (Lite → 9router :20128) → H4 Scoring/Ranking (Rust) → H5 Hybrid Delivery (Rust API + seith-cli + FE + Dossier PDF, market flag) → H6 Freeze Kit (repo public, teaser 1m + judging 3m CLI+Web, freeze). Tiap handoff = branch `handoff/NN-topic` + doc `.handoff/handoff-NN-topic.md` + wajib `skill://seith-market-intelligence` + `verification-loop`.
