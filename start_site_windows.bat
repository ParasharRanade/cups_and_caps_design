@echo off
title Cups & Caps Design - Portable Server
cd /d "%~dp0"

echo ==========================================================
echo   Cups ^& Caps Design - Portable Light Theme Web Server
echo ==========================================================
echo Starting local web server on http://localhost:8001...
echo Opening your default browser...
echo.

start "" "http://localhost:8001"
python -m http.server 8001
if %errorlevel% neq 0 (
    python3 -m http.server 8001
)
pause
