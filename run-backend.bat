@echo off
cd /d "%~dp0"
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot"

if exist ".env" (
  for /f "usebackq tokens=1,* delims==" %%A in (".env") do if not "%%A"=="" set "%%A=%%B"
)

echo Starting CareerForge Spring Boot API at http://localhost:4000/api
call "E:\9th semester\AOOP\project\Software Lab Project\backend\mvnw.cmd" -f "%~dp0pom.xml" spring-boot:run

echo.
echo The Spring Boot API stopped. Review the message above.
pause
