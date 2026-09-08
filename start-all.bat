@echo off
title Circuit Bazaar - Start All Services
echo ========================================
echo   Circuit Bazaar - Starting All Services
echo ========================================
echo.

cd /d "C:\1.D drive\second-year-poo\backend"
echo [1/5] Starting Backend API (port 8000)...
start "Backend API" cmd /c "php artisan serve --host=0.0.0.0 --port=8000"
timeout /t 3 /nobreak >nul

cd /d "C:\1.D drive\second-year-poo\frontend"
echo [2/5] Starting Frontend (port 3000)...
start "Frontend" cmd /c "npm run dev"
timeout /t 3 /nobreak >nul

cd /d "C:\1.D drive\second-year-poo\shop"
echo [3/5] Starting Shop (port 3003)...
start "Shop" cmd /c "npm run dev"
timeout /t 3 /nobreak >nul

cd /d "C:\1.D drive\second-year-poo\admin"
echo [4/5] Starting Admin (port 3001)...
start "Admin" cmd /c "npm run dev"
timeout /t 3 /nobreak >nul

cd /d "C:\1.D drive\second-year-poo\vendor"
echo [5/5] Starting Vendor (port 3002)...
start "Vendor" cmd /c "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   All services are starting...
echo ========================================
echo.
echo   Backend API : http://localhost:8000
echo   Frontend    : http://localhost:3000
echo   Shop        : http://localhost:3003
echo   Admin       : http://localhost:3001
echo   Vendor      : http://localhost:3002
echo.
echo   Press any key to exit this window...
pause >nul
