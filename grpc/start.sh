#!/bin/bash

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Function to cleanup processes on exit
cleanup() {
    echo -e "\n${RED}Shutting down servers...${NC}"
    # Kill all child processes
    pkill -P $$
    exit 0
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

# Print starting message
echo -e "${GREEN}Starting Calculator Services...${NC}"

# Start gRPC server in background
npm start &

# Wait for gRPC server to start
sleep 2

# Start HTTP server in background
npm run http &

# Print success message
echo -e "${GREEN}Both servers are running!${NC}"
echo -e "${CYAN}gRPC server running on port 50051${NC}"
echo -e "${MAGENTA}HTTP server running on port 3000${NC}"
echo -e "\nAvailable endpoints:"
echo -e "${MAGENTA}  GET  /health         - Check server health${NC}"
echo -e "${MAGENTA}  GET  /add?a=5&b=3    - Add two numbers using query parameters${NC}"
echo -e "${MAGENTA}  POST /add            - Add two numbers using JSON body${NC}"
echo -e "\n${GREEN}Press Ctrl+C to stop all servers${NC}"

# Wait for both processes
wait

