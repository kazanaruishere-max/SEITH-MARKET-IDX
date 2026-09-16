# Task 03 — Web + Research Honest

## Goal
Web/research factual: `catch` logged, `chartPoints` empty-honest (no fake drift), `credit 296` single source, `kronos-notes` location deduped.

## Context
- SSOT: `apps/web/app/page.tsx:catch{}` silent + `apps/web/components/DossierKronosChart.tsx` flat 20 placeholder + `apps/web/components/Heatmap100.tsx` pad 100 + `research/backtest-100.json credit_cost 296` vs `docs/api-spec §5 credit 200` drift + `docs/kronos-notes.md` vs `research/kronos-notes.md` missing + `research/money-leak-backtest.html` gitignore
- Dependensi: 02-sidecar-honest done (3 memo distinct, health honest)
- Branch: `handoff/21-zero-gap` — Z2 `apps/web` Z5 `docs/research`

## Scope In / Out
In: `apps/web/app/page.tsx` (catch log), `apps/web/app/ranking/page.tsx` if same, `apps/web/components/DossierKronosChart.tsx`, `apps/web/components/Heatmap100.tsx` note, `docs/api-spec.md` credit line, `docs/kronos-notes.md` header, `.gitignore` already done (verify)
Out: `crates/*` wiring (01), `apps/kronos-sidecar` health (02), `AGENTS §10` sync (04), live Sectors batch

## Todo
- [ ] `todowrite in_progress` before; `completed` after Verify hijau

## Bagian — Surgical Breakdown
| Bag | File | Fn/Struct | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `apps/web/app/page.tsx` | `Promise.all fetch* catch` | `catch(e){ console.error("[seith] fetch failed", e) }` + UI empty state `Heatmap padded` still; no silent swallow; `tracing` server log if server component | catch empty → fail |
| b | `apps/web/components/DossierKronosChart.tsx` | `chartPoints` fallback | if `chartPoints.length===0` render `empty state "Prediksi belum tersedia — degraded"` not `20× flat ±2%` fake; remove synthetic `drift+jitter` hash generator | fake 20 points → fail |
| c | `docs/api-spec.md` | `credit_cost` | single source `296 (98×19 OHLCV +98 valuation)` reconciled; `regen_backtest_100.py` `ponytail` comment already descriptive; `200` line removed or footnoted as old 400-row accounting | `200 vs 296` both present → fail |
| d | `docs/kronos-notes.md` | header | add note `Lokasi kanonik docs/kronos-notes.md (bukan research/)` if research path referenced | — |

## Deliverables + Acceptance
- `pnpm --dir apps/web lint` 0 + `pnpm --dir apps/web typecheck` 0 + `pnpm --dir apps/web build` 4 routes `ok`
- `grep -r "catch{}" apps/web/app` → 0; `grep -r "1\.001" apps/web/components/DossierKronosChart` → 0 (no mock drift)
- `grep -r "credit_cost 200" docs/` → 0; `grep "credit_cost 296" research/backtest-100.json` → 1
- `git check-ignore research/money-leak-backtest.html` → ignored

## Verification
```
pnpm --dir apps/web lint → 0
pnpm --dir apps/web typecheck → 0
pnpm --dir apps/web build → 4 routes
grep -rn "catch" apps/web/app/page.tsx
grep -rn "chartPoints" apps/web/components/DossierKronosChart.tsx
grep -rn "credit_cost" docs/api-spec.md research/backtest-100.json
```

## Peran + Skill
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T2 | sub-agent | `seith-market-intelligence` + `seith-design` + `no-ai-slop` | `seith-design-reviewer` | Implement→Verify |
