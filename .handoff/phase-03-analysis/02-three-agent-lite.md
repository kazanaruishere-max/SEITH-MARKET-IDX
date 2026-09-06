# Task 02 — Three-Agent Lite (Fund/Tech/Synth) → 9router

## Goal
Kunci `apps/analysis/app/agents/{fundamental,technical,synthesizer}.py` copy pola `vendor/TradingAgents` Lite (3-agent, no full repo) dengan `httpx → 9router LLM_BASE_URL + /v1/chat/completions` + `template_memo.py` numeric deterministic fallback + `disclaimer.py` inject — pipeline [6] unlock.

## Context
- SSOT: `AGENTS.md §3c Seven Zones + §4 Tier-0 NEVER kill 9router + §5b/§6c/§8c` + `docs/spec.md §2[6] §3 Research §7b` + `docs/api-spec.md §9 Analysis` + `docs/tdd-plan.md §3 critical 5) analysis-bridge §7 Fixtures 9router` + `docs/notes/00-readme.md ritual 3Q` + `vendor/TradingAgents 9dee508` read-only + `skill://seith-market-intelligence` + `skill://seith-dev` + `skill://no-ai-slop`
- Dependensi: `01` schemas (shape `SynthesizeRequest {market, ticker, fundamentals, kronos_signal, sector}`)
- Branch: `handoff/03-analysis-t2-sidecar` (T2: 01+02 Python)
- Decision founder 2026-09-06: 3-agent `Fund+Tech+Synth` Lite (hemat 1 LLM call), `httpx` direct (no `openai` SDK = no extra dep), template numeric deterministic (no AI wording = no hallucination), `timeout 15s` 1 retry
- Pattern mirror: `apps/kronos-sidecar/app/predictor.py` (lazy load + mock fallback + env)
- 9router Tier-0 `localhost:20128` OpenAI-compatible `POST /v1/chat/completions {model, messages, temperature}` → `{choices: [{message: {content: "..."}}]}`

## Scope In / Out
In: Zona 2 `apps/analysis/app/agents/__init__.py` + `fundamental.py` + `technical.py` + `synthesizer.py` + `template_memo.py` + `disclaimer.py` + `apps/analysis/tests/test_three_agent.py` + `tests/fixtures/9router-success.json` + `9router-failure.json` (Z4)
Out: FastAPI contract `main.py + schemas.py` (01, mirror 02 Phase 2), Rust bridge `seith-core/src/analysis/*` (03), verify e2e CI (04)

## Bagian — Surgical Breakdown (1 bagian = 1 fn <50 baris)
| Bag | File | Struktur / Fn | Acceptance | Test FAIL |
|---|---|---|---|---|
| 02a | `app/disclaimer.py` | `DISCLAIMER = "Bukan rekomendasi investasi. Informasi & analisis saja."` `def inject(memo: str) -> str` append suffix | `inject("foo")[-len(DISCLAIMER):]==DISCLAIMER` | `disclaimer missing` |
| 02b | `app/template_memo.py` | `def fundamental(req: SynthesizeRequest) -> str` numeric deterministic format: `f"ROE {roe:.2%} margin {margin:.2%} PE {pe:.1f} sector {sector}"` + `anomaly_z` flag — Bahasa Indonesia ringkas <500 char | `fundamental(BBCA, roe=0.18) contains "ROE 18.00%"` | `prose equality fail` |
| 02c | `app/template_memo.py` | `def technical(req: SynthesizeRequest) -> str` numeric `f"ER {er:.2%} Z {z:.2f} vol {vol}"` + flag `\|z\|>2` | `technical contains "Z="` | `flag anomaly missing` |
| 02d | `app/template_memo.py` | `def synthesize(req: SynthesizeRequest) -> str` 1 paragraph combine fundamental + technical numeric + verdict "netral/buy/caution" deterministic dari Z | `synthesize contains verdict` | `verdict drift` |
| 02e | `app/agents/fundamental.py` | `async def run(req: SynthesizeRequest, llm_url: str, timeout: float = 15.0) -> str` `httpx.AsyncClient` POST `{llm_url}/v1/chat/completions` `model="gpt-4o-mini"` `messages=[{role:"system", content:"Analisa fundamental ringkas..."}, {role:"user", content:fundamental_payload(req)}]` `timeout 15s` retry 1x → on `TimeoutException | HTTPStatusError` → `template_memo.fundamental(req)` + `disclaimer.inject()` | `httpx_mock 200 → memo from response` `httpx_mock 503 → template + disclaimer` | `no fallback` |
| 02f | `app/agents/technical.py` | mirror `02e` system prompt `Analisa teknikal ringkas...` + `template_memo.technical()` fallback | `httpx_mock 200 → technical memo` | `no template` |
| 02g | `app/agents/synthesizer.py` | mirror `02e` system prompt `Sintesis 1 paragraf...` + `template_memo.synthesize()` fallback — input = `fundamental + technical` (2-pass optional) | `synthesizer contains verdict` | `synthesizer no fallback` |
| 02h | `app/agents/__init__.py` | `from .fundamental import run as fundamental_run` + `technical_run` + `synthesizer_run` | re-export clean | — |
| 02i | `tests/test_three_agent.py` | `pytest -q` + `httpx_mock` ≥9 tests | `httpx_mock 200 → memo` `503 → template+disclaimer` `timeout → template` `market Id/Sg` `disclaimer present` | 9 passed |
| 02j | `tests/fixtures/9router-success.json` | mock response `{choices:[{message:{content:"ROE 18%, margin 12%..."}}]}` | json valid | malformed |
| 02k | `tests/fixtures/9router-failure.json` | mock response 5xx/timeout | json valid | missing |

