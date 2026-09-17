# Task 04 — Vercel Deploy

## Goal
Vercel accessible `apps/web` klik link `as_of live/degraded` + `pnpm build 4 routes` + README one-liner 3 cmds — harness verifiable before freeze.

## Context
- SSOT: `AGENTS §3c/§8c 7 Zones` + `apps/web/next.config.js rewrites /api/v1/* → 127.0.0.1:8181` dev + `apps/web/app/layout.tsx glass 1360px` + `apps/web/app/page.tsx as_of + degraded` + `apps/web/vercel.json` (new) + `.github/workflows/ci.yml web hard-fail` + `protection.json 6 contexts strict 1 approval enforce` + `AGENTS §4 Tier-0 secrets Redacted ***` + `research/backtest-100.json pinned 2026-09-08 degraded fallback` + `data/seith.db 126KB WAL seed H20`
- Dependensi: 03-pdf-AA-grade done (`DossierPDF 2p AA vector %PDF` + `4 routes build` green)
- Branch: `handoff/22-accessibility` worktree `../seith-wt/handoff-22` — Z2 `apps/web` Z7 `.github, vercel.json, AGENTS, README`

## Scope In / Out
In: `apps/web/vercel.json` Z2 (`{rewrites:[{source:"/api/v1/:path*", destination:"$NEXT_PUBLIC_API_BASE/api/v1/:path*"}]}`) + `apps/web/next.config.js` Z2 prod `NEXT_PUBLIC_API_BASE` env + `AGENTS.md §10 9 skills` Z7 (if not done H21) + `README.md 15sec quick-start 3 cmds` Z5 + `.github/workflows/ci.yml` Z7 `web` hard-fail verify + `pnpm build 4 routes` Z2
> Note: `vercel.json` lives at `apps/web/vercel.json` — physically Z2 (apps/web), governed by Z7 deploy harness (vercel.json is frontend deploy config). Listed once as Z2, not duplicated. Public `/health` stays on Rust API `crates/seith-api` at `:8181/health` (no vercel rewrite for `/health` — direct API liveness, `next.config.js rewrites` only proxies `/api/v1/*`)
Out: `crates/seith-cli` pipeline (H20 done), `apps/kronos-sidecar` 102M warm (gated), `sectors-client` live 25c fetch (gated 22.5), STI `sg` (stretch), `seith-api` external deploy not in 04 (separate infra, API stays `127.0.0.1:8181` dev until infra decision)

## Todo
- [ ] `todowrite in_progress` before; `completed` only after Verify hijau + Block

## Bagian — Surgical Breakdown
| Bag | File | Fn/Struct | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `apps/web/vercel.json` | rewrites | `apps/web/vercel.json: {"rewrites":[{"source":"/api/v1/:path*","destination":"$NEXT_PUBLIC_API_BASE/api/v1/:path*"}]}` Z2 — `vercel --prod` deploys production, `vercel` (no flag) = preview; preview `GET / 200` + `GET /api/v1/ranking?market=id 200` via rewrite `/api/v1/*` — `/health` stays on API `:8181/health` direct, not via vercel — approval eksplisit for prod | `vercel.json` missing `rewrites` |
| b | `apps/web/next.config.js` | env | `env.NEXT_PUBLIC_API_BASE` forwarding + `async rewrites()` `source /api/v1/:path* → destination process.env.NEXT_PUBLIC_API_BASE + /api/v1/:path*` if prod else `127.0.0.1:8181` dev — no `SECTORS_API_KEY` to client | `SECTORS_API_KEY` in client bundle |
| c | `README.md` | quick-start 3 cmds | `curl http://127.0.0.1:8181/health \| jq .data.db` + `cargo run -p seith-cli -- ranking --sector FINANCE --market id \| jq .data.pagination.total` → `25` + `pnpm --dir apps/web dev → :3000 GET / 125k` one-liner section `## Quick Start` 3 cmds copy-paste | README still 15sec without cmds |
| d | `.github/workflows/ci.yml` | web hard-fail | `run: pnpm --dir apps/web install` + `run: pnpm --dir apps/web lint` + `run: pnpm --dir apps/web typecheck` + `run: pnpm --dir apps/web build` each without `|| echo pending` — `grep -c "echo pending"` `0` | `echo pending` still `1` |
| e | `AGENTS.md §10` | 9 skills | `seith-market-intelligence, seith-dev, seith-kronos, seith-data, seith-design, seith-quant, seith-ops, seith-phase-gate, verification-loop` 9 entries + `tdd-workflow/git-worktree-manager` noted internal | grep `seith-data` `0` |
| f | `apps/web` | build | `pnpm --dir apps/web build` → `4 routes (/ /ranking /backtest /dossier/[ticker]) 87.3k shared + First Load JS` `pnpm lint 0 typecheck 0` — verify `pnpm build 2>&1 | grep -c Route` `≥4` with `set -o pipefail` to preserve grep exit status | build `≠4` routes |

## Deliverables + Acceptance
- `gitleaks detect --no-git --config .gitleaks.toml` → 0 findings (value scan, not name scan — `grep SECTORS_API_KEY` only checks name presence, gitleaks checks actual secret values)
- `vercel.json` exists + `next.config.js NEXT_PUBLIC_API_BASE` env read — `grep -c rewrites apps/web/vercel.json` `1` or `next.config.js` `rewrites` contains `NEXT_PUBLIC_API_BASE`
- `pnpm --dir apps/web build | grep -c Route` `≥4` + `lint 0 typecheck 0`
- `grep -c "echo pending" .github/workflows/ci.yml` `0` + `grep -c "seith-data" AGENTS.md` `≥1` + `grep -c "seith-ops" AGENTS.md` `≥1`
- `curl -s http://127.0.0.1:8181/health | jq '.data.db' → {ohlcv:≥400 fundamentals:25}` honest + `curl -s $VERCEL_URL/api/v1/ranking?market=id | jq .success → true` when deployed via rewrite, else local `curl -s http://127.0.0.1:3000/ | grep -c as_of → 1`
- `gitleaks detect --no-git` `0` + `cargo fmt 0 clippy -D 0 test 89+` + `gh pr checks 6 contexts strict` green before squash merge

## Verification
```
grep -n "rewrites" apps/web/vercel.json || grep -n "rewrites" apps/web/next.config.js
grep -n "echo pending" .github/workflows/ci.yml || echo "hard-fail ok"
grep -n "seith-data" AGENTS.md | head -5
pnpm --dir apps/web build | tail -15
curl -s http://127.0.0.1:8181/health | jq '.data.db, .data.schema'
curl -s http://127.0.0.1:8181/api/v1/ranking?market=id&sector=FINANCE | jq '.data.pagination.total'
```

## Peran + Skill
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T2 | sub-agent | `seith-market-intelligence` + `seith-ops` + `verification-loop` | `seith-pm` + `seith-security-reviewer` | Implement→Verify |

## Next
Phase 22: `01→02→03→04→05-security-audit` → `seith-phase-gate` + `verification-loop` → PR `handoff/22-accessibility → main` squash after `handoff/21` merge + `gh pr checks 6` strict green (05 sign-off required, no exit via 04).
