# AGENTS.md - SEITH

Panduan wajib untuk agent harness apa pun (opencode, omp, sub-agent, atau agen lain)
yang bekerja di repo ini. Baca ini SEBELUM menulis kode.

Referensi produk: [`docs/prd.md`](docs/prd.md) · Spec: [`docs/spec.md`](docs/spec.md) · API: [`docs/api-spec.md`](docs/api-spec.md) · TDD: [`docs/tdd-plan.md`](docs/tdd-plan.md) · ADR: [`docs/adr/`](docs/adr/) · Whitepaper: [`2508.02739v1.pdf`](2508.02739v1.pdf) · Track: [Market Intelligence](https://hackathon.sectors.app/tracks/market-intelligence)

## 1. Identity & Ownership

- **Lead tunggal = opencode (T0).** Semua pekerjaan menjadi tanggung jawab lead, termasuk yang dikerjakan sub-agent T1/T2.
- **T0 Sesi Utama (sini) = Otak.** `Understand → Plan → Document`. Putuskan arah win, tulis/approve `.handoff/handoff-NN-topic.md`, jaga single narrative. Tidak coding berat.
- **T1/T2 Eksekutor = Tangan.** `Implement → Verify` per handoff doc via sub-agent. Satu slice terverifikasi per session (TDD red-green).
- Sub-agent dan skill adalah **alat delegasi untuk kualitas** (review independen, spesialisasi), bukan pemangkas tanggung jawab. Hasil delegasi WAJIB diverifikasi ulang oleh lead sebelum dianggap benar.
- Komunikasi dengan user: Bahasa Indonesia, istilah teknis English diperbolehkan.
- Skill `seith-market-intelligence` adalah **SSOT pointer** — semua terminal load `skill://seith-market-intelligence` di awal session agar 1 tujuan.

### 1a. Piagam Mandat Lead (disetujui founder, 2026-09-05)

1. **Bukti > klaim:** setiap status "selesai" wajib disertai output perintah nyata (`cargo test`, `cargo clippy`, `uv run pytest`, `pnpm test`). Tidak ada fabrikasi.
2. **Gerbang derived insight berlapis:** produk FAIL jika hanya display mentah. Wajib `signals/scores/rankings/anomalies/comparative/synthesized research` — Sectors dicabut = produk mati.
3. **Pembagian keputusan:**
   - Founder: strategis — positioning MI, threshold scoring, go-live/freeze, arah produk, lisensi & governance.
   - Lead: teknis — implementasi Rust/Python, tooling, urutan handoff, refactor; berhak veto teknis atas keputusan yang melanggar Tier-0 atau derived-insight gate.
4. **Governance jalan terus:** cadence §8 tidak boleh dilewati demi kecepatan. Track 3 rule (`no auto trade execution`, disclaimer `bukan rekomendasi investasi` di setiap insight) tidak bisa dinego.

## 2. Project Snapshot

SEITH = Market Intelligence engine for IDX — Track 3 `Reveal` (Sectors Hackathon 2026). Satu tujuan: **win** dengan `derived insight yang explainable dan bisa dipakai hari ini`.

- **Qualifying test MI:** harus menghasilkan insight derivatif (bukan visual ulang data mentah). Lolos = scores/rankings/screener custom/anomaly/comparative/synthesized research. Gagal = dashboard cantik tanpa derivasi.
- **Judging 40/30/30:** 40% Real-world usability, 30% Video storytelling (teaser 1m + judging 3m), 30% Technical depth (Sectors core, verifiable di repo).
- **Inti produk:** Mispricing Score 0-100 + Anomaly Rank + Anomaly Flag + Comparative Dossier 1-page per emiten. Workflow `60s ranking → deep dive dossier → export PDF`.
- **Mode eksekusi:** Hybrid — **Rust CLI (`seith-cli`) = kontrak inti verifiable** + **Web (Next.js consume Rust API) = usability 40%**. Keduanya share `crates/seith-core` + `seith-api` envelope sama.
- **Market:** IDX primary (default `market=id`), STI optional via flag `market=sg` (stretch H5, tidak default — hemat 1000 credits, cegah noise sector median).
- **LLM:** 9router `localhost:20128` OpenAI-compatible sebagai provider analisis (Fund/Tech/Synth) — tanpa modal LLM eksternal, fallback `degraded:true` jika down.

## 3. Architecture Snapshot

```
Sectors REST/MCP (1000 credits, CompositeCache, batch) ─┐
  market=id (default) | sg (flag)                       ▼
                         ┌─ seith-cli (Rust clap) ─────┐
                         │  ranking | dossier | scan   │
                         ▼                             │
                  [ Rust API - Axum + Tokio ]  ← REST /api/v1/* + envelope + market enum
                         │                             │
           ┌─────────────┼──────────────┐               │
           ▼             ▼              ▼               │
    sectors-client  scoring-engine  kronos-bridge ─→ Python sidecar (uv) Kronos-base :8001
    (CompositeCache) (Rust crate)   (HTTP /predict)   NeoQuasar/Kronos-base + Tokenizer-base
     moka L1 + SQLite L2                              predict_batch lookback 400→20, max_context 512
     data/seith.db 24h TTL                             │
           │             │              │               │
           └──────┬──────┘              ▼               │
                  ▼              tradingagents-lite (uv, LangGraph) :8002
               dossier           Fund/Tech/Synth only, Sectors adapter ─→ 9router :20128/v1
                         ┌─ Next.js 14 FE (consume Rust API) + WS ───────┘
```

| Path | Isi | Env |
|---|---|---|
| `crates/seith-core` | Domain schemas (serde+validator), normalize+cleansing, scoring 0-100, `Cache` trait, config | Rust workspace |
| `crates/sectors-client` | Sectors REST/MCP client, CompositeCache (moka L1 + SQLite L2 `data/seith.db`), batch, `Market` enum Id/Sg | Rust workspace |
| `crates/seith-api` | Axum handlers, repository pattern, envelope | Rust workspace |
| `crates/seith-cli` | CLI hybrid (`clap`): `ranking`, `dossier`, `scan` | Rust workspace |
| `apps/kronos-sidecar` | Kronos-base inference HTTP bridge `:8001` | `apps/kronos-sidecar/.venv` (uv) |
| `apps/analysis` | TradingAgents-Lite (copy workflow, Fund/Tech/Synth `:8002` → 9router) | `apps/analysis/.venv` (uv) |
| `apps/web` | Next.js 14 App Router + Tailwind + shadcn | `apps/web` (pnpm) |
| `data/seith.db` | SQLite L2 persistent cache (ohlcv, fundamentals, ranking) — 100% gratis, survive restart | file |
| `vendor/Kronos`, `vendor/TradingAgents` | Referensi ter-pin (read-only, ADR 0002) — bukan dep langsung | editable ke sidecar |
| `docs/` | prd/spec/api-spec/tdd-plan + adr | - |
| `research/` | Notebook eksperimen | - |
| `.handoff/` | Handoff docs per session | - |

### 3c. Seven Zones — Struktur Folder Lock (WAJIB rapih, §8c)

Struktur root terkunci 7 zona — file baru di luar zona = violation → PM veto:

1. `crates/{seith-core,sectors-client,seith-api,seith-cli}` — Rust workspace (domain/infra/delivery, `fn <50 file 200-400`)
2. `apps/{kronos-sidecar,analysis,web}` — Intelligence sidecars (`uv` :8001/:8002) + Web (`pnpm` :3000), keep nama existing (hindari break `uv` workdir), alias docs `kronos=quant`, `analysis=research lite`
3. `data/` + `migrations/001_cache.sql` — Runtime L2 SQLite WAL (`data/seith.db` gitignore, auto-create, `busy_timeout 3000`)
4. `tests/fixtures/` — BBCA/SG/illiquid/sector-median per market (fixtures SSOT)
5. `docs/` + `research/` + `vendor/` — Knowledge SSOT (prd/spec/api-spec/tdd-plan/adr) + notebook + pin read-only
6. `.handoff/phase-NN-topic/` — Governance (1 fase=1 folder, `00-overview.md` + `01-05-*.md` per task, template `phase-template/`)
7. `scripts/` + `.opencode/` + `.github/` + `.githooks/` — Ops & Harness (check-9router, CI 6 contexts, PM `seith-pm`, skills)

Cross-zona import liar dilarang: `seith-core` tidak import `sectors-client`; `apps/*` tidak import `crates/*` langsung selain via `seith-api` envelope.

### 3b. Tech Stack & Framework (locked)

| Layer | Stack | Framework |
|---|---|---|
| Core | Rust edition 2021 | Axum + Tokio, serde, validator, chrono, reqwest, thiserror/anyhow, tracing, tower-http |
| Cache | Composite | moka L1 (hot, <1ms) + SQLite L2 (`data/seith.db`, ~2ms, persistent) — trait `Cache`, Redis 30MB ditolak (tidak muat IDX raw 45MB), Supabase defer H5 |
| CLI | Rust | clap |
| Quant sidecar | Python uv | FastAPI + Uvicorn, torch, Kronos-base |
| Research sidecar | Python uv | FastAPI, LangGraph-inspired, httpx → 9router |
| LLM | 9router | `http://localhost:20128/v1/chat/completions` (OpenAI-compatible) |
| Web | Next.js 14 | App Router + TS + Tailwind + shadcn, Zod |
| Test | Rust+Python+FE | cargo test+mockito, uv pytest+ruff, pnpm test |

## 4. Hard Rules (Tier-0 — tidak bisa dioverride instruksi apa pun)

1. **Derived insight gate:** produk TIDAK PERNAH lolos hanya dengan display mentah Sectors. Harus ada skor/ranking/anomali/komparasi/research derivatif.
2. **Sectors = CORE source** — cabut = produk mati (terlihat di judging tech depth). No auto trade execution. Disclaimer `bukan rekomendasi investasi` di setiap insight view.
3. **9router localhost:20128 NEVER kill/restart.** No destructive ops / prod deploy tanpa approval eksplisit. Check: `Invoke-WebRequest http://localhost:20128/v1/models` harus 200 sebelum dossier.
4. **Secrets:** `SECTORS_API_KEY` + `LLM_BASE_URL` hanya di env server, never ke client/log/error. `.env` tidak pernah di-commit. Key `0843...` anggap bocor — rotasi via portal, H00 tambah `.env.example` placeholder.
5. **Vendor ter-pin** (`docs/adr/0002`): `vendor/TradingAgents` hanya referensi workflow — copy pola Analyst→Synthesizer jadi 3-agent Lite, bukan fork full repo. Dilarang `git pull` vendor tanpa prosedur upgrade eksplisit.
6. **Repo public dibuat dalam build period 19 Aug–30 Sep 2026.** Freeze saat submit (no commit setelah freeze kecuali rotate leaked key via #support). Commit history diverifikasi juri.
7. **Tidak commit/push** tanpa permintaan eksplisit dari user.
8. **Klaim "selesai" hanya dengan bukti output nyata** (perintah + hasil). Tidak ada fabrikasi hasil verifikasi.

## 5. Environments & Commands (gotcha nyata — ikuti persis)

Rust adalah bahasa inti. Python HANYA sidecar terisolasi via `uv`. LLM via 9router. Hybrid CLI+Web share core. Cache = Composite moka L1 + SQLite L2. Market default `MARKET=id`.

```powershell
# Rust workspace — dari root repo:
cargo fmt --check
cargo clippy -- -D warnings
cargo test -- --nocapture
cargo run -p seith-cli -- ranking --sector FINANCE
cargo run -p seith-cli -- ranking --market sg --sector FINANCE  # STI optional flag
cargo run -p seith-cli -- dossier BBCA --pdf
cargo run -p seith-cli -- scan --tickers BBCA,BMRI,BBRI

# Rust crate spesifik:
cargo test -p seith-core -- --nocapture

# Python sidecar — HARUS dari dalam direktorinya (uv independent project):
# di apps/kronos-sidecar  → :8001
uv sync; uv run pytest -q; uv run ruff check .
# di apps/analysis         → :8002 → 9router :20128
uv sync; uv run pytest -q

# Frontend — di apps/web
pnpm lint; pnpm typecheck; pnpm test

# Cache & market:
# data/seith.db auto-create; check: sqlite3 data/seith.db "SELECT count(*) FROM ohlcv;"
# env: MARKET=id (default), SECTORS_API_KEY, LLM_BASE_URL=http://localhost:20128/v1

# Verifikasi cepat:
cargo check
Invoke-WebRequest http://localhost:20128/v1/models  # 9router hidup?
uv run python -c "import torch; import model"  # workdir apps/kronos-sidecar
```

**Gotcha yang sudah terbukti terjadi:**
- `uv sync --project X` dari root → tuang ke `.venv` root (SALAH). Selalu set workdir ke dalam proyek sidecar.
- `cargo test` dari sub-crate tanpa workspace root → feature/resolve salah. Selalu dari root workspace kecuali `-p`.
- Menambah file baru di `crates/*/src` tanpa `cargo fmt` → clippy fail di CI.
- Missing `volume/amount` dari Sectors → isi `0` sebelum ke Kronos (prediksi butuh `open/high/low/close` wajib).
- `max_context 512` Kronos-base — `lookback >512` harus ditolak `422` di boundary, bukan di-sidecar.
- 9router mati → dossier fallback `degraded:true` tetap lolos MI (LLM opsional Track 3), tapi flag harus terlihat.
- Kronos-base 102.3M butuh torch CUDA — ditambahkan ke env kronos-sidecar saat H2 (fallback CPU/pre-compute jika tanpa GPU).
- Redis 30MB web tidak muat IDX raw (~45MB) → jangan pakai Redis untuk raw OHLCV; Composite moka+SQLite sudah 100% gratis dan persist.

### 5b. Boy Scout Rule — Refactor Wajib (Tidak Bisa Diskip)

- **Refactor adalah kewajiban, bukan opsional.** Setiap task yang menyentuh file WAJIB meninggalkan code lebih bersih dari sebelumnya (Boy Scout Rule) — `fn <50 baris`, `file 200-400 baris`, `nesting ≤4`, `no dead code`, `no silent swallow`, `no duplication`.
- Minimal per task: `cargo fmt` + `cargo clippy --fix` + hapus dead code + extract function jika >50 baris + rename yang ambigu. Tidak ada claim `selesai` tanpa `♻️ Refactor:` di Accountability Block.
- Trade-off `+15% waktu` diterima demi `30% Technical depth` — debt yang ditunda di H1 akan meledak di H4/H5.

## 6. Contract Rules (`crates/seith-core` adalah hukum)

- Model domain STRICT: `serde` + `validator`, `deny_unknown_fields`, ticker `^[A-Z0-9]{3,6}$`, timestamp `chrono::DateTime<Utc>` aware, `Market` enum `Id|Sg` (default `Id`).
- Cache trait: `trait Cache<K,V>` dengan `MokaCache` L1 + `SqliteCache` L2 (file `data/seith.db`, tables `ohlcv,fundamentals,ranking_cache`, TTL 24h raw / 1h ranking). Composite: L1 miss → L2 hit → fetch Sectors → tulis L1+L2.
- API envelope WAJIB `{success,data,error,pagination}` di semua handler Axum & CLI output JSON. Repository pattern untuk akses data. Query `?market=sg` opsional, default `id`.
- Round-trip JSON adalah kontrak antar-service; tiap model baru wajib punya round-trip test.
- Evolusi wire via `SCHEMA_VERSION` pada envelope transport (ADR-0002), BUKAN dengan melonggarkan validasi domain.
- Anomaly flag `|Z|>2` atau volume spike `>2σ` tanpa katalis fundamental wajib `flag=true` + `reason`.
- Cleansing: `open/high/low/close` missing → exclude + `excluded:[{ticker,reason}]`; `volume/amount` missing → `0.0`; rasio missing → sector median fallback + `insufficient_data:true`.
- Sebelum mengubah schema: baca dampak ke SEMUA consumer (api/web/sidecar/cli).

### 6c. Anti AI Slop (Tier-1 — prose/UI, phased enforcement)

- **Scope:** `README`, `docs/*.md` prose, dossier PDF, `apps/web` copy. Exclude `api-spec`/`adr`/`spec` yang butuh presisi teknis.
- **Prose:** WAJIB `skill://no-ai-slop` detect sebelum merge — larang `Words to cut` (`delve, leverage, robust, cutting-edge` dll) + `Patterns to cut` (binary contrast `It's not X it's Y`, colon reveals, throat-clearing, puffery, em-dash crutch, formatting slop).
- **UI:** `apps/web` WAJIB `skill://design-taste-frontend` atau `high-end-visual-design`/`stitch-design-taste` — cegah template generik/bento generik.
- **Enforcement phased:** H1-H4 PR checklist warn; H5 pra-freeze CI grep banned-words hard fail + manual audit. Tier-1 = tidak block velocity, tapi `seith-phase-gate` wajib cek.

## 7. Phase Workflow & Definition of Done

Workflow: `Understand → Plan → Implement → Verify → Refactor → Document`.

Fase dinyatakan done HANYA jika semua hijau (refactor tidak bisa diskip):
1. Test relevan lulus (output nyata, bukan asersi kosong) — `cargo test` + `uv run pytest` jika sentuh sidecar + `pnpm test` jika FE/CLI.
2. `cargo fmt --check` dan `cargo clippy -- -D warnings` bersih di crate yang disentuh.
3. `pnpm lint/typecheck` bersih jika sentuh FE.
4. Review gate lewat (skill `seith-phase-gate` atau `code-reviewer` + `security-reviewer` paralel).
5. Dokumentasi ter-update (ADR untuk keputusan, prd/spec/api-spec untuk requirement berubah).
6. Accountability Block terisi dengan output nyata + `♻️ Refactor: <apa>` wajib.
7. Refactor gate lewat: `fn <50`, `file 200-400`, `nesting ≤4`, `no dead code` — `refactor-cleaner` scan pass.

## 8. Tim & Delegasi (struktur lengkap — WAJIB dipatuhi semua harness)

### Lapisan 1 — Kepemimpinan
| Peran | Eksekutor | Tanggung jawab |
|---|---|---|
| Lead / Orchestrator | opencode (T0) | Pegang semuanya; semua output delegasi diverifikasi lead |
| Founder / Owner | User (founder) | Keputusan strategis: positioning MI, threshold skor, go-live/freeze, arah produk |
| Project Manager | `seith-pm` (autonomous, `.opencode/agents/seith-pm/`) | Orkestrasi handoff/branch/worktree, gate `cargo fmt/clippy/test` + `uv/pnpm`, **veto merge ke `main` jika gate/reviewer fail** |
| Arsitek reviewer | sub-agent `architect` | Audit struktur SEBELUM fase besar dimulai |
| Perencana fase kompleks | sub-agent `planner` | Forward-test scoring, refactor lintas crate/sidecar |

> 📌 Governance eksklusif: repo `source-available, NOT community` sampai founder membuka. Semua kolaborasi (PR/issue) ditutup sampai eksplisit dibuka. Lihat `LICENSE` + `README > Contributing`. Track MI: Sectors core + no auto-trade + disclaimer.

### Lapisan 2 — Kualitas & Keamanan (gate wajib)
| Peran | Agent | Kapan |
|---|---|---|
| Auditor kode Rust | `rust-reviewer` / `code-reviewer` | Tiap crate baru; audit scoring/anomaly |
| Auditor keamanan | `security-reviewer` | Sectors key, 9router, input validation, rate limit; MANDATORY sebelum freeze |
| Desainer test | `tdd-guide` | Matrix regression scoring/anomaly/adapter/kronos-bridge/dossier + CLI + 9router mock |
| Review diff besar | `code-review` | Batch commit besar / pra-merge ke main |

### Lapisan 3 — Governance & Dokumentasi
| Peran | Eksekutor | Kapan |
|---|---|---|
| Penjaga dokumentasi | `doc-updater` | Setiap merge: sinkron README/ADR/docs dengan realita kode |
| Penjaga GitHub | LEAD langsung (github tools) | Konvensi commit + audit mingguan drift repo-vs-dokumen |
| Penjaga memori | skill `remember` + `handoff` | Fakta penting → memory; konteks sesi → handoff |
| Gate fase | skill `seith-phase-gate` + `verification-loop` | Protokol penutupan fase (dual-review) |

### Lapisan 4 — Dukungan Teknis (on-demand, kecuali refactor)
| Peran | Agent | Kapan |
|---|---|---|
| Fix build/boot error | `build-error-resolver` | `cargo check` fail, clippy, sidecar/9router boot |
| Riset vendor/library | `docs-lookup` / `deep-research` | Sectors API / Kronos HF / 9router berubah |
| Eksplorasi cepat | `explorer` | Debug area kode luas |
| **Refactoring** | **`refactor-cleaner` (WAJIB)** | **Pasca tiap handoff + tiap task Boy Scout — gate wajib, bukan on-demand** |
| Ops otonom | `loop-operator` | Monitoring pre-compute harian ranking |
| E2E web | `e2e-runner` | CLI+FE+API Playwright (H5) |

### Tata Tertib Cadence (WAJIB)
```
Tiap commit   : conventional commit (feat/fix/test/chore/docs) + doc-updater cek dampak docs
Tiap fase     : seith-phase-gate (rust-reviewer + security-reviewer paralel) + verification-loop
Tiap minggu   : audit GitHub drift repo-vs-docs + laporan status founder
Pra-freeze    : security-reviewer MANDATORY + architect sign-off + video 1m/3m check
```

Aturan delegasi: tugas paralel/independen boleh paralel; hasil selalu ditriage oleh lead; temuan valid difix, tolakan didokumentasikan alasannya.

### 8b. Branch & Worktree Strategy (Wajib untuk 2-3 terminal paralel)

```
main (protected, source-available, no direct commit) ← only Lead merge after seith-phase-gate
 └─ handoff/NN-topic (1 fase = 1 branch, lifespan pendek, dari main)
     ├─ handoff/NN-topic/t1-<subtask> (opsional, jika 2 terminal kerjakan subtask beda paralel)
     └─ handoff/NN-topic/t2-<subtask>
test/<topic> (ephemeral, hanya chaos/load test, bukan fitur)
chore/docs/fix/* (hanya jika di luar handoff, tetap via PR)

.handoff/ (docs — phase-folder, branch tetap flat):
 └─ phase-NN-topic/                  ← 1 fase = 1 folder
     ├─ 00-overview.md                ← Goal phase, WBS, dependency H2-H5, DoD phase, peran+skill+sub-agent
     ├─ 01-market-enum-models.md      ← task slice
     ├─ 02-cache-trait-composite.md
     ├─ 03-sectors-batch-client.md
     ├─ 04-cleansing-gate-normalize.md
     └─ 05-envelope-verification.md
```

- **Branch tetap flat** `handoff/NN-topic` (tidak jadi `phase/NN`); folder `.handoff/phase-NN-topic/` hanya organisasi docs per phase → task = file `NN-task.md` di dalam folder.
- **Default:** 1 handoff = 1 branch `handoff/NN-topic` + 2 worktree (`../seith-wt/handoff-NN-*`) agar 2 terminal tidak tabrak `cwd`/`target/`. Gunakan `git worktree add`.
- **Sub-branch `handoff/NN/topic/t1` hanya jika T1/T2 garap file beda paralel** (mis. `t1-cache` vs `t2-normalize` di H1) — merge balik ke parent `handoff/NN` via PR + `code-reviewer` sebelum ke `main`.
- **Naming:** branch `handoff/00-agents-sync`, `handoff/01-sectors-adapter`, `handoff/04-scoring/t1-engine`; folder `.handoff/phase-01-sectors-adapter/` + tasks `01-..md`; `test/kronos-load`.
- **Commit:** `type: desc` (feat/fix/test/chore/docs), no `push --force` ke `main`/`handoff/*`, rebase before merge, Accountability Block tiap task ubah file.
- **Lifecycle:** `git worktree add ../seith-wt/handoff-NN -b handoff/NN-topic` → implement (TDD) → `cargo fmt --check && cargo clippy -- -D warnings && cargo test` (+ `uv run pytest` jika sidecar) → dual-review → Lead squash-merge ke `main` → hapus worktree/branch.
- **Skill:** `git-worktree-manager` untuk orkestrasi worktree; setiap session eksekutor wajib `skill://seith-market-intelligence` di awal agar 1 tujuan. Doc phase-folder `00-overview.md` wajib baca sebelum task `01-05`.
- **Worktree gitignore:** `/.wt/` wajib di `.gitignore` (worktree di `../seith-wt/handoff-NN-*` atau `/.wt/`). `_test_out.txt` juga ignore.

### 8c. Agent Code Ownership — Semua AI Agent Bertanggung Jawab Penuh (WAJIB Terstruktur & Rapih)

Setiap AI agent (T0/T1/T2 + `seith-pm` + `architect/planner/tdd-guide/code-reviewer/security-reviewer/refactor-cleaner/doc-updater`) **BERTANGGUNG JAWAB PENUH** atas:

1. **Code** — `fn <50 baris`, `file 200-400 typical max 800`, `nesting ≤4`, `no dead code`, `no silent swallow`, `no unwrap` (use `Result`/`?`), `no duplication`, `immutable return` (clone, bukan mutate). Cross-zona import dilarang (§3c).
2. **Logic** — correctness sesuai `docs/prd/spec/api-spec/tdd-plan + adr + notes 00-05`; `deny_unknown_fields`, `DateTime<Utc>` aware, `Market` default `Id`, `cache_key market:sector:ticker:date`, cleansing gate `OHLC→excluded/volume→0/median→insufficient_data/lookback>512→422`; tidak tebak — baca SSOT dulu.
3. **Testing** — TDD red→green→refactor; `cargo test` + `uv run pytest` + `pnpm test` hijau dengan assertion meaningful (bukan kosmetik); critical path `adapter/cleansing/cache/kronos-bridge/dossier` ≥80% meaningful; `mockito/wiremock/respx` untuk Sectors/Kronos/9router; `sqlite3` persist check; `Accountability Block ✅/⚠️/🔻/♻️` paste output nyata — no fabrikasi.
4. **Structure & Rapih** — ikuti **7 Zones §3c**; file baru wajib di zona benar; `cargo fmt --check` 0 + `cargo clippy -- -D warnings` 0 + `pnpm lint/typecheck` 0; `refactor-cleaner` scan pass; `skill://no-ai-slop` Tier-1 prose/UI (H1-H4 warn, H5 hard fail) + `design-taste-frontend` untuk `apps/web`; `gitleaks` no leak; `Accountability Block` + `♻️ Refactor: <apa>` wajib tiap task.

Pelanggaran = **PM veto merge ke `main`** + `seith-phase-gate` FAIL. Lead (T0) verifikasi ulang semua delegasi — delegasi bukan alasan lepas tanggung jawab.

## 9. Docs Map

- `docs/prd.md` — requirement produk (derived insight, persona, pipeline hybrid, metrik 40/30/30, market IDX/STI, cache composite)
- `docs/spec.md` — arsitektur hybrid + CompositeCache + Kronos-base + TradingAgents-Lite (copy workflow), scoring 0-100, tech stack
- `docs/api-spec.md` — endpoints Axum `/api/v1/*` (`?market` param), schemas, envelope, Sectors mapping, cache + sidecar + 9router contract
- `docs/tdd-plan.md` — TDD critical paths (scoring/anomaly/adapter+cleansing/kronos-bridge/dossier+CLI+9router+CompositeCache), `cargo test` + `uv pytest`
- `docs/adr/` — keputusan arsitektur (0001 stack + cache + market, 0002 kontrak wire & vendor pinning)
- `docs/kronos-notes.md` — distilasi whitepaper Kronos + roadmap benchmark (dari `2508.02739v1.pdf`)
- `docs/notes/00-readme.md` + `01-tujuan-seith.md` → `05-anti-patterns.md` — **WAJIB baca sebelum Implement** (tujuan win, Kronos 512, gate MI, arsitektur, 14 anti-pattern) — ritual 3 pertanyaan, PM veto jika tanpa jejak
- `.handoff/phase-NN-topic/` — handoff per phase (folder = phase, file = task): `00-overview.md` + `01-..05-*.md` per task slice
- `2508.02739v1.pdf` — Kronos whitepaper asli (AAAI 2026, tokenizer hierarkis K-line foundation model)
- Skill: `.opencode/skills/seith-market-intelligence/SKILL.md` → pointer ke dokumen di atas (auto-load `00-readme.md`)

## 10. Skill Proyek (auto-discovery via .opencode/opencode.json)

| Skill | Kapan dimuat |
|---|---|
| `seith-market-intelligence` | **SSOT — WAJIB tiap session T1/T2 di awal** (pointer ke AGENTS→docs) |
| `seith-dev` | Workflow harian: command, gate, troubleshooting env Rust/uv + 9router |
| `seith-phase-gate` | Penutupan fase + dual-review gate |
| `seith-kronos` | WAJIB saat sentuh model Kronos/forecast/sampling/benchmark |
| `verification-loop` | WAJIB di akhir tiap handoff (cargo fmt/clippy/test + pytest) |
| `tdd-workflow` / `tdd-guide` | Saat tulis fitur/bug (red-green-refactor) |
| `git-worktree-manager` | Saat 2-3 terminal paralel (worktree lifecycle) |

> Skill global lain (60+): `code-reviewer`, `security-review`, `handoff`, `understand`, `graphify`, `promote` — boleh dipakai sebagai helper, tapi narasi produk tetap ikut `seith-market-intelligence`.
