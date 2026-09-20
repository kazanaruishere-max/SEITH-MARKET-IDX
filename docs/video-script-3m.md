# SEITH — 3-Minute Video Demo Script (ElevenLabs Voiceover & Storyboard)

Dokumen ini adalah skrip resmi voiceover dan panduan rekam layar (*screen-recording storyboard*) untuk video penjurian 3 menit (180 detik) Sectors Hackathon 2026 — Track 3: Market Intelligence.

> **Target Durasi:** 2 menit 45 detik – 2 menit 55 detik  
> **Kecepatan Artikulasi ElevenLabs:** ~110 kata/menit  
> **Total Kata:** 299 kata (terkalibrasi agar tidak melebihi batas 3 menit)

---

## 1. Rekomendasi Parameter ElevenLabs

| Parameter | Pengaturan | Penjelasan & Alasan |
|---|---|---|
| **Voice Model** | `Eleven Multilingual v2` | Menghasilkan intonasi Bahasa Indonesia yang paling natural, artikulatif, dan lancar dalam menyebutkan istilah teknis finansial berbahasa Inggris. |
| **Pilihan Suara (Voice)** | **Adam** / **Daniel** (Male) atau **Rachel** / **Sarah** (Female) | Karakter suara tegas, tenang, berwibawa, dan analitis khas presentasi institusional / Bloomberg TV. |
| **Stability** | `0.50` (50%) | Menjaga keseimbangan antara dinamika emosi storytelling (*engaging*) dan stabilitas ritme bicara. |
| **Similarity** | `0.78` (78%) | Memastikan artikulasi pengucapan angka, kode tiker bursa (B-B-C-A, S-I-D-O), dan rumus kuantitatif terdengar jelas. |
| **Style Exaggeration** | `0.10` (10%) | Sedikit aksentuasi energi tanpa terdengar hiperbolis atau dibuat-buat. |
| **Speaker Boost** | `ON` (Aktif) | Memperkuat kejelasan suara dan kedalaman frekuensi vokal narator. |
| **Speed** | `1.00x` | Kecepatan bicara normal. Hasil render vokal bersih: **~2 menit 45 detik - 2 menit 52 detik**. |

---

## 2. Naskah Utuh Siap Copy-Paste ke ElevenLabs

Salin seluruh teks di dalam blok kuotasi di bawah ini langsung ke editor teks ElevenLabs:

```text
Dari sembilan ratus saham di Bursa Efek Indonesia, ada satu dilema klasik: apakah saham ini murah karena terdiskon wajar, atau murah karena value trap?

Screener konvensional gagal menjawabnya. Mereka hanya menyajikan tumpukan angka mentah tanpa konteks kecerdasan pasar.

SEITH hadir sebagai mesin market intelligence untuk pasar modal Indonesia. 

Setiap emiten dievaluasi dengan Mispricing Score nol hingga seratus, ditopang empat pilar kuantitatif: tiga puluh persen return proyeksi, dua puluh persen anomali harga, tiga puluh persen kualitas valuasi, dan dua puluh persen momentum sektor.

Transparan, deterministik, dan dapat diaudit hingga level terminal.

Mari uji pada data nyata.

Pertama, B-B-C-A. Skor tujuh puluh lima koma tiga di jajaran teratas. Return on Equity dua puluh persen mengonfirmasi kekuatan fundamentalnya.

Kedua, S-I-D-O. Skornya tinggi, namun radar mendeteksi lonjakan volume di atas dua standar deviasi tanpa katalis fundamental — sinyal peringatan dini.

Ketiga, A-N-T-M. Fundamentalnya solid dengan skor kualitas sembilan puluh lima, namun model kuantitatif mendeteksi tekanan jual ekstrem dengan Z-score minus dua koma empat puluh satu. 

Tiga emiten, tiga dinamika berbeda, disaring secara objektif.

Fitur andalan ini kami sebut: Money Leak Radar. 

Sistem memindai seratus emiten secara simultan untuk mendeteksi anomali dua arah: saham yang melonjak irasional akibat spekulasi, atau saham berkualitas yang tertekan kepanikan pasar sesaat.

Persilangan data fundamental dan model kuantitatif ini selesai dianalisis dalam hitungan detik.

Kami juga menjunjung kejujuran metodologi.

Akurasi sinyal delapan puluh lima persen dihitung secara cross-sectional dari data bursa riil. 

Untuk simulasi portofolio lima puluh dua pekan, kami transparan melabelinya sebagai proyeksi sintetis karena database lokal saat ini memuat lima ratus baris historis. Kami menolak memalsukan rekam jejak.

Di baliknya, SEITH berjalan di atas Sectors API sebagai sumber data inti, model K-line Kronos, dan mesin komputasi Rust yang cepat dan hemat memori.

SEITH: derived insight yang dapat dipakai hari ini.

Bukan rekomendasi investasi. Track tiga: Market Intelligence.
```

---

## 3. Storyboard & Panduan Rekam Layar (Scene-by-Scene)

