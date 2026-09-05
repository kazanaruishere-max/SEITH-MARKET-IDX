# Skill: verification-loop — Gate Verifikasi Harness

Wajib di akhir tiap handoff T1/T2 sebelum claim done.

## Gate
`cargo fmt --check && cargo clippy -- -D warnings && cargo test -- --nocapture` (+ `uv run pytest -q` jika sidecar + `pnpm --dir apps/web lint && pnpm --dir apps/web typecheck` jika FE)

## Output
Paste output asli, no fabrikasi. Akhiri dengan Accountability Block `✅/⚠️/🔻`. PM `seith-pm` vetos jika gate fail.

## References
`AGENTS.md §7`, `docs/tdd-plan.md §9`, `.opencode/skills/seith-phase-gate/SKILL.md`
