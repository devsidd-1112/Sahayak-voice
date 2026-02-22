@echo off
REM Seed Database Script for Sahayak Voice Backend (Windows)
REM This script runs the DatabaseSeeder utility to populate MongoDB with test data

echo 🌱 Starting database seeding...
echo.

REM Check if Maven is installed
where mvn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Maven is not installed or not in PATH
    echo Please install Maven and try again
    exit /b 1
)

REM Navigate to backend directory
cd /d "%~dp0\.."

echo 📦 Building the application...
call mvn clean compile -q

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed. Please check for compilation errors.
    exit /b 1
)

echo 🚀 Running database seeder...
echo.

REM Run the DatabaseSeeder class
call mvn spring-boot:run -Dspring-boot.run.main-class=com.sahayak.voice.util.DatabaseSeeder -q

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Database seeding completed successfully!
) else (
    echo.
    echo ❌ Database seeding failed. Please check the logs above.
    exit /b 1
)
