#!/bin/bash

# Simple MediAssist AI Management Script

case "$1" in
    start)
        echo "🏥 Starting MediAssist AI..."
        
        # Start backend
        echo "🚀 Starting backend..."
        cd "Mediassist backend"
        python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000 > ../backend.log 2>&1 &
        echo $! > ../backend.pid
        
        # Start frontend
        echo "🎨 Starting frontend..."
        cd "../frontend-simple"
        python -m http.server 3000 --bind 127.0.0.1 > ../frontend.log 2>&1 &
        echo $! > ../frontend.pid
        
        echo "✅ Services started!"
        echo "   Backend:  http://localhost:8000"
        echo "   Frontend: http://localhost:3000"
        ;;
        
    stop)
        echo "🛑 Stopping MediAssist AI..."
        
        if [ -f backend.pid ]; then
            kill $(cat backend.pid) 2>/dev/null
            rm backend.pid
            echo "✅ Backend stopped"
        fi
        
        if [ -f frontend.pid ]; then
            kill $(cat frontend.pid) 2>/dev/null
            rm frontend.pid
            echo "✅ Frontend stopped"
        fi
        ;;
        
    status)
        echo "📊 MediAssist AI Status:"
        
        if [ -f backend.pid ] && kill -0 $(cat backend.pid) 2>/dev/null; then
            echo "   Backend:  ✅ Running (PID: $(cat backend.pid))"
        else
            echo "   Backend:  ❌ Not running"
        fi
        
        if [ -f frontend.pid ] && kill -0 $(cat frontend.pid) 2>/dev/null; then
            echo "   Frontend: ✅ Running (PID: $(cat frontend.pid))"
        else
            echo "   Frontend: ❌ Not running"
        fi
        ;;
        
    restart)
        $0 stop
        sleep 2
        $0 start
        ;;
        
    logs)
        echo "📋 Viewing logs..."
        if [ -f backend.log ]; then
            echo "Backend logs:"
            tail -f backend.log &
        fi
        if [ -f frontend.log ]; then
            echo "Frontend logs:"
            tail -f frontend.log &
        fi
        wait
        ;;
        
    *)
        echo "Usage: $0 {start|stop|status|restart|logs}"
        echo ""
        echo "Commands:"
        echo "  start   - Start both backend and frontend servers"
        echo "  stop    - Stop both servers"
        echo "  status  - Show server status"
        echo "  restart - Restart both servers"
        echo "  logs    - View server logs"
        exit 1
        ;;
esac