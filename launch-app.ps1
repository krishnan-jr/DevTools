# PowerShell script to launch Utility App
Write-Host "Starting Utility App..." -ForegroundColor Green

# Change to the script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install dependencies." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Start the server
Write-Host "Starting server on http://localhost:3000" -ForegroundColor Green
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'npm start' -WindowStyle Hidden

# Wait a moment for the server to start
Start-Sleep -Seconds 3

# Open the browser
Write-Host "Opening browser..." -ForegroundColor Yellow
Start-Process "http://localhost:3000"

Write-Host "Utility App is now running!" -ForegroundColor Green
Write-Host "Server: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press any key to stop the server..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Kill the Node.js process
Get-Process node -ErrorAction SilentlyContinue | ForEach-Object { $_.Kill() }
Write-Host "Server stopped." -ForegroundColor Red 