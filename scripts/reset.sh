#!/bin/bash

# Clean All Caches - Remove all TypeScript build info and other cache files across the monorepo
# This script provides a truly clean slate for debugging build issues

set -e

echo "🧹 Cleaning all caches across the monorepo..."

# Change to the monorepo root
cd "$(dirname "$0")/.."

echo "📁 Current directory: $(pwd)"

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
