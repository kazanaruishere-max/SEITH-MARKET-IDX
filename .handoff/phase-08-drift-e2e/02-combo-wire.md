# Task 02 — SEITH-MARKET-IDX Combo Wire (T2 Env+Python)

## Goal
Wire combo `SEITH-MARKET-IDX` sebagai default LLM model via env, dari `.env.example` sampai `apps/analysis` 3-agent chain.

## Context
- SSOT: `9router db data.sqlite combos SEITH-MARKET-IDX 8 free models (nvidia nemotron-3.5-lightning:free etc) + Seith-AI-Trading 7 models` + `AGENTS.md §4.4 secrets env-only + §3c 7 Zones` + `crates/seith-core/src/config.rs:22 AppConfig::from_env()` + `crates/seith-api/src/analysis.rs:10 AnalysisClient::new` + `apps/analysis/app/main.py` (Lite 3-agent Fund/Tech/Synth → 9router :20128) + `.env.example` root + `apps/analysis/.env.example`
- Dependensi: — (parallel dengan 01, file-disjoint)
- Branch: `handoff/08-drift-e2e/t2-combo-wire` dari `handoff/08-drift-e2e` (dari `main 76d7208`) — worktree `../seith-wt/handoff-08-t2` — 7 Zones Z1 config + Z2 analysis + Z5 env only
- Skill: `skill://seith-market-intelligence` awal + ritual 3Q + `skill://no-ai-slop` Tier-1

## Scope In / Out
In: Z5 `.env.example` root + `apps/analysis/.env.example` (SEITH_LLM_MODEL vars), Z1 `crates/seith-core/src/config.rs` (read env), `crates/seith-api/src/analysis.rs` (pass model), Z2 `apps/analysis/app/main.py` + `app/agents/*` default combo — `9router PID 22484 NEVER kill`
Out: Z1 `crates/sectors-client/*` (T1), `crates/seith-core/src/market.rs` (T1), `apps/kronos-sidecar` no edit, Z3 `data/seith.db`, `handlers::ranking` real wire defer, `vendor/*`

## Bagian — Surgical Breakdown
| Bag | File | Struktur / Fn | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `.env.example` + `apps/analysis/.env.example` | env vars | `SEITH_LLM_MODEL=SEITH-MARKET-IDX` default, `SEITH_LLM_FALLBACK_MODEL=Seith-AI-Trading`, `SEITH_API_KEY=` placeholder (never value), `LLM_BASE_URL=http://localhost:20128/v1` unchanged | `grep SEITH_LLM_MODEL .env.example` → 1 line |
| b | `crates/seith-core/src/config.rs:22` | `AppConfig::from_env()` | read `SEITH_LLM_MODEL` env, default `"SEITH-MARKET-IDX"`, plus `seith_llm_fallback` default `"Seith-AI-Trading"`, `#[derive Clone]` field `seith_llm_model: String` | `std::env::set_var("SEITH_LLM_MODEL","SEITH-MARKET-IDX"); assert_eq!(AppConfig::from_env().unwrap().seith_llm_model, "SEITH-MARKET-IDX")` |
| c | `crates/seith-api/src/analysis.rs:10` | `AnalysisClient::new` + request body | pass `model` from config to JSON body `{"model": cfg.seith_llm_model, "messages": [...]}` via `reqwest` to `LLM_BASE_URL/v1/chat/completions` with `Authorization: Bearer $SEITH_API_KEY` | mockito `match_body(Matcher::PartialJson(json!({"model":"SEITH-MARKET-IDX"})))` |
| d | `apps/analysis/app/main.py` | 3-agent chain default | read `os.getenv("SEITH_LLM_MODEL","SEITH-MARKET-IDX")` as default `model` param in `POST /synthesize` body, fallback on 429/5xx to `SEITH_LLM_FALLBACK_MODEL` | `uv run pytest -q` 17 passed, `test_three_agent.py` asserts model field |

