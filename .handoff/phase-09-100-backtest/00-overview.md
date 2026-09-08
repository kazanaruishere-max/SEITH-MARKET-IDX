# Phase 09 — 100 Ticker Backtest Real (Data Foundation) — Overview

## Goal
Kunci desain pipeline backtest real 100 ticker stratified `FINANCE25 ENERGY20 CONSUMER20 INFRA20 OTHER15` sebagai SSOT data real untuk web visual.

## Context
- SSOT: `AGENTS.md §3c Seven Zones §8b Branch §8c Ownership §7 DoD` + `docs/prd.md §4 Core Derived Insights §7 Journey 60s→dossier→PDF §8 Judging 40/30/30` + `docs/spec.md §2 Pipeline 8 gerbang §4 Scoring §5 Cache` + `docs/api-spec.md §1 envelope §3 ranking §4 schemas §6 Repository §7 Sectors Mapping (per docs.sectors.app /v2/daily/{symbol}/ Authorization)` + `docs/tdd-plan.md` + `docs/kronos-notes.md` + `2508.02739v1.pdf` + `docs/notes/00-readme.md` ritual 3Q + `docs/research/*` 3 files + `research/validation-report.md` (BBCA 61 rows + PONG) + `crates/seith-core/src/scoring/calculator.rs` + `ranking/service.rs` + `anomaly/` + `normalize.rs` + `sectors-client/batch.rs + cache/` + `migrations/001_cache.sql`
- Skill wajib: `skill://seith-market-intelligence` awal session T1 + `skill://no-ai-slop` Tier-1 + `skill://verification-loop` akhir + `skill://seith-phase-gate` + `skill://seith-kronos` (Kronos 400→20) + `skill://git-worktree-manager`
- Prereq DONE: `main ab411df` — T1 `Authorization + /v2/daily/{symbol}/` + T2 `SEITH-MARKET-IDX` + E2E BBCA `200 61×5650 + PONG nvidia/nemotron-3.5-lightning:free + dossier %PDF + 145 passed` (docs/api-spec.md §7 patched, `market.rs /v2/daily & /v2/sgx/daily`, `clippy --all-targets 0`, `gitleaks 0`, `phase-08 01-04 Accountability Blocks` ✅/⚠️/🔻/♻️)
- Drift closed: `X-API-Key` removed; `?ticker=` removed; `base_path` `/v2/indonesia/transaction/daily → /v2/daily`; CI `audit` is `cargo audit` not installed locally (CI only, not local gate), `freeze` is expected fail for non-freeze phase
- Zona: Z5 `docs/research + docs/*.md` + Z3 `data/seith.db + migrations/001_cache.sql` + Z4 `tests/fixtures` + Z1 `crates/seith-core/scoring + ranking + anomaly + normalize + sectors-client verify only` + Z6 `.handoff/phase-09-100-backtest` + Z7 `scripts` observe — Z2 `apps/*` verify only (no logic edit)

## Scope In / Out
In: Z5 `docs/research/data-plan-100-top.md` update + `docs/api-spec.md §7` stable + Z3 `data/seith.db` design (WAL `busy_timeout 3000`, `ohlcv/fundamentals/ranking_cache/kv_store`, TTL `86400/3600`, key `market:sector:ticker:date`) + Z4 `tests/fixtures` universe list + Z6 handoff `00-overview + 01-03` — docs-only: no crate edit, prove `cargo fmt/clippy/test` 0 drift + `gitleaks 0`
Out: Z1 crate logic edit (defer implement), Z2 `apps/kronos-sidecar + analysis + web` logic (verify only), `vendor/*` read-only, full `GET /api/v1/backtest` handler (defer to web phase 10 if needed), `ValuationGapMap/Screener` deferred H7b

