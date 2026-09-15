# Task 03 — Agents Top-10 + Regen backtest-100.json (Z1/Z2/Z5)

## Goal
10 memo LLM via `:8002 → 9router` + 90 template + `research/backtest-100.json` diregen dari hasil live (skema tetap).

## Context
- SSOT: `docs/api-spec.md §9 sidecars + §10 9router` + `apps/analysis/app/main.py /synthesize` + `apps/analysis/app/agents/*.py` + `apps/analysis/app/schemas.py SynthesizeRequest/Response` + `research/universe-100.json`
- Dependensi: 02 done (100 skor real)
- Branch: `handoff/13-live-100-e2e/t1-pipeline` — Z1+Z2+Z5

## Scope In / Out
In: `:8002 /synthesize` Top-10 (Fund/Tech/Synth, fallback template + `degraded` jujur) + ganti logika hash generator → hasil live + skema tetap (`items/metrics/equity/excluded/degraded/disclaimer`) + equity 12 tanggal valid.
Out: notebook (04), web visual (04), scoring formula baru.

## Todo (`todowrite` WAJIB — AGENTS §8d)
- [ ] Buka todo `in_progress` sebelum Implement; `completed` hanya setelah Verification hijau.

## Bagian — Surgical Breakdown
| Bag | Aksi | Acceptance | Test FAIL |
|---|---|---|---|
| a | Boot `:8002` + `/health nine_router:up` | 9router reachable | `degraded` hilang saat 9router down |
| b | `/synthesize` Top-10 (rank 1-10) | 10 memo LLM + `bukan rekomendasi investasi` tiap memo | 90 non-top ikut LLM (boros) |
| c | Regen `backtest-100.json` dari live | 100 items hasil pipeline, `as_of` baru, bukan `md5(ticker)` | skema berubah tanpa `SCHEMA_VERSION` |
| d | Equity 12 + metrics | tanggal valid `%Y-%m-%d`, `hit_rate 0-1`, `drawdown ≤0` | `08-36` overflow terulang |

## Deliverables + Acceptance
- `backtest-100.json`: 100 live + equity 12 valid + `excluded` jujur + `degraded` jujur + `bukan rekomendasi investasi`
- Test baru: `regen_100_items_live` + `top10_memo_llm_rest_template` (meaningful)
- `fn<50` + `♻️ Refactor:` wajib

## Verification (paste output nyata — §8c, gate penuh lihat 00-overview DoD)
```
# Tier-0: 9router :20128 NEVER kill/restart — hanya verify
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
| T1 | sub-agent | `seith-market-intelligence` + `tdd-workflow` + `verification-loop` | `explore` | Implement→Verify 03 |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | no secret di memo/log |

## Next Session Prompt
`skill://seith-market-intelligence` + `handoff/13` + `03-agents-regen.md` + ritual 3Q → `04-jupyter-web-gate.md`
