#!/bin/bash

# Clean Vite cache script for SMBC monorepo
# This script removes all Vite cache directories to force fresh builds

echo "🧹 Cleaning Vite caches across the monorepo..."

# Kill any running Vite processes
echo "⚡ Stopping any running Vite processes..."
pkill -f "vite" || true

# Find and remove all .vite directories in node_modules
echo "🗑️  Removing Vite cache directories..."
find . -type d -name ".vite" -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null || true

# Also clean common cache locations
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf apps/*/node_modules/.vite 2>/dev/null || true
rm -rf packages/*/node_modules/.vite 2>/dev/null || true
rm -rf applets/*/*/node_modules/.vite 2>/dev/null || true

# Clean dist directories if requested
if [ "$1" = "--dist" ]; then
  echo "🗑️  Also cleaning dist directories..."
  find . -type d -name "dist" -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null || true
fi

# Clear npm cache if requested
if [ "$1" = "--full" ]; then
  echo "🗑️  Performing full clean (dist + npm cache)..."
  find . -type d -name "dist" -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null || true
  npm cache clean --force
fi

echo "✅ Vite caches cleaned!"
echo ""
echo "Usage:"
echo "  ./clean-vite.sh              - Clean only Vite caches"
echo "  ./clean-vite.sh --dist - Clean Vite caches and dist directories"
echo "  ./clean-vite.sh --full       - Clean everything (Vite, dist, npm cache)"