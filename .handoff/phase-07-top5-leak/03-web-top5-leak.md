# Task 03 — Web TopLeaks Hero + Ranking Enh (Z2)

## Goal
`apps/web` Top 5 Leak hero `GET /ranking?pageSize=5&sort=anomaly&minZ=2.0` + `lib/api.ts sort/order` + `ScoreBadge` + `Disclaimer always` — Bloomberg `#0B0E14` — `pnpm test 3→4`.

## Context
- SSOT: `AGENTS.md §3c Z2 §8c` + `docs/spec.md §2[5] Ranking+Flag §7b` + `docs/api-spec.md §1 envelope §3 ranking/anomalies §4 schemas` + `docs/research/money-leak-radar-thesis.md Top 5` + `apps/web/{lib/api.ts, components/TopLeaks,RankingTable,ScoreBadge, app/page, ranking}` + `skill://design-taste-frontend` + `skill://no-ai-slop` Tier-1

## Scope In / Out
In: Z2 `apps/web/lib/api.ts` + `apps/web/components/TopLeaks.tsx` + `apps/web/app/page.tsx` hero + `apps/web/app/ranking/page.tsx` enh + `apps/web/components/RankingTable.tsx` enh + `apps/web/lib/api.test.ts` 1 case — Z2 only
Out: Z5 `research/` (01-02), `apps/kronos-sidecar` no edit, `crates/*` verify only, `data/seith.db` verify only, `ValuationGapMap/Screener/KronosChart 20` defer H7b

## Bagian — Surgical (1 bag = 1 file <50L func)
| Bag | File | Fn / Struct | Acceptance | Test FAIL |
|---|---|---|---|---|
| 03a | `lib/api.ts` | add `sort/order/minZ` to `fetchRanking({market,sector,sort,order,page,pageSize,minZ}) → /api/v1/ranking?sort=anomaly&minZ=2.0` + `zod envSchema` strict `disclaimer` | `fetchRanking sort anomaly → ?sort=anomaly` | `no sort→FAIL` |
| 03b | `components/TopLeaks.tsx` | `TopLeaks({items})` `Ticker Market Score rank |Z| anomaly dot degraded` `Bloomberg #0B0E14 #11151F` `ScoreBadge` + `disclaimer` footer + link `→ /dossier/[ticker]` | `5 items rank 1-5 score 0-100` | `no disclaimer→FAIL` |
| 03c | `app/page.tsx` | hero `fetch Top5 id → TopLeaks` SSR `fetchRanking {pageSize:5 sort:anomaly market:id}` + `ValuationGapMap preview defer` + CTA `→ /ranking` | `home Top5 hero` | `no Top5→FAIL` |
| 03d | `app/ranking/page.tsx` | add `MarketToggle Id|Sg + sector filter + sort select mispricing|anomaly` `searchParams` → `fetchRanking` pass-through | `?market=sg&sort=anomaly renders sg` | `no toggle→FAIL` |
| 03e | `components/RankingTable.tsx` | enh `sector components breakdown anomalyFlag reason degraded` cols + dossier link + pagination controls | `cols sector+components+reason` | `no reason→FAIL` |
| 03f | `lib/api.test.ts` | +1 case `ranking anomaly sort Top5` | `4 passed` | `3→FAIL` |

## Deliverables + Acceptance
- `lib/api.ts` +10L `sort/order/minZ` + `TopLeaks.tsx` 40L + `page.tsx` hero Top5 + `ranking/page.tsx` enh + `RankingTable.tsx` enh cols — `apps/web 300-500→400-600L` `fn<50`
- `pnpm lint 0 && pnpm typecheck 0 && pnpm test 4 passed` (ranking sg + dossier BBCA + disclaimer + anomaly sort Top5) — `recharts` already installed no new dep — `Bloomberg #0B0E14` + `shadcn` raw div
- `disclaimer "Bukan rekomendasi investasi"` per insight view Tier-0 — `no-ai-slop` + `design-taste-frontend` polish

## Verification
```
pnpm lint → 0
pnpm typecheck → 0
pnpm test → 4 passed (ranking sg, dossier BBCA, disclaimer, anomaly sort Top5)
curl /api/v1/ranking?market=sg&pageSize=5&sort=anomaly → 5 items |Z| desc
grep -r TopLeaks apps/web/app/page.tsx → ok
```

### Accountability Block
```
✅ Terverifikasi: <cmd> → <output> paste nyata
⚠️ Belum: H6 Freeze implement (verify gate)
🔻 Risiko: Top5 tanpa |Z| → mitigasi fetchRanking sort anomaly minZ 2.0
♻️ Refactor: extract MarketToggle + sort/order validator seith-core/market.rs shared
```

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T1 Z2 | sub-agent | `seith-market-intelligence`+`tdd-workflow`+`verification-loop`+`git-worktree-manager`+`no-ai-slop`+`design-taste-frontend` | `explore` | Web Top5 TDD |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | no drift `seith-core` |
| PM | `seith-pm` | gate `fmt/clippy/test` | — | veto if `apps/kronos-sidecar` mixed |

## Next
`skill://seith-market-intelligence` + `handoff/07-top5-leak` + `03-web-top5-leak.md` + ritual 3Q: gate? `Top5 Leak usable hari ini`. jebakan? `sort anomaly + market sg`. test FAIL? `anomaly sort Top5`.
