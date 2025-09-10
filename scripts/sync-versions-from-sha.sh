#!/bin/bash

# Script to sync package.json versions from a specific git SHA
# Usage: ./sync-versions-from-sha.sh <SHA>

set -e

# Check if SHA is provided
if [ -z "$1" ]; then
    echo "Error: Please provide a git SHA"
    echo "Usage: $0 <SHA>"
    exit 1
fi

SHA="$1"
TEMP_DIR=$(mktemp -d)
CURRENT_BRANCH=$(git branch --show-current)

echo "Syncing versions from SHA: $SHA"
echo "Temporary directory: $TEMP_DIR"
echo "Current branch: $CURRENT_BRANCH"

# Verify SHA exists
if ! git cat-file -e "$SHA^{commit}" 2>/dev/null; then
    echo "Error: SHA $SHA does not exist in the repository"
    exit 1
fi

# Find all package.json files in apps, applets, and packages
echo "Finding all package.json files..."
PACKAGE_FILES=$(find apps applets packages -name "package.json" -type f 2>/dev/null | sort)

if [ -z "$PACKAGE_FILES" ]; then
    echo "No package.json files found in apps, applets, or packages directories"
    exit 1
fi

echo "Found $(echo "$PACKAGE_FILES" | wc -l) package.json files"
echo ""

# Process each package.json file
while IFS= read -r package_file; do
    echo "Processing: $package_file"
    
    # Check if file exists in the SHA
    if git show "$SHA:$package_file" >/dev/null 2>&1; then
        # Extract version from the SHA
        VERSION=$(git show "$SHA:$package_file" | grep '"version"' | head -1 | sed -E 's/.*"version": *"([^"]+)".*/\1/')
        
        if [ -n "$VERSION" ]; then
            # Get current version
            CURRENT_VERSION=$(grep '"version"' "$package_file" | head -1 | sed -E 's/.*"version": *"([^"]+)".*/\1/')
            
            if [ "$CURRENT_VERSION" != "$VERSION" ]; then
                echo "  Updating version: $CURRENT_VERSION → $VERSION"
                
                # Update version in current branch's package.json
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    # macOS
                    sed -i '' "s/\"version\": *\"[^\"]*\"/\"version\": \"$VERSION\"/" "$package_file"
                else
                    # Linux
                    sed -i "s/\"version\": *\"[^\"]*\"/\"version\": \"$VERSION\"/" "$package_file"
                fi
            else
                echo "  Version already matches: $VERSION"
            fi
        else
            echo "  Warning: Could not extract version from SHA"
        fi
    else
        echo "  File doesn't exist in SHA $SHA"
    fi
done <<< "$PACKAGE_FILES"

# Clean up
rm -rf "$TEMP_DIR"

echo ""
echo "Version sync complete!"
echo "Updated package.json files in current branch: $CURRENT_BRANCH"
echo ""
echo "Run 'git status' to see modified files"
echo "Run 'git diff' to review changes"