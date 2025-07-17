#!/bin/bash
#
# Post-reset automation for Verdaccio local registry
# This script runs after registry reset to automate common tasks
#

set -e

REGISTRY_URL="http://localhost:4873"

echo "🔄 Post-reset automation starting..."

# Wait for registry to be ready
echo "⏳ Waiting for registry to be ready..."
max_attempts=30
attempt=0
while ! curl -s "$REGISTRY_URL" > /dev/null; do
    if [ $attempt -ge $max_attempts ]; then
        echo "❌ Registry didn't start within expected time"
        exit 1
    fi
    sleep 1
    ((attempt++))
done

echo "✅ Registry is ready!"

# Configure npm to use local registry
echo "🔧 Configuring npm for local registry..."
npm config set @smbc:registry "$REGISTRY_URL"

# Auto-authenticate with default credentials
echo "🔑 Authenticating with registry..."
echo "📝 Using default credentials (dev/dev/dev@example.com)"

# Use expect to automate the npm adduser process
if command -v expect > /dev/null; then
    expect << EOF
spawn npm adduser --registry $REGISTRY_URL
expect "Username:"
send "dev\r"
expect "Password:"
send "dev\r"
expect "Email:"
send "dev@example.com\r"
expect eof
EOF
else
    echo "⚠️  'expect' not found. Please manually run:"
    echo "   npm adduser --registry $REGISTRY_URL"
    echo "   Use: dev/dev/dev@example.com"
    echo ""
    echo "Then run: npm run registry:publish"
    exit 0
fi

# Build and publish packages
echo "📦 Building and publishing packages..."
npm run registry:publish

echo ""
echo "🎉 Post-reset automation completed!"
echo "🌐 Registry ready at: $REGISTRY_URL"
echo "📊 Web interface: $REGISTRY_URL/-/web/detail/@smbc"
echo ""
echo "💡 To install packages from another directory:"
echo "   npm run registry:use-local"
echo "   npm install @smbc/usage-stats-mui"