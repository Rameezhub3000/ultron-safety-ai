@echo off
title ULTRON AI Launcher
echo ==============================================
echo    STARTING ULTRON AI FULL STACK SERVERS
echo ==============================================

echo [1/2] Launching Node.js Backend Server (Port 5000)...
start "ULTRON Backend (Port 5000)" cmd /k "cd /d %~dp0backend\backend && node server.js"

timeout /t 2 >nul

echo [2/2] Launching React Vite Frontend Server (Port 5173)...
start "ULTRON Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend\frontend && npm run dev"

echo.
echo ==============================================
echo  All servers active! Opening browser...
echo ==============================================
timeout /t 3 >nul
start http://localhost:5173/
