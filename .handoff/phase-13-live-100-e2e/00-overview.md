# Phase 13 — Live 100 E2E (Sectors → Kronos Real → Agents → Jupyter → Web) — Overview

## Goal
Ganti `research/backtest-100.json` statik-hash menjadi hasil live 100 ticker (`Sectors batch → Kronos MOCK=0 → scoring → Top-10 synthesize → Jupyter → Web`), lolos gate sebelum Freeze H6.

## Context
- SSOT: `AGENTS.md §3c Seven Zones + §5 Commands + §7 DoD + §8d Todo + §8c Ownership` + `docs/prd.md §5 Pipeline 8 §8 40/30/30` + `docs/spec.md §2 Pipeline §4 Scoring` + `docs/api-spec.md §7 Sectors Mapping + §9 sidecars + §10 9router` + `docs/tdd-plan.md §6+§9` + `docs/kronos-notes.md` + `docs/notes/00-readme.md` ritual 3Q
- Skill wajib: `skill://seith-market-intelligence` awal session T1/T2 + `skill://no-ai-slop` Tier-1 + `skill://seith-kronos` (MOCK toggle) + `skill://verification-loop` akhir + `skill://seith-phase-gate` + `skill://git-worktree-manager`
- Prereq DONE: `main 8283c1f` = H12 merged (backend real + web + 3 fix: BMRI peer 1→5, equity date valid, degraded jujur) — `cargo 160 pnpm 6/6 uv 17` + dual-review PASS veto N + live probe `:8181` BMRI5/equity12/BBCA-degraded
- Desain acuan: `.handoff/phase-09-100-backtest/02-backtest-pipeline.md` (docs-only, belum live) + `.handoff/phase-11-e2e-testing/02-cross-sector-5.md` (BBCA→5 pola validasi)
- Keputusan founder 2026-09-13: Kronos `MOCK=0` real (102.3M torch CUDA cold 2-3mnt), memo LLM Top-10 saja (90 template), live-100 setelah merge H12, kredit ~200 butuh approval sebelum batch
- Zona: Z1 `sectors-client batch + seith-core scoring/normalize + seith-api handlers` + Z2 `kronos-sidecar :8001 + analysis :8002 + web :3000` + Z3 `data/seith.db L2 seed` + Z4 `tests/fixtures` + Z5 `research/universe-100.json + backtest-100.json + money-leak-backtest.ipynb` + Z6 `.handoff/phase-13-live-100-e2e` + Z7 `scripts/fast-boot.ps1` — cross-zona import dilarang §3c, `9router :20128` NEVER kill

## Scope In / Out
In: Z1 batch/normalize/scoring wiring live + Z2 `:8001 MOCK=0 + :8002 /synthesize Top-10 + :3000 4 routes` + Z3 seed L2 + Z5 regen JSON + notebook `nbconvert` + Z6 handoff 00-04 + Z7 `fast-boot` reuse
Out: scoring formula baru (locked 30/20/30/20), CLI stub ranking (catat, bukan jalur visualisasi), STI `market=sg` (stretch H5), Freeze H6, video 1m/3m, `vendor/` read-only, `push --force`

## WBS — Task Breakdown
| # | Task file | Slice | Depedensi |
|---|---|---|---|
| 01 | `01-boot-batch.md` | T1: boot 4 servis + batch Sectors 100 chunks(20)×5 + seed L2 + normalize gate | — |
| 02 | `02-kronos-scoring.md` | T1: `predict_batch` real + `compute()` + rank/flag | 01 |
| 03 | `03-agents-regen.md` | T1: `/synthesize` Top-10 + regen `backtest-100.json` | 02 |
| 04 | `04-jupyter-web-gate.md` | T2: `nbconvert` 7 sel + `:3000` 4 routes + gate + dual-review | 03 |

Dependensi antar-fase: `H12 8283c1f merged → H13 live-100 (01→02→03→04) → H6 Freeze → Submit 30 Sep`. Cross-zona dilarang §3c. Kredit ~200 approval Founder sebelum 01-tahap-B.

## Todo (`todowrite` WAJIB — AGENTS §8d)
- 1 task file = 1 todo item, exactly-one `in_progress`, update realtime.
- `completed` hanya setelah Verification hijau + Accountability Block. PM veto jika tanpa jejak.

## Definition of Done — Phase 13
1. `cargo fmt --check → 0` + `cargo clippy --all-targets -- -D warnings → 0` per crate
2. `cargo test → 160+ passed` (test baru live meaningful, no assertion-less) + `pnpm lint/typecheck/test/build → 0/0/6+/4-routes` + `uv pytest analysis → 17` + `research nbconvert → 0 error` + disclaimer `bukan rekomendasi investasi` di setiap insight view (Tier-0)
3. `refactor-cleaner` pass: `fn<50 file200-400 nesting≤4 no dead code` + `♻️ Refactor:` per task
4. Dual-review `rust-reviewer ∥ security-reviewer` PASS + `seith-phase-gate` + `gitleaks → 0`
5. `grep -r SECTORS_API_KEY apps/web → 0` + `grep -r plotly apps/kronos-sidecar → 0`
6. Data live terbukti: `sqlite3 count ohlcv ≥100`, `backtest-100.json` 100 items hasil pipeline (bukan hash), equity 12 tanggal valid, Top5 `|Z|` desc, `:8001 model=Kronos-base` (bukan mock), 10 memo LLM + 90 template + `degraded` jujur
7. Docs sinkron + `doc-updater` no-drift + 7 Zones map benar
8. Accountability `✅/⚠️/🔻/♻️` per task + output nyata no fabrikasi + `todowrite` trace ada

## Peran + Skill + Sub-agent Matrix
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead T0 | opencode sini | `seith-market-intelligence` + `verification-loop` | — | Understand→Plan→Document, approve 00, verify delegasi |
| Founder | User | — | — | approve kredit ~200 + go-live/freeze |
| PM | `seith-pm` | `git-worktree-manager` + gate fmt/clippy/test | `seith-pm` | orkestrasi handoff-13 + **veto merge jika gate/reviewer/zone fail** |
| Eksekutor T1 | sub-agent | `seith-market-intelligence` + `tdd-workflow` + `seith-kronos` + `verification-loop` | `explore` | 01+02+03 pipeline (file-disjoint vs T2) |
| Eksekutor T2 | sub-agent | `seith-market-intelligence` + `tdd-workflow` | `explore` | 04 visual (jalan setelah 03) |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | Z1 wiring live |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | key server-only, no log secret, disclaimer always |
| Refactor | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | Boy Scout §5b pasca tiap task |
| Doc | `doc-updater` | `remember`+`handoff`+`no-ai-slop` | `doc-updater` | sinkron api-spec/tdd-plan tiap commit |

## Branch & Worktree (AGENTS §8b + §3c)
- Branch: `handoff/13-live-100-e2e` dari `main 8283c1f` — `git worktree add ../seith-wt/handoff-13 -b handoff/13-live-100-e2e 8283c1f`
- Paralel opsional: `handoff/13-live-100-e2e/t1-pipeline` (01-03) vs `handoff/13-live-100-e2e/t2-visual` (04, setelah 03) — file-disjoint aman
- Tiap session wajib `skill://seith-market-intelligence` + ritual 3Q + `todowrite` exactly-one `in_progress`
- Commit: `feat(live-100): batch+seed` → `feat(live-100): kronos+scoring` → `feat(live-100): agents+regen` → `feat(live-100): jupyter+web+gate` → squash-merge `main` → hapus worktree

## Verification (paste output nyata)
```
cargo fmt --check → 0
cargo clippy --all-targets -- -D warnings → 0
cargo test → 160+ passed
pnpm --dir apps/web lint → 0 / typecheck → 0 / test → 6+ / build → 4 routes
cd apps/analysis && uv run pytest -q → 17 passed
cd research && uv run jupyter nbconvert --execute money-leak-backtest.ipynb --to html → 0
sqlite3 data/seith.db "SELECT count(*) FROM ohlcv;" → >=100
curl :8001/health → model Kronos-base (bukan mock)
curl :8181/api/v1/anomalies?market=id&minZ=2.0&pageSize=5 → Top5 |Z| desc
grep -r SECTORS_API_KEY apps/web → 0
grep -r plotly apps/kronos-sidecar → 0
```

## Risks & Mitigasi
- Sectors `/v2/daily` balikin ~20 baris bukan 400 — mitigasi terima lookback pendek + `insufficient_data:true`, deteksi `rows count per ticker`
- Torch cold 2-3mnt + `:8002` belum pernah boot sukses — mitigasi `MOCK=1` smoke 1 ticker <30s dulu, deteksi `curl :8001/health model`
- 200 kredit hangus jika jebol tengah — mitigasi BBCA→5→100 + seed L2 duluan (retry gratis), deteksi `excluded` + `sqlite3 count`
- `9router :20128` ikut mati jika blanket kill node — mitigasi TIDAK PERNAH kill, deteksi `Invoke-WebRequest :20128/v1/models → 200`
- T2 jalan sebelum JSON regen — mitigasi STOP gate: `python -c len(items)==100`, deteksi `as_of` baru

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/13-live-100-e2e` + task `01-boot-batch.md` → `02` → `03` → `04` + ritual 3Q + `verification-loop` + `seith-pm` gate MANDATORY
