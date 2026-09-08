# Task 03 — Cache Persist (L2 WAL Observe)

## Goal
Dokumentasikan persist L2 `data/seith.db` WAL untuk 100 ticker agar E2E `SELECT count(*)=100` verifiable.

## Context
- SSOT: `migrations/001_cache.sql` (`ohlcv/fundamentals/ranking_cache` + runtime `kv_store`) + `crates/sectors-client/src/cache/composite.rs` (`CompositeCache {l1:Moka 10k, l2:Sqlite WAL busy_timeout 3000}`) + `sqlite.rs` (`MIGRATION + PRAGMA WAL + DEFAULT_TTL 86400 + RANKING_TTL 3600 + RFC3339 expires_at`) + `crates/seith-api/src/repository.rs` (`SqliteRepository::new auto-mkdir parent + PRAGMA WAL + INSERT OR REPLACE`)
- Branch: `handoff/09-100-backtest` — Z3 data + Z5 docs + Z4 fixtures verify
- Branch: observe only, no write until implement

## Scope In / Out
In: Z3 `migrations/001_cache.sql` doc + `data/seith.db` observe spec (`sqlite3 data/seith.db "SELECT count(*) FROM ohlcv"` → 100 after implement, 0 now) + `cache_key market:sector:ticker:date` + TTL + `excluded:[{ticker,reason}]` + WAL + `busy_timeout 3000` — docs-only
Out: Z1 crate logic edit, Z2 apps logic, `vendor/*`

## Bagian — Surgical Breakdown
| Bag | File | Struktur | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `migrations/001_cache.sql` observe | `ohlcv(market ticker date PK, open/high/low/close, volume/default 0)` + `fundamentals(roe/margin/leverage/pe/pb insufficient_data)` + `ranking_cache(market sector as_of_date data expires_at)` + runtime `kv_store(key value expires_at)` | doc references schema, no edit | `cat migrations/001_cache.sql | grep kv_store` → 0 (runtime) noted |
| b | `CompositeCache` spec | `get(key): L1 hit → return, L2 hit → promote to L1` + `set(key,value): L1+L2` + `invalidate: both` + L1 `10k` + L2 `WAL` | `cache_hit_no_http` test still green (expect 1) | `cargo test -p sectors-client` 20 passed |
| c | TTL + fallback | `DEFAULT_TTL 86400` raw / `RANKING_TTL 3600` ranking + `excluded:[{ticker,reason}]` on OHLC missing / WAF 403 fallback `tests/fixtures/bbca-ohlcv-400.json` | ranking handler `items:[]` → future `ScoredTicker` | `grep excluded crates/seith-api/src/handlers.rs` → 1 |
| d | `data/seith.db` observe | `sqlite3 not in PATH Windows` → count via `cargo test SqliteRepository` + `research/validation-report.md` DB 0 rows stub noted | after 09 implement `SELECT count(*) FROM ohlcv` → 100 | `cargo test -p seith-api` 7 passed |

## Deliverables + Acceptance
- Docs state `data/seith.db` gitignored, WAL, `busy_timeout 3000`, key `market:sector:ticker:date`, TTL `86400/3600`, `excluded` reason — no crate edit
- `fn<50` N/A docs-only, `gitleaks 0`, `cargo fmt --check 0 + clippy --all-targets 0 + cargo test 145` no drift

## Verification
```
cat migrations/001_cache.sql → ohlcv/fundamentals/ranking_cache + kv_store runtime
cargo test -p sectors-client -- cache_hit_no_http → 1 expect, second hit no http
cargo test -p seith-api -- memory_round_trip → 1 row
cargo fmt --check → 0 / cargo clippy --all-targets → 0 / cargo test → 145 passed / gitleaks 0
```

## Accountability Block — Task 03
- ✅ Terverifikasi: `migrations/001_cache.sql` 41 lines + `CompositeCache` L1<L1ms/L2~2ms + WAL + TTL documented, no crate edit, gates 0
- ⚠️ Belum: `data/seith.db` 0 rows until 09 implement — deferred
- 🔻 Risiko: WAL collision if 09 ranking 100 parallel with serve — mitigasi sequential batch chunks(20)
- ♻️ Refactor: docs-only — keep narrow, DRY with 01+02

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent |
|---|---|---|---|
| Docs | `doc-updater` | `remember`+`handoff` | — |

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/09-100-backtest` + task `03-cache-persist.md` + ritual 3Q
