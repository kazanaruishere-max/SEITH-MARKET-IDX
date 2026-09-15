# SEITH — Prompt Video Gemini Omni (Teaser 1m + Judging 3m)

Design Read: hackathon proof-video untuk juri Sectors Track 3, dengan bahasa Bloomberg-dark terminal, leaning ke screen-record nyata + kinetic type + chart-build animation.

Dials: VARIANCE 6 / MOTION 5 / DENSITY 6. Satu aksen amber `#fbbf24`, tidak ada gradien ungu, tidak ada bento generik, tidak ada hero tengah.

## Style Bible (berlaku untuk kedua prompt)

- Palet kunci: bg `#0B0E14`, panel `#11151D`, teks `#E4E4E7`, redup `#a1a1aa`, aksen amber `#fbbf24`, merah anomali `#ef4444` area 10%.
- Chart: garis actual zinc solid 2px, forecast amber dashed 2px `4 3`, pita ±2σ merah 10%, grid `#1F2430` 1px, angka font mono tabular.
- Tipo: display sans grotesk (Geist/Space Grotesk/IBM Plex Sans), mono untuk angka (JetBrains Mono/IBM Plex Mono). Judul ≤8 kata, sub ≤20 kata.
- Gerak: line-draw 1.2s `cubic-bezier(0.16,1,0.3,1)`, reveal stagger 60ms, transisi hard-cut atau dip 6 frame. Hormati `prefers-reduced-motion` untuk versi statis.
- Audio: bed tensi rendah 70-80 BPM, ducking -12dB di bawah VO, tick data 2kHz -20dB, whoosh hanya saat transisi babak.
- VO: Bahasa Indonesia, istilah teknis English (Mispricing Score, peer, anomaly, dossier). Kecepatan 140-150 kata/menit. Larangan kata: delve, foster, leverage, utilize, robust, cutting-edge, paradigm shift, game changer, tapestry, realm, multifaceted, transformative, elevate, embark, supercharge, harness. Larangan pola: "It's not X it's Y", throat-clearing ("Here's the thing"), "yang semua orang lewatkan", reveal kolon dramatis, puffery ("menandai momen pivotal").
- Fakta kunci (pakai angka ini, jangan karang): BBCA skor 61.3 rank 44 FINANCE z 1.53; top LPKR |Z| 2.98; MEDC 69.82; universe FINANCE25/ENERGY20/CONSUMER20/INFRA20/OTHER15; scoring `30%ER+20%(100-|Z|)+30%QV+20%SM`; Kronos `predict_batch 400→20 T1.0 top_p0.9 max_context 512`; envelope `{success,data,error,pagination}` + `x-schema-version`; disclaimers "Bukan rekomendasi investasi" tiap view; freeze 30 Sep 2026 23:59 WIB; no auto trade.
- Footage wajib screen-record nyata (bukan mockup): `seith ranking --sector FINANCE`, web `/ /ranking /dossier/BBCA /backtest`, `dossier BBCA --pdf`, `GET /api/v1/anomalies?market=id&minZ=2.0&pageSize=5`, chart 400 actual + 20 forecast.
- Render: 1920x1080 16:9 30fps H.264 12-15 Mbps, audio 48kHz, safe margin 5%, subtitle ID terbakar opsional, export `.mp4` + thumbnail 1280x720.

---

## PROMPT 1 — Teaser 60 detik (copy-paste ke Gemini Omni)

