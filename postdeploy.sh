#!/bin/bash
# ==============================================================================
# Post-deployment script for fullstack.be (Vite App)
# This script runs on the remote server after files are rsynced.
# ==============================================================================

set -e # Exit immediately if a command exits with a non-zero status

# 1. Navigate to the script's directory (subsites/fullstack.be)
cd "$(dirname "$0")"
echo "Current working directory: $(pwd)"

echo "------------------------------------------------"
echo "Starting post-deployment steps..."
echo "------------------------------------------------"

# 2. Handle compiled Vite assets
# Vite builds the site into the 'dist/' folder. If the web server serves
# directly from 'subsites/fullstack.be/', we need the contents of 'dist/'
# to be located in the root of the serving directory.
if [ -d "dist" ]; then
  if [ -f "dist/index.html" ]; then
    echo "✓ Found compiled assets in 'dist/'. Promoting to root..."
    # Copy all compiled files to the root of the site
    cp -rp dist/* .
    echo "✓ Promotion complete."
  else
    echo "⚠️ Warning: 'dist/' directory exists but 'dist/index.html' is missing!"
  fi
else
  echo "⚠️ Warning: 'dist/' directory not found. Serving raw source files or server build skipped."
fi

# 3. Set standard web hosting permissions
# Ensure directories are accessible and files are readable by the web server
echo "Setting appropriate file permissions..."
find . -type d -exec chmod 755 {} +
find . -type f -exec chmod 644 {} +
# Make this script executable just in case
chmod +x "$0"
echo "✓ Permissions set successfully."

# 4. Perform Sanity Checks
echo "Running sanity checks..."
if [ -f "index.html" ]; then
  echo "✓ index.html is present in the root folder."
else
  echo "❌ Error: index.html is missing in the root folder!"
  exit 1
fi

if [ -d "assets" ]; then
  echo "✓ assets/ directory is present."
else
  echo "⚠️ Warning: assets/ directory not found in the root folder."
fi

echo "------------------------------------------------"
echo "🎉 Post-deployment completed successfully!"
echo "------------------------------------------------"