## WBS — Task Breakdown
| # | Task file | Slice | Depedensi |
|---|---|---|---|
| 01 | `01-data-universe.md` | 100 ticker universe: static stratified `FINANCE25/ENERGY20/CONSUMER20/INFRA20/OTHER15` vs `screener/companies` dynamic, credit budget 200, key `market:sector:ticker:date`, SectorMedian per market | — |
| 02 | `02-backtest-pipeline.md` | Flow `fetch_ohlcv_batch chunks20×5 → L2 → normalize → Kronos 400→20 batch → Score 30/20/30/20 → Flag |Z|>2 → ranking/anomalies → `research/money-leak-backtest.ipynb` 7 cells + `research/backtest-100.json` contract | 01 |
| 03 | `03-cache-persist.md` | L2 WAL `data/seith.db` schema observe + TTL `86400/3600` + `busy_timeout 3000` + `SELECT count(*)=100` + `excluded:[{ticker,reason}]` + fallback 403 fixtures | 01 |

Dependensi antar-fase: `08 ab411df (BBCA 1) → 09 (100 real foundation docs) → 10 (web visual) → PR34 H6 Freeze → PR35 H7b → Submit 30 Sep`. Cross-zona dilarang §3c. `9router PID NEVER kill`.

## Definition of Done — Phase 09 docs-only
1. `00-overview.md` + 01-03 handoff lengkap: Surgical table per task (1 bag = 1 fn <50), Acceptance terukur (`batch 20`, `TTL 86400/3600`, `rank Mispricing desc |Z| tie-break`, `insufficient_data:true`), Verification block `cargo fmt 0 clippy --all-targets 0 test 145 + uv 17 + pnpm lint 0 + sqlite3 observe + gitleaks 0` + Accountability `✅/⚠️/🔻/♻️` per task + `♻️ Refactor:` placeholder until implement
2. `docs/research/data-plan-100-top.md` updated (or companion `docs/research/backtest-contract.md`) with 100 stratified list source, credit log `~200 credits OHLCV 400 + Valuation`, WAF `403 error 1010` fallback `excluded`
3. `data/seith.db` design documented (WAL, `migrations/001_cache.sql` `ohlcv/fundamentals/ranking_cache/kv_store`, `busy_timeout 3000`, key, TTL) — prove `cargo fmt --check 0 + clippy --all-targets -- -D warnings 0 + cargo test 145 + uv pytest 17 + gitleaks 0` no drift from docs-only phase
4. `tests/fixtures` universe list disclosed (or `research/universe-100.json` mock) per market `id/sg` isolated (SGX `D05` not DBS)
5. `refactor-cleaner` skip (docs-only, no code), `no-ai-slop` Tier-1 warn check + `gitleaks 0`
6. Dual-review `rust-reviewer ∥ security-reviewer` PASS (docs read, no secret) + `seith-phase-gate`
7. Docs sinkron `docs/api-spec.md §7 Sectors mapping` already patched (Authorization + /v2/daily/{symbol}/) — `doc-updater` no drift + README 257 lines (Kaza bilingual) proven via `git show origin/main:README.md`
8. Verification: `cargo fmt --check → 0 / cargo clippy --all-targets -- -D warnings → 0 / cargo test → 145 passed / uv --project apps/analysis run pytest -q --cov → 17 passed 96% / pnpm lint/typecheck → 0 / gitleaks detect → 0`

## Peran + Skill + Sub-agent Matrix
| Peran | Eksekutor | Skill WAJIB | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead T0 | opencode sini | `seith-market-intelligence` + `verification-loop` + `seith-phase-gate` | — | Understand→Plan→Document + verify 03 |
| Founder | User | — | — | approve 100 stratified vs screener dynamic, approve credit budget |
| PM | `seith-pm` | `git-worktree-manager` + gate `fmt/clippy/test` | `seith-pm` | orkestrasi `handoff/09-100-backtest` + veto if zone fail |
| Arsitek | `architect` | `senior-architect` | `architect` | SEBELUM 01 — audit 100 universe vs WAF 403 fallback |
| Planner | `planner` | `tdd-workflow` | `planner` | forward-test 10 web depends on backtest.json contract |
| Eksekutor | sub-agent (later) | `seith-market-intelligence` + `tdd-workflow` + `seith-kronos` + `verification-loop` | `explore` | Implement later — currently docs-only |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | 01-03 docs read, verify Z1 no edit drift |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | verify no secret in universe list, Authorization not log |
| Refactor | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | docs-only skip; implement phase gate |
| Doc | `doc-updater` | `remember`+`handoff`+`no-ai-slop` | `doc-updater` | sinkron docs/api-spec §7 + research/ |

## Branch & Worktree
- Branch: `handoff/09-100-backtest` dari `main ab411df` — `git worktree add ../seith-wt/handoff-09 -b handoff/09-100-backtest` — `/.wt/` gitignore — existing `handoff/08-drift-e2e` squashed to main (ab411df)
- Worktree `../seith-wt/handoff-09` Z5+Z3+Z4+Z6 only — no T1/T2 split (docs-only sequential 01→02→03)
- Tiap session wajib `skill://seith-market-intelligence` + ritual 3Q `docs/notes/00-readme.md` + `skill://no-ai-slop` Tier-1
- `git add .handoff/phase-09-100-backtest/ + docs/research/*` → `cargo fmt --check 0 + clippy --all-targets 0 + cargo test 145 + gitleaks 0` → `commit chore(handoff): phase-09 docs` → squash to `main`

