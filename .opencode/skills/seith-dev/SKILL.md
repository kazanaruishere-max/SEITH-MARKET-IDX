# Skill: seith-dev — Workflow Harian SEITH

## Purpose
Workflow harian dev: command, gate, troubleshooting env Rust/uv + 9router. Helper untuk T1/T2 agar tidak tanya ulang.

## When to Use
Setiap session implement/test/debug, sebelum `cargo test` atau saat env error. WAJIB bareng `seith-market-intelligence` (SSOT).

## Commands (AGENTS §5)
```powershell
cargo fmt --check; cargo clippy -- -D warnings; cargo test -- --nocapture
cargo run -p seith-cli -- ranking --sector FINANCE
uv sync # workdir apps/kronos-sidecar / apps/analysis (jangan dari root)
uv run pytest -q; uv run ruff check .
pnpm --dir apps/web lint; pnpm --dir apps/web typecheck
Invoke-WebRequest http://localhost:20128/v1/models # 9router
sqlite3 data/seith.db "SELECT count(*) FROM ohlcv;"
```

## Gotcha
- `uv sync --project X` dari root salah — set workdir ke sidecar.
- `cargo test` dari sub-crate tanpa workspace salah — pakai `-p`.
- `volume/amount` missing → 0.0; `lookback>512` → 422.
- 9router down → degraded:true fallback.

## References
`AGENTS.md §5`, `docs/spec.md §1b`, `docs/tdd-plan.md §5`
