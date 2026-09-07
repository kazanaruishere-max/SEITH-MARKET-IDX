# Money Leak Radar — Thesis Win 50jt

## Teardown 60 vs 85
| Kompetitor | 40 Usability | 30 Tech | Result |
|---|---|---|---|
| Dashboard cantik `PE sort + OHLC chart` | 5/40 FAIL derived | 10/30 cabut=mati false | 30/100 |
| LLM screener generik `PE>10 ROE>15` | 20/40 | 15/30 LLM saja | 55/100 |
| TA 50 indikator | 25/40 | 20/30 no foundation | 65/100 |
| **SEITH now `eafaea2` mock 72.5** | 25/40 `7 routes + Web` jalan | 25/30 `143 tests` solid | 60/100 B |
| **SEITH + Radar `|Z|>2+vol>2σ`** | **38/40 Top 5 Leak usable** | **28/30 Jupyter backtest real** | **85+ win** |

## Moat #1 — Money Leak Radar
`Flag |Z|>2 Z=(actual-forecast)/σ + volume spike >2σ tanpa katalis fundamental ROE/margin/leverage` → `Top 5 Trap/Hidden Alpha`.
- Hanya detect via `anomaly/volume.rs + scoring 30/20/30/20` — `cleansing gate` kita `volume→0 OHLC→excluded` yang lain crash di illiquid.
- Juri wow karena `derived` bukan display — Stockbit/TradingView tidak punya `illiquid trap` radar per sektor.

## Formula Lock
`Ranking ?sort=anomaly&minZ=2.0&pageSize=5` → `sort |Z| desc` per market `market:sector:ticker:date` `L2`.
`dossier BBCA` `breakdown ER|Z|QV|SM + peer 3 + kronos chart 20 + 3 memo Synth + disclaimer always + %PDF`.

## vs Moat Lain DEFER
- **Gap Map** `PE vs ROE scatter Id vs Sg` — nice 40% tapi generik, radar lebih `Sectors=mati` proof.
- **Decode Ring Dossier** — 1-page PDF kita sudah ada `crates/seith-core/src/dossier.rs`, radar bikin dossier ada isi real bukan mock.

## Positioning Juri
`Radar odds bukan dukun` — probabilistik `Kronos 400→20 ER+vol` + `QV+SM` — `disclaimer` always `no auto trade` Track 3 — `degraded:true` if 9router down still PASS.

*SSOT `crates/seith-core/src/{scoring,anomaly,ranking,dossier}` + `AGENTS.md §2/6` — win thesis pilih 1 jangan 3.*
