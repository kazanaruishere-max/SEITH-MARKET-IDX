# Task 08 — Kronos-Base Verify Langsung

## Goal
Buktikan data web mengalir lewat `Kronos-base :8001` langsung — `POST /predict_batch 400->20 T1.0 top_p0.9 max_context 512 is_mock_mode()` honest, `chartPoints 20` real ketika `MOCK=0`, `MOCK=1` synthetic ponytail, web `DossierKronosChart` tampil 20 titik amber dashed + +-2σ band bukan fake `20× close+-2%`.

## Context
- SSOT: `apps/kronos-sidecar/app/main.py is_mock_mode() or _fell_back` + `apps/kronos-sidecar/app/predictor.py 102.3M NeoQuasar/Kronos-base` + `crates/seith-core/src/scoring/calculator.rs 30/20/30/20` + `crates/seith-api/src/handlers.rs health degraded + kronos chartPoints` + `research/backtest-100.json kronos 20 chartPoints` + `docs/kronos-notes.md` + `AGENTS 3c 7 Zones`
- Status now: web `kronos chartPoints [] degraded true` ponytail `MA20 pending Kronos 400->20` — belum prove live path
- Branch: `handoff/22-accessibility` worktree `../seith-wt/handoff-22` — Z1+Z2
- Dependensi: 07-company-profile done

## Scope In / Out
In: `apps/kronos-sidecar/app/main.py` health honest + `apps/kronos-sidecar/app/predictor.py` mock/real + `crates/seith-api/src/handlers.rs` kronos_degraded + `apps/web/components/DossierKronosChart.tsx` 20-point Area + `research/backtest-100.json` kronos 20 + `docs/kronos-notes.md` canonical
Out: heatmap (06), company-profile (07), README (09), live 25c batch sectors (gated 22.5)

## Bagian — Surgical
| Bag | File | Fn/Struct | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `apps/kronos-sidecar/app/main.py` | health + predict | `is_mock_mode() = KRONOS_MOCK==1 or _fell_back` honest; `health {model: mock if is_mock else Kronos-base, max_context 512, device}`; `predict_batch degraded=is_mock_mode()` | health Kronos-base while fallback fail |
| b | `crates/seith-api/src/handlers.rs` | kronos wiring | `kronos_degraded = chartPoints empty` honest; `dossier` research 3 memo + `kronos {forecastReturn, volatility, chartPoints 20}` vector `SCHEMA_VERSION` | chart fake 20× fail |
| c | `apps/web/components/DossierKronosChart.tsx` | Area 20 | `pts = kronos?.chartPoints ?? []` if empty -> `<degraded>Prediksi belum tersedia</degraded>` honest, else `<Area amber dashed + +-2σ band>` vector `recharts 2.12.7` `CartesianGrid #24242e` `XAxis/YAxis #a1a1aa 9px` `Tooltip #11151F` | fake drift Array.from fail |
| d | `research/backtest-100.json` | kronos prove | `items[0].kronos.chartPoints length 20` per ticker deterministic via `regen_backtest_100.py` date `2026-09-14->2026-10-03` `value/upper/lower` | length !=20 fail |
| e | gated `KRONOS_MOCK=0` | live prove | `KRONOS_MOCK=0 cargo run` once cold 2-3m CPU 102M `NeoQuasar/Kronos-base` -> `curl :8001/health model Kronos-base degraded false` + `curl :8181/api/v1/tickers/BBCA/dossier chartPoints 20 non-empty` — doc as gated optional, default `MOCK=1` honest | health mock while real fail |

## Deliverables
- `curl :8001/health | jq .model,.max_context` -> `mock|Kronos-base 512` honest + `curl :8181/health | jq .data.db` 500/25
- `cargo run -p seith-cli -- dossier BBCA | jq .data.kronos.chartPoints|length` -> 20 or honest empty + degraded true fallback
- `GET /dossier/BBCA` Kronos chart Amber dashed +-2σ if pts else degraded message honest
- `cargo fmt0 clippy0 test89 build4` green

## Verification
```
curl -s http://127.0.0.1:8001/health | jq '.model, .max_context, .device'
curl -s "http://127.0.0.1:8181/api/v1/tickers/BBCA/dossier?market=id" | jq '.data.kronos.chartPoints | length, .[0]'
python -c "import json; d=json.load(open('research/backtest-100.json')); print(d['items'][0]['kronos']['chartPoints'][:1])"
```

## Peran + Skill
| Peran | Eksekutor | Skill | Sub-agent |
|---|---|---|---|
| T1 | sub-agent | `seith-market-intelligence` + `seith-kronos` + `seith-quant` | `seith-quant-reviewer` + `seith-code-reviewer` |
