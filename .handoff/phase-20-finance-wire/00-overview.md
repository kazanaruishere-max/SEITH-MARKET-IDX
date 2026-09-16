# Phase 20 — Finance Wire — Overview (Zero-Gap Incremental)

## Goal
Wire 25 FINANCE end-to-end CLI real data (score≠80, ranking≠[], dossier≠50, radar Top5 honest) — close MI 10% gap before freeze. Incremental: hygiene P0 done → CLI wire 01-05 → API/sidecar/web/ freeze gated. No fake claims.

## Context
- SSOT: `AGENTS.md §3c/§5b/§6/§6c/§8c` + `docs/prd §4-5` + `docs/spec §2/§4` + `docs/api-spec §3` + `docs/kronos-notes` + `research/backtest-100.json` + `research/universe-100.json`
- Skill wajib: `skill://seith-market-intelligence` + `skill://no-ai-slop` + `skill://verification-loop` + `skill://seith-ops` + `skill://seith-data|quant`
- Branch: `handoff/20-finance-wire` worktree `../seith-wt/handoff-20` HEAD `1b800ca`
- Zona: Z1 `crates/seith-cli, seith-core, sectors-client` · Z3 `data/seith.db` WAL · Z4 `tests/fixtures/sector-median.json` · Z5 `research/*` · Z6 `.handoff/phase-20-*` · Z7 `scripts`

## Approved Trade-offs (founder approved 2026-09-16)
1. **Credit 25c synthetic first (0c) → live gated:** 20.1-20.2 pakai `universe-100 FINANCE 25 + closeMap backtest-100` synthetic honest `ponytail: MA20 pending Kronos 400→20` (0c) → gate `score BBCA≠BBRI ranking≥15` lolos MI (30/20/30/20 derived). Live `sectors-client batch 20` (25c) jadi `20.2b` opsional pre-freeze for 30% tech depth — jangan bakar tiap `cargo test`. Sisa ~704c aman.
2. **Kronos 102M stay MOCK=1 until 20.2 green:** download NeoQuasar/Kronos-base now = +3m cold + torch uv heavy + CI slow. Real proven via `scores_98.json` `score_live_98.py` 98×19→20 T1.0 `degraded false`. Warm `MOCK=0` once at 20.4 before video.
3. **Incremental 20.1→20.2 first, not 6-phase big-bang:** big-bang docs stale. Incremental verifiable per gate, `main ahead 23` push partial.

## Scope In / Out
In:
- Z1: `crates/seith-cli/src/{commands/{score,ranking,dossier,radar},store,pipeline,cli,main}` + `crates/seith-core/{scoring,normalize,anomaly,models}` reuse
- Z3: `data/seith.db` WAL (hygiene P0 done 40KB, tables `ohlcv,fundamentals,ranking_cache,kv_store`) `migrations/001_cache.sql`
- Z4: fixtures `sector-median.json` 5 sektor id+sg (FINANCE/ENERGY/CONSUMER/INFRA/OTHER+TECH) — P0 done
- Z5: `research/universe-100.json` 25 slice + `research/backtest-100.json` lineage 296c
- Z6: `.handoff/phase-20-finance-wire/{00..05}` + `06-freeze` planned
- Z7: CI 6 contexts, `/.wt/` ignore, gitleaks, `scripts/init_db.py` (one-off)
Out: Kronos sidecar :8001 pred live, web :3000 polish, LLM 9router Top-10 expand, STI live fetch — defer H21 (gated phase 20.4+)

## Hygiene P0 — Done (2026-09-16)
- [x] `temp_*.rs` 7 files root deleted, `.gitignore` add `temp_*.rs temp_*.toml research/*.html`
- [x] `tests/fixtures/sector-median.json` 3→6 sektor (id: FINANCE/ENERGY/CONSUMER/INFRA/OTHER+TECH, sg same) — `sector_median` fallback no longer 0
- [x] `data/seith.db` WAL init `PRAGMA journal_mode=WAL busy_timeout 3000` 40KB tables `ohlcv,fundamentals,ranking_cache,kv_store` — empty seed pending 01-ingest (0 rows → populate 25×20)
- Verify: `cargo test -p seith-core normalize::tests::sector_median_id_vs_sg_different → ok` + `python init_db.py → 4 tables WAL`

