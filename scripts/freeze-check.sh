#!/bin/sh
set -e
echo "=== SEITH Freeze Check ==="
echo "Repo must be public, created 19 Aug–30 Sep 2026, no commit after submit except leaked key via #support"
git log --oneline -5
git status --porcelain
echo "Check: cargo fmt --check, cargo clippy, cargo test, secrets not in repo"
cargo fmt --check
cargo clippy -- -D warnings
cargo test -- --nocapture
if grep -r "SECTORS_API_KEY=[^[:space:]]\{10,\}" --exclude-dir=target --exclude-dir=.git --exclude=.env.example --exclude=.gitleaks.toml . 2>/dev/null; then
  echo "secret found! FAIL"
  exit 1
fi
echo "no secret in track"
echo "Check: 9router liveness (mocked if offline)"
if command -v curl >/dev/null 2>&1; then curl -sf http://localhost:20128/v1/models >/dev/null 2>&1 && echo "9router up" || echo "9router down (mocked degraded:true)"; fi
echo "Video checklist: teaser 1m (screen recording CLI+Web) + judging 3m (problem→audience→workflow)"
echo "Freeze: no push after portal submit"
