@echo off
:: Auto-launch Chrome in Fullscreen Kiosk Mode for Windows 10 Touch Kiosk
title Coasters Kiosk Launcher

:: Force close any existing chrome instances
taskkill /F /IM chrome.exe >nul 2>&1

:: Clean up chrome crash preferences
set "chrome_pref=%LOCALAPPDATA%\Google\Chrome\User Data\Default\Preferences"
if exist "%chrome_pref%" (
    powershell -Command "(Get-Content '%chrome_pref%') -replace '\"exit_type\":\"Crashed\"', '\"exit_type\":\"Normal\"' | Set-Content '%chrome_pref%'"
    powershell -Command "(Get-Content '%chrome_pref%') -replace '\"exited_cleanly\":false', '\"exited_cleanly\":true' | Set-Content '%chrome_pref%'"
)

:: Start Chrome in kiosk mode pointing to the Hub Landing Page (assuming D:\__GITHUB path on Windows kiosk)
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --noerrdialogs --disable-infobars --disable-translate --no-first-run --enable-features=OverlayScrollbar file:///D:/__GITHUB/_ct-LAND/index.html
