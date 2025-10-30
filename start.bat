@echo off
echo ========================================
echo   Project Catalyst - MongoDB Setup
echo ========================================
echo.

REM Check if MongoDB is running
echo [1/4] Checking MongoDB connection...
curl -s http://localhost:27017 >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] MongoDB is not running!
    echo Please start MongoDB first:
    echo   - Run: mongod
    echo   - Or: net start MongoDB
    echo.
    pause
    exit /b 1
)
echo [OK] MongoDB is running
echo.
+
REM Check if node_modules exists
if not exist "node_modules" (
    echo [2/4] Installing dependencies...
    call npm install
    echo.
) else (
    echo [2/4] Dependencies already installed
    echo.
)

REM Initialize database
echo [3/4] Initializing database...
call npm run db:init
echo.

REM Start the application
echo [4/4] Starting application...
echo.
echo Frontend: http://localhost:8080
echo Backend:  http://localhost:3001
echo.
echo Press Ctrl+C to stop all servers
echo ========================================
echo.

call npm run dev:all
