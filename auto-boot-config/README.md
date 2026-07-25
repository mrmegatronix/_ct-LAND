# Coasters Tavern - Kiosk Auto-Launch Setup

This directory contains instructions and resources to configure the Raspberry Pi and Windows 10 Touch Kiosks to launch the browser automatically in fullscreen/kiosk mode on boot.

---

## 🍓 Raspberry Pi (Linux) Kiosk Configuration

To make the Raspberry Pi automatically boot directly into the fullscreen Ecosystem Hub:

1.  **Make Launch Script Executable**:
    Ensure the launch script in the workspace root is executable:
    ```bash
    chmod +x "/run/media/zeus/6TB-1/__GITHUB NUC/_ct-LAND/launch-pi-kiosk.sh"
    ```

2.  **Configure Desktop Autostart**:
    *   Open the desktop autostart configuration file:
        ```bash
        nano ~/.config/lxsession/LXDE-pi/autostart
        ```
    *   Append the following line at the end of the file:
        ```text
        @/run/media/zeus/6TB-1/__GITHUB\ NUC/_ct-LAND/launch-pi-kiosk.sh
        ```
    *   Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

3.  **Ensure Auto-Login is Enabled**:
    *   Run `sudo raspi-config`
    *   Navigate to **System Options** -> **Boot / Auto Login**
    *   Select **Desktop Autologin** (Kiosk Mode requires desktop environment).

---

## 💻 Windows 10 Touch Kiosk Configuration

To configure the Windows 10 kiosk to boot directly into Chrome Kiosk Mode:

1.  **Open Startup Directory**:
    *   Press `Win + R` on the keyboard to open the Run dialog.
    *   Type `shell:startup` and press `Enter`. This opens the user's Startup folder.

2.  **Create Startup Shortcut**:
    *   Right-click inside the Startup folder and select **New** -> **Shortcut**.
    *   Browse to and select the batch file:
        `D:\__GITHUB\_ct-LAND\launch-win10-kiosk.bat` (or the corresponding letter of the drive on your Windows kiosk machine).
    *   Click **Next**, name the shortcut `Coasters Kiosk Launcher`, and click **Finish**.

3.  **Enable Windows Auto-Login**:
    *   Press `Win + R`, type `netplwiz`, and press `Enter`.
    *   Uncheck **"Users must enter a user name and password to use this computer"**.
    *   Click **Apply**, enter the kiosk profile username and password, and click **OK**.
