@echo off
REM MediAssist AI Startup Script for Windows

echo 🏥 Starting MediAssist AI System...

REM Set environment variables (update with your actual OpenAI API key)
echo 📝 Setting up environment...
echo ⚠️  Please ensure you have set your OPENAI_API_KEY in the .env file

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd "Mediassist backend"
pip install fastapi uvicorn python-multipart sqlalchemy pydantic pillow pytesseract openai python-dotenv gtts python-jose passlib

REM Start backend server
echo 🚀 Starting backend server on http://localhost:8000...
start /b python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000

REM Wait for backend to start
timeout /t 5 /nobreak > nul

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd "..\mediassist-ai"
npm install

REM Start frontend development server
echo 🎨 Starting frontend on http://localhost:3000...
start /b npm run dev

echo ✅ MediAssist AI is now running!
echo    Backend:  http://localhost:8000
echo    Frontend: http://localhost:3000
echo    API Docs: http://localhost:8000/docs
echo.
echo 💡 To stop the servers, close this window or press Ctrl+C

pause