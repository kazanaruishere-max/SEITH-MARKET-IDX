# Security — SEITH (Anti-Bocor 3 Lapis)

## Status Key
- Key `0843...ff004` **sudah revoke 2026-09-05** — anggap bocor historis. Cek historis: `git log --all -p | Select-String SECTORS_API_KEY` harus kosong di commit baru.
- Key baru **JANGAN** pernah di-paste di issue/chat/log. Hanya di `.env` lokal + GitHub Actions Secret `SECTORS_API_KEY` (jika perlu integration test).

## Lapis 1 — Pre-commit Lokal (blok sebelum commit)
- `.pre-commit-config.yaml` + `.gitleaks.toml` — hook `gitleaks` + `cargo fmt --check` + `grep SECTORS_API_KEY=...{10,}`
- Alternatif tanpa pre-commit framework: `git config core.hooksPath .githooks` → `.githooks/pre-commit` (grep + fmt)
- Install: `scripts/install-hooks.ps1` atau `pipx install pre-commit && pre-commit install`
- PM `seith-pm` veto jika hook tidak lolos.

## Lapis 2 — CI & GitHub (blok PR)
- `ci.yml`: `permissions: contents:read` + `rustsec/audit-check` + cache.
- `freeze-check.yml`: `permissions: contents:read, security-events:write` + `gitleaks-action@v2` dengan `.gitleaks.toml` + fallback grep `SECTORS_API_KEY=[^\s]{10,}`.
- `dependabot.yml`: cargo + npm + pip weekly.
- Branch protection `main`: Require `CI` + `Freeze Check` + 1 review, no bypass, no force push — setup via `gh api repos/kazanaruishere-max/SEITH-MARKET-IDX/branches/main/protection`.

## Lapis 3 — Runtime (anti-bocor di app & log)
- `crates/seith-core/src/config.rs` — `AppConfig::from_env()` fail-fast jika `SECTORS_API_KEY` missing/<20 char atau `MARKET` bukan `id|sg`. Env hanya di server, never ke client.
- `crates/seith-core/src/redact.rs` — `redact()` + `sanitize_error()` + `Redacted<T>` — `tracing` layer tidak log `SECTORS_API_KEY` / `LLM_BASE_URL`. Envelope `error.message` tidak echo key.
- Validasi boundary: `validator` + `deny_unknown_fields`, ticker `^[A-Z0-9]{3,6}$`, `market id|sg`, `lookback ≤512`.

## Rotation Procedure (jika bocor lagi)
1. Revoke di portal Sectors (immediate).
2. `Copy-Item .env.example .env` isi key baru (jangan commit).
3. Jika sempat ter-commit: `git log --all -S SECTORS_API_KEY` → `git filter-repo` atau `BFG` scrub historis + `gh secret set SECTORS_API_KEY`.
4. Exception freeze: `git commit --allow-empty -m "chore: rotate leaked key"` via #support.

## Checklist
- [ ] `.env` gitignored, `.env.example` hanya placeholder kosong
- [ ] `git config core.hooksPath .githooks` aktif
- [ ] `gitleaks detect --no-git` lokal pass
- [ ] `cargo test` tidak butuh `SECTORS_API_KEY` real (mock via `wiremock`/`mockito`)
- [ ] 9router `localhost:20128` Tier-0 NEVER kill — check `scripts/check-9router.ps1` sebelum dossier
