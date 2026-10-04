@echo off
title UK Landlord Licensing Hub (Local Server)
cd /d "%~dp0"
echo ========================================================
echo   Launching UK Landlord Licensing & Compliance Hub
echo   Local Address: http://localhost:8080
echo ========================================================
echo.
start "" http://localhost:8080
python -m http.server 8080
pause
