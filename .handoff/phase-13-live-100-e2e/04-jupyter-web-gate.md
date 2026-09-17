# Task 04 — Jupyter 7 Sel + Web 4 Routes + Gate (Z2/Z5/Z6)

## Goal
Notebook live tereksekusi + Web `:3000` tampilkan data real + gate 04 pola H12 hijau + dual-review PASS.

## Context
- SSOT: `docs/prd.md §7 Journey §8 40/30/30` + `research/money-leak-backtest.ipynb` 7 sel + `research/pyproject.toml plotly==5.24.1` + `apps/web` 4 routes + `.handoff/phase-11-e2e-testing/02-cross-sector-5.md`
- Dependensi: 03 done (`backtest-100.json` live) — STOP jika belum: `python -c len(items)==100`
- Branch: `handoff/13-live-100-e2e/t2-visual` — Z2+Z5 (file-disjoint vs T1)

## Scope In / Out
In: `nbconvert --execute → html/png` di `research/.venv` + `:3000` dev 4 routes data real + TopLeaks/chart400+20/PDF sinkron + gate + dual-review + merge.
Out: pipeline logic (01-03), Freeze H6, video.

## Todo (`todowrite` WAJIB — AGENTS §8d)
- [ ] Buka todo `in_progress` sebelum Implement; `completed` hanya setelah Verification hijau.

## Bagian — Surgical Breakdown
| Bag | Aksi | Acceptance | Test FAIL |
|---|---|---|---|
| a | Gate STOP: JSON live? | `len(items)==100` + `as_of` baru | T2 pakai JSON hash lama |
| b | `nbconvert --execute` 7 sel | 0 error + `html/png` + `grep plotly kronos-sidecar →0` | plotly bocor ke sidecar |
| c | `:3000` 4 routes (`/ /ranking /dossier/[ticker] /backtest`) | data real + chart actual+forecast + PDF sinkron | 404 rewrites / data statik |
| d | Gate + dual-review + merge | `fmt0 clippy0 test160+ pnpm0 uv17` + `rust ∥ security` PASS + squash `main` + hapus worktree | PM veto tanpa jejak |

## Deliverables + Acceptance
- `html/png` notebook + web 4 routes build + disclaimer `bukan rekomendasi investasi` tiap view + PM `PASS veto N` + merge `main`
- `design-taste-frontend` Bloomberg `#0B0E14` + `no-ai-slop` Tier-1 warn + `♻️ Refactor:` wajib

## Verification (paste output nyata — §8c)
```
# Tier-0: 9router :20128 NEVER kill/restart — hanya verify `Invoke-WebRequest :20128/v1/models → 200`
cd research && uv run jupyter nbconvert --execute money-leak-backtest.ipynb --to html → 0
pnpm --dir apps/web lint → 0 / typecheck → 0 / test → 6+ / build → 4 routes
cargo fmt --check → 0 / cargo clippy --all-targets -- -D warnings → 0 / cargo test → 160+
cd apps/analysis && uv run pytest -q → 17 passed
grep -r SECTORS_API_KEY apps/web → 0 / grep -r plotly apps/kronos-sidecar → 0
```
+ Accountability Block: `✅/⚠️/🔻/♻️`

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T2 | sub-agent | `seith-market-intelligence` + `tdd-workflow` + `verification-loop` | `explore` | Implement→Verify 04 |
| Designer FE | `design-taste-frontend` | `design-taste-frontend` | — | audit Bloomberg + recharts ±2σ |
| Reviewer Rust/Security | `code-reviewer`/`security-reviewer` | `code-reviewer`/`security-review` | paralel | dual PASS |
| PM | `seith-pm` | `git-worktree-manager` + gate | `seith-pm` | veto jika fail |

## Next Session Prompt
`skill://seith-market-intelligence` + `handoff/13` + `04-jupyter-web-gate.md` + ritual 3Q → Freeze H6
