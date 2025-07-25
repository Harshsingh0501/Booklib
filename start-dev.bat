@echo off
echo 🚀 Starting Real-Time Book Management Application...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo 📦 Installing dependencies...
echo.

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

REM Install frontend dependencies
echo Installing frontend dependencies...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

cd ..

echo ✅ Dependencies installed successfully!
echo.
echo 🔧 Starting servers...
echo.

REM Start backend server in new window
echo 🖥️  Starting backend server on http://localhost:5000...
start "Backend Server" cmd /k "cd /d %CD%\backend && npm start"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server in new window
echo 🌐 Starting frontend server on http://localhost:3000...
start "Frontend Server" cmd /k "cd /d %CD%\frontend && npm start"

echo.
echo 🎉 Application is starting up!
echo.
echo 📋 Access URLs:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000
echo    API:      http://localhost:5000/api
echo.
echo 🔍 To test real-time features:
echo    1. Open http://localhost:3000 in multiple browser tabs
echo    2. Add/edit/delete books in one tab
echo    3. Watch changes appear instantly in other tabs
echo.
echo ⏹️  To stop servers: Close the command windows
echo.
pause