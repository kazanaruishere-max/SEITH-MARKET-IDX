# ADR 0004 — Analysis Agents Lite (3-agent Fund/Tech/Synth)

## Status
Accepted 2026-09-06 (founder).

## Context
Pipeline [6] `TradingAgents-Lite` butuh agent copy pola dari `vendor/TradingAgents 9dee508` (read-only, ADR 0002) untuk menghasilkan `research: {fundamentalMemo, technicalMemo, synthesizerMemo}` di dossier H5.

Original `vendor/TradingAgents` punya 4-agent: `Fundamental + Technical + Research + Risk → Synthesizer`. Pattern di-copy jadi Lite 3-agent (no `Risk` agent) untuk:
- Hemat 1 LLM call per ticker (cost efficiency)
- Track 3 scoring H4 cukup butuh Fund + Tech + Synth (Risk implicit via `anomalyZ` dari Kronos H2)
- Lite selaras `prd §5 [6]`

## Decision
- **3-agent Lite:** `Fundamental + Technical + Synthesizer` (no Risk)
- **No `openai` SDK** — pakai `httpx` direct ke 9router OpenAI-compatible `POST {LLM_BASE_URL}/v1/chat/completions`
- **Timeout 15s retry 1x** — mirror H2 `KronosClient timeout 30s retry1`
- **Template fallback numeric deterministic** — `f"ROE {roe:.2%} margin {margin:.2%} PE {pe:.1f}"` no AI wording
- **Disclaimer always inject** — `"Bukan rekomendasi investasi. Informasi & analisis saja."` di setiap memo (Track 3 rule `disclaimer` di setiap insight view)
- **9router mock 100% di CI** via `httpx_mock` — 9router Tier-0 NEVER kill (AGENTS §4)
- **Bridge di `crates/seith-core/src/analysis/`** — mirror H1+H2 pattern, no crate baru (AGENTS §3c Z1)

## Consequences
- Tiap ticker dossier 1 LLM call × 3 agents = 3 LLM calls (vs 4 = Risk call)
- 9router down → `degraded:true template memo numeric` fallback mandatory di **dua** boundary (Python 02 + Rust 03) — tidak bocor blank memo ke juri
- Disclaimer injection post-9router — Track 3 rule enforced di `sanitize_error` AGENTS §6
- `LLM_BASE_URL` + `ANALYSIS_URL` env-only default `:20128/v1` + `:8002` (sudah ada H1 `config.rs:32-37`)

## Alternatives Considered
- 4-agent (Fund+Tech+Risk+Synth) — lebih lengkap, drift vendor, +1 LLM call (~$0.01/ticker × 10 ticker dossier ~$0.1/cycle), reject
- `openai` SDK — extra dep + version pin, drift LLM-specific, reject
- Real 9router call di CI — Tier-0 NEVER kill + slow CI, reject

## References
- AGENTS.md §4 Tier-0 + §3c Z1 + §6 contract
- `docs/spec.md §2[6] §3 Research` + `docs/api-spec.md §9 Analysis` + `docs/tdd-plan.md §3 critical 5) analysis-bridge`
- `.handoff/phase-03-analysis/` (00-overview + 01-04 tasks)
- `vendor/TradingAgents 9dee508` (read-only)
