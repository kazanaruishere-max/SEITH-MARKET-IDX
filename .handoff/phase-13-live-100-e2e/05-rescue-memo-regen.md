# Task 05 — Rescue Memo Top-10 + Regen backtest-100.json (Z1/Z2/Z5)

## Goal
Selamatkan task 03 yang spinning: 10 memo LLM lengkap + `research/backtest-100.json` diregen dari hasil live (98 skor + Top-10 memo), skema tetap.

## Context
- SSOT: `03-agents-regen.md` (goal + acceptance asli) + `docs/api-spec.md §9 sidecars + §10 9router` + `apps/analysis/app/agents/_chat.py` + `apps/analysis/app/main.py /synthesize` + `research/scores_98.json` + `research/memos_top10.json`
- Fakta 2026-09-13: T1 session lama spinning di 9router probe loop (7x: `probe_synth→chat→chat2→raw→oc→models→nem`, 12:25→13:45) + `fetch_memos_top10.py` (13:25) → `memos_top10.json` 5.5KB (16:20, partial) + `fetch_missing_memos.py` (16:23, retry) + `regen_backtest_100.py` (15:49, belum jalan — `backtest-100.json` masih static 09:07).
- State branch: `handoff/13-live-100-e2e` di `6027a8b` (01 batch+seed + 02 kronos+scoring committed, 98 ticker scored — 2 excluded via cleansing gate). Worktree lama `../seith-wt/handoff-13` KOTOR (4 modified + 12 untracked) — JANGAN dilanjutkan, buat worktree BARU dari `6027a8b`.
- Tier-0: `9router :20128` NEVER kill/restart — hanya verify `Invoke-WebRequest :20128/v1/models → 200`. Disclaimer `bukan rekomendasi investasi` tiap memo. No auto trade.
- Skill: `skill://seith-market-intelligence` awal session + `tdd-workflow` + `verification-loop` akhir.

## Scope In / Out
In: diagnosa 1x format 9router vs `_chat.py` parsing + fix surgical 1x (bukan probe ke-8) + re-run missing memo Top-10 + `regen_backtest_100.py` jalan + verify 100 items + commit `feat(live-100): agents+regen`.
Out: notebook (04), web visual (04), scoring formula baru (locked 30/20/30/20), Freeze H6, video.

## Todo (`todowrite` WAJIB — AGENTS §8d)
- [ ] Buka todo `in_progress` sebelum Implement; `completed` hanya setelah Verification hijau.

## Bagian — Surgical Breakdown
| Bag | Aksi | Acceptance | Test FAIL |
|---|---|---|---|
| a | Worktree baru: `git worktree add ../seith-wt/handoff-13r -b handoff/13-rescue-memo handoff/13-live-100-e2e` (dari `6027a8b` bersih) | `git log --oneline -1 → 6027a8b`, `git status` bersih | lanjut di worktree kotor lama |
| b | Fakta memo: baca `research/memos_top10.json` (copy dari worktree lama) → hitung OK vs missing + baca error terakhir | list eksplisit: N/10 OK, missing = [ticker...], error = <pesan> | tebak tanpa baca file |
| c | Fakta 9router: `Invoke-WebRequest :20128/v1/models → 200` + 1x call `/synthesize` Top-1 manual, catat response format aktual | format aktual terdokumentasi (field names, nesting) | probe script baru ke-8 |
| d | Fix surgical 1x di `apps/analysis/app/agents/_chat.py` parsing SESUAI format aktual (c) | `/synthesize` Top-10 → 10 memo, `fn<50`, no unwrap | refactor lebar / ubah template |
| e | Re-run missing memo saja (bukan semua) → `memos_top10.json` 10/10 + tiap memo ada `bukan rekomendasi investasi` | 10/10 memo + disclaimer | 90 non-top ikut LLM (boros) |
| f | Jalan `research/regen_backtest_100.py` → verify `len(items)==100` + `as_of` baru + equity 12 tanggal valid `%Y-%m-%d` | 100 items live + skema tetap (`items/metrics/equity/excluded/degraded/disclaimer`) | skema berubah tanpa `SCHEMA_VERSION` / `08-36` overflow |
| g | Gate + commit `feat(live-100): agents+regen` di branch rescue → PR/merge ke `handoff/13-live-100-e2e` setelah PM gate | `fmt0 clippy0 test160+` + `gitleaks 0` | merge tanpa gate |

## Deliverables + Acceptance
- `backtest-100.json`: 100 live + equity 12 valid + `excluded` jujur (2 ticker + reason) + `degraded` jujur + `bukan rekomendasi investasi`
- `memos_top10.json`: 10/10 memo LLM (bukan template)
- Test baru: `regen_100_items_live` + `top10_memo_llm_rest_template` (meaningful, no assertion-less)
- `fn<50` + `♻️ Refactor:` wajib

## Verification (paste output nyata — §8c, gate penuh lihat 00-overview DoD)
```
# Tier-0: 9router :20128 NEVER kill/restart — hanya verify
Invoke-WebRequest http://localhost:20128/v1/models → 200
curl :8002/health → nine_router up
curl :8181/api/v1/tickers/<TOP1>/dossier?market=id&lang=id → memo LLM + peer5 + `bukan rekomendasi investasi`
python -c "import json;v=json.load(open('research/backtest-100.json'));print(len(v['items']),v['as_of'])"
cargo fmt --check → 0 / cargo clippy --all-targets -- -D warnings → 0 / cargo test → 160+
gitleaks → 0 + dual-review per DoD 00
```
+ Accountability Block: `✅/⚠️/🔻/♻️`

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Rescue T1 | sub-agent fresh | `seith-market-intelligence` + `tdd-workflow` + `verification-loop` | `explore` jika debug | Implement→Verify 05 |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | no secret di memo/log |
| PM | `seith-pm` | gate fmt/clippy/test | `seith-pm` | veto merge jika fail |

## Fakta Warisan Session Lama (jangan diulang)
- 7 probe scripts (`probe_synth/chat/chat2/raw/oc/models/nem.py`) = trial-error format 9router tanpa baca response 1x tuntas. Pelajaran: baca 1 response aktual → fix 1x, bukan probe N+1.
- `fetch_missing_memos.py` (16:23) = bukti partial memo; lanjutkan dari situ (baca hasilnya), jangan fetch ulang semua Top-10 dari nol (hemat kredit/waktu).
- Servis yang UP saat rescue ditulis: `:8181` PID 12580 (09:19), `:8001` MOCK=0 PID 11672 (15:30), `:8002` PID 33556 (17:19). Re-verify sebelum mulai — jika mati, `scripts/fast-boot.ps1` reuse-binary (JANGAN blanket kill node → 9router ikut mati).
- File warisan berguna (copy dari `../seith-wt/handoff-13/research/` ke worktree baru): `scores_98.json`, `memos_top10.json`, `fetch_missing_memos.py`, `regen_backtest_100.py`. Abaikan: 7x `probe_*.py`, `probe_chat*.py`.

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/13-rescue-memo` + `05-rescue-memo-regen.md` + ritual 3Q → `04-jupyter-web-gate.md` → Freeze H6
