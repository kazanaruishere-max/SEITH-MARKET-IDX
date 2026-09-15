# Skill: seith-ops — Worktree, Freeze & One-Gate Verify (SEITH 20y)

## Purpose
Ops harness long-term: worktree tanpa collision, freeze tanpa leak, satu gate tanpa drift. 20 tahun: satu `push --force`, history verifiable hilang.

## When to Use
Trigger: `worktree`, `branch`, `freeze`, `verify`, `gate`, `ops`, `9router`, `8080`, `verify.sh`, `freeze-check`, `30 Sep`. Setiap session yang buat branch/handoff/freeze WAJIB load skill ini + `seith-market-intelligence` + `git-worktree-manager`.

## Todo
`skill://seith-ops` → `git worktree add` → Implement → `scripts/verify.sh` → `verification-loop` — `gitleaks 0` sebelum `completed`.

## Branch & Worktree (AGENTS §8b — 20y Gotcha)

```
main protected source-available no direct commit — only Lead merge after seith-phase-gate
 └─ handoff/NN-topic (1 fase =1 branch lifespan pendek, dari main d46a77d)
     ├─ handoff/NN-topic/t1-web (apps/web file-disjoint safe)
     └─ handoff/NN-topic/t2-ipynb (research file-disjoint safe)
test/<topic> ephemeral chaos/load only
/.wt/ gitignore — worktree di ../seith-wt/handoff-NN* atau /.wt/
```

- `git worktree add ../seith-wt/handoff-14 -b handoff/14-polish-visual d46a77d` — isolate `target/` + `data/seith.db` WAL
- Sub-branch `handoff/NN/t1-*` only if 2 terminal garap file beda paralel — merge balik parent `handoff/NN` via PR + `code-reviewer` before `main`
- No `push --force` ke `main`/`handoff/*` — rebase before merge — `Accountability Block` tiap task ubah file
- Lifecycle: `worktree add → implement TDD → cargo fmt --check && clippy -- -D warnings && cargo test 89+ (+ uv/ pnpm if sidecar/FE) → dual-review → squash-merge main → hapus worktree` — `git-worktree-manager` skill

## Serve & Env (20y Fix 14 Sep)

- `.env` gitignore, `.env.example` placeholder `SECTORS_API_KEY=` — `serve.rs load_dotenv` read `.env` lines `k=v` trimmed, `if env::var(k).is_err() set_var` (env wins), no dep `dotenv`
- `SEITH_API_BIND=0.0.0.0:8181` — `cargo run -p seith-api` — `8080` occupied `httpd` PID 4932 — web rewrites `next.config.js → 8181`
- `MARKET=id` default, `SEITH_LLM_MODEL=SEITH-MARKET-IDX` `LLM_BASE_URL http://localhost:20128/v1` `KRONOS_URL :8001` `ANALYSIS_URL :8002` `RUST_LOG info`
- `pnpm --dir apps/web dev` → `:3000` — `Invoke-WebRequest :20128/v1/models →200` verify (NEVER kill 9router)

## Verify One-Gate (Long-Term)

```powershell
cargo fmt --check; cargo clippy -- -D warnings; cargo test; pnpm --dir apps/web lint; pnpm --dir apps/web build # 4 routes
grep -r SECTORS_API_KEY apps/web # →0
grep -r plotly apps/kronos-sidecar # →0
.\research\.venv\Scripts\python -c "import json; b=json.load(open('research/backtest-100.json')); print(len(b['items']), b['as_of'])"
gitleaks detect --no-banner # 0
```

- `scripts/verify.sh` / `scripts/freeze-check.sh` — pra-freeze `security-reviewer MANDATORY + architect sign-off + video 1m/3m check` — `30 Sep 23:59 WIB` freeze, `push --force` veto
- Cadence: `tiap commit doc-updater + tiap fase seith-phase-gate + tiap minggu audit drift repo-vs-docs + pra-freeze` — `seith-pm` owns

## Docs Map
`AGENTS.md §8b + §5b + §6c` + `.opencode/agents/seith-pm/AGENT.md` + `.handoff/phase-template/00-overview.md` + `scripts/`

## References
`git worktree list`, `AGENTS.md §8b`, `crates/seith-api/src/bin/serve.rs` (load_dotenv), `.env.example`