## WBS — Task Breakdown (incremental)
| # | Task file | Slice | Dep | Status |
|---|---|---|---|---|
| P0 | hygiene | sector-median + DB WAL + temp clean | - | done |
| 01 | `01-ingest.md` | Populate `data/seith.db` FINANCE 25 synthetic honest (0c) | P0 | pending |
| 02 | `02-score.md` | Wire `score` → MA20 proxy + calculator 30/20/30/20 | 01 | pending |
| 03 | `03-ranking.md` | Wire `ranking` → scored_all + rank/paginate ≥15 | 02 | pending |
| 04 | `04-dossier.md` | Wire `dossier` → real Components + dynamic memo | 02 | pending |
| 05 | `05-radar.md` | New `radar` Top5 `|Z|>2 or vol>2σ` honest reason | 03 | pending |
| 06 | `06-freeze.md` | AGENTS §10 sync + ci web hard-fail + push 23 + PM gate | 05 | planned |

Live gated follow-up (optional pre-freeze, not in DoD):
- 02b: `sectors-client batch 20` live 25c FINANCE — needs `SECTORS_API_KEY` + `CompositeCache L1→L2` proof for video
- 04b: `health is_mock_mode()` fix + `template wording sync`

## Todo (exactly-one in_progress)
- `todowrite` before Implement; `completed` only after Verify hijau + Accountability Block. PM veto if no trace.

## Definition of Done (REAL, not cosmetic — PM veto if fake)
1. `cargo fmt --check && cargo clippy -- -D warnings` clean
2. `cargo test -- --nocapture` green (no assertion-less), manual 2-ticker diff `BBCA≠BBRI >0.01`
3. `refactor-cleaner` pass `fn<50 file200-400 nesting≤4`
4. Dual-review `seith-code-reviewer` + `seith-data-reviewer` + `seith-quant-reviewer` (includes 01-05 file ownership check)
5. `verification-loop` + `gitleaks` 0 + `sqlite3 data/seith.db "SELECT COUNT(*) FROM ohlcv; SELECT COUNT(DISTINCT ticker) FROM fundamentals WHERE sector='FINANCE'"` ≥400/25
6. Docs sync (README §4 §8 mirror) + `research/*.html` gitignored
7. Accountability `✅/⚠️/🔻/♻️` per task with real command output — no fabrikasi

## Peran + Skill
| Peran | Eksekutor | Skill | Kapan |
|---|---|---|---|
| Lead T0 | opencode sini | `seith-market-intelligence` v2 + `seith-ops` | Plan+Verify |
| PM | `seith-pm` | `git-worktree-manager` + `verification-loop` | veto merge if gate fail |
| Code | `seith-code-reviewer` | `coding-standards` | `fn<50 clippy` |
| Data | `seith-data-reviewer` | `seith-data` | lineage 296c `data/seith.db` |
| Quant | `seith-quant-reviewer` | `seith-quant` | 30/20/30/20 ER MA20 ponytail |
| Security | `seith-security-reviewer` | `security-review` | `SECTORS_API_KEY` server-only |

## Branch & Worktree
- `git worktree add ../seith-wt/handoff-20 -b handoff/20-finance-wire` already active `1b800ca HEAD`
- File disjoint: T1 `store.rs/pipeline.rs/score.rs` vs T2 `ranking.rs/dossier.rs/radar.rs/cli.rs` — no overlap
- File outside 7 Zones = veto (temp cleaned, `.wt/` ignored correct)

## Verification (per task, paste output nyata)
```
cargo fmt --check → 0
cargo clippy -- -D warnings → 0
cargo test -- --nocapture → green
# after 01:
python scripts/init_db.py → 4 tables WAL 40KB
sqlite3 data/seith.db "SELECT COUNT(*) FROM ohlcv; SELECT COUNT(DISTINCT ticker) FROM fundamentals WHERE sector='FINANCE';"
cargo run -p seith-cli -- score BBCA --market id vs BBRI → differ >0.01
cargo run -p seith-cli -- ranking --sector FINANCE --market id → ≥15
cargo run -p seith-cli -- dossier BBCA --market id → not 50/fund, contains median/sektor
cargo run -p seith-cli -- radar --sector FINANCE --market id → Top5 reason z/vol + catalyst pending
```

## Risks
- DB empty → mitigate ingest vetted 25 synthetic honest, detect `SELECT COUNT(*)`
- ER flat 50 → mitigate MA20 proxy `(close-ma20)/ma20 → z_normalize`, pony `MA20 pending Kronos 400→20`
- Radar fake EPS → mitigate honest `catalyst check: not_available_yet`, never claim `no EPS change`
- Credit blow → mitigate synthetic first, live gated 02b needs approval
- Temp pollution → mitigated P0 `.gitignore`

## Next Session Prompt
`skill://seith-market-intelligence` + branch `handoff/20-finance-wire` + task `01-ingest.md` + ritual 3Q — T1 foundation first
