#!/bin/bash
# Auto-Update Script for Left-List Modules

LOG_FILE="$HOME/auto_update.log"
echo "--- Auto-Update Started: $(date) ---" >> $LOG_FILE

# List of modules to sync
MODULES=("__auto-dash" "_ct-MATRIX" "_ctos-beta" "_ct-LAND")

for mod in "${MODULES[@]}"; do
    MOD_DIR="$HOME/$mod"
    # ctos-beta was previously copied to ~/ctos-beta, not _ctos-beta. Let's check both
    if [ ! -d "$MOD_DIR" ]; then
        if [ "$mod" == "_ctos-beta" ] && [ -d "$HOME/ctos-beta" ]; then
            MOD_DIR="$HOME/ctos-beta"
        else
            continue
        fi
    fi

    echo "Checking $mod at $MOD_DIR" >> $LOG_FILE
    cd "$MOD_DIR" || continue

    # Check if it's a git repo
    if [ -d ".git" ]; then
        git fetch origin >> $LOG_FILE 2>&1
        LOCAL=$(git rev-parse HEAD)
        REMOTE=$(git rev-parse @{u})

        if [ $LOCAL != $REMOTE ]; then
            echo "Changes detected in $mod. Pulling and deploying..." >> $LOG_FILE
            git pull origin main >> $LOG_FILE 2>&1

            # specific redeploy logic per module
            if [[ "$mod" == *"ctos-beta"* ]]; then
                # Assuming node/npm is available
                if [ -f "package.json" ]; then
                    npm install >> $LOG_FILE 2>&1
                    npm run build >> $LOG_FILE 2>&1
                fi
                echo "SUDO_PASSWORD" | sudo -S systemctl restart ctos >> $LOG_FILE 2>&1
            fi
        else
            echo "No changes for $mod." >> $LOG_FILE
        fi
    else
        echo "$mod is not a git repository on this device. Skipping git pull." >> $LOG_FILE
    fi
done

echo "--- Auto-Update Finished: $(date) ---" >> $LOG_FILE
