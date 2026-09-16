# Task 03 — Governance Docs (Z5/Z6/Z7)

## Goal
Sinkron governance: AGENTS todo-trace + skills + template + api-spec/tdd-plan + gitignore uv.lock.

## Context (§8c)
- SSOT: `AGENTS.md §7 DoD#8 §8d` + `.handoff/README.md` phase-folder + 7 Zones §3c
- Skill: `seith-market-intelligence` + `no-ai-slop` Tier-1 prose
- File: `AGENTS.md` (+9-1) + `seith-pm/AGENT.md` + 4 skills + 2 phase-template + `handoff-NN-template` + `docs/api-spec.md` (+8) + `docs/tdd-plan.md` (+2) + `.gitignore` (+`research/uv.lock`)

## Scope In / Out
In: workflow `Understand→Plan→Todo→Implement→Verify→Refactor→Document` + DoD#8 todo trace + §8d + PM AGENT todo veto + skills verification-loop/phase-gate/dev/market-intelligence + api-spec pinned live + §3b Web Contract + tdd-plan todo step + gitignore uv.lock.
Out: kode Z1/Z2, lockfile commit, push.

## Bagian — Surgical
| Bag | Item | File |
|---|---|---|
| a | Todo workflow + DoD#8 + §8d | `AGENTS.md` |
| b | Todo veto PM DoD | `seith-pm/AGENT.md` |
| c | Todo trace clause | 4 skills + 2 template + NN-template |
| d | Pinned live note + §3b Web Contract | `docs/api-spec.md` |
| e | Todo step 0 + trace gate | `docs/tdd-plan.md` |
| f | `research/uv.lock` ignore (157KB noise, preseden `apps/*/uv.lock` di `eafaea2`) | `.gitignore` |

## Deliverables + Acceptance
- `rg todowrite` 10/10 file governance kena
- `git status --short research/ → bersih` (uv.lock ignored)
- `doc-updater` no-drift: api-spec §3b cocok dengan `app/*` + `components/*` real
- prose lolos `no-ai-slop` Tier-1 warn

## Verification + Accountability
```
rg -l todowrite AGENTS.md .opencode/agents/seith-pm/AGENT.md .opencode/skills/*/SKILL.md .handoff/phase-template/ docs/tdd-plan.md → 10
git status --short research/ → (kosong)
git diff -- .gitignore → +research/uv.lock
```
- ✅ Terverifikasi: <cmd> → <output>
- ⚠️ Belum: <apa>
- 🔻 Risiko: <1-2> — deteksi: <cara>
- ♻️ Refactor: <apa>

## Peran
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Eksekutor T2 | sub-agent | `seith-market-intelligence` | `explore` | Implement→Verify 03 |
| Doc | `doc-updater` | `remember`+`handoff`+`no-ai-slop` | `doc-updater` | no-drift check |
| PM | `seith-pm` | gate docs | `seith-pm` | veto jika drift |
| Lead T0 | opencode sini | `seith-market-intelligence` | — | approve prose |
| Refactor | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | hapus duplikasi docs |

## Next Session Prompt
`skill://seith-market-intelligence` + `handoff/12` + `03-governance-docs.md` + ritual 3Q → `04-pm-gate-freeze.md`
