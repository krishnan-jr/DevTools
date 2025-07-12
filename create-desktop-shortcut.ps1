# PowerShell script to create desktop shortcut for Utility App
# Run this script as Administrator for best results

Write-Host "Creating desktop shortcut for Utility App..." -ForegroundColor Green

# Get the current directory
$CurrentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$LauncherPath = Join-Path $CurrentDir "run-launcher.bat"

Write-Host "Current Directory: $CurrentDir" -ForegroundColor Yellow
Write-Host "Launcher Path: $LauncherPath" -ForegroundColor Yellow

# Check if launcher exists
if (-not (Test-Path $LauncherPath)) {
    Write-Host "ERROR: Launcher file not found at $LauncherPath" -ForegroundColor Red
    Write-Host "Make sure launch-app.bat exists in the project directory." -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

# Get desktop path
$DesktopPath = [Environment]::GetFolderPath("Desktop")
Write-Host "Desktop Path: $DesktopPath" -ForegroundColor Yellow

# Create shortcut path
$ShortcutPath = Join-Path $DesktopPath "Utility App.lnk"
Write-Host "Shortcut Path: $ShortcutPath" -ForegroundColor Yellow

try {
    # Create WScript Shell object
    Write-Host "Creating WScript Shell object..." -ForegroundColor Cyan
    $WScriptShell = New-Object -ComObject WScript.Shell
    
    # Create shortcut object
    Write-Host "Creating shortcut object..." -ForegroundColor Cyan
    $Shortcut = $WScriptShell.CreateShortcut($ShortcutPath)
    
    # Set shortcut properties
    Write-Host "Setting shortcut properties..." -ForegroundColor Cyan
    $Shortcut.TargetPath = $LauncherPath
    $Shortcut.WorkingDirectory = $CurrentDir
    $Shortcut.Description = "Launch Utility App - Your offline toolbox for encoding, converting and generating"
    
    # Try to set icon if available
    $IconPath = Join-Path $CurrentDir "icon.ico"
    if (Test-Path $IconPath) {
        Write-Host "Setting custom icon: $IconPath" -ForegroundColor Cyan
        $Shortcut.IconLocation = $IconPath
    } else {
        Write-Host "No custom icon found, using default" -ForegroundColor Yellow
    }
    
    # Save the shortcut
    Write-Host "Saving shortcut..." -ForegroundColor Cyan
    $Shortcut.Save()
    
    # Verify the shortcut was created
    if (Test-Path $ShortcutPath) {
        Write-Host "SUCCESS: Desktop shortcut created successfully!" -ForegroundColor Green
        Write-Host "Shortcut location: $ShortcutPath" -ForegroundColor Yellow
        Write-Host "You can now double-click 'Utility App' on your desktop to launch the application." -ForegroundColor Cyan
    } else {
        Write-Host "ERROR: Shortcut file was not created" -ForegroundColor Red
    }
    
} catch {
    Write-Host "ERROR creating shortcut: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Try running this script as Administrator." -ForegroundColor Yellow
    Write-Host "Full error details: $($_.Exception)" -ForegroundColor Red
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 