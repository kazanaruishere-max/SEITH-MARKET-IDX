# Phase 02 — Kronos Sidecar :8001 + Rust Bridge — Overview

## Goal
Kunci pipeline `[3] Kronos-base predict_batch 400→20 T1.0 top_p0.9 max_context 512 via Python sidecar :8001 + Rust bridge degraded:true` — unlock ER untuk Scoring H4.

## Context
- SSOT: `AGENTS.md §2-6c §3c Seven Zones §8b §8c` + `docs/prd.md §5 [3]` + `docs/spec.md §2[3] §3 Quant §7b Zones` + `docs/api-spec.md §9 Sidecar Contracts` + `docs/tdd-plan.md §3 critical 4) kronos-bridge` + `docs/kronos-notes.md 102.3M base max_context 512` + `docs/notes/00-readme.md ritual 3Q` + `docs/adr/0001 0002 vendor pin 67b630e`
- Skill wajib tiap session T1/T2: `skill://seith-market-intelligence` (awal) + `skill://seith-kronos` (sentuh pred) + `skill://tdd-workflow` + `skill://verification-loop` (akhir) + `skill://no-ai-slop` Tier-1 prose warn
- Branch: `handoff/02-kronos` (flat, AGENTS §8b) — docs folder: `.handoff/phase-02-kronos/` (1 fase = 1 folder, 4 tasks + overview). Template: `.handoff/phase-template/00-overview.md`
- Decisions approved 2026-09-06: 1) Bridge di `seith-core/src/kronos/` (no crate baru, pattern H1) 2) CI mock deterministik + 1 fixture real lokal only (no 102M download di CI)
- Phase 1 DONE `main 6b81252`: `Market Id|Sg` + `models OhlcvRow` + `CompositeCache Moka+SQLite WAL` + `client batch` + `normalize cleansing OHLC→excluded volume→0 median per market lookback>512→422` + `envelope` — 64 tests pass `fmt 0 clippy 0`
- Fixtures ready: `tests/fixtures/bbca-ohlcv-400.json` (400 rows Id) + `dbs-sg-ohlcv-400.json` + `illiquid-ohlcv.json` + `sector-median.json` — reuse untuk kronos input; baru `kronos-pred-20.json` fixture pred 20

## Scope In / Out
In (7 Zones — file baru di luar zona = violation PM veto):
- Z1 `crates/seith-core/src/kronos/{mod.rs,types.rs,client.rs,error.rs}` + `crates/seith-core/src/lib.rs` export + `crates/seith-core/src/config.rs` tambah `KRONOS_URL` + Zona 1 `crates/seith-api/src/kronos.rs` wiring opsional (thin)
- Z2 `apps/kronos-sidecar/app/{main.py,schemas.py,predictor.py}` + `apps/kronos-sidecar/pyproject.toml` deps `torch` + `apps/kronos-sidecar/tests/test_*.py` (zona 2 keep nama existing, AGENTS §3c)
- Z4 `tests/fixtures/kronos-pred-20.json` (fixture real lokal 20 bars, deterministik mock di CI)
- Z5 `docs/spec.md §2[3] + api-spec.md §9 + tdd-plan.md §3/7` sinkron — Z5 SSOT
- Z6 `.handoff/phase-02-kronos/00-overview.md + 01-04-*.md`
- Z7 `scripts/check-kronos.ps1` (liveness :8001/health) + CI `python-kronos` job hijau
Out: `apps/analysis :8002→9router :20128` (H3, zona 2), scoring 0-100 + ranking + flag `|Z|>2` (H4 zona 1 `scoring.rs`, butuh ER dari 02), dossier PDF + `seith-cli rank/scan` full + `apps/web` (H5 zona 1+2), freeze kit (H6 zona 7) — tidak disentuh Phase 02. Cross-zona `seith-core` ↛ `sectors-client`; `apps/*` ↛ `crates/*` langsung.

## WBS — Task Breakdown (1 task = 1 file, surgical <50 baris/fn)
| # | Task file | Slice | Deliverable inti | Dependensi |
|---|---|---|---|---|
| 01 | `01-sidecar-contract.md` | FastAPI contract :8001 | `apps/kronos-sidecar/app/main.py` POST `/predict` + `/predict_batch` + `/health`, `schemas.py` Pydantic `PredictRequest {market, df: List[Ohlcv], x_timestamp, y_timestamp, pred_len, T, top_p}` validasi `pred_len≤512` + `lookback+pred_len≤512 →422` + `equal lookback guard` | — |
| 02 | `02-predictor-batch.md` | Predictor impl | `predictor.py` `Kronos.from_pretrained NeoQuasar/Kronos-base + Tokenizer-base max_context 512` `predict_batch` norm/denorm per series, `volume/null→0`, `T1.0 top_p0.9 sample_count1`, fallback mock `forecast0 σ1` jika no GPU/CI, lazy load 102.3M | 01 (schemas) |
| 03 | `03-bridge-rust.md` | Rust bridge seith-core | `seith-core/src/kronos/{mod,types,client,error}.rs` trait `KronosRepository {predict,predict_batch}` + `KronosClient {base_url timeout30s retry1}` reqwest, guard `512→422` boundary, `degraded:true` on timeout/down, `config::KRONOS_URL` env | 01 (contract) |
| 04 | `04-verify-e2e.md` | Verify & CI green | `cargo test -p seith-core kronos` + `uv run pytest apps/kronos-sidecar -q --cov` 9 kasus + CI `python-kronos` hijau + `cargo fmt/clippy 0` + `refactor-cleaner fn<50 file200-400` + `gitleaks` + docs sync | 01-03 |

