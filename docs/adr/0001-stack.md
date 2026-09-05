# ADR 0001 — Stack Rust + CompositeCache + Market + Design

## Decision
- Core Rust (Axum+Tokio), CLI clap `seith-cli`, Cache Composite `moka L1 + SQLite L2 data/seith.db` (Redis 30MB ditolak — IDX raw ~45MB), Supabase defer H5.
- Market `enum Id|Sg` default `Id`, `?market=sg` optional (hemat 1000 credits, sector median per market).
- Design Bloomberg dark `#0B0E14` + taste-skill, chart `recharts`, PDF `react-to-pdf` web-based.
- Rust↔Python via REST sidecar `:8001/:8002` (bukan PyO3), LLM via 9router `:20128` OpenAI-compatible.

## Rationale
Win 40/30/30 — Sectors core, 100% gratis, offline demo L2 persist, hybrid verifiable.

## Consequences
Cargo workspace 4 crates, trait Cache, worktree SQLite WAL safe.
