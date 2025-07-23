#!/bin/bash
#
# Publish all @smbc packages to local Verdaccio registry
#

set -e

REGISTRY_URL="http://localhost:4873"
ROOT_DIR="$(pwd)"

echo "📦 Publishing all @smbc packages to local registry..."

# Check if registry is accessible
if ! curl -s "$REGISTRY_URL" > /dev/null; then
    echo "❌ Error: Local registry at $REGISTRY_URL is not accessible"
    echo "   Start it first with: npm run registry:start"
    exit 1
fi

# Ensure we're using the local registry for @smbc packages
echo "🔄 Configuring local registry..."
./scripts/verdaccio/use-local.sh

# Check if we're authenticated
echo "🔑 Checking authentication..."
if ! npm whoami --registry="$REGISTRY_URL" > /dev/null 2>&1; then
    echo "⚠️  Not authenticated. Please run: npm adduser --registry=$REGISTRY_URL"
    echo "   Use any username/password/email - it's just for local development"
    exit 1
fi

# Build all packages first
echo "🏗️  Building all packages..."
npm run build

# Function to publish a package
publish_package() {
    local package_dir="$1"
    local package_name=$(node -p "require('$ROOT_DIR/$package_dir/package.json').name")
    
    if [[ $package_name == @smbc/* ]]; then
        echo "📦 Publishing $package_name..."
        cd "$ROOT_DIR/$package_dir"
        
        # Check if package.json has the correct publishConfig
        if ! grep -q '"registry"' package.json 2>/dev/null; then
            echo "   📝 Adding publishConfig to package.json..."
            # Add publishConfig to package.json if it doesn't exist
            node -e "
                const fs = require('fs');
                const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
                pkg.publishConfig = { registry: '$REGISTRY_URL' };
                fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
            "
        fi
        
        # Publish to local registry
        npm publish --registry="$REGISTRY_URL" || echo "   ⚠️  $package_name may already be published"
        cd "$ROOT_DIR" > /dev/null
    fi
}

# Find and publish all @smbc packages
echo "🔍 Finding @smbc packages to publish..."

# Publish packages in dependency order
for dir in packages/* applets/*/api applets/*/mui; do
    if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
        publish_package "$dir"
    fi
done

echo ""
echo "✅ Finished publishing packages to local registry"
echo "🌐 View published packages at: $REGISTRY_URL/-/web/detail/@smbc"
echo ""
echo "💡 Test installation from any directory with:"
echo "   cd /tmp && npm install @smbc/applet-core"