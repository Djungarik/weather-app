#!/bin/bash
# Git Bash script to start Chrome with CORS disabled
# Run: bash start-chrome-cors.sh

# Create temp directory if it doesn't exist
mkdir -p /c/temp/chrome_dev

# Try to find Chrome in common locations
CHROME_PATHS=(
    "/c/Program Files/Google/Chrome/Application/chrome.exe"
    "/c/Program Files (x86)/Google/Chrome/Application/chrome.exe"
    "/c/Users/$USER/AppData/Local/Google/Chrome/Application/chrome.exe"
)

CHROME_FOUND=false

for path in "${CHROME_PATHS[@]}"; do
    if [ -f "$path" ]; then
        echo "Found Chrome at: $path"
        "$path" --disable-web-security --user-data-dir="C:/temp/chrome_dev" &
        CHROME_FOUND=true
        break
    fi
done

if [ "$CHROME_FOUND" = false ]; then
    echo "Chrome not found in standard locations."
    echo "Please find your Chrome installation and run:"
    echo '  "/path/to/chrome.exe" --disable-web-security --user-data-dir="C:/temp/chrome_dev"'
    echo ""
    echo "Or use Command Prompt instead of Git Bash:"
    echo '  chrome.exe --disable-web-security --user-data-dir="C:/temp/chrome_dev"'
fi

