# Phase 05 — Hybrid Delivery (Axum API + CLI + Web + Dossier) — Overview

## Goal
Kunci `[8] Hybrid Delivery` — `Rust API Axum /api/v1/*` + `seith-cli clap` + `Next.js FE` + `Dossier 1-page` berbagi `seith-core` + envelope `SCHEMA_VERSION 1.0.0` — verifiable tanpa browser.

## Context
- SSOT: `AGENTS.md §3c Seven Zones §8b Branch §8c Ownership` + `docs/spec.md §2[8] §6 §7b` + `docs/api-spec.md §1-10 (envelope + market + 6 endpoints)` + `docs/tdd-plan.md §3 paths 6-7 §4 CLI contract §7 fixtures` + `docs/adr/0001-0004` + `skill://seith-market-intelligence` + `skill://no-ai-slop` Tier-1 + `skill://verification-loop`
- Prereq DONE: `main 929b554` H1 Sectors+Cache → H2 Kronos :8001 (bridge `seith-core/kronos`) → H3 Analysis :8002→9router (bridge `seith-core/analysis`) → H4 Scoring 0-100+Ranking+Anomaly — H5 hanya wire delivery, no scoring logic baru
- Wire existing: `crates/seith-api/src/{lib 24L, envelope 119L, handlers 87L, repository}` + `crates/seith-cli/src/main.rs 54L` stub — H5 expand, bukan greenfield
- Market default `Id` — `?market=sg` / `--market sg` per endpoint — sector median per market terpisah — `validation: 422 if lookback>512 or ticker ^[A-Z0-9]{3,6}$ fail`
- Zona terdampak: Z1 `crates/{seith-api,seith-cli,seith-core}` + Z2 `apps/web` + Z4 `tests/fixtures` + Z6 `.handoff/phase-05-hybrid` + Z7 `scripts/.github` — `apps/kronos-sidecar+analysis` touchless (verify only)

## Scope In / Out
In (7 Zones — file luar zona = PM veto):
- Z1 `crates/seith-api/src/{handlers.rs, envelope.rs, repository.rs, lib.rs, dossier.rs}` Axum `GET /health /api/v1/health /api/v1/ranking /api/v1/tickers/:ticker/score /api/v1/tickers/:ticker/dossier?format=json|pdf /api/v1/anomalies POST /api/v1/scan` envelope `{success,data,error,pagination}` header `x-schema-version`
- Z1 `crates/seith-cli/src/{main.rs, cli.rs, commands/{ranking,dossier,scan}.rs}` clap `seith ranking/score/dossier/scan --market id|sg --json --pdf` emit envelope identik REST
- Z1 `crates/seith-core/src/dossier.rs` compose `score+peer+kronos+research → JSON→PDF bytes` (no new scoring)
- Z2 `apps/web/{app/{page.tsx,ranking/page.tsx,dossier/[ticker]/page.tsx}, components/{RankingTable,ScoreBadge}, lib/api.ts}` consume Rust API `fetch /api/v1/*` Bloomberg `#0B0E14`
- Z4 fixtures `ranking-snapshot.json` CLI vs REST contract
Out: `apps/kronos-sidecar :8001` + `apps/analysis :8002` logic (verify only), `sectors-client` CompositeCache (H1 done), `data/seith.db` WAL (no migration), freeze kit H6, STI full coverage (flag only)

## WBS — Task Breakdown
| # | Task file | Slice | Depedensi |
|---|---|---|---|
| 01 | `01-api-axum-envelope.md` | Axum handlers + envelope + market validation | — |
| 02 | `02-cli-dossier.md` | CLI clap + dossier PDF compose | 01 (envelope/market) |
| 03 | `03-web-nextjs.md` | Next.js Bloomberg consume Rust API | 01 |
| 04 | `04-verify-e2e.md` | Verify CI green contract E2E | 01-03 |

Dependensi antar-fase: `H1→H2→H3→H4 DONE → H5 THIS Hybrid (wire scoring) → H6 Freeze` — cross-zona import `seith-core ↛ sectors-client`, `apps/* ↛ crates/*` selain via `seith-api` envelope (§3c).

