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
cargo clippy --all-targets -- -D warnings → 0 (fixed slice::from_ref + ":memory:" + Matcher unused in 01)
cargo test → 143 → 145 passed (post-merge ab411df: 20 sectors-client + 7 seith-api + 16 seith-cli + 86 seith-core + 16 api)
uv --project apps/analysis run pytest -q --cov → 17 passed 96% (test_three_agent + test_contract)
pnpm lint → 0 / pnpm typecheck → 0 (if web touched, else skip)
# live BBCA (founder key, BBCA only — BMRI/BBRI 403 WAF defer):
curl -H "Authorization: $SECTORS_KEY" https://api.sectors.app/v2/daily/BBCA/?start=2025-08-01&end=2025-08-02 → 200 [{"symbol":"BBCA.JK","close":8300}] 1 credit (or 403 fallback fixtures/bbca-ohlcv-400.json)
curl -H "Authorization: Bearer $SEITH_KEY" http://localhost:20128/v1/chat/completions -d '{"model":"SEITH-MARKET-IDX","messages":[{"role":"user","content":"PONG"}],"max_tokens":8}' → 200 PONG x-used-model nvidia/nemotron-3.5-lightning:free cost 0
# E2E (04-e2e-execution): ranking --sector FINANCE → success true (items BBCA or graceful [] + disclaimer); dossier BBCA --pdf → %PDF + Bukan rekomendasi; data/seith.db 0 rows stub (ranking handler items:[] wire defer PR34), sqlite3 not in PATH Windows
```

## Accountability Block — Task 03 (spec only, execution in 04)
- ✅ Terverifikasi: `cargo fmt --check → 0`, `cargo clippy --all-targets -- -D warnings → 0` (post clippy fix), `cargo test → 145 passed`, `uv pytest 17 passed`, docs/api-spec.md §7 synced
- ⚠️ Belum: live E2E execution — deferred to `04-e2e-execution.md` (BBCA 61 rows, PONG, dossier %PDF proven there with `research/validation-report.md`)
- 🔻 Risiko: ranking `items:[]` stub + DB 0 until handler wired — mitigasi fixtures fallback + 04 verification table with credit/billed notes
- ♻️ Refactor: spec only, no code — DRY with 04, keep surgical table narrow (4 bags)

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T1+T2 joint | founder + T0 | `seith-market-intelligence` + `verification-loop` | — | E2E 4 proses 8181+3000+8001+8002→20128 20 min |

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/08-drift-e2e` + task `03-e2e-manual.md` + ritual 3Q
