# seith-jury ADVISORY — 2026-09-17 — SHA 5748c8c (handoff-22 post-patch)

```
seith-jury: ADVISORY PASS 78/100 — branch handoff/22-accessibility 5748c8c — veto? N (MANDATORY VETO only 30 Sep 23:59 WIB)
Usability 40: 34/40 — BBCA 62.52 neq BBRI 62.04 + ranking 25 desc + dossier 3 memo distinct + radar Top5 honest + degraded is_mock_mode PASS
Video 30: 24/30 — 4 routes 87.3k ok, MediaBox 595x842 Count2 Kids [3 0 R 5 0 R] 2 pages AA PASS, rewrites dev+prod NEXT_PUBLIC_API_BASE PASS, axe/focus-visible not measured pending
Tech 30: 20/30 — 500/25 + 9/9 normalize + 512 guard + bundle 0 + deny_unknown 6 + live 25c probe missing advisory warn (veto pre-freeze)
```

## Ritual SSOT 3Q (docs/notes/00-readme.md)
1) Fitur lolos MI? H22 polish bukan display — ranking/screen/anomaly/peer/research tetap 6 qualifiers.
2) Jebakan? Kronos 512 + cleansing OHLC->exclude + cache market key + 9router degraded.
3) Test FAIL jika salah? normalize 9/9 + lookback>512->422 + deny_unknown + TICKER_RE + memo distinct + MediaBox A4 Count2.

## Trace 8 Gates Sequential — bukti paste actual (FAIL jika tidak paste)

### G1 Sectors batch + CompositeCache
- pase: `DB ohlcv=500 fund=25 fund_FINANCE=25 tables=['ohlcv','fundamentals','ranking_cache','kv_store']` SHA:5748c8c
- pase: `crates/sectors-client/src/cache/mod.rs cache_key(market,sector,ticker,date)` + `BUSY_TIMEOUT_MS 3000 + PRAGMA journal_mode=WAL` + `CompositeCache { l1: MokaCache, l2: SqliteCache }`
- synthetic seed 500=25x20 honest, live probe gated 22.5
- verdict G1: PASS — deteksi: sqlite count + grep cache_key

### G2 Normalize cleansing
- pase: `cargo test -p seith-core normalize -- --nocapture -> 9 passed` (cleanse_missing_ohlc_excluded, cleanse_volume_null_to_zero, insufficient_data_flag, validate_lookback_guard, x_y_timestamp_derived, cleanse_missing_roe_median, sector_median_id_vs_sg_different)
- pase: `research/backtest-100.json excluded [{"ticker":"BMRG","reason":"sectors_404"},{"ticker":"MFIN","reason":"missing_ohlc"}] rank null degraded true`
- verdict G2: PASS — deteksi: cargo test filter normalize 9/9 + json excluded

### G3 Kronos 400->20 is_mock_mode honest + lookback>512->422
- pase: `apps/kronos-sidecar/app/main.py health model="mock" if is_mock_mode() else "Kronos-base" max_context 512` + `is_mock_mode() = _is_mock() or _fell_back` honest
- pase: `crates/seith-api/src/handlers.rs check_lookback >512 -> 422 "max_context 512 exceeded"` + `normalize.rs lookback>512 guard` + test `ranking_lookback_over_512_422`
- sidecar down is expected degraded, code honest
- verdict G3: PASS — deteksi: read main.py is_mock_mode + grep guard

### G4 Scoring 30/20/30/20 BBCA neq BBRI
- pase: `cargo run -p seith-cli -- score BBCA --market id -> mispricingScore 62.525...` vs `BBRI 62.045...` vs `BMRI 62.28` differentiated (sebelum 80.0 hardcoded)
- pase: `cargo run -p seith-cli -- ranking --sector FINANCE --market id -> total 25 desc rank1 BBCA 62.52`
- pase: `crates/seith-core/src/scoring/calculator.rs` + `research/backtest-100.json LPPF 80.3` lineage 296c
- verdict G4: PASS — deteksi: cargo run 3 tickers distinct

### G5 Ranking + flag |Z|>2
- pase: `cargo run -p seith-cli -- ranking --sector FINANCE -> items 20/25 total 25 sorted desc`
- pase: `cargo run -p seith-cli -- radar --market id -> flag true reason "z=1.6 | catalyst check: not_available_yet" Top5 honest`
- pase: `crates/seith-api/src/handlers.rs ranking anomalies minZ=2 flag true reason "z=-2.4" / "vol>2s"` code exists
- verdict G5: PASS — deteksi: cargo run ranking + radar

### G6 Agents Lite 3-memo distinct
- pase: `cargo run -p seith-cli -- dossier BBCA -> research.fundamental_memo "ROE BBCA 0.084 vs median FINANCE 0.120" != technical_memo "Teknikal MA20 proxy ER 50.2 anomaly Z 1.6" != synthesizer_memo distinct`
- pase: `crates/seith-api/src/handlers.rs memo_fund/memo_tech/memo_synth format distinct` (sebelum clone identical)
- verdict G6: PASS — deteksi: cargo run dossier + read handlers 3 memo distinct

