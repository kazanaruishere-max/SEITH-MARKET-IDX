# Task 01 — Ingest FINANCE 25

## Goal
Populate `data/seith.db` (WAL) from vetted `research/universe-100.json` FINANCE 25 + `research/backtest-100.json` closeMap → 25×20 ohlcv + 25 fundamentals, no new credits.

## Context
- SSOT: `AGENTS.md §3c/§5b/§6/§8c` + `docs/prd.md §4` + `docs/spec.md §2/§5` + `docs/api-spec.md §7` + `migrations/001_cache.sql`
- Dependensi: — (first)
- Branch: `handoff/20-finance-wire` worktree `../seith-wt/handoff-20`, Z3 `data/seith.db`

## Scope In / Out
In: `crates/seith-cli/src/store.rs` (Z1), `data/seith.db`, `migrations/001_cache.sql`, `research/universe-100.json`, `research/backtest-100.json`, `tests/fixtures/sector-median.json`
Out: `pipeline.rs`, `score/ranking/dossier/radar` (task 02-05), Kronos :8001, web :3000, 9router

## Todo
- [ ] `todowrite in_progress` sebelum Implement; `completed` hanya setelah Verify hijau + Block.

## Bagian — Surgical Breakdown
| Bag | File | Fn / Struct | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `store.rs` | `db_path()/open_conn()` WAL 3000 `busy_timeout` | `cargo check` ok, `PRAGMA journal_mode=WAL` | conn fail |
| b | `store.rs` | `populate_finance_25() -> usize` | FINANCE 25 take, closeMap from backtest, `already>=20` skip, `INSERT OR REPLACE ohlcv/fundamentals` | empty universe → 0 |
| c | `store.rs` | `load_ohlcv/load_fundamentals/load_sector_fundamentals/list_tickers` | query by `market/sector/ticker`, fallback `Utc 2026-09-13`, `deny_unknown` | ticker not found → []/None |
| d | `store.rs` | `ensure_populated()/ohlcv_count() db_path()` | `cnt<20` triggers populate, candidates `SEITH_DB_PATH` + `data/seith.db` + `CARGO_MANIFEST_DIR` | db 0 rows → populate |

## Deliverables + Acceptance
- `store.rs` 250-320 lines, `fn <50`, `file 200-400`, `nesting ≤4`, no `unwrap` on user input
- `data/seith.db` WAL exists, `SELECT COUNT(*) FROM ohlcv` ≥ 400 (25×16-20), `SELECT COUNT(DISTINCT ticker) FROM fundamentals WHERE sector='FINANCE'` = 25, ready for pipeline
- `cargo fmt --check` 0, `clippy -D warnings` 0 in `store.rs` (`allow dead_code` on `ensure_db/ohlcv_count` until used)

## Verification
```
cargo fmt --check → 0
cargo clippy -p seith-cli -- -D warnings → 0
cargo test -p seith-cli -- --nocapture → green
sqlite3 data/seith.db "SELECT COUNT(*) FROM ohlcv; SELECT COUNT(DISTINCT ticker) FROM fundamentals WHERE sector='FINANCE';"
```
Block: `✅ Terverifikasi: ... → ... / ⚠️ Belum / 🔻 Risiko: DB path drift → deteksi: ls data/seith.db / ♻️ Refactor: extract hash_idx`

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T1 | sub-agent | `seith-market-intelligence` + `tdd-workflow` + `verification-loop` | `explorer` if drift | Implement→Verify TDD |
