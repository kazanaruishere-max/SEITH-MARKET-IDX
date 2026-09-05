# Skill: seith-market-intelligence — SSOT Track 3 Market Intelligence (SEITH)

## Purpose
Win Sectors Hackathon 2026 Track 3 Reveal: SEITH mengubah Sectors data menjadi derived insight (signals/scores/rankings/anomalies/comparative research). Raw display = FAIL. Satu narasi, satu tujuan — semua terminal ikut skill ini.

## When to Use
Trigger: `seith`, `market intelligence`, `mispricing`, `ranking`, `anomaly`, `dossier`, `kronos`, `sectors`, `tradingagents`, `9router`, `seith-cli`, `market=sg`. Setiap session T1/T2 WAJIB load `skill://seith-market-intelligence` di awal dan `verification-loop` di akhir. T0 (sesi utama) = otak Understand→Plan→Document; tidak coding berat.

## Roles — Founder Model (2-3 Terminal)
- **T0 Sesi Utama:** putuskan arah win, tulis/approve `.handoff/handoff-NN-topic.md`, jaga single narrative `AGENTS.md → docs/*`.
- **T1/T2 Eksekutor (sub-agent):** `Implement → Verify` per handoff doc, branch `handoff/NN-topic`, satu slice terverifikasi (TDD red-green) per session. Review via sub-agent `code-reviewer`/`security-review`.
- **Skill = SSOT:** skill ini hanya pointer + rule ke `AGENTS.md` dan `docs/prd.md`, `docs/spec.md`, `docs/api-spec.md`, `docs/tdd-plan.md`. Dilarang duplikasi narasi; logic hanya di docs & code.

## Tier 0 — Non-negotiable (Track 3 Rules)
- Sectors MCP/REST = CORE source (cabut = produk mati). No auto trade execution. Disclaimer `bukan rekomendasi investasi` di setiap insight view.
- 9router `localhost:20128` NEVER kill/restart — LLM via `http://localhost:20128/v1/chat/completions` (OpenAI-compatible), `LLM_BASE_URL` server-only. Check `Invoke-WebRequest http://localhost:20128/v1/models` 200 sebelum dossier. Fallback `degraded:true` jika down (LLM opsional Track 3, tetap lolos).
- Market: default `id` (IDX), `sg` optional flag — tiap query/`--market` harus divalidasi `enum Market {Id,Sg}`.
- No secret di code/log/config. Validasi input ketat di boundary. Repo public 19 Aug–30 Sep 2026, freeze saat submit.

## Stack (locked — Rust Core + Kronos-base + CompositeCache + 9router)

| Layer | Stack | Framework |
|---|---|---|
| Core | Rust edition 2021 | Axum + Tokio, serde, validator, chrono, reqwest, thiserror/anyhow, tracing, tower-http |
| Cache | Composite | moka L1 (hot, <1ms) + SQLite L2 (`data/seith.db`, ~2ms, persistent) — trait `Cache`, Redis 30MB ditolak (IDX raw ~45MB), Supabase defer H5 |
| CLI | Rust | clap — `seith ranking --sector FINANCE`, `seith ranking --market sg --sector FINANCE`, `seith dossier BBCA --pdf`, `seith scan --tickers BBCA,BMRI` |
| Quant sidecar | Python uv | FastAPI + Uvicorn, torch, Kronos-base (`apps/kronos-sidecar :8001`) |
| Research sidecar | Python uv | FastAPI, LangGraph-inspired, httpx → 9router (`apps/analysis :8002`) |
| LLM | 9router | `http://localhost:20128/v1/chat/completions` (OpenAI-compatible), Tier-0 NEVER kill |
| Web | Next.js 14 | App Router + TS + Tailwind + shadcn, Zod (FE), pnpm |
| Test | Rust+Python+FE | cargo test+mockito+rusqlite, uv pytest+ruff, pnpm test |

Kronos: `NeoQuasar/Kronos-base` + `NeoQuasar/Kronos-Tokenizer-base`, `max_context 512`, `predict_batch` 400→20, T1.0 top_p0.9. Market: `enum Market` dengan helper `as_str()` (`id|sg`) untuk Sectors base path `/v2/{indonesia|singapore}/transaction/daily`. Vendor `vendor/Kronos` & `vendor/TradingAgents` hanya referensi ter-pin (read-only, ADR 0002).

## Pipeline Workflow — Intelligence Loop `60s Ranking → Deep Dossier` (Locked)
```
[1] Sectors Batch+CompositeCache (Rust, market=id default, moka L1 + SQLite L2 data/seith.db, key market:sector:ticker:date, 24h TTL raw / 1h ranking, batch per sektor, market=sg optional STI)
 → [2] Normalize & Cleansing (Rust seith-core) — open/high/low/close WAJIB (missing→exclude+reason 422), volume/amount missing→0.0, rasio missing→sector median per market fallback 0.0 + insufficient_data flag, lookback>512→422
 → [3] Kronos-base Sidecar :8001 POST /predict_batch (equal guard, 30s timeout retry1 fallback degraded:true)
 → [4] Scoring Engine Rust (Mispricing 0-100 = 30%ER+20%(100-|Z|)+30%QV+20%SectorMom, clamp, breakdown, percentile per market)
 → [5] Ranking + Anomaly Flag (|Z|>2 atau volume spike >2σ tanpa katalis)
 → [6] TradingAgents-Lite :8002 POST /synthesize (Fund/Tech/Synth only, Sectors adapter → 9router :20128/v1, disclaimer, hanya Top-N)
 → [7] Dossier Compose (Rust) → JSON → PDF
 → [8] Hybrid Delivery — Rust API (Axum /api/v1/*, envelope + ?market) + seith-cli (clap --market) + Next.js FE (consume Rust API)
```
Integrasi Rust↔Python via **REST sidecar** (bukan PyO3/maturin). TradingAgents: copy workflow 3-agent (Fund/Tech/Synth) dari `github.com/TauricResearch/TradingAgents` — bukan fork full repo. Sectors mapping: `Id → /v2/indonesia/transaction/daily`, `Sg → /v2/singapore/transaction/daily`.

