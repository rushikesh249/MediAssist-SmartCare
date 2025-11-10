#!/bin/bash

# MediAssist AI Startup Script for Bash
# This script is designed to work in Windows environments with Git Bash or WSL

echo "🏥 Starting MediAssist AI System..."

# Get the current directory
CURRENT_DIR=$(pwd)
echo "📁 Current directory: $CURRENT_DIR"

# Function to find Python executable
find_python() {
    if command -v python3 &> /dev/null; then
        echo "python3"
    elif command -v python &> /dev/null; then
        echo "python"
    elif [ -f "/c/Users/Pranav/anaconda3/python.exe" ]; then
        echo "/c/Users/Pranav/anaconda3/python.exe"
    else
        echo "python"
    fi
}

PYTHON_CMD=$(find_python)
echo "🐍 Using Python: $PYTHON_CMD"

# Navigate to backend directory and start backend server
echo "🚀 Starting backend server on http://localhost:8000..."
cd "Mediassist backend" || {
    echo "❌ Error: Cannot find 'Mediassist backend' directory"
    echo "📍 Current contents:"
    ls -la
    exit 1
}

$PYTHON_CMD -m uvicorn main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
echo "🔧 Backend PID: $BACKEND_PID"

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Navigate to frontend directory and start frontend server
echo "🎨 Starting frontend on http://localhost:3000..."
cd "../frontend-simple" || {
    echo "❌ Error: Cannot find 'frontend-simple' directory"
    cd ..
    echo "📍 Current contents:"
    ls -la
    exit 1
}

$PYTHON_CMD -m http.server 3000 --bind 127.0.0.1 &
FRONTEND_PID=$!
echo "🔧 Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ MediAssist AI is now running!"
echo "   🔙 Backend:  http://localhost:8000"
echo "   🎨 Frontend: http://localhost:3000"
echo "   📚 API Docs: http://localhost:8000/docs"
echo ""
echo "💡 To stop the servers, press Ctrl+C"
echo "🔧 Backend PID: $BACKEND_PID | Frontend PID: $FRONTEND_PID"

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend server stopped"
    fi
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend server stopped"
    fi
    echo "🏁 All servers stopped."
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait $BACKEND_PID
wait $FRONTEND_PID