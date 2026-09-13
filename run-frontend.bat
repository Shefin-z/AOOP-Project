@echo off
cd /d "%~dp0frontend"

echo Starting CareerForge frontend at http://localhost:5174
call npm.cmd run dev

echo.
echo The frontend stopped. Review the message above.
pause
