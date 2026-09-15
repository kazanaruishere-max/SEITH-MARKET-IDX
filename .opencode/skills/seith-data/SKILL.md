# Skill: seith-data — Data Lineage & Backtest Verifiability (SEITH 20y)

## Purpose
Satu sumber kebenaran data: `universe-100 → Sectors batch → Kronos 400→20 → scoring 30/20/30/20 → Top-10 nemutron → backtest-100.json` — 100 items live, bukan hash dummy. 20 tahun: satu lineage patah, juri 30% depth gagal.

## When to Use
Trigger: `backtest`, `universe`, `kronos`, `scoring`, `sectors`, `ohlcv`, `backtest-100.json`, `scores_98`, `memos_top10`, `data/seith.db`, `296 credits`. Setiap session yang sentuh `research/` atau `crates/seith-api/src/backtest_data.rs` WAJIB load skill ini + `seith-market-intelligence`.

## Todo
`skill://seith-data` → `todowrite` → verify lineage → `verification-loop` — `grep SECTORS_API_KEY apps/web 0` sebelum `completed`.

## Lineage (Locked — d46a77d Live)
```
research/universe-100.json 100 stratified FINANCE25/ENERGY20/CONSUMER20/INFRA20/OTHER15
 → Sectors batch chunks(20)×5 /v2/{indonesia|singapore}/transaction/daily → OHLCV 98×19 (19 hari per ticker) + valuation 98 (ROE/margin/leverage/PE/PB) = 296 credits
 → Kronos-base real :8001 POST /predict_batch 19→20 T1.0 top_p0.9 max_context 512 equal guard
 → compute 30ER + 20(100-|Z|) + 30QV + 20SM (per market percentile) → ScoreOutput clamp 0-100
 → rank Mispricing desc → |Z| tie-break + flag |Z|>2 OR vol_spike >2σ
 → Top-10 /synthesize :8002 → 9router :20128 nemutron → fund/tech/synth memo (10 llm, 90 template)
 → research/backtest-100.json {as_of 2026-09-13, universe 100, market id, items 100, equity_curve 12, excluded [{BMRG 404},{MFIN missing_ohlc}], metrics, source lineage}
```

## Artefak Gate (Verifiable)
- `research/universe-100.json` — `items 100`, `stratified FINANCE25/ENERGY20/CONSUMER20/INFRA20/OTHER15`
- `research/backtest-100.json` — `items 100`, `as_of 2026-09-13`, `equity_curve 12` vs IHSG, `excluded 2`, `source` lineage 296c, `10 llm_ok` + pie `10/90`
- `research/scores_98.json` — 98× `er/z/vol_spike/components{ER, anomaly_z, QV, SM}` — LPPF `50.02/99.91/100/76.58 Score 80.3 rank 1`
- `research/memos_top10.json` — `llm_ok 10 degraded 0` — LPPF/UNVR/TPIA nemutron fund/tech/synth `Bukan rekomendasi investasi`
- `data/seith.db` — `SqliteRepository file:seith.db` WAL `busy_timeout 3000` TTL 24h raw / 1h ranking, key `market:sector:ticker:date`

## Commands (AGENTS §5 + Research)
```powershell
.\research\.venv\Scripts\python.exe -c "import json; b=json.load(open('research/backtest-100.json')); print('items', len(b['items']), 'as_of', b['as_of'], 'llm', sum(1 for x in b['items'] if x.get('research',{}).get('source')=='llm'))"
.\research\.venv\Scripts\python.exe -c "import json; m=json.load(open('research/memos_top10.json')); print('llm_ok', m['llm_ok'], 'degraded', m['degraded'])"
cargo test -p seith-api -- --nocapture # backtest_data::load_backtest_value
sqlite3 data/seith.db "SELECT count(*) FROM ohlcv;" # ≥100 if seeded
```

## Gotcha (20y)
- `lookback>512` → 422 di boundary (`handlers::check_lookback`), bukan di sidecar `:8001`
- `open/high/low/close` missing → `excluded + reason`, `volume/amount` → `0.0`, rasio → `sector median per market` + `insufficient_data:true`
- `SECTORS_API_KEY` server-only — `serve.rs load_dotenv` read `.env` no dep dotenv, `grep -r SECTORS_API_KEY apps/web → 0`
- `cargo run -p seith-api` bind `SEITH_API_BIND=0.0.0.0:8181` (8080 occupied httpd), web rewrites `:8181`
- Plotly `5.24.1` isolated `research/.venv` — `grep plotly apps/kronos-sidecar → 0`

## Docs Map
`AGENTS.md §3c Z3/Z5` + `docs/prd.md §5` + `docs/spec.md §2` + `docs/api-spec.md §7` + `docs/tdd-plan.md §6+§9` + `docs/kronos-notes.md` + `research/money-leak-backtest.ipynb` 7→10 sel

## Judging Lens
30% Tech Depth — lineage 296c + Kronos T1.0 top_p0.9 + CompositeCache + backtest verifiable. No auto trade, disclaimer tiap insight (Tier-0).

## References
`research/universe-100.json`, `research/backtest-100.json`, `crates/seith-api/src/backtest_data.rs`, `crates/seith-core/src/scoring/calculator.rs`, `2508.02739v1.pdf`
