@echo off
echo ============================================================
echo  Circuit Bazaar - Stopping All Services
echo ============================================================
echo.

REM Stop Backend (Laravel on port 8000)
taskkill /F /FI "WINDOWTITLE eq Backend API*" 2>NUL
for /F "tokens=4" %%P in ('netstat -a -n -o ^| findstr :8000') do (
    taskkill /F /PID %%P 2>NUL
)

REM Stop Frontend (Next.js on port 3000)
for /F "tokens=4" %%P in ('netstat -a -n -o ^| findstr :3000') do (
    taskkill /F /PID %%P 2>NUL
)

REM Stop Shop (Next.js on port 3003)
for /F "tokens=4" %%P in ('netstat -a -n -o ^| findstr :3003') do (
    taskkill /F /PID %%P 2>NUL
)

REM Stop Admin (Vite on port 3001)
for /F "tokens=4" %%P in ('netstat -a -n -o ^| findstr :3001') do (
    taskkill /F /PID %%P 2>NUL
)

REM Stop Vendor (Vite on port 3002)
for /F "tokens=4" %%P in ('netstat -a -n -o ^| findstr :3002') do (
    taskkill /F /PID %%P 2>NUL
)

echo All services stopped.
echo.