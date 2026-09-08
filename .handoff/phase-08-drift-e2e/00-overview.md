# Phase 08 — Drift Fix + E2E Manual (2 Terminal) — Overview

## Goal
Betulkan drift Sectors header/path + wire SEITH-MARKET-IDX combo, lalu buktikan end-to-end 60s ranking ke dossier PDF dengan data real.

## Context
- SSOT: `AGENTS.md §3c Seven Zones §8b Branch §8c Ownership §7 DoD` + `docs/prd.md §4 Core Derived Insights §7 Journey 60s→dossier→PDF §8 Judging 40/30/30` + `docs/spec.md §2 Pipeline 8 gerbang §4 Scoring §5 Cache` + `docs/api-spec.md §1 envelope §3 ranking §4 schemas §6 Repository §10 9router` + `docs/tdd-plan.md` + `docs/kronos-notes.md` + `docs/notes/00-readme.md` ritual 3Q + `2508.02739v1.pdf`
- Skill wajib: `skill://seith-market-intelligence` awal T1/T2 + `skill://no-ai-slop` Tier-1 + `skill://verification-loop` akhir + `skill://git-worktree-manager` + `skill://seith-phase-gate`
- Prereq DONE: `main 76d7208` README Kaza bilingual 400 baris + env 4 file + serve bin 8181 + 9router SEITH-MARKET-IDX 200 PONG via nemotron-3.5-lightning:free + Sectors BBCA 8300 2025-08-01 live 200 + cargo 143 hijau
- Drift ditemukan: `crates/sectors-client/src/client.rs` pakai `X-API-Key` + `/v2/indonesia/transaction/daily?ticker=` salah, docs `Authorization` + `/v2/daily/{symbol}/` benar. `market.rs base_path()` obsolete. `handlers::ranking:215 items:[]` hardcode. `data/seith.db` lazy.
- Zona: Z1 `crates/sectors-client + seith-core/market` + Z2 `apps/analysis + web/.env` + Z5 `.env.example` + Z6 `.handoff/phase-08-drift-e2e` + Z7 `scripts` — Z3 `data/seith.db` verify only

## Scope In / Out
In: Z1 `crates/sectors-client/src/client.rs` header/path + `crates/seith-core/src/market.rs` base_path + mockito tests + `crates/seith-core/src/config.rs` SEITH_LLM_MODEL + `crates/seith-api/src/analysis.rs` pass model + `apps/analysis/.env.example` + `.env.example` + `apps/analysis/app/main.py` default combo + Z6 handoff 00-03 + Z2 wire only — 2 terminal file-disjoint
Out: `apps/kronos-sidecar` no edit, `handlers::ranking` real Sectors wire defer PR34, `ValuationGapMap/Screener` defer H7b, `vendor/*` read-only, full 900 ticker scan defer

## WBS — Task Breakdown
| # | Task file | Slice | Depedensi | Terminal |
|---|---|---|---|---|
| 01 | `01-sectors-drift-fix.md` | client.rs + market.rs header/path + tests | — | T1 Rust |
| 02 | `02-combo-wire.md` | SEITH_LLM_MODEL env + analysis wire | — | T2 Python+env |
| 03 | `03-e2e-manual.md` | 4 proses + ranking + dossier PDF + validation-report (spec) | 01+02 | T1+T2 joint |
| 04 | `04-e2e-execution.md` | E2E BBCA terminal baru — live probe + PDF + validation-report + squash ke main | 01+02+03 doc | E2E fresh |

Dependensi: `H7 76d7208 → 01∥02 file-disjoint (PR #35+#36 merged 93a3a37) → 03 spec → 04 execution BBCA → squash handoff/08-drift-e2e → PR34 H6 Freeze → PR35 H7b → Submit 30 Sep`. Cross-zona dilarang §3c. `9router PID 22484 NEVER kill`.

## Definition of Done — Phase 08
1. `crates/sectors-client` header `Authorization` + path `/v2/daily/{symbol}/` per docs.sectors.app, `market.rs` base_path `/v2/daily` (Id) `/v2/singapore/daily` (Sg), mockito `200/401/403/404/422/429` hijau
2. `cargo fmt --check 0` + `cargo clippy -- -D warnings 0` + `cargo test 143` + `uv --project apps/analysis run pytest -q --cov 96%`
3. `SEITH_LLM_MODEL=SEITH-MARKET-IDX` di `.env.example` + `apps/analysis/.env.example` + `config.rs` read + `analysis.rs` pass + `main.py` default, probe `Authorization: Bearer SEITH_API_KEY` + model SEITH-MARKET-IDX 200 PONG x-used-model
4. E2E manual 20 menit: `serve 8181` + `web 3000` + `kronos 8001` + `analysis 8002→9router 20128` hidup, `ranking --sector FINANCE` + `dossier BBCA --pdf` + `data/seith.db` populated + `research/validation-report.md` + screenshot TopLeaks
5. `refactor-cleaner` fn<50 file200-400 nesting≤4 + `♻️ Refactor:` per task
6. Dual-review `rust-reviewer ∥ security-reviewer` PASS + `seith-phase-gate`
7. Docs sinkron `docs/api-spec.md §2 Sectors mapping` + README proof BBCA — `doc-updater` no drift
8. Accountability `✅/⚠️/🔻/♻️` per task + `verification-loop` paste nyata no fabrikasi + `gitleaks` no leak

