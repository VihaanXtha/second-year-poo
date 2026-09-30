@echo off
setlocal
cd /d "%~dp0"

echo Stopping the Circuit Bazaar Docker stack (mysql, phpmyadmin, backend,
echo frontend, admin, vendor, shop)...
echo.

choice /c YN /m "Delete the MySQL volume too (wipes the circuit_bazaar database)"
if errorlevel 2 goto keep_data

echo Removing containers and the circuit_bazaar database...
docker compose down -v
goto done

:keep_data
echo Removing containers, keeping the circuit_bazaar database...
docker compose down

:done
echo.
echo Done. Next start: start-docker.bat
pause
