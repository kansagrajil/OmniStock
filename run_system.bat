@echo off
title StockOmni System Launcher - Intelligent Inventory
setlocal enabledelayedexpansion

cls
echo ======================================================
echo           STOCKOMNI SYSTEM LAUNCHER
echo ======================================================
echo.

:: Kill existing processes on ports 5000 and 5001
echo [1/4] Cleaning ports (5000, 5001)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5001 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
timeout /t 2 /nobreak > nul

:: Check for MongoDB
echo [2/4] Checking MongoDB Status...
tasklist /fi "imagename eq mongod.exe" | find "mongod.exe" > nul
if %errorlevel% equ 0 (
    echo [OK] MongoDB is running.
) else (
    echo [!] WARNING: MongoDB is NOT running.
    echo Attempting to start MongoDB service...
    net start MongoDB >nul 2>&1
    if %errorlevel% neq 0 (
        echo [X] FAILED to start MongoDB service. Please start it manually.
        pause
    ) else (
        echo [OK] MongoDB started successfully.
    )
)

echo.
echo [3/4] Starting Backend Server (Port 5000)...
start "StockOmni Backend" cmd /c "cd backend && npm run dev"
timeout /t 3 /nobreak > nul

echo [4/4] Starting Frontend Server (Port 5001)...
:: Serving from frontend directory for cleaner URLs
start "StockOmni Frontend" cmd /c "python -m http.server 5001"
timeout /t 2 /nobreak > nul

echo.
echo ------------------------------------------------------
echo  SUCCESS: OmniStock is launching!
echo ------------------------------------------------------
echo.
echo  FRONTEND URL: http://localhost:5001
echo  BACKEND URL:  http://localhost:5000
echo.
echo  Note: If port 5001 still shows "WicketHub", please:
echo  1. Press Ctrl + F5 in your browser
echo  2. Or open http://localhost:5001 in Incognito Mode
echo ------------------------------------------------------
echo  Opening browser now...
start http://localhost:5001
echo.
echo  Press any key to close this launcher...
pause > nul
