# Publishing to Sonatype Registry

This script publishes all @smbc packages to a Sonatype registry (or any npm-compatible registry).

## Usage

```bash
# Dry run to see what would be published
npm run publish:sonatype:dry-run

# Actually publish packages
SONATYPE_REGISTRY=https://sonatype-url npm run publish:sonatype
```

## Environment Variables

- `SONATYPE_REGISTRY`: The Sonatype registry

## Features

- **Automatic build**: Builds all packages before publishing
- **Dependency ordering**: Publishes packages in the correct order based on dependencies
- **Duplicate prevention**: Checks if a version is already published before attempting
- **Package.json updates**: Automatically updates publishConfig, repository, homepage, and license fields
- **Backup/restore**: Backs up package.json files before modification and restores after publishing

## What Gets Published

All packages under the `@smbc` scope from:

- `packages/*`
- `applets/*/mui`
- `applets/*/api`

## Package Updates

The script automatically updates each package.json with:

```json
{
  "publishConfig": {
    "registry": "https://sonatype-url",
    "access": "public"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/.../smbc.git",
    "directory": "packages/xyz"
  },
  "homepage": "https://github.com/.../smbc",
  "license": "MIT"
}
```

## Authentication

Make sure you're authenticated with your registry:

```bash
npm login --registry https://sonatype-url
```

## Publish Order

Packages are published in dependency order to ensure all dependencies are available:

1. Core packages (ui-core, applet-meta, typespec-core, etc.)
2. Framework packages (applet-core, mui-components, etc.)
3. Integration packages (mui-applet-core, applet-host, etc.)
4. CLI tools (applet-cli, create-applet, create-host-app)
5. Applets (in no particular order)
