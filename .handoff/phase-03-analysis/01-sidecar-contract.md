# Task 01 — Analysis Sidecar FastAPI Contract :8002

## Goal
Kunci `POST /synthesize` + `GET /health` di `apps/analysis :8002` Pydantic guard + mirror pattern Phase 02 — contract solid untuk bridge H3.

## Context
- SSOT: `AGENTS.md §3c Seven Zones + §6/§6c/§8c` + `docs/spec.md §2[6] §3 Research §7b` + `docs/api-spec.md §9 Analysis` + `docs/tdd-plan.md §3 critical 5) analysis-bridge §7 Fixtures 9router` + `docs/notes/00-readme.md ritual 3Q` + `vendor/TradingAgents 9dee508` + `skill://seith-market-intelligence` + `skill://seith-dev` + `skill://no-ai-slop`
- Dependensi: — (task pertama, blocker 02+03)
- Branch: `handoff/03-analysis` atau `handoff/03-analysis-t2-sidecar` (T2: 01+02 Python)
- Mirror pattern Phase 02: `apps/kronos-sidecar/app/{main,schemas}.py` — `apps/analysis/app/{main,schemas}.py`
- Config: `LLM_BASE_URL=http://localhost:20128/v1` (sudah ada H1 `config.rs:32-33`)
- Decision 2026-09-06: 3-agent `Fund+Tech+Synth` Lite (hemat 1 LLM call), no `openai` SDK (pakai `httpx` direct), `timeout 15s`

## Scope In / Out
In: Zona 2 `apps/analysis/app/main.py` (FastAPI), `apps/analysis/app/schemas.py` (Pydantic), `apps/analysis/app/__init__.py`, `apps/analysis/tests/test_contract.py` — zona 2 keep nama existing
Out: 3-agent impl `apps/analysis/app/agents/*` (02), `template_memo.py + disclaimer.py` (02), Rust bridge `seith-core/src/analysis/*` (03), verify e2e (04)

## Bagian — Surgical Breakdown (WAJIB dipisah, 1 bagian = 1 fn <50 baris)
| Bag | File | Struktur / Fn | Acceptance | Test FAIL |
|---|---|---|---|---|
| 01a | `app/schemas.py` | `MarketEnum(str, Enum) id="id" sg="sg"` + `FundamentalsIn {sector, roe, margin, leverage, pe, pb: float | None}` | `MarketEnum("sg")==sg` | `market="xx"→422` |
| 01b | `app/schemas.py` | `KronosSignalIn {expected_return: float, anomaly_z: float, volatility: float | None}` | `KronosSignalIn default None ok` | `negative z ok` |
| 01c | `app/schemas.py` | `SynthesizeRequest {market:MarketEnum, ticker:str ^[A-Z0-9]{3,6}$, fundamentals:FundamentalsIn, kronos_signal:KronosSignalIn, sector:str}` `@field_validator` ticker regex + `@model_validator` `len(ticker)>=3` else `422 VALIDATION_ERROR ticker regex` | `ticker="bbca"→422` `ticker="AB"→422` | `ticker regex lax` |
| 01d | `app/schemas.py` | `SynthesizeResponse {fundamental_memo:str, technical_memo:str, synthesizer_memo:str, degraded:bool, disclaimer:str}` default `disclaimer="Bukan rekomendasi investasi. Informasi & analisis saja."` | `disclaimer always present` | `disclaimer missing` |
| 01e | `app/main.py` | `app=FastAPI(title="seith-analysis")` + `GET /health → {status:"ok", nine_router:"up|down", max_context:512, model:"3-agent-lite"}` cek 9router URL optional | `GET /health 200` `9router status` | `health 500` |
| 01f | `app/main.py` | `POST /synthesize → SynthesizeResponse` delegasi `agents.fundamental + technical + synthesizer` (stub di 01, full 02) | `ticker BBCA → 200 3 memos` `degraded bool` | `validation 422` |
| 01g | `tests/test_contract.py` | `TestClient(app)` ≥5 tests `httpx` Pydantic guard | `422 shape {"detail":...}` + health 200 | 5 passed |

## Deliverables + Acceptance (per Bagian)
- 01a-d: `schemas.py` 80-120 baris total, `fn <50`, Pydantic V2 `field_validator` + `model_validator`, `model_config extra="forbid"`
- 01e-f: `main.py` 100-150 baris, `fn <50`, `nesting ≤4`, no `unwrap` (raise `HTTPException 422/500`), CORS off
- 01g: `test_contract.py` 80-120 baris, 5 tests meaningful (no assertion-less)
- Constraint: `file 200-400` typical, `uv run ruff check . 0`, `♻️ Refactor:`
- 7 Zones: file baru wajib zona 2 (`apps/analysis/app/*`) sesuai `AGENTS §3c`; cross-zona `apps↛crates` dilarang

## Verification
```
# workdir apps/analysis (AGENTS §5 Gotcha — jangan uv --project dari root)
uv sync → ok
uv run ruff check . → 0
uv run pytest tests/test_contract.py -q → ≥5 passed (health 200, synthesize 200, ticker reject 422)
Invoke-WebRequest http://localhost:8002/health → 200 (jika sidecar run)
skill://no-ai-slop detect → pass (Tier-1 warn)
refactor-cleaner scan §8c → pass (fn<50 file200-400 nesting≤4)
```

### Accountability Block
```
✅ Terverifikasi: <cmd> → <output> (paste nyata, no fabrikasi)
⚠️ Belum: 3-agent impl 9router httpx (02), Rust bridge (03)
🔻 Risiko: guard hanya di sidecar tidak di Rust → mitigasi: duplikat guard di bridge 03
♻️ Refactor: extract validate_ticker(), split schemas vs main fn<50
```

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead Otak T0 | opencode sini | `seith-market-intelligence`+`seith-dev`+`verification-loop` | — | approve 01 |
| T2 Sidecar | sub-agent | `seith-market-intelligence`+`tdd-workflow` | `tdd-guide` | TDD Pydantic guard |
| Arsitek | sub-agent `architect` | `senior-architect` | `architect` | SEBELUM coding — audit REST boundary |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | input validation ticker + 9router URL env-only |
| PM Autonomous | `seith-pm` | `git-worktree-manager`+gate | — | veto jika gate fail — §8c 7 Zones |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca task — fn<50 |

> §8c: semua agent bertanggung jawab penuh code/logic/testing/structure & rapih

## Next Session Prompt
`skill://seith-market-intelligence` + `skill://seith-dev` + `handoff/03-analysis-t2-sidecar` + `01-sidecar-contract.md` + ritual 3Q:
1) Gate MI? Contract ticker regex + disclaimer mandatory + 9router URL env — anti 422 bocor H5.
2) Jebakan? Pydantic `extra="forbid"` + `uv workdir` + `disclaimer always present`.
3) Test FAIL apa? `ticker="bbca"→422`, `ticker="AB"→422`, `synthesize 200 3 memos`, `disclaimer in response`.
