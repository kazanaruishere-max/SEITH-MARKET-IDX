# Phase 01 — Sectors Adapter + CompositeCache + Market + Cleansing Gate — Overview

## Goal
Kunci fondasi Phase 1: Sectors batch + CompositeCache L1→L2→Sectors + Market enum Id|Sg + cleansing gate (OHLC wajib exclude, volume→0, rasio→median+insufficient_data, lookback>512→422) + envelope — pipeline tidak crash di illiquid, cache >80% hit, offline demo survive restart tanpa paid Redis.

## Context
- SSOT: `AGENTS.md §2-6c, §3c Seven Zones, §8b Branch, §8c Agent Ownership` + `docs/prd.md §5-6 Pipeline [1]-[2]` + `docs/spec.md §2-5 Domains+DataFlow + §7b Zones` + `docs/api-spec.md §1-4 Schemas+Cache` + `docs/tdd-plan.md §2-7 Critical Paths 3` + `docs/kronos-notes.md` `max_context 512` + `docs/notes/00-readme.md` ritual 3Q + `docs/adr/0001-stack 0002-wire` + `migrations/001_cache.sql` + 7 Zones
- Skill wajib tiap session T1/T2: `skill://seith-market-intelligence` (awal) + `skill://tdd-workflow` + `skill://verification-loop` (akhir) + `skill://no-ai-slop` Tier-1 prose check
- Branch: `handoff/01-sectors-adapter` (flat, AGENTS §8b) — docs folder: `.handoff/phase-01-sectors-adapter/` (1 fase = 1 folder, 5 tasks). Template: `.handoff/phase-template/00-overview.md`
- Market: `enum Market {Id, Sg}` default `Id` — STI stretch H5 tidak default, hemat 1000 credits, cegah median noise (AGENTS §2, prd §9, ADR 0001)
- Cache: Composite `moka L1 (<1ms hot)` + `SQLite L2 data/seith.db (~2ms, WAL, persistent, 100% gratis)` — trait `Cache`, key `market:sector:ticker:date`, TTL 24h raw / 1h ranking, Redis 30MB ditolak (45MB raw tidak muat) — ADR 0001
- Vendor read-only: `vendor/Kronos 67b630e` + `vendor/TradingAgents 9dee508` — bukan dep langsung (ADR 0002)
- Fixtures ready: `tests/fixtures/bbca-ohlcv-400.json`, `illiquid-ohlcv.json` (volume null, ROE null, OHLC null), `dbs-sg-ohlcv-400.json`, `sector-median.json` (per market)

## Scope In / Out
In (7 Zones — file baru di luar zona = violation PM veto): `crates/seith-core` (zona 1 domain, `market.rs` + `models.rs` + `cache.rs` + `normalize.rs` + `config.rs` + `redact.rs`), `crates/sectors-client` (zona 1 infra, `cache/{moka,sqlite,composite}.rs` + `client.rs` + `batch.rs`, key `market:sector:ticker:date`), `crates/seith-api` (zona 1 delivery, `envelope.rs` + `repository.rs` + `handlers.rs`), `data/` + `migrations/001_cache.sql` (zona 3 WAL `busy_timeout 3000`), `tests/fixtures/` (zona 4), `docs/` (zona 5 SSOT), `.handoff/phase-01-sectors-adapter/` (zona 6)
Out: `apps/kronos-sidecar` `:8001` + `kronos-bridge` (H2, zona 2), `apps/analysis` `:8002 → 9router` (H3, zona 2), scoring 0-100 + ranking + anomaly flag (H4, zona 1), dossier/PDF + `seith-cli` + `apps/web` (H5, zona 1+2), freeze kit (H6, zona 7) — tidak disentuh Phase 1 (zona terpisah, §3c). Keep nama `apps/kronos-sidecar` + `apps/analysis` (hindari break uv workdir).

