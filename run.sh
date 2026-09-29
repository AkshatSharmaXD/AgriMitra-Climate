#!/bin/bash

echo "Starting AgriMitra Climate Services..."

kill_port() {
    PORT=$1
    echo "Checking port $PORT..."
    if command -v lsof >/dev/null 2>&1; then
        PID=$(lsof -ti :$PORT)
        if [ ! -z "$PID" ]; then
            echo "Port $PORT is in use by PID $PID. Killing it..."
            kill -9 $PID
        fi
    elif command -v netstat >/dev/null 2>&1; then
        # Windows Git Bash approach
        PID=$(netstat -ano | grep -E ":$PORT\b" | awk '{print $5}' | grep -v "0" | head -n 1)
        if [ ! -z "$PID" ]; then
            echo "Port $PORT is in use by PID $PID. Killing it..."
            taskkill //F //PID $PID >/dev/null 2>&1 || kill -9 $PID >/dev/null 2>&1
        fi
    else
        echo "Could not find 'lsof' or 'netstat' to automatically free ports."
    fi
}

# Free ports for the 3 services
kill_port 8000
kill_port 8001
kill_port 3000

echo "----------------------------------------"
echo "Starting Inference Service on port 8001..."
cd services/inference
# Support both Windows (Scripts) and Unix (bin) venv paths
source .venv/Scripts/activate 2>/dev/null || source .venv/bin/activate 2>/dev/null
python -m uvicorn app.main:app --port 8001 --reload &
INFERENCE_PID=$!
cd ../..

echo "----------------------------------------"
echo "Starting API Service on port 8000..."
cd services/api
source .venv/Scripts/activate 2>/dev/null || source .venv/bin/activate 2>/dev/null
python -m uvicorn app.main:app --port 8000 --reload &
API_PID=$!
cd ../..

echo "----------------------------------------"
echo "Starting Web App on port 3000..."
cd apps/web
npm run dev &
WEB_PID=$!
cd ../..

echo "----------------------------------------"
echo "All services have been started in the background:"
echo " - Web App:   http://localhost:3000"
echo " - API:       http://localhost:8000"
echo " - Inference: http://localhost:8001"
echo ""
echo "Press Ctrl+C to stop all services."

# Trap Ctrl+C to shut down all processes gracefully
cleanup() {
    echo ""
    echo "Stopping services..."
    kill $INFERENCE_PID 2>/dev/null
    kill $API_PID 2>/dev/null
    kill $WEB_PID 2>/dev/null
    
    # npm often spawns child processes that evade standard bash kill, 
    # so we'll enforce the port wipe on exit to be safe
    kill_port 8000
    kill_port 8001
    kill_port 3000
    echo "Shutdown complete."
    exit 0
}

trap cleanup INT TERM
wait
