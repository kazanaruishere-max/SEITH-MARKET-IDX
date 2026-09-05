# Task 02 — Cache Trait → Moka L1 + SQLite L2 + Composite L1→L2→Sectors

## Goal
Kunci `trait Cache<K,V>` + `MokaCache` L1 (<1ms hot) + `SqliteCache` L2 (`data/seith.db` WAL ~2ms persistent) + `CompositeCache` (L1 miss → L2 hit → fetch Sectors → tulis L1+L2) — 100% gratis, survive restart, offline demo juri tanpa Sectors hit.

## Context
- SSOT: `AGENTS.md §3b Cache Composite + §6 Cache trait` + `docs/spec.md §2-5 DataFlow+Cache` + `docs/api-spec.md §4 Cache` + `docs/tdd-plan.md §3-7 CompositeCache` + `docs/adr/0001-stack` Redis 30MB ditolak (45MB raw tidak muat) + Supabase defer H5 + `migrations/001_cache.sql` (tables `ohlcv,fundamentals,ranking_cache`, WAL, TTL 24h raw / 1h ranking) + key `market:sector:ticker:date` anti-pattern #08 + #09 WAL lock + `skill://seith-market-intelligence` + `seith-dev`
- Dependensi: `01-market-enum-models.md` done (key butuh `Market` enum). Blocker H2/H4 jika tidak done — Kronos butuh Ohlcv cached.
- Branch: `handoff/01-sectors-adapter` atau `handoff/01-sectors-adapter/t2-cache` (paralel T2: `02+03` cache+client vs T1: `01+04` core)
- Fondasi: `1000 credits Sectors` → cache hit >80% wajib; L2 `data/seith.db` gitignore, auto-create via `rusqlite` + `migrations/001_cache.sql`; H1 tidak wajib `9router`/`Kronos` live

## Scope In / Out
In: `crates/seith-core/src/cache.rs` (trait `Cache<K,V>: Send+Sync` + `MokaCache<K,V>` wrapper `moka::sync::Cache` + stub `SqliteCache {path: String}` + `CompositeCache {l1: MokaCache, l2: SqliteCache}` + `Cache` impl untuk `MokaCache`), `crates/sectors-client/src/cache/{moka.rs,sqlite.rs,composite.rs}` atau `crates/sectors-client/src/cache.rs` (real `SqliteCache` dengan `rusqlite` bundled, `migrations/001_cache.sql` execution, `get/set/invalidate` dengan key `String` `market:sector:ticker:date`, TTL check 24h raw / 1h ranking, `WAL` + `busy_timeout 3000`, `:memory:` untuk unit), `Cargo.toml` deps `moka sync` + `rusqlite bundled` already, `data/seith.db` gitignore verify.
Out: Sectors REST fetch logic (`03`), cleansing `normalize.rs` (`04`), envelope/repository (`05`) — hanya trait + impl cache, tidak sentuh fetch/normalize.

## Deliverables + Acceptance
- `crates/seith-core/src/cache.rs`:
  - `pub trait Cache<K,V>: Send+Sync { fn get(&self, key:&K)->Option<V>; fn set(&self, key:K, value:V); fn invalidate(&self, key:&K); }` — generic `K: Hash+Eq+Send+Sync+'static`, `V: Clone+Send+Sync+'static`
  - `pub struct MokaCache<K,V>(pub moka::sync::Cache<K,V>)` + `impl Cache` (sudah ada, polish: `fn new(max_capacity:u64)->Self` + `#[cfg(test)]` helper)
  - `pub struct SqliteCache { pub path: String }` stub → di `sectors-client` real impl (seith-core hanya trait + Moka; Sqlite real di client crate agar tidak polusi core)
  - Acceptance: `cargo test -p seith-core` `MokaCache` get/set/invalidate round-trip + `CompositeCache` type exists
- `crates/sectors-client/src/cache.rs` (atau `cache/*.rs`):
  - `SqliteCache` real: `rusqlite::Connection::open(path)`, `PRAGMA journal_mode=WAL; PRAGMA busy_timeout=3000;`, `CREATE TABLE IF NOT EXISTS ohlcv (key TEXT PRIMARY KEY, value TEXT NOT NULL, created_at INTEGER NOT NULL)` + `fundamentals` + `ranking_cache` (eksekusi `migrations/001_cache.sql`), `get(key:&str)->Option<String>` cek TTL (`created_at + TTL > now`), `set(key:String, value:String)` `INSERT OR REPLACE`, `invalidate`
  - `CompositeCache` real: `struct CompositeCache { l1: MokaCache<String,String>, l2: SqliteCache }` + `impl Cache<String,String>` atau `impl CompositeCache { fn get(&self,key:&str)->Option<String> { l1.get or l2.get } fn set(&self,key:String,val:String){ l1.set + l2.set } }` — L1 miss → L2 hit path (tanpa fetch Sectors di task ini; fetch di `03`)
  - Key format: `format!("{}:{}:{}:{}", market.as_str(), sector, ticker, date)` — verify `Id` vs `Sg` tidak campur
  - Acceptance: `cargo test -p sectors-client -- --nocapture` ≥6 tests: `MokaCache round-trip`, `SqliteCache :memory: round-trip`, `SqliteCache TTL expiry` (mock time), `Composite L1 miss → L2 hit`, `Composite L1+L2 miss → None`, `market key Id vs Sg isolasi` (insert Id, get Sg → None), `busy_timeout` concurrent `:memory:` pass, `sqlite3 data/seith.db` file created after test (integration `#[ignore]` jika file)
- Constraint: `fn <50`, `file 200-400`, `nesting ≤4`, `no unwrap` di rusqlite (use `Result` + `?`), `cargo fmt+clippy` clean, `♻️ Refactor:`
- Fixtures: use `tests/fixtures/bbca-ohlcv-400.json` value sebagai `String` cached value untuk round-trip

## Verification (paste output nyata)
```
cargo fmt --check → 0
cargo clippy -p seith-core -p sectors-client -- -D warnings → 0
cargo test -p seith-core -- --nocapture → pass (MokaCache)
cargo test -p sectors-client -- --nocapture → pass (SqliteCache :memory: + Composite L1→L2 + market key)
cargo test -- --nocapture → pass
sqlite3 data/seith.db "SELECT name FROM sqlite_master WHERE type='table';" → ohlcv fundamentals ranking_cache
```
+ Accountability Block: `✅ cargo test -p sectors-client → 6 passed / ⚠️ Belum: Sectors fetch integration / 🔻 WAL lock concurrent file — deteksi: busy_timeout test / ♻️ Refactor: extract cache_key(market,sector,ticker,date)->String fn<50`

## Peran + Skill + Sub-agent (task ini)
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T2 Cache | sub-agent | `seith-market-intelligence` + `tdd-workflow` | `tdd-guide` (fixtures cache TTL) | Implement→Verify→Refactor TDD red-green |
| Arsitek | `architect` | `senior-architect` | `architect` | **SEBELUM coding** — audit `Cache` trait + WAL + file sizing |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | `seith-core` + `sectors-client` cache |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | `rusqlite` input validation, path traversal |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca task — `fn<50 file200-400` |

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/01-sectors-adapter/t2-cache` + task `02-cache-trait-composite.md` + ritual 3Q: 1) gate MI? fondasi cache >80% hit, 100% gratis. 2) jebakan? WAL lock `busy_timeout 3000` + TTL 24h/1h + market key. 3) test FAIL? `L1 miss→L2 hit`, `Id vs Sg isolasi`, `TTL expiry→None`.
