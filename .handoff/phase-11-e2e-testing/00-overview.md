# Phase 11 — E2E Testing Real-Time (BBCA → 5 Cross-Sector) — Overview

## Goal
Validasi ujung-ke-ujung real-time `Sectors → Kronos 400→20 → Score 30/20/30/20 → Flag |Z|>2 → TradingAgents Lite →9router SEITH-MARKET-IDX → Dossier 2-page 9-section ID → Jupyter plotly 7 cells + Web :3000→:8181 envelope` pada BBCA single lalu 5 lintas sektor (BBCA/BMRI/ADRO/TLKM/GOTO) sebelum Freeze H6.

## Context
- SSOT: `AGENTS.md §3c Seven Zones §8b Branch §8c Ownership §7 DoD` + `docs/prd.md §4 Derived Insights §7 Journey 60s→dossier→PDF §8 Judging 40/30/30` + `docs/spec.md §2 Pipeline 8 gerbang §4 Scoring 30/20/30/20 §5 Cache` + `docs/api-spec.md §1 envelope §3 endpoints ranking/anomalies/dossier lang+peer5/backtest §7 Sectors Mapping Authorization + /v2/daily/{symbol}/ §9 sidecars §10 9router` + `docs/tdd-plan.md` + `docs/kronos-notes.md` + `2508.02739v1.pdf` + `docs/research/data-plan-100-top.md + money-leak-radar-thesis.md` + `docs/notes/00-readme.md` ritual 3Q
- Skill wajib: `skill://seith-market-intelligence` awal session T1 + `skill://no-ai-slop` Tier-1 + `skill://verification-loop` akhir + `skill://seith-phase-gate` + `skill://git-worktree-manager` + `skill://seith-kronos` (MOCK toggle)
- Prereq DONE: `main 0954d1d` = `1f3d0d8` H09 100 backtest (universe 100 FINANCE25/ENERGY20/CONSUMER20/INFRA20/OTHER15 + backtest-100.json 100 items credit 200 equity 12) + `c09728e+2588e5a+0954d1d` H10 docs 2-page 9-section ID peer QV+cap±50% lang=id `docs/api-spec §3 + §7 patched` + H10 impl claim di `handoff/10-worktree` (belum verified di main) — `cargo fmt0 clippy0 test145 pnpm0 uv17`
- Zona: Z1 `crates/seith-core scoring/ranking/anomaly/kronos/client dossier + sectors-client batch/cache + seith-api handlers/envelope + seith-cli` verify + Z2 `apps/web lib/api.ts zod + DossierPDF + BacktestChart + apps/kronos-sidecar :8001 + apps/analysis :8002 → 9router :20128` runtime verify + Z3 `data/seith.db WAL busy_timeout 3000` observe (gitignored) + Z4 `tests/fixtures` + Z5 `research/* docs/research/*` + Z6 `.handoff/phase-11-e2e-testing` + Z7 `scripts/generate-backtest-100.py` — cross-zona import dilarang §3c, `9router PID 22484 :20128 NEVER kill`
- Keputusan founder 2026-09-08: 2-page LOCK + peer QV+cap±50% + ID + visual Line±2σ vector — H11 validates `derived insight gate` (rank + anomaly + comparative + synthesized) bukan display mentah = FAIL

## Scope In / Out
In: Z1 `cargo fmt/clippy/test 145` + `seith-cli ranking/score/dossier/scan` envelope + Z2 `curl Sectors Authorization /v2/daily/{symbol}/ + Kronos :8001 /predict_batch 400→20 T1.0 top_p0.9 + Analysis :8002 /synthesize SEITH-MARKET-IDX + Web :3000 rewrites →:8181 + Dossier ?format=pdf&lang=id 2 pages + Jupyter research/money-leak-backtest.ipynb 7 cells plotly 5.24.1 isolated` + Z3 `sqlite3 WAL count` observe + Z5 `research/backtest-100.json + universe-100.json` + Z6 handoff 01-03
Out: Z1 crate logic edit (verify only, no new scoring), `vendor/Kronos` read-only, `apps/kronos-sidecar` no plotly pollution, no `push --force` ke main, `ValuationGapMap/Screener` defer H7b, full `900 credits` dump defer, Freeze H6 deferred after PASS

## WBS — Task Breakdown
| # | Task file | Slice | Depedensi |
|---|---|---|---|
| 01 | `01-smoke-bbca.md` | Smoke BBCA single: MOCK=1 <30s wiring check then MOCK=0 real GPU 400→20 → Score → dossier json/pdf 2-page peer5 QV+cap + disclaimer | — |
| 02 | `02-cross-sector-5.md` | 5 lintas sektor BBCA FINANCE/BMRI FINANCE/ADRO ENERGY/TLKM INFRA/GOTO OTHER: anomaly |Z|>2 + peer benchmark + backtest vs IHSG | 01 |
| 03 | `03-sync-pm-gate.md` | Sync handoff/11 → main + gates fmt0 clippy0 test145 pnpm0 uv17 + seith-pm dual-review PASS veto N → lock H10-impl | 02 |

