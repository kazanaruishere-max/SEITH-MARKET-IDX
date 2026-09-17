# Task 07 — Company Profile Resmi IDX (no karang)

## Goal
Tambah `research/company-profiles.json` + wiring `apps/web` tooltip/expand per stock menampilkan `companyName + sector + deskripsi resmi + sourceUrl` — sumber wajib dari `IDX.co.id` factsheet atau Sectors `company_profile` endpoint, verbatim resmi, tidak mengarang. Jury cek `sourceUrl` ada per ticker.

## Context
- SSOT: `research/backtest-100.json 100 items ticker/sector` + `research/universe-100.json FINANCE25` + `apps/web/components/RankingTable.tsx` + `apps/web/components/Heatmap100.tsx` + `apps/web/app/dossier/[ticker]/page.tsx` + `crates/seith-api` envelope (add field `companyProfile?`)
- Masalah: sekarang cuma ticker/sector/score tanpa deskripsi perusahaan resmi
- Branch: `handoff/22-accessibility` worktree `../seith-wt/handoff-22` — Z2+Z3+Z5
- Dependensi: 06-heatmap-vertical done

## Scope In / Out
In: `research/company-profiles.json` (100 entries ticker->{name, sector, description, sourceUrl}) + `research/company-profiles.schema.json` (zod-like) + `crates/seith-api/src/backtest_data.rs` expose companyProfile + `apps/web/components/RankingTable.tsx` hover/expand + `apps/web/components/Heatmap100.tsx` tooltip title + `apps/web/app/dossier/[ticker]/DossierClient.tsx` company header
Out: heatmap layout (06 done), kronos verify (08), README (09), any auto-trade

## Todo
- [ ] `todowrite in_progress` before; `completed` only after Verify hijau + Block

## Bagian — Surgical
| Bag | File | Fn/Struct | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `research/company-profiles.json` | 25 FINANCE first + 75 rest | min 25 FINANCE `ticker name sector description sourceUrl` description verbatim dari `https://www.idx.co.id/...` atau Sectors `GET /company_profile/{ticker}` + `sourceUrl` per ticker valid https | sourceUrl missing fail |
| b | `research/company-profiles.schema.json` | schema | zod `{ticker: string(3-6), name: string, sector: enum 5, description: string>=20, sourceUrl: url}` | invalid entry fail |
| c | `crates/seith-api/src/backtest_data.rs` + `handlers.rs` | companyProfile wiring | `ranking` + `dossier` + `backtest` response tambah `companyProfile?: {name, description, sourceUrl}` dari `company-profiles.json` lookup; `deny_unknown_fields` still 422 | field missing fail |
| d | `apps/web` | UI hook | `Heatmap100 cell title="BBCA - Bank Central Asia - score 62.5"` + `RankingTable row expand` + `DossierClient header "BBCA — Bank Central Asia — sector FINANCE"` + link `sourceUrl` small `idx.co.id` | tooltip empty fail |

## Deliverables
- `research/company-profiles.json` 25 FINANCE min + sourceUrl per ticker valid (idx.co.id or sectors) — no karang, jury `grep sourceUrl` >=25
- `curl :8181/api/v1/ranking?sector=FINANCE | jq .data.items[0].companyProfile.name` -> string
- `GET /` heatmap hover title contains companyName; `/dossier/BBCA` header contains name + source link
- `pnpm lint0 typecheck0 build4` + `cargo test` still green + `grep karang` 0

## Verification
```
jq 'length' research/company-profiles.json
jq '.[0]' research/company-profiles.json
curl -s http://127.0.0.1:8181/api/v1/ranking?sector=FINANCE | jq '.data.items[0] | {ticker, companyProfile}'
grep -c "sourceUrl" research/company-profiles.json
```

## Peran + Skill
| Peran | Eksekutor | Skill | Sub-agent |
|---|---|---|---|
| T1 | sub-agent | `seith-market-intelligence` + `seith-data` | `seith-data-reviewer` + `seith-doc-reviewer` |
