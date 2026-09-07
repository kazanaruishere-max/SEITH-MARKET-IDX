# ADR 0005 — Hybrid Delivery (Axum API + CLI + Web + Dossier)

## Status
Accepted — 2026-09-07

## Context
Phase 05 wire `scoring/anomaly/ranking` jadi `Axum /api/v1/*` + `seith-cli clap` + `Next.js FE` + `Dossier 1-page`. Prereq H4 DONE `main 929b554`. Envelope `{success,data,error,pagination}` + `x-schema-version: SCHEMA_VERSION 1.0.0` + `Market Id|Sg`.

## Decision
- **Axum + Tokio** (bukan Actix): share `seith-core` crate workspace, `tower-http` trace/limit, `SCHEMA_VERSION` header per response, `deny_unknown_fields` di boundary.
- **Envelope strict** — `success bool`, `data?T`, `error?{code,message}`, `pagination?{page,pageSize,total}` — CLI `--json` identik REST (contract test `mockito` + `assert_cmd`).
- **Validation:** `Market::from_str` strict `id|sg` → `422 VALIDATION_ERROR`, `ticker ^[A-Z0-9]{3,6}$` normalize `BBCA.JK→BBCA`, `lookback>512→422`, `pageSize max50 clamp`, `tickers 1-50`.
- **Dossier PDF:** Rust `seith-core/dossier.rs` `compose() → DossierJson` + `to_pdf_bytes() → Vec<u8> %PDF` simple (no heavy crate) — Web pakai `@react-pdf/renderer 3.4.4` sudah di `apps/web/package.json` untuk render client.
- **Web consume via REST only** — `apps/web/lib/api.ts` `fetch /api/v1/*` + `zod` envelope — no direct `crates/*` import (§3c cross-zona).
- **Cache/LLM:** `CompositeCache market:sector:ticker:date` + `degraded:true` fallback jika `Kronos :8001` / `9router :20128` down — MI tetap lolos.

## Consequences
- Contract test wajib `CLI json ≡ REST json` per market — drift = FAIL.
- `sort/order` + `deny_unknown_fields` 422 di boundary — client typo fail fast.
- PDF simple bytes di Rust — cukup untuk `seith dossier --pdf`; rich layout di Web via `@react-pdf`.

## Alternatives Considered
- Actix-web: ditolak — Axum lebih idiomatik Tokio + sudah di `Cargo.toml` workspace.
- `printpdf` crate: ditolak — heavy dep untuk 1-page simple; `%PDF` bytes cukup, Web handle rich PDF.
