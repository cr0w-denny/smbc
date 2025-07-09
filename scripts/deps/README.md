# Dependency Management Tool

A tool for managing dependencies across the SMBC monorepo, ensuring version consistency and preventing conflicts.

## Installation

From the monorepo root:

```bash
npm install --workspace scripts/manage-deps
```

## Usage

### Synchronize Dependencies

Align all dependency versions across the monorepo to match the defined standards:

```bash
node scripts/manage-deps sync
```

This will:
- Update all core dependencies to their standard versions
- Report any non-standard SMBC package versions (npm workspaces handles resolution)
- Report all changes made

### Update a Specific Dependency

Update a single dependency across all packages:

```bash
node scripts/manage-deps update react@18.3.0
node scripts/manage-deps update @mui/material@5.15.0
```

### Validate Dependencies

Check for version conflicts and mismatches:

```bash
node scripts/manage-deps validate
```

This will:
- Find all packages using different versions of the same dependency
- Report conflicts that need resolution
- Exit with error code if conflicts exist (useful for CI)

### List All Dependencies

Show a table of all dependencies used across the monorepo:

```bash
node scripts/manage-deps list
```

The output includes:
- Package name
- All versions in use
- Status indicator (✅ = consistent, ⚠️ = multiple versions)

## Core Dependencies

The tool maintains standard versions for core dependencies:

### React Ecosystem
- `react`: ^18.2.0
- `react-dom`: ^18.2.0

### Material-UI
- `@mui/material`: ^5.14.0
- `@mui/icons-material`: ^5.14.0
- `@emotion/react`: ^11.11.0
- `@emotion/styled`: ^11.11.0

### Development Tools
- `typescript`: ^5.3.3
- `vite`: ^5.1.3
- `eslint`: ^8.56.0

### SMBC Packages

All SMBC packages (`@smbc/*`) are automatically resolved by npm workspaces. The tool will notify you if any packages have non-standard versions specified, but won't change them as npm handles the resolution.

## Adding to CI

Add validation to your CI pipeline:

```yaml
- name: Validate Dependencies
  run: node scripts/manage-deps validate
```

## Extending

To add new core dependencies, edit the `CORE_DEPS` object in `index.js`:

```javascript
const CORE_DEPS = {
  // ... existing deps
  'new-package': '^1.0.0',
};
```

To add new SMBC packages, update the `SMBC_PACKAGES` array:

```javascript
const SMBC_PACKAGES = [
  // ... existing packages
  '@smbc/new-package',
];
```