## Verification
```
cargo fmt --check → 0
cargo clippy --all-targets -- -D warnings → 0
cargo test → 145 passed (20 sectors-client + 7 seith-api + 16 seith-cli + 86 seith-core + 16 api)
uv --project apps/analysis run pytest -q --cov → 17 passed 96%
pnpm --dir apps/web lint → 0 / pnpm --dir apps/web typecheck → 0 (if web touched, else 0)
# live still BBCA only until 09 implement:
uv run --no-project python -c "Authorization: SECTORS_KEY https://api.sectors.app/v2/daily/BBCA/" → 200 or 403 fallback
curl -H "Authorization: Bearer SEITH_KEY" http://localhost:20128/v1/chat/completions -d '{"model":"SEITH-MARKET-IDX","messages":[{"role":"user","content":"PONG"}]}' → 200 PONG x-used-model nvidia/nemotron-3.5-lightning:free cost 0
sqlite3 data/seith.db "SELECT count(*) FROM ohlcv" → 0 docs-only (→ 100 after implement)
gitleaks detect --no-git -v → 0 leak
```

## Risks & Mitigasi
- 100× `/v2/daily/{symbol}/` hits WAF 403 error 1010 transient (observed BBCA 200→403) — mitigasi batch `chunks(20)` + retry 1 + `excluded:[{ticker,reason}]` + fixtures `tests/fixtures/bbca-ohlcv-400.json` fallback — deteksi curl probe per chunk
- Credit budget 200 (OHLCV 400 + Valuation per ticker) exceeds free tier mid-batch — mitigasi `CompositeCache` L1 hot + L2 WAL, batch sequential no concurrency, credit log `~200` — deteksi `429 RateLimit` → backoff
- Static 100 list drift from live `screener/companies` universe (listing/delisting) — mitigasi static `FINANCE25...` pinned + companion `research/universe-100.json` dated + `screener/companies` as optional refresh — deteksi `404` unknown symbol → `excluded missing`
- KRONOS_MOCK=1 in CI hides GPU OOM — mitigasi mock for gates, manual `research/money-leak-backtest.ipynb` 7 cells real Kronos 400→20 for proof — deteksi `KRONOS_MOCK=0` run
- Docs-only phase mistakenly edits `apps/kronos-sidecar` — mitigasi PM veto + `grep -r plotly apps/kronos-sidecar/pyproject.toml → 0` — deteksi worktree diff zone check

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/09-100-backtest` + task `01-data-universe.md` → `02` → `03` + ritual 3Q
