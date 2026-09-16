# Task 01 — API Wire Real DB

## Goal
`handlers.rs` `backtest-100.json` pinned → DB-real via `SqliteRepository` + `CompositeCache` wiring, factual `degraded` flag — no fake live claim while synthetic.

## Context
- SSOT: `AGENTS §6 envelope+Market` + `docs/api-spec §3` + `crates/seith-api/src/handlers.rs:load_backtest_value` + `backtest_data.rs` + `repository.rs` + `crates/sectors-client/src/cache/composite.rs` + `crates/seith-core/src/ranking/service.rs`
- Dependensi: Phase 20 01-ingest done (`data/seith.db` 25×20 synthetic honest, WAL 40KB)
- Branch: `handoff/21-zero-gap` worktree `../seith-wt/handoff-21` — Z1 `crates/seith-api` Z3 `data/seith.db`

## Scope In / Out
In: `crates/seith-api/src/handlers.rs` (route wiring), `crates/seith-api/src/backtest_data.rs` (DB fallback), `crates/seith-api/src/repository.rs` (query helpers if needed), `Cargo.toml` if needed — Z1+Z3
Out: `kronos/client.rs`, `analysis/client.rs`, `apps/*`, `docs/api-spec` credit reconcile (task 03), live Sectors batch 25c (gated 01b)

## Todo
- [ ] `todowrite in_progress` before Implement; `completed` only after Verify hijau + Block.

## Bagian — Surgical Breakdown
| Bag | File | Fn/Struct | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `backtest_data.rs` | `load_from_db(path) -> Option<BacktestValue>` | try `SqliteRepository::new(path)` → `SELECT COUNT(*) FROM ohlcv` >0 then build `BacktestValue` from DB rows (ohlcv+fundamentals via `seith-core` compute path if available) else `None`; no panic on 0 rows | DB empty → None (fallback) |
| b | `handlers.rs` | `load_backtest_value()`改 | try `load_from_db("data/seith.db")` first; if `None` fallback to file `research/backtest-100.json` with `degraded:true` + `tracing::warn!("pinned fallback")`; `X-Schema-Version` stays | file missing → 500 with `error.code=UPSTREAM_ERROR` not panic |
| c | `handlers.rs` | `GET /api/v1/ranking` | `?market=id&sector=FINANCE` uses `sector_median` + `ranking/service::rank` on DB data when available; `pagination.total` real count; `envelope {success,data,error,pagination}` + `X-Schema-Version:1.0.0` | `?market=sg` still isolated `sg:` prefix |
| d | `handlers.rs` | `GET /health` | unchanged but adds `db_rows` field `{ohlcv_cnt, fundamentals_cnt}` for factual observability (no fake live) | — |

## Deliverables + Acceptance
- `curl :8181/api/v1/ranking?market=id&sector=FINANCE → {success:true, data.items[0].mispricingScore≠80, pagination.total≥15 if DB seeded}` else `{degraded:true, items from pinned}` with honest header
- `curl :8181/health → {success:true, data:{schema:"1.0.0", db:{ohlcv_cnt,fundamentals_cnt}}}` + `X-Schema-Version`
- `deny_unknown_fields` still 422 on `?market=xx` + `envelope` strict
- `fn<50 file200-400 nesting≤4` `cargo fmt+clippy` clean

## Verification
```
cargo fmt --check → 0
cargo clippy -p seith-api -- -D warnings → 0
cargo test -p seith-api -- --nocapture → green
cargo run -p seith-api & curl http://127.0.0.1:8181/api/v1/ranking?market=id&sector=FINANCE | jq '.success, .data.pagination.total, .data.items[0].mispricingScore'
curl http://127.0.0.1:8181/health | jq '.data.db'
```

## Peran + Skill
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T1 | sub-agent | `seith-market-intelligence` + `seith-data` + `verification-loop` | `seith-data-reviewer` | Implement→Verify |

## Next
Task 02 sidecar honest depends on DB wiring honest flag.
