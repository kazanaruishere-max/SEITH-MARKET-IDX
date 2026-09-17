# Task 09 — README Jury Deep-Dive (5 poin)

## Goal
Perluas `README.md 15sec EN+ID` jadi deep-dive produk SEITH yang detail mendalam tapi tetap dipahami juri/dev awam — 5 poin wajib founder: (1) cara pakai SEITH ke juri, (2) requirement SEITH apa aja, (3) OS yang dijalanin, (4) bahasa + fungsi Rust, (5) penjelasan teknis keseluruhan untuk juri & dev.

## Context
- SSOT: `README.md 15sec EN+ID` + `docs/prd 4-5` + `docs/spec 2/4/5 hybrid` + `docs/api-spec 3 8 endpoints` + `docs/kronos-notes` + `research/backtest-100.json 296c` + `AGENTS 3c/5b/6/6c/8c` + `2508.02739v1.pdf Kronos`
- Branch: `handoff/22-accessibility` worktree `../seith-wt/handoff-22` — Z5 `README/docs` only
- Dependensi: 08-kronos-verify done

## Scope In / Out
In: `README.md` (tambah §0 Jury How-To + §12 Requirement + §12a OS + §13a Bahasa+Rust + §16 Deep Technical) + `docs/prd`/`spec` if drift
Out: `Heatmap100` (06), `company-profiles` (07), `kronos` code (08)

## Bagian — Surgical
| Bag | File | Fn/Struct | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `README.md` §0 | Jury How-To 60s | `60s ranking -> deep dive -> export PDF` 3 langkah klik: `1 buka / 2 klik ranking FINANCE 3 buka dossier BBCA export PDF` + screenshot placeholder `demo-placeholder.svg` + disclaimer | no how-to fail |
| b | `README.md` §12 | Requirement SEITH | `Hardware: 8GB RAM, CPU only MOCK=1 | GPU optional MOCK=0 102M; Env: .env SECTORS_API_KEY MARKET=id LLM_BASE_URL=:20128 SEITH_API_BIND=0.0.0.0:8181; Deps: Rust 1.82+ cargo, Python 3.11 uv, Node20 pnpm, Invoke-WebRequest health :20128 200 Never kill 9router` | requirement missing fail |
| c | `README.md` §12a | OS support | `Windows PowerShell 7+ primary (Set-Location uv workdir gotcha) | Linux/Mac bash equivalent (cd apps/kronos-sidecar)` + `SEITH_API_BIND 0.0.0.0:8181 (8080 httpd occupied)` | OS missing fail |
| d | `README.md` §13a | Bahasa + fungsi Rust | `Rust edition 2021: Axum+Tokio API :8181 envelope SCHEMA_VERSION, clap CLI ranking/dossier/scan, serde+validator Market Id|Sg deny_unknown_fields TICKER_RE, CompositeCache moka L1 <1ms + SQLite L2 WAL busy_timeout 3000, scoring calculator.rs 30/20/30/20 fn<50 file200-400; Python uv: FastAPI Kronos :8001 torch 102M + Analysis :8002 Fund/Tech/Synth ->9router :20128; TS: Next14 AppRouter Tailwind recharts react-pdf Zod` | bahasa missing fail |
| e | `README.md` §16 | Teknis keseluruhan deep | `8 Gates IN->OUT + 100 stratified FINANCE25/ENERGY20... credit 296 + cleansing OHLC->excluded BMRG/MFIN + Kronos 400->20 T1.0 512ctx + scoring 30/20/30/20 LPPF80.3 + ranking flag |Z|>2 + Agents Top10 nemotron + Dossier peer5 cap+-50% 20 chartPoints +-2σ vector 595×842 + hybrid rewrites :8181 health db counts + CompositeCache key market:sector:ticker:date TTL24h/1h` deep tapi diagram mermaid + tabel, bukan prose ai-slop | generic prose fail |
| f | `README.md` | polish prose | `skill://no-ai-slop grep banned 0 (delve/leverage/robust)* + disclaimer Bukan rekomendasi tiap view + AGPL-3.0 + freeze 19Aug-30Sep` | ai-slop fail |

## Deliverables
- `README.md` updated `§0 Jury 60s How-To + §12 Requirement + §12a OS + §13a Bahasa+Rust + §16 Deep Technical` detail mendalam tapi dipahami (diagram mermaid + tabel, bukan wall prose)
- `grep -c "delve\|cutting-edge" README.md` 0 + `grep -c "Bukan rekomendasi" README.md` >=3 + `grep -c "SEITH_API_BIND" README.md` 1
- `git diff README.md --stat` + `seith-doc-reviewer` pass

## Verification
```
grep -n "How-To|Requirement|OS|Rust" README.md | head -20
grep -c "Bukan rekomendasi" README.md
pnpm --dir apps/web build | grep Route
```

## Peran + Skill
| Peran | Eksekutor | Skill | Sub-agent |
|---|---|---|---|
| T1 | sub-agent | `seith-market-intelligence` + `no-ai-slop` + `design-taste-frontend` | `seith-doc-reviewer` + `seith-design-reviewer` |
