<# 
Trey AI Widget — PRO (Windows) One‑Click Installer
Usage (PowerShell as Administrator):
  Set-ExecutionPolicy -Scope Process Bypass -Force
  .\install_trey_widget_pro.ps1 -Model "llama3:8b" -ServiceName "TreyWidget" -NssmPath "C:\nssm\nssm.exe"

Parameters:
  -InstallDir   : Directory of this project (defaults to script directory)
  -Model        : Ollama model to pull (default: llama3:8b)
  -ServiceName  : Windows service name (default: TreyWidget)
  -NssmPath     : Full path to nssm.exe (optional; if omitted, service won't be registered)
  -PortProxy    : Proxy/API port (default: 3000)
  -WebPort      : Web UI port (default: 5173)
#>

param(
  [string]$InstallDir = (Split-Path -Parent $MyInvocation.MyCommand.Path),
  [string]$Model = "llama3:8b",
  [string]$ServiceName = "TreyWidget",
  [string]$NssmPath = "",
  [int]$PortProxy = 3000,
  [int]$WebPort = 5173
)

function Write-Header($text) {
  Write-Host "== $text ==" -ForegroundColor Cyan
}

function Ensure-Admin {
  $currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
  if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "This script must run as Administrator. Right-click PowerShell and 'Run as administrator'." -ForegroundColor Yellow
    throw "Not running as Administrator."
  }
}

function Ensure-Path([string]$p) {
  if (-not (Test-Path $p)) { New-Item -ItemType Directory -Path $p | Out-Null }
}

function Test-Command($cmd) {
  $old = $ErrorActionPreference; $ErrorActionPreference = "SilentlyContinue"
  $exists = (Get-Command $cmd).Path -ne $null
  $ErrorActionPreference = $old
  return $exists
}

function Install-WithWinget($id, $name) {
  if (-not (Test-Command "winget")) {
    Write-Host "winget not found. Please install 'App Installer' from Microsoft Store." -ForegroundColor Yellow
    return $false
  }
  Write-Header "Installing $name via winget ($id)"
  try {
    winget install --id $id -e --accept-package-agreements --accept-source-agreements -h
    return $true
  } catch {
    Write-Host "winget install failed for $name: $($_.Exception.Message)" -ForegroundColor Yellow
    return $false
  }
}

function Ensure-Node {
  if (Test-Command "node") {
    Write-Host "Node already installed: $(node -v)"
    return
  }
  Install-WithWinget "OpenJS.NodeJS.LTS" "Node.js LTS" | Out-Null
  if (-not (Test-Command "node")) { throw "Node.js is required but was not found after install." }
}

function Ensure-Ollama {
  if (Test-Command "ollama") {
    Write-Host "Ollama found."
    return
  }
  Install-WithWinget "Ollama.Ollama" "Ollama" | Out-Null
  if (-not (Test-Command "ollama")) { throw "Ollama is required but was not found after install." }
}

function Ensure-NPM-Deps {
  Push-Location $InstallDir
  Write-Header "Installing npm dependencies"
  npm install
  Pop-Location
}

