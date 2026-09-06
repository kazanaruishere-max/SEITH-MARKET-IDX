# Task 02 — Predictor Batch (Kronos-base 102.3M)

## Goal
Kunci `predictor.py` `Kronos.from_pretrained + Tokenizer-base max_context 512 predict_batch 400→20 T1.0 top_p0.9` dengan fallback mock deterministik — CI cepat tanpa 102M download.

## Context
- SSOT: `AGENTS.md §3c Seven Zones + §6c/§8c` + `docs/spec.md §2[3] §3 Quant` + `docs/kronos-notes.md Kronos-base 102.3M Tokenizer-base max_context 512 predict_batch norm/denorm T1.0 top_p0.9` + `docs/api-spec.md §9` + `docs/tdd-plan.md §3/7` + `vendor/Kronos 67b630e read-only` + `docs/notes/00-readme.md` ritual 3Q + `skill://seith-market-intelligence` + `skill://seith-kronos` + `skill://no-ai-slop`
- Dependensi: `01` schemas (market, df shape, guard)
- Branch: `handoff/02-kronos/t2-sidecar` (T2: 01+02 Python)
- Decision: `KRONOS_MOCK=1` deterministik `forecast0 σ1` di CI, real `NeoQuasar/Kronos-base` lokal only + fixture `tests/fixtures/kronos-pred-20.json`

## Scope In / Out
In: Zona 2 `apps/kronos-sidecar/app/predictor.py` + `apps/kronos-sidecar/app/__init__.py` + Zona 4 `tests/fixtures/kronos-pred-20.json` (20 bars, open/high/low/close/volume/amount) + Zona 2 `apps/kronos-sidecar/tests/test_predictor.py` — zona 2 keep nama existing
Out: FastAPI contract `main.py` (01), Rust bridge `seith-core/src/kronos/*` (03), verify e2e CI green (04)

## Bagian — Surgical Breakdown (WAJIB dipisah, 1 bagian = 1 fn <50 baris)
| Bag | File | Struktur / Fn | Acceptance | Test FAIL |
|---|---|---|---|---|
| 02a | `predictor.py` | `def get_device() → "cuda"|"cpu"` + lazy globals `_model,_tokenizer,_predictor` + `def load_predictor(mock:bool) → KronosPredictor|Mock` env `KRONOS_MOCK=1` fallback | `KRONOS_MOCK=1 → Mock no torch import` | `import torch fail di CI→ fallback` |
| 02b | `predictor.py` | `def _df_from_ohlcv(df:List[dict]) → pd.DataFrame[open/high/low/close/volume/amount]` `volume/amount None→0.0` `open/high/low/close wajib` else exclude | `volume None→0.0` shape [N,6] | `missing OHLC→ exclude` |
| 02c | `predictor.py` | `def predict(df, x_timestamp, y_timestamp, pred_len, T=1.0, top_p=0.9) → pred_df` call `predictor.predict(df, x_timestamp, y_timestamp, pred_len, T, top_p)` norm/denorm per series via tokenizer | `400→20 cols 6` x/y timestamp len match | `pred_len 600→ValueError 512` |
| 02d | `predictor.py` | `def predict_batch(dfs, x_timestamps, y_timestamps, pred_len, T, top_p) → List[pred_df]` equal guard + batch loop `KronosPredictor.predict_batch` handles norm/denorm | `3x400→3x20` equal ok | `unequal 400 vs 380 → ValueError equal` |
| 02e | `predictor.py` | `class MockPredictor` `predict/predict_batch` deterministik `last close * (1+ 0.001*i)` + `pred_df volume 0` — no torch, fast 10ms | `mock 400→20 deterministic same input same output` | `mock vs real drift >1e-6` |
| 02f | `predictor.py` | `def to_ohlcv_list(pred_df) → List[OhlcvIn]` float clamp + `degraded bool` flag header | `to_ohlcv_list len 20` | `empty pred_df→ degraded true` |
| 02g | `tests/test_predictor.py` | `pytest -q` ≥6 tests mock + 1 integration real fixture `kronos-pred-20.json` (`@pytest.mark.slow` skip CI) | `mock batch 3 ok` `volume 0` `T/top_p passthrough` | 6 passed |

## Deliverables + Acceptance (per Bagian)
- 02a-b: `predictor.py` lazy load `from_pretrained("NeoQuasar/Kronos-Tokenizer-base", "NeoQuasar/Kronos-base")` + `max_context 512` + `device cuda if torch.cuda.is_available()` else `cpu` — Acceptance: `KRONOS_MOCK=1` no `torch` import error
- 02c-d: `predict/predict_batch` 40-60 baris each, `fn <50`, `nesting ≤4`, guard `lookback+pred_len ≤512` raise `ValueError("max_context 512")` → FastAPI maps to `422`
- 02e-f: `MockPredictor` 30-40 baris deterministik — Acceptance: `pytest KRONOS_MOCK=1` <2s
- 02g: `kronos-pred-20.json` 20 rows `{open,high,low,close,volume,amount}` real output lokal (capture once `cargo run` style `python -m apps.kronos-sidecar`) — CI mock, lokal real optional
- Constraint: `file 200-400` typical max 800, `fn <50`, `ruff check 0`, `no silent swallow` (log `tracing` via `print`), `♻️ Refactor:`
- 7 Zones: file baru wajib zona 2 (`apps/kronos-sidecar/app/*`) + zona 4 (`tests/fixtures/kronos-pred-20.json`) — PM veto jika di luar

## Verification
```
# workdir apps/kronos-sidecar (AGENTS §5 Gotcha)
KRONOS_MOCK=1 uv run ruff check . → 0
KRONOS_MOCK=1 uv run pytest tests/test_predictor.py -q → ≥6 passed (<2s, no torch)
KRONOS_MOCK=0 uv run pytest tests/test_predictor.py -q -k "not slow" → mock still pass; real slow test manual: uv run python -c "from app.predictor import load_predictor; load_predictor(mock=False)"
skill://no-ai-slop detect → pass (Tier-1 warn)
refactor-cleaner scan §8c → pass
```

### Accountability Block
```
✅ Terverifikasi: <cmd> → <output> (paste nyata)
⚠️ Belum: Rust bridge call (03), verify green CI (04)
🔻 Risiko: torch 400MB download di CI → mitigasi: KRONOS_MOCK=1 deterministik + fixture lokal only
♻️ Refactor: extract _normalize_df(), split mock vs real fn<50
```

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead Otak T0 | opencode sini | `seith-market-intelligence`+`seith-kronos`+`verification-loop` | — | approve 02 |
| T2 Sidecar | sub-agent | `seith-market-intelligence`+`seith-kronos`+`tdd-workflow` | `tdd-guide` | mock vs real fixture |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | no secret log, input guard |
| PM Autonomous | `seith-pm` | `git-worktree-manager`+gate | — | veto jika guard 512 miss — §8c |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca task — fn<50 |

> §8c: semua agent bertanggung jawab penuh code/logic/testing/structure & rapih 7 Zones

## Next Session Prompt
`skill://seith-market-intelligence` + `skill://seith-kronos` + `handoff/02-kronos/t2-sidecar` + `02-predictor-batch.md` + ritual 3Q:
1) Gate MI? ER dari Kronos — tanpa mock fallback CI merah.
2) Jebakan? `torch.cuda` lazy + `KRONOS_MOCK` env + `equal guard` + `volume→0`.
3) Test FAIL apa? `KRONOS_MOCK=1 400→20 deterministic`, `unequal→ValueError`, `lookback 520→422`.
