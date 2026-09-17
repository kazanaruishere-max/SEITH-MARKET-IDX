# Task 02 — Kronos Real + Scoring 100 (Z1/Z2)

## Goal
100 ticker diprediksi Kronos real (`MOCK=0`) + skor `compute()` 30/20/30/20 + rank/flag final.

## Context
- SSOT: `docs/kronos-notes.md` + `2508.02739v1.pdf` + `crates/seith-core/src/kronos/client.rs PredictBatchInput {market,dfs,x_timestamps,y_timestamps,pred_len}` + `crates/seith-core/src/scoring/calculator.rs compute()` + `skill://seith-kronos`
- Dependensi: 01 done (L2 seeded, normalize lolos)
- Branch: `handoff/13-live-100-e2e/t1-pipeline` — Z1+Z2

## Scope In / Out
In: `:8001 MOCK=0` real + `predict_batch` per chunk (lookback tersedia, guard `first+pred ≤512`) + `z_normalize/qv_percentile/sector_mom/compute` + rank desc + `|Z|` tie-break + flag `|Z|>2`/vol`>2σ`.
Out: agents memo (03), regen JSON final (03), visual (04).

## Todo (`todowrite` WAJIB — AGENTS §8d)
- [ ] Buka todo `in_progress` sebelum Implement; `completed` hanya setelah Verification hijau.

## Bagian — Surgical Breakdown
| Bag | Aksi | Acceptance | Test FAIL |
|---|---|---|---|
| a | `:8001` MOCK=0 (torch CUDA cold 2-3mnt) | `/health model=Kronos-base` bukan mock | fallback diam-diam tanpa `degraded` |
| b | `predict_batch` 100 (chunk 20) `T1.0 top_p0.9 pred_len 20` | `n_pred=20 degraded=false` per ticker | `first+pred>512` tidak 422 di boundary |
| c | `compute()` ER real + QV percentile/sektor + SM | skor 0-100 clamp + komponen tersimpan | black-box tanpa breakdown |
| d | rank + flag | Top5 `|Z|` desc + total flag + reason `z=`/`vol>2σ` | Top5 kosong tanpa fallback debug |

## Deliverables + Acceptance
- 100 prediksi real + skor explainable + rank/flag + `degraded` jujur per ticker
- Test baru: `kronos_real_20_pred` + `scoring_breakdown_sums` (meaningful, no assertion-less)
- `fn<50 file200-400 nesting≤4` + `♻️ Refactor:` wajib

## Verification (paste output nyata — §8c, gate penuh lihat 00-overview DoD)
```
# Tier-0: 9router :20128 NEVER kill/restart — hanya verify
curl :8001/health → {"model":"Kronos-base",...}
cargo test -p seith-core -- --nocapture → pass (baru)
cargo fmt --check → 0 / cargo clippy --all-targets -- -D warnings → 0
cargo test → hijau + gitleaks → 0 + dual-review per DoD 00
```
+ Accountability Block: `✅/⚠️/🔻/♻️`

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T1 | sub-agent | `seith-market-intelligence` + `seith-kronos` + `tdd-workflow` + `verification-loop` | `explore` | Implement→Verify 02 |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | fn<50 + no unwrap |

## Next Session Prompt
`skill://seith-market-intelligence` + `handoff/13` + `02-kronos-scoring.md` + ritual 3Q → `03-agents-regen.md`
