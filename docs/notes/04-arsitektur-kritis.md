# 04 — Arsitektur Kritis — Keputusan Sulit yang Tidak Boleh Salah

## 1. Cache — Composite Moka L1 + SQLite L2 (Hukum)

```
Sectors → CompositeCache (trait Cache<K,V>)
         ├─ L1 moka (hot <1ms, 24h raw / 1h ranking, in-proc)
         └─ L2 SQLite `data/seith.db` (~2ms, persistent, WAL, 100% gratis)
L1 miss → L2 hit → return; miss keduanya → fetch Sectors → tulis L1+L2
```

- **Kenapa bukan Redis 30MB web?** IDX raw ~45MB → Redis tidak muat, eviction acak → miss → burn 1000 credit. Ditolak ADR 0001.
- **Supabase 500MB:** defer H5 multi-instance. File `data/seith.db` survive restart → offline demo juri tanpa Sectors hit.
- **Worktree trap:** 2 terminal paralel + SQLite WAL — lock `data/seith.db` bisa clash. Test pakai `:memory:` untuk unit, file L2 hanya di integration.
- **Key:** `market:sector:ticker:date` — tanpa `market` → STI vs IDX campur → sector median noise.

## 2. Integrasi Rust↔Python — REST Sidecar (Bukan PyO3)

- **REST:** Rust Axum `:3001` + Python `uv` FastAPI `:8001` Kronos + `:8002` analysis. Alasan: hindari `GIL+Tokio clash`, T1 Rust & T2 Python paralel, timeout/fallback mudah (`degraded:true`).
- **PyO3/maturin:** hanya stretch jika latensi ranking harian terbukti bottleneck (tidak di MI — ranking pre-compute overnight).

## 3. Market — IDX Primary, STI Flag

- Default `market=id` (IDX ~900), `market=sg` optional flag. `enum Market {Id,Sg} as_str()-> id|sg`, `base_path: Id→/v2/indonesia/transaction/daily, Sg→/v2/singapore/...`.
- **Kenapa tidak default `sg`?** 2x credit burn + `QV sector median` campur universe = noise. STI stretch `comparative IDX vs SG` H5.

## 4. LLM — 9router :20128 (Tier-0 NEVER kill)

- `http://localhost:20128/v1/chat/completions` OpenAI-compatible. Check liveness `Invoke-WebRequest http://localhost:20128/v1/models` 200 sebelum dossier.
- **Fallback:** 9router down → template memo + `degraded:true` — tetap lolos MI (LLM opsional Track 3). Jangan crash.

## 5. Scoring — 30/20/30/20 Hypothesis (ADR 0003)

`0.30*ER_norm (Kronos) + 0.20*(100-|Z|) + 0.30*QV + 0.20*SectorMom`, clamp 0-100, breakdown explainable. Hypothesis H4 backtest — juri akan tanya `kenapa 30% Kronos?` → jawab ADR.

## Pertanyaan Kritis Sebelum Code Arsitektur

- Apakah `trait Cache` dipakai (bukan `HashMap` tempel)?
- Apakah `market` enum default `Id` & key pakai `market:` prefix?
- Apakah sidecar timeout + `degraded` test ada?
- Apakah `9router` liveness di-check?

## Referensi
`docs/adr/0001`, `migrations/001_cache.sql`, `AGENTS.md §3`, `docs/spec.md §1b`
