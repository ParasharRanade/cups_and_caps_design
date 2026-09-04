#!/bin/bash
# Move to the directory where this script is located (on the USB drive)
cd "$(dirname "$0")"

echo "=========================================================="
echo "  Cups & Caps Design - Portable Light Theme Web Server    "
echo "=========================================================="
echo "Starting local web server on http://localhost:8001..."
echo "Opening your default browser..."
echo ""

# Start Python HTTP server on port 8001 in background
python3 -m http.server 8001 &
SERVER_PID=$!

sleep 1

# Open default web browser to local server
open "http://localhost:8001"

# Wait for server process
wait $SERVER_PID
