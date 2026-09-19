# Phase 30 — Institutional Dossier PDF Overhaul — Overview

## Goal
Menghasilkan dokumen riset ekuitas derivatif berstandar institusional (Bloomberg Intelligence / Goldman Sachs Grade) dalam format PDF Vektor (`@react-pdf/renderer`) dan Server-Side Blob (Rust `to_pdf_bytes`), 100% berbasis data fakta riil emiten IDX dengan zero fabrikasi angka.

## Context
- SSOT: `AGENTS.md §3c Seven Zones + §6/§6c/§8c` + `docs/prd.md` + `docs/spec.md` + `docs/api-spec.md`
- Mandat Keras: Zero Data Fabrication — semua harga, score, rasio, dan kurva 20-titik Kronos bersumber dari API riil `/api/v1/tickers/{ticker}/dossier` dan `idx.co.id`.
- Dual Engine Export:
  1. Client-Side Vector PDF (`DossierPDF.tsx` via `@react-pdf/renderer`): Dokumen 2-halaman resolusi tinggi dengan grafik kurva vektor SVG `±2σ`, meter deviasi horizontal `Z-Score`, dan dekomposisi 4-pilar.
  2. Server-Side Blob PDF (`to_pdf_bytes` di `crates/seith-core/src/dossier.rs`): Respon binary instan via `/api/v1/tickers/{ticker}/dossier?format=pdf`.

## Scope In / Out
In:
- `apps/web/components/DossierPDF.tsx` (Redesain 2-page institutional report)
- `apps/web/app/dossier/[ticker]/DossierClient.tsx` (Perluasan interface `PdfDossier`)
- `apps/web/app/dossier/[ticker]/page.tsx` (Passing data profil riil, harga close, rank pasar)
- `crates/seith-core/src/dossier.rs` (Pengayaan text stream blob PDF terstruktur)
- `.handoff/phase-30-dossier-pdf-institutional/*` (Dokumentasi lengkap WBS 00-04)

Out:
- Perubahan model kalkulator scoring Rust (tidak menyentuh bobot 30/20/30/20)
- Perubahan inferensi Kronos Python sidecar

## WBS — Task Breakdown
| # | Task file | Slice | Dependensi |
|---|---|---|---|
| 01 | `01-pdf-schema-props.md` | Interface `PdfDossier` & passing data profil emiten | — |
| 02 | `02-vector-pdf-visual-overhaul.md` | Redesain visual 2-halaman `@react-pdf/renderer` | 01 |
| 03 | `03-rust-blob-pdf-enrichment.md` | Pengayaan blob PDF server Rust `to_pdf_bytes` | 01 |
| 04 | `04-verification-e2e.md` | Verifikasi lint, typecheck, test, dan HTTP PDF blob | 02, 03 |

## Definition of Done — Phase
1. `pnpm --dir apps/web lint` dan `pnpm --dir apps/web typecheck` 0 error/warning.
2. `pnpm --dir apps/web test` 6/6 passed.
3. `cargo fmt --check && cargo clippy -- -D warnings && cargo test` 89 passed.
4. Uji download file PDF vektor dan blob menghasilkan berkas valid dengan layout 2 halaman terstruktur.
5. Disclaimer *"Bukan rekomendasi investasi. Informasi & analisis saja."* tercantum di footer kedua halaman PDF.
