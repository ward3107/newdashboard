@echo off
echo ================================================
echo    ISHEBOT Analysis Engine - Backend Starter
echo ================================================
echo.

cd "C:\Users\Waseem\Downloads\ishebot-analysis-engine\ishebot-analysis-engine"

echo Checking for .env file...
if not exist ".env" (
    echo [ERROR] .env file not found!
    echo.
    echo Please create a .env file with your OpenAI API key:
    echo   OPENAI_API_KEY=sk-your-key-here
    echo   PORT=3000
    echo   MODEL_MAIN=gpt-4o-mini
    echo   MODEL_PREMIUM=gpt-4o
    echo.
    pause
    exit /b 1
)

echo [OK] .env file found
echo.
echo Starting ISHEBOT backend on port 3000...
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev
