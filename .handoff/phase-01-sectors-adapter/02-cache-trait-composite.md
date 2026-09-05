# Task 02 — Cache Trait → Moka L1 + SQLite L2 + Composite

## Goal
Kunci `Cache<K,V>` + `MokaCache` + `SqliteCache` + `Composite L1→L2` — WAL `busy_timeout 3000`, key `market:sector:ticker:date`, TTL 24h/1h — offline demo survive restart.

## Context
- SSOT: `AGENTS.md §3b §6` + `spec §2-5` + `api-spec §4` + `adr 0001` (Redis ditolak) + `migrations/001_cache.sql` + `skill://seith-market-intelligence`
- Dependensi: `01` done (Market)
- Branch: `handoff/01-sectors-adapter/t2-cache` (T2: `02+03`)

## Scope In / Out
In: `seith-core/cache.rs`, `sectors-client/cache/{moka,sqlite,composite}.rs` atau `cache.rs`, `migrations/001_cache.sql`
Out: fetch (`03`), cleansing (`04`), envelope (`05`)

## Bagian — Surgical Breakdown
| Bag | File | Struktur / Fn | Acceptance | Test FAIL |
|---|---|---|---|---|
| 02a | `seith-core/cache.rs` | `trait Cache<K,V>:Send+Sync {get,set,invalidate}` generic `Hash+Eq+Clone` | trait compile | — |
| 02b | `seith-core/cache.rs` | `MokaCache<K,V>(moka::sync::Cache)` + `impl Cache` + `fn new(max_capacity:u64)` | `MokaCache round-trip` | `get missing→None` |
| 02c | `sectors-client/cache/sqlite.rs` | `SqliteCache {path}` `open()` `PRAGMA WAL,busy_timeout 3000` `migrations 001 exec` `get/set/invalidate` TTL 24h raw /1h ranking | `ringkas 2ms persist` | `TTL expiry→None` |
| 02d | `sectors-client/cache/composite.rs` | `CompositeCache {l1:MokaCache<String,String>, l2:SqliteCache}` `get/set` L1 miss→L2 hit→fetch logic (tanpa fetch Sectors, hanya cache) | `L1 miss→L2 hit` | `Id vs Sg isolasi` |
| 02e | `sectors-client/cache.rs` | `fn cache_key(market,sector,ticker,date)->String` `format!("{}:{}:{}:{}",market.as_str(),...)` | `key Id ≠ Sg` | `campur→FAIL` |
| 02f | `tests` | `#[cfg(test)]` ≥6 + `sqlite3 data/seith.db` | `busy_timeout concurrent :memory:` | 6 passed |

## Deliverables + Acceptance (per Bagian)
- 02a-b: `seith-core/cache.rs` 60-90 baris, `MokaCache::new(10_000)` capacity
- 02c: `sqlite.rs` 120-180 baris, `rusqlite bundled`, `CREATE TABLE IF NOT EXISTS ohlcv|fundamentals|ranking_cache` dari `001_cache.sql`, `:memory:` untuk unit
- 02d: `composite.rs` 60-80 baris, `L1.get or L2.get`, `set` tulis L1+L2
- 02e: `fn cache_key <50 baris`
- Constraint: `fn <50`, `file 200-400`, `nesting ≤4`, `no unwrap` rusqlite `?`, `♻️ Refactor:`

## Verification
```
cargo fmt --check → 0
cargo clippy -p seith-core -p sectors-client -- -D warnings → 0
cargo test -p sectors-client -- --nocapture → ≥6 passed
sqlite3 data/seith.db "SELECT name FROM sqlite_master WHERE type='table';" → ohlcv fundamentals ranking_cache
```

## Peran + Skill + Sub-agent
| Peran | Skill | Sub-agent | Kapan |
|---|---|---|---|
| T2 Cache | `seith-market-intelligence`+`tdd-workflow` | `tdd-guide` | TDD |
| Arsitek | `senior-architect` | `architect` | **SEBELUM** coding |
| `rust-reviewer` | `code-reviewer` | `code-reviewer` | cache |
| `security-reviewer` | `security-review` | `security-reviewer` | rusqlite path |
| `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca |

## Next Session Prompt
`skill://seith-market-intelligence` + `handoff/01/t2-cache` + `02` + 3Q: `WAL lock` + `TTL` + `market key`.
