# Task 03 — Video Teaser 1m + Judging 3m

## Goal
Checklist `teaser 1m (CLI+Web screen record)` + `judging 3m (problem→audience→workflow 60s Ranking→Dossier)` — no code, stub only.

## Context
- SSOT: `AGENTS.md §2 Project Snapshot 40/30/30` + `docs/prd.md` Video + `docs/spec.md §7 Handoff Slice` + `.github/workflows/freeze-check.yml` + `skill://seith-market-intelligence` + `skill://no-ai-slop`

## Scope In / Out
In: Z5 `docs/video-checklist.md` + Z7 `scripts/record-demo.sh` stub — checklist only
Out: `crates/*` `apps/*` code (verify only), `data/seith.db`, `vendor/*`

## Bagian — Surgical
| Bag | File | Content | Acceptance | Test FAIL |
|---|---|---|---|---|
| 03a | `docs/video-checklist.md` | teaser 1m bullet | `CLI ranking --json + dossier --pdf + Web /ranking` | `missing CLI→FAIL` |
| 03b | same | judging 3m bullet | `problem→audience→workflow→demo` | `no workflow→FAIL` |
| 03c | `scripts/record-demo.sh` | stub `echo` | `chmod +x + note screen record` | `no stub→FAIL` |
| 03d | verify | `cat docs/video-checklist.md` | `exists` | `missing→FAIL` |

## Deliverables
- `docs/video-checklist.md` 30L — 1m + 3m checklist
- `scripts/record-demo.sh` 10L stub — no video binary in repo (link drive)

## Verification
```
test -f docs/video-checklist.md → 0
cat docs/video-checklist.md | grep -i "teaser 1m" → ok
cat scripts/record-demo.sh | grep record → ok
```

### Accountability
```
✅ Terverifikasi: <cmd> → <output>
⚠️ Belum: Verify gate (04)
🔻 Risiko: video >1m/3m → mitigasi checklist timer
♻️ Refactor: extract 7 Zones table
```

## Peran + Skill
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T1 | sub-agent | `seith-market-intelligence`+`verification-loop` | `doc-updater` | checklist red→green |
| PM | `seith-pm` | gate | — | veto if missing |

## Next
`skill://seith-market-intelligence` + `handoff/06-freeze` + `03-video-demo.md` + ritual 3Q
