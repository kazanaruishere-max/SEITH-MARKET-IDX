# Handoff — SEITH (PM Autonomous)

**Owner:** `seith-pm` (`.opencode/agents/seith-pm/`) — autonomous orkestrator.
- T0 (Sesi Utama, sini) = Otak: tulis/approve `handoff-NN-topic.md`, jaga single narrative `AGENTS.md → docs/*`.
- PM = generate `handoff-NN-topic.md` dari template, buat branch `handoff/NN-topic` + worktree `../seith-wt/handoff-NN-*`, assign T1/T2 slice, enforce gate, **veto merge ke `main` jika fail**.
- T1/T2 = Implement → Verify (TDD), WAJIB `skill://seith-market-intelligence` di awal + `verification-loop` di akhir + Accountability Block.

Setiap doc wajib: Goal, Context, Scope In/Out, Deliverables, Verification (`cargo fmt --check && cargo clippy -- -D warnings && cargo test` + `uv/ pnpm` jika sentuh), Next Session Prompt.
Branch `handoff/NN-topic`, lifecycle `worktree → implement → gate → dual-review (rust-reviewer ∥ security-reviewer) → Lead squash-merge → hapus worktree`.

Cadence via PM:
- Tiap commit: `doc-updater` cek docs drift
- Tiap fase: `seith-phase-gate` (dual-review)
- Tiap minggu: audit drift repo-vs-docs + laporan founder
- Pra-freeze: `security-reviewer` MANDATORY + `architect` sign-off + `scripts/freeze-check.sh` + video 1m/3m

PM tidak putuskan strategis (Founder) atau stack (Lead) — hanya orkestrasi + blokir jika gate fail. Timeline: 19 Aug open → 22 Sep roster lock → 30 Sep 23:59 WIB freeze.
