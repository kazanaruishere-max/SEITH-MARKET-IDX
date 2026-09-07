<#
.SYNOPSIS
  Load SEITH env from .env (root) into current PowerShell session.

.DESCRIPTION
  - Reads .env (gitignored, server-only secrets).
  - Sets process env so cargo run / cargo test see SECTORS_API_KEY etc.
  - Does NOT persist to User/Machine env (use setx for that).
  - Does NOT print SECTORS_API_KEY value to log (AGENTS §4.4 redact).

.EXAMPLE
  pwsh scripts/load-env.ps1
  cargo run -p seith-cli -- ranking --sector FINANCE
#>
[CmdletBinding()]
param(
  [string]$EnvFile = (Join-Path $PSScriptRoot '..\.env')
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $EnvFile)) {
  Write-Error ".env not found at $EnvFile. Copy .env.example -> .env and set SECTORS_API_KEY."
  exit 1
}

$lines = Get-Content -LiteralPath $EnvFile -Encoding UTF8
foreach ($line in $lines) {
  $trim = $line.Trim()
  if ($trim -eq '' -or $trim.StartsWith('#')) { continue }
  $eq = $trim.IndexOf('=')
  if ($eq -lt 1) { continue }
  $key = $trim.Substring(0, $eq).Trim()
  $val = $trim.Substring($eq + 1).Trim()
  [Environment]::SetEnvironmentVariable($key, $val, 'Process')
}

$key = [Environment]::GetEnvironmentVariable('SECTORS_API_KEY', 'Process')
if (-not $key) {
  Write-Warning "SECTORS_API_KEY still empty after load. Edit .env and paste key from sectors.app portal."
} elseif ($key.Length -lt 20) {
  Write-Warning "SECTORS_API_KEY len=$($key.Length) (<20) — config.rs will reject at from_env()"
} else {
  Write-Output "SECTORS_API_KEY loaded: prefix=$($key.Substring(0,4))*** len=$($key.Length)"
}
Write-Output "MARKET=$([Environment]::GetEnvironmentVariable('MARKET','Process'))"
Write-Output "LLM_BASE_URL=$([Environment]::GetEnvironmentVariable('LLM_BASE_URL','Process'))"
Write-Output "KRONOS_URL=$([Environment]::GetEnvironmentVariable('KRONOS_URL','Process'))"
Write-Output "ANALYSIS_URL=$([Environment]::GetEnvironmentVariable('ANALYSIS_URL','Process'))"
