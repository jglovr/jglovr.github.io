@echo off
title JGLOVR-OS Floppy Disk Kiosk Launcher
color 0A
echo =======================================================
echo   JGLOVR-OS 3.5" FLOPPY DISK NATIVE KIOSK LAUNCHER
echo =======================================================
echo.
echo Searching for game file on Drive A:...

set GAME_FILE=

for %%f in ("%~dp0*.html" "%~dp0*.htm") do (
    set GAME_FILE="%%f"
)

if "%GAME_FILE%"=="" (
    echo ERROR: No .HTML game file found on floppy disk!
    pause
    exit /b
)

echo Found Game: %GAME_FILE%

:: Locate Chrome or Edge on Windows
set BROWSER=

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    set BROWSER="%ProgramFiles%\Google\Chrome\Application\chrome.exe"
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    set BROWSER="%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
) else if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    set BROWSER="%LocalAppData%\Google\Chrome\Application\chrome.exe"
) else if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    set BROWSER="%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
) else if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    set BROWSER="%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
)

if defined BROWSER (
    echo Launching borderless standalone kiosk window...
    start "" %BROWSER% --app="file:///%GAME_FILE:~1,-1%" --kiosk --user-data-dir="%TEMP%\jglovr_floppy_profile"
) else (
    echo Launching in system default browser...
    start "" %GAME_FILE%
)
