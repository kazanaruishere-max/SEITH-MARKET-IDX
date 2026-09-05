# SEITH — Market Intelligence for IDX

Track 3 Reveal — Sectors Hackathon 2026. Derived insight only: Mispricing 0-100 + Anomaly Rank + Dossier 1-page.

Hybrid: `seith-cli` (Rust clap) + Rust API (Axum) + Next.js 14 (Bloomberg dark). Kronos-base 102.3M sidecar (`:8001`) + TradingAgents-Lite (`:8002` → 9router `:20128`). Cache Composite moka L1 + SQLite L2 `data/seith.db`. Market `id` default, `sg` optional.

## Quick Start
```powershell
cargo test; cargo clippy -- -D warnings; cargo fmt --check
# sidecar: uv sync (in apps/kronos-sidecar / apps/analysis)
# web: pnpm --dir apps/web lint; pnpm --dir apps/web test
```

## Contributing
Source-available, NOT community until founder opens. No PR/issue before open.

Disclaimer: bukan rekomendasi investasi.
