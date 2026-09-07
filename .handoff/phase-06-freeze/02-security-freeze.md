# Task 02 — Security Mandatory + Gitleaks + Protection 6

## Goal
`security-reviewer` PASS mandatory pra-freeze — `gitleaks 0` + `grep SECTORS_API_KEY 0` + `protection 6 strict:true enforce_admins`.

## Context
- SSOT: `AGENTS.md §4 Tier-0 §7 DoD §8 Cadence` + `.gitleaks.toml` + `.githooks/pre-commit` + `.pre-commit-config.yaml` + `scripts/freeze-check.sh` + `.github/workflows/freeze-check.yml` + `protection.json` 6 contexts + `crates/seith-core/src/{config,redact}` `AppConfig::from_env() + Redacted` + `skill://security-review`

## Scope In / Out
In: Z7 `scripts/freeze-check.sh + .github/workflows/{ci,freeze-check}.yml + .gitleaks.toml + .pre-commit + .githooks + protection` + Z1 `crates/seith-core/src/{config,redact,normalize}` validation — verify only, no logic
Out: `apps/*` feature (verify only), `data/seith.db` (no migration), `docs/*` (01), `vendor/*` read-only

## Bagian — Surgical
| Bag | Cmd / File | Check | Acceptance | Test FAIL |
|---|---|---|---|---|
| 02a | `gitleaks detect --no-git -v` | no secret in track | `0 leaks` | `1 leak→FAIL` |
| 02b | `grep -r SECTORS_API_KEY --exclude-dir=target --exclude-dir=.git` | not in repo | `no match except .env.example placeholder + .gitleaks.toml` | `found→FAIL` |
| 02c | `git ls-files \| grep -E "^\.env$"` | not tracked | `no .env tracked` | `tracked→FAIL` |
| 02d | `gh api repos/.../branches/main/protection --jq` | strict 6 | `strict:true contexts 6 enforce_admins 1 review` | `5 contexts→FAIL` |
| 02e | `./scripts/freeze-check.sh` | gate script 0 | `fmt 0 clippy 0 no secret` | `fail→FAIL` |
| 02f | `crates/seith-core/src/redact.rs + config.rs` | env-only server | `LLM_BASE_URL + SECTORS_API_KEY never to client` | `client log→FAIL` |
| 02g | `security-reviewer` sub-agent | mandatory sign-off | `PASS comment on PR 02` | `no review→FAIL` |

## Deliverables + Acceptance
- `gitleaks 0` + `grep 0` + `.env` not tracked + `SECTORS_API_KEY 0843... revoked 2026-09-05` note in `SECURITY.md`
- `protection 6` `strict:true enforce_admins require 1` — `gh api` paste
- `freeze-check.sh` 0 — `cargo fmt --check 0 clippy 0 no secret`
- `security-reviewer` mandatory PASS — no auto-approve

## Verification
```
gitleaks detect --no-git → 0
grep -r SECTORS_API_KEY → 0 (except .env.example)
git ls-files | grep ^.env$ → 0
gh api .../protection --jq → strict:true 6 contexts
./scripts/freeze-check.sh → 0
cargo fmt --check → 0 && cargo clippy -- -D warnings → 0
```

### Accountability Block
```
✅ Terverifikasi: <cmd> → <output> paste nyata
⚠️ Belum: Video (03)
🔻 Risiko: leaked key in history → mitigasi gitleaks + git log -p grep + rotate
♻️ Refactor: consolidate sanitize_error() redact.rs shared
```

## Peran + Skill
| Peran | Eksekutor | Skill | Sub-agent | Kapan |
|---|---|---|---|---|
| Reviewer Security | `security-reviewer` | `security-review` | `security-reviewer` | **mandatory pra-freeze** — secrets |
| Reviewer Rust | `rust-reviewer` | `code-reviewer` | `code-reviewer` | validation `ticker ^[A-Z0-9]{3,6}$` |
| PM | `seith-pm` | gate | — | veto if 0 leak fail |
| T1 | sub-agent | `seith-market-intelligence`+`verification-loop` | `explore` | grep/gitleaks red→green |

## Next
`skill://seith-market-intelligence` + `handoff/06-freeze` + `02-security-freeze.md` + ritual 3Q: gate? `no secret + 6 contexts`. jebakan? `SECTORS_API_KEY in log`. test FAIL? `gitleaks 1`.