## Deliverables + Acceptance
- `.env.example` root: `SEITH_LLM_MODEL=SEITH-MARKET-IDX` + `SEITH_LLM_FALLBACK_MODEL=Seith-AI-Trading` + `SEITH_API_KEY=` (empty, server-only) — never commit value, `.gitignore` already covers `.env`
- `apps/analysis/.env.example`: same 3 lines + `KRONOS_MOCK=1` + `LLM_BASE_URL` unchanged
- `crates/seith-core/src/config.rs`: `seith_llm_model: String` field, `from_env()` reads `SEITH_LLM_MODEL` with default, `Display`/`Debug` via `Redacted` not log
- `crates/seith-api/src/analysis.rs`: request body includes `model` from config, header `Authorization: Bearer <SEITH_API_KEY>` via `Redacted`
- `apps/analysis/app/main.py`: `SEITH_LLM_MODEL` env default, Top-N only, timeout 15s retry1 unchanged
- Constraint: `fn <50`, `file 200-400`, `nesting ≤4`, `cargo fmt+clippy` clean, `gitleaks` no leak — §8c
- Live probe (manual, founder handles key after rotation): `curl -H "Authorization: Bearer $SEITH_KEY" -d '{"model":"SEITH-MARKET-IDX","messages":[{"role":"user","content":"PONG"}],"max_tokens":8}' http://localhost:20128/v1/chat/completions → 200 PONG + header `x-used-model: nvidia/nemotron-3.5-lightning:free` cost 0

## Verification
```
cargo fmt --check → 0
cargo clippy -p seith-core -p seith-api -- -D warnings → 0
cargo test → 145 passed (post-merge ab411df + clippy fix)
uv --project apps/analysis run pytest -q --cov → 17 passed 96% (test_three_agent + test_contract) — pyproject dev pytest-cov>=5
# live (masked, founder key after rotation):
# curl -H "Authorization: Bearer $SEITH_KEY" http://localhost:20128/v1/chat/completions -d '{"model":"SEITH-MARKET-IDX","messages":[{"role":"user","content":"PONG"}],"max_tokens":8}' → 200 PONG x-used-model nvidia/nemotron-3.5-lightning:free cost 0 (401 without key expected → fallback Seith-AI-Trading)
pnpm lint/typecheck → 0 (if web touched, else skip)
gitleaks detect --no-git → 0 leak (SEITH_API_KEY in .env gitignored, Redacted in Display)
```
## Accountability Block — Task 02 (PM §7 DoD #8)
- ✅ Terverifikasi: `cargo fmt --check → 0`, `cargo clippy -p seith-core -p seith-api -- -D warnings → 0`, `cargo test → 145 passed`, `uv --project apps/analysis run pytest -q --cov → 17 passed 96%`, `ruff check → 0`, `9router PID 22484 :20128` alive probe `200 COMBO_FOUND SEITH-MARKET-IDX 8 free + Seith-AI-Trading 7`
- ⚠️ Belum: `curl Bearer SEITH_API_KEY 200 PONG live` — perlu key founder post-rotation (401 tanpa key wajar, covered di 04-e2e)
- 🔻 Risiko: rate limit 429/5xx di 9router free chain — deteksi `x-used-model` header, fallback `SEITH_LLM_FALLBACK_MODEL=Seith-AI-Trading` per attempt log `logger.debug`
- ♻️ Refactor: `_chat.py` RUF034 `return ""` explicit + `SynthesizeWire model` field + `fundamental/technical/synthesizer` pass model + `schemas.py model` enum + `config.rs seith_llm_model` default — `fn<50 file<400 nesting≤3` pass

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T2 Env+Python | sub-agent | `seith-market-intelligence` + `tdd-workflow` + `verification-loop` | `explore` if 9router debug | Implement→Verify→Refactor TDD |

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/08-drift-e2e/t2-combo-wire` + task `02-combo-wire.md` + ritual 3Q
