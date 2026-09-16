# Skill: seith-quant — Quant Engine Spec & Verifiability Stub (SEITH 20y)

## Purpose
Angka jujur, bukan klaim: `metrics sharpe/maxDD/hit` computed dari rules, not konstanta `1.1/-8%/62%`. Stub H15 — spec only now, engine next slice.

## When to Use
Trigger: `engine`, `quant`, `backtest engine`, `sharpe`, `hit_rate`, `IC`, `decile`, `walk-forward`, `Slice A`, `top-N`, `turnover`. Load jika sentuh `crates/seith-core/src/scoring` H15 atau `research/money-leak-backtest.ipynb` IC sel — not for polish H14.

## Spec Slice A — Backtest Engine (H15 Prep, Docs-Only Now)

- **Rules eksplisit `seith-core`:** per `rebalance` ambil `Top-N` by `mispricingScore` (locked `30/20/30/20` founder — not change now) — hitung `forward return` dari OHLCV L2 — kurangi `cost/turnover` → `equity_curve` vs IHSG + `sharpe = mean(excess)/std` + `maxDD` + `hit_rate` + `turnover` computed, not `backtest-100.json` metrics konstanta `sharpe 1.1 drawdown -8%` contract today
- **Walk-forward:** `train T → forward-20d` slide — prevent look-ahead bias — `cargo test` replay 2× identical (`seed` deterministic)
- **Acceptance H15:** `cargo test` `Top-N + walk-forward` pass — `research/backtest-100.json` metrics replaced with computed — verify `len(equity) 12` still vs IHSG

## Spec Slice B — IC + Decile (Validasi Sinyal)

- **IC:** rank correlation `score vs forward return` — per `re-balance` — report `IC mean/std` — `scoring 30/20/30/20` lock or retune? auto-tune without IC proof = slop — `IC stub` `compute_ic(scores, forwards)` `f32  -1..1`
- **Decile spread:** `Top decile minus Bottom decile` cumulative — table notebook sel baru — acceptance: `metrics` now computed, `IC` riportato, `tdd-plan` §6+§9 walk-forward test
- **Lesson:** `metrics` d46a77d contractual — engine will make them verifiable — one replay ≠ two replays deterministic

## Stack & Docs
- Rust `seith-core` scoring `compute()` `calculator.rs` `components.rs` — `dossier.rs` — no Python backtest (Rust verifiable) — `crates/seith-api/src/backtest_data.rs` `load_backtest_value` `select_items` `sort_ranking`
- Python notebook only IC display — engine Rust — `cargo test 89+` + `pnpm build 4` + `nbconvert 10 sel` (H14) + IC sel H15
- `docs/tdd-plan.md` §6+§9 walk-forward + `crates/seith-core/src/scoring/calculator.rs` 30/20/30/20 playbook

## Commands (H15)
```powershell
cargo test -p seith-core -- --nocapture # compute + engine stub
cargo test -- --nocapture # 89+ including Top-N + IC
.\research\.venv\Scripts\python -c "import json; b=json.load(open('research/backtest-100.json')); print(b['metrics'])"
```

## References
`crates/seith-core/src/scoring/calculator.rs` (`30/20/30/20 clamp`), `research/backtest-100.json` (contract metrics), `2508.02739v1.pdf` (Kronos 400→20 equal guard)
