# Task 02 — Data Factual Wiring

## Goal
Expose factual `health db:{ohlcv,fundamentals} counts` + `sector_median 6` + `Kronos honest degraded` + `catch logged` + `envelope disclaimer` — no fake `20× flat` or `avg="-"` hollow.

## Context
- SSOT: `AGENTS §6 envelope + Market enum + TICKER_RE + deny_unknown_fields + cache_key market:sector:ticker:date` + `docs/api-spec §3 health {status schema db:{ohlcv,fundamentals}}` + `crates/seith-api/src/handlers.rs:health db_counts()` + `crates/seith-api/src/backtest_data.rs:db_counts()` + `crates/seith-core/src/normalize.rs:sector_median 6 sektors` + `apps/web/app/page.tsx catch (e)` + `apps/web/components/DossierKronosChart.tsx pts.length?Area:degraded` + `apps/kronos-sidecar/app/main.py is_mock_mode()` + `research/backtest-100.json degraded` + `data/seith.db 126KB 25×20 FINANCE`
- Dependensi: 01-web-bloomberg-polish done (Bloomberg density lock, no `bg-white` flash)
- Branch: `handoff/22-accessibility` worktree `../seith-wt/handoff-22` — Z1 `crates/seith-api` Z2 `apps/web` Z3 `data/seith.db` Z4 `tests/fixtures`

## Scope In / Out
In: `crates/seith-api/src/handlers.rs` (health `db:{ohlcv,fundamentals}` + dossier 3 memo distinct `fund fundamental/memo_tech/memo_synth` + dossier_pdf 3 distinct) + `crates/seith-api/src/backtest_data.rs` (`db_counts` `rusqlite Connection open SELECT COUNT(*)`) + `apps/web/app/page.tsx` (`catch (e) console.error("[seith] fetch failed", e)`) + `apps/web/components/DossierKronosChart.tsx` (`if (!pts.length) return degraded` honest, no `Array.from 20× close±2%` fake) + `apps/kronos-sidecar/app/main.py` (`is_mock_mode()` health honest) + `apps/web/lib/api.ts` (zod `envelope {success,data,error,pagination,disclaimer}`) + `tests/fixtures/sector-median.json` 6 sektors factual
Out: `DossierPDF.tsx` 9-section AA (03), `vercel.json` + `AGENTS §10` + `ci.yml` (04), `sectors-client` live 25c fetch (gated 22.5)

## Todo
- [ ] `todowrite in_progress` before; `completed` only after Verify hijau + Block

