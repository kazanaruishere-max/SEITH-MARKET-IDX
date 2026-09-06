# Phase 03 — Analysis Sidecar :8002 → 9router :20128 — Overview

## Goal
Kunci pipeline `[6] TradingAgents-Lite 3-agent (Fund/Tech/Synth) :8002 → 9router OpenAI-compatible` dengan fallback `degraded:true template memo numeric` + disclaimer injection — unlock `research: {fundamentalMemo, technicalMemo, synthesizerMemo}` di dossier H5.

## Context
- SSOT: `AGENTS.md §2-6c §3c Seven Zones §4 Tier-0 §8 §8b §8c` + `docs/spec.md §2[6] §3 Research §7b Zones` + `docs/api-spec.md §9 Analysis §3 Dossier research` + `docs/tdd-plan.md §3 critical 5) analysis-bridge §7 Fixtures 9router` + `docs/notes/00-readme.md ritual 3Q` + `docs/adr/0002 vendor pin 9dee508`
- Skill wajib tiap session T1/T2: `skill://seith-market-intelligence` (awal) + `skill://seith-dev` (LLM 9router) + `skill://tdd-workflow` + `skill://verification-loop` (akhir) + `skill://no-ai-slop` Tier-1 prose warn
- Branch: `handoff/03-analysis` (flat, AGENTS §8b) — docs: `.handoff/phase-03-analysis/` (1 fase = 1 folder, 4 tasks + overview). Template: `.handoff/phase-template/00-overview.md`
- Phase 1 DONE `main 6b81252` + Phase 2 DONE `main bad4808` (Kronos :8001 + bridge `seith-core/src/kronos/*` + `seith-api/src/kronos.rs`) — pattern mirror: bridge di `seith-core/src/analysis/` (no crate baru, AGENTS §3c)
- Phase 2 membawa `seith-core/src/config.rs:36-37 ANALYSIS_URL` env default `http://localhost:8002` + `LLM_BASE_URL` default `http://localhost:20128/v1` (sudah ada dari H1, tinggal pakai)
- 9router Tier-0 `NEVER kill` — check `Invoke-WebRequest http://localhost:20128/v1/models →200` sebelum dossier (AGENTS §4 Hard Rules)
- Vendor read-only: `vendor/TradingAgents 9dee508` — copy pola `Analyst→Synthesizer` jadi 3-agent Lite, BUKAN fork full repo (AGENTS §4 rule 5 + ADR 0002)
- 3-agent keputusan founder 2026-09-06: `Fund+Tech+Synth` lite (hemat 1 LLM call vs 4-agent), 9router mock 100% (Tier-0 NEVER kill), template memo numeric deterministic dari `fundamentals + kronosSignal`

## Scope In / Out
In (7 Zones — file baru di luar zona = violation PM veto):
- Z1 `crates/seith-core/src/analysis/{mod.rs,types.rs,client.rs,error.rs}` + `crates/seith-core/src/lib.rs` export + `crates/seith-api/src/analysis.rs` thin wiring
- Z2 `apps/analysis/app/{main.py,schemas.py,template_memo.py,disclaimer.py}` + `apps/analysis/app/agents/{fundamental.py,technical.py,synthesizer.py}` + `apps/analysis/tests/test_*.py` + `apps/analysis/pyproject.toml` (deps sudah `httpx+fastapi+pydantic+uvicorn` cukup — 9router via `httpx`, no `openai` SDK)
- Z4 `tests/fixtures/9router-success.json` (mock `chat.completions` fixture) + `tests/fixtures/9router-failure.json` (timeout/failure path)
- Z5 `docs/spec.md §2[6] §3 + api-spec.md §9 + tdd-plan.md §3/7` sync (tambah `analysis-bridge critical 5)`)
- Z6 `.handoff/phase-03-analysis/00-overview.md + 01-04-*.md`
- Z7 `.github/workflows/ci.yml` `python-analysis` strict (mirror python-kronos, hapus `|| echo`) + `scripts/check-9router.ps1` (sudah ada dari H00, dipakai ulang)
Out: `apps/web` (H5 zona 2), scoring 0-100 + ranking + flag `|Z|>2` (H4 zona 1 `scoring.rs`), `dossier` JSON→PDF (H5), `seith-cli dossier/scan` (H5), freeze kit (H6), 9router real (Tier-0 NEVER kill, mock 100% di CI). Cross-zona `seith-core ↛ sectors-client`; `apps/* ↛ crates/*` langsung.

