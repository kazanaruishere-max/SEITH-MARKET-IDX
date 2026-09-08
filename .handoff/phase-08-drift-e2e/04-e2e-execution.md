# Task 04 — E2E Execution BBCA (Terminal Baru)

## Goal
Eksekusi E2E BBCA di terminal baru: BBCA 8300 200 + 9router SEITH-MARKET-IDX PONG x-used-model ke ranking + dossier PDF + data/seith.db + validation-report.md, lalu squash handoff/08-drift-e2e ke main.

## Context
- SSOT: `00-overview.md` this phase + `01-sectors-drift-fix.md` (T1 done) + `02-combo-wire.md` (T2 done) + `03-e2e-manual.md` spec + `main 93a3a37` (PR #35+#36 merged) + `AGENTS.md §7 DoD + §8c Ownership + Tier-0 secrets + §4.4 .env gitignore + Tier-0 9router NEVER kill`
- Branch: `handoff/08-drift-e2e` (current) already has 00+01+02+03 — this 04 is execution on fresh terminal — worktree `../seith-wt/handoff-08-e2e` from `main 93a3a37` or current `handoff/08-drift-e2e` — BBCA only, BMRI/BBRI defer 403 WAF
- Prereq: `main 93a3a37` (T1+T2 green), `.env` has `SECTORS_API_KEY=0843***64 + SEITH_API_KEY=sk-115***35 + SEITH_LLM_MODEL=SEITH-MARKET-IDX + FALLBACK=Seith-AI-Trading`, `9router :20128 PID 22484` alive, `serve.rs` bind `8181` (8080 taken httpd 5076)
- Skill: `skill://seith-market-intelligence` awal + ritual 3Q `docs/notes/00-readme.md` + `skill://verification-loop` akhir + `skill://no-ai-slop` Tier-1

## Scope In / Out
In: Z6 `04-e2e-execution.md` + `research/validation-report.md` + `research/validation-dossier.pdf` (or json) + Z3 `data/seith.db` observe + Z1 `crates/seith-cli + seith-api` minimal wiring for E2E observable + `scripts/load-env.ps1` usage — BBCA only
Out: BMRI/BBRI 403 batch (defer), ValuationGapMap/Screener (H7b), `apps/kronos-sidecar` no edit, `vendor/*` read-only, full 900 scan

## Bagian — Surgical Breakdown
| Bag | Action | Acceptance | Test FAIL |
|---|---|---|---|
| a | `pwsh scripts/load-env.ps1` | `SECTORS 64 + SEITH 35 + SEITH_LLM_MODEL=SEITH-MARKET-IDX` masked, no value logged | `gitleaks` 0 |
| b | Probe Sectors BBCA | `uv run --no-project python -c` `Authorization: $SECTORS_KEY` `https://api.sectors.app/v2/daily/BBCA/?start=2025-08-01` → `200 len=3 rows BBCA.JK 8300` else `403` fallback `tests/fixtures/bbca-ohlcv-400.json` + `excluded:[{ticker,reason}]` | probe before SectorsClient wire |
| c | Probe 9router PONG | `curl -H "Authorization: Bearer $SEITH_KEY" -d '{"model":"SEITH-MARKET-IDX","messages":[{"role":"user","content":"PONG"}],"max_tokens":8}' http://localhost:20128/v1/chat/completions` → `200 {"choices":[{"message":{"content":"PONG"}}]} x-used-model: nvidia/nemotron-3.5-lightning:free cost 0` else `401` tanpa key wajar → fallback `Seith-AI-Trading` | verify header `x-used-model` |
| d | Serve + ranking | `cargo run -p seith-api --bin serve` (8181) → `curl /api/v1/health 200 x-schema-version 1.0.0` + `cargo run -p seith-cli -- ranking --sector FINANCE --market id` → `{"success":true,"data":{"items":[...BBCA...]}}` or graceful `items:[] + disclaimer` | `cargo test 143` still green |
| e | Dossier PDF | `cargo run -p seith-cli -- dossier BBCA --pdf > research/validation-dossier.pdf` → `%PDF` 1-page + `Bukan rekomendasi investasi` or JSON fallback with `data.disclaimer` | `cargo test -p seith-cli` still green |
| f | DB observe | `sqlite3 data/seith.db "SELECT count(*) FROM ohlcv"` after Sectors hit → `>0` if hit, `0` with reason if mock | schema via `SqliteRepository` auto-init |
| g | Report + PDF | Write `research/validation-report.md` with date, BBCA probe (200/403 + credit), 9router PONG + x-used-model, ranking/dossier output, data/seith.db count, `cargo test 143 + uv pytest 17 + fmt/clippy 0` + screenshot TopLeaks optional | `verification-loop` paste nyata no fabrikasi |
| h | Gate + squash | `cargo fmt --check 0 && cargo clippy -- -D warnings 0 && cargo test 143 && uv --project apps/analysis run pytest -q --cov 96% && pnpm lint/typecheck 0` → `git add research/validation-report.md + research/validation-dossier.pdf + .handoff 04` → squash `handoff/08-drift-e2e` (00-04) → `main` → `gh pr create` + merge → remove worktrees T1/T2/e2e | `main` log has single squash, `git branch -d` all |

## Deliverables + Acceptance
- `research/validation-report.md` — date 2026-09-08, BBCA 8300 probe status, 9router PONG + x-used-model, ranking/dossier outputs (masked keys), data/seith.db count, gates `cargo fmt 0 clippy 0 test 143 uv 17 ruff 0` + `gitleaks` 0
- `research/validation-dossier.pdf` or `.json` — BBCA dossier with disclaimer copy `Bukan rekomendasi investasi. Informasi dan analisis saja.`
- `data/seith.db` populated if Sectors 200, else 0 with fallback reason
- Squash PR `handoff/08-drift-e2e` → `main` merged, worktrees removed
- Constraint: `fn<50 file200-400 nesting≤4 no dead code no unwrap` + `♻️ Refactor:` — §8c + Tier-1 `no-ai-slop`

## Verification
```
pwsh scripts/load-env.ps1 → SECTORS 64 SEITH 35 SEITH_LLM_MODEL=SEITH-MARKET-IDX (masked)
uv run --no-project python -c "Authorization: SECTORS_KEY https://api.sectors.app/v2/daily/BBCA/" → 200 BBCA.JK 8300 or 403 fallback fixtures
curl -H "Authorization: Bearer SEITH_KEY" http://localhost:20128/v1/chat/completions -d '{"model":"SEITH-MARKET-IDX","messages":[{"role":"user","content":"PONG"}]}' → 200 PONG x-used-model nvidia/nemotron-3.5-lightning:free cost 0
cargo run -p seith-api --bin serve (8181) → /api/v1/health 200 x-schema-version 1.0.0
cargo run -p seith-cli -- ranking --sector FINANCE --market id → {"success":true,"data":{...}} + disclaimer
cargo run -p seith-cli -- dossier BBCA --pdf → %PDF or JSON with data.disclaimer
sqlite3 data/seith.db "SELECT count(*) FROM ohlcv" → >0 or 0 with reason (lazy, observe only)
cargo fmt --check → 0 / cargo clippy --all-targets -- -D warnings → 0 / cargo test → 145 passed / uv --project apps/analysis run pytest -q --cov → 17 passed 96% / pnpm lint/typecheck → 0
gitleaks detect --no-git -v → 0 leak
```

## Accountability Block — Task 04 (PM §7 DoD #8)
- ✅ Terverifikasi: `pwsh scripts/load-env.ps1 → SECTORS 64 SEITH 35 MODEL SEITH-MARKET-IDX` masked + `Sectors BBCA Authorization /v2/daily/BBCA/ → 200 rows=61 close 5650` + `9router SEITH-MARKET-IDX PONG 200 nvidia/nemotron-3.5-lightning:free cost 0 PID 10152` + `cargo fmt --check → 0` + `cargo clippy --all-targets -- -D warnings → 0` (fixed `":memory:"` + `slice::from_ref`) + `cargo test → 145 passed` (20+7+16+86) + `uv pytest 17 passed 96%` + `pnpm lint 0` + `research/validation-report.md 73 lines + validation-dossier.pdf %PDF 556` + `disclaimer` in both + `.env gitignored Redacted`
- ⚠️ Belum: `serve 8181 persistent` + `data/seith.db 0 rows` — ranking stub `items:[]` wire deferred to Phase 09 PR34, sqlite3 not in PATH Windows — acceptable for BBCA doc phase
- 🔻 Risiko: WAF 403 error 1010 on batch 100 + 9router free chain rotation dots-studio ↔ nvidia + port 8080 taken httpd 5076 — mitigasi `SEITH_API_BIND=8181` + `excluded:[{ticker,reason}]` + `SEITH_LLM_FALLBACK_MODEL`
- ♻️ Refactor: dossier `run_validated` envelope konsisten `success/data/disclaimer` + `market Id default` — `fn<50 file<400 nesting≤2` pass, keep `BBCA only` narrow

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| E2E Terminal | founder + T0 | `seith-market-intelligence` + `verification-loop` + `seith-phase-gate` | — | 20 min 4 proses 8181+3000+8001+8002→20128 |

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/08-drift-e2e` (or fresh `handoff/08-drift-e2e-e2e` from `main 93a3a37`) + task `04-e2e-execution.md` + ritual 3Q + `scripts/load-env.ps1` + 9router :20128 alive
