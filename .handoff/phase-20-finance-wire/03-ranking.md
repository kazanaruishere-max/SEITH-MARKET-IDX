# Task 03 — Wire `ranking` → score all + rank/paginate

## Goal
`ranking.rs` not empty `items: []` — score all FINANCE via `pipeline::scored_all` → `ranking::service::rank/paginate` → `items≥15`.

## Context
- SSOT: `seith-core/ranking/service.rs:118 rank + 177 paginate + 110 sector_filter` + `pipeline.rs:scored_all`
- Dependensi: 02-score done (`scored_for` tested)
- Branch: `handoff/20-finance-wire`, Z1

## Scope In / Out
In: `crates/seith-cli/src/commands/ranking.rs` update, reuse `pipeline.rs`, `ranking/service.rs` no change
Out: `dossier.rs/radar.rs`, `seith-api`, web, Kronos

## Bagian — Surgical
| Bag | File | Fn | Acceptance | Fail |
|---|---|---|---|---|
| a | `ranking.rs` | `run(market, sector)` | `RankingRequest {mispricing Desc page1 pageSize20} + scored_all + rank + paginate`, map `RankedTicker→json {ticker,market,sector,mispricingScore,rank,flag}` + `pagination`, `disclaimer` | no tickers → empty ok but test expects ≥15 FINANCE |
| b | `ranking.rs` | `run_validated` | `effective_market` 422 `VALIDATION_ERROR` | `xx` market → 422 |
| c | tests | `ranking_finance_has_items` | `GET ranking --sector FINANCE --market id` items len ≥15 | <15 fail |

## Deliverables + Acceptance
- `cargo run -p seith-cli -- ranking --sector FINANCE --market id | jq .data.items|length` ≥15 (20-25), sorted desc, flag reason present
- `ranking_sg_json` still pass (market sg path — seith-core handles isolate, but store may return [] ok — success true)

## Verification
```
cargo fmt --check → 0
cargo clippy -p seith-cli -- -D warnings → 0
cargo test -p seith-cli ranking -- --nocapture → 3 passed
cargo run -p seith-cli -- ranking --sector FINANCE --market id | jq '.data.items|length, .data.pagination.total'
```

## Peran + Skill
| Peran | Eksekutor | Skill | Sub-agent |
|---|---|---|---|
| T1 | sub-agent | `seith-market-intelligence` + `seith-data` | `seith-data-reviewer` |

## Next
Task 05 radar honest depends on this ranked list.
