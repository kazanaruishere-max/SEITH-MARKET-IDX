# Task 03 — E2E Manual BBCA (T1+T2 joint, 4 proses)

## Goal
Buktikan end-to-end BBCA live: ranking dan dossier lewat pipeline real (Sectors → cache → dossier PDF) dan research memo lewat 9router combo SEITH-MARKET-IDX.

## Context
- SSOT: `00-overview.md` this phase + `01-sectors-drift-fix.md` (T1 Authorization + /v2/daily/{symbol}/ done 521bd05) + `02-combo-wire.md` (T2 SEITH_LLM_MODEL done 128d8ba) + `crates/seith-cli/src/commands/ranking.rs` stub + `crates/seith-api/src/handlers.rs:215 items:[]` stub + `apps/analysis/app/main.py` Lite + `AGENTS.md §4.4 secrets §7 DoD`
- Branch: `handoff/08-drift-e2e` from `main 93a3a37` (already has 00+01+02) — worktree `../seith-wt/handoff-08` or current `handoff/08-drift-e2e` — BBCA only, BMRI/BBRI defer (403 WAF)
- Prereq: `main 93a3a37` (T1+T2 merged), `9router PID 22484 :20128` NEVER kill, `SECTORS_API_KEY` + `SEITH_API_KEY` in `.env` server-only
- Skill: `skill://seith-market-intelligence` + `verification-loop` + ritual 3Q

## Scope In / Out
In: Z6 `03-e2e-manual.md` + Z1/Z2 wire minimal to make E2E observable (ranking reads Sectors via client, dossier uses real daily, analysis calls 9router with SEITH-MARKET-IDX) + `research/validation-report.md` + `data/seith.db` observe only
Out: Full 900 ticker scan (defer), ValuationGapMap/Screener (H7b), `apps/kronos-sidecar` no edit, `vendor/*` read-only

## Bagian — Surgical Breakdown
| Bag | File | Struktur / Fn | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `crates/seith-cli/src/commands/ranking.rs` + `crates/seith-api/src/handlers.rs` | ranking reads `SectorsClient::fetch_ohlcv(Id, BBCA, FINANCE)` via `Authorization` + `/v2/daily/BBCA/` | `cargo run -p seith-cli -- ranking --sector FINANCE` returns items with BBCA when key set, falls back fixtures when key absent | `cargo test -p seith-cli` still green, mockito header Authorization |
| b | `data/seith.db` observe | `sqlite3 data/seith.db "SELECT count(*) FROM ohlcv"` | >0 after BBCA fetch, schema via `SqliteRepository` auto-init | `cargo test -p seith-api` integration still green |
| c | `apps/analysis` 9router chain | `POST /synthesize` with `model=SEITH-MARKET-IDX` → `9router :20128/v1/chat/completions` | `curl -H "Authorization: Bearer $SEITH_KEY" model SEITH-MARKET-IDX → 200 PONG x-used-model nvidia/nemotron-3.5-lightning:free` | `uv run pytest -q --cov 96%` still green |
| d | `research/validation-report.md` | manual report + PDF | `cargo run -p seith-cli -- dossier BBCA --pdf` writes PDF to `research/validation-dossier.pdf`, report has BBCA 8300 2025-08-01 live + 9router PONG + data/seith.db count | `cargo test 143` green |

## Deliverables + Acceptance
- `cargo run -p seith-cli -- ranking --sector FINANCE --market id` → `{"success":true,"data":{"items":[...BBCA...],"market":"id"}}` when `SECTORS_API_KEY` set (Authorization + /v2/daily/BBCA/ 200), otherwise empty with disclaimer (graceful)
- `cargo run -p seith-cli -- dossier BBCA --pdf` → PDF bytes `%PDF` with BBCA daily 8300 + disclaimer copy → `research/validation-dossier.pdf` (if possible) or JSON
- `data/seith.db` populated after first Sectors hit (L2 SQLite WAL)
- `research/validation-report.md` — date, BBCA probe (200 + 1 credit), 9router PONG + x-used-model, data/seith.db count, `cargo test 143` + `uv pytest 17` + `cargo fmt/clippy 0`
- `pnpm lint/typecheck 0` unchanged
- Constraint: `fn<50 file200-400 nesting≤4 no dead code no unwrap` + `♻️ Refactor:` — §8c

## Verification
```
cargo fmt --check → 0
cargo clippy -- -D warnings → 0
cargo test → 143 passed
uv --project apps/analysis run pytest -q --cov → 17 passed 96%
# live BBCA (founder key):
curl -H "Authorization: $SECTORS_KEY" https://api.sectors.app/v2/daily/BBCA/ → 200 BBCA.JK 8300
curl -H "Authorization: Bearer $SEITH_KEY" http://localhost:20128/v1/chat/completions -d '{"model":"SEITH-MARKET-IDX",...}' → 200 PONG x-used-model
cargo run -p seith-cli -- ranking --sector FINANCE → items contains BBCA (or graceful empty)
cargo run -p seith-cli -- dossier BBCA --pdf → %PDF or JSON with disclaimer
sqlite3 data/seith.db "SELECT count(*) FROM ohlcv" → >0 (if Sectors hit)
```

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T1+T2 joint | founder + T0 | `seith-market-intelligence` + `verification-loop` | — | E2E 4 proses 8181+3000+8001+8002→20128 20 min |

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/08-drift-e2e` + task `03-e2e-manual.md` + ritual 3Q