## WBS — Task Breakdown (1 task = 1 file, surgical slice)
| # | Task file | Slice | Deliverable inti | Dependensi |
|---|---|---|---|---|
| 01 | `01-market-enum-models.md` | Market enum Id\|Sg + strict domain models | `seith-core/src/market.rs`, `models.rs` (OhlcvRow, Fundamentals, ticker `^[A-Z0-9]{3,6}$`, `chrono::DateTime<Utc>`, `deny_unknown_fields`, round-trip test per model) | — |
| 02 | `02-cache-trait-composite.md` | Cache trait → Moka L1 + SQLite L2 + Composite L1→L2→Sectors | `seith-core/src/cache.rs` + `sectors-client/src/cache/{moka,sqlite,composite}.rs` + `migrations/001_cache.sql` + `data/seith.db` WAL; L1 <1ms, L2 ~2ms, `:memory:` untuk unit, `busy_timeout 3000` | 01 (key butuh `Market`) |
| 03 | `03-sectors-batch-client.md` | Sectors REST batch per market + TTL + key | `sectors-client/src/{client.rs,batch.rs}` — batched per sektor per market, endpoint `/v2/indonesia/transaction/daily` vs `/v2/singapore/transaction/daily`, key `market:sector:ticker:date`, TTL 24h raw /1h ranking, retry 1x, `reqwest` + `mockito` | 01, 02 |
| 04 | `04-cleansing-gate-normalize.md` | Cleansing gate normalize (anti-crash illiquid) | `seith-core/src/normalize.rs` — OHLC missing→exclude+reason `missing_ohlc` + `excluded:[{ticker,reason}]`, volume/amount null→0.0, rasio null→sector median per market fallback 0 + `insufficient_data:true`, `x/y_timestamp` derived date, `lookback>512→422` guard | 01, 03 (fixture OHLCV) |
| 05 | `05-envelope-verification.md` | Envelope + repository pattern + contract verify | `seith-api/src/{lib,handlers,envelope,repository}.rs` — `{success,data,error,pagination}` + `SCHEMA_VERSION`, repo trait, contract `CLI JSON ≡ REST JSON` stub, `redact.rs` no leak, `config.rs` env fail-fast | 01-04 |

Dependensi antar-fase: **H1 (fondasi cache+models+cleansing) → H2 (Kronos sidecar :8001, bridge butuh Ohlcv clean + `lookback≤512` guard) → H3 (Agents Lite :8002→9router, gunakan ranking) → H4 (Scoring 0-100, rank, flag `|Z|>2`, butuh ER dari Kronos + QV dari fundamentals) → H5 (Hybrid `seith-cli` + Axum `/api/v1/*` + FE Bloomberg + dossier PDF, pakai `?market` param) → H6 (Freeze kit)**. Debt H1 (skip `Cache` trait / market key / cleansing) meledak di H4/H5 — Boy Scout Rule §5b wajib.

## Definition of Done — Phase 01
Fase 01 done HANYA jika semua hijau (AGENTS §7 + §5b + §6c + §8c + §3c):
1. `cargo fmt --check` bersih per crate (`seith-core`, `sectors-client`, `seith-api`) — zona 1
2. `cargo clippy -- -D warnings` bersih per crate — no `unwrap` di cleansing, no dead code — §8c
3. `cargo test -- --nocapture` pass — assertion meaningful (no assertion-less), critical path `adapter+cleansing+CompositeCache+market` ≥80% meaningful — §8c Testing
4. Per task `fn <50 baris`, `file 200-400 typical max 800`, `nesting ≤4`, `no dead code`, `no silent swallow`, `immutable return` + **7 Zones §3c** — `refactor-cleaner` scan pass + `♻️ Refactor: <apa>` per task di Accountability Block — §8c Structure & Rapih
5. Dual-review pass: `rust-reviewer` (`code-reviewer`) + `security-reviewer` (`security-review`) paralel — cek `1-6` + `6-8` anti-pattern #01-#10 — §8c Logic
6. `seith-phase-gate` + `verification-loop` pass (paste output nyata, no fabrikasi) + `gitleaks` no leak — §8c
7. Docs sinkron: `docs/spec.md §5+§7b`, `docs/api-spec.md §4`, `docs/tdd-plan.md §3` + `AGENTS §3c` + ADR jika keputusan — `doc-updater` cek drift — 7 Zones map
8. Anti-slop Tier-1 warn: `skill://no-ai-slop` detect pass untuk prose handoff/docs (H5 hard fail nanti) — checklist PR — §6c + §8c
9. Accountability Block per task: `✅ Terverifikasi: <cmd> → <output> / ⚠️ Belum / 🔻 Risiko / ♻️ Refactor:` + **semua AI agent bertanggung jawab penuh atas `code/logic/testing/structure & rapih` (§8c)** — PM veto jika tidak rapih
10. File baru WAJIB di zona benar (1-7 §3c) — cross-zona import liar = violation → PM veto + gate FAIL

