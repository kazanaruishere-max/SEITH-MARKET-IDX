# Task 03 — Sync PM Gate (handoff/11 → main)

## Goal
Sinkronisasi hasil E2E `handoff/11-e2e-testing` ke `main` — gates `fmt0 clippy0 test148 pnpm0 uv17 + gitleaks0 + SECTORS_API_KEY server-only` → dual-review `rust-reviewer ∥ security-reviewer PASS` + `seith-pm` veto N → lock `H10-impl` verified real-time sebelum Freeze H6.

## Context
- SSOT: `AGENTS.md §3c Seven Zones §8b Branch §8c Ownership §7 DoD` + `.opencode/agents/seith-pm/AGENT.md` (gate fmt/clippy/test + dual-review + Accountability + refactor-cleaner + docs sync) + `docs/notes/00-readme.md` ritual 3Q + `phase-11 00-overview + 01-smoke-bbca + 02-cross-sector-5` + `main 0954d1d` (H09 100/100 + H10 docs 2-page 0954d1d) + `docs/api-spec.md §3 dossier lang+peer5/backtest §7 Sectors` + `research/universe-100.json 100 + backtest-100.json 100`
- Branch: `handoff/11-e2e-testing` dari `main 0954d1d` — worktree `../seith-wt/handoff-11` — Z6 handoff + Z5 research + Z7 scripts — test-only: no crate logic edit, observe gates, paste output nyata no fabrikasi
- Skill: `skill://seith-market-intelligence` + `skill://verification-loop` + `skill://seith-phase-gate` + `skill://git-worktree-manager` + `skill://no-ai-slop` Tier-1 + ritual 3Q

## Scope In / Out
In: `git add .handoff/phase-11-e2e-testing/ + research/money-leak-backtest.ipynb (if updated) + docs/api-spec.md (if drift patch)` → `cargo fmt --check 0 + clippy --all-targets 0 + cargo test 148 + pnpm lint 0 typecheck 0 build 0 + uv workdir 17 passed + gitleaks 0 + grep SECTORS_API_KEY apps/web →0 + grep plotly kronos-sidecar →0 + curl live BBCA PONG dossier PDF 2 pages` → `commit chore(handoff): phase-11 E2E 01-03` → `seith-pm` audit → squash to `main` → hapus worktree
Out: Z1 crate logic edit (verify only, no new scoring), `vendor/Kronos` read-only, `data/seith.db` write (gitignored WAL observe only, repro via `scripts/generate-backtest-100.py + migrations/001_cache.sql`), `ValuationGapMap/Screener` H7b, Freeze H6 defer after PASS

## Bagian — Surgical Breakdown
| Bag | File | Struktur | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `git` | `git worktree add ../seith-wt/handoff-11 -b handoff/11-e2e-testing main` + `git add .handoff/phase-11-e2e-testing/00-overview.md 01-smoke-bbca.md 02-cross-sector-5.md 03-sync-pm-gate.md` + `cargo fmt --check` | `branch handoff/11-e2e-testing` flat (§8b) + `/.wt/` gitignore + `git status clean` after commit | `branch handoff/11(topic)/t1-*` flat violation |
| b | `gate cargo` | `cargo fmt --check →0` + `cargo clippy --all-targets -- -D warnings →0` + `cargo test →148 passed (20+7+19+16+86)` | `FMT:0 CLIPPY:0 TEST_TOTAL:148 EXIT:0` paste output + `Accountability ✅` per task | `fmt !=0 or clippy !=0 or test !=148` |
| c | `gate web+py` | `pnpm --dir apps/web lint →0 + typecheck →0 + build →0 rewrites :8181` + `uv --project apps/analysis run pytest -q (workdir) →17 passed` + `uv --project research run jupyter nbconvert --execute money-leak-backtest.ipynb →0` | `LINT:0 TYPECHECK:0 UV_EXIT:0` + `research plotly 5.24.1 isolated` + `grep SECTORS_API_KEY apps/web -r →0` + `grep plotly apps/kronos-sidecar →0` | `pnpm lint !=0 or uv !=17` |
| d | `gate live` | `curl Sectors BBCA + 9router PONG + Kronos :8001 + Analysis :8002 + /api/v1/health + /dossier json/pdf 2 pages + /anomalies Top5 + /backtest equity12 + ranking + scan 5` | semua `200` or `403 excluded` fallback + `disclaimer Bukan rekomendasi tiap footer + x-schema-version` + `pdf %PDF 2 pages` + `peer QV+cap` validated | `curl live non-200 non-403 without reason` |
| e | `PM gate` | `task seith-pm/AGENT audit .handoff/phase-11-e2e-testing/00-03` + `rust-reviewer ∥ security-reviewer` docs-read + `seith-phase-gate` | PM `PASS veto N` — DoD 8 poin `[1]fmt [2]clippy [3]test148 [4]uv/pnpm [5]rust+security [6]Accountability [7]refactor N/A [8]docs sync` — fix HIGH/MEDIUM/LOW if FAIL | `seith-pm FAIL veto Y` block merge |
| f | `sync` | `git commit -m "chore(handoff): phase-11 E2E 01-03 smoke BBCA→5 cross PM PASS"` → `handoff/11 → main` fast-forward or squash + `git worktree remove` + `git branch -D` | `main` ahead 1 commit `handoff/11` squashed, `git log --oneline -4` clean, ready Freeze H6 | `push --force main/handoff` |