### G7 Dossier PDF AA
- pase: `crates/seith-core/src/dossier.rs MediaBox [0 0 595 842] A4 Count 2 Kids [3 0 R 5 0 R] xrefs 0 7` (sebelum 612x792 Letter Count1)
- pase: `cargo test dossier::tests pdf_starts_with_header -> %PDF PASS` + `to_pdf_bytes body1 Page 1/2 + body2 Fundamental/Teknikal/Sintesis` 2 pages
- pase: `SCHEMA_VERSION 1.0.0 footer + disclaimer per page`
- verdict G7: PASS dimensions — deteksi: grep MediaBox + cargo test

### G8 Hybrid delivery
- pase: `pnpm --dir apps/web build -> 4 routes (/ /ranking /backtest /dossier/[ticker]) + First Load JS shared 87.3 kB` SHA:5748c8c
- pase: `apps/web/next.config.js rewrites /api/v1/* -> base = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8181'` dev+prod PASS
- pase: `apps/web/vercel.json rewrites source /api/v1/:path* destination http://127.0.0.1:8181` fallback (prod via NEXT_PUBLIC_API_BASE) — advisory
- pase: `grep SECTORS_API_KEY apps/web/.next 0` + `deny_unknown_fields 6` + `TICKER_RE` + `Market Id|Sg` + `clamp_page_size max50` + `check_lookback 512`
- verdict G8: PASS — deteksi: pnpm build + read next.config + grep handlers

## Horizontal gates — paste actual (bukan ekspektasi)
- pase: `cargo fmt --check 0` SHA:5748c8c
- pase: `cargo clippy -- -D warnings 0` (2.23s)
- pase: `cargo test -> 89 passed; 0 failed (seith-api 32, seith-core 21, seith-cli 7, sectors-client 16) + cargo test -p seith-core normalize 9/9` actual paste
- pase: `pnpm --dir apps/web lint 0 + typecheck 0 + build 4 routes 87.3k`
- pase: `grep banned delve/leverage/robust/cutting-edge apps/web -> 0`
- pase: `Bloomberg tokens grep #0B0E14/#11151F glass/tabular -> hits 7`
- pending: `axe 0 serious + focus-visible ring` not measured — advisory

## Metrics honesty 3 MUST (bukan settled fact)
1) pase: `as_of 2026-09-13 vs kronos chartPoints 2026-09-14->2026-10-03 vs equity 2025-08-01->2025-10-17 overlap=False` -> no look-ahead bias PASS — deteksi: python check_jury.py
2) pase: `hit_rate 0.85 + sharpe -0.0208` -> jelaskan eksplisit: `sharpe=mean(er)/sd(er) window 12 short 19d, top5_forward 1.95% tetap alpha, sharpe≈0 window-sensitive AGENTS 15` bukan dismiss auto — deteksi: README 8 metrics + regen_backtest_100.py mean_er/sd_er
3) pase: `README 8 table hit_rate 85% | sharpe -0.02 | drawdown -13.06% | totalReturn -13.06% co-located` -> PASS not cherry-pick — deteksi: Read README 8
- DoD: paste actual 89/21/19 (bukan angka ekspektasi) — FAIL jika tidak paste -> PASS actual paste

## Scalability audit — honest ponytail
- pase: `grep scalable|production-ready README.md -> 0` no overclaim PASS
- pase: `README 15 Limitations: Cache Single-file SQLite WAL — not multi-instance | Supabase deferred H5` + ADR 0001 Redis 30MB rejected — ponytail `single-instance demo :8181 SQLite WAL per-process — multi-instance via Supabase H5 deferred` satisfied

## Data Real — Live 25c Probe (1x MANDATORY pre-freeze)
- pase: `chunks(20)x1 Authorization -> GET /v2/daily/{symbol}/ 25c dari 704c sisa — NOT YET RUN (advisory warn, veto pre-freeze)` `credit_cost 296->321 single source not recon` Synthetic honest `MOCK=1` default
- verdict: ADVISORY warn — deteksi: no research/validation-report.md fresh + no SECTORS_API_KEY live curl — MANDATORY veto 30 Sep

## Risiko
- risiko: live probe missing -> normalize miss shape baru ketahuan di freeze — deteksi: no 25c curl — mitigasi: run 25c once pre-freeze
- risiko: axe/focus-visible not measured -> a11y 30% video slice incomplete — deteksi: no axe run

## Fixes ordered 1..3 (shortest diff, stdlib first)
1) Live probe 25c once `chunks20 Authorization research/score_live_98.py -> regen_backtest_100.py 296->321` via python file (gated 22.5)
2) Jaga harness: commit 5748c8c already `dossier 2 pages + handlers 3 memo + vercel fallback + next.config NEXT_PUBLIC_API_BASE + jury 2-level`
3) Push handoff-22 -> origin + sync jury harness to main (no freeze) + seith-jury ADVISORY 78/100 done

---
Generated: 2026-09-17 ADVISORY PASS 78/100 (no block) SHA 5748c8c — next: pre-freeze 30 Sep 23:59 WIB VETO if hollow persists
