# Fast boot SEITH — reuse binary, visible progress, never boot blind.
# Usage: ./scripts/fast-boot.ps1 [-Build] [-Mock 1]
param([switch]$Build, [string]$Mock = "1")
$ErrorActionPreference = "Stop"
. ./scripts/load-env.ps1 | Out-Null
function Wait-Health($url, $name, $timeoutSec = 60) {
  $t0 = Get-Date
  while (((Get-Date) - $t0).TotalSeconds -lt $timeoutSec) {
    try {
      $r = Invoke-WebRequest -Uri $url -TimeoutSec 3 -UseBasicParsing
      Write-Output "$name UP ($($r.StatusCode)) in $([int]((Get-Date)-$t0).TotalSeconds)s"
      return $true
    } catch {
      $el = [int]((Get-Date) - $t0).TotalSeconds
      Write-Output "$name waiting... ${el}s"
      Start-Sleep 3
    }
  }
  throw "$name NOT UP after ${timeoutSec}s"
}
try {
  Invoke-WebRequest -Uri http://localhost:20128/v1/models -TimeoutSec 5 -UseBasicParsing | Out-Null
  Write-Output "9router :20128 UP (never kill)"
} catch { throw "9router :20128 DOWN — abort, check process (NEVER kill, only verify)" }
try {
  Invoke-WebRequest -Uri http://localhost:8001/health -TimeoutSec 5 -UseBasicParsing | Out-Null
  Write-Output "kronos :8001 already UP — reuse"
} catch {
  Write-Output "kronos :8001 DOWN — booting MOCK=$Mock..."
  $env:KRONOS_MOCK = $Mock
  Start-Process -FilePath "$PWD/apps/kronos-sidecar/.venv/Scripts/python.exe" -ArgumentList "-m uvicorn app.main:app --host 127.0.0.1 --port 8001" -WorkingDirectory "$PWD/apps/kronos-sidecar" -WindowStyle Hidden
  Wait-Health http://localhost:8001/health "kronos :8001"
}
if ($Build) { cargo build -p seith-api --bin serve }
try {
  Invoke-WebRequest -Uri http://localhost:8181/health -TimeoutSec 5 -UseBasicParsing | Out-Null
  Write-Output "serve :8181 already UP — reuse"
} catch {
  Write-Output "serve :8181 DOWN — booting serve.exe directly (no cargo run)..."
  $env:SEITH_API_BIND = "127.0.0.1:8181"
  Start-Process -FilePath "$PWD/target/debug/serve.exe" -WindowStyle Hidden
  Wait-Health http://localhost:8181/health "serve :8181"
}
Write-Output "ALL UP — 20128/8001/8181"