Dependensi antar-fase: `08 ab411df BBCA 1 → 09 1f3d0d8 100/100 → 10 0954d1d docs 2-page → 11 E2E smoke→5→PM gate → H6 Freeze → Submit 30 Sep`. Cross-zona dilarang §3c. `9router PID NEVER kill`.

## Definition of Done — Phase 11 E2E
1. `00-overview.md` + 01-03 handoff lengkap: Surgical table per task (1 bag = 1 fn <50), Acceptance terukur (`BBCA rank + |Z| + peer5 reason`, `5 TopLeak + equity12`, `PM gate 8 poin`), Verification block `cargo fmt0 clippy0 test145 + pnpm lint0 typecheck0 + uv17 + gitleaks0 + curl live` + Accountability `✅/⚠️/🔻/♻️` per task + `♻️ Refactor:` placeholder
2. Smoke BBCA: `GET /v2/daily/BBCA/ Authorization →200 61 rows close 8300` + `9router :20128/v1/models SEITH-MARKET-IDX nvidia/nemotron-3.5-lightning:free` + `Kronos :8001 /predict_batch 400→20 +vol ±2σ` + `seith-cli ranking/scan` + `GET /api/v1/tickers/BBCA/dossier?format=json&lang=id → peer[5] QV+cap` + `?format=pdf&lang=id → %PDF-1.4 2 pages 612x792` + `disclaimer tiap footer`
3. Cross-sector 5: `GET /api/v1/anomalies?market=id&minZ=2.0&pageSize=5 → Top5 |Z| desc` + `GET /api/v1/backtest?market=id → equity 12 vs IHSG` + `Jupyter 7 cells plotly 5.24.1 BacktestChart vs IHSG + MetricsTable Sharpe/maxDD` + `Web :3000 hero TopLeaks → ranking 60s sortable → dossier gauge+peer5+chartPoints → PDF blob` via `next.config.js rewrites :8181 envelope success/data/pagination+x-schema-version`
4. Visual PDF 9-section ID terverifikasi nyata: Page1 Cover/Executive/Mispricing/Valuation/Peer/Anomali + Page2 Katalis/Metodologi/Annex + peer BMRI vs BBCA QV delta (bukan BUMI ENERGY) + Line zinc #a1a1aa actual 400 vs amber dashed #fbbf24 forecast 20 + Area red 10%
5. `refactor-cleaner` skip (test-only, no code) atau scan pass `fn<50 file200-400 nesting≤4 no dead code`, `no-ai-slop` Tier-1 warn + `design-taste-frontend` Bloomberg #0B0E14 verify
6. Dual-review `rust-reviewer ∥ security-reviewer` PASS (no secret, SECTORS_API_KEY server-only, NEXT_PUBLIC_API_BASE only) + `seith-phase-gate` — `grep SECTORS_API_KEY apps/web -r →0` + `grep plotly apps/kronos-sidecar →0`
7. Docs sinkron `docs/api-spec.md §3 dossier lang+peer5/backtest §7 Sectors Mapping` already patched 2588e5a — `doc-updater` no drift + `research/universe-100.json 100 + backtest-100.json 100`
8. Verification: `cargo fmt --check →0 / cargo clippy --all-targets -- -D warnings →0 / cargo test →145 passed (20+7+16+86+16 api) / uv --project apps/analysis run pytest -q →17 passed / pnpm --dir apps/web lint→0 typecheck→0 / gitleaks detect →0 / sqlite3 observe WAL / curl live BBCA+ PONG + dossier PDF` — paste output nyata no fabrikasi

## Peran + Skill + Sub-agent Matrix
| Peran | Eksekutor | Skill WAJIB | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead T0 | opencode sini | `seith-market-intelligence` + `verification-loop` + `seith-phase-gate` | — | Understand→Plan→Document + verify 03 PM gate |
| Founder | User | — | — | approve BBCA single first →5 cross + go-live/freeze 30 Sep |
| PM | `seith-pm` | `git-worktree-manager` + gate `fmt/clippy/test` | `seith-pm` | orkestrasi `handoff/11-e2e-testing` + veto if gate/reviewer/zone fail — MANDATORY before Freeze |
| Arsitek | `architect` | `senior-architect` | `architect` | SEBELUM 01 — audit pipeline 8 gerbang + 7 Zones + 100 vs 5 drift |
| Planner | `planner` | `tdd-workflow` | `planner` | forward-test Freeze H6 depends on E2E PASS |
| Eksekutor T1 | sub-agent | `seith-market-intelligence` + `tdd-workflow` + `seith-kronos` + `verification-loop` | `explore` | 01 smoke BBCA MOCK→real |
| Eksekutor T2 | sub-agent | `seith-market-intelligence` + `tdd-workflow` | `explore` | 02 cross-sector 5 (file-disjoint jika paralel, else sequential 1 terminal) |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | 01-02 verify Z1 no edit drift |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | verify no secret leak, Authorization not log, disclaimer always |
| Refactor | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | docs-only skip or scan pass (test phase) |
| Designer FE | `design-taste-frontend` | `design-taste-frontend` + `no-ai-slop` | — | 02 web visual Bloomberg verify |
| Doc | `doc-updater` | `remember`+`handoff`+`no-ai-slop` | `doc-updater` | sinkron docs/api-spec + research after 03 |

