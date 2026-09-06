# Task 01 — Sidecar FastAPI Contract :8001

## Goal
Kunci `POST /predict` + `POST /predict_batch` + `GET /health` di `apps/kronos-sidecar :8001` dengan Pydantic guard `max_context 512` — contract solid untuk bridge H2.

## Context
- SSOT: `AGENTS.md §3c Seven Zones + §6/§6c/§8c` + `docs/spec.md §2[3] §7b Zones` + `docs/api-spec.md §9 Sidecar Contracts` + `docs/tdd-plan.md §3/7` + `docs/kronos-notes.md max_context 512 T1.0 top_p0.9 predict_batch 400→20` + `docs/notes/00-readme.md ritual 3Q` + `skill://seith-market-intelligence` + `skill://seith-kronos` + `skill://no-ai-slop`
- Dependensi: — (task pertama Phase 02, blocker 02+03)
- Branch: `handoff/02-kronos` atau `handoff/02-kronos/t2-sidecar` (T2: 01+02 Python)
- Fixtures: `tests/fixtures/bbca-ohlcv-400.json` + `sector-median.json` reuse; baru `kronos-pred-20.json` (20 bars mock)

## Scope In / Out
In: Zona 2 `apps/kronos-sidecar/app/main.py` (FastAPI), `apps/kronos-sidecar/app/schemas.py` (Pydantic), `apps/kronos-sidecar/app/__init__.py`, `apps/kronos-sidecar/pyproject.toml` deps, `apps/kronos-sidecar/tests/test_contract.py` — zona 2 keep nama existing (AGENTS §3c)
Out: `predictor.py` real Kronos load (02), Rust bridge `seith-core/src/kronos/*` (03), verify e2e (04) — tidak disentuh

## Bagian — Surgical Breakdown (WAJIB dipisah, 1 bagian = 1 fn/struct <50 baris)
| Bag | File | Struktur / Fn | Acceptance | Test FAIL |
|---|---|---|---|---|
| 01a | `app/schemas.py` | `MarketEnum(str, Enum) id="id" sg="sg"` + `OhlcvIn {open,high,low,close:float, volume:float|None, amount:float|None, timestamp:int}` | `MarketEnum("id")==id` serde | `market="xx"→422` |
| 01b | `app/schemas.py` | `PredictRequest {market:MarketEnum, df:List[OhlcvIn], x_timestamp:List[int], y_timestamp:List[int], pred_len:int, T:float=1.0, top_p:float=0.9}` `@model_validator` guard `pred_len≤512` + `len(df)+pred_len ≤512` else `422 {"code":"VALIDATION_ERROR","message":"max_context 512"}` | `400+20=420 ok, 500+20=520→422` | `pred_len 600→422` |
| 01c | `app/schemas.py` | `PredictBatchRequest {market, dfs:List[List[OhlcvIn]], x_timestamps, y_timestamps, pred_len, T, top_p}` validator `equal lookback` semua `len(dfs[i])` sama + `pred_len` sama, else `422 equal lookback` | `unequal 400 vs 380 →422` | `empty dfs→422` |
| 01d | `app/main.py` | `app=FastAPI(title="kronos-sidecar")` + `GET /health → {status:"ok", model:"Kronos-base" | "mock", max_context:512, device:"cpu|cuda"}` | `GET /health 200` | `health 500` |
| 01e | `app/main.py` | `POST /predict → {pred_df:List[OhlcvIn], degraded:bool}` delegasi `predictor.predict` (mock di 01) | `df 400→pred 20 ok` `volume None→0` | `lookback 520→422` |
| 01f | `app/main.py` | `POST /predict_batch → {pred_dfs:List[List[OhlcvIn]], degraded:bool}` equal guard + batch loop | `batch 3x400→3x20 ok` | `unequal batch→422` |
| 01g | `tests/test_contract.py` | `TestClient(app)` ≥7 tests `httpx` | `422 shape {"detail":...}` + health 200 | 7 passed |

## Deliverables + Acceptance (per Bagian)
- 01a-c: `schemas.py` 80-120 baris total, `fn <50`, Pydantic V2 `field_validator` + `model_validator`, `deny Unknown` via `model_config extra="forbid"`
- 01d-f: `main.py` 100-160 baris, `fn <50`, `nesting ≤4`, no `unwrap` (raise `HTTPException 422/500`), CORS off (internal only)
- 01g: `test_contract.py` 80-120 baris, 7 tests meaningful (no assertion-less)
- Constraint: `file 200-400` typical, `cargo fmt` NA (Python `ruff`), `uv run ruff check . 0`, `♻️ Refactor:`
- 7 Zones: file baru wajib zona 2 (`apps/kronos-sidecar/app/*`) sesuai `AGENTS §3c`; cross-zona `apps↛crates` dilarang

## Verification
```
# workdir apps/kronos-sidecar (uv independent, AGENTS §5 Gotcha — jangan --project dari root)
uv sync → ok
uv run ruff check . → 0
uv run pytest tests/test_contract.py -q → ≥7 passed (health 200, predict 400→20, guard 512, equal)
Invoke-WebRequest http://localhost:8001/health → 200 (jika sidecar run)
skill://no-ai-slop detect → pass (Tier-1 warn)
refactor-cleaner scan §8c → pass (fn<50 file200-400 nesting≤4)
```

### Accountability Block
```
✅ Terverifikasi: <cmd> → <output> (paste nyata, no fabrikasi)
⚠️ Belum: predictor real Kronos 102.3M (02), Rust bridge (03)
🔻 Risiko: guard hanya di sidecar tidak di Rust → mitigasi: duplikat guard di bridge 03
♻️ Refactor: extract validate_max_context(), split schemas vs main fn<50
```

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead Otak T0 | opencode sini | `seith-market-intelligence`+`seith-kronos`+`verification-loop` | — | approve 01 |
| T2 Sidecar | sub-agent | `seith-market-intelligence`+`seith-kronos`+`tdd-workflow` | `tdd-guide` | TDD Pydantic guard |
| Arsitek | sub-agent `architect` | `senior-architect` | `architect` | SEBELUM coding — audit REST boundary 512 |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | input validation 512 + no secret log |
| PM Autonomous | `seith-pm` | `git-worktree-manager`+gate | — | veto jika gate fail — §8c 7 Zones |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca task |

> §8c: semua agent bertanggung jawab penuh code/logic/testing/structure & rapih

## Next Session Prompt
`skill://seith-market-intelligence` + `skill://seith-kronos` + `handoff/02-kronos/t2-sidecar` + `01-sidecar-contract.md` + ritual 3Q:
1) Gate MI? Contract `max_context 512` + `equal guard` — anti crash H4.
2) Jebakan? Pydantic `extra="forbid"` + `uv workdir` + `422 VALIDATION_ERROR max_context 512`.
3) Test FAIL apa? `pred_len 600→422`, `400+520→422`, `unequal batch→422`, `health 200`.
