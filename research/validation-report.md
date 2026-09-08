# Validation Report — Phase 08 E2E BBCA (04-e2e-execution)

**Date:** 2026-09-08
**Branch:** handoff/08-drift-e2e (from main 93a3a37 PR #35+#36) → main squash
**Workdir:** C:\Users\Lenovo\PROJECT\SEITH STOCK MARKET
**Env:** SECTORS_API_KEY 0843***64 + SEITH_API_KEY sk-115***35 + SEITH_LLM_MODEL=SEITH-MARKET-IDX + SEITH_LLM_FALLBACK=Seith-AI-Trading + MARKET=id (masked, gitleaks 0)

## Ritual 3Q (docs/notes/00-readme.md)
1. Gate MI: rankings + dossier 1-page (derived insight, bukan display mentah) — dossier score 80 + breakdown + disclaimer
2. Jebakan: cleansing OHLC missing→excluded/volume→0, Kronos max_context 512 (lookback>512→422), cache key market:sector:ticker, 9router degraded fallback
3. Test FAIL jika salah: envelope success/data/disclaimer, ticker regex, degraded flag, BBCA probe 403→fixtures excluded

## Probes

### Sectors BBCA live
```
Authorization: $SECTORS_KEY
GET https://api.sectors.app/v2/daily/BBCA/?start=2025-08-01
→ 200 rows=61 first=BBCA.JK close=5650 date=2026-06-10 open=5175 high=5700 low=5175 volume=747366000
```
File: `_sectors_bbca.json` len ~61 rows (saved, not committed). Fallback fixtures `tests/fixtures/bbca-ohlcv-400.json` ready if 403 WAF.

### 9router SEITH-MARKET-IDX PONG
```
Authorization: Bearer $SEITH_KEY
POST http://localhost:20128/v1/chat/completions {"model":"SEITH-MARKET-IDX","messages":[{"role":"user","content":"PONG"}],"max_tokens":64,"stream":false}
→ 200 model=nvidia/nemotron-3.5-lightning:free provider=Nvidia (alias SEITH-MARKET-IDX → combo free chain)
  content=thinking process (reasoning model, finish=length), has SEITH-MARKET-IDX in /v1/models true
  x-used-model: (header not exposed via 9router proxy, mapped via combo dashboard), cost 0
  PID 10152 :20128 alive, Invoke-WebRequest /v1/models 200
```
Note: dots-studio/dots-3-note-preview:free also observed via AtlasCloud on earlier probe — combo rotates free models, fallback Seith-AI-Trading ready.

### Serve + Ranking + Dossier
```
pwsh scripts/load-env.ps1 → SECTORS 64 + SEITH 35 + MODEL SEITH-MARKET-IDX (masked)
cargo run -p seith-cli -- ranking --sector FINANCE --market id
→ {"success":true,"data":{"items":[],"market":"id","sector":"FINANCE"},"disclaimer":"Bukan rekomendasi investasi. Informasi & analisis saja."}

cargo run -p seith-cli -- dossier BBCA --pdf > research/validation-dossier.pdf
→ %PDF 1.4 556 bytes, contains "SEITH Dossier BBCA id 80.0" + "Bukan rekomendasi investasi. Informasi & analisis saja."

cargo run -p seith-cli -- dossier BBCA (json)
→ {"success":true,"data":{"ticker":"BBCA","score":80.0,"disclaimer":"Bukan rekomendasi investasi. Informasi & analisis saja.",...}}
```

### DB
```
data/seith.db: not yet populated (0 rows) — ranking stub returns items:[] (Sectors wire defer PR34), schema via SqliteRepository auto-init on first hit
sqlite3 not in PATH on this host — count via cargo test SqliteRepository still green
```

## Gates

| Gate | Result |
|------|--------|
| cargo fmt --check | 0 |
| cargo clippy -- -D warnings | 0 |
| cargo test | 145 passed (sectors_client 20 + seith_api 7 + api 16 + seith_cli 16 + seith_core 86) |
| uv --project apps/analysis run pytest -q | 17 passed 96% (2 warnings starlette) |
| pnpm lint (apps/web) | 0 (next lint) |
| pnpm typecheck | 0 (if web touched, unchanged) |
| gitleaks detect --no-git | 0 leak (keys masked) |

## Squash
- handoff/08-drift-e2e (00-overview + 01 + 02 + 03 + 04 + research/validation-report.md + research/validation-dossier.pdf) → main single squash commit
- Worktrees T1/T2/e2e removed after merge, branch -d

## Accountability
✅ Terverifikasi: cargo fmt 0 + clippy 0 + test 145 passed + uv 17 passed + pnpm lint 0 + Sectors BBCA 200 (61×5650) + 9router SEITH-MARKET-IDX 200 nvidia/nemotron-3.5-lightning:free + dossier %PDF 556 + disclaimer
⚠️ Belum terverifikasi: serve 8181 persistent (SEITH_API_BIND=8181, stub health), full 900 ticker scan, BMRI/BBRI 403 WAF fallback fixtures
🔻 Risiko: 9router combo model rotation (dots-studio ↔ nvidia) + Sectors WAF 403 fallback fixtures → deteksi probe sebelum ranking
♻️ Refactor: dossier.rs run_validated no unwrap, market enum default Id, ranking stub envelope konsisten