## Branch & Worktree
- Branch: `handoff/11-e2e-testing` dari `main 0954d1d` — `git worktree add ../seith-wt/handoff-11 -b handoff/11-e2e-testing` — `/.wt/` gitignore — existing `handoff/10-web-visual 0954d1d` already synced, `handoff/09-100-backtest 1f3d0d8` squashed
- Worktree `../seith-wt/handoff-11` Z1+Z2+Z5+Z6 only — sequential 01→02→03 (1 terminal) — file-disjoint safe if T1 01 vs T2 02 parallel (no `target/` collision, `data/seith.db` gitignored WAL observe only)
- Tiap session wajib `skill://seith-market-intelligence` + ritual 3Q `docs/notes/00-readme.md` + `skill://no-ai-slop` Tier-1 + `skill://seith-kronos` untuk MOCK toggle
- `git add .handoff/phase-11-e2e-testing/ + docs/api-spec.md` → `cargo fmt --check 0 + clippy --all-targets 0 + cargo test 145 + pnpm lint/typecheck 0 + gitleaks 0` → `commit chore(handoff): phase-11 E2E 01-03` → `seith-pm` gate → squash to `main` → hapus worktree

## Verification
```
cargo fmt --check → 0
cargo clippy --all-targets -- -D warnings → 0
cargo test → 145 passed (20 sectors-client +7 seith-api +16 seith-cli +86 seith-core +16 api)
uv --project apps/analysis run pytest -q --cov → 17 passed 96%
pnpm --dir apps/web lint → 0 / pnpm --dir apps/web typecheck → 0
# E2E live smoke BBCA (<30s MOCK=1, 2-3m MOCK=0 RTX4050):
curl -H "Authorization: $SECTORS_KEY" https://api.sectors.app/v2/daily/BBCA/ → 200 BBCA.JK 8300 or 403 excluded
curl -H "Authorization: Bearer $SEITH_KEY" http://localhost:20128/v1/chat/completions -d '{"model":"SEITH-MARKET-IDX","messages":[{"role":"user","content":"PONG"}]}' → 200 PONG x-used-model nvidia/nemotron-3.5-lightning:free cost 0
curl http://localhost:8181/api/v1/health → 200 x-schema-version 1.0.0
curl http://localhost:8181/api/v1/tickers/BBCA/dossier?format=json&lang=id → 200 peer[5] QV+cap + disclaimer
curl http://localhost:8181/api/v1/tickers/BBCA/dossier?format=pdf&lang=id → 200 %PDF-1.4 2 pages
curl http://localhost:8181/api/v1/anomalies?market=id&minZ=2.0&pageSize=5 → 200 Top5 |Z| desc
curl http://localhost:8181/api/v1/backtest?market=id → 200 equity_curve 12 vs IHSG
curl http://localhost:8181/api/v1/ranking?market=id&sector=FINANCE&pageSize=5 → 200 items Mispricing desc |Z| tie-break
seith ranking --sector FINANCE --json → envelope success/data/pagination
seith dossier BBCA --pdf → %PDF 2 pages
# Jupyter:
uv --project research run jupyter nbconvert --execute research/money-leak-backtest.ipynb --to html → no error
# Web:
pnpm --dir apps/web build → no 404 rewrites /api/v1 → 8181
gitleaks detect --no-git -v → 0 leak
grep -r SECTORS_API_KEY apps/web → 0
grep -r plotly apps/kronos-sidecar/pyproject.toml → 0
```

## Risks & Mitigasi
- WAF 403 error 1010 transient Sectors (observed BBCA 200→403) — mitigasi `chunks(20) retry1 + excluded:[{ticker,reason}] + fixtures` — deteksi `curl /v2/daily/BBCA/ →403` then fallback
- KRONOS_MOCK=1 hides GPU OOM — mitigasi smoke MOCK=1 then real MOCK=0 BBCA 400→20 RTX4050 6GB <1GB — deteksi `cargo test kronos` + `curl :8001/predict_batch`
- 9router :20128 down → `degraded:true` still PASS MI (LLM optional Track 3) — mitigasi fallback memo deterministik — deteksi `curl :20128/v1/models →200 or degraded`
- `recharts` dead dep 2.12.7 + `@react-pdf/renderer 3.4.4` vector not wired — mitigasi 02 visual proves `grep recharts → >0` — deteksi `pnpm build`
- `data/seith.db` gitignored (WAL 100) not in repo — mitigasi seed script `scripts/generate-backtest-100.py` + `migrations/001_cache.sql` repro — deteksi `Test-Path data/seith.db` observe
- Docs-only vs code drift — mitigasi PM veto + `grep peerComparison crates/seith-core/src/dossier.rs →1` — deteksi worktree diff zone check

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/11-e2e-testing` + task `01-smoke-bbca.md` → `02` → `03` + ritual 3Q + `skill://seith-kronos` MOCK toggle + `skill://verification-loop` + `seith-pm` gate MANDATORY
