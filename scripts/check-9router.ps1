param([string]$Url = "http://localhost:20128/v1/models")
try {
  $r = Invoke-WebRequest -Uri $Url -TimeoutSec 5 -UseBasicParsing
  if ($r.StatusCode -eq 200) { Write-Host "9router OK: $Url -> $($r.StatusCode)"; exit 0 }
  Write-Host "9router unexpected: $($r.StatusCode)"; exit 1
} catch {
  Write-Host "9router DOWN: $Url -> $_"
  Write-Host "Fallback degraded:true — dossier tetap lolos MI (LLM opsional Track 3)"
  exit 1
}
