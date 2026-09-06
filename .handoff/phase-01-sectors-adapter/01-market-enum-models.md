# Task 01 — Market Enum + Strict Domain Models

## Goal
Kunci `Market` enum `Id|Sg` (default `Id`) + strict schemas `OhlcvRow`/`Fundamentals` dengan `serde+validator deny_unknown_fields` — kontrak wire solid anti #08 median noise.

## Context
- SSOT: `AGENTS.md §3c Seven Zones + §6/§6c/§8c` + `docs/spec.md §3 Domains + §7b Zones` + `docs/api-spec.md §1 Schemas` + `docs/tdd-plan.md §3` + `docs/adr/0001` + `docs/notes/00-readme.md` ritual 3Q + `skill://seith-market-intelligence` + `skill://no-ai-slop` (Tier-1 warn H1-H4, hard fail H5) — 7 Zones zona 1 domain
- Dependensi: — (task pertama, blocker semua)
- Branch: `handoff/01-sectors-adapter` atau `handoff/01-sectors-adapter/t1-core` (T1: `01+04` core)

## Scope In / Out
In: `seith-core/src/market.rs`, `models.rs`, `lib.rs` + tests — zona 1 domain `crates/seith-core` (7 Zones §3c)
Out: Cache (`02`), client (`03`), cleansing (`04`), envelope (`05`) — cross-zona `seith-core` ↛ `sectors-client` dilarang

## Bagian — Surgical Breakdown (WAJIB dipisah, 1 bagian = 1 fn/struct <50 baris)
| Bag | File | Struktur / Fn | Acceptance | Test FAIL |
|---|---|---|---|---|
| 01a | `market.rs` | `enum Market {Id,Sg}` + `Default=Id` + `Copy/Clone/Eq/Hash/Debug` | `Market::default()==Id` | — |
| 01b | `market.rs` | `impl Market {as_str(), base_path(), is_default()}` | `Sg.base_path()=="/v2/singapore/transaction/daily"` | `base_path mismatch` |
| 01c | `market.rs` | `FromStr` case-insensitive + `Display` lowercase + `Serialize/Deserialize` `id/sg` | `Market::from_str("sg")==Sg`, `from_str("SG")==Sg`, `from_str("xx")==Err` + `serde_json "sg" round-trip` | `parse xx → 422` |
| 01d | `models.rs` | `struct OhlcvRow {ticker, market, date:DateTime<Utc>, open,high,low,close:f64, volume/amount:Option<f64>, x/y_timestamp:Option<i64>}` `#[serde(deny_unknown_fields)]` `#[validate(regex TICKER_RE)]` | `deny_unknown_fields` reject + ticker `^[A-Z0-9]{3,6}$` | `ticker="ab"→reject`, `unknown:1→422` |
| 01e | `models.rs` | `struct Fundamentals {ticker, market, sector, roe/margin/leverage/pe/pb:Option<f64>}` + `SectorMedian` | `fundamentals round-trip identik` | `sector-median.json` parse |
| 01f | `lib.rs` | `pub mod market; pub mod models;` + `pub const SCHEMA_VERSION="1.0.0"` | export clean | `cargo check` 0 |
| 01g | `tests` | `#[cfg(test)]` ≥9 tests | `default Id`, `parse sg`, `serde round-trip`, `ticker reject`, `deny Unknown`, `OhlcvRow round-trip + Utc`, `Fundamentals round-trip` | 9 passed |

## Deliverables + Acceptance (per Bagian)
- 01a-c: `market.rs` 80-120 baris total, `fn <50`, `no unwrap` (use `Result`), `Hash` untuk `HashMap<(Market,String),SectorMedian>` nanti
- 01d-e: `models.rs` 150-250 baris, `TICKER_RE = Regex::new("^[A-Z0-9]{3,6}$")` via `once_cell`, `DateTime<Utc>` aware `RFC3339`, `Option<f64>` untuk cleansing fallback
- 01f: `lib.rs` 8 baris
- Constraint: `file 200-400` typical, `nesting ≤4`, `cargo fmt+clippy` clean, `♻️ Refactor:`

## Verification
```
cargo fmt --check → 0
cargo clippy -p seith-core -- -D warnings → 0
cargo test -p seith-core -- --nocapture → ≥9 passed (no assertion-less)
skill://no-ai-slop detect → pass (Tier-1 warn, banned words/patterns clean)
refactor-cleaner scan §8c → pass (fn<50 file200-400 nesting≤4 no dead code)
```

### Accountability Block
```
✅ Terverifikasi: <cmd> → <output> (paste nyata, no fabrikasi)
⚠️ Belum: integration cache key (02)
🔻 Risiko: ticker regex over-permissive — deteksi: validator unit negative
♻️ Refactor: extract TICKER_RE once_cell, split models.rs per struct fn<50
```

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead Otak T0 | opencode sini | `seith-market-intelligence`+`verification-loop` | — | approve 01, verify 01g tests |
| T1 Core | sub-agent | `seith-market-intelligence`+`tdd-workflow`+`verification-loop` | `tdd-guide` | Implement→Verify→Refactor TDD red-green |
| Arsitek | sub-agent `architect` | `senior-architect` | `architect` | **SEBELUM** coding — audit wire + file sizing |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | crate `seith-core` models |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | validasi ticker `^[A-Z0-9]{3,6}$` + Market parse |
| PM Autonomous | `seith-pm` | `git-worktree-manager`+gate | — | **veto merge jika gate/reviewer fail** |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca task — `fn<50 file200-400 nesting≤4` + scan §8c |

> §8c: semua agent bertanggung jawab penuh code/logic/testing/structure & rapih (§8c)

## Next Session Prompt
`skill://seith-market-intelligence` + `handoff/01-sectors-adapter/t1-core` + `01-market-enum-models.md` + ritual 3Q:
1) Gate MI mana? Fondasi Market key anti #08 median noise — tanpa ini cache campur Id/Sg.
2) Jebakan? `deny_unknown_fields` + `DateTime<Utc>` aware vs naive + `FromStr` case-insensitive.
3) Test FAIL apa? `ticker="ab"→422`, `unknown:1→422`, `Market::Sg serde="sg"` round-trip, `Market::from_str("xx")→Err`.
