# Task 04 — Verify E2E + CI Green + Docs Sync

## Goal
Kunci `cargo fmt/clippy 0 + cargo test pass + uv pytest httpx_mock 9 pass + CI python-analysis strict + docs spec/api-spec/tdd-plan sync` — Phase 03 DONE verifiable no gap.

## Context
- SSOT: `AGENTS.md §7 DoD 10 poin + §5b Boy Scout §5 + §6c Anti Slop §8c 7 Zones` + `docs/spec.md §2[6] §7b` + `docs/api-spec.md §9` + `docs/tdd-plan.md §3/7` + `docs/notes/00-readme.md ritual 3Q` + `skill://seith-market-intelligence` + `skill://seith-dev` + `skill://verification-loop` + `skill://no-ai-slop` + `skill://seith-phase-gate`
- Dependensi: `01` contract + `02` agent 3 lite + `03` bridge (semua impl selesai)
- Branch: `handoff/03-analysis` (parent, setelah T1+T2 merge balik) — final verify sebelum PR ke `main`
- Gate: `cargo fmt --check 0` + `clippy -- -D warnings 0` + `cargo test -- --nocapture pass` + `uv run pytest -q --cov pass` + `refactor-cleaner fn<50 file200-400 nesting≤4` + `gitleaks 0` + `seith-phase-gate` dual-review pass + `Accountability Block 00-04` + `docs drift 0`
- 9router Tier-0 NEVER kill — CI 100% httpx_mock, no real LLM call

## Scope In / Out
In: Zona 1 `crates/seith-core/src/analysis/*` (verify tests) + Zona 2 `apps/analysis` (verify pytest) + Zona 5 `docs/spec.md + api-spec.md + tdd-plan.md` sync (tambah `analysis-bridge critical 5)`) + Zona 6 `.handoff/phase-03-analysis/00-overview + 01-04 *.md` final polish + Zona 7 `.github/workflows/ci.yml` `python-analysis` strict (mirror python-kronos hapus `|| echo`) + `scripts/check-9router.ps1` liveness — 7 Zones map
Out: Impl baru fitur — hanya `verify + docs sync + gate` — no new logic

## Bagian — Surgical Breakdown (1 bagian = 1 verify slice <50 baris)
| Bag | File/Step | Verify | Acceptance | Test FAIL |
|---|---|---|---|---|
| 04a | `cargo fmt + clippy` | `cargo fmt --check →0` `cargo clippy -p seith-core -p seith-api -p sectors-client -- -D warnings →0` per crate | `fmt 0 clippy 0` no `unwrap` | `clippy warn→fail CI` |
| 04b | `cargo test Rust` | `cargo test -p seith-core -- --nocapture` analysis guard + `cargo test -- --nocapture` workspace | `≥7 analysis tests passed` + `workspace 71+7=78 passed` meaningful | `ticker regex fail` `degraded false` |
| 04c | `uv pytest Python` | `cd apps/analysis && uv run ruff check . →0 && uv run pytest -q --cov → pass` httpx_mock 9router 9 kasus | `≥14 pytest passed` `contract 5 + three_agent 9` fast <3s | `mock httpx import err` `9router real call leak` |
| 04d | `CI & liveness` | `gh workflow view ci.yml` `python-analysis` job strict (hapus `\|\| echo`) + `scripts/check-9router.ps1` `GET :20128/v1/models →200` + `check-kronos.ps1 :8001/health` + `check-analysis.ps1 :8002/health` (jika dibuat, mirror) | `CI contexts 6 strict` + `9router 200 + kronos 200` | `CI python-analysis merah` |
| 04e | `docs sync` | `doc-updater` sync `spec §2[6] 3-agent Fund/Tech/Synth template fallback` + `api-spec §9` bridge timeout15s + `tdd-plan §3/7` analysis-bridge critical 5) | `docs diff 0` no drift `phase-02→03` H4 scoring dependency `research memo` | `spec drift → PR checklist fail` |
| 04f | `refactor + gitleaks + no-ai-slop` | `refactor-cleaner scan §8c` `fn<50 file200-400 nesting≤4 no dead code` + `gitleaks detect --no-banner →0` + `skill://no-ai-slop detect → pass` | `scan pass` + `♻️ Refactor:` per task 01-04 | `file 600 bars → veto` `banned word delve→warn` |
| 04g | `seith-phase-gate` | dual-review `rust-reviewer ∥ security-reviewer` + `seith-phase-gate` protocol — `00-overview` DoD 10 poin check + PM gap audit | `gate PASS` + `PM 100% siap implementasi` | `gate FAIL → revert` |

