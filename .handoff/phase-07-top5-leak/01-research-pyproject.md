# Task 01 — research/pyproject.toml Isolated

## Goal
`research/pyproject.toml` uv isolated `jupyterlab + ipykernel + plotly + pandas (+ polars opsional)` — tidak sentuh `apps/kronos-sidecar/pyproject.toml` production.

## Context
- SSOT: `AGENTS.md §3c Z5 research/ vs Z2 apps/kronos-sidecar` + `docs/research/data-plan-100-top.md` + `apps/kronos-sidecar/pyproject.toml` FastAPI `pandas/numpy/torch` no `jupyter/plotly` — founder lock isolated — `skill://seith-market-intelligence` + `skill://no-ai-slop`

## Scope In / Out
In: Z5 `research/pyproject.toml` + `research/.python-version` + `uv --project research sync` — isolated only
Out: `apps/kronos-sidecar` `apps/analysis` no edit, `crates/*` `apps/web` verify only

## Bagian — Surgical
| Bag | File | Cmd / Content | Acceptance | Test FAIL |
|---|---|---|---|---|
| 01a | `research/pyproject.toml` | `name research` `requires-python >=3.11` `dependencies = jupyterlab + ipykernel + plotly==5.* + pandas (+ polars optional)` `uv` isolated pinned | `uv --project research sync 0` | `sync fail→FAIL` |
| 01b | `research/.python-version` | `3.11` or `3.12` | `uv --project research run python --version` | `no version→FAIL` |
| 01c | guard | `grep plotly apps/kronos-sidecar/pyproject.toml → 0` | `0` `apps/kronos-sidecar` no `plotly/jupyter` | `found→FAIL` |
| 01d | verify | `uv --project research run jupyter --version + uv --project research run python -c "import plotly"` | `0` | `import fail→FAIL` |

## Deliverables + Acceptance
- `research/pyproject.toml` 30L — `jupyterlab>=4 ipykernel>=6 plotly==5.* pandas polars` pinned — `uv --project research sync` 0 — `apps/kronos-sidecar` clean `grep 0`
- `research/.python-version` — `3.11` single source
- Constraint: `file 200-400` n/a, `no dead code` + `♻️ Refactor:` + `no-ai-slop` — 7 Zones isolated — PM veto if mixed

## Verification
```
uv --project research sync → 0
uv --project research run jupyter --version → 0
uv --project research run python -c "import plotly" → 0
grep -r plotly apps/kronos-sidecar/pyproject.toml → 0
cargo test → 143 (no drift)
```

### Accountability Block
```
✅ Terverifikasi: <cmd> → <output> paste nyata
⚠️ Belum: ipynb 7 cells (02), TopLeaks hero (03)
🔻 Risiko: jupyter masuk production → mitigasi grep + isolated pyproject
♻️ Refactor: extract research env .python-version single source
```

## Peran + Skill
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T1 Z5 | sub-agent | `seith-market-intelligence`+`tdd-workflow`+`verification-loop`+`git-worktree-manager`+`no-ai-slop` | `explore` | uv isolated TDD |
| PM | `seith-pm` | gate `fmt/clippy/test` | — | veto if mixed |

## Next
`skill://seith-market-intelligence` + `handoff/07-top5-leak` + `01-research-pyproject.md` + ritual 3Q: gate? `research isolated`. jebakan? `apps/kronos-sidecar` clean. test FAIL? `sync 0 + import plotly 0`.