## Bagian — Surgical Breakdown
| Bag | File | Fn/Struct | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `crates/seith-api/src/handlers.rs` | `health() -> Response` | `let db=bd::db_counts().unwrap_or((0,0)); let degraded=db.0==0; ok_body(json!({status:"ok", schema:SCHEMA_VERSION, degraded, db:{ohlcv:db.0, fundamentals:db.1}}))` + `X-Schema-Version:1.0.0` header; `curl :8181/health \| jq .data.degraded,.data.db` → `false {ohlcv:≥400}` if seeded else `true {0,0}` honest fallback | `health` missing `db`/`degraded` field |
| b | `crates/seith-api/src/backtest_data.rs` | `db_counts() -> Option<(i64,i64)>` | `Connection::open("data/seith.db").ok()?` `query_row` with `.unwrap_or(0)` — DB missing → `None` → health `degraded:true {0,0}` honest (not silent: `tracing::warn!("db not seeded")` logged, health degraded flag surfaces failure) | panic on missing db |
| c | `crates/seith-api/src/handlers.rs` | `dossier JSON` | `base_memo = bd::dossier_memo(&it, peers.len())` → `memo_fund = format!("{} — Fundamental: ROE/margin vs median sektor.", base_memo)` + `memo_tech` `|Z|/vol` + `memo_synth` `verdict` → `research:{fundamentalMemo:memo_fund, technicalMemo:memo_tech, synthesizerMemo:memo_synth}` distinct (clone×3 forbidden) | 3 memos identical |
| d | `crates/seith-api/src/handlers.rs` | `dossier_pdf` | `ResearchSection {fundamental_memo: format!("{} — Fundamental", memo), technical_memo: format!("{} — Teknikal |Z|/vol", memo), synthesizer_memo: format!("{} — Sintesis", memo)}` distinct; `%PDF` header preserved | pdf memo clone |
| e | `apps/web/app/page.tsx` | `catch` | `} catch (e) { console.error("[seith] fetch failed", e); }` — no silent `catch{}` swallow; `items/leaks/metrics` guarded `[]` padded heatmap still | `catch{}` empty |
| f | `apps/web/components/DossierKronosChart.tsx` | `pts` honest | `const pts=kronos?.chartPoints??[]; if(!pts.length) return <degraded>Prediksi belum tersedia — degraded</degraded>` — remove `Array.from 20× close 1.02/0.98` fake; `hist: pts` only when real | `1.001` drift present |
| g | `apps/kronos-sidecar/app/main.py` | `health` | `model="mock" if is_mock_mode() else "Kronos-base"` honest via `_fell_back` — was `os.getenv KRONOS_MOCK` fake while mock fallback | health reports `Kronos-base` while degraded |
| h | `tests/fixtures/sector-median.json` | 6 sektors | `id/sg` each `FINANCE/ENERGY/CONSUMER/INFRA/OTHER+TECH` 6 entries `roe/margin/leverage/pe/pb` factual `insufficient_data:true` fallback gone | `CONSUMER` missing |
| i | `apps/kronos-sidecar` + `apps/analysis` | pytest | `(cd apps/kronos-sidecar && uv run pytest -q)` 18+1 pass + `(cd apps/analysis && uv run pytest -q)` pass — workdir per AGENTS §5 gotcha (uv independent project) | pytest fail |

## Deliverables + Acceptance
- `curl :8181/health | jq '.data.db, .data.schema` → `{ohlcv:≥400 fundamentals:25 schema:"1.0.0"} or {0,0} degraded` + `X-Schema-Version` header `1.0.0`
- `curl :8181/api/v1/tickers/BBCA/dossier?market=id | jq '.data.research | .fundamentalMemo != .technicalMemo'` → `true` + `contains Fundamental|Teknikal|Sintesis` distinct
- `grep -c "catch{}" apps/web/app/page.tsx` → `0` && `grep -c "1\.001\|Array\.from.*20.*close" apps/web/components/DossierKronosChart.tsx` → `0`
- `curl :8001/health | jq '.model'` → `mock` when `KRONOS_MOCK=1` or `_fell_back` honest
- `cargo fmt 0 && clippy -D 0 && test 89+ green` + `pnpm lint0 typecheck0 build 4 routes` unchanged

## Verification
```
curl -s http://127.0.0.1:8181/health | jq -r '.data.db, .data.schema'
curl -s http://127.0.0.1:8001/health | jq '.model, .max_context, .device'
curl -s "http://127.0.0.1:8181/api/v1/tickers/BBCA/dossier?market=id" | jq '.data.research | keys, .fundamentalMemo[0:80]'
grep -rn "catch" apps/web/app/page.tsx
grep -rn "1\.001" apps/web/components/DossierKronosChart.tsx || echo "no fake drift"
sqlite3 data/seith.db "SELECT COUNT(*) FROM ohlcv; SELECT COUNT(DISTINCT ticker) FROM fundamentals WHERE sector='FINANCE';"
cargo test -p seith-core normalize -- --nocapture | tail -10
```

## Peran + Skill
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T1 | sub-agent | `seith-market-intelligence` + `seith-data` + `seith-quant` + `verification-loop` | `seith-data-reviewer` | Implement→Verify `fn<50` |

## Next
Task 03 PDF AA-grade depends on 3 distinct memos factual.
