@echo off
taskkill /f /im node.exe >nul 2>&1
color 0b
echo ==============================================
echo       MediCare Hospital Management System
echo ==============================================
echo.
echo Starting Backend Server...
start "MediCare Backend Server" cmd /k "node server.js"

echo Waiting for Server to initialize...
timeout /t 3 /nobreak >nul

echo.
echo Opening Application in your Browser...
start http://localhost:3000

echo.
echo Setup Complete! Aap es window ko band kar sakte hain. 
echo (Note: Backend server ki dusri black window ko band mat karna varna website kaam nahi karegi)
echo.
pause
