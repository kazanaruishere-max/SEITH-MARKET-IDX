# Handoff — SEITH (PM Autonomous)

**Owner:** `seith-pm` (`.opencode/agents/seith-pm/`) — autonomous orkestrator.
- T0 (Sesi Utama, sini) = Otak: tulis/approve `phase-NN-topic/00-overview.md`, jaga single narrative `AGENTS.md → docs/*`.
- PM = generate `phase-NN-topic/` dari `phase-template/`, buat branch `handoff/NN-topic` + worktree `../seith-wt/handoff-NN-*`, assign T1/T2 slice, enforce gate, **veto merge ke `main` jika fail**.
- T1/T2 = Implement → Verify (TDD), WAJIB `skill://seith-market-intelligence` di awal + `verification-loop` di akhir + Accountability Block + `♻️ Refactor:`.

Branch tetap flat `handoff/NN-topic` (AGENTS §8b), docs ter-organisasi per phase:
```
.handoff/
 ├─ README.md
 ├─ handoff-NN-template.md          ← legacy flat template (backward compat)
 ├─ phase-template/                 ← template phase-folder baru
 │   ├─ 00-overview.md              ← Goal phase, WBS, dependency H2-H5, DoD phase, peran+skill+sub-agent
 │   └─ NN-task.md                  ← per task slice
 └─ phase-NN-topic/                 ← 1 fase = 1 folder aktif
     ├─ 00-overview.md
     ├─ 01-market-enum-models.md
     ├─ 02-cache-trait-composite.md
     ├─ 03-sectors-batch-client.md
     ├─ 04-cleansing-gate-normalize.md
     └─ 05-envelope-verification.md
```

Setiap phase `00-overview.md` wajib: Goal 1 kalimat, Context `AGENTS→docs/*`, Scope In/Out, WBS, Dependency H2-H5, DoD phase, Peran+Skill+Sub-agent matrix, Branch/Worktree, Verification, Risks, Next Session Prompt.
Setiap task `NN-*.md` wajib: Goal, Context, Scope In/Out, Deliverables + Acceptance, Verification (`cargo fmt --check && cargo clippy -- -D warnings && cargo test` + `uv/pnpm` jika sentuh), Next Session Prompt.

Lifecycle: `worktree → implement TDD red-green per task → refactor-cleaner → cargo gate → dual-review (rust-reviewer ∥ security-reviewer) → seith-phase-gate + verification-loop → Lead squash-merge → hapus worktree`.

Cadence via PM:
- Tiap commit: `doc-updater` cek docs drift
- Tiap fase: `seith-phase-gate` (dual-review)
- Tiap minggu: audit drift repo-vs-docs + laporan founder
- Pra-freeze: `security-reviewer` MANDATORY + `architect` sign-off + `scripts/freeze-check.sh` + video 1m/3m

PM tidak putuskan strategis (Founder) atau stack (Lead) — hanya orkestrasi + blokir jika gate fail. Timeline: 19 Aug open → 22 Sep roster lock → 30 Sep 23:59 WIB freeze.
