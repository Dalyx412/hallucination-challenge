[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

$Port = 5173

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

function Get-ChallengeNgrokProcesses {
  Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
    Where-Object {
      $_.Name -eq "ngrok.exe" -and
      $_.CommandLine -match "\bhttp\b" -and
      $_.CommandLine -match "\b$Port\b"
    }
}

$owner = Get-PortOwner
if (-not $owner) {
  Write-Host "No challenge server is listening on port $Port."
} elseif (-not (Test-IsChallengeServer $owner)) {
  $name = if ($owner.Process) { $owner.Process.ProcessName } else { "unknown process" }
  throw "Port $Port is used by $name, not the challenge server. Nothing was stopped."
} else {
  $processId = $owner.Process.Id
  Stop-Process -Id $processId -Force
  Write-Host "Stopped challenge server process $processId."
}

$ngrokProcesses = @(Get-ChallengeNgrokProcesses)
if (-not $ngrokProcesses.Count) {
  Write-Host "No challenge ngrok tunnel process was found."
  exit 0
}

foreach ($ngrokProcess in $ngrokProcesses) {
  Stop-Process -Id $ngrokProcess.ProcessId -Force
  Write-Host "Stopped challenge ngrok tunnel process $($ngrokProcess.ProcessId)."
}
