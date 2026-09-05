# Skill: seith-kronos — Kronos Model Ops

Wajib saat sentuh `apps/kronos-sidecar`, forecast, sampling, `predict_batch`.

## Stack
Kronos-base `NeoQuasar/Kronos-base` + Tokenizer-base `102.3M`, max_context `512`, lookback `400→pred 20`, T `1.0` top_p `0.9`.

## Commands
`uv sync` di `apps/kronos-sidecar`; `cargo test -p sectors-client` untuk bridge; `uv run pytest -q` sidecar.

## Constraints
`lookback + predLen ≤512` → `422`; missing `volume/amount →0`; timeout `30s` fallback `degraded:true`.

## References
`docs/kronos-notes.md`, `docs/spec.md §2`, `2508.02739v1.pdf`
