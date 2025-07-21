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