## WBS — Task Breakdown (1 task = 1 file, surgical <50 baris/fn)
| # | Task file | Slice | Deliverable inti | Dependensi |
|---|---|---|---|---|
| 01 | `01-sidecar-contract.md` | FastAPI contract :8002 | `apps/analysis/app/main.py` POST `/synthesize` + GET `/health`, `schemas.py` Pydantic `SynthesizeRequest {market, ticker, fundamentals, kronos_signal, sector}` + `SynthesizeResponse {fundamental_memo, technical_memo, synthesizer_memo, degraded, disclaimer}` `extra="forbid"` | — |
| 02 | `02-three-agent-lite.md` | Fund/Tech/Synth impl | `apps/analysis/app/agents/{fundamental,technical,synthesizer}.py` copy pola `vendor/TradingAgents` Lite (no full repo), `httpx → 9router LLM_BASE_URL + /v1/chat/completions` `timeout 15s` + `template_memo.py` numeric deterministic fallback + `disclaimer.py` inject `"Bukan rekomendasi investasi. Informasi & analisis saja."` | 01 (schemas) |
| 03 | `03-bridge-rust.md` | Rust bridge seith-core | `seith-core/src/analysis/{mod,types,client,error}.rs` trait `AnalysisRepository {synthesize}` + `AnalysisClient {base_url timeout15s}` reqwest, fallback `degraded:true template memo`, `config::ANALYSIS_URL+LLM_BASE_URL` env (sudah ada H1) | 01 (contract) |
| 04 | `04-verify-e2e.md` | Verify & CI green | `cargo test -p seith-core analysis` + `uv run pytest apps/analysis -q --cov` 9 kasus + CI `python-analysis` strict (mirror python-kronos) + `Invoke-WebRequest :8002/health` + `refactor-cleaner fn<50 file200-400` + `gitleaks` + docs sync | 01-03 |

Dependensi antar-fase: **H1 DONE (Sectors cleanse) → H2 DONE (Kronos ER) → H3 Analysis 3-agent (this) → H4 Scoring 0-100 `30%ER+20%|Z|+30%QV+20%SM` (butuh ER + research memo) → H5 Hybrid dossier/ranking (butuh semua) → H6 Freeze**. Debt jika skip fallback template → dossier blank ketika 9router down → Track 3 FAIL (LLM opsional tapi degraded wajib visible).

## Definition of Done — Phase 03
Fase 03 done HANYA jika semua hijau (AGENTS §7 + §5b + §6c + §8c + §3c):
1. `cargo fmt --check` bersih per crate (`seith-core`, `seith-api`, `sectors-client`) — zona 1
2. `cargo clippy -- -D warnings` bersih per crate — no `unwrap` di bridge (`?` + `thiserror`), no dead code
3. `cargo test -- --nocapture` pass — bridge fallback `degraded:true template`, market tag, 9router mock 9 kasus — assertion meaningful
4. `uv run ruff check . && uv run pytest -q --cov` pass di `apps/analysis` — `httpx_mock` 9router 9 kasus (success template, 9router 200/timeout/5xx/template fallback, market Id/Sg, disclaimer presence)
5. Per task `fn <50 baris`, `file 200-400 typical max 800`, `nesting ≤4`, `no dead code`, `no silent swallow`, `immutable return` + **7 Zones §3c** — `refactor-cleaner` scan pass + `♻️ Refactor:` per task
6. Dual-review pass: `rust-reviewer` (`code-reviewer`) + `security-reviewer` (`security-review`) paralel — cek `7 Zones`, `9router URL` env-only, no LLM call tanpa degraded fallback, disclaimer injection mandatory
7. `seith-phase-gate` + `verification-loop` pass (paste output nyata, no fabrikasi) + `gitleaks` no leak
8. Docs sinkron: `docs/spec.md §2[6] §3`, `docs/api-spec.md §9`, `docs/tdd-plan.md §3/7` + `AGENTS §3c` — `doc-updater` cek drift — 7 Zones map
9. Anti-slop Tier-1 warn: `skill://no-ai-slop` detect pass (H5 hard fail nanti) — checklist PR
10. Accountability Block per task `✅/⚠️/🔻/♻️` + **semua AI agent bertanggung jawab penuh `code/logic/testing/structure & rapih` (§8c)** — PM veto jika tidak rapih

