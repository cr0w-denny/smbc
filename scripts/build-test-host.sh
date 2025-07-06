#!/bin/bash

# Test script to simulate external package installation
echo "🧪 Testing external package scenario..."

# Create temp directory outside monorepo
TEMP_DIR="/tmp/smbc-host-test"
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

echo "🏗️  Building packages first..."
cd /Users/developer/ws-cr0w/zzz
npm run build -w packages/applet-core
npm run build -w packages/mui-components  
npm run build -w packages/mui-applet-core
npm run build -w packages/react-query-dataview
npm run build -w packages/ui-core
npm run build -w packages/mui-applet-host
npm run build -w applets/hello/mui

echo "📦 Packing SMBC packages..."

# Pack all our packages and capture filenames
echo "  - Packing applet-core..."
cd packages/applet-core && CORE_FILE=$(npm pack --pack-destination $TEMP_DIR)

echo "  - Packing mui-applet-core..."
cd ../mui-applet-core && MUI_CORE_FILE=$(npm pack --pack-destination $TEMP_DIR)

echo "  - Packing mui-components..."
cd ../mui-components && MUI_COMP_FILE=$(npm pack --pack-destination $TEMP_DIR)

echo "  - Packing react-query-dataview..."
cd ../react-query-dataview && DATAVIEW_FILE=$(npm pack --pack-destination $TEMP_DIR)

echo "  - Packing ui-core..."
cd ../ui-core && UI_CORE_FILE=$(npm pack --pack-destination $TEMP_DIR)

echo "  - Packing mui-applet-host..."
cd ../mui-applet-host && HOST_FILE=$(npm pack --pack-destination $TEMP_DIR)

echo "  - Packing hello applet..."
cd ../../applets/hello/mui && HELLO_FILE=$(npm pack --pack-destination $TEMP_DIR)

echo "🏗️  Creating test host app..."
cd $TEMP_DIR

# Create package.json with real versions and local resolutions
cat > package.json << EOF
{
  "name": "test-host",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0", 
    "@mui/icons-material": "^7.1.2",
    "@mui/material": "^7.1.2",
    "@tanstack/react-query": "^5.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@smbc/applet-core": "file:$CORE_FILE",
    "@smbc/mui-applet-core": "file:$MUI_CORE_FILE",
    "@smbc/mui-components": "file:$MUI_COMP_FILE",
    "@smbc/react-query-dataview": "file:$DATAVIEW_FILE",
    "@smbc/ui-core": "file:$UI_CORE_FILE",
    "@smbc/mui-applet-host": "file:$HOST_FILE",
    "@smbc/hello-mui": "file:$HELLO_FILE"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.1.3"
  },
  "overrides": {
    "@smbc/applet-core": "file:$CORE_FILE",
    "@smbc/mui-applet-core": "file:$MUI_CORE_FILE", 
    "@smbc/mui-components": "file:$MUI_COMP_FILE",
    "@smbc/react-query-dataview": "file:$DATAVIEW_FILE",
    "@smbc/ui-core": "file:$UI_CORE_FILE",
    "@smbc/mui-applet-host": "file:$HOST_FILE",
    "@smbc/hello-mui": "file:$HELLO_FILE"
  }
}
EOF

# Install all dependencies (external + local packages)
echo "📥 Installing dependencies (external + local SMBC packages)..."
npm install

# Copy host source files
echo "📋 Copying host source files..."
mkdir -p src/components
cp -r /Users/developer/ws-cr0w/zzz/apps/host/src/* ./src/
cp /Users/developer/ws-cr0w/zzz/apps/host/index.html .
cp /Users/developer/ws-cr0w/zzz/apps/host/vite.config.ts .

# Create minimal tsconfig (no project references)
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"]
}
EOF

# Test the build to verify everything works
echo "🧪 Testing production build..."
cd $TEMP_DIR
if npm run build; then
  echo ""
  echo "✅ External package test successful!"
  echo "📍 Location: $TEMP_DIR"
  echo ""
  echo "🚀 To test additional scenarios:"
  echo "   cd $TEMP_DIR"
  echo "   npm run dev      # Test dev server"
  echo "   npm run preview  # Test built app"
else
  echo ""
  echo "❌ External package test failed - build errors detected"
  echo "📍 Location: $TEMP_DIR"
  echo ""
  echo "🔧 To debug:"
  echo "   cd $TEMP_DIR"
  echo "   npm run build    # See full build errors"
  echo "   npm ls           # Check installed packages"
fi