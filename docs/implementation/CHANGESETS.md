# Changesets Versioning Guide

## Overview

This monorepo uses [Changesets](https://github.com/changesets/changesets) for version management and changelog generation. The configuration ensures that:

1. **Applet packages share version numbers** - All packages within an applet (API, client, Django, MUI) are versioned together
2. **Independent packages can be bumped separately** - Shared packages like `mui-components`, `shared-query-client`, etc. can be versioned independently
3. **Host app packages are ignored** - Development-only packages don't participate in versioning

## Configuration

### Linked Packages (Shared Versions)

The following package groups are configured to share version numbers:

#### User Management Applet (Example)

- `@smbc/user-management-api-client`
- `@smbc/user-management-mui`

#### Product Catalog Applet (Example)

- `@smbc/product-catalog-api-client`
- `@smbc/product-catalog-mui`

**Note**: The configuration is automatically generated and updated using `npm run changeset:config` which discovers all applet packages.

### Independent Packages

These packages are versioned independently:

- `@smbc/design-tokens` - Design token system
- `@smbc/mui-applet-core` - Core applet infrastructure
- `@smbc/mui-components` - Shared MUI component library
- `@smbc/msw-utils` - MSW testing utilities
- `@smbc/mui-host` - Main host application package
- `@smbc/react-openapi-client` - API client utilities
- `@smbc/applet-query-client` - React Query configuration

### Ignored Packages

These packages are excluded from versioning:

- `apps/mui-host-dev` - Development host application

## Workflow

### 1. Making Changes

When you make changes to any package, you don't need to update version numbers manually. Just make your changes and commit them.

### 2. Adding a Changeset

After making changes, create a changeset to describe what changed:

```bash
npm run changeset
```

This will:

1. Ask which packages changed
2. Ask what type of change (major, minor, patch)
3. Ask for a description of the change
4. Create a changeset file in `.changeset/`

### 3. Example Changeset Creation

```bash
$ npm run changeset
🦋  Which packages would you like to include?
◯ @smbc/mui-host
◯ @smbc/mui-applet-core
◉ @smbc/mui-components
◯ @smbc/applet-query-client
◯ @smbc/react-openapi-client
◯ @smbc/msw-utils
◯ @smbc/design-tokens
◯ @smbc/user-management-api-client
◯ @smbc/user-management-mui

🦋  Which packages should have a major bump?
◯ @smbc/mui-components

🦋  Which packages should have a minor bump?
◉ @smbc/mui-components

🦋  Which packages should have a patch bump?
◯ @smbc/mui-components

🦋  Please enter a summary for this change (this will be in the changelogs).
Added SearchInput component with debouncing functionality

🦋  Summary
│
│  minor:  @smbc/mui-components
│
│  The following summary will be included in the changelog:
│  Added SearchInput component with debouncing functionality
│
◯ Confirm

🦋  Changeset added! - you can now commit it
```

### 4. Versioning Packages

When ready to release, run:

```bash
npm run version-packages
```

This will:

1. Bump version numbers according to changesets
2. Update changelogs
3. Update package-lock.json
4. Remove consumed changeset files

### 5. Publishing (if needed)

For publishing to npm (when ready):

```bash
npm run changeset:publish
```

## Changeset Types

### Patch (0.0.X)

- Bug fixes
- Small improvements
- Documentation updates
- Non-breaking changes

### Minor (0.X.0)

- New features
- New components
- New API endpoints
- Backward-compatible changes

### Major (X.0.0)

- Breaking changes
- API changes that require code updates
- Removing features
- Significant architectural changes

## Adding New Applets

When adding a new applet (e.g., `order-management`), the linked configuration can be automatically updated:

1. **Follow the naming convention**: `@smbc/order-management-api`, `@smbc/order-management-client`, etc.
2. **Run the auto-config script**:
   ```bash
   npm run changeset:config
   ```
3. **The script will**:
   - Discover all applet packages automatically
   - Generate the proper linked configuration
   - Update `.changeset/config.json`
   - All packages in each applet will share versions

This automated approach scales effortlessly as the monorepo grows without manual configuration updates.

## Example Scenarios

### Adding a New Component to Shared Library

1. Add the component to `@smbc/mui-components`
2. Run `npm run changeset`
3. Select `@smbc/mui-components`
4. Choose "minor" (new feature)
5. Describe: "Added ConfirmationDialog component"

### Fixing a Bug in User Management

1. Fix the bug in `@smbc/user-management-mui`
2. Run `npm run changeset`
3. Select the user management packages (they'll all be versioned together)
4. Choose "patch" (bug fix)
5. Describe: "Fixed user search filter issue"

### Breaking API Change

1. Make breaking changes to `@smbc/user-management-api-client`
2. Update UI in `@smbc/user-management-mui`
3. Run `npm run changeset`
4. Select all user management packages
5. Choose "major" (breaking change)
6. Describe: "BREAKING: Changed user API response format"

## Benefits

### For Applets

- **Consistency**: All parts of an applet stay in sync
- **Simplicity**: One version number per business domain
- **Coordination**: API, client, and UI changes are released together

### For Shared Packages

- **Independence**: Can be updated without affecting applets
- **Flexibility**: Different release cadences for different utilities
- **Reduced coupling**: Shared components can evolve independently

### For Development

- **Clear history**: Detailed changelogs for each package
- **Safe releases**: Semantic versioning prevents accidental breaking changes
- **Automation**: Version bumps and changelog generation are automated

## Commands Reference

```bash
# Add a changeset (describe changes)
npm run changeset

# Get interactive help for creating changesets
npm run changeset:help

# Auto-update linked configuration (after adding applets)
npm run changeset:config

# Version packages (apply changesets)
npm run changeset:version

# Alternative that also updates package-lock
npm run version-packages

# Publish to npm (when ready)
npm run changeset:publish

# Check changeset status
npx changeset status

# Check which packages have unpublished changes
npx changeset status --verbose
```

## Best Practices

1. **Create changesets for all user-facing changes**
2. **Use descriptive changeset messages** - they become changelog entries
3. **Group related changes** - create one changeset for a complete feature
4. **Be conservative with major versions** - prefer minor/patch when possible
5. **Version packages before merging to main** - keeps main branch clean
6. **Review generated changelogs** - ensure they're user-friendly

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Release
on:
  push:
    branches: [main]
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          version: npm run version-packages
          publish: npm run changeset:publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

This setup provides a robust versioning system that scales with the monorepo while maintaining clear separation of concerns between shared components and applets.
