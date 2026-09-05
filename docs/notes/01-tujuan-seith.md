# 01 — Tujuan SEITH: Win, Bukan Sekedar Jadi

## Satu Kalimat Win
SEITH = **derived insight explainable yang bisa dipakai hari ini** untuk IDX — bukan visual ulang Sectors.

## Pipeline Win (8 Gerbang)
`Sectors Batch+CompositeCache (moka L1+SQLite L2, market=id) → Cleansing Gate → Kronos-base :8001 predict_batch 400→20 → Scoring 0-100 (30/20/30/20) → Ranking → Agents Lite :8002 → 9router :20128 → Dossier 1-page → Hybrid CLI+Web`

`analisa → signal` doang = **GAGAL** 40% usability.

## Judging 40/30/30 — Optimize Untuk

| Bobot | Arti | SEITH Jawab |
|---|---|---|
| 40% Usability | Bisa dipakai hari ini tanpa manual | Ranking 60s comprehension (Web) + CLI verifiable `seith ranking --json`, dossier 1-page dengan breakdown |
| 30% Video | Teaser 1m + judging 3m async 1-8 Okt | Screen recording CLI+Web working, bukan slide |
| 30% Tech Depth | Sectors core, verifiable di repo | Kronos-base 102.3M + custom scoring Rust + CompositeCache 100% gratis + 9router |

## Hybrid — Dua Wajah, Satu Kontrak

- **CLI `seith-cli` (clap)** = kontrak inti verifiable: `seith ranking --sector FINANCE`, `seith dossier BBCA --pdf`, `seith scan --tickers BBCA,BMRI --market sg --json`
- **Web Next.js 14** = usability: consume Rust API `GET /api/v1/ranking?market=id` envelope sama
- Kontrak ` {success,data,error,pagination}` identik — `cargo test` verifikasi tanpa browser

## Qualifying Test MI — Lolos vs Gagal
Lolos: `scores` (Mispricing 0-100), `rankings` (IDX Anomaly Rank), `screener custom`, `anomaly detection` (|Z|>2), `comparative` (peer), `synthesized research` (3-agent memo).
Gagal: `dashboard PE/PB sortable` + `chart OHLC` tanpa derivasi — secantik Bloomberg tetap FAIL.

## Pertanyaan Kritis Sebelum Implement
- Apakah fitur ini menambah skor/ranking/anomaly/comparative/research atau cuma display?
- Jika Sectors dicabut, apakah produk mati? (Jika tidak → bukan MI)
- Apakah ada breakdown explainable (4 komponen) + disclaimer?
