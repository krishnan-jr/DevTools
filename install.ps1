# PowerShell script to install Utility App
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Utility App - Desktop Installer" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "[ERROR] Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Red
    Write-Host "After installation, restart your computer and run this installer again." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[OK] Dependencies installed successfully" -ForegroundColor Green

# Create desktop shortcut
Write-Host "Creating desktop shortcut..." -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File create-desktop-shortcut.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] Failed to create desktop shortcut automatically" -ForegroundColor Red
    Write-Host "You can create it manually by running: powershell -ExecutionPolicy Bypass -File create-desktop-shortcut.ps1" -ForegroundColor Yellow
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "   Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your Utility App is now ready to use:" -ForegroundColor Cyan
Write-Host "1. Double-click 'Utility App' on your desktop to launch" -ForegroundColor Cyan
Write-Host "2. Or run: powershell -ExecutionPolicy Bypass -File launch-app.ps1" -ForegroundColor Cyan
Write-Host "3. Or run: npm run launch (if configured)" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan
Write-Host "The app will start on: http://localhost:3000" -ForegroundColor Cyan
Read-Host "Press Enter to exit" 