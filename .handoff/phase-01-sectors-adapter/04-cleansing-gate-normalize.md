# Task 04 — Cleansing Gate Normalize (anti-crash illiquid)

## Goal
Kunci `normalize.rs` cleansing: `OHLC` wajib else `excluded`, `volume→0`, `rasio→median per market + insufficient_data`, `x/y_timestamp` derived, `lookback>512→422` — pipeline tidak crash #01-04.

## Context
- SSOT: `AGENTS.md §6 Cleansing + §6c Anti AI Slop Tier-1` + `spec §2 [2] Normalize & Cleansing Gate` + `api-spec §5 Sectors→Core mapping` + `tdd-plan §3-7 Cleansing` + `docs/notes/00-readme.md` ritual 3Q + `fixtures illiquid-ohlcv.json+sector-median.json per market` + `skill://seith-market-intelligence` + `skill://no-ai-slop`
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

## Deliverables + Acceptance (per Bagian)
- 04a: `models.rs` +20 baris — Acceptance: `serde round-trip` Excluded/CleansedBatch
- 04b-f: `normalize.rs` 150-220 baris total, `fn <50` each, `no unwrap` `?`, `immutable` clone, `tracing::warn!` jika excluded — Acceptance: `illiquid.json→excluded len1`, `volume null→0.0`, `520→422`
- 04g: `tests` ≥7
- Fixtures: `illiquid-ohlcv.json` 2 rows + `sector-median.json` `{FINANCE:{id:{roe:8.5}, sg:{roe:9.2}}}`
- Constraint: `file 200-400`, `nesting ≤4`, `cargo fmt+clippy` clean, `♻️ Refactor:`

## Verification
```
cargo fmt --check → 0
cargo clippy -p seith-core -- -D warnings → 0
cargo test -p seith-core -- --nocapture → ≥7 passed
rg "unwrap\(\)" crates/seith-core/src/normalize.rs → 0
skill://no-ai-slop detect → pass (Tier-1 warn)
```

### Accountability Block
```
✅ Terverifikasi: <cmd> → <output> (paste nyata)
⚠️ Belum: Axum 422 integration (05)
🔻 Risiko: median per market campur — deteksi: roe null Id vs Sg beda
♻️ Refactor: extract is_missing_ohlc + sector_median map fn<50
```

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead Otak T0 | opencode sini | `seith-market-intelligence`+`verification-loop` | — | approve 04 |
| T1 Core | sub-agent | `seith-market-intelligence`+`tdd-workflow`+`verification-loop` | `tdd-guide` | TDD illiquid fixtures |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | `normalize.rs` pure fn |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | `lookback>512→422` validate |
| PM Autonomous | `seith-pm` | `git-worktree-manager`+gate | — | **veto merge jika fail** |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca task |
| Doc | `doc-updater` | `remember`+`handoff` | `doc-updater` | sinkron spec |

## Next Session Prompt
`skill://seith-market-intelligence` + `handoff/01-sectors-adapter/t1-core` + `04-cleansing-gate-normalize.md` + ritual 3Q:
1) Gate MI? Anti-crash #01-04 — pipeline tidak panic illiquid, fondasi H4.
2) Jebakan? `max_context 512` + sector median per market #08 + `x/y_timestamp` derived.
3) Test FAIL apa? `illiquid-ohlcv.json→excluded`, `volume null→0`, `lookback 520→422`.