function Ensure-Env {
  Push-Location $InstallDir
  if (-not (Test-Path ".env") -and (Test-Path ".env.sample")) {
    Copy-Item ".env.sample" ".env"
  }
  if (-not (Test-Path ".env")) {
    # create a minimal .env
    @"
MODEL=$Model
OLLAMA_BASE=http://localhost:11434
PROXY_PORT=$PortProxy
WEB_PORT=$WebPort
WIDGET_SECRET=$( -join ((48..57)+(65..90)+(97..122) | Get-Random -Count 24 | ForEach-Object {[char]$_}) )
RATE_WINDOW_MS=60000
RATE_MAX=60
"@ | Set-Content ".env" -Encoding UTF8
  } else {
    # ensure ports and model are present
    $envText = Get-Content ".env" -Raw
    if ($envText -notmatch "MODEL=") { Add-Content ".env" "MODEL=$Model" }
    if ($envText -notmatch "OLLAMA_BASE=") { Add-Content ".env" "OLLAMA_BASE=http://localhost:11434" }
    if ($envText -notmatch "PROXY_PORT=") { Add-Content ".env" "PROXY_PORT=$PortProxy" }
    if ($envText -notmatch "WEB_PORT=") { Add-Content ".env" "WEB_PORT=$WebPort" }
    if ($envText -notmatch "WIDGET_SECRET=") { Add-Content ".env" ("WIDGET_SECRET=" + ( -join ((48..57)+(65..90)+(97..122) | Get-Random -Count 24 | ForEach-Object {[char]$_}) )) }
    if ($envText -notmatch "RATE_WINDOW_MS=") { Add-Content ".env" "RATE_WINDOW_MS=60000" }
    if ($envText -notmatch "RATE_MAX=") { Add-Content ".env" "RATE_MAX=60" }
  }
  Pop-Location
}

function Ensure-Model {
  Write-Header "Pulling Ollama model $Model"
  try {
    ollama pull $Model
  } catch {
    Write-Host "Failed to pull model $Model: $($_.Exception.Message)" -ForegroundColor Yellow
  }
}

function Register-Service {
  param([string]$SvcName, [string]$NssmExe, [string]$AppDir)

  if (-not $NssmExe -or -not (Test-Path $NssmExe)) {
    Write-Host "NSSM path not provided or invalid. Skipping service registration." -ForegroundColor Yellow
    return
  }
  Write-Header "Registering Windows service $SvcName"
  & "$NssmExe" install $SvcName "C:\Program Files\nodejs\node.exe" "$AppDir\server.js"
  & "$NssmExe" set $SvcName AppDirectory "$AppDir"
  & "$NssmExe" set $SvcName Start SERVICE_AUTO_START
  & "$NssmExe" set $SvcName AppRestartDelay 5000
  & "$NssmExe" set $SvcName AppStdout "$AppDir\logs\service-out.log"
  & "$NssmExe" set $SvcName AppStderr "$AppDir\logs\service-err.log"
  & "$NssmExe" start $SvcName
}

# -------- MAIN --------
try {
  Ensure-Admin
  Write-Header "Install Directory: $InstallDir"
  Ensure-Path "$InstallDir\logs"
  Ensure-Path "$InstallDir\rag\docs"

  Ensure-Node
  Ensure-Ollama
  Ensure-Env
  Ensure-NPM-Deps
  Ensure-Model

  # Start in dev once to verify
  Write-Header "Verifying server starts (dev)"
  Push-Location $InstallDir
  # Start then immediately stop to ensure it launches (non-blocking test)
  $node = Start-Process node -ArgumentList "server.js" -WorkingDirectory $InstallDir -PassThru
  Start-Sleep -Seconds 2
  if ($node.HasExited) {
    Write-Host "Warning: server exited early (check logs)." -ForegroundColor Yellow
  } else {
    Stop-Process -Id $node.Id -Force
  }
  Pop-Location

  # Register Windows service if NSSM provided
  if ($NssmPath) {
    Register-Service -SvcName $ServiceName -NssmExe $NssmPath -AppDir $InstallDir
    Write-Host "Service '$ServiceName' registered. Use 'services.msc' to manage." -ForegroundColor Green
  } else {
    Write-Host "NSSM path not provided. Run later to register service:" -ForegroundColor Yellow
    Write-Host "  scripts\register-service.bat C:\nssm\nssm.exe"
  }

  Write-Header "Done!"
  Write-Host "UI (dev): http://localhost:$WebPort"
  Write-Host "API: http://localhost:$PortProxy/api/trey (send header x-widget-secret from .env)"
  Write-Host "Logs: $InstallDir\logs\SESSION-*.log"
} catch {
  Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}
