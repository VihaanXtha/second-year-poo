@echo off
setlocal
cd /d "%~dp0"

echo Stopping the Circuit Bazaar dev services started by start.bat
echo (frontend, admin, vendor, shop, backend)...
echo.

rem Ports used by start.bat: 3000 frontend, 3001 admin, 3002 vendor,
rem 3003 shop, 8000 backend, 8080 reverb.
rem The LISTENING filter matters: matching ":3000 " alone would also catch
rem browser connections TO port 3000, and killing those would close your browser.
for %%P in (3000 3001 3002 3003 8000 8080) do (
    for /f "tokens=5" %%I in ('netstat -ano ^| findstr /c:":%%P " ^| findstr /c:"LISTENING"') do (
        echo   port %%P - stopping PID %%I
        taskkill /F /PID %%I >nul 2>&1
    )
)

echo.
echo Done. Close any leftover console windows by hand if needed.
pause
