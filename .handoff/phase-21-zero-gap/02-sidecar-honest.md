# Task 02 — Sidecar Honest

## Goal
`health` honest `is_mock_mode()` + template wording sync + dossier Fund≠Tech≠Synth distinct — never fake `Kronos-base` while mock.

## Context
- SSOT: `apps/kronos-sidecar/app/predictor.py:17 is_mock_mode` + `apps/kronos-sidecar/app/main.py:13 health` + `apps/analysis/app/template_memo.py` vs `crates/seith-core/src/analysis/client.rs:87 template_memo` wording drift + `crates/seith-core/src/dossier.rs:44 degraded`
- Dependensi: 01-api-wire done (degraded flag honest threads through)
- Branch: `handoff/21-zero-gap` — Z2 `apps/kronos-sidecar, analysis` Z1 `crates/seith-core`

## Scope In / Out
In: `apps/kronos-sidecar/app/main.py` (1-line health fix), `apps/kronos-sidecar/app/predictor.py` if needed, `apps/analysis/app/template_memo.py` + `crates/seith-core/src/analysis/client.rs` sync, `crates/seith-api/src/handlers.rs` dossier 3 memo split if cloned
Out: `apps/web`, `docs/api-spec`, live Sectors batch, Kronos 102M download

## Todo
- [ ] `todowrite in_progress` before; `completed` after Verify hijau

## Bagian — Surgical Breakdown
| Bag | File | Fn/Struct | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `apps/kronos-sidecar/app/main.py` | `GET /health` | `{"model": "mock" if is_mock_mode() else "Kronos-base", "max_context":512, "device":get_device()}` — previously `os.getenv KRONOS_MOCK` only, now reads `_fell_back` via `is_mock_mode()` | KRONOS_MOCK=0 + missing HF still reports mock degraded |
| b | `apps/analysis/app/template_memo.py` vs `crates/seith-core/src/analysis/client.rs` | `template_memo` | single source wording or sync test: both produce `fundamental_memo` distinct from `technical_memo` distinct from `synthesizer_memo`; no `choices[0].message` clone | wording drift test fails if not sync |
| c | `crates/seith-api/src/handlers.rs` | `GET /api/v1/tickers/:ticker/dossier` | `research:{fundamentalMemo, technicalMemo, synthesizerMemo}` 3 distinct (fund=ROE vs median, tech=Z+vol, synth=verdict) — not `memo.clone()×3`; `disclaimer` idempotent | 3 memos identical → fail |
| d | tests | `tests/test_*` | `mockito` health degraded false vs true + dossier 3 distinct + template marker detection | — |

## Deliverables + Acceptance
- `curl :8001/health` with `KRONOS_MOCK=0` but no HF → `{"model":"mock","degraded":true}` honest (was `Kronos-base` fake)
- `curl :8181/api/v1/tickers/BBCA/dossier?market=id \| jq '.data.research'` → 3 memos distinct strings, each contains ticker, not `fund/tech/synth` literal clone
- `uv run pytest -q` in both sidecars + `cargo test -p seith-core analysis -- --nocapture` green
- `fn<50 file200-400` `cargo fmt+clippy` clean

## Verification
```
uv run --project apps/kronos-sidecar pytest -q → green
uv run --project apps/analysis pytest -q → green
cargo test -p seith-core -- --nocapture → green
curl http://127.0.0.1:8001/health | jq '.model, .max_context'
curl http://127.0.0.1:8181/api/v1/tickers/BBCA/dossier?market=id | jq '.data.research | keys, .fundamentalMemo[0:60]'
```

## Peran + Skill
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T1 | sub-agent | `seith-market-intelligence` + `seith-quant` | `seith-quant-reviewer` | Implement→Verify |