## Deliverables + Acceptance (per Bagian)
- 04a-c: paste output nyata per command (no fabrikasi) — Acceptance: `fmt 0` `clippy 0` `cargo test 78 passed` `uv pytest ≥14 passed` — AGENTS §1a `Bukti > klaim`
- 04d: `scripts/check-9router.ps1` sudah ada dari H00 + opsional `check-analysis.ps1` 20 baris copy pattern `check-kronos.ps1` (`Invoke-WebRequest http://localhost:8002/health →200` + fallback `degraded:true`) — Acceptance: `9router 200 + analysis 200` or `mock skip` note
- 04e: docs 3 files sync — Acceptance: `git diff docs/` shows `spec §2[6]` + `api-spec §9` + `tdd-plan §3` updated Phase 03 contract
- 04f: `Accountability Block 01-04` per task `✅/⚠️/🔻/♻️` lengkap — Acceptance: `PM veto if missing ♻️`
- 04g: `seith-phase-gate` + `verification-loop` output paste — Acceptance: `gate PASS` sebelum PR `#NN` ke `main`
- Constraint: `file 200-400` typical (docs), `fn <50` (scripts), `♻️ Refactor: <apa>` wajib per task — §8c Structure & Rapih

## Verification (paste output nyata — no fabrikasi)
```
cargo fmt --check → 0
cargo clippy -p seith-core -p seith-api -p sectors-client -- -D warnings → 0
cargo test -p seith-core -- --nocapture → ≥7 analysis passed (ticker regex, market Id/Sg, degraded, disclaimer, template)
cargo test -- --nocapture → ≥78 passed workspace (71 Phase1+2 +7 Phase3)
# workdir apps/analysis
uv run ruff check . → 0
uv run pytest -q --cov → ≥14 passed
# 9router Tier-0 NEVER kill — CI tidak boleh real call
grep -r "httpx.AsyncClient" tests/ | grep -v "MockTransport\|MockRouter" → 0 leak
gitleaks detect --no-banner --source . → 0
refactor-cleaner scan §8c → fn<50 file200-400 nesting≤4 pass
skill://no-ai-slop detect → pass (Tier-1 warn)
seith-phase-gate → PASS (rust-reviewer ∥ security-reviewer PASS)
```

### Accountability Block
```
✅ Terverifikasi: cargo fmt 0 | clippy 0 | cargo test 78 passed | ruff 0 | pytest ≥14 passed | gitleaks 0 | docs sync spec§2[6] api-spec§9 tdd-plan§3
⚠️ Belum: H4 scoring butuh ER + research memo (unblock setelah 02+03), H5 hybrid
🔻 Risiko: 9router real call di CI → mitigasi: httpx_mock 100% + grep zero leak + check-9router.ps1 pre-dossier
♻️ Refactor: extract validate_ticker(), split contract vs agent fn<50, docs sync §7b 7 Zones
```

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead Otak T0 | opencode sini | `seith-market-intelligence`+`seith-dev`+`verification-loop` | — | final verify, approve PR |
| PM Autonomous | `seith-pm` `.opencode/agents/seith-pm/` | `git-worktree-manager`+gate `fmt/clippy/test`+`senior-pm` | `seith-pm` | **cek 100% siap implementasi + gap 0** — veto jika gate fail |
| Desainer Test | `tdd-guide` | `tdd-guide`+`tdd-workflow` | `tdd-guide` | matrix 9 kasus analysis httpx_mock 9router |
| Reviewer Rust ∥ Security | `rust-reviewer` + `security-reviewer` | `code-reviewer`+`security-review` | `code-reviewer`+`security-reviewer` | dual-review gate |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca verify scan §8c |
| Doc | `doc-updater` | `remember`+`handoff` | `doc-updater` | sync spec/api-spec/tdd-plan |

> §8c: semua agent bertanggung jawab penuh code/logic/testing/structure & rapih 7 Zones — pelanggaran = PM veto + gate FAIL

## Next Session Prompt
`skill://seith-market-intelligence` + `skill://seith-dev` + `handoff/03-analysis` + `04-verify-e2e.md` + ritual 3Q:
1) Gate MI mana? Pipeline `[6] 3-agent research memo` done → H4 scoring 0-100 unlock 30% QV+research bonus.
2) Jebakan? `httpx_mock 100%` di CI + `9router Tier-0 NEVER kill` + `template numeric dua lapis` + `disclaimer always inject` + `uv workdir`.
3) Test FAIL apa? `cargo test analysis ticker regex 422`, `mockito timeout→degraded true`, `httpx_mock 9router 503→template+disclaimer`.
