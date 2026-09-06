# Task NN — Title

## Goal
One-sentence slice objective — apa yang dikunci task ini (zona mana dari 7 Zones §3c).

## Context
- SSOT: `AGENTS.md §3c/§6/§6c/§8c` + `docs/*` relevan + `skill://seith-market-intelligence` + `skill://no-ai-slop` (Tier-1) + `docs/notes/00-readme.md` ritual 3Q
- Dependensi: task `NN-1` done → task ini
- Branch: `handoff/NN-topic` (atau `handoff/NN/topic/t1-*` jika paralel) — `/.wt/` gitignore — 7 Zones

## Scope In / Out
In: ... (file/crate spesifik + zona 1-7)
Out: ... (tidak disentuh task ini — zona lain)

## Bagian — Surgical Breakdown (WAJIB dipisah, 1 bagian = 1 fn/struct <50 baris, §8c)
| Bag | File | Struktur / Fn | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `...` | ... | ... | ... |
| b | `...` | ... | ... | ... |

## Deliverables + Acceptance
- File list + acceptance kriteria terukur (round-trip test, key format, TTL, guard 422, envelope)
- Constraint: `fn <50`, `file 200-400`, `nesting ≤4`, `no dead code`, `no unwrap`, `no duplication`, `cargo fmt+clippy` clean, 7 Zones, `♻️ Refactor:` wajib — §8c

## Verification (paste output nyata — §8c)
```
cargo fmt --check → 
cargo clippy -- -D warnings → 
cargo test -p <crate> -- --nocapture → 
```
+ Accountability Block: `✅ Terverifikasi: <cmd> → <output> / ⚠️ Belum / 🔻 Risiko / ♻️ Refactor: <apa>` — `refactor-cleaner` scan `fn<50 file200-400 nesting≤4`

## Peran + Skill + Sub-agent (task ini — §8c semua agent bertanggung jawab code/logic/testing/structure & rapih)
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T1/T2 | sub-agent | `seith-market-intelligence` + `tdd-workflow` + `verification-loop` | `explore` jika debug | Implement→Verify→Refactor TDD — §8c |

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/NN/topic` + task `NN-*.md` + ritual 3Q
