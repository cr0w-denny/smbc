#!/bin/bash

# Clean slate for debugging build issues

set -e

echo "🧹 Cleaning all caches across the monorepo..."

# Change to the monorepo root
cd "$(dirname "$0")/.."

echo "📁 Current directory: $(pwd)"

# Run package-specific clean scripts
echo "🔧 Running package-specific clean scripts..."
npm run clean

# Remove TypeScript declaration files, declaration maps, and JavaScript files 
echo "🗑️  Removing TypeScript declaration files, maps, and JavaScript files..."
npm run clean-ts

# Remove TypeScript build info files
echo "🔨 Removing TypeScript build info files..."
find . -name "tsconfig.tsbuildinfo" -type f -delete || true
find . -name "*.tsbuildinfo" -type f -delete || true

# Remove all dist directories
echo "📦 Removing all dist directories..."
find . -name "dist" -type d -not -path "./node_modules/*" -exec rm -rf {} + || true

# Remove TypeScript cache directories
echo "⚡ Removing TypeScript cache directories..."
find . -name ".tscache" -type d -not -path "./node_modules/*" -exec rm -rf {} + || true

# Remove Vite cache
echo "⚡ Removing Vite cache..."
find . -name ".vite" -type d -not -path "./node_modules/*" -exec rm -rf {} + || true

# Remove npm cache (optional - uncomment if needed)
# echo "📦 Clearing npm cache..."
# npm cache clean --force

# Remove any temporary files
echo "🗑️  Removing temporary files..."
find . -name "*.tmp" -type f -not -path "./node_modules/*" -delete || true
find . -name "*.temp" -type f -not -path "./node_modules/*" -delete || true

# Remove package-lock.json and node_modules
echo "🗑️  Removing package-lock.json and node_modules directories..."
rm package-lock.json
find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +
