[CmdletBinding()]
param(
  [switch]$NoOpen
)

$ErrorActionPreference = "Stop"

$Port = 5173
$Url = "http://127.0.0.1:$Port/"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

function Get-NodePath {
  $bundledNode = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
  if (Test-Path -LiteralPath $bundledNode) {
    return $bundledNode
  }

  $nodeCommand = Get-Command node -ErrorAction SilentlyContinue
  if ($nodeCommand) {
    return $nodeCommand.Source
  }

  throw "Node.js was not found. Install Node.js or run this from Codex with the bundled runtime available."
}

function Get-PortOwner {
  $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1

  if (-not $connection) {
    return $null
  }

  $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
  $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $($connection.OwningProcess)" -ErrorAction SilentlyContinue

  [pscustomobject]@{
    Process = $process
    CommandLine = $processInfo.CommandLine
  }
}

function Test-IsChallengeServer($owner) {
  if (-not $owner -or -not $owner.Process) {
    return $false
  }

  $isNode = $owner.Process.ProcessName -like "node*"
  $usesServerJs = $owner.CommandLine -match "server\.js"
  return $isNode -and $usesServerJs
}

function Wait-ForServer {
  for ($i = 0; $i -lt 20; $i += 1) {
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 1
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        return
      }
    } catch {
      Start-Sleep -Milliseconds 250
    }
  }

  throw "The server did not respond at $Url. Check server.err.log for details."
}

Set-Location -LiteralPath $Root

$owner = Get-PortOwner
if ($owner) {
  if (-not (Test-IsChallengeServer $owner)) {
    $name = if ($owner.Process) { $owner.Process.ProcessName } else { "unknown process" }
    throw "Port $Port is already in use by $name. Not starting the challenge server."
  }

  Write-Host "Challenge server is already running on $Url"
} else {
  $node = Get-NodePath
  $stdout = Join-Path $Root "server.log"
  $stderr = Join-Path $Root "server.err.log"

  Start-Process `
    -FilePath $node `
    -ArgumentList "server.js" `
    -WorkingDirectory $Root `
    -WindowStyle Hidden `
    -RedirectStandardOutput $stdout `
    -RedirectStandardError $stderr `
    -PassThru | Out-Null

  Wait-ForServer
  Write-Host "Challenge server started on $Url"
}

if (-not $NoOpen) {
  Start-Process $Url
}

Write-Host "Ready: $Url"
