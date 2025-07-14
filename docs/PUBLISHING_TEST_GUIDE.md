# Publishing Test Guide

This guide provides a foolproof, step-by-step process for testing package publishing using the local Verdaccio registry. Use this to verify your packages work correctly before publishing to npm.

## Prerequisites

- Node.js 18+ installed
- npm 9+ installed
- All dependencies installed (`npm install` from root)
- No uncommitted changes (for accurate testing)

## Quick Test (5 minutes)

For a rapid smoke test of the publishing system:

```bash
# From project root
npm run registry:start          # Start local registry
npm run registry:publish        # Build & publish all packages
npm run registry:use-local      # Configure npm to use local registry

# Verify packages are published
open http://localhost:4873      # View in browser
```

## Comprehensive Testing Process

### Step 1: Clean Environment Setup (2 minutes)

```bash
# Clean previous builds and registry storage
rm -rf packages/*/dist
rm -rf applets/*/*/dist
rm -rf apps/*/dist
rm -rf scripts/verdaccio/storage/

# Reset npm configuration
npm run registry:use-npm

# Ensure clean install
npm ci
```

### Step 2: Start Local Registry (1 minute)

```bash
# Start Verdaccio (keep this terminal open)
npm run registry:start

# In a new terminal, verify it's running
curl http://localhost:4873
# Should return: {"name":"verdaccio",...}
```

### Step 3: Build All Packages (3-5 minutes)

```bash
# Run sequential build to ensure proper order
npm run build:sequential

# Verify builds completed
ls packages/applet-core/dist/     # Should have .js and .d.ts files
ls applets/hello/mui/dist/        # Should have index.js
```

### Step 4: Publish to Local Registry (2 minutes)

```bash
# Publish all packages
npm run registry:publish

# Check publish log for any errors
# Each package should show: "+ @smbc/package-name@0.0.0"
```

### Step 5: Verify Published Packages

#### Option A: Browser Verification
```bash
open http://localhost:4873

# Navigate to:
# - @smbc scope to see all packages
# - Click any package to see versions
# - Verify latest version is 0.0.0
```

#### Option B: CLI Verification
```bash
# List all @smbc packages
npm view --registry http://localhost:4873 @smbc/applet-core
npm view --registry http://localhost:4873 @smbc/hello-mui

# Check package contents
npm pack --registry http://localhost:4873 @smbc/hello-mui
tar -tzf smbc-hello-mui-0.0.0.tgz  # Verify files are included
rm smbc-hello-mui-0.0.0.tgz        # Cleanup
```

### Step 6: Test Package Installation (3 minutes)

```bash
# Configure npm to use local registry
npm run registry:use-local

# Create test directory
mkdir -p /tmp/applet-test && cd /tmp/applet-test
npm init -y

# Install packages
npm install @smbc/hello-mui @smbc/mui-applet-host

# Verify installation
ls node_modules/@smbc/            # Should list installed packages
cat package.json                  # Should show dependencies

# Test imports (create test.mjs)
echo 'import hello from "@smbc/hello-mui";
console.log("Applet loaded:", hello);' > test.mjs
node test.mjs                     # Should print applet info
```

### Step 7: Test in Host Application (5 minutes)

```bash
# Return to project root
cd /path/to/project

# Use local packages in host
cd apps/mui-host
rm -rf node_modules package-lock.json
npm install                       # Will use local registry

# Run the host
npm run dev

# Verify in browser:
# - Applets load correctly
# - No console errors
# - Navigation works
```

### Step 8: Cleanup and Reset

```bash
# Return to project root
cd /path/to/project

# Switch back to npm registry
npm run registry:use-npm

# Stop Verdaccio (Ctrl+C in terminal)

# Optional: Clean storage
rm -rf scripts/verdaccio/storage/
```

## Testing Specific Scenarios

### Testing a Single Package

```bash
# Build specific package
cd packages/applet-core && npm run build

# Publish just one package
cd packages/applet-core
npm publish --registry http://localhost:4873

# Test installation
cd /tmp/test-single
npm install @smbc/applet-core --registry http://localhost:4873
```

### Testing Version Updates

```bash
# Create a changeset
npm run changeset
# Select packages, choose patch/minor/major, add description

# Version packages
npm run changeset:version

# Rebuild and republish
npm run build:sequential
npm run registry:publish

# Verify new versions
npm view @smbc/applet-core versions --registry http://localhost:4873
```

### Testing Breaking Changes

```bash
# Make breaking change in applet-core
# Update version to 1.0.0
# Rebuild and publish

# In dependent package, test compatibility
cd applets/hello/mui
npm install @smbc/applet-core@1.0.0 --registry http://localhost:4873
npm run build  # Check for errors
```

## Common Issues and Solutions

### Registry Not Accessible
```bash
# Check if port 4873 is in use
lsof -i :4873

# Kill existing process if needed
kill -9 <PID>

# Restart registry
npm run registry:start
```

### Package Not Found
```bash
# Ensure package was built
ls packages/[package-name]/dist/

# Check publishConfig in package.json
cat packages/[package-name]/package.json | grep publishConfig

# Manually add if missing
npm run registry:setup
```

### Build Failures
```bash
# Run individual package builds to isolate issues
cd packages/[package-name]
npm run build

# Check for TypeScript errors
npm run type-check

# Clean and rebuild
rm -rf dist/ tsconfig.tsbuildinfo
npm run build
```

### Installation Conflicts
```bash
# Clear npm cache
npm cache clean --force

# Remove package locks
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

## Validation Checklist

Before considering publishing complete, verify:

- [ ] All packages build without errors
- [ ] All packages publish to local registry
- [ ] Package contents match expected files (use `npm pack`)
- [ ] Dependencies resolve correctly
- [ ] Peer dependencies are satisfied
- [ ] TypeScript types are included and valid
- [ ] Packages install in external project
- [ ] Imported code executes without errors
- [ ] Host applications run with local packages
- [ ] No accidental inclusion of node_modules
- [ ] Bundle sizes are reasonable

## Publishing to npm (Production)

After successful local testing:

```bash
# Ensure on main branch with no changes
git checkout main
git pull
git status  # Should be clean

# Create changeset and version
npm run changeset
npm run changeset:version

# Build everything
npm run build:sequential

# Dry run first
npm run changeset:publish -- --dry-run

# Actual publish (requires npm credentials)
npm run changeset:publish

# Create git tag
git push --follow-tags
```

## Notes

- Verdaccio stores packages in `scripts/verdaccio/storage/`
- Configuration is in `scripts/verdaccio/config.yaml`
- Only `@smbc/*` packages use local registry
- Other packages proxy to npmjs.org
- Default version is 0.0.0 for local testing
- Use changesets for proper versioning