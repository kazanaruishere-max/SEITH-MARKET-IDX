# Skill: seith-phase-gate — Dual-Review Gate Penutupan Fase

## Purpose
Protokol penutupan fase: dual-review sebelum squash-merge ke `main`.

## When to Use
Tiap handoff selesai (H1-H6), tiap PR `handoff/* → main`. PM `seith-pm` invoke autonomous — T1/T2 tidak boleh self-approve.

## Gate Checklist
- [ ] `cargo fmt --check` 0
- [ ] `cargo clippy -- -D warnings` 0
- [ ] `cargo test` + `uv run pytest` + `pnpm lint/typecheck` (jika sentuh)
- [ ] `rust-reviewer` pass (scoring/anomaly/adapter)
- [ ] `security-reviewer` pass (Sectors key, 9router, rate limit, input validator) — MANDATORY pra-freeze
- [ ] `Accountability Block` dengan output nyata
- [ ] `docs/*` sinkron (no drift)

## Reviewers
`rust-reviewer` ∥ `security-reviewer` paralel via `task` sub-agent. Veto jika salah satu FAIL. Output triage oleh Lead.

## References
`AGENTS.md §7-8`, `docs/tdd-plan.md §9`
