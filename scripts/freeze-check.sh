#!/bin/sh
set -e
echo "=== SEITH Freeze Check ==="
echo "Repo must be public, created 19 Aug–30 Sep 2026, no commit after submit except leaked key via #support"
git log --oneline -5 || echo "no commits yet"
git status --porcelain
echo "Check: cargo fmt --check, cargo clippy, cargo test, secrets not in repo"
cargo fmt --check || echo "fmt fail"
cargo clippy -- -D warnings || echo "clippy fail"
grep -r "SECTORS_API_KEY" --exclude-dir=target --exclude-dir=.git . && echo "secret found!" || echo "no secret in track"
echo "Video checklist: teaser 1m (screen recording CLI+Web) + judging 3m (problem→audience→workflow)"
echo "Freeze: no push after portal submit"
