@echo off
setlocal EnableExtensions
set "PROJECT_ROOT=%~dp0"

where node >nul 2>nul || (
  echo [ERROR] Node.js is required. Install the current Node.js LTS version, then try again.
  pause
  exit /b 1
)
where npm.cmd >nul 2>nul || (
  echo [ERROR] npm was not found. Reinstall Node.js LTS, then try again.
  pause
  exit /b 1
)

if not exist "%PROJECT_ROOT%frontend\node_modules" (
  echo Installing frontend packages for the first run...
  call npm.cmd --prefix "%PROJECT_ROOT%frontend" install || exit /b 1
)

echo.
echo Starting CareerForge in two Command Prompt windows...
echo - API:      http://localhost:4000/api
echo - Frontend: http://localhost:5174
echo.
echo Keep MySQL running before starting the API.

netstat -ano | findstr ":4000" >nul && set "API_RUNNING=1"
netstat -ano | findstr ":5174" >nul && set "FRONTEND_RUNNING=1"

if defined API_RUNNING (
  echo API is already running on port 4000.
) else (
  start "CareerForge API" /D "%PROJECT_ROOT%" cmd /k call "%PROJECT_ROOT%run-backend.bat"
)

if defined FRONTEND_RUNNING (
  echo Frontend is already running on port 5174.
) else (
  start "CareerForge Frontend" /D "%PROJECT_ROOT%frontend" cmd /k npm.cmd run dev -- --host 127.0.0.1 --port 5174
)

echo Both startup windows have been opened. Visit http://localhost:5174
endlocal
