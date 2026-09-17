# Task 05 — Security Audit Detail

## Goal
Audit keamanan MANDATORY pra-freeze — `SECTORS_API_KEY` server-only `Redacted ***` never client/log, input validation ketat, rate limit, vendor pin, gitleaks 0 — zero kebocoran data.

## Context
- SSOT: `AGENTS §4 Tier-0 + §8c` + `docs/adr/0002 vendor pin` + `crates/seith-core/src/redact.rs` + `crates/seith-core/src/config.rs Redacted` + `crates/seith-core/src/models.rs TICKER_RE deny_unknown_fields` + `crates/seith-api/src/handlers.rs rate_limit tower-http` + `.githooks/pre-commit gitleaks v8.18.0 + grep secrets` + `.github/workflows/freeze-check.yml gitleaks-action v2 + grep fallback` + `scripts/freeze-check.sh` + `apps/web/next.config.js rewrites` (no API key to client)
- Dependensi: 04-vercel-deploy done (Vercel secrets + build 4 routes)
- Branch: `handoff/22-accessibility` worktree `../seith-wt/handoff-22` — Z1 `crates/*` Z2 `apps/web` Z7 `.opencode,.github,.githooks`

## Scope In / Out
In: `crates/seith-core/src/redact.rs` (Redacted debug `***`) Z1 + `crates/seith-core/src/config.rs` Z1 (env `SECTORS_API_KEY` length≥20 server-only) + `crates/seith-api/src/handlers.rs` Z1 (deny_unknown_fields 422 + Market enum + TICKER_RE + pageSize 50 + lookback>512→422 + rate limit tower-http) + `apps/web/next.config.js` Z2 (no `SECTORS_API_KEY` in client bundle) + `apps/web/vercel.json` Z2 (env secrets) + `.gitleaks.toml` Z7 + `.pre-commit-config.yaml` Z7 + `.github/workflows/freeze-check.yml` Z7 — root configs explicit Z7
Out: `DossierPDF` polish (03 done), live Sectors 25c fetch (gated), Kronos 102M warm (gated)

## Todo
- [ ] `todowrite in_progress` before; `completed` only after Verify hijau + Block

## Bagian — Surgical Breakdown
| Bag | File | Fn/Struct | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `crates/seith-core/src/redact.rs` | `Redacted(String)` | `Debug/Display` → `"***"` never leak; `sanitize_error` redacts `SECTORS_API_KEY=` + `LLM_BASE_URL=` + `api_key` substring in `Display`/`error_chain` | log contains `sk-` |
| b | `crates/seith-core/src/config.rs` | `AppConfig::from_env()` | `SECTORS_API_KEY` `len≥20` + `Redacted` wrapper + `SEITH_API_KEY` optional `Bearer` only if non-empty + `MARKET default Id` + `LLM_BASE_URL default :20128` — never to client | key `<20` passes |
| c | `crates/seith-api/src/handlers.rs` | validation | `#[serde(deny_unknown_fields)]` all Query `Ranking/Score/Dossier/Backtest/Anomalies/ScanBody` + `TICKER_RE ^[A-Z0-9]{3,6}$` `Market::from_str Id|Sg` `pageSize 50 clamp` `lookback>512 422 max_context 512` `check_sort/order/format/lang` 422 | `xx` market 200 |
| d | `crates/seith-api/src/handlers.rs` + `crates/seith-api/src/lib.rs` | rate limit | `tower-http` limit `60/min ranking/score, 10/min scan` configured (or documented as `tower-http` middleware in `lib.rs` router) — verify `cargo clippy` clean + `grep -rn "tower-http\|RateLimit\|Governor" crates/seith-api/` | no limit |
| e | `.gitleaks.toml` | `[[rules]] id=sectors-api-key` | `regex = '''SECTORS_API_KEY\s*=\s*.{10,}'''` + `allowlist .env.example` `0843` revoked placeholder | leak not caught |
| f | `apps/web/next.config.js` | client bundle | `grep -r SECTORS_API_KEY apps/web/.next` → 0; `grep -r process.env.SECTORS_API_KEY apps/web` → 0; `NEXT_PUBLIC_API_BASE` only public var allowed | key in `.next` JS |
| g | `scripts/freeze-check.sh` | gitleaks detect + fallback grep | `gitleaks detect --no-git --config .gitleaks.toml` 0 findings (primary: scans actual secret values) — fallback `grep -r "SECTORS_API_KEY=.*\S\S\S" --exclude-dir=target --exclude-dir=.git --exclude-dir=.venv --exclude=.env.example --exclude=.gitleaks.toml .` checks `KEY=actual_value` pattern (name alone in wrapper/docs is ok, `KEY=value` with real secret is not) | leak 1 |

## Deliverables + Acceptance
- `cargo test -p seith-core redact -- --nocapture` → `sanitize_anonymizes_all_keys` pass + `gitleaks detect --no-git --config .gitleaks.toml` → 0 findings (value scan is authoritative; `grep -r SECTORS_API_KEY` will show `Redacted` wrapper — that's ok, gitleaks must be 0)
- `grep -r "SECTORS_API_KEY" apps/web/.next` → 0 + `grep -r "SECTORS_API_KEY" apps/web/next.config.js` → 0 (no client leak)
- `gitleaks detect --no-git` → 0 findings + `gh pr checks freeze` gitleaks-action v2 pass
- `cargo fmt 0 clippy -D 0 test 89+` + `cargo test -p seith-api handlers::tests deny_unknown_fields 422` green
- `AGENTS §4 Tier-0` checklist paste nyata + `seith-security-reviewer` APPROVE pra-freeze

## Verification
```bash
set -o pipefail
cargo test -p seith-core redact -- --nocapture  # expected: sanitize_anonymizes_all_keys ok
gitleaks detect --no-git --config .gitleaks.toml 2>&1 | tail -10  # expected: 0 findings (no --verbose, pipefail preserves exit)
# Name check (will show wrapper) vs value check (gitleaks authoritative):
grep -rn "SECTORS_API_KEY=" --exclude-dir=target --exclude-dir=.git --exclude-dir=.venv --exclude=.env.example --exclude=.gitleaks.toml . 2>&1 | head -10 || echo "no KEY=value leak ok"
grep -rn "SECTORS_API_KEY" apps/web/.next 2>&1 | head -5 && echo "BUNDLE LEAK!" || echo "no bundle leak ok"
bash scripts/freeze-check.sh 2>&1 | tail -15
cargo fmt --check; cargo clippy -- -D warnings; cargo test -- --nocapture | tail -10
```

## Peran + Skill
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| T2 | sub-agent | `security-review` + `seith-market-intelligence` + `verification-loop` | `seith-security-reviewer` | MANDATORY pra-freeze gate 8c |

## Next
Phase 22 done → `seith-phase-gate` dual-review `code+security` + `verification-loop` + PR `handoff/22-accessibility → main` squash after H21 merge + `gh pr checks 6 strict` green.
