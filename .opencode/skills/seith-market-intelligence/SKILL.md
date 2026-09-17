# Skill: seith-market-intelligence — SSOT Track 3 Market Intelligence (SEITH) v2 Long-Term

## Purpose
Win Sectors Hackathon 2026 Track 3 Reveal + production-ready MI: SEITH mengubah Sectors data menjadi derived insight (signals/scores/rankings/anomalies/comparative research) — raw display = FAIL. Satu narasi, satu tujuan — semua terminal ikut skill ini v2, bukan v1 tipis. Lessons d46a77d live 100 encoded.

## When to Use
Trigger: `seith`, `market intelligence`, `mispricing`, `ranking`, `anomaly`, `dossier`, `kronos`, `sectors`, `tradingagents`, `9router`, `seith-cli`, `market=sg`, `backtest`, `heatmap`. Setiap session T1/T2 WAJIB load `skill://seith-market-intelligence` di awal + `skill://seith-data` + `skill://seith-design` bila sentuh research/web + `verification-loop` di akhir. T0 = otak Understand→Plan→Document; tidak coding berat.

## Todo
Tiap session: `skill://seith-market-intelligence` → `todowrite` exactly-one `in_progress` (AGENTS §8d) → Implement → `verification-loop` → `completed` — `grep SECTORS_API_KEY apps/web 0` sebelum `completed`.

## Roles — Founder Model (2-3 Terminal, 7 Agents)
- **T0 Sesi Utama:** putuskan arah win, tulis/approve `phase-NN-topic/00-overview.md`, jaga single narrative `AGENTS.md → docs/*`.
- **T1/T2 Eksekutor:** `Implement → Verify` per handoff doc, branch `handoff/NN-topic`, satu slice TDD red-green per session — parallel file-disjoint (T1 `.opencode/` vs T2 `apps/web` safe).
- **PM:** `seith-pm` autonomous worktree + gate `fmt/clippy/test` + veto `main` — `seith-code/data/quant/security/design/doc-reviewer` parallel `seith-phase-gate`.
- **Skill = SSOT v2:** pointer + decision tree + lineage 296c + scoring playbook — logic hanya di docs & code — dilarang duplikasi narasi.

## Tier 0 — Non-negotiable (Track 3 Rules)
- Sectors MCP/REST = CORE source (cabut = produk mati). No auto trade execution. Disclaimer `bukan rekomendasi investasi` di setiap insight view + PDF footer `x-schema-version`.
- 9router `localhost:20128` NEVER kill/restart — `http://localhost:20128/v1/chat/completions` OpenAI-compatible, `LLM_BASE_URL` server-only — check `Invoke-WebRequest :20128/v1/models →200` sebelum dossier — fallback `degraded:true` jika down (LLM opsional Track 3, tetap lolos).
- Market: default `id` (IDX), `sg` optional flag — tiap query/`--market` validasi `enum Market {Id,Sg} FromStr as_str() id|sg` — invalid 422 (AGENTS §6 Market) — `universe-100 FINANCE25/ENERGY20/CONSUMER20/INFRA20/OTHER15` stratified.
- No secret di code/log/config — `crates/seith-core/src/redact.rs Redacted Display ***` — `.env` gitignore — `0843... revoked 2026-09-05` — `SECTORS_API_KEY` server-only.
- Repo public 19 Aug–30 Sep 2026, freeze saat submit — `scripts/freeze-check.sh` — `push --force` veto — history verifiable 296c + Kronos T1.0.

## Stack (Locked — d46a77d Live Verified)

