# 03 — Market Intelligence Gate (Reveal) — Garis Mati-Hidup

> Track: `hackathon.sectors.app/tracks/market-intelligence` — **What must be true:** *derived insight* (bukan data itu sendiri).

## 6 Qualifier — Harus Ada Minimal 1, Ideal 5

| Qualifier | SEITH Jawab | Contoh FAIL Jika Absen |
|---|---|---|
| Signals/scores | Mispricing Score 0-100 (30/20/30/20 explainable) | Hanya PE/PB mentah |
| Rankings | IDX Anomaly Rank (market-wide & per-sektor) | Sort PE doang = bukan ranking custom |
| Screener custom logic | Filter + rank logika tim (bukan `PE>10`) | Screener generik BEI = FAIL |
| Anomaly detection | Flag `|Z|>2` + volume spike>2σ tanpa katalis | Flag tanpa reason |
| Comparative analysis | Peer comparison 5 + sector median per market | Solo ticker |
| Synthesized research | Dossier 1-page: breakdown + peer + Kronos chart + 3-agent memo (Fund/Tech/Synth → 9router) | Chart doang |

Raw display/visual ulang secantik Bloomberg tetap **FAIL**.

## Hard Rules Tier-0

- **Sectors = CORE** — cabut = produk mati.
- **No auto trade execution** — hanya informasi & analisis.
- **Disclaimer** `Bukan rekomendasi investasi` di **setiap** insight view (Web footer + dossier + PDF + CLI `--json` field).
- **Repo public** `19 Aug–30 Sep 2026`, freeze saat submit, commit history diverifikasi.

## Screening Kritis Sebelum Merge

```text
1) Fitur ini menambah skor/ranking/anomaly/comparative/research atau cuma display?
2) Jika Sectors dicabut, apakah mati? (Jika tidak → bukan MI)
3) Apakah ada `excluded:[{ticker,reason}]` + `disclaimer` + `insufficient_data` jika cleansing?
```

Tanpa 3 jawaban → PM veto.
