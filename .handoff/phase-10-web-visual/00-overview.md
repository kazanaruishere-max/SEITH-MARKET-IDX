# Phase 10 — Web Visual Backtest Real (Hasil Akhir) — Overview

## Goal
Kunci desain web yang memvisualkan hasil backtest real 100 ticker sebagai hasil akhir — Bloomberg `#0B0E14` consume envelope `success/data/error/pagination + x-schema-version`.

## Context
- SSOT: `AGENTS.md §3c Seven Zones §8b Branch §8c Ownership §7 DoD` + `docs/prd.md §4 Derived Insights §7 Journey 60s→dossier→PDF §8 Judging 40/30/30` + `docs/spec.md §2 Pipeline 8 gerbang §4 Scoring 30/20/30/20` + `docs/api-spec.md §1 envelope §3 endpoints §4 schemas §7 Sectors Mapping (Authorization /v2/daily/{symbol}/) §9 sidecars §10 9router` + `docs/tdd-plan.md` + `docs/kronos-notes.md` + `docs/notes/00-readme.md` ritual 3Q + `2508.02739v1.pdf`
- Skill wajib: `skill://seith-market-intelligence` awal + `skill://no-ai-slop` Tier-1 + `skill://design-taste-frontend` Z2 + `skill://verification-loop` akhir + `skill://seith-phase-gate` + `skill://git-worktree-manager`
- Prereq DONE: `main ab411df` (T1 Authorization + T2 SEITH-MARKET-IDX + E2E BBCA 200 + 145 passed) + `phase-09-100-backtest 00-03` docs (universe 100, pipeline `backtest-100.json` contract, L2 WAL) — `docs/api-spec.md §7` patched, `phase-08 01-04` Accountability Blocks ✅/⚠️/🔻/♻️, `cargo fmt 0 clippy --all-targets 0 test 145 + uv 17 + pnpm 0 + gitleaks 0`
- Gap web saat ini: `apps/web` stub `RankingTable items:[]` + `recharts 2.12.7` installed 0 import + `TopLeaks` missing + `next.config.js` missing (no `/api/v1 → 8181` proxy) + no `anomalies/backtest` route + no `chartPoints` line + no `ScoreBadge stacked` — all `Z2` missing visuals for `backtest-100.json`
- Zona: Z2 `apps/web` (Next14 + zod + recharts + @react-pdf/renderer + tailwind Bloomberg) + Z1 `crates/seith-api/src/handlers.rs + envelope.rs + bin/serve.rs` verify only + Z6 `.handoff/phase-10-web-visual` + Z7 `scripts` observe — Z3 `data/seith.db` observe only (no write), Z4 fixtures verify only

## Scope In / Out
In: Z2 `apps/web lib/api.ts` zod schemas `sort/order/minZ/degraded` + `app/page.tsx hero TopLeaks Top5 + app/ranking + app/dossier/[ticker] + app/backtest` route + `components/TopLeaks.tsx + BacktestChart.tsx + MetricsTable.tsx + ScoreBadge stacked 30/20/30/20` + `next.config.js rewrites /api/v1 → 8181` + `NEXT_PUBLIC_API_BASE` — Bloomberg `#0B0E14/#11151F` + `JetBrains Mono` — Z6 handoff `00-03`
Out: Z1 crate logic edit (verify only, ranking handler wire deferred to PR34 rust phase), Z3 `data/seith.db` write (phase 09 impl), `apps/kronos-sidecar` no edit, `vendor/*` read-only, full `ValuationGapMap/Screener` deferred H7b

## WBS — Task Breakdown
| # | Task file | Slice | Depedensi |
|---|---|---|---|
| 01 | `01-api-contract.md` | `GET /api/v1/ranking + /anomalies?sort=anomaly&minZ=2.0&pageSize=5 Top5 + /tickers/:ticker/dossier?format=json\|pdf + /backtest (new static research/backtest-100.json)` → envelope + `lib/api.ts` zod `sort/order/minZ/degraded/insufficientData` + `next.config.js` proxy + `NEXT_PUBLIC_API_BASE` | — |
| 02 | `02-visual-spec.md` | `TopLeaks.tsx (Top5 |Z| desc badge red) + BacktestChart.tsx (recharts Line actual zinc vs forecast amber dashed + ±2σ red 10% band + capital vs IHSG) + MetricsTable.tsx (Sharpe/maxDD/win rate/totalReturn) + ScoreBadge stacked 30/20/30/20` + dossier `kronos.chartPoints + peerComparison + research memo tabs + disclaimer tiap view` | 01 |
| 03 | `03-journey-integration.md` | Journey `app/page.tsx hero TopLeaks → app/ranking (60s sortable) → app/dossier/[ticker] deep dive → PDF @react-pdf/renderer` + `app/backtest` route + `pnpm lint 0 typecheck 0 test 40% usability` | 02 |

