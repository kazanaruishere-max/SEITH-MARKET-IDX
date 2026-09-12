# Task 01 — Backend Real (Z1)

## Goal
Wire `crates/seith-api` ke `research/backtest-100.json` 100 items: ranking/score/dossier/peer5/anomalies/scan/backtest real + 7 test hijau.

## Context (§8c)
- SSOT: `AGENTS.md §3c Z1 §6 contract §8c fn<50` + `docs/api-spec.md §3 pinned live` + `docs/tdd-plan.md §6`
- Skill: `skill://seith-market-intelligence` + `tdd-workflow` + `verification-loop`
- File: `crates/seith-api/src/backtest_data.rs` (NEW 162L) + `handlers.rs` (~234) + `lib.rs` (+1) + `tests/api.rs` (+130)

## Scope In / Out
In: `load/select/sort/page/to_ranking/find/peer_five/memo` + handlers ranking/score/dossier/anomalies/scan/backtest + pdf schema header + 7 test real.
Out: scoring logic baru, Sectors live batch, kronos bridge edit, web/FE.

## Bagian — Surgical
| Bag | Fn | File | <50 |
|---|---|---|---|
| a | `load_backtest_value/candidates` | `backtest_data.rs` | ya |
| b | `select/sort/page/to_ranking` | `backtest_data.rs` | ya |
| c | `find/peer_five/memo` | `backtest_data.rs` | ya |
| d | ranking/score/dossier wiring | `handlers.rs` | ya |
| e | anomalies/scan/backtest + pdf header | `handlers.rs` | ya |
| f | 7 test real | `tests/api.rs` | ya |

## Deliverables + Acceptance
- `backtest_data.rs` 162L: `total:100`, FINANCE filter = 25, `peer_five` same sector+market QV+cap±50%
- `score BBCA → 61.3 rank44 FINANCE`, unknown ticker → 404 TICKER_NOT_FOUND
- `dossier BBCA peerComparison len 5` + memo contains "Peer 5" + disclaimer
- `anomalies minZ2.0 nonempty sorted desc`, `scan BBCA+BMRI results 2/2`, `pdf %PDF-1.4` + schema header
- `cargo test -p seith-api` 7 baru pass, assertion meaningful

## Verification + Accountability
```
cargo fmt --check → 0
cargo clippy --all-targets -- -D warnings → 0
cargo test -p seith-api → pass (7 baru)
```
- ✅ Terverifikasi: <cmd> → <output>
- ⚠️ Belum: <apa>
- 🔻 Risiko: <1-2> — deteksi: <cara>
- ♻️ Refactor: <apa>

## Peran
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Eksekutor T1 | sub-agent | `seith-market-intelligence` + `tdd-workflow` | `explore` | Implement→Verify 01 |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | fn<50 check |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | no secret leak |
| Refactor | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | Boy Scout §5b |
| PM | `seith-pm` | gate fmt/clippy/test | `seith-pm` | veto jika fail |

## Next Session Prompt
`skill://seith-market-intelligence` + `handoff/12` + `01-backend-real.md` + ritual 3Q → `02-web-complete.md`