## Workflow & Handoff Protocol
- Setiap eksekusi = session baru + doc `.handoff/handoff-NN-topic.md` (Goal, Context, Scope In/Out, Deliverables, Verification, Next Session Prompt).
- Branch per handoff: `handoff/NN-topic` (+ `t1`/`t2` sub-branch jika 2 terminal garap file beda paralel). Gunakan `git worktree add` untuk isolasi `target/` + `data/seith.db` (lock SQLite WAL).
- Verification Gate wajib: `cargo fmt --check && cargo clippy -- -D warnings && cargo test` (incl. sectors-client CompositeCache) (+ `uv run pytest` untuk sidecar) + `pnpm lint/typecheck` jika FE ada + `Invoke-WebRequest http://localhost:20128/v1/models` jika sentuh dossier + `sqlite3 data/seith.db "SELECT count(*) FROM ohlcv;"` jika sentuh cache. Paste output asli, no fabrikasi.

## Critical Notes — WAJIB BACA SEBELUM IMPLEMENT
- WAJIB baca `docs/notes/00-readme.md` → `01-tujuan-seith.md` → `02-kronos-kritis.md` → `03-market-intelligence-gate.md` → `04-arsitektur-kritis.md` → `05-anti-patterns.md` SEBELUM `Implement`. Skill ini auto-load `00-readme.md`.
- Ritual 3 pertanyaan (jawab di PR/handoff): 1) Lolos gate MI mana? 2) Jebakan Kronos/cache/market apa? 3) Test FAIL apa jika salah?
- 12 anti-pattern `05-anti-patterns.md` — `rust-reviewer` cek 1-6, `security-reviewer` cek 6-8, PM cek 10-12.
- Branch WAJIB: `handoff/NN-topic` (+ `t1`/`t2` jika paralel) via `git worktree add ../seith-wt/handoff-NN -b handoff/NN-topic` — no direct commit ke `main` (AGENTS §8b). PM veto jika tanpa branch/notes.

## Hard Conventions (dari AGENTS.md)
- Rust `cargo` edition 2021, `rustfmt` + `clippy`. Python HANYA sidecar via `uv`. LLM via 9router. Cache = Composite moka L1 + SQLite L2 `data/seith.db`.
- Immutability, fn <50 baris, file 200-400 (max 800), nesting ≤4.
- Error handling tiap level, no silent swallow. API envelope `{success,data,error,pagination}`. Repository pattern. `Cache` trait untuk L1/L2.

## Docs Map (jangan duplikasi — baca ini)
- `AGENTS.md` — charter, roles, Tier 0, stack §3b, workflow, branch §8b, Hybrid + 9router + CompositeCache + IDX/STI
- `docs/notes/00-readme.md` + `01`–`05` — **WAJIB baca sebelum Implement** (tujuan, Kronos 512, gate MI, arsitektur, 12 anti-pattern)
- `docs/prd.md` — problem/persona/pipeline §5 hybrid + cache + market/scope/metrics (derived insight win)
- `docs/spec.md` — architecture hybrid §1 + pipeline §2 dengan CompositeCache + Market + cleansing gate + scoring + tech stack §1b
- `docs/api-spec.md` — pipeline §2 + endpoints Axum + CLI contract §1, health sidecars §3, `?market` param, `Cache` trait, Sectors mapping Id/Sg, sidecar + 9router contract §9-10
- `docs/tdd-plan.md` — pipeline §2 + TDD critical paths (scoring/anomaly/adapter+cleansing+CompositeCache/kronos-bridge/analysis-bridge/dossier+CLI+9router+Market), `cargo test` + `uv pytest` + SQLite

## Available opencode Skills (audit)
- Custom (project): `seith-market-intelligence` (SSOT ini).
- Global relevan: `tdd-workflow`/`tdd`, `verification-loop`, `code-reviewer`, `security-review`, `handoff`, `understand`, `graphify`, `promote`, `git-worktree-manager` + 60+ lain. Eksekutor boleh pakai helper tersebut, tapi narasi produk tetap ikut skill ini.

## Judging Lens
40% Usability (hybrid CLI verifiable + Web 60s comprehension, IDX primary) + 30% Video (teaser 1m CLI+Web + judging 3m, STI bonus di H5) + 30% Tech Depth (Sectors core + Kronos-base + Rust CompositeCache 100% gratis + 9router + market-agnostic) — optimize untuk explainable derived insight yang bisa dipakai hari ini.

## References
- `hackathon.sectors.app/tracks/market-intelligence` — qualifying test & boundary rules
- Sectors docs: `/v2/indonesia/transaction/daily` (IDX) + `/v2/singapore/transaction/daily` (STI)
- Kronos `model.Kronos/KronosTokenizer/KronosPredictor`, HF `NeoQuasar/*`, whitepaper `2508.02739v1.pdf`
- TradingAgents `github.com/TauricResearch/TradingAgents` — workflow copy (Fund/Tech/Synth), vendor read-only
- 9router `http://localhost:20128/v1` (OpenAI-compatible)