Dependensi antar-fase: **H1 DONE (cleansed OHLC + Market) → H2 (Kronos ER, butuh OHLC wajib + 512 guard) → H4 Scoring 0-100 `30% ER +20%|Z|+30%QV+20%SM` (butuh ER dari 02) → H5 Hybrid scan/ranking (butuh bridge) → H3 Agents Lite :8002 → H6 Freeze**. Debt jika skip guard `>512` → sidecar 502 di H4.

## Definition of Done — Phase 02
Fase 02 done HANYA jika semua hijau (AGENTS §7 + §5b + §6c + §8c + §3c):
1. `cargo fmt --check` bersih per crate (`seith-core`, `seith-api`, `sectors-client`) — zona 1
2. `cargo clippy -- -D warnings` bersih per crate — no `unwrap` di bridge (`?` + `thiserror`), no dead code
3. `cargo test -- --nocapture` pass — bridge guard `512→422`, `degraded:true` on timeout, market tag Id/Sg — assertion meaningful
4. `uv run ruff check . && uv run pytest -q --cov` pass di `apps/kronos-sidecar` — `httpx` mock predictor deterministik, 9 kasus guard/equal/timeout/degraded
5. Per task `fn <50 baris`, `file 200-400 typical max 800`, `nesting ≤4`, `no dead code`, `no silent swallow`, `immutable return` + **7 Zones §3c** — `refactor-cleaner` scan pass + `♻️ Refactor:` per task
6. Dual-review pass: `rust-reviewer` (`code-reviewer`) + `security-reviewer` (`security-review`) paralel — cek `7 Zones`, `KRONOS_URL` env-only, `512 guard`, timeout
7. `seith-phase-gate` + `verification-loop` pass (paste output nyata, no fabrikasi) + `gitleaks` no leak
8. Docs sinkron: `docs/spec.md §2[3]`, `docs/api-spec.md §9`, `docs/tdd-plan.md §3/7` + `AGENTS §3c` — `doc-updater` cek drift — 7 Zones map
9. Anti-slop Tier-1 warn: `skill://no-ai-slop` detect pass (H5 hard fail nanti) — checklist PR
10. Accountability Block per task `✅/⚠️/🔻/♻️` + **semua AI agent bertanggung jawab penuh `code/logic/testing/structure & rapih` (§8c)** — PM veto jika tidak rapih

## Peran + Skill + Sub-agent Matrix (Wajib — AGENTS §8)
| Peran | Eksekutor | Skill WAJIB | Sub-agent | Kapan — Phase 02 |
|---|---|---|---|---|
| **Lead Otak T0** | opencode sini | `seith-market-intelligence` + `seith-kronos` + `seith-dev` + `verification-loop` | — | Understand→Plan→Document, tulis/approve `00-overview.md`, verify delegasi |
| Founder | User | — | — | approve T/top_p 1.0/0.9, go-live/freeze |
| **PM Autonomous** | `seith-pm` `.opencode/agents/seith-pm/` | `git-worktree-manager` + gate `fmt/clippy/test` + `senior-pm` | `seith-pm` | orkestrasi `handoff/02-kronos` + worktree, **veto merge jika gate/reviewer/zone fail**, cek gap 100% sebelum impl |
| **Arsitek reviewer** | sub-agent `architect` | `senior-architect` | `architect` | **SEBELUM coding 01+03** — audit bridge vs sidecar REST boundary, `seith-core/kronos` sizing, 7 Zones |
| **Planner** | sub-agent `planner` | `tdd-workflow` | `planner` | forward-test H4 scoring dependency ER dari 02 |
| **Eksekutor Tangan T1/T2** | sub-agent | `seith-market-intelligence` (awal wajib) + `seith-kronos` + `tdd-workflow` + `verification-loop` | `explore` jika debug luas | T1 Rust bridge `03` ∥ T2 Python `01+02` Implement→Verify→Refactor TDD red-green |
| **Desainer Test** | `tdd-guide` | `tdd-guide` + `tdd-workflow` | `tdd-guide` | matrix 9 kasus: `lookback>512→422`, `equal guard`, `timeout→degraded`, `market tag`, `volume 0`, `pred_len 20` |
| **Reviewer Rust** | `rust-reviewer` | `code-reviewer` | `code-reviewer` + `rust-reviewer` | crate `seith-core/kronos` + `seith-api/kronos.rs` boundary |
| **Reviewer Security** | `security-reviewer` | `security-review` | `security-reviewer` | `KRONOS_URL` env-only, input validation `512`, no secret log |
| **Refactor WAJIB** | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | **pasca tiap task 01-04** Boy Scout §5b — `fn<50 file200-400 nesting≤4 no dead code` gate wajib |
| **Doc + Handoff** | `doc-updater` | `remember` + `handoff` | `doc-updater` | sinkron `spec/api-spec/tdd-plan/kronos-notes` tiap merge |

