# Task 02 — Wire `score` → MA20 proxy + calculator

## Goal
`score.rs` not hardcode 80.0 — real `DB→normalize(Missing OHLC→exclude, vol→0)→MA20 proxy→qv percentile→sectorMom→compute 30/20/30/20 → anomaly_flag(|Z|>2|vol>2σ)`.

## Context
- SSOT: `seith-core/scoring/calculator.rs:48 compute` + `normalize.rs:20 cleanse_ohlcv + 58 cleanse_fundamentals` + `anomaly/volume.rs:16 flag` + `anomaly/traits.rs:16 calc_z` + `models.rs` + `scoring/components.rs`
- Dependensi: 01-ingest done (`data/seith.db` FINANCE 25)
- Branch: `handoff/20-finance-wire`, Z1 `crates/seith-cli`

## Scope In / Out
In: `crates/seith-cli/src/{pipeline.rs,commands/score.rs,store.rs}` + `Cargo.toml` add `chrono/rusqlite`, pipeline MA20 `ponytail: MA20 pending Kronos 400→20`
Out: `ranking.rs/dossier.rs/radar.rs` (03-05), `seith-core` no change, web/sidecars no touch

## Todo
- [ ] `in_progress` before code; `completed` after Verify + Block

## Bagian — Surgical
| Bag | File | Fn | Acceptance | Fail |
|---|---|---|---|---|
| a | `pipeline.rs` | `mean_std(&[f64])→(f32,f32)`, `ma_proxy(&[f64])→f32` | MA20 = `(close-avg20)/avg20`, empty→0, σ 0→0 not panic | empty vec |
| b | `pipeline.rs` | `qv_for(Fundamentals, &[Fundamentals])→f32` | 5 metrics `ROEmargin lev PE PB` percentile, lev/PE/PB inverse `100 - pct`, empty→50 | NaN clamp |
| c | `pipeline.rs` | `scored_for(ticker, Market)→Option<ScoredTicker>` | load ohlcv cleanse, closes 20 MA, `calc_z(close,ma,σ)`, `qv_for` + `sector_mom(median)`, `compute(er,z,qv,sm)`, `anomaly_flag`, returns 0-100 | insufficient data → None |
| d | `commands/score.rs` | `run(market, ticker)→String` | `normalize_ticker + TICKER_RE`, `scored_for` Some → `{"mispricingScore":f32,components,anomaly{z,flag,reason}}`, None → `TICKER_NOT_FOUND` | invalid ticker 422 |
| e | `pipeline.rs` | `scored_all(sector, market)→Vec<ScoredTicker>` | `list_tickers` loop scored_for filter None | empty sector → [] |

## Deliverables + Acceptance
- `score BBCA` vs `score BBRI` → scores differ >0.01, 0-100, `components.*` not 50 all, `anomaly.z` real
- `cargo test score_scores_differ` pass, existing 3 tests green, `score_bad` 422

## Verification
```
cargo fmt --check → 0
cargo clippy -p seith-cli -- -D warnings → 0
cargo test -p seith-cli score -- --nocapture → 4 passed
cargo run -p seith-cli -- score BBCA --market id | jq .data.mispricingScore
cargo run -p seith-cli -- score BBRI --market id  → differ
```
Block: `✅ Terverifikasi: ... / ⚠️ 9router down? no — pipeline local / 🔻 MA20 drift vs Kronos → deteksi: compare ER / ♻️ Refactor: extract qv_for`

## Peran + Skill
| Peran | Eksekutor | Skill | Sub-agent |
|---|---|---|---|
| T1 | sub-agent | `seith-market-intelligence` + `tdd-workflow` + `seith-quant` | planner if formula drift |
