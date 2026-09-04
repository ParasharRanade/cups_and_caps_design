#!/bin/bash
# Move to the script's directory
cd "$(dirname "$0")"

echo "=========================================================="
echo "  Cups & Caps Design - Portable Light Theme Web Server    "
echo "=========================================================="
echo "Starting local web server on http://localhost:8001..."

if command -v xdg-open > /dev/null; then
  xdg-open "http://localhost:8001" &
elif command -v sensible-browser > /dev/null; then
  sensible-browser "http://localhost:8001" &
fi

python3 -m http.server 8001
