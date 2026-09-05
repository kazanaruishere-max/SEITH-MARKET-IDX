# Task NN — Title

## Goal
One-sentence slice objective — apa yang dikunci task ini.

## Context
- SSOT: `AGENTS.md §X` + `docs/*` relevan + `skill://seith-market-intelligence`
- Dependensi: task `NN-1` done → task ini
- Branch: `handoff/NN-topic` (atau `handoff/NN/topic/t1-*` jika paralel)

## Scope In / Out
In: ... (file/crate spesifik)
Out: ... (tidak disentuh task ini)

## Deliverables + Acceptance
- File list + acceptance kriteria terukur (round-trip test, key format, TTL, guard 422, envelope)
- Constraint: `fn <50`, `file 200-400`, `nesting ≤4`, `no dead code`, `cargo fmt+clippy` clean, `♻️ Refactor:` wajib

## Verification (paste output nyata)
```
cargo fmt --check → 
cargo clippy -- -D warnings → 
cargo test -p <crate> -- --nocapture → 
```
+ Accountability Block: `✅ Terverifikasi: <cmd> → <output> / ⚠️ Belum / 🔻 Risiko / ♻️ Refactor: <apa>`

## Peran + Skill + Sub-agent (task ini)
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T1/T2 | sub-agent | `seith-market-intelligence` + `tdd-workflow` | `explore` jika debug | Implement→Verify→Refactor TDD |

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/NN/topic` + task `NN-*.md` + ritual 3Q
