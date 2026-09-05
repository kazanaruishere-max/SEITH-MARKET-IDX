# 05 — 13 Anti-Pattern — Daftar Merah (Wajib Koreksi, Bukan Sekedar Implement)

> AI yang tidak baca file ini akan mengulang 13 kesalahan yang sama → FAIL gate atau crash di juri. Tiap anti-pattern = Gejala → Akibat → Koreksi → Test yang menangkap. **Anti-pattern #13 (skip refactor) adalah pelanggaran Boy Scout Rule §5b — PM veto jika tanpa ♻️ Refactor.**

## 1. `open/high/low/close` Missing Tidak Di-exclude

- Gejala: `unwrap()` OHLC null.
- Akibat: panic Kronos `predict` shape mismatch.
- Koreksi: `normalize.rs` → missing OHLC → `exclude ticker + reason "missing_ohlc"` + `excluded:[{ticker,reason}]` di scan.
- Test: `tests/fixtures/illiquid-ohlcv.json` → `scan` return `excluded`.

## 2. `volume/amount` Null → NaN Forecast

- Gejala: biarkan `null`.
- Akibat: `pred_df` NaN → `ER_norm` NaN → score NaN.
- Koreksi: cleansing gate `volume/amount missing → 0.0` sebelum `POST /predict_batch`.
- Test: unit `cleanse_volume_null → 0.0`.

## 3. Rasio Null Langsung 0 Tanpa Sector Median

- Gejala: `roe null → 0`.
- Akibat: skor QV manipulasi rendah → value trap salah flag.
- Koreksi: `rasio missing → sector median per market (tests/fixtures/sector-median.json) + fallback 0 + flag insufficient_data:true`.
- Test: `cleanse_missing_roe → median FINANCE id`.

## 4. `lookback + pred >512` Tidak Di-guard

- Gejala: `lookback 500 + pred 20 = 520`.
- Akibat: sidecar 422/panic, juri lihat 502.
- Koreksi: boundary Axum `lookback>512 || predLen>512 → 422 VALIDATION_ERROR`, pesan `max_context 512`.
- Test: `POST /scan {lookback:520} → 422`.

## 5. Ranking Tanpa Breakdown 4 Komponen

- Gejala: hanya `mispricingScore`.
- Akibat: tidak explainable → gagal 40% usability + Tech Depth.
- Koreksi: `components:{expectedReturn, anomalyZ, qualityValue, sectorMom}` selalu emitted + `peerPercentile`.
- Test: `GET /ranking` assert `components` present + `BarStack` di FE.

## 6. Dossier Tanpa Disclaimer

- Gejala: lupa `Bukan rekomendasi investasi`.
- Akibat: violation Tier-0, juri potong nilai.
- Koreksi: footer Web + PDF + field `disclaimer` di setiap `GET /dossier` + `score`.
- Test: `GET /dossier/BBCA` assert `disclaimer` string.

## 7. 9router Dianggap Opsional → Tidak Cek `degraded`

- Gejala: `unwrap` 9router response.
- Akibat: crash saat `localhost:20128` mati (Tier-0 tapi bisa down).
- Koreksi: `POST /synthesize → 9router` timeout 15s → fallback template memo + `degraded:true`.
- Test: mock 9router failure → `dossier.degraded == true`.

## 8. Sectors Cache Tanpa `market` Key

- Gejala: key `sector:ticker:date`.
- Akibat: IDX vs SG campur → sector median noise → mispricing salah.
- Koreksi: key `market:sector:ticker:date` (enum `Id|Sg`).
- Test: `fetch ohlcv market=sg` cache hit tidak return `id` data.

## 9. Worktree Tabrak `data/seith.db` WAL Lock

- Gejala: 2 terminal `worktree` tulis SQLite bersamaan.
- Akibat: `database is locked`.
- Koreksi: unit test pakai `:memory:`, integration pakai file lock + `busy_timeout 3000`, atau T1/T2 slice beda sector/market.
- Test: `CompositeCache` concurrent test.

## 10. CLI dan REST Envelope Beda

- Gejala: `seith ranking --json` output beda shape.
- Akibat: drift → juri `cargo test` vs Web beda hasil.
- Koreksi: CLI reuse `seith-core` crate + envelope `{success,data,error,pagination}` identik + contract test `CLI JSON ≡ REST JSON`.
- Test: `assert_cmd` CLI vs `axum-test` REST snapshot.

## 11. Dashboard Bloomberg Tanpa Derived Insight

- Gejala: Bloomberg dark cantik + DataViz recharts tapi hanya display `open/high/low/close` + `PE/PB` sortable.
- Akibat: **FAIL Track 3** — `What does not qualify: only displays raw Sectors data`.
- Koreksi: setiap visual harus derivasi `score/ranking/anomaly`. Raw hanya di tooltip/detail.
- Test: gate `03-market-intelligence-gate.md` checklist sebelum merge.

## 12. Commit Tanpa Accountability Block

- Gejala: claim `selesai` tanpa output nyata.
- Akibat: fabrikasi → PM veto, juri anggap fake demo.
- Koreksi: tiap task ubah file akhiri `✅ Terverifikasi: <cmd> → <output> / ⚠️ Belum / 🔻 Risiko` + paste `cargo test` output.
- Test: `seith-pm` gate cek block present.

## 13. Skip Refactor — Debt Ditunda Meledak di H4/H5

- Gejala: claim `selesai` tanpa `♻️ Refactor:`, `fn >50 baris`, `file >400 baris`, `dead code` dibiarkan, `cargo clippy --fix` tidak jalan.
- Akibat: `30% Technical depth` jebol — juri lihat `clippy` warning + file 800 baris → debt H1 numpuk ke scoring/anomaly H4.
- Koreksi: Boy Scout Rule §5b — tiap task ubah file WAJIB `cargo fmt` + `cargo clippy --fix` + hapus dead code + extract jika >50 baris + `♻️ Refactor: <apa>` di Accountability Block. Workflow `Understand → Plan → Implement → Verify → Refactor → Document`.
- Test: `refactor-cleaner` scan `fn <50`, `file 200-400`, `nesting ≤4`, `no dead code` — PM veto jika tanpa `♻️ Refactor:`.

---

## Cara Koreksi — Ritual

Sebelum code, jawab 3 pertanyaan `00-readme.md`. Saat review, `rust-reviewer` cek 1-6, `security-reviewer` cek 6-8, PM cek 10-12.
