#!/bin/bash

# Ensure auto_update.sh is executable
chmod +x ~/ct-LAND/auto_update.sh

# Install cron job
(crontab -l 2>/dev/null | grep -v "auto_update.sh"; echo "*/15 * * * * ~/ct-LAND/auto_update.sh") | crontab -

echo "Cron job installed to run ~/ct-LAND/auto_update.sh every 15 minutes."