```text
Buat video 60 detik 16:9 tentang SEITH Market Intelligence IDX.
Gaya: terminal Bloomberg gelap #0B0E14, panel #11151D, teks #E4E4E7,
satu aksen amber #fbbf24. Chart zinc #a1a1aa actual vs amber dashed
forecast + pita merah 10% ±2σ. Sans grotesk + angka mono tabular.
Tanpa gradien ungu, tanpa bento generik, tanpa hero tengah.

SHOT 0-8s HOOK. Layar gelap, kursor mengetik:
"seith ranking --sector FINANCE". Cut ke tabel ranking: kolom
ticker/skor/flag. VO: "Data mentah tidak cukup. Rina butuh lima
kandidat dalam enam puluh detik." On-screen: "60s ranking → deep dossier".

SHOT 8-30s BUKTI. Line-draw chart BBCA 1.2s: 400 titik zinc lalu
20 titik amber dashed + pita ±2σ fade-in. Lower third:
"BBCA 61.3 · rank 44 · FINANCE · z 1.53". Cut ke dossier peer5
FINANCE + tombol export PDF 2 halaman. VO: "Skor mispricing
tiga puluh ER, dua puluh anomali, tiga puluh quality-value,
dua puluh momentum sektor. Peer dipilih se-sektor, bukan acak."

SHOT 30-50s ANOMALI. Bar Top5 |Z| stagger 60ms: LPKR 2.98 di
puncak merah. Cut ke backtest equity 12 vs IHSG + footer
"Bukan rekomendasi investasi". VO: "Flag menyala saat |Z|
lewat dua atau volume spike tanpa katalis. Empat puluh dua
anomali terpantau, lima teratas tampil duluan."

SHOT 50-60s CTA. Ketik "seith dossier BBCA --pdf", PDF terbuka,
logo SEITH + "Reveal IDX · Freeze 30 Sep 2026". VO: "SEITH.
Skor yang bisa dipakai hari ini." Musik berhenti di logo,
hening 0.5 detik sebelum cut.

Batasan: screen-record nyata, bukan slide. Tanpa kata delve,
leverage, robust, cutting-edge. Tanpa pola "It's not X it's Y".
```

### Tabel waktu Teaser

| TC | Visual | Teks layar | VO verbatim | Transisi/Audio |
|---|---|---|---|---|
| 0-8 | Ketik ranking → tabel FINANCE | 60s ranking → deep dossier | Data mentah tidak cukup. Rina butuh lima kandidat dalam enam puluh detik. | Hard-cut, tick 2kHz |
| 8-30 | Chart-build BBCA + dossier peer5 → PDF | BBCA 61.3 · rank 44 · z 1.53 | Skor mispricing tiga puluh ER, dua puluh anomali, tiga puluh quality-value, dua puluh momentum sektor. | Line-draw 1.2s, whoosh |
| 30-50 | Bar Top5 LPKR 2.98 + equity vs IHSG | Bukan rekomendasi investasi | Flag menyala saat \|Z\| lewat dua atau volume spike tanpa katalis. | Stagger 60ms, ducking -12dB |
| 50-60 | Export PDF → logo Reveal IDX | Freeze 30 Sep 2026 | SEITH. Skor yang bisa dipakai hari ini. | Dip 6 frame, hening 0.5s |

---

## PROMPT 2 — Judging 180 detik (copy-paste ke Gemini Omni)

