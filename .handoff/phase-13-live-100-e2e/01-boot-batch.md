# Task 01 — Boot + Batch Sectors 100 + Seed L2 (Z1/Z2/Z3)

## Goal
4 servis UP + 100 ticker Sectors ter-fetch (chunks 20×5) + L2 `data/seith.db` ter-seed + normalize gate lolos.

## Context
- SSOT: `AGENTS.md §5 Commands + §3c` + `docs/api-spec.md §7 Sectors Mapping (Authorization + /v2/daily/{symbol}/)` + `crates/sectors-client/src/batch.rs chunks(20)` + `migrations/001_cache.sql` + `.handoff/phase-09-100-backtest/02-backtest-pipeline.md`
- Skill: `skill://seith-market-intelligence` + `skill://seith-kronos` (MOCK toggle) + `tdd-workflow` + `verification-loop`
- Branch: `handoff/13-live-100-e2e` (atau `t1-pipeline`) — Z1+Z2+Z3+Z7

## Scope In / Out
In: `fast-boot.ps1` 4 servis + `fetch_ohlcv_batch` 100 + WAF 403 → `excluded:[{ticker,reason}]` + seed L2 + cleansing gate (OHLC wajib/volume→0/median+insufficient/lookback>512→422).
Out: Kronos predict (02), scoring (02), agents (03), notebook/web (04).

## Todo (`todowrite` WAJIB — AGENTS §8d)
- [ ] Buka todo `in_progress` sebelum Implement; `completed` hanya setelah Verification hijau.

## Bagian — Surgical Breakdown
| Bag | Aksi | Acceptance | Test FAIL |
|---|---|---|---|
| a | `fast-boot.ps1`: 9router cek + `:8001` MOCK=1 smoke dulu + `:8002` + `:8181` | `/health` 4× 200 | servis DOWN tanpa progres 3s |
| b | Smoke BBCA `MOCK=1`: Sectors 200 + `predict_batch` 400→20 mock + dossier | <30s hijau, `degraded:true` jujur | `chartPoints` kosong tapi `degraded:false` |
| c | Approval kredit Founder, lalu batch 100 chunks(20)×5 | ~200 kredit, 403 → `excluded` + fixtures | kredit hangus tanpa L2 seed |
| d | Seed L2 `data/seith.db` WAL + `busy_timeout 3000` | `SELECT count(*) FROM ohlcv` ≥100 | retry bayar kredit lagi |
| e | Normalize gate per ticker | illiquid tidak crash, flag `insufficient_data` jujur | missing OHLC lolos ke Kronos |

## Deliverables + Acceptance
- 4 `/health` 200 + `sqlite3 count ≥100` + `excluded` list jujur + smoke BBCA <30s
- `fn<50 file200-400 nesting≤4 no unwrap` + `cargo fmt/clippy` clean + `♻️ Refactor:` wajib

## Verification (paste output nyata — §8c, gate penuh lihat 00-overview DoD)
```
# Tier-0: 9router :20128 NEVER kill/restart — hanya verify `Invoke-WebRequest :20128/v1/models → 200`
.\scripts\fast-boot.ps1 → ALL UP 20128/8001/8181 (+8002)
curl :8001/health → model mock (smoke) lalu Kronos-base (real, tahap 02)
sqlite3 data/seith.db "SELECT count(*) FROM ohlcv;" → >=100
cargo fmt --check → 0 / cargo clippy --all-targets -- -D warnings → 0
cargo test → hijau + gitleaks → 0 + dual-review per DoD 00
```
+ Accountability Block: `✅ Terverifikasi: <cmd> → <output> / ⚠️ Belum / 🔻 Risiko / ♻️ Refactor: <apa>`

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T1 | sub-agent | `seith-market-intelligence` + `seith-kronos` + `tdd-workflow` + `verification-loop` | `explore` jika debug | Implement→Verify→Refactor 01 |
| PM | `seith-pm` | gate fmt/clippy/test | `seith-pm` | veto jika fail |

## Next Session Prompt
`skill://seith-market-intelligence` + `handoff/13` + `01-boot-batch.md` + ritual 3Q → `02-kronos-scoring.md`
