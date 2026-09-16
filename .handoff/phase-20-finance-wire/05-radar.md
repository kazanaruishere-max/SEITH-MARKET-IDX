# Task 05 — New `radar` → Top5 |Z| or vol>2σ honest

## Goal
New `radar --sector FINANCE` → Top5 flagged `|Z|>2 OR vol>2σ` sorted `|Z| desc`, honest `reason` `z=X vol=Y | catalyst check: not_available_yet` — never fake `no EPS change`.

## Context
- SSOT: `seith-core/anomaly/volume.rs:10 volume_spike std>EPS && (vol-mean)/std>2` + `16 anomaly_flag flag=fz||vs reason "z=...|vol>2σ"` + `pipeline::scored_all` + `ranking/service`
- Dependensi: 03-ranking done (`scored_all` filtered flag)
- Branch: `handoff/20-finance-wire`, Z1 `crates/seith-cli`

## Scope In / Out
In: `crates/seith-cli/src/{cli.rs (new Radar variant),commands/radar.rs (new),commands/mod.rs,main.rs (new arm),pipeline.rs}` reuse anomaly, no new dep
Out: `migrations/001_cache.sql` schema, web, Kronos, LLM

## Bagian — Surgical
| Bag | File | Fn | Acceptance | Fail |
|---|---|---|---|---|
| a | `cli.rs` | `Commands::Radar {sector,market,json}` | clap variant added, `effective_market` same | parse fail |
| b | `commands/radar.rs` | `run(market, sector)->String` | `scored_all` → `retain flag` → sort `|Z| desc` → take 5 → map `json {ticker,market,sector,mispricingScore,anomalyZ,flag:true,reason:"z=..| catalyst check: not_available_yet"}` + `note` upgrade path | <5 items → return len |
| c | `commands/radar.rs` | `run_validated` | 422 on bad market | — |
| d | `main.rs` | match `Commands::Radar` arm | `println! run_validated` | — |
| e | tests | `radar_ok_shape` | `success true`, items array len ≤5, each `reason` contains `not_available_yet`, each `flag true` | fake reason fail |
| f | docs | radar note | `note: catalyst check pending — QoQ EPS history not in snapshot` | — |

## Deliverables + Acceptance
- `cargo run -p seith-cli -- radar --sector FINANCE --market id | jq .data.items` → 1-5 items each `flag:true`, `reason` contains `z=` or `vol` + `not_available_yet`, `mispricingScore` differs per ticker
- `cargo run -p seith-cli -- radar --sector FINANCE --market id | jq -r '.data.items[] | "\(.ticker) \(.reason)"'` → specific per ticker, not static string
- Never `"no EPS change (snapshot)"` claim — honest `pending` status

## Verification
```
cargo fmt --check → 0
cargo clippy -p seith-cli -- -D warnings → 0
cargo test -p seith-cli radar -- --nocapture → 2 passed
cargo run -p seith-cli -- radar --sector FINANCE --market id | jq .data.items
cargo run -p seith-cli -- radar --sector FINANCE --market id | jq -r '.data.note'
```

## Peran + Skill
| Peran | Eksekutor | Skill | Sub-agent |
|---|---|---|---|
| T2 | sub-agent | `seith-market-intelligence` + `seith-data` + `verification-loop` | `seith-data-reviewer` |

## Definition of Done — Phase_gate
- All 01-05 green + `cargo fmt+clippy+test` workspace + `gitleaks 0` + dual-review
- Manual proofs: `score BBCA≠BBRI`, `ranking FINANCE ≥15`, `dossier BBCA memo dynamic`, `radar Top5 honest`, `sqlite COUNT(*)≥400`
- `Accountability Block 6 contexts 150 tests` + `♻️ Refactor: extract pipeline mean_std/ma_proxy`
