@echo off
echo ====================================
echo Tactical Ops Kanban - Network Server
echo ====================================
echo.

REM Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%

echo Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo Building production version...
call npm run build
if errorlevel 1 (
    echo ERROR: Failed to build!
    pause
    exit /b 1
)

echo.
echo ====================================
echo Server Configuration
echo ====================================
echo.
echo Your network IP: %IP%
echo Server will run on: http://%IP%:3000
echo.
echo IMPORTANT: Configure firewall to allow port 3000
echo.
echo To allow firewall on Windows, run as Administrator:
echo netsh advfirewall firewall add rule name="Kanban Server" dir=in action=allow protocol=TCP localport=3000
echo.
pause

echo.
echo Starting server...
echo Keep this window open to keep the server running
echo.
call npm start -- -p 3000 -H 0.0.0.0

pause
