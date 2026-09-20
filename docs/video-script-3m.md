# SEITH — 3-Minute Video Demo Script (ElevenLabs Voiceover & Storyboard)

Dokumen ini adalah skrip resmi voiceover dan panduan rekam layar (*screen-recording storyboard*) untuk video penjurian 3 menit (180 detik) Sectors Hackathon 2026 — Track 3: Market Intelligence.

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
| **Speed** | `1.00x` | Kecepatan bicara normal (~135 kata/menit). Total durasi vokal bersih: **~2 menit 45 detik - 2 menit 55 detik**. |

---

## 2. Naskah Utuh Siap Copy-Paste ke ElevenLabs

Salin seluruh teks di dalam blok kuotasi di bawah ini langsung ke editor teks ElevenLabs:

```text
Ada sekitar sembilan ratus saham yang terdaftar di Bursa Efek Indonesia. 

Bagi investor dan analis, ada satu pertanyaan krusial yang sulit dijawab dengan cepat: apakah saham ini murah karena memang terdiskon wajar — atau murah karena fundamentalnya sedang bermasalah dan menjadi value trap?

Screener biasa gagal menjawab dilema ini. Mereka hanya menyajikan tumpukan angka mentah tanpa konteks kecerdasan pasar.

Inilah mengapa kami membangun SEITH — mesin market intelligence untuk bursa saham Indonesia. 

Setiap emiten kami evaluasi menggunakan Mispricing Score dari nol hingga seratus. Skor ini dihitung deterministik dari empat pilar kuantitatif: tiga puluh persen return proyeksi, dua puluh persen anomali deviasi harga, tiga puluh persen kualitas dan valuasi, serta dua puluh persen momentum sektor.

Bukan kotak hitam. Setiap komponen transparan, terukur, dan dapat diverifikasi ulang oleh siapa saja hingga ke level terminal.

Mari kita uji pada data nyata.

Pertama, B-B-C-A. Skor tujuh puluh lima koma tiga, masuk jajaran teratas. Pilar fundamentalnya terhubung langsung ke data resmi bursa: Return on Equity dua puluh persen dan rasio valuasi yang sehat. Sistem mengonfirmasi kekuatan fundamentalnya.

Kedua, S-I-D-O. Skornya menarik, namun radar mendeteksi peringatan dini: lonjakan volume abnormal di atas dua standar deviasi tanpa katalis fundamental. Ini adalah sinyal kehati-hatian.

Dan ketiga, A-N-T-M. Di sinilah letak perbedaan SEITH. Fundamental ANTM sangat kuat dengan skor kualitas sembilan puluh lima. Namun, model proyeksi teknikal mendeteksi tekanan jual ekstrem dengan skor Z minus dua koma empat puluh satu. 

Sistem menandainya sebagai divergensi anomali statistik. Tiga emiten, tiga dinamika berbeda, disaring secara objektif.

Fitur andalan ini kami sebut: Money Leak Radar. 

Sistem memindai seratus emiten secara simultan untuk mendeteksi divergensi statistik dua arah: saham yang melonjak irasional karena spekulasi, atau saham berkualitas yang tertekan tajam akibat kepanikan pasar sesaat.

Menemukan anomali ini mustahil dilakukan hanya dengan membaca satu grafik candlestick atau satu laporan keuangan. Dibutuhkan persilangan data fundamental resmi dan model kuantitatif canggih — dan SEITH menyelesaikannya dalam hitungan detik.

Kami juga menjunjung tinggi kejujuran intelektual.

Akurasi sinyal delapan puluh lima persen pada dua puluh emiten teratas dihitung secara cross-sectional langsung dari data bursa riil. 

Untuk simulasi portofolio lima puluh dua pekan, kami secara transparan menyatakan statusnya sebagai proyeksi sintetis, karena basis data lokal kami saat ini memuat lima ratus baris historis. Kami menolak memalsukan rekam jejak masa lalu demi terlihat sempurna.

Di balik antarmuka ini, SEITH beroperasi di atas Sectors API sebagai sumber data inti, model fondasi K-line Kronos dua belas miliar token, dan mesin komputasi Rust yang cepat serta hemat memori.

SEITH: wawasan derivatif yang dapat dipakai hari ini.

Bukan rekomendasi investasi. Sectors Hackathon dua ribu dua puluh enam — Track tiga: Market Intelligence.
```

---

## 3. Storyboard & Panduan Rekam Layar (Scene-by-Scene)

