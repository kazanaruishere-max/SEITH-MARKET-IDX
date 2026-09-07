# Task 02 — CLI clap + Dossier Compose + Market Flag

## Goal
Expand `crates/seith-cli` — `seith ranking|score|dossier|scan --market id|sg --json --pdf` emit envelope JSON identik REST + `crates/seith-core/src/dossier.rs` `compose → DossierJson → PDF bytes`.

## Context
- SSOT: `docs/api-spec.md §3 CLI ≡ REST §10` + `docs/spec.md §2[7] Dossier §7b Z1` + `crates/seith-cli/src/main.rs 54L stub` + `crates/seith-core/src/scoring+anomaly+ranking DONE` + `AGENTS.md §3c Z1 §6 envelope`

## Scope In / Out
In: Z1 `crates/seith-cli/src/{main.rs, cli.rs, commands/{ranking,score,dossier,scan}.rs}` + Z1 `crates/seith-core/src/dossier.rs` + tests CLI contract
Out: Axum handlers (01), `apps/web` (03), sidecars (verify only), `sectors-client` no edit

## Bagian — Surgical
| Bag | File | Fn | Acceptance | Test FAIL |
|---|---|---|---|---|
| 02a | `seith-core/dossier.rs` | `struct Dossier {ticker,market,score,breakdown,peerComparison,kronos,chartPoints,research,disclaimer} fn compose(ticker,market,scores,peers,kronos,memos) -> Dossier` inject disclaimer always | `compose always has disclaimer` | `disclaimer missing→FAIL` |
| 02b | `dossier.rs` | `fn to_pdf_bytes(dossier: &Dossier) -> Vec<u8>` simple PDF header `%PDF` + text (no heavy crate) — Web uses `@react-pdf/renderer` | `bytes starts %PDF` | `not pdf→FAIL` |
| 02c | `seith-cli/cli.rs` | `Cli {market: Market default Id, command}` `Market::from_str` validate 422 on bad `--market xx` | `--market sg ok`, `--market xx 422` | `bad market 0→FAIL` |
| 02d | `commands/ranking.rs` | `fn run(sector, market) -> Envelope` call `seith-api` trait or offline mock scoring — print `Envelope::ok(data)` JSON | `seith ranking --json → success true` | `no envelope→FAIL` |
| 02e | `commands/dossier.rs` | `fn run(ticker, market, pdf:bool)` ticker `^[A-Z0-9]{3,6}$` normalize `BBCA.JK→BBCA` + `--pdf → pdf bytes` else json | `BBCA.JK→BBCA`, `--pdf → %PDF` | `JK not normalized→FAIL` |
| 02f | `commands/scan.rs` | `fn run(tickers 1-50, market)` split `,` validate 1-50 else 422 + print `excluded` | `51→422` | `no 422→FAIL` |
| 02g | `main.rs` | wire `Cli::parse()` match → commands → `println!(json)` `anyhow` `?` | `cargo run -- --help` lists 4 cmds | `missing cmd→FAIL` |

## Deliverables
- `dossier.rs 80-120L fn<50 no unwrap` + `cli.rs 40L` + `commands/* 40L each` + `main.rs 30L` — total `seith-cli 200-350L`
- `cargo test -p seith-cli 4 passed` — `assert_cmd` envelope ≡ REST `market id|sg`

## Verification
```
cargo fmt --check → 0
cargo clippy -p seith-cli -- -D warnings → 0
cargo test -p seith-cli -- --nocapture → 4 passed (ranking/score/dossier/scan envelope)
cargo run -p seith-cli -- ranking --market sg --json → {"success":true,"data":{"market":"sg"}}
cargo run -p seith-cli -- dossier BBCA.JK --pdf --market id → %PDF
```

### Accountability Block
```
✅ Terverifikasi: <cmd> → <output> paste nyata
⚠️ Belum: Web consume (03)
🔻 Risiko: CLI/REST drift → mitigasi contract test envelope identik mockito
♻️ Refactor: extract normalize_ticker(), validate_market() shared seith-core/market.rs
```

## Peran + Skill
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T2 CLI | sub-agent | `seith-market-intelligence`+`tdd-workflow` | `tdd-guide` | TDD cli envelope+market |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | cli edge |
| PM | `seith-pm` | gate | — | veto |

## Next
`skill://seith-market-intelligence` + `handoff/05-hybrid-t2-cli` + `02-cli-dossier.md` + ritual 3Q: gate? `cli --json ≡ REST envelope`. jebakan? `BBCA.JK normalize + market 422 + --pdf %PDF`. test FAIL? `51 tickers→422`, `bad market→422`.
