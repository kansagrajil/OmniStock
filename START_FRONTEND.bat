@echo off
title StockOmni Frontend
cls
echo Starting StockOmni Frontend on Port 5001 (Root Flow)...
echo.

:: Kill existing process on port 5001
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5001 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

echo Opening browser at http://localhost:5001...
echo.
start http://localhost:5001

python -m http.server 5001
pause
