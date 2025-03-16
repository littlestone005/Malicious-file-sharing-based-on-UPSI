#!/bin/bash

# Function to display help
show_help() {
    echo "Usage: ./run.sh [options]"
    echo "Options:"
    echo "  -h, --help       Show this help message"
    echo "  -f, --frontend   Start the frontend development server"
    echo "  -b, --backend    Start the backend services"
    echo "  -a, --all        Start both frontend and backend"
    echo "  -s, --stop       Stop all services"
    echo "  -c, --clean      Clean up build artifacts"
}

# Function to start the frontend
start_frontend() {
    echo "Starting frontend development server..."
    cd frontend && npm install && npm run dev
}

# Function to start the backend
start_backend() {
    echo "Starting backend services..."
    cd backend && docker-compose up -d
    echo "Backend services started. API available at http://localhost:8000"
}

# Function to stop all services
stop_services() {
    echo "Stopping backend services..."
    cd backend && docker-compose down
    echo "Stopping frontend development server..."
    pkill -f "vite"
    echo "All services stopped."
}

# Function to clean up build artifacts
clean_artifacts() {
    echo "Cleaning up build artifacts..."
    rm -rf frontend/node_modules
    rm -rf frontend/dist
    rm -rf algorithm/build
    echo "Cleanup complete."
}

# Parse command line arguments
if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

while [ $# -gt 0 ]; do
    case "$1" in
        -h|--help)
            show_help
            exit 0
            ;;
        -f|--frontend)
            start_frontend
            shift
            ;;
        -b|--backend)
            start_backend
            shift
            ;;
        -a|--all)
            start_backend
            start_frontend
            shift
            ;;
        -s|--stop)
            stop_services
            shift
            ;;
        -c|--clean)
            clean_artifacts
            shift
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done 