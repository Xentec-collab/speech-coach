@echo off
title SpeechCoach Developer Launcher
echo =======================================================
echo   Starting AI Public Speaking Coach Developer Services
echo =======================================================
echo.

:: 1. Launch backend in a new window
echo Starting FastAPI Backend...
start "FastAPI Backend" cmd /k "cd backend && .venv\Scripts\activate.bat && uvicorn app.main:app --reload"

:: 2. Launch frontend in a new window
echo Starting Next.js Frontend...
start "Next.js Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo =======================================================
echo   Services launched! Keep these windows open to work.
echo =======================================================
echo.
pause