| Layer | Stack | Framework |
|---|---|---|
| Core | Rust edition 2021 | Axum + Tokio, serde, validator, chrono, reqwest, thiserror/anyhow, tracing, tower-http |
| Cache | Composite | moka L1 hot <1ms + SQLite L2 `data/seith.db` WAL `busy_timeout 3000` TTL 24h raw / 1h ranking — trait `Cache`, key `market:sector:ticker:date`, Redis 30MB ditolak (IDX raw ~45MB) |
| CLI | Rust | clap `--market id|sg` — `ranking --sector FINANCE`, `dossier BBCA --pdf`, `scan --tickers` |
| Quant | Python uv | FastAPI + Uvicorn, torch, Kronos-base `apps/kronos-sidecar :8001` `NeoQuasar/Kronos-base` + Tokenizer `102.3M` |
| Research | Python uv | FastAPI, LangGraph-inspired, httpx → 9router `apps/analysis :8002` `nemutron` |
| LLM | 9router | `http://localhost:20128/v1/chat/completions` Tier-0 NEVER kill |
| Web | Next.js 14 | App Router + TS + Tailwind + shadcn, Zod, recharts, pnpm — `@react-pdf/renderer` PDF vector |
| Test | Rust+Python+FE | cargo test 89+ mockito rusqlite, uv pytest ruff, pnpm test, `nbconvert` 7→10 sel plotly 5.24.1 isolated `research/.venv` |

## Pipeline Workflow — Intelligence Loop `60s Ranking → Deep Dossier` (Locked d46a77d)

```
[1] Sectors Batch+CompositeCache (market=id default, moka L1 + SQLite L2 data/seith.db, key market:sector:ticker:date, 24h TTL raw / 1h ranking, batch chunks(20)×5, market=sg optional STI)
 → [2] Normalize & Cleansing (Rust seith-core) — OHLC WAJIB missing→exclude+reason 422 + insufficient_data, volume/amount missing→0.0, rasio missing→sector median per market 0.0 + flag, lookback>512→422 at handlers boundary (not sidecar)
 → [3] Kronos-base Sidecar :8001 POST /predict_batch 19→20 T1.0 top_p0.9 max_context 512 equal guard 30s retry1 fallback degraded:true — real 98×19 → 20 forecast
 → [4] Scoring Rust 0-100 = 30%ER(z_normalize) +20%(100-|Z|)+30%QV(percentile per market)+20%SectorMom clamp breakdown (LPPF 50.02/99.91/100/76.58=80.3 rank1)
 → [5] Ranking Mispricing desc → |Z| tie-break + Anomaly Flag |Z|>2 OR vol spike >2σ tanpa katalis + excluded BMRG 404 MFIN missing_ohlc jujur
 → [6] TradingAgents-Lite :8002 POST /synthesize Top-10 only Fund/Tech/Synth (Sectors adapter → 9router :20128 nemutron, disclaimer, 10 llm 90 template)
 → [7] Dossier Compose Rust → JSON + PDF 9-section Bloomberg vector (ScoreBadge >70 emerald 40-70 amber <40 red, stacked real, Line 400+20 chart, heatmap 10×10 rects 100)
 → [8] Hybrid Delivery — Rust API Axum /api/v1/* envelope + x-schema-version + seith-cli clap --market + Next.js FE consume Rust API (rewrites :8181, SEITH_API_BIND 0.0.0.0:8181, 8080 httpd occupied, load_dotenv no dep)
```

Decision tree:
- `?market=id|sg` → `Market::fromStr` → `Id→/v2/indonesia/transaction/daily Sg→/v2/singapore/transaction/daily` — invalid 422
- `lookback + pred_len >512` → 422 boundary — Kronos cold 2-3m `MOCK=1 smoke BBCA → MOCK=0 100`

Lesson 14 Sep: ADES generik AI (text+dummy 30/20/30/20 + no chart) → H14 polish 4 MVP (Heatmap 100 + Stacked Top-20 + Scatter ER vs |Z| + Equity Area+drawdown); probe loop 7× → rule `diagnose 1× + fix surgical 1×` not probe N+1.

## Workflow & Handoff Protocol
- Session baru + doc `phase-NN-topic/00-overview.md` (Goal, Context, Scope In/Out WBS DoD Peran Matrix Branch Verification Risk Next Prompt) — `AGENTS.md §8b` flat `handoff/NN-topic`.
- `git worktree add ../seith-wt/handoff-NN -b handoff/NN-topic` — isolate `target/` + `data/seith.db` WAL — 7 agents `code/data/quant/security/design/doc + pm` parallel `seith-phase-gate`.
- Gate: `cargo fmt --check && cargo clippy -- -D warnings && cargo test 89+` (+ `uv run pytest` sidecar, `pnpm lint/typecheck/build 4 routes`) + `Invoke-WebRequest :20128/v1/models 200` + `grep SECTORS_API_KEY apps/web 0` + `grep plotly apps/kronos-sidecar 0` + `Accountability Block ✅/⚠️/🔻/♻️ + ♻️ Refactor:` — paste nyata, no fabrikasi.

