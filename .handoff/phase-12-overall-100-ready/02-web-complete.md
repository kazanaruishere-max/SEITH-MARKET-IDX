# Task 02 — Web Complete (Z2)

## Goal
Lengkapi Next.js 14: proxy rewrites + 4 routes render data real + 5 komponen + 6 test hijau.

## Context (§8c)
- SSOT: `AGENTS.md §3c Z2` + `docs/api-spec.md §3b Web Contract` + `docs/prd.md §7 Journey 60s`
- Skill: `skill://seith-market-intelligence` + `design-taste-frontend` + `no-ai-slop` Tier-1
- File: `lib/api.ts` (+37) + `next.config.js` (NEW) + `app/page.tsx` + `app/ranking/page.tsx` + `app/dossier/[ticker]/page.tsx` (+68) + `DossierClient.tsx` + `TopLeaks.tsx` + `BacktestChart.tsx` + `MetricsTable.tsx` + `DossierPDF.tsx` + `RankingTable.tsx` (+|Z|) + `api.test.ts` (+29)

## Scope In / Out
In: 5 fetcher zod envelope + rewrites `:8181` + `/ /ranking /dossier/[ticker] /backtest` + Top5 |Z| + equity zinc/amber + metrics + PDF dual + disclaimer tiap view.
Out: backend edit, `.env` secret, plotly di web, auth.

## Bagian — Surgical
| Bag | Item | File | Kriteria |
|---|---|---|---|
| a | fetchRanking/fetchAnomalies/fetchBacktest/fetchScore/fetchDossier | `lib/api.ts` | zod envelope, SSR baseUrl 127.0.0.1:8181 |
| b | rewrites /api/v1 + /health | `next.config.js` | dev proxy :8181, prod via NEXT_PUBLIC_API_BASE |
| c | hero+TopLeaks / ranking filter / dossier badge+peer+memo / backtest equity12 | `app/*` | data real, disclaimer |
| d | TopLeaks/BacktestChart/MetricsTable/DossierPDF/DossierClient | `components/*` | recharts 2.12.7, vector PDF |
| e | 6 test fetcher | `lib/api.test.ts` | mock envelope pass |

## Deliverables + Acceptance
- `/` hero + TopLeaks Top5 |Z| (LPKR/ELSA/BUMI) link dossier
- `/ranking` filter sector/sort, 100 items, kolom |Z|
- `/dossier/[ticker]` badge + peer5 table + memo + PDF blob/vector
- `/backtest` equity 12 vs IHSG + metrics Sharpe + Top10
- `pnpm lint 0 typecheck 0 test 6 build 5 routes`, `grep SECTORS_API_KEY apps/web → 0`

## Verification + Accountability
```
pnpm --dir apps/web lint → 0
pnpm --dir apps/web typecheck → 0
pnpm --dir apps/web test → 6 passed
pnpm --dir apps/web build → 5 routes
```
- ✅ Terverifikasi: <cmd> → <output>
- ⚠️ Belum: <apa>
- 🔻 Risiko: <1-2> — deteksi: <cara>
- ♻️ Refactor: <apa>

## Peran
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Eksekutor T1 | sub-agent | `seith-market-intelligence` + `frontend-patterns` | `explore` | Implement→Verify 02 |
| Designer FE | — | `design-taste-frontend` + `no-ai-slop` | — | Bloomberg #0B0E14 verify |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | NEXT_PUBLIC_API_BASE only |
| Refactor | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | Boy Scout §5b |
| PM | `seith-pm` | gate pnpm | `seith-pm` | veto jika fail |

## Next Session Prompt
`skill://seith-market-intelligence` + `handoff/12` + `02-web-complete.md` + ritual 3Q → `03-governance-docs.md`
