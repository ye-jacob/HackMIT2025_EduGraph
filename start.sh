#!/bin/bash

# Start both frontend and backend servers
echo "🚀 Starting Video Processing Pipeline..."
echo "📁 Frontend: http://localhost:8081"
echo "🔧 Backend: http://localhost:3001"
echo ""

# Kill any existing processes on these ports
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

# Start backend in background
echo "Starting backend server..."
cd backend && npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "Starting frontend server..."
cd .. && npm run dev &
FRONTEND_PID=$!

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

echo ""
echo "✅ Both servers are running!"
echo "📱 Open http://localhost:8081 in your browser"
echo "⏹️  Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait
