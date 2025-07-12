# Local Package Registry with Verdaccio

This directory contains tools for running a local npm registry using Verdaccio, allowing local testing of @smbc packages before publishing to npm.

## Available Scripts

| Script                       | Description                                            |
| ---------------------------- | ------------------------------------------------------ |
| `npm run registry:setup`     | Add publishConfig to all @smbc packages                |
| `npm run registry:start`     | Start Verdaccio local registry on port 4873            |
| `npm run registry:use-local` | Switch npm to use local registry for @smbc packages    |
| `npm run registry:use-npm`   | Switch back to npmjs.org for @smbc packages            |
| `npm run registry:publish`   | Build and publish all @smbc packages to local registry |

## How It Works

### Registry Configuration

- **URL**: http://localhost:4873
- **Web Interface**: http://localhost:4873/-/web/detail/@smbc
- **Config**: `tools/verdaccio/config.yaml`
- **Storage**: `tools/verdaccio/storage/`

### Package Scope

- Only `@smbc/*` packages are served locally
- All other packages proxy to npmjs.org
- No authentication required (local development only)

### Registry Switching

The scripts use npm's scoped registry feature:

```bash
# Use local registry for @smbc packages only
npm config set @smbc:registry http://localhost:4873

# Remove scoped registry (back to npmjs.org)
npm config delete @smbc:registry
```

## Testing Workflow

### 1. Local Development Testing

```bash
# Start registry
npm run registry:start

# In another terminal: publish packages
npm run registry:publish

# Switch to local registry
npm run registry:use-local

# Test in your project
npm install @smbc/applet-core
```

### 2. External Project Testing

```bash
# Create test project
mkdir /tmp/test-project
cd /tmp/test-project
npm init -y

# Install from local registry
npm install @smbc/applet-core @smbc/mui-components

# Test the packages
node -e "console.log(require('@smbc/applet-core'))"
```

### 3. Version Testing

```bash
# Create changeset
npm run changeset

# Version packages
npm run changeset:version

# Publish new versions locally
npm run registry:publish
```

## Troubleshooting

### Registry Not Accessible

```bash
# Check if registry is running
curl http://localhost:4873

# Restart registry
npm run registry:start
```

### Package Not Found

```bash
# Check published packages
curl http://localhost:4873/-/web/detail/@smbc

# Re-publish packages
npm run registry:publish
```

### Wrong Registry

```bash
# Check current config
npm config get @smbc:registry

# Should show: http://localhost:4873 (local) or undefined (npmjs.org)
```

### Clear Local Cache

```bash
# Clear npm cache
npm cache clean --force

# Clear Verdaccio storage
rm -rf tools/verdaccio/storage
```
