#!/bin/bash
#
# Add publishConfig to all @smbc packages for easier local publishing
#

set -e

REGISTRY_URL="http://localhost:4873"

echo "📝 Adding publishConfig to @smbc packages..."

# Function to add publishConfig to a package.json
add_publish_config() {
    local package_json="$1"
    local package_name=$(node -e "import('$package_json', { assert: { type: 'json' } }).then(m => console.log(m.default.name || ''))" 2>/dev/null || grep '"name"' "$package_json" | cut -d'"' -f4)
    
    if [[ $package_name == @smbc/* ]]; then
        # Check if package is private
        local is_private=$(node -e "import('$package_json', { assert: { type: 'json' } }).then(m => console.log(m.default.private || false))" 2>/dev/null || grep '"private"' "$package_json" | cut -d':' -f2 | tr -d ' ,"')
        
        if [[ $is_private == "true" ]]; then
            echo "⏭️  Skipping $package_name (marked as private)"
            return
        fi
        
        echo "📦 Processing $package_name..."
        
        # Add or update publishConfig
        node -e "
            import fs from 'fs';
            const path = '$package_json';
            const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
            
            if (!pkg.publishConfig) {
                pkg.publishConfig = {};
            }
            
            // Set registry for local publishing
            pkg.publishConfig.registry = '$REGISTRY_URL';
            
            // Set access to public if not set
            if (!pkg.publishConfig.access) {
                pkg.publishConfig.access = 'public';
            }
            
            fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
            console.log('   ✅ Updated publishConfig');
        "
    fi
}

# Process all package.json files
for dir in packages/* applets/*/api applets/*/mui apps/*; do
    if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
        add_publish_config "$dir/package.json"
    fi
done

echo ""
echo "✅ Finished setting up packages for local publishing"
echo ""
echo "🚀 Next steps:"
echo "   1. Start the registry: npm run registry:start"
echo "   2. Publish packages: npm run registry:publish"
echo "   3. Switch to local registry: npm run registry:use-local"