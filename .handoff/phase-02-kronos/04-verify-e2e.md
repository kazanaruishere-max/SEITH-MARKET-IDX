# Task 04 — Verify E2E + CI Green + Docs Sync

## Goal
Kunci `cargo fmt/clippy 0 + cargo test pass + uv pytest KRONOS_MOCK=1 pass + CI python-kronos hijau + docs spec/api-spec/tdd-plan sync` — Phase 02 DONE verifiable no gap.

## Context
- SSOT: `AGENTS.md §7 DoD 10 poin + §5b Boy Scout §5 + §6c Anti Slop §8c 7 Zones` + `docs/spec.md §2[3] §7b` + `docs/api-spec.md §9` + `docs/tdd-plan.md §3/7` + `docs/kronos-notes.md` + `docs/notes/00-readme.md ritual 3Q` + `skill://seith-market-intelligence` + `skill://seith-kronos` + `skill://verification-loop` + `skill://no-ai-slop` + `skill://seith-phase-gate`
- Dependensi: `01` contract + `02` predictor + `03` bridge (semua impl selesai)
- Branch: `handoff/02-kronos` (parent, setelah T1+T2 merge balik) — final verify sebelum PR ke `main`
- Gate: `cargo fmt --check 0` + `clippy -- -D warnings 0` + `cargo test -- --nocapture pass` + `uv run pytest -q --cov pass` + `refactor-cleaner fn<50 file200-400 nesting≤4` + `gitleaks 0` + `seith-phase-gate` dual-review pass + `Accountability Block 00-04` + `docs drift 0`

## Scope In / Out
In: Zona 1 `crates/seith-core/src/kronos/*` (verify tests) + Zona 2 `apps/kronos-sidecar` (verify pytest) + Zona 5 `docs/spec.md + api-spec.md + tdd-plan.md + kronos-notes.md` sync (tambah `migrations` NA) + Zona 6 `.handoff/phase-02-kronos/00-overview + 01-04 *.md` final polish + Zona 7 `.github/workflows/ci.yml` cek `python-kronos` job `KRONOS_MOCK=1` + `scripts/check-kronos.*` liveness — 7 Zones map
Out: Impl baru fitur — hanya `verify + docs sync + gate` — no new logic

## Bagian — Surgical Breakdown (WAJIB dipisah, 1 bagian = 1 verify slice <50 baris)
| Bag | File/Step | Verify | Acceptance | Test FAIL |
|---|---|---|---|---|
| 04a | `cargo fmt + clippy` | `cargo fmt --check →0` `cargo clippy -p seith-core -p seith-api -p sectors-client -- -D warnings →0` per crate | `fmt 0 clippy 0` no `unwrap` | `clippy warn→fail CI` |
| 04b | `cargo test Rust` | `cargo test -p seith-core -- --nocapture` kronos guard + `cargo test -- --nocapture` workspace | `≥7 kronos tests passed` + `workspace 64+7=71 passed` meaningful | `guard 512→422 fail` `degraded false` |
| 04c | `uv pytest Python` | `cd apps/kronos-sidecar && KRONOS_MOCK=1 uv run ruff check . →0 && KRONOS_MOCK=1 uv run pytest -q --cov → pass` mock deterministik | `≥9 pytest passed` `contract 7 + predictor 6 - overlap ≥9` fast <2s | `mock torch import err` `unequal 422 missing` |
| 04d | `CI & liveness` | `gh workflow view ci.yml` `python-kronos` job `KRONOS_MOCK=1` + `scripts/check-kronos.ps1` `GET :8001/health →200` jika sidecar run (mock optional) | `CI contexts 6 strict` + `health 200 or mock skip` | `CI python-kronos merah` |
| 04e | `docs sync` | `doc-updater` sync `spec §2[3] predict_batch 400→20 T1.0` + `api-spec §9` bridge timeout30s retry1 + `tdd-plan §3/7` boundaries + `kronos-notes` 102.3M 512 ctx | `docs diff 0` no drift `phase-01→02` H4 scoring dependency `ER` | `spec drift → PR checklist fail` |
| 04f | `refactor + gitleaks + no-ai-slop` | `refactor-cleaner scan §8c` `fn<50 file200-400 nesting≤4 no dead code` + `gitleaks detect --no-banner →0` + `skill://no-ai-slop detect → pass` | `scan pass` + `♻️ Refactor:` per task 01-04 | `file 600 bars → veto` `banned word delve→warn` |
| 04g | `seith-phase-gate` | dual-review `rust-reviewer ∥ security-reviewer` + `seith-phase-gate` protocol — `00-overview` DoD 10 poin check + PM gap audit | `gate PASS` + `PM 100% siap implementasi` | `gate FAIL → revert` |

