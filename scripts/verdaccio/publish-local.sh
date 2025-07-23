#!/bin/bash
#
# Publish all @smbc packages to local Verdaccio registry
#

set -e

REGISTRY_URL="http://localhost:4873"
# Get the monorepo root directory (two levels up from this script)
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
ROOT_DIR="$(realpath "$SCRIPT_DIR/../..")"

echo "📦 Publishing all @smbc packages to local registry..."
echo "📂 Monorepo root: $ROOT_DIR"

# Change to monorepo root
cd "$ROOT_DIR"

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
    echo "   Use: dev/dev/dev@example.com"
    exit 1
fi

# Build all packages first
echo "🏗️  Building all packages..."
npm run build

# Get all @smbc workspace packages from package-lock.json
get_workspace_packages() {
    local temp_script=$(mktemp)
    cat > "$temp_script" << 'EOF'
const fs = require('fs');
const lockfile = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));

// Get workspace packages that start with @smbc
const workspaces = lockfile.packages || {};
const smbcPackages = [];

for (const [path, pkg] of Object.entries(workspaces)) {
    if (path.startsWith('node_modules/') || path === '') continue;
    if (pkg.name && pkg.name.startsWith('@smbc/')) {
        smbcPackages.push({
            name: pkg.name,
            path: path
        });
    }
}

smbcPackages.forEach(p => console.log(`${p.path}:${p.name}`));
EOF
    
    node "$temp_script"
    rm "$temp_script"
}

# Function to publish a package
publish_package() {
    local package_path="$1"
    local package_name="$2"
    
    echo "📦 Publishing $package_name from $package_path..."
    cd "$ROOT_DIR/$package_path"
    
    # Check if package.json has the correct publishConfig
    if ! grep -q '"registry"' package.json 2>/dev/null; then
        echo "   📝 Adding publishConfig to package.json..."
        local temp_script=$(mktemp)
        cat > "$temp_script" << EOF
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.publishConfig = { registry: '$REGISTRY_URL' };
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
EOF
        node "$temp_script"
        rm "$temp_script"
    fi
    
    # Publish to local registry
    npm publish --registry="$REGISTRY_URL" || echo "   ⚠️  $package_name may already be published"
    cd "$ROOT_DIR" > /dev/null
}

# Find and publish all @smbc packages
echo "🔍 Reading @smbc packages from package-lock.json..."

# Get packages from lockfile and publish them
while IFS=':' read -r package_path package_name; do
    if [ -n "$package_path" ] && [ -n "$package_name" ]; then
        publish_package "$package_path" "$package_name"
    fi
done < <(get_workspace_packages)

echo ""
echo "✅ Finished publishing packages to local registry"
echo "🌐 View published packages at: $REGISTRY_URL/-/web/detail/@smbc"
echo ""
echo "💡 Test installation from any directory with:"
echo "   cd /tmp && npm install @smbc/applet-core"