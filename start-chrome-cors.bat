@echo off
REM Windows Batch file to start Chrome with CORS disabled
REM Double-click this file or run from Command Prompt

REM Create temp directory if it doesn't exist
if not exist "C:\temp\chrome_dev" mkdir "C:\temp\chrome_dev"

REM Try common Chrome locations
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir="C:\temp\chrome_dev"
    goto :end
)

if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir="C:\temp\chrome_dev"
    goto :end
)

echo Chrome not found in standard locations.
echo Please edit this file and add your Chrome path.
pause
:end

