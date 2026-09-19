# Task 04 — Verification E2E & Gate

## Objective
Menjalankan loop verifikasi menyeluruh di frontend dan backend Rust guna menjamin integritas kode, kebersihan type system, dan fungsi unduhan PDF.

## Verification Checklist
1. `pnpm --dir apps/web lint` (0 error / warning).
2. `pnpm --dir apps/web typecheck` (0 error).
3. `pnpm --dir apps/web test` (6/6 tests pass).
4. `pnpm --dir apps/web build` (6/6 routes pass).
5. `cargo fmt --check && cargo clippy -- -D warnings && cargo test` (89 passed).
6. Uji download berkas PDF:
   - Client Vector PDF: Verifikasi render komponen `<DossierDoc />` tanpa error layout.
   - Server Blob PDF: `GET /api/v1/tickers/BBCA/dossier?format=pdf` mengembalikan `application/pdf` dengan magic header `%PDF-1.4`.
