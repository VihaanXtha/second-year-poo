@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo    Circuit Bazaar - starting all 5 services
echo ============================================
echo    Frontend : http://localhost:3000
echo    Admin    : http://localhost:3001
echo    Vendor   : http://localhost:3002
echo    Shop     : http://localhost:3003
echo    Backend  : http://localhost:8000/api
echo ============================================
echo.

start "Backend  :8000" /D "%~dp0backend"  cmd /k "php artisan serve --host=0.0.0.0 --port=8000"
start "Frontend :3000" /D "%~dp0frontend" cmd /k "npm run dev"
start "Admin    :3001" /D "%~dp0admin"    cmd /k "npm run dev"
start "Vendor   :3002" /D "%~dp0vendor"   cmd /k "npm run dev"
start "Shop     :3003" /D "%~dp0shop"     cmd /k "npm run dev"

echo All 5 services launched in separate windows. Close a window to stop that service.
pause
