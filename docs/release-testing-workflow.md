# Release Testing Workflow

This document outlines a safe workflow for testing version bumps and releases, then rolling back to the original state.

## Overview

Use this workflow to test the complete release process including changesets, versioning, local publishing, and package installation without affecting your main development branch.

## Test Workflow

### 1. Create Test Branch

```bash
git checkout -b test-release-workflow
```

This isolates your release testing from the main development branch.

### 2. Test Changesets Flow

```bash
# Create a changeset
npm run changeset
# Select packages and change types, add description

# Version the packages 
npm run changeset:version
# This updates package.json files and CHANGELOG.md

# Check what changed
git diff
```

The changeset process will:
- Prompt you to select which packages changed
- Ask for the type of change (patch, minor, major)
- Request a description of the changes
- Update version numbers in package.json files
- Generate/update CHANGELOG.md files

### 3. Test Local Publishing

```bash
# Start local registry
npm run registry:start

# Build and publish to local registry
npm run registry:publish

# Switch to local registry
npm run registry:use-local

# Test installation from external directory
cd /tmp
mkdir test-install && cd test-install
npm init -y
npm install @smbc/applet-core @smbc/product-catalog-mui

# Verify packages installed correctly
node -e "console.log(require('@smbc/applet-core'))"
```

This tests:
- Building all packages
- Publishing to local Verdaccio registry
- Registry switching
- External package installation
- Package functionality

### 4. Rollback Strategy

#### Option A: Clean Branch Deletion
```bash
# Switch back to npm registry
npm run registry:use-npm

# Return to main branch and delete test branch
cd /path/to/monorepo
git checkout main
git branch -D test-release-workflow

# Clear local registry storage
rm -rf scripts/verdaccio/storage
```

#### Option B: Stash Approach (if testing on current branch)
```bash
# Create changeset and version
npm run changeset
npm run changeset:version

# Test publishing...
npm run registry:start
npm run registry:publish

# Rollback changes
git stash push -m "test version changes"
# or git reset --hard HEAD~1 if you committed
```

### 5. Cleanup

```bash
# Ensure you're back on npm registry
npm run registry:use-npm

# Clear npm cache if needed
npm cache clean --force

# Stop Verdaccio if still running
# Ctrl+C in the terminal running registry:start
```

## Tips

- **Always use a test branch** - This prevents accidental commits to main
- **Test external installation** - Install packages from `/tmp` to simulate real usage
- **Verify package contents** - Check that published packages work as expected
- **Clean up thoroughly** - Remove test branches and clear local registry storage

## Troubleshooting

### Registry Issues
```bash
# Check if registry is running
curl http://localhost:4873

# Check current registry config
npm config get @smbc:registry
# Should show: http://localhost:4873 (local) or undefined (npmjs.org)
```

### Package Issues
```bash
# Check published packages
curl http://localhost:4873/-/web/detail/@smbc

# Re-publish if needed
npm run registry:publish
```

### Reset Everything
```bash
# Switch back to npm
npm run registry:use-npm

# Clear all local data
rm -rf scripts/verdaccio/storage
npm cache clean --force

# Reset git state
git checkout main
git branch -D test-release-workflow
```

## Real Release Process

When you're ready to do an actual release:

1. **Create changeset on main branch**:
   ```bash
   npm run changeset
   ```

2. **Create PR with changeset file** (don't version yet)

3. **After PR merge, version and publish**:
   ```bash
   npm run changeset:version
   git add . && git commit -m "Version packages"
   npm run changeset:publish  # This publishes to npm
   git push
   ```

This keeps changesets and versioning separate from the actual publishing step.