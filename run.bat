@echo off
echo Starting AgriMitra Climate Services...

echo Starting Inference Service on port 8001...
start "Inference Service" cmd /k "cd /d %~dp0services\inference && .venv\Scripts\activate.bat && python -m uvicorn app.main:app --port 8001 --reload"

echo Starting API Service on port 8000...
start "API Service" cmd /k "cd /d %~dp0services\api && .venv\Scripts\activate.bat && python -m uvicorn app.main:app --port 8000 --reload"

echo Starting Web App on port 3000...
start "Web App" cmd /k "cd /d %~dp0services\apps\web 2>nul || cd /d %~dp0apps\web && npm run dev"

echo ----------------------------------------------------
echo Services started in separate terminal windows:
echo  - Web App:   http://localhost:3000
echo  - API:       http://localhost:8000
echo  - Inference: http://localhost:8001
echo ----------------------------------------------------
