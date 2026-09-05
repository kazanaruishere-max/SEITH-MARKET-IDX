# Task 04 — Cleansing Gate Normalize (anti-crash illiquid)

## Goal
Kunci `normalize.rs` cleansing: `OHLC` wajib else `excluded`, `volume→0`, `rasio→median per market + insufficient_data`, `x/y_timestamp` derived, `lookback>512→422` — pipeline tidak crash #01-04.

## Context
- SSOT: `AGENTS.md §6` + `spec §2 [2]` + `api-spec §5` + `tdd-plan §3-7` + `fixtures illiquid+sector-median` + `skill://seith-market-intelligence`
- Dependensi: `01` Market + `03` raw Vec<OhlcvRow>
- Branch: `handoff/01-sectors-adapter/t1-core` (T1: `01+04`)

## Scope In / Out
In: `seith-core/normalize.rs`, `models.rs` tambahan `Excluded/CleansedBatch/SectorMedian`
Out: Cache (`02`), fetch (`03`), envelope (`05`)

## Bagian — Surgical Breakdown
| Bag | File | Struktur / Fn | Acceptance | Test FAIL |
|---|---|---|---|---|
| 04a | `models.rs` | `struct Excluded {ticker, reason:String}` `struct CleansedBatch {rows, excluded, insufficient_data:bool}` `struct SectorMedian {roe,pe...}` | `serde round-trip` | — |
| 04b | `normalize.rs` | `fn is_missing_ohlc(row:&OhlcvRow)->bool` `open==0||NaN` | `is_missing_ohlc` unit | `NaN→true` |
| 04c | `normalize.rs` | `fn cleanse_ohlcv(rows:Vec<OhlcvRow>, market:Market)->CleansedBatch` clone rows, retain OHLC else `excluded missing_ohlc`, `volume/amount None→0.0`, `x/y_timestamp=date.timestamp()` | `illiquid.json→excluded len1` + `volume null→0.0` | `OHLC null→excluded` |
| 04d | `normalize.rs` | `fn cleanse_fundamentals(f:Fundamentals, median:SectorMedian)->(Fundamentals,bool)` `None→median fallback 0 + insufficient_data=true` | `roe null→median` | `Id vs Sg median beda` |
| 04e | `normalize.rs` | `fn sector_median(sector:&str, market:Market)->SectorMedian` `lazy_static HashMap<(Market,String),SectorMedian>` dari `sector-median.json` Id vs Sg terpisah | `FINANCE Id != Sg` | `campur→FAIL` |
| 04f | `normalize.rs` | `fn validate_lookback(lookback,pred_len:usize)->Result<(),ValidationError>` `>512→Err 422 max_context 512` | `520→422`, `400→ok` | `520→422` |
| 04g | `tests` | `#[cfg(test)]` ≥7 | `illiquid excluded`, `volume 0`, `roe median`, `x/y_timestamp`, `lookback 422`, `insufficient_data` | 7 passed |

## Deliverables (per Bagian)
- 04a: `models.rs` +20 baris
- 04b-f: `normalize.rs` 150-220 baris total, `fn <50` each, `no unwrap` `?`, `immutable` clone, `tracing::warn!` jika excluded
- Fixtures: `illiquid-ohlcv.json` 2 rows + `sector-median.json` `{FINANCE:{id:{roe:8.5}, sg:{roe:9.2}}}`
- Constraint: `file 200-400`, `nesting ≤4`, `cargo fmt+clippy` clean, `♻️ Refactor:`

## Verification
```
cargo fmt --check → 0
cargo clippy -p seith-core -- -D warnings → 0
cargo test -p seith-core -- --nocapture → ≥7 passed
rg "unwrap\(\)" crates/seith-core/src/normalize.rs → 0
```

## Peran + Skill + Sub-agent
| Peran | Skill | Sub-agent |
|---|---|---|
| T1 | `seith-market-intelligence`+`tdd-workflow` | `tdd-guide` illiquid |
| `rust-reviewer` | `code-reviewer` | `code-reviewer` |
| `security-reviewer` | `security-review` | `security-reviewer` |
| `refactor-cleaner` | `coding-standards` | `refactor-cleaner` |

## Next Session Prompt
`skill://seith-market-intelligence` + `handoff/01/t1-core` + `04` + 3Q: `max_context 512` + `median per market` + `x/y_timestamp`.