## Deliverables + Acceptance (per Bagian)
- 02a: `disclaimer.py` 10-20 baris, `fn <50`, hardcoded constant
- 02b-d: `template_memo.py` 100-150 baris, `fn <50`, pure function deterministic no LLM call, Bahasa Indonesia ringkas
- 02e-g: `agents/{fundamental,technical,synthesizer}.py` 60-90 baris each, `fn <50`, `nesting ≤4`, `httpx.AsyncClient` `timeout 15s` retry 1x, `tracing` log, no `unwrap`
- 02h: `__init__.py` re-export 5 baris
- 02i-k: `test_three_agent.py` + fixtures 9 tests meaningful (no assertion-less)
- Constraint: `file 200-400` typical max 800, `ruff check 0`, `no silent swallow` (log `tracing`), `♻️ Refactor:`
- 7 Zones: file baru wajib zona 2 (`apps/analysis/app/*`) + zona 4 (`tests/fixtures/9router-*.json`) — PM veto jika di luar

## Verification
```
# workdir apps/analysis (AGENTS §5 Gotcha)
uv run ruff check . → 0
uv run pytest tests/test_three_agent.py -q → ≥9 passed (httpx_mock 200/503/timeout, market Id/Sg, disclaimer, degraded bool)
# 9router Tier-0 NEVER kill — CI tidak boleh panggil 9router real
grep -r "httpx.AsyncClient()" tests/ | grep -v "MockTransport" | grep -v "MockRouter" → 0 leak
skill://no-ai-slop detect → pass (Tier-1 warn)
refactor-cleaner scan §8c → pass
```

### Accountability Block
```
✅ Terverifikasi: <cmd> → <output> (paste nyata)
⚠️ Belum: Rust bridge call (03), verify green CI (04)
🔻 Risiko: real 9router call di CI → mitigasi: httpx_mock 100% + grep zero leak
♻️ Refactor: extract _post_chat_completion(), split template_memo pure vs agent async fn<50
```

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead Otak T0 | opencode sini | `seith-market-intelligence`+`seith-dev`+`verification-loop` | — | approve 02 |
| T2 Sidecar | sub-agent | `seith-market-intelligence`+`tdd-workflow` | `tdd-guide` | httpx_mock 9 kasus + 9router fixture |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | no secret log, 9router URL env, no real call CI |
| PM Autonomous | `seith-pm` | `git-worktree-manager`+gate | — | veto jika fallback mandatory miss — §8c |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca task — fn<50 |

> §8c: semua agent bertanggung jawab penuh code/logic/testing/structure & rapih 7 Zones

## Next Session Prompt
`skill://seith-market-intelligence` + `skill://seith-dev` + `handoff/03-analysis-t2-sidecar` + `02-three-agent-lite.md` + ritual 3Q:
1) Gate MI? Research memo Fund/Tech/Synth — tanpa fallback template, dossier blank saat 9router down.
2) Jebakan? `httpx_mock` 100% CI + `9router NEVER kill` + `disclaimer always inject` + `template numeric deterministic`.
3) Test FAIL apa? `httpx_mock 200→memo`, `503→template+disclaimer`, `timeout→template`, `market Id/Sg`, `disclaimer in response`.
