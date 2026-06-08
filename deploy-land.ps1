# Deploy and Sync Script for ct-LAND
# Usage: pwsh deploy-land.ps1

$LOCAL_DIR = $PSScriptRoot
Set-Location $LOCAL_DIR

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  CT-LAND - Build, Sync & Deploy"
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Build the Landing Page
Write-Host "`n[1/4] Generating index.html..." -ForegroundColor Yellow
node build_landing.js

# 2. Sync to GitHub
Write-Host "`n[2/4] Syncing to GitHub..." -ForegroundColor Yellow
git add .
git commit -m "Auto-update landing page and deploy scripts"
git push --no-verify

# 3. Deploy to Devices (SCP)
# Load Environment Variables for passwords
$RPI_PASSWORD = ""
$NETBOOK_PASSWORD = ""
if (Test-Path "$LOCAL_DIR/.env") {
    Get-Content "$LOCAL_DIR/.env" | ForEach-Object {
        if ($_ -match "^RPI_PASSWORD=(.*)") { $RPI_PASSWORD = $matches[1].Trim() }
        if ($_ -match "^NETBOOK_PASSWORD=(.*)") { $NETBOOK_PASSWORD = $matches[1].Trim() }
    }
}

function Deploy-Target {
    param([string]$Name, [string]$HostStr, [string]$Dir, [string]$Password, [string]$IP)
    
    # Ping to check if available locally
    $ping = Test-Connection -ComputerName $IP -Count 1 -Quiet
    if (-not $ping) {
        Write-Host "`n[!] $Name ($IP) is offline. Skipping local deploy. It will auto-update via cron when online." -ForegroundColor Red
        return
    }

    Write-Host "`n=========================================" -ForegroundColor Cyan
    Write-Host "  Deploying to $Name ($HostStr)" -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Cyan

    $env:SSHPASS = $Password

    # Create directory
    if ($env:SSHPASS) {
        sshpass -e ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 $HostStr "mkdir -p $Dir"
    } else {
        ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 $HostStr "mkdir -p $Dir"
    }

    Write-Host "Copying files..." -ForegroundColor Yellow

    # Inject password into auto_update.sh for this specific device
    (Get-Content auto_update.sh) -replace 'SUDO_PASSWORD', $Password | Set-Content "auto_update_$Name.sh"

    # Exclude node_modules and .git
    if ($env:SSHPASS) {
        sshpass -e scp -o StrictHostKeyChecking=no index.html "auto_update_$Name.sh" install_cron.sh "${HostStr}:${Dir}/"
        # Rename it back on the remote
        sshpass -e ssh -o StrictHostKeyChecking=no $HostStr "mv ${Dir}/auto_update_$Name.sh ${Dir}/auto_update.sh"
    } else {
        scp -o StrictHostKeyChecking=no index.html "auto_update_$Name.sh" install_cron.sh "${HostStr}:${Dir}/"
        ssh -o StrictHostKeyChecking=no $HostStr "mv ${Dir}/auto_update_$Name.sh ${Dir}/auto_update.sh"
    }
    
    # Cleanup local temp file
    Remove-Item "auto_update_$Name.sh"

    # Install cron
    Write-Host "Installing Auto-Update Cron Job..." -ForegroundColor Yellow
    if ($env:SSHPASS) {
        sshpass -e ssh -o StrictHostKeyChecking=no $HostStr "chmod +x ${Dir}/install_cron.sh && ${Dir}/install_cron.sh"
    } else {
        ssh -o StrictHostKeyChecking=no $HostStr "chmod +x ${Dir}/install_cron.sh && ${Dir}/install_cron.sh"
    }

    Write-Host "  Deployment to $Name complete!" -ForegroundColor Green
}

# Deploy to Raspberry Pi
Deploy-Target -Name "Raspberry Pi" -HostStr "dietpi@192.168.1.97" -Dir "/home/dietpi/ct-LAND" -Password $RPI_PASSWORD -IP "192.168.1.97"

# Deploy to Netbook
Deploy-Target -Name "Netbook" -HostStr "owner@192.168.1.230" -Dir "/home/owner/ct-LAND" -Password $NETBOOK_PASSWORD -IP "192.168.1.230"

Write-Host "`nDone!" -ForegroundColor Green