| Timecode | Segmen & Tema | Aksi Layar & Visual Cue | Isi Voiceover (Ringkasan) |
|---|---|---|---|
| **0:00 – 0:20** | **SEGMEN 1: Masalah (Dilema Investor)** | Layar gelap terminal, transisi ke tabel screener saham biasa (banyak angka statis PE/PB yang membosankan). Zoom-in ke angka PE rendah yang menipu. | *"Dari 900 saham di IDX... murah wajar atau value trap? Screener biasa gagal menjawabnya..."* |
| **0:20 – 0:50** | **SEGMEN 2: Solusi (Mispricing Score)** | Buka browser `http://localhost:3000`. Tampilkan UI Bloomberg Terminal Dark. Sorot Heatmap Treemap 50 emiten hijau-merah dan banner pilar `30ER · 20\|Z\| · 30QV · 20SM`. | *"SEITH hadir sebagai mesin market intelligence... Mispricing Score 0–100 dari 4 pilar kuantitatif... Transparan dan dapat diaudit hingga level terminal..."* |
| **0:50 – 1:05** | **SEGMEN 3a: Bukti BBCA (Kualitas)** | Buka `/dossier/BBCA`. Sorot badge header `75.3 / 100`, lalu sorot kartu `FAKTOR MISPRICING // 30/20/30/20` yang menampilkan pilar `Quality/Value: 100.0`. | *"Pertama, BBCA. Skor 75.3 di jajaran teratas. ROE 20% mengonfirmasi kekuatan fundamentalnya..."* |
| **1:05 – 1:20** | **SEGMEN 3b: Bukti SIDO (Volume Alert)** | Buka `/ranking`, sorot baris `SIDO` dengan badge merah `ALERT !Z`. Buka `/dossier/SIDO`. | *"Kedua, SIDO. Skor tinggi, namun radar mendeteksi lonjakan volume > 2σ tanpa katalis fundamental..."* |
| **1:20 – 1:35** | **SEGMEN 3c: Bukti ANTM (Anomali Dump)** | Buka `/dossier/ANTM`. Sorot badge merah `FLAG \|Z\| -2.41`. Tunjukkan koridor proyeksi Kronos dan perbandingan skor pilar `QV: 95.0` vs Z-Score `-2.41`. | *"Ketiga, ANTM. Fundamental solid skor 95, namun model mendeteksi tekanan jual ekstrem Z -2.41... tiga dinamika berbeda disaring objektif."* |
| **1:35 – 2:05** | **SEGMEN 4: Money Leak Radar** | Kembali ke homepage `/`, scroll ke panel `ANOMALY RADAR \|Z\|>2 (MONEY LEAKS)`. Sorot bar deviasi merah horizontal: KINO ke kanan (+3σ Over) dan ADES / ANTM ke kiri (-3σ Under). | *"Fitur andalan: Money Leak Radar... memindai 100 emiten mendeteksi anomali dua arah: lonjakan spekulatif atau kepanikan pasar sesaat... selesai dianalisis dalam hitungan detik."* |
| **2:05 – 2:32** | **SEGMEN 5: Kejujuran Metodologi** | Buka `/backtest` (Strategy Tester). Sorot badge hijau `VERIFIED FAKTA` pada Signal Accuracy (85%), lalu badge oranye `SYNTHETIC PROJECTION (52W)` dan teks transparansi database 500 baris. | *"Kami menjunjung kejujuran metodologi... Akurasi sinyal 85% dihitung cross-sectional data riil... Simulasi 52 pekan transparan proyeksi sintetis... Kami menolak memalsukan rekam jejak."* |
| **2:32 – 2:55** | **SEGMEN 6: Tech Depth & Closing** | Buka terminal: jalankan `cargo test` (tampilkan 172 tests passed). Kembali ke browser di dossier emiten, klik tombol `EXPORT PDF (VECTOR)` dan buka sekilas PDF A4 2-halaman. Tutup dengan logo SEITH. | *"SEITH berjalan di atas Sectors API, Kronos K-line, dan Rust engine... SEITH: derived insight yang dapat dipakai hari ini. Bukan rekomendasi investasi. Track tiga: Market Intelligence."* |

---

## 4. Tips Sinkronisasi Video Editing

1. **Sinkronisasi Beat Visual dengan Audio**:
   - Potong visual (*hard cut*) tepat saat narator menyebutkan nama emiten berikutnya (*"Pertama, B-B-C-A"*, *"Kedua, S-I-D-O"*, *"Ketiga, A-N-T-M"*).
2. **Kursor Mengikuti Narasi**:
   - Arahkan kursor mouse ke elemen yang sedang dibicarakan narator:
     - Saat menyebut *"tiga puluh persen return proyeksi..."* $\rightarrow$ arahkan kursor ke bar breakdown pilar.
     - Saat menyebut *"lonjakan volume di atas dua standar deviasi..."* $\rightarrow$ arahkan kursor ke badge `ALERT !Z`.
     - Saat menyebut *"Money Leak Radar..."* $\rightarrow$ arahkan kursor ke bar merah horizontal -3σ / +3σ.
3. **Background Music (BGM)**:
   - Volume musik dijaga di -18dB hingga -22dB di bawah vokal.
   - Matikan musik tepat pada kalimat terakhir: *"Bukan rekomendasi investasi. Track tiga: Market Intelligence."* lalu hening 1 detik sebelum video selesai.