## Peran + Skill + Sub-agent Matrix (Wajib — AGENTS §8)
| Peran | Eksekutor | Skill WAJIB | Sub-agent | Kapan — Phase 01 |
|---|---|---|---|---|
| **Lead Otak T0** | opencode sini | `seith-market-intelligence` + `seith-dev` + `verification-loop` | — | Understand→Plan→Document, tulis/approve `00-overview.md`, verify delegasi, squash-merge gate |
| Founder | User | — | — | approve threshold, go-live/freeze, veto strategis |
| **PM Autonomous** | `seith-pm` `.opencode/agents/seith-pm/` | `git-worktree-manager` + gate `fmt/clippy/test` | — | orkestrasi branch `handoff/01-sectors-adapter` + worktree `../seith-wt/handoff-01*`, assign T1/T2 slice, **veto merge ke `main` jika gate/reviewer fail** |
| **Arsitek reviewer** | sub-agent `architect` | `senior-architect` | `architect` | **SEBELUM coding** `01+02` — audit `Cache` trait, market key, file sizing, `data/seith.db` WAL |
| **Planner** | sub-agent `planner` | `tdd-workflow` | `planner` | forward-test dependency H4 scoring terhadap cleansing/market median |
| **Eksekutor Tangan T1/T2** | sub-agent | `seith-market-intelligence` (awal wajib) + `tdd-workflow` + `verification-loop` | `explore` jika debug luas | Implement→Verify→Refactor TDD red-green per task 01-05, 1 slice terverifikasi per session |
| **Desainer Test** | `tdd-guide` | `tdd-guide` + `tdd-workflow` | `tdd-guide` | matrix fixtures: `cleanse missing OHLC→excluded`, `volume null→0`, `roe null→median`, `lookback>512→422`, `market sg`, `L1 miss→L2 hit` |
| **Reviewer Rust** | `rust-reviewer` | `code-reviewer` | `code-reviewer` + `rust-reviewer` | tiap crate baru `seith-core`/`sectors-client` + audit scoring/anomaly boundary |
| **Reviewer Security** | `security-reviewer` | `security-review` | `security-reviewer` | `SECTORS_API_KEY` env-only, `redact`, validation `Market`/`ticker`, `lookback>512→422`, rate limit — MANDATORY pra-freeze |
| **Refactor WAJIB** | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | **pasca tiap task 01-05** + tiap commit Boy Scout §5b — `fn<50 file200-400 nesting≤4 no dead code` — gate wajib bukan on-demand |
| **Doc + Handoff** | `doc-updater` | `remember` + `handoff` | `doc-updater` | sinkron `prd/spec/api-spec/tdd-plan/adr` tiap merge phase, memory penting |
| Review diff besar | `code-review` | — | `code-review` | batch commit besar / pra-merge ke main |

