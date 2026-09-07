# Task 03 — Ranking Repository + Flag Sort

## Goal
Kunci `seith-core/src/ranking/{mod,service}.rs + seith-api/src/ranking.rs` `rank(vec<Score>) sort desc mispricing + by Sector` paginate `page/pageSize max50` + `ScoreRepository trait` reuse core.

## Context
- SSOT: `AGENTS.md §3c §7b §6 Contract Rules §8c` + `docs/spec.md §2[5] §3 Intelligence §4 formula` + `docs/api-spec.md §3 ranking/scan/score/anomalies §4 Schemas §6 traits` + `docs/tdd-plan.md §3 §4 Layers §7 Fixtures` + `docs/notes/00-readme.md ritual 3Q` + `skill://seith-market-intelligence` + `skill://tdd-workflow` + `skill://no-ai-slop`

## Scope In / Out
In: Zona 1 `crates/seith-core/src/ranking/mod.rs + service.rs` (core) + Zona 1 `crates/seith-api/src/ranking.rs` thin wiring + tests `4 passed` paginate/sector/sort — zona 1
Out: `scoring` 01 `anomaly` 02 payloads consumed, `apps/*` `:8001/:8002/:3000` no edit, `seith-cli rank/scan/score` H5 reuse trait, freeze kit — verify only 04

## Bagian — Surgical Breakdown (1 bagian = 1 fn ≤50 baris)
| Bag | File | Struktur / Fn | Acceptance | Test FAIL |
|---|---|---|---|---|
| 03a | `ranking/service.rs` | `struct RankingRequest {market: Market, sector: Option<String>, sort: SortKind, order: Order, page: u32, page_size: u32}` `SortKind Mispricing/Anomaly` `Order Desc/Asc` `page>=1 page_size 1..=50` `Market default Id` | `market default Id` `page_size 51→422` | `page 0→422` |
| 03b | `ranking/service.rs` | `trait ScoreRepository {fn rank(&self, items: Vec<ScoredTicker>) -> Vec<RankedTicker>}` `ScoredTicker {ticker, market, sector, score, components, anomaly_z, volume, flag, reason}` | `trait Send+Sync object` | — |
| 03c | `ranking/service.rs` | `fn rank(items: &mut Vec<ScoredTicker>, req: &RankingRequest) -> Vec<RankedTicker>` `sort_by(|a,b| score.partial_cmp).then anomaly_z then ticker name stable` | `items 5 unsorted→1:3:2 sorted` | `stable sort missing` |
| 03d | `ranking/service.rs` | `fn paginate(ranked: &[RankedTicker], req: &RankingRequest) -> (Vec<RankedTicker>, Pagination {page,pageSize,total})` `page 1-size20→total-3 items 20 flat` + flag `insufficient_data false` + `degraded false` + ranking note | `page1 size2 total3 items2` | `page beyond → empty 200 no 404` |
| 03e | `ranking/service.rs` | `fn sector_filter(items: &[ScoredTicker], sector: &str) -> Vec<ScoredTicker>` filter per market sector | `sector FIN→only FIN` `market Sg different median flag` | `filter always ` |
| 03f | `ranking/mod.rs` | `pub mod service; pub use service::{RankingRequest, ScoreRepository, rank, paginate}` | `cargo check 0` | — |
| 03g | `crates/seith-api/src/ranking.rs` | `struct RankingService {inner: Box<dyn ScoreRepository>}` thin Axum handler `GET /v1/ranking ?market=&sector=&sort=&page=&pageSize=` `envelope` | `seith-api compile` | — |
| 03h | `tests` | `#[cfg(test)]` `4 tests` paginate/sector/sort + `fundamentalMemo` memo-less anomaly still flag, degraded visible | 4 passed `page1 size2 total3` `sector Sg diff` `insufficient_data false` | `assert-less fail` |

## Deliverables + Acceptance (per Bagian)
- 03a-d: `service.rs 180-220 baris` — Acceptance: `fn <50` `sort_by + paginate + sector_filter stable` `no unwrap` `?` + `thiserror`
- 03e-f: `service.rs 40-60` + `mod.rs 10` — Acceptance: `sector_median per market (Id vs Sg terpisah)` deterministic from fixtures
- 03g: `ranking.rs 40-60 baris` — Acceptance: `thin wiring no logic` `envelope success/data/error/pagination`
- 03h: `4 tests` — Acceptance: `page beyond → empty 200 no 404` `sector Sg diff` `insufficient_data false`
- Constraint: `file 200-400` `fn <50 nesting≤4` `no unwrap` (`?` + `thiserror` if validation) `♻️ Refactor:` + `cargo fmt+clippy 0`
- 7 Zones: file baru wajib zona 1 `crates/seith-core/src/ranking/*` + `seith-api/src/ranking.rs` — cross-zona `seith-core ↛ sectors-client` — PM veto

## Verification
```
cargo fmt --check → 0
cargo clippy -p seith-core -p seith-api -- -D warnings → 0
cargo test -p seith-core -- --nocapture → ≥4 passed (paginate, sector Sg diff, insufficient_data false, stable sort)
cargo check → 0
refactor-cleaner scan §8c → pass (fn<50 file200-400 nesting≤4)
skill://no-ai-slop detect → pass (Tier-1 warn)
```

### Accountability Block
```
✅ Terverifikasi: <cmd> → <output> (paste nyata, no fabrikasi)
⚠️ Belum: verify green full (04), seith-cli H5 polish
🔻 Risiko: divider=0 → mitigasi: guard `if divider.abs()<EPS return 0.0` + `rank stable`
♻️ Refactor: extract paginate_page(), split sector_filter vs rank fn<50
```

## Peran + Skill + Sub-agent
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Lead Otak T0 | opencode sini | `seith-market-intelligence`+`verification-loop` | — | approve 03 |
| T1+T2 | sub-agent | `seith-market-intelligence`+`tdd-workflow`+`verification-loop` | `explore` | TDD rank/paginate-sector |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | `ranking/service.rs` edge cases |
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | input validation `page_size max50` |
| PM Autonomous | `seith-pm` | `git-worktree-manager`+gate | — | **veto merge jika fail** |
| Refactor WAJIB | `refactor-cleaner` | `coding-standards` | `refactor-cleaner` | pasca task — `fn<50` |
| Doc | `doc-updater` | `remember`+`handoff` | `doc-updater` | cek drift |

> Ownership §8c: tiap agent tanggung jawab penuh code/logic/testing/structure & rapih

## Next Session Prompt
`skill://seith-market-intelligence` + `skill://tdd-workflow` + `handoff/04-scoring` + `03-ranking-repository.md` + ritual 3Q: 1) gate MI mana? `ranking desc+sector paginate 20` — tanpa ini sorting empty. 2) jebakan? `z_normalize clamp + qv percentile empty 50 + sm fall 50 + div 0`. 3) test FAIL apa? `page1 size2 total3`, `sector FIN only FIN`, `div 0 no panic`.