## Peran + Skill + Sub-agent Matrix (Wajib — AGENTS §8)
| Peran | Eksekutor | Skill WAJIB | Sub-agent | Kapan — Phase 03 |
|---|---|---|---|---|
| **Lead Otak T0** | opencode sini | `seith-market-intelligence` + `seith-dev` + `verification-loop` | — | Understand→Plan→Document, tulis/approve `00-overview.md`, verify delegasi |
| Founder | User | — | — | approve 3-agent Fund+Tech+Synth, template memo numeric |
| **PM Autonomous** | `seith-pm` `.opencode/agents/seith-pm/` | `git-worktree-manager` + gate `fmt/clippy/test` + `senior-pm` | `seith-pm` | orkestrasi `handoff/03-analysis` + worktree, **veto merge jika gate/reviewer/zone fail**, cek gap 100% sebelum impl |
| **Arsitek reviewer** | sub-agent `architect` | `senior-architect` | `architect` | **SEBELUM coding 01+03** — audit `seith-core/analysis` sizing + 9router boundary + 7 Zones |
| **Planner** | sub-agent `planner` | `tdd-workflow` | `planner` | forward-test H4 scoring dependency research memo dari 03 |
| **Eksekutor Tangan T1/T2** | sub-agent | `seith-market-intelligence` (awal wajib) + `tdd-workflow` + `verification-loop` | `explore` jika debug luas | T1 Rust bridge `03` ∥ T2 Python `01+02` Implement→Verify→Refactor TDD red-green |
| **Desainer Test** | `tdd-guide` | `tdd-guide` + `tdd-workflow` | `tdd-guide` | matrix 9 kasus: `9router 200/timeout/5xx/template fallback`, `market Id/Sg`, `disclaimer presence`, `degraded bool` |
| **Reviewer Rust** | `rust-reviewer` | `code-reviewer` | `code-reviewer` + `rust-reviewer` | `crates/seith-core/src/analysis/*` + `seith-api/analysis.rs` boundary |
| **Reviewer Security** | `security-reviewer` | `security-review` | `security-reviewer` | `9router URL` env-only, no secret log, 9router Tier-0 NEVER kill |
| **Refactor WAJIB** | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | **pasca tiap task 01-04** Boy Scout §5b — `fn<50 file200-400 nesting≤4 no dead code` gate wajib |
| **Doc + Handoff** | `doc-updater` | `remember` + `handoff` | `doc-updater` | sinkron `spec/api-spec/tdd-plan` tiap merge |

