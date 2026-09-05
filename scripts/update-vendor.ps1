param([ValidateSet("Kronos","TradingAgents")][string]$Vendor,[string]$Ref="master")
$ErrorActionPreference="Stop"
if (-not $Vendor) { Write-Host "Usage: .\scripts\update-vendor.ps1 -Vendor Kronos|TradingAgents -Ref master"; exit 1 }
$path = "vendor/$Vendor"
Write-Host "Updating $path to $Ref..."
git -C $path fetch --depth 1 origin $Ref
git -C $path checkout $Ref
git -C $path pull --depth 1 origin $Ref
$hash = git -C $path rev-parse HEAD
Write-Host "New $Vendor hash: $hash"
Write-Host "Update docs/adr/0002-wire.md + vendor/README.md with new hash, commit, and get founder approval (ADR required)."
