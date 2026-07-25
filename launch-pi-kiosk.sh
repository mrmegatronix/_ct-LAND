#!/bin/bash
# Auto-launch Chromium in Fullscreen Kiosk Mode for Raspberry Pi

# Disable screen saver / sleep mode
xset s off || true
xset -dpms || true
xset s noblank || true

# Hide mouse cursor if unclutter is installed
if command -v unclutter &> /dev/null; then
  unclutter -idle 0.1 -root &
fi

# Clean up chromium crash/restore bubbles
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' ~/.config/chromium/Default/Preferences || true
sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/' ~/.config/chromium/Default/Preferences || true

# Launch Chromium in kiosk mode pointing to the Hub Landing Page
chromium-browser --kiosk --noerrdialogs --disable-infobars --disable-translate --no-first-run --fast --fast-start --enable-features=OverlayScrollbar file:///run/media/zeus/6TB-1/__GITHUB%20NUC/_ct-LAND/index.html
