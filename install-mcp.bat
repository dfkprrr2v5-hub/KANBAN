@echo off
echo ================================
echo Tactical Ops Kanban MCP Installer
echo ================================
echo.

REM Get current directory
set "PROJECT_DIR=%~dp0"
set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

echo Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo Starting Next.js dev server...
echo This will keep running. Press Ctrl+C to stop when done testing.
echo.
start "Tactical Ops Kanban Server" cmd /k "npm run dev"

echo.
echo ================================
echo Configuration for Claude Desktop:
echo ================================
echo.
echo Add this to: %%APPDATA%%\Claude\claude_desktop_config.json
echo.
echo {
echo   "mcpServers": {
echo     "tactical-ops-kanban": {
echo       "command": "node",
echo       "args": ["%PROJECT_DIR%\\mcp-server.js"]
echo     }
echo   }
echo }
echo.
echo ================================
echo.
echo NEXT STEPS:
echo 1. Copy the config above to claude_desktop_config.json
echo 2. Restart Claude Desktop
echo 3. Test by asking Claude: "Liste todas as tarefas do kanban"
echo.
pause