Dependensi antar-fase: `08 ab411df (BBCA 1) → 09 (100 foundation docs) → 10 (web visual docs) → 09+10 impl (handoff/09-impl + handoff/10-impl) → PR34 H6 Freeze → PR35 H7b → Submit 30 Sep`. Cross-zona dilarang §3c. `9router PID NEVER kill`.

## Definition of Done — Phase 10 docs-only
1. `00-overview.md` + 01-03 handoff lengkap: Surgical table per task (1 bag = 1 fn <50), Acceptance terukur (`Top5 sort=anomaly pageSize=5 minZ2.0`, `recharts Line + Area ±2σ`, `ScoreBadge stacked 4 segmen`, `disclaimer tiap view`), Verification block `cargo fmt 0 clippy --all-targets 0 test 145 + uv 17 + pnpm lint 0 typecheck 0 test + gitleaks 0` + Accountability `✅/⚠️/🔻/♻️` per task
2. `lib/api.ts` contract documented: `fetchRanking({market,sector,sort,order,page,pageSize,minZ})` + `fetchAnomalies + fetchBacktest + fetchDossier` zod schemas `RankingQuery + AnomalyQuery + BacktestQuery + DossierQuery` + envelope `success/data/error/pagination + x-schema-version`
3. `next.config.js` rewrites documented: `async rewrites() { return [{ source: '/api/v1/:path*', destination: 'http://localhost:8181/api/v1/:path*' }] }` + `NEXT_PUBLIC_API_BASE` env handling
4. Visual spec covers `TopLeaks` gap (`app/page.tsx` hero), `BacktestChart` gap (`recharts` 0 import → Line/Area), `MetricsTable` gap (`Sharpe/maxDD/winRate`), `ScoreBadge` stacked, `dossier` `chartPoints + peerComparison + memo tabs`
5. `refactor-cleaner` skip (docs-only, no code), `no-ai-slop` Tier-1 warn check + `design-taste-frontend` Z2 spec + `gitleaks 0`
6. Dual-review `rust-reviewer ∥ security-reviewer` PASS (docs read, no secret) + `seith-phase-gate` — `NEXT_PUBLIC_API_BASE` not leak `SECTORS_API_KEY`
7. Docs sinkron `docs/api-spec.md §3 ranking/anomalies/backtest + §7 Sectors mapping` already patched — `doc-updater` no drift + README 400 lines Kaza bilingual proven
8. Verification: `cargo fmt --check → 0 / cargo clippy --all-targets -- -D warnings → 0 / cargo test → 145 passed / uv --project apps/analysis run pytest -q --cov → 17 passed 96% / pnpm --dir apps/web lint → 0 / pnpm --dir apps/web typecheck → 0 / gitleaks detect → 0`

## Peran + Skill + Sub-agent Matrix
| Peran | Eksekutor | Skill WAJIB | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead T0 | opencode sini | `seith-market-intelligence` + `verification-loop` + `seith-phase-gate` | — | Understand→Plan→Document + verify 03 |
| Founder | User | — | — | approve TopLeaks hero vs full backtest page priority |
| PM | `seith-pm` | `git-worktree-manager` + gate `fmt/clippy/test` | `seith-pm` | orkestrasi `handoff/10-web-visual` + veto if zone fail |
| Arsitek | `architect` | `senior-architect` | `architect` | SEBELUM 01 — audit web consume envelope + Bloomberg dark |
| Designer FE | `design-taste-frontend` | `design-taste-frontend` + `no-ai-slop` | — | 02 visual spec |
| Eksekutor | sub-agent (later) | `seith-market-intelligence` + `tdd-workflow` + `verification-loop` | `explore` | Implement later — currently docs-only |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | 01 api contract verify Z1 no edit |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | verify no secret in `NEXT_PUBLIC_*`, Authorization not log |
| Refactor | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | docs-only skip; implement phase gate |
| Doc | `doc-updater` | `remember`+`handoff`+`no-ai-slop` | `doc-updater` | sinkron docs/api-spec §3 + research/backtest-contract |

