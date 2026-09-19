# Task 03 — Rust Blob PDF Enrichment (`crates/seith-core/src/dossier.rs`)

## Objective
Meningkatkan generator blob PDF di backend Rust (`to_pdf_bytes`) dari sebelumnya hanya 4 baris teks minimalis menjadi dokumen PDF terstruktur yang memuat ringkasan eksekutif, dekomposisi pilar, data peer, dan memo riset.

## Implementation Details
1. `crates/seith-core/src/dossier.rs`:
   - Buat format stream PDF text yang memuat:
     - Header dokumen: `SEITH DOSSIER // MARKET INTELLIGENCE [TICKER] [MARKET]`
     - Skor komposit dan status degradasi model.
     - Dekomposisi 4 pilar: `ER: {er:.1} | |Z|: {z:.1} | QV: {qv:.1} | SM: {sm:.1}`.
     - Proyeksi Kronos: `Forecast Return: {fr:.2}% | Volatility: {vol:.2}%`.
     - Tabel Peer Benchmark (hingga 5 emiten).
     - Rangkuman Memo Riset Multi-Agent (Synthesizer, Fundamental, Technical).
     - Disclaimer legal wajib: `Bukan rekomendasi investasi. Informasi & analisis saja.`
2. Penyesuaian `pdf_escape`:
   - Pastikan karakter khusus (parentheses, backslash, non-ASCII) di-escape secara aman untuk stream PDF sintaks Type 1 font standard.
