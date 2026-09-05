# vendor/ — Read-only Pinned References

> **Do not edit vendor code. Do not add to Cargo.toml members. Copy minimal workflow to `apps/*` (REST sidecar).**

| Path | Source | Commit (pinned 2026-09-05) | License |
|---|---|---|---|
| `vendor/Kronos` | `https://github.com/shiyu-coder/Kronos` | `67b630e67f6a18c9e9be918d9b4337c960db1e9a` | MIT |
| `vendor/TradingAgents` | `https://github.com/TauricResearch/TradingAgents` | `9dee508c44662702281a8dbaad1f7b42179b5ba7` | Apache-2.0 |

## Clone
```powershell
git clone --recurse-submodules --depth 1 https://github.com/kazanaruishere-max/SEITH-MARKET-IDX.git
# or after clone:
git submodule update --init --depth 1
```

## Weights — NOT in vendor
Kronos-base `NeoQuasar/Kronos-base` + `Tokenizer-base` (102.3M) via HF cache (`HF_HOME`), not in `vendor/`. Pull via `uv` (`HF_HOME`).

## Update Procedure (requires ADR)
```powershell
# pin new commit only with founder approval + ADR bump:
.\scripts\update-vendor.ps1 -Vendor Kronos -Ref master
git -C vendor/Kronos rev-parse HEAD  # record new hash to docs/adr/0002-wire.md
```
Never `git pull` vendor without explicit procedure — see `AGENTS.md §4.5` + `docs/adr/0002-wire.md`.
