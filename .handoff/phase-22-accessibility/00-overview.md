# Phase 22 — Accessibility Bloomberg × AA — Overview

## Goal
Polish `apps/web` to Bloomberg×TradingView×Stockbit accessibility + Vercel link klik + PDF AA-grade factual — zero generic gap, 100% verifiable.

## Context
- SSOT: `AGENTS §3c/§5b/§6/§6c/§8c` + `docs/prd §4-5` + `docs/spec §2/§4` + `docs/api-spec §3` + `docs/kronos-notes` + `research/backtest-100.json 296c 2026-09-13` + `research/universe-100.json FINANCE25` + `tests/fixtures/sector-median.json 6 sektors` + `docs/notes/00-readme` ritual 3Q
- Skill wajib: `skill://seith-market-intelligence` awal T1/T2 + `skill://no-ai-slop` Tier-1 + `skill://verification-loop` akhir + `skill://seith-design` + `skill://seith-data|quant|ops` + ritual `docs/notes/00-readme.md` 3Q (tujuan-win → Kronos-512 → anti-pattern) sebelum Implement
- Branch: `handoff/22-accessibility` flat AGENTS §8b — docs `.handoff/phase-22-accessibility/` — worktree `../seith-wt/handoff-22` from `handoff/21-zero-gap` (base `7902b84`, rebase after PR #40 merge — currently `1b800ca` until rebase)
- Dep: H21 factual wiring done (PR #40 OPEN `health db_counts + is_mock_mode + 3 memo distinct + catch logged + chart honest + credit 296 + AGENTS 9 + ci hard-fail` `fmt0 clippy0 test89 lint0 typecheck0 build4`) → H22 polish accessible
- Zona: Z1 `crates/seith-api, seith-core` Z2 `apps/web, kronos-sidecar, analysis` Z3 `data/seith.db 126KB 25×20` Z4 `tests/fixtures` Z5 `docs/research/vendor` Z6 `.handoff` Z7 `scripts,.opencode,.github,AGENTS` — 7 Zones lock

## Scope In / Out
In:
- Z1: `crates/seith-api/src/handlers.rs` health `db:{ohlcv,fundamentals}` badge `as_of live/degraded` + `crates/seith-core` memo wiring reuse
- Z2: `apps/web` (`app/`, `components/`, `lib/`, `vercel.json`, `next.config.js`) hero dense + screener + heatmap treemap + charts + dossier + PDF — Z2 core polish
- Z3: `data/seith.db` counts expose factual `ohlcv≥400 fundamentals 25` WAL
- Z4: `tests/fixtures/sector-median.json` 6 sektors tooltip
- Z5: `docs/api-spec.md` credit 296 reconcile + `docs/kronos-notes.md` canonical
- Z6: `.handoff/phase-22-accessibility/00-05` governance
- Z7: `AGENTS.md §10 9 skills` + `.github/workflows/ci.yml web hard-fail build 4 routes` + `.github/workflows/freeze-check.yml` + `.opencode 7 agents` + `.gitleaks.toml` + `.githooks/pre-commit` + `scripts/` — harness & ops
Out: live Sectors batch 25c `sectors-client chunks20` (gated 22.5 optional single run for video 30% depth, default synthetic honest degraded 0c `704c sisa`), Kronos 102M `MOCK=0` warm (gated, stay 1), STI `sg` live (stretch), LLM Top-10 expand beyond nemutron 10/10 (defer)

## WBS — Task Breakdown
| # | Task file | Slice | Dep | Zona |
|---|---|---|---|---|
| 01 | `01-web-bloomberg-polish.md` | Web UI Bloomberg density `#0B0E14/#11151F/#1A1F2E #24242e` `Inter 800+JetBrains Mono tabular 8pt rounded6 shadow-card glass 1360px` hero gradient 4 KPI + sector strip 5 pills + heatmap treemap 5 avg + screener bar+flag sticky + pagination 25 + peer5 QV+cap | — | Z2 |
| 02 | `02-data-factual-wiring.md` | Data factual wiring — `health db` badge live/degraded + `sector_median` 6 tooltip + `DossierKronosChart` `pts?Area amber dashed +/-2σ:degraded` honest + `catch logged` + `envelope disclaimer` | 01 | Z1+Z2 |
| 03 | `03-pdf-AA-grade.md` | PDF AA-spec — `DossierPDF @react-pdf/renderer` 2p A4 `595×842` vector 9-section dense tabular (Cover/Executive/3 memo/Mispricing 30/20/30/20/Valuation QV/Peer5 QV+cap+|Z|/Anomali/voltage/Katalis/Metodologi 400→20/Annex) + `SCHEMA_VERSION` footer | 02 | Z2 |
| 04 | `04-vercel-deploy.md` | Vercel accessibility — `vercel.json rewrites` + `NEXT_PUBLIC_API_BASE` + secrets `Redacted ***` + `pnpm build 4 routes` preview `200 as_of live/degraded` + README one-liner 3 cmds | 03 | Z2+Z7 |
| 05 | `05-security-audit.md` | Security audit MANDATORY — `Redacted ***` server-only never client/log + `deny_unknown_fields + TICKER_RE + Market + 512 + 50 + rate limit` + `gitleaks 0` + `SECTORS_API_KEY` no bundle leak + `vendor pin` | 04 | Z1+Z2+Z7 |

Gated optional (not DoD, `ponytail: live when video needs 30% depth`):
- 22.5: `sectors-client batch 20` live FINANCE 25c single run `score_live_98.py → 296c proof` exposes `CompositeCache L1<1ms L2~2ms`
- Kronos warm: `KRONOS_MOCK=0` download NeoQuasar/Kronos-base 102M cold 3m CPU

## Todo (`todowrite` WAJIB exactly-one `in_progress`)
- [ ] `01-web-bloomberg-polish` — pending (T1)
- [ ] `02-data-factual-wiring` — pending (T1 sequential after 01)
- [ ] `03-pdf-AA-grade` — pending (sequential after 02 — shares no file but depends on 02 data wiring)
- [ ] `04-vercel-deploy` — pending (after 03)
- [ ] `05-security-audit` — pending (MANDATORY gate after 04, before phase-gate)
- `todowrite` after Plan: 1 task file = 1 todo item, exactly-one `in_progress`, update realtime. `completed` only after Verify hijau + Block `✅/⚠️/🔻/♻️` + `♻️ Refactor:`. PM `seith-pm` veto if no trace.

## Definition of Done — Phase (AGENTS §7 + §5b + §6c + §8c — 05 MANDATORY security gate)
1. `cargo fmt --check && cargo clippy -- -D warnings` 0 per crate touched (Rust workspace root)
2. `cargo test -- --nocapture` pending→green 89+ + `(cd apps/kronos-sidecar && uv run pytest -q)` pending→green 18+1 + `(cd apps/analysis && uv run pytest -q)` pending→green + `pnpm --dir apps/web lint 0 && typecheck 0 && test 6/6 && build 4 routes (/ /ranking /backtest /dossier/[ticker])` pending→green — Heatmap + screener + BacktestChart Area expected `GET / 125k css true`
3. `refactor-cleaner` scan pending→pass `fn<50 file200-400 nesting≤4 no dead code` + `♻️ Refactor:` per task + pipeline real no dead code: all `store.rs/pipeline.rs/score/ranking/dossier/radar` called via `cargo run` proof
4. Review `seith-code-reviewer + seith-data-reviewer + seith-quant-reviewer + seith-design-reviewer + seith-doc-reviewer + seith-security-reviewer MANDATORY` pending→pass + `skill://no-ai-slop` Tier-1 `grep bannedWords 0` + `seith-design` Bloomberg tokens `#0B0E14/#11151F/#1A1F2E #24242e`
5. `verification-loop` pending→pass + `gitleaks detect --no-git --config .gitleaks.toml` pending→0 + `sqlite3 data/seith.db "SELECT COUNT(*) FROM ohlcv; SELECT COUNT(DISTINCT ticker) FROM fundamentals WHERE sector='FINANCE'"` expected ≥400/25 + manual `score BBCA≠BBRI qv59 er50 / ranking 20/25 total 25 desc / dossier BBCA median|sektor breakdown real / radar 5 flag not_available_yet / health db:{ohlcv,fundamentals}` pending→paste + `grep -r SECTORS_API_KEY apps/web/.next` expected 0 (value leak check)
6. Docs sync `docs/api-spec credit 296 reconciled + docs/kronos-notes canonical + README 15sec quick-start 3 cmds` + `research/*.html` gitignored + `data/seith.db` 126KB seed factual + `seith-doc-reviewer` docs drift 0
7. Accountability Block per task `✅ Terverifikasi: <cmd> → <output actual> SHA:<short> / ⚠️ Belum / 🔻 Risiko: <1-2> — deteksi: <cara> / ♻️ Refactor:` — no fabrikasi, expected vs actual separated, SHA logged

## Peran + Skill + Sub-agent (AGENTS §8 long-term 7 Agents)
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead T0 | opencode sini | `seith-market-intelligence` v2 + `seith-ops` | — | Plan→Document→Verify delegasi |
| PM | `seith-pm` | `git-worktree-manager` + `verification-loop` | `seith-pm` | worktree/branch/PR 6 contexts strict `1 approval enforce strict` veto if gate fail |
| Code | `seith-code-reviewer` | `coding-standards` | `seith-code-reviewer` | `fn<50 clippy unwrap` Z1+Z2 |
| Data | `seith-data-reviewer` | `seith-data` | `seith-data-reviewer` | `data/seith.db + backtest-100 lineage 296c` Z3+Z5 |
| Quant | `seith-quant-reviewer` | `seith-quant` | `seith-quant-reviewer` | `30/20/30/20 + anomaly |Z|>2 vol>2σ` |
| Design | `seith-design-reviewer` | `seith-design` + `no-ai-slop` + `design-taste-frontend` + `high-end-visual-design` | `seith-design-reviewer` | `apps/web Bloomberg tokens` AA density |
| Doc | `seith-doc-reviewer` | `no-ai-slop` + `design-taste-frontend` | `seith-doc-reviewer` | `README/docs/*.md prose + 7 Zones drift` |
| Security | `seith-security-reviewer` | `security-review` | `seith-security-reviewer` | `SECTORS_API_KEY Redacted ***` server-only MANDATORY pra-freeze |

## Branch & Worktree (AGENTS §8b)
- `git worktree add ../seith-wt/handoff-22 -b handoff/22-accessibility` from `handoff/21-zero-gap` base `7902b84` — after PR #40 merge to `main`, rebase `git fetch origin && git rebase origin/main` to sync. `/.wt/` ignored
- Strict sequential `01→02→03→04→05→phase-gate` — security 05 is closing gate, no bypass via 04. T1/T2 parallel only if file-disjoint AND both depend on same parent done
- Tiap T1/T2 `skill://seith-market-intelligence` awal + `todowrite` exactly-one `in_progress` + `docs/notes/00-readme.md` ritual 3Q
- File outside 7 Zones = PM veto (temp 7→0 already, `html` ignored, `.wt/` correct). `apps/web/vercel.json` = Z2, `.gitleaks.toml`/`.pre-commit-config.yaml` = root config explicit Z7

## Verification (expected → actual after implement, SHA logged)
```
# expected (pending until implement):
cargo fmt --check → expected 0 (actual: paste after run, SHA:xxx)
cargo clippy -- -D warnings → expected 0
cargo test -- --nocapture → expected 89 passed (seith-core) + ranking 3 + dossier 3 + radar 2 (actual: paste)
(cd apps/kronos-sidecar && uv run pytest -q) → expected 18 passed 1 skipped
(cd apps/analysis && uv run pytest -q) → expected pass
pnpm --dir apps/web lint → expected 0
pnpm --dir apps/web typecheck → expected 0
pnpm --dir apps/web test → expected 6/6
pnpm --dir apps/web build → expected 4 routes (/ /ranking /backtest /dossier/[ticker])
sqlite3 data/seith.db "SELECT COUNT(*) FROM ohlcv; SELECT COUNT(DISTINCT ticker) FROM fundamentals WHERE sector='FINANCE';" → expected ≥400 / 25
cargo run -p seith-cli -- score BBCA --market id | jq .data.mispricingScore → expected ≠ BBRI (actual: paste)
cargo run -p seith-cli -- ranking --sector FINANCE --market id | jq '.data.pagination.total' → expected 25
curl -s http://127.0.0.1:8181/health | jq '.data.db, .data.schema' → expected {ohlcv:≥400,fundamentals:25}
curl -s http://127.0.0.1:8001/health | jq '.model, .max_context' → expected mock|Kronos-base, 512
gh pr checks 6 contexts → expected strict green (actual: gh pr checks <nr>)
```
> All above pending until implement — paste actual output with SHA after `cargo test`/`pnpm build` run. No fabrikasi.

## Exit Gate (security closing)
Strict sequential `01→02→03→04→05→phase-gate` — 05 `seith-security-reviewer` MANDATORY sign-off before PR merge, no exit via 04. Architect pra-freeze sign-off after 05.

## Risks & Mitigasi
- Vercel `SECTORS_API_KEY` leak → mitg `Vercel env secrets + .env gitignore + gitleaks v2 + freeze-check grep --exclude-dir=.venv` — deteksi `gh pr checks freeze fail`
- DB hollow preview `0 rows` → mitg `health db 0,0 → degraded:true` honest + seed `data/seith.db 126KB` committed H20 — deteksi `sqlite count` + `health jq .data.db`
- PDF generic prose → mitg AA-spec 9-section tabular density `SCHEMA_VERSION` footer + `no-ai-slop` grep `delve/leverage/robust` 0 — deteksi `seith-design-reviewer` + `grep banned`
- Health fake `Kronos-base` while `_fell_back` → mitigated H21 `is_mock_mode()` — deteksi `curl :8001/health model==mock when fallback`
- Credit blow `25c` repeat → mitg `synthetic honest default + 22.5 gated single run approval` — deteksi `credit_cost 296` single source

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/22-accessibility` + task `01-web-bloomberg-polish.md` + ritual 3Q — `todowrite` → Implement sequential 01→02→03→04→05 → `seith-phase-gate` + `verification-loop` → PR squash after 6 contexts strict (security 05 sign-off required)
