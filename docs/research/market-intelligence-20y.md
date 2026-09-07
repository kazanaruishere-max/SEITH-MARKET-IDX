# Market Intelligence 20y Lens — SEITH Track 3 `Reveal`

## Evolusi 20 Tahun `BI → CI → Predictive → Prescriptive`
| Era | Paradigma | Artefak | SEITH |
|---|---|---|---|
| 2005 BI | Reporting `what happened` | Dashboard PE/PB sortable `OHLC` | FAIL Track 3 |
| 2012 CI | Benchmark `vs peers` | Peer table manual | NICE-TO-HAVE |
| 2018 Predictive | `scores/rankings/anomaly` | `Mispricing 0-100 30ER+20(100-|Z|)+30QV+20SM` `|Z|>2` | H4 DONE `84 tests` |
| 2024 Prescriptive | `screener custom + dossier 1-page → action` | `60s Ranking→Dossier PDF` `?sort=anomaly Top 5 Leak` | **H7 moat** |

Juri Sectors `40 Usability /30 Video /30 Tech` — hanya level 4 `prescriptive` yang `bisa dipakai hari ini` `docs/prd.md:73-74` `AGENTS.md:31`.

## Track 3 Qualifying Test — 6 Qualifier PASS vs FAIL
`AGENTS.md:30` `Tier-0 Derived insight gate` — `cabut Sectors = mati` `AGENTS.md:105`.
| Qualifier | PASS SEITH `main eafaea2` | FAIL `dashboard cantik` `docs/notes/03-market-intelligence-gate.md:16` |
|---|---|---|
| **Scores** | `0-100` breakdown `docs/spec.md:93-97` | PE mentah |
| **Rankings** | `sort mispricing desc` per market `api-spec.md:25-28` | Sort PE |
| **Screener Custom** | `?sort=anomaly sector=FINANCE market=sg` | `PE>10` generik |
| **Anomaly** | `|Z|>2 Z=(actual-forecast)/σ + vol>2σ tanpa katalis + reason` `tdd-plan.md:14` | Flag tanpa reason |
| **Comparative** | `peerComparison 3 + sector median per market Id vs Sg terpisah` `dossier.rs` | Solo ticker |
| **Synthesized** | `Fund/Tech/Synth → 9router :20128 + chartPoints + disclaimer` | Chart OHLC doang |

## 40/30/30 Nuance `docs/prd.md:73-76`
- **40% Usability:** `CLI verifiable ranking --json ≡ REST /api/v1/ranking?market=sg + dossier --pdf %PDF + Web /ranking + /dossier/<ticker>` — `analisa→signal saja TIDAK cukup` `spec.md:45`.
- **30% Video:** `teaser 1m screen record CLI+Web working` + `judging 3m problem→audience→workflow` `handoff/06-freeze/03-video-demo.md` — `no-ai-slop` `delve/leverage` kills 30% `05-anti-patterns.md:76-80`.
- **30% Tech:** `Sectors core 1000 credits CompositeCache moka<1ms + SQLite L2 data/seith.db ~2ms` `adr/0001` + `Kronos 102.3M 512ctx hierarchical tokenizer 45 exch 12B K-line` `2508.02739v1.pdf` + `143 tests meaningful 7 paths` — `mock 72.5` today = tipis, need real `100 Top`.

## IDX Microstructure `docs/notes/03-market-intelligence-gate.md + spec §2[2]`
- `≈940 listed ≈750 aktif` — illiquid trap high: `open/high/low/close missing→exclude + excluded:[{ticker,reason}] + volume/amount null→0.0 + rasio missing→sector median + insufficient_data:true + lookback>512→422` — gate survive juri filter.
- `FINANCE/ENERGY/CONSUMER/INFRA` median `Id vs Sg` terpisah `sector-median.json` — percentile `QV 30%` per market, bukan global.
- `vol>2σ` tanpa `ROE/margin katalis` = Money Leak — hanya detect via `anomaly/volume.rs`.

## Winning Thesis — Prescriptive Moat
Juri butuh `derived explainable bukan dukun`: odds probabilistik `ER+Z` + `QV+SM` + early warning `Leak` — bukan `kapan pasti naik`. H7 pilih 1 moat jangan 3 — next doc `money-leak-radar-thesis.md`.

*SSOT `docs/prd/spec/api-spec/tdd-plan/adr/0001-0005/notes/00-05` + `AGENTS.md §2/4/6/7` + `graphify-out/graph.json` — no fabrikasi.*