## Critical Notes — WAJIB BACA SEBELUM IMPLEMENT
- WAJIB `docs/notes/00-readme.md →01-tujuan →02-kronos-kritis (512) →03-MI-gate →04-arsitektur →05-anti-patterns.md` — auto-load `00-readme.md`.
- Ritual 3Q jawab di PR/handoff: 1) Gate MI mana lolos? 2) Jebakan Kronos/cache/market/8080 apa? 3) Test FAIL apa jika salah?
- 14 anti-pattern `05-anti-patterns.md` — `code-reviewer` 1-6, `security-reviewer` 6-8, `data-reviewer` 9-11, `design-reviewer` 12-14, PM 10-12.
- Branch WAJIB `handoff/NN-topic` (`t1`/`t2` if parallel) `git worktree add` — no direct `main` — PM veto jika tanpa branch/notes — long-term: `scripts/verify.sh` one-gate + `seith-ops` skill.

## Hard Conventions (AGENTS.md)
- Rust `cargo` edition 2021 `rustfmt+clippy` — Python HANYA sidecar `uv` — LLM via 9router — Cache Composite `data/seith.db` — `AGENTS.md §5 Commands + §3c Seven Zones`.
- Immutability — `fn<50 file 200-400 (max 800) nesting≤4 no dead code no unwrap? no silent swallow` — `refactor-cleaner` WAJIB pasca handoff — `Accountability Block ♻️ Refactor:`.
- API envelope `{success,data,error,pagination}` + `x-schema-version` — Repository pattern — `Cache` trait L1/L2 — `research/backtest-100.json` verifiable lineage 296c.

## Docs Map
- `AGENTS.md` — charter 7 Zones, Tier 0, stack, workflow, branch §8b — `docs/prd.md` — problem/persona/pipeline §5 — `docs/spec.md` — hybrid §1 pipeline §2 — `docs/api-spec.md` — endpoints Axum CLI §1 health §3 `?market` Cache §6 Sectors §7 sidecar §9-10 — `docs/tdd-plan.md` — pipeline §2 TDD critical — `docs/kronos-notes.md` — 2508.02739v1 max_context — `docs/notes/00→05` — `research/money-leak-backtest.ipynb` 7→10.

## Available opencode Skills (Audit v2 Long-Term)
- Custom (project 10): `seith-market-intelligence` SSOT v2 ini + `seith-dev` (gotcha + load_dotenv) + `seith-kronos` (MOCK toggle) + `seith-data` (lineage 296c 100 equity12) + `seith-design` (Bloomberg + no-ai-slop) + `seith-quant` (H15 Top-N walk-forward IC spec) + `seith-ops` (worktree freeze verify) + `seith-phase-gate` + `verification-loop` (`seith-pm` harness).
- Global 131 reuse `~/.agents/skills` ambient — eksekutor pakai helper, narasi tetap SSOT v2.

## Judging Lens
40% Usability hybrid CLI verifiable + Web 60s comprehension heatmap/stacked IDX primary + 30% Video teaser 1m CLI+Web + judging 3m STI H5 bonus + 30% Tech Depth Sectors core + Kronos-base T1.0 + Rust CompositeCache 100% gratis + 9router market-agnostic — explainable derived insight hari ini — production frozen 30 Sep 23:59 WIB.

## References
- `hackathon.sectors.app/tracks/market-intelligence` — boundary 30 Sep freeze — `Sectors /v2/indonesia|singapore/transaction/daily` — `Kronos model.Kronos/Tokenizer/Predictor NeoQuasar/* 2508.02739v1.pdf` — `TradingAgents TauricResearch 3-agent copy vendor read-only ADR 0002` — `9router :20128/v1` — `d46a77d live 100 as_of 2026-09-13 llm 10/10`
