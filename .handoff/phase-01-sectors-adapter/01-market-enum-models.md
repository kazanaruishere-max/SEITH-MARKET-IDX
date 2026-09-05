# Task 01 — Market Enum + Strict Domain Models

## Goal
Kunci `Market` enum `Id|Sg` (default `Id`) + strict schemas `OhlcvRow`/`Fundamentals` dengan `serde+validator deny_unknown_fields` — kontrak wire solid anti #08 median noise.

## Context
- SSOT: `AGENTS.md §6` + `docs/spec.md §3` + `docs/api-spec.md §1` + `docs/adr/0001` + `skill://seith-market-intelligence`
- Dependensi: — (task pertama, blocker semua)
- Branch: `handoff/01-sectors-adapter` atau `handoff/01-sectors-adapter/t1-core` (T1: `01+04` core)

## Scope In / Out
In: `seith-core/src/market.rs`, `models.rs`, `lib.rs` + tests
Out: Cache (`02`), client (`03`), cleansing (`04`), envelope (`05`)

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
```

## Peran + Skill + Sub-agent
| Peran | Skill | Sub-agent | Kapan |
|---|---|---|---|
| T1 Core | `seith-market-intelligence`+`tdd-workflow` | `tdd-guide` | TDD red-green |
| Arsitek | `senior-architect` | `architect` | **SEBELUM** coding — audit wire + sizing |
| `rust-reviewer` | `code-reviewer` | `code-reviewer` | crate models |
| `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca task |

## Next Session Prompt
`skill://seith-market-intelligence` + `handoff/01-sectors-adapter/t1-core` + `01-market-enum-models.md` + 3Q: `deny_unknown_fields` + `DateTime<Utc>` aware.