## Peran + Skill + Sub-agent Matrix
| Peran | Eksekutor | Skill WAJIB | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead T0 | opencode sini | `seith-market-intelligence` + `verification-loop` + `seith-phase-gate` | — | Understand→Plan→Document + verify 03 |
| Founder | User | — | — | SECTORS key real + 9router dashboard SEITH-MARKET-IDX key rotation |
| PM | `seith-pm` | `git-worktree-manager` + gate | `seith-pm` | orkestrasi handoff/08 + veto if zone fail |
| T1 Rust | sub-agent | `seith-market-intelligence` + `tdd-workflow` + `verification-loop` | `explore` | 01 Z1 drift fix TDD |
| T2 Env+Python | sub-agent | `seith-market-intelligence` + `tdd-workflow` + `verification-loop` | `explore` | 02 Z1+Z2 combo wire |
| T1+T2 Joint | founder+T0 | — | — | 03 E2E 4 proses |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | 01+02 crates |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | key Authorization + SEITH_API_KEY not log |
| Refactor | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca tiap task §5b |

## Branch & Worktree
- Parent: `handoff/08-drift-e2e` dari `main 93a3a37` (T1+T2 merged PR #35+#36) — current branch `handoff/08-drift-e2e` with 00-04 docs — `../seith-wt/handoff-08-e2e` fresh from `main 93a3a37` for 04 execution
- T1: `handoff/08-drift-e2e-t1-rust-client` → `main` PR #35 merged
- T2: `handoff/08-drift-e2e-t2-combo-wire` → `main` PR #36 merged
- 04 E2E: `handoff/08-drift-e2e-e2e` (or current `handoff/08-drift-e2e` with 04) fresh worktree `../seith-wt/handoff-08-e2e` — Z1 seith-cli + Z3 data/seith.db + Z6 handoff 04 + research/validation-report.md
- Squash: `handoff/08-drift-e2e` (00-04) → `main` single commit → `gh pr create` → merge → `git worktree remove` + `git branch -d` T1/T2/e2e — `/.wt/` gitignore
- Tiap session wajib `skill://seith-market-intelligence` + ritual 3Q `docs/notes/00-readme.md`

## Verification
```
cargo fmt --check → 0
cargo clippy -- -D warnings → 0
cargo test → 143 passed (20+7+16+84+16)
uv --project apps/analysis run pytest -q --cov → 17 passed 96%
curl -H "Authorization: $SECTORS_KEY" https://api.sectors.app/v2/daily/BBCA/ → 200 BBCA.JK 8300
curl -H "Authorization: Bearer $SEITH_KEY" http://localhost:20128/v1/chat/completions -d '{"model":"SEITH-MARKET-IDX"}' → 200 PONG x-used-model nvidia/nemotron-3.5-lightning:free
cargo run -p seith-api --bin serve (8181) → /api/v1/health 200 + x-schema-version 1.0.0 + /ranking 200
sqlite3 data/seith.db "SELECT count(*) FROM ohlcv" → >0 after E2E
pnpm lint/typecheck → 0 (if web touched)
refactor-cleaner → fn<50 file200-400 nesting≤4 pass
```

## Risks & Mitigasi
- T1/T2 edit file sama → mitigasi file-disjoint list di atas, PM veto if overlap — deteksi `git diff --name-only parent..T1` vs T2
- Sectors 403/WAF saat E2E → mitigasi fallback fixtures `tests/fixtures/bbca-ohlcv-400.json`, Isi `excluded:[{ticker,reason}]` — deteksi curl probe dulu
- 9router combo chain semua free tapi rate limit → mitigasi Top-N only + fallback SEITH_LLM_FALLBACK_MODEL=Seith-AI-Trading — deteksi x-used-model header
- Port 8080 diambil httpd 5076 → mitigasi SEITH_API_BIND 8181 sudah di serve.rs + .env — deteksi `Get-NetTCPConnection -LocalPort 8181`
- Key leak di log → mitigasi `Redacted` + `sanitize_error()` + gitleaks — deteksi `grep SECTORS_API_KEY`

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/08-drift-e2e/t1-rust-client` dan `handoff/08-drift-e2e/t2-combo-wire` + task `01 + 02` + ritual 3Q
