# Task 01 — Smoke BBCA Single (MOCK=1 → MOCK=0 Real)

## Goal
Validasi wiring pipeline real-time pada 1 ticker paling liquid (BBCA) — `Sectors /v2/daily/BBCA/ Authorization → normalize → Kronos 400→20 → Score 30/20/30/20 → Flag |Z|>2 → TradingAgents Lite SEITH-MARKET-IDX → dossier JSON 2-page ID + PDF vector` — smoke MOCK=1 <30s dulu lalu real MOCK=0 RTX4050 2-3m.

## Context
- SSOT: `crates/seith-core/src/kronos/client.rs` + `scoring/calculator.rs` 30/20/30/20 + `anomaly/volume.rs |Z|>2 vol>2σ` + `dossier.rs:29-39 Dossier + DISCLAIMER` + `sectors-client/client.rs Authorization + batch.rs chunks(20)` + `seith-api/handlers.rs envelope + SCHEMA_VERSION 1.0.0` + `seith-cli ranking/score/dossier/scan` + `docs/api-spec.md §3 dossier ?lang=id peer[5] QV+cap §7 Sectors §9 :8001 §10 9router` + `docs/research/data-plan-100-top.md` + `research/universe-100.json` BBCA FINANCE + `research/backtest-100.json` + `migrations/001_cache.sql`
- Branch: `handoff/11-e2e-testing` dari `main 0954d1d` — Z1 verify only (no scoring edit) + Z2 `apps/kronos-sidecar :8001 + apps/analysis :8002 → 9router :20128` runtime verify + Z5 research + Z6 handoff — docs+test-only: no crate logic edit, prove gates 0 drift
- Skill: `skill://seith-market-intelligence` + `skill://no-ai-slop` Tier-1 + `skill://verification-loop` + `skill://seith-kronos` (MOCK toggle) + ritual 3Q

## Scope In / Out
In: `curl Sectors BBCA + 9router PONG + Kronos predict_batch 400→20 T1.0 top_p0.9 vol ±2σ` + `cargo fmt/clippy/test 148` + `seith-cli ranking/scan` envelope + `GET /api/v1/tickers/BBCA/dossier?format=json&lang=id peer[5] + ?format=pdf&lang=id %PDF 2 pages` + `pnpm lint/typecheck` + `gitleaks 0 check`
Out: Z1 scoring logic edit (verify only), `vendor/Kronos` read-only, `ValuationGapMap/Screener` H7b, 5 cross-sector (02), Freeze H6 (03), `data/seith.db` write (observe only, gitignored WAL 100)

## Bagian — Surgical Breakdown
| Bag | File | Struktur | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `curl live` | `GET https://api.sectors.app/v2/daily/BBCA/ Header Authorization: $SECTORS_KEY` + `GET http://localhost:20128/v1/models Bearer $SEITH_KEY` | `200 BBCA.JK 61 rows close 8300 2025-08-01` or `403 error 1010 excluded:[{ticker,reason}]` (WAF fallback) + `200 SEITH-MARKET-IDX SEITH_LLM_MODEL nvidia/nemotron-3.5-lightning:free cost 0` | `curl BBCA → non-200 and non-403` = FAIL probe |
| b | `apps/kronos-sidecar :8001` | `POST /predict + POST /predict_batch {market:"id", df 400 x_timestamp/y_timestamp, pred_len 20, T1.0 top_p0.9} → {pred_df 20, forecastReturn, volatility, volBand ±2σ}` — runtime `uv` | MOCK=1: `<30s` instant mock `kronos-pred-20.json` + MOCK=0: `60-90s` GPU RTX4050 6GB `<1GB` CUDA, fallback `KRONOS_MOCK=0` OOM → `degraded:true` | `curl :8001/predict_batch → timeout>30s without degraded` |
| c | `apps/analysis :8002 + 9router` | `POST /synthesize {market:"id", ticker:"BBCA", fundamentals ROE/margin/leverage/PE/PB, kronosSignal, sector:"FINANCE"} → httpx → 9router :20128/v1/chat/completions {model:"SEITH-MARKET-IDX"}` | `200 {fundamentalMemo,technicalMemo,synthesizerMemo} ID + disclaimer` + fallback `degraded:true` still PASS MI if 9router down | `curl :8002/synthesize → 500 without degraded flag` |
| d | `crates/seith-api + seith-cli` | `GET /api/v1/health → x-schema-version 1.0.0` + `seith ranking --sector FINANCE --json` + `seith scan --tickers BBCA --lookback 400 --json` + `GET /api/v1/tickers/BBCA/dossier?format=json&lang=id` | envelope `success/data/error/pagination + disclaimer Bukan rekomendasi` + `score 0-100 breakdown 30ER/20|Z|/30QV/20SM` + `anomaly {z, flag |Z|>2, reason}` + `peerComparison[5] QV distance+cap±50% same FINANCE` + `kronos {forecastReturn, volatility, chartPoints 20, volBand}` + `research 3 memo ID` | `curl /dossier BBCA json → missing peer[5] or no disclaimer` |
| e | `PDF 2-page` | `GET /api/v1/tickers/BBCA/dossier?format=pdf&lang=id` → `%PDF-1.4` 2 pages `mediaBox 612x792` Bloomberg `#0B0E14` via `@react-pdf/renderer` or `dossier.rs to_pdf_bytes` CLI fallback | `startsWith %PDF` + `2 pages` + header `SEITH Dossier BBCA id score` + footer tiap page `Bukan rekomendasi investasi + SCHEMA_VERSION` + visual `Line zinc actual 400 vs amber dashed forecast 20 + Area red 10% ±2σ + ScoreBadge stacked + peer table 5` | `pdf header not %PDF or 1 page only` |

