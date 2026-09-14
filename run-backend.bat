@echo off
setlocal EnableExtensions
set "PROJECT_ROOT=%~dp0"

if not defined JAVA_HOME (
  for /f "delims=" %%J in ('dir /b /ad "%ProgramFiles%\Eclipse Adoptium\jdk-17*" 2^>nul') do (
    set "JAVA_HOME=%ProgramFiles%\Eclipse Adoptium\%%J"
    goto java_found
  )
)
:java_found
if not exist "%JAVA_HOME%\bin\java.exe" (
  echo [ERROR] Java 17 is required. Install Eclipse Temurin 17, then run this file again.
  pause
  exit /b 1
)

set "MAVEN_CMD="
for /f "delims=" %%M in ('where mvn.cmd 2^>nul') do (
  set "MAVEN_CMD=%%M"
  goto maven_found
)
for /f "delims=" %%M in ('dir /b /s "%ProgramFiles%\JetBrains\mvn.cmd" 2^>nul') do (
  set "MAVEN_CMD=%%M"
  goto maven_found
)
:maven_found
if not defined MAVEN_CMD (
  echo [ERROR] Maven was not found. Install Apache Maven and add it to PATH.
  pause
  exit /b 1
)

if exist "%PROJECT_ROOT%.env" (
  for /f "usebackq eol=# tokens=1,* delims==" %%A in ("%PROJECT_ROOT%.env") do if not "%%A"=="" set "%%A=%%B"
)

echo Starting CareerForge API at http://localhost:4000/api
call "%MAVEN_CMD%" -f "%PROJECT_ROOT%pom.xml" spring-boot:run
echo.
echo The CareerForge API stopped. Review the message above.
pause
