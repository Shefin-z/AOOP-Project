@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul || (
    echo [ERROR] Node.js is required. Install the current Node.js LTS version, then run this file again.
    pause
    exit /b 1
)
where npm.cmd >nul 2>nul || (
    echo [ERROR] npm was not found. Reinstall Node.js LTS, then run this file again.
    pause
    exit /b 1
)
if not exist "%~dp0frontend\node_modules" (
    echo Installing frontend packages for the first run...
    call npm.cmd --prefix "%~dp0frontend" install || exit /b 1
)

echo.
echo ===============================================
echo            Starting CareerForge
echo ===============================================

call :port_open 3306
if errorlevel 1 (
    set "MYSQLD_EXE="
    set "MYSQLD_CONFIG="
    if defined CAREERFORGE_MYSQLD if exist "%CAREERFORGE_MYSQLD%" set "MYSQLD_EXE=%CAREERFORGE_MYSQLD%"
    if not defined MYSQLD_EXE if exist "C:\xampp\mysql\bin\mysqld.exe" (
        set "MYSQLD_EXE=C:\xampp\mysql\bin\mysqld.exe"
        set "MYSQLD_CONFIG=--defaults-file=C:\xampp\mysql\bin\my.ini"
    )
    if defined MYSQLD_EXE (
        echo Starting local MySQL...
        start "CareerForge MySQL" /min "%MYSQLD_EXE%" %MYSQLD_CONFIG%
        timeout /t 4 /nobreak >nul
    ) else (
        rem Common standalone MySQL and MariaDB installers register a Windows service.
        for %%S in (MySQL80 MySQL MariaDB) do (
            sc query "%%S" >nul 2>nul && net start "%%S" >nul 2>nul
        )
        timeout /t 4 /nobreak >nul
    )
)

call :port_open 3306
if errorlevel 1 (
    echo.
    echo MySQL could not start on port 3306.
    echo Start MySQL from XAMPP / Windows Services, then run this file again.
    echo If mysqld.exe is in a custom location, run this once in PowerShell:
    echo   setx CAREERFORGE_MYSQLD "C:\path\to\mysqld.exe"
    echo Setup details: SETUP-RUN-BN.md
    pause
    exit /b 1
)

call :port_open 4000
if errorlevel 1 (
    echo Starting Spring Boot API...
    start "CareerForge API" cmd /k call "%~dp0run-backend.bat"
) else (
    echo Spring Boot API is already running.
)

call :wait_for_port 4000 30
if errorlevel 1 (
    echo.
    echo The backend did not start on port 4000.
    echo Read the CareerForge API window for the exact error, fix it, then run this file again.
    pause
    exit /b 1
)

call :port_open 5174
if errorlevel 1 (
    echo Starting React frontend...
    start "CareerForge Frontend" cmd /k call "%~dp0run-frontend.bat"
) else (
    echo React frontend is already running.
)

call :wait_for_port 5174 20
if errorlevel 1 (
    echo.
    echo The frontend did not start on port 5174.
    echo Read the CareerForge Frontend window for the exact error, fix it, then run this file again.
    pause
    exit /b 1
)

echo.
start "" "http://localhost:5174"
echo CareerForge has been opened in your browser.
echo Keep the API and Frontend windows open while using the project.
timeout /t 3 /nobreak >nul
exit /b 0

:port_open
powershell.exe -NoProfile -Command "if (Get-NetTCPConnection -LocalPort %~1 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
exit /b %errorlevel%

:wait_for_port
set /a PORT_WAIT_ATTEMPTS=%~2
:wait_for_port_loop
call :port_open %~1
if not errorlevel 1 exit /b 0
set /a PORT_WAIT_ATTEMPTS-=1
if %PORT_WAIT_ATTEMPTS% LEQ 0 exit /b 1
timeout /t 1 /nobreak >nul
goto wait_for_port_loop
