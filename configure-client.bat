@echo off
setlocal enabledelayedexpansion

echo ====================================
echo Configure MCP Client
echo ====================================
echo.

set /p SERVER_IP="Enter server IP address [192.168.0.22]: "

if "%SERVER_IP%"=="" set SERVER_IP=192.168.0.22

REM Get current directory
set "PROJECT_DIR=%~dp0"
set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

set "CONFIG_FILE=%APPDATA%\Claude\claude_desktop_config.json"
set "CONFIG_DIR=%APPDATA%\Claude"

REM Create directory if it doesn't exist
if not exist "%CONFIG_DIR%" (
    echo Creating Claude config directory...
    mkdir "%CONFIG_DIR%"
)

echo.
echo ====================================
echo Configuration
echo ====================================
echo.
echo Config file: %CONFIG_FILE%
echo Server: http://%SERVER_IP%:3000
echo.

REM Check if config file exists
if exist "%CONFIG_FILE%" (
    echo WARNING: Config file already exists!
    echo.
    type "%CONFIG_FILE%"
    echo.
    set /p OVERWRITE="Do you want to REPLACE the config? (y/n): "
    if /i not "!OVERWRITE!"=="y" (
        echo.
        echo Cancelled. Please manually add this to your config:
        goto :show_config
    )
)

REM Write config file
(
echo {
echo   "mcpServers": {
echo     "tactical-ops-kanban": {
echo       "command": "node",
echo       "args": ["%PROJECT_DIR%\\mcp-server.js"],
echo       "env": {
echo         "MCP_API_HOST": "http://%SERVER_IP%:3000"
echo       }
echo     }
echo   }
echo }
) > "%CONFIG_FILE%"

echo.
echo ✅ Configuration saved successfully!
echo.
goto :end

:show_config
echo.
echo Add this configuration to %CONFIG_FILE%:
echo.
echo {
echo   "mcpServers": {
echo     "tactical-ops-kanban": {
echo       "command": "node",
echo       "args": ["%PROJECT_DIR%\\mcp-server.js"],
echo       "env": {
echo         "MCP_API_HOST": "http://%SERVER_IP%:3000"
echo       }
echo     }
echo   }
echo }
echo.

:end
echo ====================================
echo NEXT STEPS:
echo ====================================
echo 1. Restart Claude Desktop completely
echo 2. Test by asking: "Liste as tarefas do kanban"
echo.
pause
