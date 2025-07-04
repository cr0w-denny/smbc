# @smbc/vite-config

Shared Vite configuration for SMBC applets, providing consistent build settings while allowing customization.

## Features

- 🚀 Pre-configured for React + TypeScript applets
- 📦 Automatic dependency externalization
- 🎯 TypeScript declarations generation
- ⚡ Optimized build settings
- 🔧 Extensible and customizable

## Installation

```bash
npm install --save-dev @smbc/vite-config
```

## Usage

### Basic Configuration

Most applets can use the default configuration:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { createAppletConfig } from '@smbc/vite-config';

export default defineConfig(
  createAppletConfig({
    appletName: 'my-applet',
    rootDir: __dirname
  })
);
```

### Advanced Configuration

Customize the build for specific needs:

```typescript
import { defineConfig } from 'vite';
import { createAppletConfig } from '@smbc/vite-config';
import customPlugin from 'vite-plugin-custom';

export default defineConfig(
  createAppletConfig({
    appletName: 'advanced-applet',
    rootDir: __dirname,
    
    // Custom entry point
    entry: 'src/main.ts',
    
    // Custom output directory
    outDir: 'build',
    
    // Disable TypeScript declarations
    typescript: false,
    
    // Use minimal externals
    externalsPreset: 'core',
    
    // Add custom external dependencies
    additionalExternals: ['lodash', 'date-fns'],
    
    // Add SMBC packages
    additionalSMBCPackages: ['custom-utils'],
    
    // Optimize specific dependencies
    optimizeDeps: ['heavy-library'],
    
    // Add custom plugins
    plugins: [customPlugin()],
    
    // Merge additional Vite config
    viteConfig: {
      server: {
        port: 4000
      }
    }
  })
);
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `appletName` | `string` | *required* | Name of your applet |
| `rootDir` | `string` | *required* | Root directory (use `__dirname`) |
| `entry` | `string` | `'src/index.ts'` | Entry point file |
| `outDir` | `string` | `'dist'` | Output directory |
| `typescript` | `boolean` | `true` | Generate TypeScript declarations |
| `suppressWarnings` | `boolean` | `true` | Suppress 'use client' warnings |
| `externalsPreset` | `string` | `'full'` | Preset for external dependencies |
| `additionalExternals` | `string[]` | `[]` | Additional packages to externalize |
| `additionalSMBCPackages` | `string[]` | `[]` | Additional SMBC packages |
| `optimizeDeps` | `string[]` | `[]` | Dependencies to pre-bundle |
| `plugins` | `Plugin[]` | `[]` | Additional Vite plugins |
| `viteConfig` | `UserConfig` | `{}` | Additional Vite configuration |

## External Dependency Presets

The package provides several presets for externalizing dependencies:

- **`core`**: Only React dependencies
- **`mui`**: React + Material-UI dependencies  
- **`api`**: React + API libraries (TanStack Query, MSW)
- **`full`**: All of the above + SMBC packages (default)

## What Gets Externalized?

By default (using the `full` preset), the following are externalized:

### React Ecosystem
- `react`, `react-dom`, `react/jsx-runtime`

### Material-UI
- `@mui/material`, `@mui/icons-material`, `@mui/x-data-grid`, etc.
- `@emotion/react`, `@emotion/styled`

### API & State Management
- `@tanstack/react-query`
- `openapi-fetch`
- `msw`

### SMBC Packages
- `@smbc/applet-core`
- `@smbc/mui-applet-core`
- `@smbc/mui-components`
- `@smbc/react-query-dataview`

## Build Output

The configuration produces:

```
dist/
├── index.es.js        # ES module bundle
├── index.es.js.map    # Source map
└── types/             # TypeScript declarations (if enabled)
    └── index.d.ts
```

## Migration Guide

To migrate an existing applet:

1. Install the package: `npm install --save-dev @smbc/vite-config`
2. Replace your `vite.config.ts` with the basic configuration above
3. Add any custom configuration as needed
4. Remove redundant dev dependencies that are now provided

## Troubleshooting

### Build fails with "Cannot find module"
Ensure the module is not in the externals list if it should be bundled.

### TypeScript declarations not generated
Check that `typescript: true` (default) and that you have a valid `tsconfig.json`.

### Custom plugin conflicts
Ensure your custom plugins don't conflict with the built-in ones. You can disable built-in features if needed.