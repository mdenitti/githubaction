#!/bin/bash
# post-deploy.sh
# Production post-deployment script for Laravel applications.
#
# This script is executed on the production server after new files are copied.

# Exit immediately if a command exits with a non-zero status
set -e

# ANSI Color codes for prettier output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}==> Starting Laravel Post-Deployment Script...${NC}"

# Define the PHP executable. Can be overridden by setting the PHP_BIN environment variable.
PHP_BIN=${PHP_BIN:-"php"}

# Verify PHP is available
if ! command -v "$PHP_BIN" &> /dev/null; then
    echo -e "${RED}Error: PHP executable '$PHP_BIN' could not be found.${NC}"
    exit 1
fi

# Ensure we are in the correct directory (directory where the script is located)
cd "$(dirname "$0")"
echo -e "Working directory: $(pwd)"

# 1. Handle .env file configuration
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo -e "${YELLOW}Warning: .env file not found. Copying from .env.example...${NC}"
        cp .env.example .env
        echo -e "${YELLOW}Generating application key...${NC}"
        $PHP_BIN artisan key:generate --force
        echo -e "${RED}IMPORTANT: Please configure your database and other production environment variables in the newly created .env file.${NC}"
    else
        echo -e "${RED}Error: .env file is missing, and .env.example could not be found to initialize it.${NC}"
        echo -e "${RED}Please manually create/upload a .env file on the production server at: $(pwd)/.env${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ .env file exists.${NC}"
fi

# Function to ensure we always bring the application back up in case of failure
cleanup() {
    if [ "$?" -ne 0 ]; then
        echo -e "${RED}❌ Deployment failed! Attempting to bring the application back up...${NC}"
        $PHP_BIN artisan up || true
    fi
}
trap cleanup EXIT

# 2. Put application into maintenance mode
echo -e "${GREEN}==> Putting application into maintenance mode...${NC}"
$PHP_BIN artisan down --retry=60 || echo -e "${YELLOW}Warning: Could not put application down (might already be down or database config missing). Continuing...${NC}"

# 3. Create necessary storage folders and fix permissions
echo -e "${GREEN}==> Setting directory permissions...${NC}"
mkdir -p storage/framework/{sessions,views,cache}
mkdir -p storage/logs
mkdir -p bootstrap/cache

# Adjust permissions so web server can write to storage & bootstrap/cache
chmod -R 775 storage bootstrap/cache || echo -e "${YELLOW}Warning: Failed to set permissions (chmod 775). If you are on shared hosting, this might be normal.${NC}"

# 4. Run database migrations
echo -e "${GREEN}==> Running database migrations...${NC}"
$PHP_BIN artisan migrate --force

# 5. Run database seeders
# Note: Seeders in production should generally be idempotent or only run once.
# If you don't want to run seeders on every deployment, you can comment this line out.
echo -e "${GREEN}==> Running database seeders...${NC}"
$PHP_BIN artisan db:seed --force || echo -e "${YELLOW}Warning: Seeders failed. Check database logs if this was unexpected.${NC}"

# 6. Recreate cache files for optimization
echo -e "${GREEN}==> Optimizing application cache...${NC}"
$PHP_BIN artisan config:cache
$PHP_BIN artisan route:cache
$PHP_BIN artisan view:cache
$PHP_BIN artisan event:cache

# 7. Restart Queue Worker
# This gracefully restarts any running queue workers so they load the newly deployed code.
# Note: You should have a process monitor like Supervisor or systemd configured to automatically
# restart the workers when they exit.
echo -e "${GREEN}==> Restarting queue workers...${NC}"
$PHP_BIN artisan queue:restart

# 8. Reload PHP-FPM / OPcache (Optional)
# If you are using OPcache, you should reset it. If you have sudo/reload access, you can reload PHP-FPM.
# e.g., sudo service php8.4-fpm reload
# Since this varies wildly by server and environment, we leave it commented out for you to configure if needed.
# echo -e "${GREEN}==> Reloading PHP-FPM / OPcache...${NC}"
# sudo service php8.4-fpm reload || echo -e "${YELLOW}Could not reload PHP-FPM.${NC}"

# 9. Bring application back online
echo -e "${GREEN}==> Bringing application back online...${NC}"
$PHP_BIN artisan up

echo -e "${GREEN}==> ✓ Post-deployment completed successfully!${NC}"