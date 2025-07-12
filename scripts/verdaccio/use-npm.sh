#!/bin/bash
#
# Switch npm back to use npmjs.org registry for @smbc packages
#

set -e

echo "🔄 Switching back to npmjs.org for @smbc packages..."

# Remove scoped registry configuration for @smbc packages
npm config delete @smbc:registry

echo "✅ Successfully switched back to npmjs.org"
echo "📍 Registry URL: https://registry.npmjs.org/"
echo ""
echo "Current npm configuration (should show nothing for @smbc):"
npm config get @smbc:registry || echo "(no custom @smbc registry configured - using npmjs.org)"