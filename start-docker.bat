@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo    Circuit Bazaar - Docker stack
echo ============================================
echo    Frontend    : http://localhost:3000
echo    Admin       : http://localhost:3001
echo    Vendor      : http://localhost:3002
echo    Shop        : http://localhost:3003
echo    Backend     : http://localhost:8000/api
echo    phpMyAdmin  : http://localhost:8081
echo    MySQL       : localhost:3307  (root / root, database circuit_bazaar)
echo ============================================
echo.
echo    Admin -^> Settings -^> "Open phpMyAdmin" goes to :8081
echo    First run builds 5 images, which takes a few minutes.
echo.
echo    Do not run start.bat at the same time - same ports.
echo    Ctrl+C stops the stack. Use stop-docker.bat afterwards.
echo.

docker info >nul 2>&1
if not errorlevel 1 goto engine_up

echo Docker Desktop is not running - starting it now...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
echo Waiting for the Docker engine (first start can take a minute)...
goto wait_engine

:wait_engine
timeout /t 5 /nobreak >nul
docker info >nul 2>&1
if errorlevel 1 goto wait_engine
echo Docker engine is up.

:engine_up
docker compose up --build

echo.
echo Stack stopped.
pause
