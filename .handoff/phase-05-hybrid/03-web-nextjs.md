# Task 03 — Next.js Bloomberg Consume Rust API

## Goal
`apps/web` Bloomberg `#0B0E14` consume `Rust API /api/v1/*` — `ranking table + dossier 1-page + disclaimer` — `pnpm lint/typecheck/test` hijau — no direct `crates/*` import, hanya via REST envelope.

## Context
- SSOT: `docs/spec.md §2[8] Hybrid §7b Z2` + `docs/api-spec.md §1 envelope §3 ranking/dossier §10 9router` + `apps/web/* {package.json layout.tsx globals.css app/page.tsx}` existing + `AGENTS.md §3c Z2 §8c` + `skill://design-taste-frontend` Tier-1 + `skill://seith-market-intelligence`

## Scope In / Out
In: Z2 `apps/web/{app/{page.tsx,ranking/page.tsx,dossier/[ticker]/page.tsx}, components/{RankingTable.tsx,ScoreBadge.tsx}, lib/api.ts}` + `app/globals.css` Bloomberg polish — Z2 only
Out: `crates/seith-api` (01), `seith-cli/dossier.rs` (02), sidecars `:8001/:8002` (verify only), `data/seith.db` no edit

## Bagian — Surgical
| Bag | File | Fn | Acceptance | Test FAIL |
|---|---|---|---|---|
| 03a | `lib/api.ts` | `fetchRanking({market,sector,page,pageSize}) fetch /api/v1/ranking + fetchScore(ticker,market) + fetchDossier(ticker,market,format)` `zod` validate envelope `{success,data,pagination}` throw on `!success` | `fetchRanking market sg → sg` | `no zod→FAIL` |
| 03b | `components/ScoreBadge.tsx` | `ScoreBadge({score 0-100})` color `>70 green 40-70 amber <40 red` + `anomaly flag` dot | `score 85 green` | `no clamp→FAIL` |
| 03c | `components/RankingTable.tsx` | `RankingTable({items,pagination})` table `ticker score components anomaly rank` sort desc + paginate + `market` badge | `items sorted desc` | `no disclaimer→FAIL` |
| 03d | `app/ranking/page.tsx` | `RankingPage({searchParams market sector page})` SSR `fetchRanking` + `RankingTable` + `disclaimer "Bukan rekomendasi"` | `?market=sg renders sg` | `market xx 422→FAIL` |
| 03e | `app/dossier/[ticker]/page.tsx` | `DossierPage({params ticker, searchParams market format})` `fetchDossier` JSON view + `Download PDF` link `?format=pdf` + `peerComparison` + `research memo` | `BBCA.JK normalized` | `no pdf link→FAIL` |
| 03f | `app/page.tsx` | Landing `60s ranking → deep dossier` CTA `→ /ranking` + `design-taste-frontend` polish | `CTA → /ranking` | `no CTA→FAIL` |

## Deliverables
- `lib/api.ts 60L` + `components/* 40L each` + `pages 50L each` — `apps/web 300-500L` total, `fn<50`
- `pnpm lint 0 && pnpm typecheck 0 && pnpm test 3 passed` (vitest `fetchRanking` mock)

## Verification
```
pnpm lint → 0
pnpm typecheck → 0
pnpm test → 3 passed (ranking sg, dossier BBCA, disclaimer present)
curl /api/v1/ranking?market=sg → sg items
```

### Accountability Block
```
✅ Terverifikasi: <cmd> → <output> paste nyata
⚠️ Belum: Verify E2E contract (04)
🔻 Risiko: Web drift CLI/REST → mitigasi lib/api.ts share envelope zod strict
♻️ Refactor: extract fetchEnvelope<T>(), ScoreColor()
```

## Peran + Skill
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T1 Web | sub-agent | `seith-market-intelligence`+`tdd-workflow`+`verification-loop`+`git-worktree-manager`+`design-taste-frontend`+`no-ai-slop` | `explore` | TDD lib/api.ts mock |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | components — `no-ai-slop`+`design-taste-frontend` |
| PM | `seith-pm` | `git-worktree-manager`+gate `fmt/clippy/test` | — | veto if web lint fail |

## Next
`skill://seith-market-intelligence` + `handoff/05-hybrid-t1-api` + `03-web-nextjs.md` + ritual 3Q: gate? `consume Rust API only`. jebakan? `market sg vs id, disclaimer always`. test FAIL? `sg param, pdf link, disclaimer present`.
