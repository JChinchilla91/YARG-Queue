# Allow YARG Party Queue through Windows Firewall (run as Administrator).
$ports = @(3001, 5173)
$ruleName = "YARG Party Queue"

foreach ($port in $ports) {
  $existing = Get-NetFirewallRule -DisplayName "$ruleName (TCP $port)" -ErrorAction SilentlyContinue
  if ($existing) {
    Write-Host "Rule already exists for port $port"
    continue
  }
  New-NetFirewallRule `
    -DisplayName "$ruleName (TCP $port)" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort $port `
    -Action Allow `
    -Profile Private, Domain | Out-Null
  Write-Host "Added inbound allow rule for TCP $port"
}

Write-Host ""
Write-Host "Done. Use your Wi-Fi IP (e.g. 192.168.1.x), not VPN or VirtualBox addresses."
Write-Host "On the host PC, check http://localhost:3001/api/health for joinUrls."