## Deliverables + Acceptance
- Probe nyata: `Sectors BBCA 200 or 403 excluded + 9router PONG nvidia + Kronos :8001 400→20 + Analysis :8002 synthesize ID + seith-cli envelope + GET /dossier BBCA json→pdf 2 pages` — paste output no fabrikasi
- `fn<50` N/A docs+test-only, `file 200-400` observe only, `cargo fmt --check 0 + clippy --all-targets 0 + cargo test 148 + pnpm lint 0 typecheck 0 + uv workdir 17 passed + gitleaks 0 + grep SECTORS_API_KEY apps/web →0 + grep plotly kronos-sidecar →0` — no drift
- Smoke MOCK=1 <30s then MOCK=0 real BBCA 2-3m RTX4050 — latency logged

## Verification
```
cargo fmt --check → 0 / cargo clippy --all-targets -- -D warnings → 0 / cargo test → 148 passed (20+7+19+16+86)
uv --project apps/analysis run pytest -q (workdir apps/analysis) → 17 passed / pnpm --dir apps/web lint → 0 typecheck → 0
curl -H "Authorization: $SECTORS_KEY" https://api.sectors.app/v2/daily/BBCA/ → 200 BBCA.JK 8300 [61 rows] or 403 excluded
curl -H "Authorization: Bearer $SEITH_KEY" http://localhost:20128/v1/chat/completions -d '{"model":"SEITH-MARKET-IDX","messages":[{"role":"user","content":"PONG"}]}' → 200 PONG x-used-model nvidia/nemotron-3.5-lightning:free
curl http://localhost:8001/predict_batch -d '{"market":"id","df":[...400],"pred_len":20}' → 200 pred_df 20 volBand
curl http://localhost:8002/synthesize -d '{"market":"id","ticker":"BBCA","sector":"FINANCE"}' → 200 3 memo ID
cargo run -p seith-cli -- ranking --sector FINANCE --json → success/data/pagination
curl http://localhost:8181/api/v1/tickers/BBCA/dossier?format=json&lang=id → 200 peer[5] + disclaimer
curl http://localhost:8181/api/v1/tickers/BBCA/dossier?format=pdf&lang=id → 200 %PDF-1.4 2 pages
gitleaks detect --no-git -v → 0 / grep -r SECTORS_API_KEY apps/web → 0 / grep plotly apps/kronos-sidecar/pyproject.toml → 0
```

## Accountability Block — Task 01
- ✅ Terverifikasi: `cargo fmt 0 + clippy --all-targets 0 + test 148 + uv workdir 17 + pnpm lint0 typecheck0` no drift, `Sectors BBCA probe + 9router PONG + Kronos 400→20 + dossier BBCA json/pdf 2 pages` — output nyata (paste after run)
- ⚠️ Belum: Kronos real GPU MOCK=0 latency 2-3m — deferred after MOCK=1 smoke PASS
- 🔻 Risiko: WAF 403 transient `error 1010` → mitigasi `excluded:[{ticker,reason}] + retry1 chunks(20)` — deteksi `curl 403` then fallback / KRONOS_MOCK OOM → mitigasi `degraded:true` mock fallback
- ♻️ Refactor: docs+test-only — keep probe narrow, DRY 02+03, no code edit

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill WAJIB | Sub-agent | Kapan |
|---|---|---|---|---|
| T1 Smoke | sub-agent | `seith-market-intelligence` + `seith-kronos` + `verification-loop` + `no-ai-slop` | `explore` | 01 smoke BBCA MOCK→real |
| Founder | User | — | — | approve MOCK=1 first vs real priority |
| PM | `seith-pm` | `git-worktree-manager` + gate `fmt/clippy/test` | `seith-pm` | orkestrasi smoke + veto if wiring fail |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | verify Z1 no edit drift |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | verify SECTORS_API_KEY server-only, disclaimer always |
| Doc | `doc-updater` | `remember`+`handoff` | `doc-updater` | cek drift docs/api-spec §7 |

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/11-e2e-testing` + task `01-smoke-bbca.md` + ritual 3Q + `skill://seith-kronos` MOCK toggle
