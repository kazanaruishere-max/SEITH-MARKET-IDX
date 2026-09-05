# Task 01 — Market Enum + Strict Domain Models

## Goal
Kunci `Market` enum `Id|Sg` (default `Id`) + strict domain schemas `OhlcvRow`, `Fundamentals`, `Ticker` dengan `serde+validator`, `deny_unknown_fields`, ticker `^[A-Z0-9]{3,6}$`, `chrono::DateTime<Utc>` — kontrak wire antar-service solid sejak H1.

## Context
- SSOT: `AGENTS.md §6 Contract Rules` + `docs/spec.md §3 Domains` + `docs/api-spec.md §1 Schemas` + `docs/tdd-plan.md §3 Critical Path 3` + `docs/adr/0001-stack` Market enum + `docs/notes/00-readme.md` ritual 3Q + `skill://seith-market-intelligence`
- Dependensi: — (task pertama phase, tidak ada dependensi; semua task lain butuh Market key)
- Branch: `handoff/01-sectors-adapter` atau `handoff/01-sectors-adapter/t1-core` (paralel T1: `01+04` core vs T2: `02+03` cache)
- Fondasi: `Market` jadi key `market:sector:ticker:date` (anti-pattern #08) + `SCHEMA_VERSION` wire evolusi (ADR 0002) — tanpa ini cache median noise & drift H5

## Scope In / Out
In: `crates/seith-core/src/market.rs` (enum `Market {Id, Sg}` + `Default Id` + `as_str()` + `base_path()` + `FromStr` + `Display` + `serde` lowercase `id|sg`), `crates/seith-core/src/models.rs` (`OhlcvRow {ticker, market, date: DateTime<Utc>, open, high, low, close, volume, amount, x_timestamp, y_timestamp}`, `Fundamentals {ticker, market, sector, roe, margin, leverage, pe, pb}`, validation `deny_unknown_fields`, ticker regex, timestamp aware), `crates/seith-core/src/lib.rs` export + `SCHEMA_VERSION`, fixtures `tests/fixtures/sector-median.json` per market reference.
Out: Cache trait (`02`), Sectors REST client (`03`), cleansing logic volume/median (`04`), envelope/repository (`05`) — hanya enum + models strict, tidak sentuh IO/cache.

## Deliverables + Acceptance
- `crates/seith-core/src/market.rs`:
  - `#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)] enum Market { Id, Sg }` + `Default` = `Id`
  - `impl Market { fn as_str(&self)->&'static str { id|sg }, fn base_path(&self)->&'static str { /v2/indonesia/... vs /v2/singapore/... }, fn is_default(&self)->bool }`
  - `FromStr` parse `id|sg` case-insensitive, error `ValidationError` jika invalid; `Display` lowercase; `serde` rename lowercase
  - Acceptance: `Market::default()==Id`, `Market::from_str("sg")==Sg`, `serde_json round-trip Market::Sg == "sg"`, `Market::Sg.base_path() == "/v2/singapore/transaction/daily"`
- `crates/seith-core/src/models.rs`:
  - `OhlcvRow` + `Fundamentals` dengan `#[derive(Serialize, Deserialize, Validate, Clone)]` + `#[serde(deny_unknown_fields)]`, ticker `#[validate(regex(path="TICKER_RE"))]` `^[A-Z0-9]{3,6}$`, `date: DateTime<Utc>` (aware, serialize RFC3339), `open/high/low/close: f64`, `volume/amount: Option<f64>` (none→0 di cleansing `04`, bukan di model), `x_timestamp/y_timestamp: Option<i64>` derived dari date
  - `Fundamentals` `roe/margin/leverage/pe/pb: Option<f64>` + `sector: String` + `market: Market`
  - Acceptance: `validator` reject `ticker="ab"` (too short), `ticker="BBCA!"` (regex), `date` naive (no tz) reject atau converted aware, `deny_unknown_fields` reject `{"ticker":"BBCA","unknown":1}`, round-trip `serde_json::to_string → from_str` identik per model (2 tests), fixture `bbca-ohlcv-400.json` 400 rows parse ok, `dbs-sg-ohlcv-400.json` parse ok
- `crates/seith-core/src/lib.rs`: `pub mod market; pub mod models; pub const SCHEMA_VERSION: &str = "1.0.0";` — export clean
- Constraint: `fn <50 baris`, `file 200-400 baris`, `nesting ≤4`, `no unwrap` di parsing (use `Result`), `cargo fmt+clippy` clean, `immutable return` (clone, bukan mutate), `♻️ Refactor:` wajib di commit
- Test file: `crates/seith-core/tests/market_models_test.rs` atau `src/market.rs #[cfg(test)]` + `src/models.rs #[cfg(test)]` — minimal 6 tests: `default Id`, `parse sg case-insensitive`, `serde round-trip Market`, `ticker regex reject`, `deny_unknown_fields reject`, `OhlcvRow round-trip + Utc aware`

## Verification (paste output nyata)
```
cargo fmt --check → 0
cargo clippy -p seith-core -- -D warnings → 0
cargo test -p seith-core -- --nocapture → pass (market enum 3 + models 6 + round-trip 2 = ≥9, no assertion-less)
cargo test -- --nocapture → pass (workspace)
```
+ Accountability Block: `✅ Terverifikasi: cargo test -p seith-core → 9 passed / ⚠️ Belum: integration cache key / 🔻 Risiko: ticker regex over-permissive — deteksi: validator unit negative / ♻️ Refactor: extract TICKER_RE lazy_static, split models.rs per struct`

## Peran + Skill + Sub-agent (task ini)
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T1 Core | sub-agent | `seith-market-intelligence` + `tdd-workflow` | `tdd-guide` (matrix ticker/market fixtures) | Implement→Verify→Refactor TDD red-green |
| Arsitek | `architect` | `senior-architect` | `architect` | **SEBELUM coding** — audit Market enum wire + file sizing |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | crate `seith-core` models |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca task — `fn<50 file200-400` |

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/01-sectors-adapter/t1-core` + task `01-market-enum-models.md` + ritual 3Q: 1) gate MI? fondasi Market key anti #08. 2) jebakan? `deny_unknown_fields` + `DateTime<Utc>` aware vs naive. 3) test FAIL? `ticker="ab"→422`, `unknown field→422`, `Market::Sg serde="sg"` + round-trip.
