# Data Plan — 100 Top Stratified + Sectors 3 Dataset + Kronos Zero-Shot

## Stratifikasi 100 — Bukan 960
IDX `≈940 listed ≈750 aktif` `FINANCE/ENERGY/CONSUMER/INFRA/OTHER`.
**100 total `FINANCE 25 ENERGY 20 CONSUMER 20 INFRA 20 OTHER 15` Max 25%/sektor** — cukup Moat, hemat inference. `960 full = 900 credit` defer H7 jika sisa `1000 credits`.

## Bakar Credit Untuk Apa — Sekali Saja
`OHLCV 400 rows + Valuation per ticker ≈ 2 credit × 100 = 200 credit` → `L2 data/seith.db WAL busy_timeout 3000` `key market:sector:ticker:date` `migrations/001_cache.sql`. `TTL 24h raw /1h ranking` `L1 moka <1ms` selanjutnya gratis `offline demo juri` tanpa hit. `H5 fix eafaea2` `uv 17+17` `L1→L2 hit` proof. Full `900 credit` jika `Excel venue` habis.

## Sectors Perlu Install? TIDAK
`SECTORS_API_KEY` env server-only `crates/sectors-client reqwest` `GET /v2/indonesia/transaction/daily? ticker` + `.../singapore/...?market=sg` — tanpa `pip/npm`. `crates/seith-core/src/config.rs from_env() len<20 bail` + `redact.rs`.

## 10 Dataset → Mapping
| Dataset | Status | Dipakai | Alasan |
|---|---|---|---|
| **OHLCV Daily** | **REQUIRED** | `OhlcvRow open/high/low/close/volume?/amount? → x_timestamp/y_timestamp` `normalize.rs` `ER Kronos 400→20 Z=(actual-forecast)/σ vol>2σ SM` | WAJIB `normalize` `volume null→0 OHLC 0→excluded` |
| **Valuation Metrics** `ROE/margin/leverage/PE/PB` | **REQUIRED** | `Fundamentals` → `QV 30% qv_percentile per market` `scoring/calculator.rs` | Jantung `0-100 30/20/30/20` — missing→median `insufficient_data` |
| **Company Overview** `ticker/name/sector/market` | **REQUIRED** | `sector` partition `QV percentile + SM median Id vs Sg terpisah` `sector-median.json` + `ranking/service filter` `peerComparison` | Tanpa sector QV fallback `0.0` |
| **Peers & Comparison** | NICE-TO-HAVE | `dossier peerComparison 3` `dossier.rs:34` | Derivable internal `ranking/service.rs` — fetch eksternal Top 5 saja |
| **Future Forecast analyst** | DEFER | — | Ganti `Kronos :8001` foundation |
| **Dividend History** | DEFER | — | No `dividendYield` field |
| **Key Executives / Shareholdings / Major Shareholders / Institutional / Composition** 5 governance | DEFER | — | Tidak ada `Fundamentals` `analysis/types.rs` — template `Fund/Tech/Synth` only |

`DEFER` tambah nanti jika dossier butuh narasi governance — tidak block `143 tests` `tdd-plan.md §3 7 paths`.

## Kronos Latih / Finetune? TIDAK
`Kronos-base 102.3M 512ctx Tokenizer-base` `NeoQuasar` pretrained `45 exchange 12B K-line` `2508.02739v1.pdf` `docs/kronos-notes.md` hierarchical tokenizer — `REST :8001 predict_batch 400→20 T1.0 top_p0.9 max_context 512` zero-shot. `LOQ 15IRX9 RTX 4050 6GB VRAM <1GB batch 4` CUDA fallback `KRONOS_MOCK=1`. `Excel BBRI venue open/high/low/close/volume/date → research/money-leak-backtest.ipynb` `apps/kronos-sidecar/.venv uv` tanpa bakar credit — finetune `torch dataset + 2 jam` risiko overfit IDX, defer `vendor/Kronos 67b630e` read-only `ADR 0002`.

## Full JSON Dump? DEFER — Plan via L2 Bukan File
`Full dataset json` harus plan — simpan `L2` `data/seith.db` bukan `research/*.json` — `7 Zones §3c Z3` `data/` gitignore — `SQLite ~2ms` survive restart — file dump tidak verifiable `gitleaks`.

## Workflow Nambah? TIDAK — Filter di [5]
Locked `[1] Sectors Batch+Cache → [2] Cleansing → [3] Kronos :8001 → [4] Scoring → [5] Ranking + Leak `?sort=anomaly&minZ=2.0&pageSize=5` → [6] Agents Lite :8002 Top 5 → [7] Dossier → [8] Hybrid` `spec.md §2` — surgical `Z1 crates/seith-core + Z2 apps/web Top 5 Leak Table` + `adhoc Top-N`.

*SSOT `crates/seith-client/client.rs:46 batch.rs:6` + `seith-core/models.rs:13-40 market.rs normalize.rs scoring/dossier` + `seith-api/handlers ranking` + `api-spec.md:77 spec.md:86` + `AGENTS.md §3c/8c` — no fabrikasi.*
