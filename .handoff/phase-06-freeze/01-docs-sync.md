# Task 01 — Docs Sync + ADR 0006

## Goal
Sinkron `docs/* + README 7 Zones + adr/0006-freeze` dengan `main eafaea2` Hybrid `Axum 7 routes + CLI + Web + dossier` — no drift.

## Context
- SSOT: `AGENTS.md §3c Seven Zones §8c` + `docs/spec.md §2[8] Hybrid §6 Non-Functional §7b` + `docs/api-spec.md §1 envelope §3 endpoints §4 schemas §6 Repository` + `docs/tdd-plan.md §3 paths 6-7 §4 Layers §7 fixtures §9 Checklist` + `docs/prd.md` Freeze + `docs/adr/0001-0005` + `docs/notes/00-readme.md` + `README.md` + `skill://seith-market-intelligence` + `skill://no-ai-slop` + `skill://handoff`

## Scope In / Out
In: Z5 `docs/spec.md + api-spec.md + tdd-plan.md + prd.md + kronos-notes.md + adr/0006-freeze.md + README.md` + Z6 `.handoff/phase-06-freeze/01-docs-sync.md` — docs only
Out: `crates/*` `apps/*` logic (verify only, no code), `data/seith.db`, `vendor/*` read-only, `scripts/.github` (02)

## Bagian — Surgical
| Bag | File | Edit | Acceptance | Test FAIL |
|---|---|---|---|---|
| 01a | `docs/spec.md` | §2[8] Hybrid + §6 perf + §7b 7 Zones | `spec §2[8] lists 7 routes envelope + market` | `spec missing dossier→FAIL` |
| 01b | `docs/api-spec.md` | §1 envelope §3 7 endpoints §4 schemas | `api-spec §3 has GET /health /ranking /score /dossier /anomalies POST /scan + market` | `missing market→FAIL` |
| 01c | `docs/tdd-plan.md` | §3 paths 6-7 §4 CLI contract §7 fixtures | `tdd-plan §3 6-7 dossier+cli 143 + Z4 snapshot` | `CLI contract missing→FAIL` |
| 01d | `docs/prd.md` | Freeze gate + derived MI | `prd freeze note repo public 19 Aug–30 Sep` | `no freeze→FAIL` |
| 01e | `README.md` | Folder Structure 7 Zones | `README 7 Zones map matches AGENTS §3c` | `drift→FAIL` |
| 01f | `docs/adr/0006-freeze.md` | new ADR | `adr/0006 exists status Accepted 2026-09-07` | `missing→FAIL` |
| 01g | drift check | `doc-updater` | `grep FAIL if docs vs code mismatch` | `drift→FAIL` |

## Deliverables + Acceptance
- `spec/api-spec/tdd-plan/prd` diff <30 lines each — surgical, no reflow
- `adr/0006-freeze.md` 24L `Status Accepted — 2026-09-07` — Decision: public repo + `freeze-check.sh` + `protection 6 strict` + no push after submit
- `README` 7 Zones table sync `AGENTS §3c`
- Constraint: `fn <50` (n/a docs), `file 200-400` (docs 120-180), `no-ai-slop` Tier-1 warn + `skill://design-taste-frontend` if prose polish

## Verification
```
grep -n "Hybrid" docs/spec.md → §2[8]
grep -n "/api/v1/ranking" docs/api-spec.md → §3
grep -n "143" docs/tdd-plan.md → §3 99+→143
grep -n "freeze" docs/prd.md → gate
grep -n "Seven Zones" README.md → map
test -f docs/adr/0006-freeze.md → 0006 exists
doc-updater drift → 0
```

### Accountability Block
```
✅ Terverifikasi: <cmd> → <output> paste nyata
⚠️ Belum: Security gate (02), Video (03)
🔻 Risiko: docs drift code → mitigasi grep SSOT per file + pm veto
♻️ Refactor: extract shared 7 Zones table to README anchor + spec ref
```

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T1 Docs | sub-agent | `seith-market-intelligence`+`verification-loop`+`git-worktree-manager`+`no-ai-slop` | `doc-updater` | TDD docs grep red→green |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | no drift |
| PM | `seith-pm` | gate | — | veto if drift |

## Next
`skill://seith-market-intelligence` + `handoff/06-freeze` + `01-docs-sync.md` + ritual 3Q: gate MI mana? docs freeze verifiable. jebakan? 7 Zones drift + envelope. test FAIL? `adr 0006 missing`.
