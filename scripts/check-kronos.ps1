param([string]$Url = "http://localhost:8001/health")
try {
  $r = Invoke-WebRequest -Uri $Url -TimeoutSec 5 -UseBasicParsing
  if ($r.StatusCode -eq 200) { Write-Host "kronos OK: $Url -> $($r.StatusCode)"; exit 0 }
  Write-Host "kronos unexpected: $($r.StatusCode)"; exit 1
} catch {
  Write-Host "kronos DOWN: $Url -> $_"
  Write-Host "Fallback degraded:true — ranking tetap jalan tanpa Kronos (forecast 0)"
  exit 1
}