## Deliverables + Acceptance
- `00-overview + 01-03` handoff lengkap: Surgical table per task (1 bag = 1 fn <50), DoD 8 poin E2E, Verification block `fmt0 clippy0 test148 + pnpm0 uv17 + gitleaks0 + curl live` + Accountability `✅/⚠️/🔻/♻️` per file terisi output nyata + `♻️ Refactor:` placeholder (test-only)
- Gates `FMT:0 CLIPPY:0 TEST_TOTAL:148 LINT:0 TYPECHECK:0 UV:17 passed` + `BBCA smoke MOCK→real + 5 cross-sector Top5 + equity12 + jupyter html + web build 0 404 + peer QV+cap validated + dossier 2 pages %PDF` — paste output no fabrikasi
- PM `PASS veto N` + dual-review PASS + `gitleaks 0` + `SECTORS_API_KEY server-only` + `research plotly isolated` + `docs/api-spec §3+§7` no drift + `universe 100 + backtest 100` + `main` ready Freeze

## Verification
```
cargo fmt --check → 0 / cargo clippy --all-targets -- -D warnings → 0 / cargo test → 148 passed (20+7+19+16+86)
uv workdir apps/analysis run pytest -q → 17 passed / pnpm --dir apps/web lint → 0 typecheck → 0 build → 0
research/universe-100.json → count 100 stratified FINANCE25/ENERGY20/CONSUMER20/INFRA20/OTHER15
research/backtest-100.json → universe 100 items 100 equity 12 metrics hit_rate/sharpe
curl -H "Authorization: $SECTORS_KEY" https://api.sectors.app/v2/daily/BBCA/ → 200 or 403 excluded
curl -H "Authorization: Bearer $SEITH_KEY" http://localhost:20128/v1/chat/completions -d '{"model":"SEITH-MARKET-IDX","messages":[{"role":"user","content":"PONG"}]}' → 200 PONG nvidia/nemotron-3.5-lightning:free
curl http://localhost:8181/api/v1/health → 200 x-schema-version 1.0.0
curl http://localhost:8181/api/v1/tickers/BBCA/dossier?format=json&lang=id → 200 peer[5] QV+cap + disclaimer
curl http://localhost:8181/api/v1/tickers/BBCA/dossier?format=pdf&lang=id → 200 %PDF-1.4 2 pages
curl http://localhost:8181/api/v1/anomalies?market=id&minZ=2.0&pageSize=5 → 200 Top5 |Z| desc
curl http://localhost:8181/api/v1/backtest?market=id → 200 equity_curve 12
grep -r SECTORS_API_KEY apps/web → 0 / grep plotly apps/kronos-sidecar/pyproject.toml → 0
gitleaks detect --no-git -v → 0
# seith-pm audit:
task seith-pm/AGENT "audit handoff/11-e2e-testing 00-03" → PASS veto N
```

## Accountability Block — Task 03
- ✅ Terverifikasi: `cargo fmt0 clippy0 test148 + pnpm0 uv17 gitleaks0 + curl live BBCA+ PONG + dossier PDF 2 pages + anomalies Top5 + backtest equity12` — output nyata after 01+02 PASS
- ⚠️ Belum: `handoff/11 → main` merge — deferred until seith-pm PASS
- 🔻 Risiko: `WAF 403 / KRONOS_MOCK OOM / 9router degraded` — mitigasi `excluded + chunks(20) retry1 + mock fallback + degraded:true still PASS MI` — deteksi `curl 403 / :8001 timeout / :20128 500`
- ♻️ Refactor: test-only keep sync narrow, DRY 01+02, no code edit, file200-400 `00-03` single phase

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill WAJIB | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead T0 | opencode sini | `seith-market-intelligence` + `verification-loop` + `seith-phase-gate` | — | Understand→Plan→Document + verify 03 PM gate |
| Founder | User | — | — | approve E2E PASS → go Freeze H6 |
| PM | `seith-pm` | `git-worktree-manager` + gate `fmt/clippy/test` | `seith-pm` | orkestrasi `handoff/11 → main` + veto if gate/reviewer/zone fail — MANDATORY |
| Arsitek | `architect` | `senior-architect` | `architect` | audit 8 gerbang + H10-impl vs H11 drift |
| Planner | `planner` | `tdd-workflow` | `planner` | forward-test Freeze H6 after 03 PASS |
| Eksekutor | sub-agent | `seith-market-intelligence` + `tdd-workflow` | `explore` | 01→02→03 sequential 1 terminal |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | verify Z1 no edit drift |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | verify no secret, disclaimer always |
| Doc | `doc-updater` | `remember`+`handoff` | `doc-updater` | sinkron docs/api-spec after sync |

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/11-e2e-testing` + task `03-sync-pm-gate.md` + ritual 3Q + `skill://verification-loop` + `seith-pm` gate MANDATORY
