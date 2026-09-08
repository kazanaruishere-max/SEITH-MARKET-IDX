# Task 01 — Sectors Drift Fix (T1 Rust)

## Goal
Betulkan `sectors-client` agar hit `api.sectors.app` dengan header `Authorization` dan path `/v2/daily/{symbol}/` sesuai docs, bukan drift lama.

## Context
- SSOT: `docs.sectors.app/api-references/v2/indonesia/transaction/daily.md` (`Authorization: <key>`, `GET /v2/daily/{symbol}/`, cost 1 credit, 401/403 free, 404 billed 1 credit) + `crates/sectors-client/src/client.rs:70-78` (drift `X-API-Key` + `base_path()/v2/indonesia/transaction/daily?ticker=`) + `crates/seith-core/src/market.rs:22 base_path()` obsolete + `AGENTS.md §6` (Market enum, validator)
- Dependensi: — (first of two parallel tasks, file-disjoint dengan 02)
- Branch: `handoff/08-drift-e2e/t1-rust-client` dari `handoff/08-drift-e2e` (dari `main 76d7208`) — worktree `../seith-wt/handoff-08-t1` — `/.wt/` gitignore — 7 Zones Z1 only
- Skill: `skill://seith-market-intelligence` awal + ritual 3Q `docs/notes/00-readme.md` (gate MI mana, jebakan cleansing, test apa FAIL)

## Scope In / Out
In: Z1 `crates/sectors-client/src/client.rs` (header + endpoint), `crates/seith-core/src/market.rs` (base_path), tests `crates/sectors-client/src/client.rs:93-196` mockito — Z1 only
Out: Z2 `apps/*` (T2), Z5 `.env*` (T2), Z3 `data/seith.db`, `apps/kronos-sidecar`, `vendor/*`, `handlers::ranking` real wire (defer PR34)

## Bagian — Surgical Breakdown
| Bag | File | Struktur / Fn | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `crates/sectors-client/src/client.rs:70` | `fetch_http` header | `header("Authorization", key)` not `X-API-Key`, key via `Redacted` not log | mockito `match_header("authorization", key)` fails if still X-API-Key |
| b | `crates/sectors-client/src/client.rs:46,71` | `endpoint()` + `fetch_http` url | `format!("{}/v2/daily/{}/", base_url, ticker)` path param, not `?ticker=` query | mockito `mock("GET","/v2/daily/BBCA/")` 200, old path 404 |
| c | `crates/seith-core/src/market.rs:22` | `base_path()` | `/v2/daily` for Id, `/v2/singapore/daily` style or `/v2/daily` with Sg variant per docs SGX daily, `as_str()` unchanged | `assert_eq!(Market::Id.base_path(), "/v2/daily")` |
| d | `crates/sectors-client/src/client.rs:93-` | mockito tests 5 cases | `fetch_id_endpoint`, `fetch_sg_endpoint`, `cache_hit_no_http`, `maps_422_validation`, `maps_401_auth_no_leak` — all with new path+header | `cargo test -p sectors-client` 20 passed |

## Deliverables + Acceptance
- `crates/sectors-client/src/client.rs` — header `Authorization`, path `/v2/daily/{ticker}/`, status map `200/401/403/404/422/429` unchanged, `Redacted` still masks
- `crates/seith-core/src/market.rs` — `base_path()` returns `/v2/daily` (Id) and correct Sg path, `from_str` + `as_str` + `Display` + `serde` unchanged
- `crates/sectors-client` tests — 5 mockito tests green with new endpoint/header, `redacted_debug_is_stars` unchanged
- Constraint: `fn <50`, `file 200-400` (client.rs 196→~196, market.rs 124→~124), `nesting ≤4`, `no unwrap`, `no dead code`, `cargo fmt+clippy` clean — §8c
- Live probe (manual, founder handles key): `curl -H "Authorization: $SECTORS_KEY" https://api.sectors.app/v2/daily/BBCA/ → 200 BBCA.JK 8300 2025-08-01` 1 credit

## Verification
```
cargo fmt --check → 0
cargo clippy -p sectors-client -p seith-core -- -D warnings → 0
cargo test -p sectors-client -p seith-core -- --nocapture → 20+84 passed (market.rs 7 + client 5 + seith-core 84)
# live (masked, founder key):
curl -H "Authorization: $SECTORS_KEY" https://api.sectors.app/v2/daily/BBCA/?start=2025-08-01&end=2025-08-02 → 200 [{"symbol":"BBCA.JK","close":8300}]
```
+ Accountability Block: `✅ Terverifikasi: <cmd> → <output> / ⚠️ Belum / 🔻 Risiko / ♻️ Refactor: <apa>` — `refactor-cleaner` scan `fn<50 file200-400 nesting≤4`

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T1 Rust | sub-agent | `seith-market-intelligence` + `tdd-workflow` + `verification-loop` | `explore` if mockito debug | Implement→Verify→Refactor TDD |

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/08-drift-e2e/t1-rust-client` + task `01-sectors-drift-fix.md` + ritual 3Q