## Branch & Worktree (AGENTS §8b + §3c + §8c)
- Branch flat: `handoff/02-kronos` (dari `main`) — `git worktree add ../seith-wt/handoff-02 -b handoff/02-kronos` — `/.wt/` gitignore (AGENTS §8b)
- Paralel T1/T2 (file beda, 7 Zones terpisah, tidak tabrak `target/`):
  - `T1 Rust bridge: 03-bridge-rust` (Z1 `seith-core/src/kronos/*` + `config.rs` + Z1 `seith-api/src/kronos.rs`) → `handoff/02-kronos/t1-bridge` opsional
  - `T2 Python sidecar: 01-sidecar-contract + 02-predictor-batch` (Z2 `apps/kronos-sidecar/app/*` + Z4 fixture) → `handoff/02-kronos/t2-sidecar`
  - Lifecycle: `git worktree add ../seith-wt/handoff-02-t1 -b handoff/02-kronos/t1-bridge` → TDD red-green → `cargo fmt --check && cargo clippy -- -D warnings && cargo test` (+ `uv run pytest -q` di sidecar workdir) → `refactor-cleaner` §8c → dual-review `rust-reviewer ∥ security-reviewer` → PR ke parent `handoff/02-kronos` → `code-reviewer` → squash-merge → hapus worktree → parent → PR ke `main` → `seith-phase-gate` (§8c) → Lead squash-merge → hapus
- Tiap session T1/T2 wajib `skill://seith-market-intelligence` + `skill://seith-kronos` di awal + baca `docs/notes/00-readme.md` ritual 3Q + **semua AI agent bertanggung jawab penuh atas `code/logic/testing/structure & rapih` (§8c)**; tiap commit `type: desc` + Accountability Block `✅/⚠️/🔻/♻️` + 7 Zones-aware

## Verification — Phase 02 (paste output nyata, no fabrikasi)
```
cargo fmt --check → 0 (per crate)
cargo clippy -- -D warnings → 0
cargo test -p seith-core -- --nocapture → pass (kronos types guard 512→422, degraded, market Id/Sg)
cargo test -- --nocapture → pass (workspace)
# workdir apps/kronos-sidecar (uv independent, AGENTS §5):
uv sync → ok
uv run ruff check . → 0
uv run pytest -q --cov → pass 9 kasus (predict, predict_batch, guard 512, equal, timeout degraded, market tag, volume 0, health)
Invoke-WebRequest http://localhost:8001/health → 200 (sidecar up, model lazy)
cargo check → 0
gitleaks detect --no-banner --source . → 0
refactor-cleaner scan §8c → fn<50 file200-400 nesting≤4 pass
```

## Risks & Mitigasi — Kronos
| Risiko | Akibat | Mitigasi | Deteksi |
|---|---|---|---|
| `lookback+pred_len >512` tidak guard | sidecar panic 500 / 502 bridge | guard di **dua** boundary: Pydantic `≤512` + Rust `≤512 →422 VALIDATION_ERROR` | test `lookback 520 →422` + `400+20=420 ok, 500+20=520→422` |
| `predict_batch` unequal lookback | shape mismatch Kronos `norm/denorm` | validasi `equal lookback` + `pred_len` guard di `schemas.py` + Rust client | test `unequal 400 vs 380 →422` |
| torch/CUDA 102.3M missing di CI/GPU less | `uv pytest` fail / slow | `predictor.py` lazy import + `KRONOS_MOCK=1` fallback deterministik `forecast 0 σ1 degraded:false` mock; real fixture `kronos-pred-20.json` lokal only | CI `KRONOS_MOCK=1 pytest` pass, lokal real load |
| timeout 30s retry missing | hang ranking H4 | `KronosClient timeout 30s retry 1` + fallback `degraded:true forecast=[]` | mockito delay 31s → `degraded:true` |
| `uv sync --project` dari root | `.venv` root corrupt (AGENTS §5 Gotcha) | workdir `apps/kronos-sidecar` wajib cd sebelum `uv sync/run` | `uv run python -c "import sys; print(sys.prefix)"` cek `.venv` path |

## Next Session Prompt
`skill://seith-market-intelligence` + `skill://seith-kronos` + branch `handoff/02-kronos` + task `01-sidecar-contract.md` (mulai) → ritual 3Q: 1) gate MI mana? `Kronos ER` jantung H4 scoring — tanpa ini `score=30% kosong`. 2) jebakan? `max_context 512` di **dua** boundary, `equal guard`, `volume→0`, `uv workdir`, `timeout degraded`. 3) test FAIL apa? `lookback 520→422`, `unequal→422`, `timeout→degraded:true`, `predict_batch 400→20 ok`.