## Branch & Worktree (AGENTS §8b + §3c + §8c — Fondasi Solid)
- Branch flat: `handoff/01-sectors-adapter` (dari `main`) — `git worktree add ../seith-wt/handoff-01 -b handoff/01-sectors-adapter` — `/.wt/` gitignore (AGENTS §8b)
- Paralel opsional T1/T2 (file beda, 7 Zones terpisah, tidak tabrak `target/`/`data/seith.db`):
  - `T1: 01-market + 04-cleansing` (zona 1 `seith-core/src/market.rs, models.rs, normalize.rs`) → `handoff/01-sectors-adapter/t1-core`
  - `T2: 02-cache + 03-client` (zona 1 `sectors-client/src/cache/*, client.rs` + zona 3 `migrations/001_cache.sql`) → `handoff/01-sectors-adapter/t2-cache`
  - Lifecycle: `git worktree add ../seith-wt/handoff-01-t1 -b handoff/01-sectors-adapter/t1-core` (paralel) → TDD red-green → `cargo fmt --check && cargo clippy -- -D warnings && cargo test` → `refactor-cleaner` §8c → dual-review `rust-reviewer ∥ security-reviewer` → PR ke parent `handoff/01` → `code-reviewer` → squash-merge → hapus worktree → parent → PR ke `main` → `seith-phase-gate` (§8c) → Lead squash-merge → hapus worktree
- Tiap session T1/T2 wajib `skill://seith-market-intelligence` di awal + baca `docs/notes/00-readme.md` ritual 3Q + **semua AI agent bertanggung jawab penuh atas `code/logic/testing/structure & rapih` (§8c)**; tiap commit `type: desc` (`feat/fix/test/chore/docs`) + Accountability Block `✅/⚠️/🔻/♻️` + 7 Zones-aware

## Verification — Phase 01 (paste output nyata, no fabrikasi)
```
cargo fmt --check → 0 (per crate seith-core, sectors-client, seith-api)
cargo clippy -- -D warnings → 0
cargo test -p seith-core -- --nocapture → pass (market enum, OhlcvRow round-trip, cleanse OHLC/volume/roe, lookback guard)
cargo test -p sectors-client -- --nocapture → pass (MokaCache, SqliteCache :memory:, Composite L1→L2, TTL, market key Id vs Sg)
cargo test -- --nocapture → pass (workspace)
sqlite3 data/seith.db "SELECT count(*) FROM ohlcv;" → 0 then after integration persist check
# mock Sectors via mockito/wiremock — 9router/Kronos mock tidak wajib H1
cargo check → 0
```
+ `refactor-cleaner scan pass: fn<50, file200-400, nesting≤4` + `gitleaks` no `SECTORS_API_KEY` leak

## Risks & Mitigasi — Fondasi
| Risiko | Akibat | Mitigasi | Deteksi |
|---|---|---|---|
| `data/seith.db` WAL lock 2 worktree tulis bersamaan | `database is locked` | `busy_timeout 3000`, unit `:memory:`, integration file lock, T1/T2 slice beda file/market | `CompositeCache` concurrent test |
| Market key tanpa `market` prefix | IDX vs SG campur → sector median noise → mispricing salah (anti-pattern #08) | key `market:sector:ticker:date` enum `Id|Sg` | `fetch market=sg tidak return id data` |
| OHLC missing tidak exclude | panic Kronos shape mismatch (anti-pattern #01) | `missing OHLC → exclude + reason missing_ohlc` + `excluded:[{ticker,reason}]` | `illiquid-ohlcv.json → scan excluded` |
| lookback>512 tidak guard | sidecar 422/panic 502 (anti-pattern #04) | boundary Axum `>512 → 422 VALIDATION_ERROR max_context 512` | `lookback 520 → 422` |
| Debt ditunda H1 meledak H4/H5 | file 800 baris, fn 80 baris, clippy warning → Tech Depth 30% jebol | Boy Scout §5b + `refactor-cleaner` WAJIB per task | PM veto jika tanpa `♻️ Refactor:` |

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/01-sectors-adapter` (atau `t1-core`/`t2-cache`) + task `01-market-enum-models.md` (mulai) → ritual 3Q: 1) gate MI mana? `adapter+cleansing` anti-pattern #01-#04 #08 #13 #14 — fondasi lolos MI. 2) jebakan? market key, TTL, WAL lock, cleansing median per market. 3) test FAIL apa? `cleanse missing OHLC → excluded`, `volume null → 0`, `roe null → median Id vs Sg`.
