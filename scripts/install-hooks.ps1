param()
$ErrorActionPreference = "Stop"
Write-Host "Installing git hooks..."
git config core.hooksPath .githooks
if (!(Test-Path ".githooks/pre-commit")) { Write-Host "pre-commit hook missing"; exit 1 }
Write-Host "Hooks installed: core.hooksPath=.githooks"
Write-Host "Install pre-commit framework: pipx install pre-commit; pre-commit install"
