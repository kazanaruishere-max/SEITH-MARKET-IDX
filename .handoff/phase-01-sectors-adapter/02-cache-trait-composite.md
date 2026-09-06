# Task 02 — Cache Trait → Moka L1 + SQLite L2 + Composite

## Goal
Kunci `Cache<K,V>` + `MokaCache` + `SqliteCache` + `Composite L1→L2` — WAL `busy_timeout 3000`, key `market:sector:ticker:date`, TTL 24h/1h — offline demo survive restart.

## Context
- SSOT: `AGENTS.md §3b Cache Composite + §3c Seven Zones + §6/§6c/§8c Cache trait/Anti Slop/Ownership` + `docs/spec.md §2-5 DataFlow+Cache + §7b Zones` + `api-spec §4 Cache` + `adr 0001` (Redis ditolak) + `migrations/001_cache.sql` + `docs/notes/00-readme.md` ritual 3Q + `skill://seith-market-intelligence` + `skill://no-ai-slop`
- Dependensi: `01` done (Market)
- Branch: `handoff/01-sectors-adapter/t2-cache` (T2: `02+03`)

## Scope In / Out
In: zona 1 `seith-core/cache.rs` (trait+ Moka L1), zona 1 infra `sectors-client/cache/{moka,sqlite,composite}.rs` atau `cache.rs`, zona 3 `migrations/001_cache.sql` + `data/seith.db` (WAL)
Out: fetch (`03`), cleansing (`04`), envelope (`05`) — cross-zona `seith-core` tidak import `sectors-client` (§3c 7 Zones)

## Bagian — Surgical Breakdown
| Bag | File | Struktur / Fn | Acceptance | Test FAIL |
|---|---|---|---|---|
| 02a | `seith-core/cache.rs` | `trait Cache<K,V>:Send+Sync {get,set,invalidate}` generic `Hash+Eq+Clone` | trait compile | — |
| 02b | `seith-core/cache.rs` | `MokaCache<K,V>(moka::sync::Cache)` + `impl Cache` + `fn new(max_capacity:u64)` | `MokaCache round-trip` | `get missing→None` |
| 02c | `sectors-client/cache/sqlite.rs` | `SqliteCache {path}` `open()` `PRAGMA WAL,busy_timeout 3000` `migrations 001 exec` `get/set/invalidate` TTL 24h raw /1h ranking | `ringkas 2ms persist` | `TTL expiry→None` |
| 02d | `sectors-client/cache/composite.rs` | `CompositeCache {l1:MokaCache<String,String>, l2:SqliteCache}` `get/set` L1 miss→L2 hit→fetch logic (tanpa fetch Sectors, hanya cache) | `L1 miss→L2 hit` | `Id vs Sg isolasi` |
| 02e | `sectors-client/cache.rs` | `fn cache_key(market,sector,ticker,date)->String` `format!("{}:{}:{}:{}",market.as_str(),...)` | `key Id ≠ Sg` | `campur→FAIL` |
| 02f | `sectors-client/lib.rs` | `pub mod cache;` + re-export `Market, Cache` | `cargo check` 0 | — |
| 02g | `tests` | `#[cfg(test)]` ≥6 + `sqlite3 data/seith.db` `SELECT name FROM sqlite_master` | `busy_timeout concurrent :memory:` | 6 passed |

## Deliverables + Acceptance (per Bagian)
- 02a-b: `seith-core/cache.rs` 60-90 baris, `MokaCache::new(10_000)` capacity
- 02c: `sqlite.rs` 120-180 baris, `rusqlite bundled`, `CREATE TABLE IF NOT EXISTS ohlcv|fundamentals|ranking_cache` dari `001_cache.sql`, `:memory:` untuk unit
- 02d: `composite.rs` 60-80 baris, `L1.get or L2.get`, `set` tulis L1+L2
- 02e: `fn cache_key <50 baris`
- 7 Zones: file baru wajib di zona benar — `seith-core`/`sectors-client` zona 1, `migrations/`+`data/` zona 3 (§3c+spec §7b) — file di luar zona = violation → PM veto
- Constraint: `fn <50`, `file 200-400`, `nesting ≤4`, `no unwrap` rusqlite `?`, `♻️ Refactor:`

## Verification
```
cargo fmt --check → 0
cargo clippy -p seith-core -p sectors-client -- -D warnings → 0
cargo test -p sectors-client -- --nocapture → ≥6 passed
sqlite3 data/seith.db "SELECT name FROM sqlite_master WHERE type='table';" → ohlcv fundamentals ranking_cache
refactor-cleaner scan §8c fn<50 file200-400 nesting≤4 no dead code → pass
gitleaks detect --no-git → 0 leaks
skill://no-ai-slop detect → pass (Tier-1 warn)
```

> Accountability Block + `refactor-cleaner scan §8c` + `gitleaks` + `no-ai-slop` Tier-1 wajib hijau sebelum merge

### Accountability Block
```
✅ Terverifikasi: <cmd> → <output> (paste nyata)
⚠️ Belum: Sectors fetch integration (03)
🔻 Risiko: WAL lock concurrent file — deteksi: busy_timeout test
♻️ Refactor: extract cache_key fn<50, split cache per file
```

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead Otak T0 | opencode sini | `seith-market-intelligence`+`verification-loop` | — | approve 02, verify cache |
| T2 Cache | sub-agent | `seith-market-intelligence`+`tdd-workflow`+`verification-loop` | `tdd-guide` | Implement→Verify→Refactor TDD |
| Arsitek | sub-agent `architect` | `senior-architect` | `architect` | **SEBELUM** coding — audit Cache trait + WAL + sizing |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | `seith-core`+`sectors-client` cache |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | rusqlite path, TTL injection |
| PM Autonomous | `seith-pm` | `git-worktree-manager`+gate | — | **veto merge jika gate fail** |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca task — `fn<50 file200-400` |
| Doc | `doc-updater` | `remember`+`handoff` | `doc-updater` | sinkron spec §5 |

> **§8c Ownership:** semua agent bertanggung jawab penuh `code/logic/testing/structure & rapih` — `fn<50 file200-400 nesting≤4 no dead code` + 7 Zones; PM Autonomous veto merge jika gate fail

## Next Session Prompt
`skill://seith-market-intelligence` + `handoff/01-sectors-adapter/t2-cache` + `02-cache-trait-composite.md` + ritual 3Q:
1) Gate MI? Fondasi cache >80% hit, 100% gratis — offline demo.
2) Jebakan? WAL lock `busy_timeout 3000` + TTL 24h/1h + market key `Id vs Sg` isolasi.
3) Test FAIL apa? `L1 miss→L2 hit`, `Id vs Sg isolasi`, `TTL expiry→None`.