## Branch & Worktree
- Branch: `handoff/10-web-visual` dari `main ab411df` (or `handoff/09-100-backtest` if sequential docs) — `git worktree add ../seith-wt/handoff-10 -b handoff/10-web-visual` — `/.wt/` gitignore — existing `handoff/08-drift-e2e` → `main ab411df` already squashed
- Worktree `../seith-wt/handoff-10` Z2+Z6 only — no T1/T2 split (docs-only sequential 01→02→03)
- Tiap session wajib `skill://seith-market-intelligence` + ritual 3Q `docs/notes/00-readme.md` + `skill://design-taste-frontend` for 02 + `skill://no-ai-slop` Tier-1
- `git add .handoff/phase-10-web-visual/ + docs/api-spec.md` → `cargo fmt --check 0 + clippy --all-targets 0 + cargo test 145 + gitleaks 0` → `commit chore(handoff): phase-10 docs` → squash to `main`

## Verification
```
cargo fmt --check → 0
cargo clippy --all-targets -- -D warnings → 0
cargo test → 145 passed (20 sectors-client + 7 seith-api + 16 seith-cli + 86 seith-core + 16 api)
uv --project apps/analysis run pytest -q --cov → 17 passed 96%
pnpm --dir apps/web lint → 0 / pnpm --dir apps/web typecheck → 0 / pnpm --dir apps/web test → pending (after impl)
# live still BBCA only until 09/10 implement:
curl -H "Authorization: $SECTORS_KEY" https://api.sectors.app/v2/daily/BBCA/ → 200 BBCA.JK 8300 or 403 fallback
curl -H "Authorization: Bearer $SEITH_KEY" http://localhost:20128/v1/chat/completions -d '{"model":"SEITH-MARKET-IDX","messages":[{"role":"user","content":"PONG"}]}' → 200 PONG x-used-model nvidia/nemotron-3.5-lightning:free cost 0
curl http://localhost:8181/api/v1/health → 200 x-schema-version 1.0.0 (after serve)
curl http://localhost:8181/api/v1/anomalies?market=id&minZ=2.0&pageSize=5 → 200 Top5 |Z| desc (future)
curl http://localhost:8181/api/v1/backtest?market=id → 200 equity_curve (future, static research/backtest-100.json)
gitleaks detect --no-git -v → 0 leak
```

## Risks & Mitigasi
- `recharts` dead dep (installed 2.12.7, 0 import) — mitigasi 02 spec wires `Line + Area` to `kronos.chartPoints` — deteksi `grep recharts apps/web -r` → >0 after impl
- `next.config.js` missing → fetch 404 `localhost:3000/api/v1/*` without proxy — mitigasi rewrites `/api/v1 → 8181` + `NEXT_PUBLIC_API_BASE` — deteksi `pnpm build` 404 without env
- TopLeaks missing on `app/page.tsx` hero (Phase 7 gap) — mitigasi 02 TopLeaks.tsx spec `sort=anomaly minZ 2.0 pageSize 5` — deteksi `Glob TopLeaks` 0 → 1
- `NEXT_PUBLIC_*` leak `SECTORS_API_KEY` to client — mitigasi `NEXT_PUBLIC_API_BASE` only, `SECTORS_API_KEY` server-only `crates/seith-core/src/config.rs Redacted` — deteksi `grep SECTORS_API_KEY apps/web -r` → 0
- Docs-only phase mistakenly edits `apps/kronos-sidecar` — mitigasi PM veto + `grep -r plotly apps/kronos-sidecar/pyproject.toml → 0` — deteksi worktree diff zone check

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/10-web-visual` + task `01-api-contract.md` → `02` → `03` + ritual 3Q + `skill://design-taste-frontend` + `skill://no-ai-slop`