```text
Buat video judging 180 detik 16:9, struktur problem → audience →
workflow → tech depth → proof. Gaya sama dengan teaser:
#0B0E14, #11151D, #E4E4E7, #a1a1aa, amber #fbbf24 tunggal.
Tanpa gradien ungu, tanpa eyebrow tiap seksi, tanpa CTA ganda.

BABAK 1 0-30s PROBLEM. Split-screen: kiri tabel PE/PB mentah
yang membosankan, kanan Rina menatap jam 60 detik. VO:
"Retail tenggelam di tabel mentah. Budi butuh peer dan flag
untuk briefing pagi. Auto trade dilarang, jadi insight harus
jujur." On-screen: "Value trap vs murah berkualitas".

BABAK 2 30-60s AUDIENCE. Journey 3 langkah: ranking → dossier →
PDF. Web :3000 dan CLI berbagi seith-core, kontrak envelope
{success,data,error,pagination}. VO: "Rina paham ranking dalam
satu menit. Budi buka dossier, bandingkan peer, ekspor PDF
dua halaman."

BABAK 3 60-140s WORKFLOW 8 GERBANG. Montase cepat, tiap gerbang
2-4 detik dengan label mono: [1] Sectors batch chunks(20)
Authorization [2] cleansing: OHLC wajib, volume→0,
median+insufficient_data, lookback>512→422 [3] Kronos :8001
predict_batch 400→20 T1.0 top_p0.9 [4] scoring
30/20/30/20 clamp 0-100 [5] ranking + flag |Z|>2/vol>2σ
[6] agents Lite Fund/Tech/Synth :8002→9router, fallback
degraded [7] dossier 9 seksi peer QV+cap±50% [8] hybrid API+CLI+Web.
VO membacakan tiap gerbang satu kalimat, tanpa jargon kosong.

BABAK 4 140-165s TECH DEPTH. Diagram cache: moka L1 <1ms +
SQLite L2 persist, demo offline tanpa hit Sectors. Enum market
Id default, Sg flag. VO: "Cabut Sectors, produk mati. Cache
bertahan restart. Seratus persen infra gratis."

BABAK 5 165-180s PROOF. BBCA live close 6325 → 20 prediksi.
MEDC 69.82 teratas. Universe 25/20/20/20/15. Freeze 30 Sep
2026 23:59 WIB. VO: "BBCA 61.3 rank 44. LPKR |Z| 2.98 teratas.
Ini yang juri bisa verifikasi di repo."

Batasan: footage working nyata, disclaimer tiap insight,
tanpa kata larangan slop, tanpa pola "It's not X it's Y".
```

### Tabel waktu Judging

| TC | Visual | Teks layar | VO verbatim |
|---|---|---|---|
| 0-30 | Split mentah vs jam 60s | Value trap vs murah berkualitas | Retail tenggelam di tabel mentah. Budi butuh peer dan flag untuk briefing pagi. |
| 30-60 | Journey ranking→dossier→PDF | envelope success/data/pagination | Rina paham ranking dalam satu menit. Budi buka dossier, ekspor PDF dua halaman. |
| 60-140 | 8 gerbang label mono | chunks(20) · 400→20 · 30/20/30/20 · \|Z\|>2 | Satu kalimat per gerbang, ikut label di layar. |
| 140-165 | Diagram L1+L2 + enum Id/Sg | moka <1ms · SQLite persist · 100% gratis | Cabut Sectors, produk mati. Cache bertahan restart. |
| 165-180 | BBCA 6325→prediksi + universe | Freeze 30 Sep 2026 23:59 WIB | BBCA 61.3 rank 44. LPKR 2.98 teratas. Verifikasi di repo. |

---

## Checklist footage (rekam sebelum generate)

1. `cargo run -p seith-cli -- ranking --sector FINANCE` (tabel 5 baris).
2. `cargo run -p seith-cli -- dossier BBCA --pdf` (keluar `%PDF-1.4`, 612x792).
3. Web: `/` hero TopLeaks, `/ranking` sortable, `/dossier/BBCA` gauge+peer5+chart, `/backtest` equity vs IHSG.
4. `GET /api/v1/anomalies?market=id&minZ=2.0&pageSize=5` (LPKR 2.98 di atas).
5. Close-up chart: 400 zinc + 20 amber dashed + pita ±2σ.

## Negative prompt (tempel di kolom negatif Gemini)

```
purple gradient, glassmorphism everywhere, centered hero, three
equal feature cards, generic bento grid, mockup laptop miring,
stock handshake, robot menunjuk chart, delve, leverage, robust,
cutting-edge, "it's not X it's Y", throat-clearing, puffery,
em-dash beruntun, emoji di heading, auto trade, rekomendasi beli
```

## QA akhir (centang sebelum submit)

- [ ] Tiap klaim ada di footage atau output perintah nyata.
- [ ] Disclaimer tampil tiap view insight.
- [ ] Tidak ada kata/pola larangan slop.
- [ ] Satu aksen amber, audit tiap seksi.
- [ ] Subtitle sinkron, nama ticker benar (BBCA/BMRI/ADRO/TLKM/GOTO).
- [ ] Durasi 60±2s dan 180±5s, thumbnail terbaca 120px.
```