## Deliverables + Acceptance (per Bagian)
- 04a-c: paste output nyata per command (no fabrikasi) — Acceptance: `fmt 0` `clippy 0` `cargo test 71 passed` `uv pytest ≥9 passed` — AGENTS §1a `Bukti > klaim`
- 04d: `scripts/check-kronos.ps1` (copy `check-9router.ps1` pattern) 20-30 baris — Acceptance: `Invoke-WebRequest http://localhost:8001/health →200` or `mock skip` note
- 04e: docs 3 files sync — Acceptance: `git diff docs/` shows `spec §2[3]` + `api-spec §9` + `tdd-plan §7` updated Phase 02 contract
- 04f: `Accountability Block 01-04` per task `✅/⚠️/🔻/♻️` lengkap — Acceptance: `PM veto if missing ♻️`
- 04g: `seith-phase-gate` + `verification-loop` output paste — Acceptance: `gate PASS` sebelum PR `#NN` ke `main`
- Constraint: `file 200-400` typical (docs), `fn <50` (scripts), `♻️ Refactor: <apa>` wajib per task — §8c Structure & Rapih

## Verification (paste output nyata — no fabrikasi)
```
cargo fmt --check → 0
cargo clippy -p seith-core -p seith-api -p sectors-client -- -D warnings → 0
cargo test -p seith-core -- --nocapture → ≥7 kronos passed (guard, equal, degraded, market tag)
cargo test -- --nocapture → ≥71 passed workspace (64 Phase1 +7 Phase2)
# workdir apps/kronos-sidecar
KRONOS_MOCK=1 uv run ruff check . → 0
KRONOS_MOCK=1 uv run pytest -q --cov → ≥9 passed
gitleaks detect --no-banner --source . → 0
refactor-cleaner scan §8c → fn<50 file200-400 nesting≤4 pass
skill://no-ai-slop detect → pass (Tier-1 warn)
seith-phase-gate → PASS (rust-reviewer ∥ security-reviewer PASS)
```

### Accountability Block
```
✅ Terverifikasi: cargo fmt 0 | clippy 0 | cargo test 71 passed | KRONOS_MOCK=1 uv pytest ≥9 passed | gitleaks 0 | docs sync spec§2 api-spec§9 tdd-plan§7
⚠️ Belum: H4 scoring butuh ER (unblock setelah 02), H3 :8002→9router, H5 hybrid
🔻 Risiko: CI python-kronos masih merah jika fixture 102M di-download → mitigasi: KRONOS_MOCK=1 deterministik + fixture lokal only
♻️ Refactor: extract validate_max_context() shared, split contract vs predictor fn<50, docs sync §7b 7 Zones
```

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead Otak T0 | opencode sini | `seith-market-intelligence`+`seith-kronos`+`verification-loop` | — | final verify, approve PR |
| PM Autonomous | `seith-pm` `.opencode/agents/seith-pm/` | `git-worktree-manager`+gate `fmt/clippy/test`+`senior-pm` | `seith-pm` | **cek 100% siap implementasi + gap 0** — veto jika gate fail |
| Desainer Test | `tdd-guide` | `tdd-guide`+`tdd-workflow` | `tdd-guide` | matrix 9 kasus kronos 512/equal/degraded |
| Reviewer Rust ∥ Security | `rust-reviewer` + `security-reviewer` | `code-reviewer`+`security-review` | `code-reviewer`+`security-reviewer` | dual-review gate |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca verify scan §8c |
| Doc | `doc-updater` | `remember`+`handoff` | `doc-updater` | sync spec/api-spec/tdd-plan |

> §8c: semua agent bertanggung jawab penuh code/logic/testing/structure & rapih 7 Zones — pelanggaran = PM veto + gate FAIL

## Next Session Prompt
`skill://seith-market-intelligence` + `skill://seith-kronos` + `handoff/02-kronos` + `04-verify-e2e.md` + ritual 3Q:
1) Gate MI mana? Pipeline `[3] Kronos ER` done → H4 scoring 0-100 unlock 30% ER.
2) Jebakan? `KRONOS_MOCK=1` di CI + `512 guard dua lapis` + `timeout degraded` + `uv workdir`.
3) Test FAIL apa? `cargo test kronos guard 512`, `mockito timeout→degraded true`, `KRONOS_MOCK=1 pytest 9 passed`.
