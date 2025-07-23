#!/bin/bash
#
# Start Verdaccio local registry
#

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VERDACCIO_DIR="$SCRIPT_DIR"

echo "🚀 Starting Verdaccio local registry..."
echo "📁 Working directory: $VERDACCIO_DIR"

# Check if we should reset the registry (--reset flag)
RESET_FLAG=false
if [ "$1" = "--reset" ]; then
    echo "🧹 Resetting registry storage..."
    rm -rf "$VERDACCIO_DIR/storage"
    rm -f "$VERDACCIO_DIR/htpasswd"
    rm -f "$VERDACCIO_DIR/.verdaccio-db.json"
    echo "✅ Registry storage cleared"
    RESET_FLAG=true
fi

# Create storage directory if it doesn't exist
mkdir -p "$VERDACCIO_DIR/storage"

# Create empty htpasswd file if it doesn't exist
if [ ! -f "$VERDACCIO_DIR/htpasswd" ]; then
    touch "$VERDACCIO_DIR/htpasswd"
    echo "📝 Created empty htpasswd file"
fi

# Start Verdaccio with our config
echo "🌐 Registry will be available at: http://localhost:4873"
echo "📊 Web interface at: http://localhost:4873/-/web/detail/@smbc"
echo ""
echo "To stop the registry, press Ctrl+C"
echo ""

cd "$VERDACCIO_DIR"

# If this is a reset, run postreset automation in background after starting
if [ "$RESET_FLAG" = true ]; then
    echo "🤖 Will run post-reset automation after registry starts..."
    npx verdaccio --config config.yaml &
    VERDACCIO_PID=$!
    
    # Give registry a moment to start, then run postreset script
    (sleep 3 && echo "🚀 Starting post-reset automation..." && bash "$VERDACCIO_DIR/postreset.sh") &
    
    # Wait for verdaccio to keep running
    wait $VERDACCIO_PID
else
    npx verdaccio --config config.yaml
fi