| Timecode | Segmen & Tema | Aksi Layar & Visual Cue | Isi Voiceover (Ringkasan) |
|---|---|---|---|
| **0:00 – 0:25** | **SEGMEN 1: Masalah (The Dilemma)** | Tampilkan layar hitam terminal, lalu transisi ke tabel screener saham biasa (penuh angka statis PE/PB yang membosankan). Zoom-in ke angka PE rendah yang menipu. | *"Ada sekitar 900 saham di IDX... murah karena terdiskon atau value trap? Screener biasa gagal menjawab dilema ini..."* |
| **0:25 – 0:55** | **SEGMEN 2: Solusi (Mispricing Score)** | Beralih ke browser `http://localhost:3000`. Tunjukkan tampilan Bloomberg Terminal Dark. Sorot Heatmap Treemap 50 emiten hijau-merah. Sorot banner pilar `30ER · 20\|Z\| · 30QV · 20SM`. | *"Inilah mengapa kami membangun SEITH... Mispricing Score 0–100 dari 4 pilar kuantitatif... Bukan kotak hitam, dapat diverifikasi hingga level terminal..."* |
| **0:55 – 1:12** | **SEGMEN 3a: Bukti BBCA** | Buka halaman `/dossier/BBCA`. Sorot badge header `75.3 / 100`, lalu sorot kartu `FAKTOR MISPRICING // 30/20/30/20` yang menampilkan pilar `Quality/Value: 100.0`. | *"Pertama, BBCA. Skor 75.3... ROE 20% dan rasio valuasi sehat. Sistem mengonfirmasi kekuatan fundamentalnya..."* |
| **1:12 – 1:28** | **SEGMEN 3b: Bukti SIDO** | Beralih ke `/ranking`, tunjukkan baris `SIDO` dengan badge merah `ALERT !Z`. Buka `/dossier/SIDO`. | *"Kedua, SIDO. Skornya menarik (74.2), namun radar mendeteksi peringatan dini: lonjakan volume > 2σ tanpa katalis fundamental..."* |
| **1:28 – 1:45** | **SEGMEN 3c: Bukti ANTM** | Buka `/dossier/ANTM`. Tunjukkan badge merah `FLAG \|Z\| -2.41`. Sorot koridor proyeksi Kronos dan skor pilar `QV: 95.0` vs Z-Score `-2.41`. | *"Dan ketiga, ANTM. Fundamental sangat kuat skor 95... namun proyeksi teknikal mendeteksi tekanan jual ekstrem Z -2.41... tiga dinamika berbeda disaring objektif."* |
| **1:45 – 2:15** | **SEGMEN 4: Money Leak Radar** | Kembali ke homepage `/`, scroll tepat ke panel `ANOMALY RADAR \|Z\|>2 (MONEY LEAKS)`. Sorot bar deviasi merah horizontal: KINO ke kanan (+3σ Over) dan ADES / ANTM ke kiri (-3σ Under). | *"Fitur andalan: Money Leak Radar... memindai 100 emiten mendeteksi divergensi statistik dua arah... butuh persilangan data fundamental dan quant..."* |
| **2:15 – 2:40** | **SEGMEN 5: Kejujuran Metodologi** | Buka halaman `/backtest` (Strategy Tester). Sorot badge hijau `VERIFIED FAKTA` pada Signal Accuracy (85%), lalu sorot badge oranye `SYNTHETIC PROJECTION (52W)` dan teks transparansi database 500 baris. | *"Kami menjunjung kejujuran intelektual... Akurasi sinyal 85% dihitung cross-sectional data riil... Simulasi 52 pekan transparan proyeksi sintetis... Kami menolak memalsukan rekam jejak."* |
| **2:40 – 3:00** | **SEGMEN 6: Tech Depth & Closing** | Buka terminal: jalankan `cargo test` (tampilkan 172 tests passed). Kembali ke browser di dossier emiten, klik tombol `EXPORT PDF (VECTOR)` dan buka sejenak preview PDF A4 2-halaman. Tutup dengan logo SEITH. | *"SEITH beroperasi di atas Sectors API, Kronos K-line 12B tokens, dan Rust engine... SEITH: Derived insight, bukan raw data. Bukan rekomendasi investasi."* |

---

## 4. Tips Perekaman Video agar Menang 30% Storytelling

1. **Gunakan Resolusi 1080p (1920 × 1080) 16:9 60fps / 30fps**:
   - Pastikan zoom browser di angka 100% atau 90% agar grid terminal Bloomberg terlihat proporsional dan padat (*high data density*).
2. **Kursor yang Tenang**:
   - Gerakkan kursor mouse secara terarah. Jangan membuat gerakan melingkar-lingkar yang tidak perlu. Saat menyebutkan suatu metrik (misal: "Z minus dua koma empat puluh satu"), arahkan kursor tepat ke badge metrik tersebut.
3. **Audio Ducking**:
   - Jika menambahkan musik latar (*background music*), gunakan musik synth/ambient bertempo rendah (70–80 BPM) dengan volume -15dB hingga -20dB di bawah vokal ElevenLabs agar suara narasi tetap terdengar dominan dan jelas.
