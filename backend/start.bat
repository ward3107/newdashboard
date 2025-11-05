@echo off
echo ========================================
echo  ISHEBOT Optimization API
echo  Starting server...
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Virtual environment not found!
    echo Creating virtual environment...
    python -m venv venv
    echo.
    echo Installing dependencies...
    call venv\Scripts\activate
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate
)

echo.
echo Starting FastAPI server...
echo API will be available at: http://localhost:8000
echo Documentation at: http://localhost:8000/docs
echo.

python app/main.py

pause
