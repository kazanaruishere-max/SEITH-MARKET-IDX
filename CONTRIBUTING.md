# Contributing — SEITH

> Licensed under AGPL-3.0 — source-available, NOT community until founder opens. No PR/issue accepted before explicit open (AGENTS.md §8). See LICENSE.

## Workflow
- Branch `handoff/NN-topic` dari `main`, worktree `../seith-wt/handoff-NN-*` (PM `seith-pm` owns).
- Satu slice terverifikasi per session: TDD red → green → refactor.
- Commit `type: desc` (feat/fix/test/chore/docs), no `push --force` ke `main`/`handoff/*`.

## Gate
`cargo fmt --check && cargo clippy -- -D warnings && cargo test` (+ `uv run pytest` / `pnpm lint` jika sentuh).

## Cleansing
`open/high/low/close` missing → exclude + `excluded:[{ticker,reason}]`; `volume/amount` → `0`; rasio missing → sector median + `insufficient_data:true`.
