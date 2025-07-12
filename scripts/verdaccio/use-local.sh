#!/bin/bash
#
# Switch npm to use local Verdaccio registry for @smbc packages
#

set -e

REGISTRY_URL="http://localhost:4873"

echo "🔄 Switching to local registry for @smbc packages..."

# Set scoped registry for @smbc packages
npm config set @smbc:registry $REGISTRY_URL

# Check if registry is accessible
if curl -s "$REGISTRY_URL" > /dev/null; then
    echo "✅ Successfully configured @smbc packages to use local registry"
    echo "📍 Registry URL: $REGISTRY_URL"
    echo ""
    echo "Current npm configuration:"
    npm config get @smbc:registry
else
    echo "❌ Warning: Local registry at $REGISTRY_URL is not accessible"
    echo "   Make sure to start it with: npm run registry:start"
    exit 1
fi

echo ""
echo "💡 To test installation from another directory:"
echo "   cd /tmp && npm install @smbc/applet-core"