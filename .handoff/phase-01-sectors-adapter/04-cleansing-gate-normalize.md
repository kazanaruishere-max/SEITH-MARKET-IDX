# Task 04 — Cleansing Gate Normalize (anti-crash illiquid)

## Goal
Kunci `seith-core/src/normalize.rs` cleansing gate: `open/high/low/close` WAJIB else `exclude + reason "missing_ohlc"` + `excluded:[{ticker,reason}]`, `volume/amount` null→0.0, rasio null→sector median per market fallback 0 + `insufficient_data:true`, `x/y_timestamp` derived date, `lookback>512→422` guard — pipeline tidak crash di emiten illiquid (anti-pattern #01-#04).

## Context
- SSOT: `AGENTS.md §6 Cleansing` + `docs/spec.md §2 Pipeline [2] Normalize & Cleansing Gate` + `docs/api-spec.md §5 Sectors→Core mapping` + `docs/tdd-plan.md §3-7 Cleansing (volume→0, rasio→median per market, OHLC→exclude, lookback>512→422)` + `docs/notes/00-readme.md` ritual 3Q + `docs/notes/05-anti-patterns.md` #01-#04 + `tests/fixtures/illiquid-ohlcv.json` + `sector-median.json` per market + `skill://seith-market-intelligence` + `seith-dev`
- Dependensi: `01-market-enum-models.md` (Market, OhlcvRow strict) + `03-sectors-batch-client.md` (raw `Vec<OhlcvRow>` dari Sectors + cache) — cleansing consume raw sebelum ke Kronos `H2` (`predict_batch` butuh `open/high/low/close` wajib, `volume/amount` 0 diisi)
- Branch: `handoff/01-sectors-adapter` atau `handoff/01-sectors-adapter/t1-core` (T1: `01+04` core vs T2: `02+03` cache) — file sama `seith-core/src/normalize.rs` + `models.rs`
- Fondasi: `lookback>512` guard di boundary Axum nanti, tapi normalize juga validate agar `predict_batch` tidak panic sidecar `502` (AGENTS Gotcha `max_context 512`); Kronos `open/high/low/close` wajib shape `400×4`

## Scope In / Out
In: `crates/seith-core/src/normalize.rs` (pure fn `cleanse_ohlcv(rows: Vec<OhlcvRow>, market: Market) -> (Vec<OhlcvRow>, Vec<Excluded>)` + `cleanse_fundamentals(f: Fundamentals, median: SectorMedian) -> (Fundamentals, bool insufficient_data)` + `fn sector_median(sector:&str, market:Market)->SectorMedian` via `tests/fixtures/sector-median.json` fallback `0.0` + `x/y_timestamp` derived `date.timestamp()`) + `crates/seith-core/src/models.rs` tambahan `struct Excluded {ticker:String, reason:String}` + `struct CleansedBatch {rows:Vec<OhlcvRow>, excluded:Vec<Excluded>, insufficient_data:bool}` jika perlu + `crates/seith-api/src/handlers.rs` stub guard `lookback>512→422 VALIDATION_ERROR "max_context 512"` (atau di `seith-core` validator fn `fn validate_lookback(n:usize)->Result<(), ValidationError>`).
Out: Cache L1/L2 (`02`), Sectors fetch (`03`), envelope/repository (`05`), Kronos bridge (`H2`), scoring (`H4`) — hanya cleansing pure fn, tidak sentuh IO/http.

## Deliverables + Acceptance
- `crates/seith-core/src/normalize.rs`:
  - `pub struct Excluded { pub ticker: String, pub reason: String }` (`missing_ohlc` | `lookback_exceeds_512` dll)
  - `pub fn cleanse_ohlcv(rows: Vec<OhlcvRow>, market: Market, sector_median: &SectorMedianMap) -> Cleansed { rows.retain open/high/low/close !=0 && not NaN else push Excluded {ticker, reason:"missing_ohlc"}; volume/amount None→0.0; x_timestamp = date.timestamp(), y_timestamp = date.timestamp() + 24*3600; return (cleaned, excluded) }` — immutable: clone rows, tidak mutate input
  - `pub fn cleanse_fundamentals(f: Fundamentals, median: SectorMedian) -> (Fundamentals, bool)` — `roe/margin/leverage/pe/pb None→median[sector][market][field]` fallback `0.0` + `insufficient_data=true` jika fallback
  - `pub fn validate_lookback(lookback: usize, pred_len: usize) -> Result<(), ValidationError>` — `if lookback>512 || pred_len>512 || lookback+pred_len>512 → Err(422 "max_context 512")` (guard boundary, dipanggil Axum handler nanti)
  - `pub fn sector_median(sector:&str, market:Market)->SectorMedian` — read `tests/fixtures/sector-median.json` lazy_static map `HashMap<(Market,String), SectorMedian>` (Id vs Sg terpisah, test cegah median noise #08)
  - Acceptance: `cargo test -p seith-core` ≥7 tests: `cleanse_volume_null→0.0` (illiquid fixture), `cleanse_missing_ohlc→excluded` (OHLC null→excluded len 1 + reason), `cleanse_missing_roe→median FINANCE id` vs `Sg` beda, `cleanse_illiquid_fixture scan excluded` (fixture `illiquid-ohlcv.json` → `excluded`), `x/y_timestamp derived date`, `validate_lookback 520→422` + `400→ok` + `400+20=420 ok`, `insufficient_data flag true` jika fallback 0
- `crates/seith-core/src/models.rs` tambahan jika perlu `Excluded` + `SectorMedian` struct (`roe_median`, `pe_median` dll) — `serde` round-trip
- Constraint: `fn <50 baris` per fn (extract helper `fn is_missing_ohlc(row:&OhlcvRow)->bool`), `file 200-400`, `nesting ≤4`, `no unwrap` (use `Option` + `?`), `no silent swallow` (log `tracing::warn!` jika excluded), `immutable return`, `cargo fmt+clippy` clean, `♻️ Refactor:`
- Fixtures: `tests/fixtures/illiquid-ohlcv.json` (3 rows: volume null, ROE null, OHLC null) + `sector-median.json` (`{ "FINANCE": {"id":{"roe":8.5,"pe":12.0}, "sg":{"roe":9.2,"pe":14.0}} }`)

## Verification (paste output nyata)
```
cargo fmt --check → 0
cargo clippy -p seith-core -- -D warnings → 0
cargo test -p seith-core -- --nocapture → pass (cleanse 7 + market 9 = ≥16, no assertion-less)
cargo test -- --nocapture → pass
# anti-pattern #01-04: rg "unwrap\(\)" crates/seith-core/src/normalize.rs → 0
```
+ Accountability Block: `✅ cargo test -p seith-core → 16 passed (cleanse 7) / ⚠️ Belum: Axum 422 integration / 🔻 Median per market campur — deteksi: roe null Id vs Sg beda / ♻️ Refactor: extract is_missing_ohlc + sector_median map`

## Peran + Skill + Sub-agent (task ini)
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T1 Core | sub-agent | `seith-market-intelligence` + `tdd-workflow` | `tdd-guide` (illiquid fixtures) | Implement→Verify→Refactor TDD red-green |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | `normalize.rs` pure fn |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | validation `lookback>512→422`, ticker regex |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca task |

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/01-sectors-adapter/t1-core` + task `04-cleansing-gate-normalize.md` + ritual 3Q: 1) gate MI? anti-crash #01-#04 fondasi H4. 2) jebakan? `max_context 512` + sector median per market #08 + x/y_timestamp derived. 3) test FAIL? `illiquid-ohlcv.json→excluded`, `volume null→0`, `lookback 520→422`.
