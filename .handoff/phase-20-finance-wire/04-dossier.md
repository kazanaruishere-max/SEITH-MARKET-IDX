# Task 04 — Wire `dossier` → real Components + dynamic memo

## Goal
`dossier.rs` not `80.0/50.0/"fund"/"tech"/"synth"` — real `Components` from `pipeline::scored_for` + `dynamic_memo` via `sector_median` + QV/ER/flag.

## Context
- SSOT: `seith-core/dossier.rs:41 compose` + `pipeline.rs:scored_for` + `normalize::sector_median` + `models::TICKER_RE`
- Dependensi: 02-score done
- Branch: `handoff/20-finance-wire`, Z1

## Scope In / Out
In: `crates/seith-cli/src/commands/dossier.rs`, reuse `pipeline.rs`, `dossier.rs` no change to compose
Out: `ranking.rs/radar.rs`, web PDF vector, `analysis :8002` no LLM

## Bagian — Surgical
| Bag | File | Fn | Acceptance | Fail |
|---|---|---|---|---|
| a | `dossier.rs` | `dynamic_memo(ticker, ScoredTicker)→ResearchSection` | `fundamental_memo` contains `ROE x vs median y "di atas/di bawah"` + `QV kuat/moderat/lemah`, `technical_memo` contains `MA20 proxy ponytail`, `synthesizer_memo` merges both + `Bukan rekomendasi` | memo == "fund" fail |
| b | `dossier.rs` | `run_json(market, ticker)→String` | `scored_for` Some → `compose(t,market,score,comps,[],Kronos{0.01},memo)` real, None → `TICKER_NOT_FOUND` | ticker not found |
| c | `dossier.rs` | `run_pdf` | same memo + `to_pdf_bytes` still `%PDF` header | — |
| d | tests | `dossier_json_ok` | `jq .data.breakdown.expected_return` exists, `fundamental_memo` contains `median\|sektor`, not `fund` | assert fail |

## Deliverables + Acceptance
- `cargo run -p seith-cli -- dossier BBCA --market id | jq .data.breakdown|keys` → `expected_return/anomaly_z/quality_value/sector_mom` not all 50.0, variatif per ticker
- `jq .data.research.fundamental_memo` contains `median` or `sektor`, not literal `fund`
- `pdf` still starts `%PDF`

## Verification
```
cargo fmt --check → 0
cargo clippy -p seith-cli -- -D warnings → 0
cargo test -p seith-cli dossier -- --nocapture → 3 passed
cargo run -p seith-cli -- dossier BBCA --market id | jq .data.breakdown
cargo run -p seith-cli -- dossier BBCA --market id | jq .data.research.fundamental_memo
```

## Peran + Skill
| Peran | Eksekutor | Skill | Sub-agent |
|---|---|---|---|
| T1 | sub-agent | `seith-market-intelligence` + `no-ai-slop` + `seith-quant` | `seith-quant-reviewer` |

## Note
Kronos `chartPoints` remains empty `degraded true` — per constraint JANGAN sentuh Kronos sidecar di task ini.
