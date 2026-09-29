@echo off
setlocal

cd /d "%~dp0"

echo ============================================================
echo  Circuit Bazaar - Starting All Services
echo ============================================================
echo.
echo  Frontend    : http://localhost:3000
echo  Shop        : http://localhost:3003
echo  Admin       : http://localhost:3001
echo  Vendor      : http://localhost:3002
echo  Backend API : http://localhost:8000
echo.
echo  Database    : SQLite (backend\database\database.sqlite)
echo  File Storage: Local (backend\storage\app\public\)
echo  Admin Login : admin@circuitbazaar.com / admin123
echo ============================================================
echo.

REM Start Backend (Laravel API + SQLite)
start "Backend API [port 8000]" cmd /k "cd /d backend && php artisan serve --host=0.0.0.0 --port=8000"

REM Start Frontend (Next.js)
start "Frontend [port 3000]" cmd /k "cd /d frontend && npm run dev"

REM Start Shop (Next.js)
start "Shop [port 3003]" cmd /k "cd /d shop && npm run dev"

REM Start Admin (Vite SPA)
start "Admin [port 3001]" cmd /k "cd /d admin && npm run dev"

REM Start Vendor (Vite SPA)
start "Vendor [port 3002]" cmd /k "cd /d vendor && npm run dev"

echo All 5 services are starting in separate windows...
echo Close each window to stop that service individually.
echo.
echo Press any key to exit this window (services keep running).
pause >nul