## Definition of Done — Phase 05
1. `cargo fmt --check && cargo clippy -- -D warnings` 0 per crate
2. `cargo test -- --nocapture` REST envelope + market validation + pagination + `cargo test -p seith-cli` + `cargo test -p seith-api` — assertion meaningful
3. `pnpm lint && pnpm typecheck && pnpm test` di `apps/web` hijau
4. `uv run pytest -q` sidecars unchanged 17+17
5. `refactor-cleaner` pass `fn<50 file200-400 nesting≤4 no dead code immutable` + `♻️ Refactor:` per task — §5b Boy Scout
6. Dual-review `rust-reviewer ∥ security-reviewer` pass + `seith-phase-gate`
7. `verification-loop` paste nyata no fabrikasi + `gitleaks 0` + `no-ai-slop` Tier-1 warn
8. Docs sinkron `spec §2[8] + api-spec §3 + tdd-plan §3/7` + README 7 Zones
9. Accountability `✅/⚠️/🔻/♻️` per task — PM veto jika tidak rapih (§8c)
10. File baru WAJIB zona benar — `/.wt/` gitignore

## Peran + Skill + Sub-agent Matrix
| Peran | Eksekutor | Skill WAJIB | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead Otak T0 | opencode sini | `seith-market-intelligence` + `verification-loop` | — | Understand→Plan→Document |
| Founder | User | — | — | approve go-live/freeze |
| PM Autonomous | `seith-pm` | `git-worktree-manager`+gate `fmt/clippy/test` | `seith-pm` | orkestrasi `handoff/05-hybrid` + veto |
| Arsitek | `architect` | `senior-architect` | `architect` | SEBELUM coding 01 — audit 7 Zones |
| Planner | `planner` | `tdd-workflow` | `planner` | forward-test H6 freeze dossier |
| Eksekutor T1/T2 | sub-agent | `seith-market-intelligence`+`tdd-workflow` | `explore` | T1 API+Web ∥ T2 CLI+Dossier (file beda) |
| Desainer Test | `tdd-guide` | `tdd-guide` | `tdd-guide` | matrix market/envelope/paginate |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | handlers + cli |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | market validation + secret env-only |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca tiap task |
| Doc | `doc-updater` | `remember`+`handoff` | `doc-updater` | sinkron docs tiap merge |

## Branch & Worktree
- Branch flat `handoff/05-hybrid` dari `main` — `git worktree add ../seith-wt/handoff-05 -b handoff/05-hybrid` — `/.wt/` gitignore
- Paralel: `T1 API+Web` Z1 `seith-api/*` + Z2 `apps/web/*` → `handoff/05-hybrid-t1-api` ∥ `T2 CLI+Dossier` Z1 `seith-cli/*` + `seith-core/dossier.rs` → `handoff/05-hybrid-t2-cli` — no `target/` clash, file beda
- Tiap session wajib `skill://seith-market-intelligence` + ritual 3Q `docs/notes/00-readme.md`

## Verification
```
cargo fmt --check → 0
cargo clippy -- -D warnings → 0
cargo test -- --nocapture → api envelope + market 422 + pagination + cli contract
cargo test -p seith-cli -- --nocapture → cli ranking/dossier/scan envelope
pnpm lint/typecheck/test → 0 (apps/web)
uv run pytest -q → 17+17 unchanged
refactor-cleaner → fn<50 file200-400 nesting≤4 pass
```

## Risks & Mitigasi
- `api-spec drift` CLI/REST envelope berbeda → contract test `cli json ≡ rest json` + mockito
- `market sg` noise sector median campur Id → validate `Market::from_str` 422 + per-market key `market:sector:ticker:date`
- `pdf` heavy dep → `@react-pdf/renderer` already in `apps/web` deps, Rust dossier bytes simple — no new heavy crate

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/05-hybrid` + task `01-api-axum-envelope.md` + ritual 3Q