## Branch & Worktree (AGENTS §8b + §3c + §8c)
- Branch flat: `handoff/03-analysis` (dari `main`) — `git worktree add ../seith-wt/handoff-03 -b handoff/03-analysis` — `/.wt/` gitignore
- Paralel T1/T2 (file beda, 7 Zones terpisah, tidak tabrak `target/`):
  - `T1 Rust bridge: 03-bridge-rust` (Z1 `seith-core/src/analysis/*`) → `handoff/03-analysis-t1-bridge`
  - `T2 Python sidecar: 01-sidecar-contract + 02-three-agent-lite` (Z2 `apps/analysis/app/*` + Z4 fixture) → `handoff/03-analysis-t2-sidecar`
  - Lifecycle: `git worktree add ../seith-wt/handoff-03-t1 -b handoff/03-analysis-t1-bridge` → TDD red-green → `cargo fmt --check && cargo clippy -- -D warnings && cargo test` (+ `uv run pytest -q` di sidecar workdir) → `refactor-cleaner` §8c → dual-review `rust-reviewer ∥ security-reviewer` → PR ke parent `handoff/03-analysis` → `code-reviewer` → squash-merge → hapus worktree → parent → PR ke `main` → `seith-phase-gate` (§8c) → Lead squash-merge → hapus
- Tiap session T1/T2 wajib `skill://seith-market-intelligence` di awal + baca `docs/notes/00-readme.md` ritual 3Q + **semua AI agent bertanggung jawab penuh atas `code/logic/testing/structure & rapih` (§8c)**; tiap commit `type: desc` + Accountability Block `✅/⚠️/🔻/♻️` + 7 Zones-aware

## Verification — Phase 03 (paste output nyata, no fabrikasi)
```
cargo fmt --check → 0 (per crate)
cargo clippy -- -D warnings → 0
cargo test -p seith-core -- --nocapture → pass (analysis types guard 422 if any, degraded fallback, market Id/Sg)
cargo test -- --nocapture → pass (workspace)
# workdir apps/analysis (uv independent, AGENTS §5):
uv sync → ok
uv run ruff check . → 0
uv run pytest -q --cov → pass 9 kasus (synthesize, health, 9router 200/timeout/5xx/template fallback, market tag, disclaimer)
Invoke-WebRequest http://localhost:8002/health → 200 (sidecar up, 9router status flag)
Invoke-WebRequest http://localhost:20128/v1/models → 200 (9router up, Tier-0 NEVER kill)
cargo check → 0
gitleaks detect --no-banner --source . → 0
refactor-cleaner scan §8c → fn<50 file200-400 nesting≤4 pass
```

## Risks & Mitigasi — Analysis
| Risiko | Akibat | Mitigasi | Deteksi |
|---|---|---|---|
| 9router down | dossier `research` blank → Track 3 FAIL | `degraded:true template memo numeric` fallback mandatory di **dua** boundary (Python `02` + Rust `03`); `Invoke-WebRequest :20128/v1/models` 200 check pre-dossier | test `httpx_mock 503 → degraded:true template` + `9router down → fallback` |
| 9router real call di CI (Tier-0 NEVER kill) | CI fail atau 9router down | `httpx_mock` 100% di CI — `httpx_mock.add(...)` di tests; no real 9router call | grep `httpx.post` no real `LLM_BASE_URL` di `tests/test_*.py` |
| Secret bocor via prompt | 9router prompt leak `fundamentals` numeric | no secret di prompt, disclaimer inject post-9router, no LLM call untuk raw ticker | `security-review` cek `disclaimer` + `no openai_key` |
| Template memo hallucinated text | Track 3 gagal wowl Inspection | numeric deterministic dari `fundamentals + kronos_signal` (no AI wording), hardcoded Bahasa Indonesia singkat | `assert "disclaimer" in memo` + `assert "Z=" in template` (no prose equality) |
| Cross-zona import `seith-core` ↛ `sectors-client` | 7 Zones §3c violation | bridge di `seith-core/src/analysis/*` mirror H2 pattern; `seith-api/src/analysis.rs` thin wiring | `cargo check` + `architektur` audit |

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/03-analysis` + task `01-sidecar-contract.md` (mulai) → ritual 3Q: 1) gate MI mana? `research memo` wajib di dossier H5 — tanpa ini 40% usability kosong. 2) jebakan? `9router NEVER kill` + `degraded:true fallback dua lapis` + `disclaimer mandatory`. 3) test FAIL apa? `9router 503 → degraded:true template`, `market Id/Sg`, `disclaimer presence`, `timeout 15s fallback`.
