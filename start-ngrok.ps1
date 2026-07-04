[CmdletBinding()]
param(
  [switch]$NoOpen
)

$ErrorActionPreference = "Stop"

$Port = 5173
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$ApiUrl = "http://127.0.0.1:4040/api/tunnels"
$UrlTextPath = Join-Path $Root "ngrok-url.txt"
$UrlShortcutPath = Join-Path $Root "ngrok-url.url"

function Get-NgrokPath {
  $ngrokCommand = Get-Command ngrok -ErrorAction SilentlyContinue
  if ($ngrokCommand) {
    return $ngrokCommand.Source
  }

  throw "ngrok was not found. Install ngrok, sign in with ngrok config add-authtoken, then run start.bat again."
}

function Get-ReservedNgrokUrl {
  if (-not [string]::IsNullOrWhiteSpace($env:NGROK_URL)) {
    return $env:NGROK_URL.Trim()
  }

  $reservedUrlFile = Join-Path $Root "ngrok-reserved-url.local.txt"
  if (Test-Path -LiteralPath $reservedUrlFile) {
    $line = Get-Content -LiteralPath $reservedUrlFile |
      Where-Object { -not [string]::IsNullOrWhiteSpace($_) -and -not $_.Trim().StartsWith("#") } |
      Select-Object -First 1

    if ($line) {
      return $line.Trim()
    }
  }

  return $null
}

function Get-NgrokTunnelUrl {
  try {
    $response = Invoke-RestMethod -Uri $ApiUrl -TimeoutSec 1
  } catch {
    return $null
  }

  $tunnels = @($response.tunnels)
  $candidate = $tunnels |
    Where-Object {
      $_.public_url -like "https://*" -and
      $_.config.addr -match "\b$Port\b"
    } |
    Select-Object -First 1

  if ($candidate) {
    return $candidate.public_url
  }

  return $null
}

function Test-HasOtherNgrokTunnel {
  try {
    $response = Invoke-RestMethod -Uri $ApiUrl -TimeoutSec 1
  } catch {
    return $false
  }

  $tunnels = @($response.tunnels)
  if (-not $tunnels.Count) {
    return $false
  }

  return -not [bool](Get-NgrokTunnelUrl)
}

function Stop-OtherNgrokHttpTunnels {
  $processes = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
    Where-Object {
      $_.Name -eq "ngrok.exe" -and
      $_.CommandLine -match "\bhttp\b" -and
      $_.CommandLine -notmatch "\b$Port\b"
    }

  foreach ($process in $processes) {
    Stop-Process -Id $process.ProcessId -Force
    Write-Host "Stopped non-challenge ngrok http tunnel process $($process.ProcessId)."
  }

  if ($processes) {
    Start-Sleep -Milliseconds 800
  }
}

function Wait-ForNgrokUrl {
  for ($i = 0; $i -lt 60; $i += 1) {
    $url = Get-NgrokTunnelUrl
    if ($url) {
      return $url
    }

    Start-Sleep -Milliseconds 500
  }

  throw "ngrok did not publish a tunnel URL. Check ngrok.log or run ngrok http $Port manually."
}

function Save-NgrokUrl($url) {
  Set-Content -LiteralPath $UrlTextPath -Value $url -Encoding UTF8
  Set-Content -LiteralPath $UrlShortcutPath -Value @("[InternetShortcut]", "URL=$url") -Encoding ASCII
}

Set-Location -LiteralPath $Root

& (Join-Path $Root "start-challenge.ps1") -NoOpen

$publicUrl = Get-NgrokTunnelUrl
if (-not $publicUrl) {
  if (Test-HasOtherNgrokTunnel) {
    Stop-OtherNgrokHttpTunnels
  }

  $ngrok = Get-NgrokPath
  $reservedUrl = Get-ReservedNgrokUrl
  $args = @("http", $Port.ToString(), "--log=ngrok.log")

  if ($reservedUrl) {
    if ($reservedUrl -notmatch "^https?://") {
      throw "NGROK_URL or ngrok-reserved-url.local.txt must contain a full URL such as https://example.ngrok.app."
    }

    $args += @("--url", $reservedUrl)
  }

  Start-Process `
    -FilePath $ngrok `
    -ArgumentList $args `
    -WorkingDirectory $Root `
    -WindowStyle Hidden `
    -PassThru | Out-Null

  $publicUrl = Wait-ForNgrokUrl
}

Save-NgrokUrl $publicUrl

Write-Host "ngrok URL: $publicUrl"
Write-Host "Shortcut updated: $UrlShortcutPath"

if (-not $NoOpen) {
  Start-Process $publicUrl
}
