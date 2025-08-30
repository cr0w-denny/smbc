---
"@smbc/vite-config": minor
---

Enhanced shared app configuration with comprehensive features

- **Bundle optimization**: Configurable chunking with `additionalVendorPackages` parameter
- **Production tooling**: Built-in bundle analyzer plugin for production builds
- **Environment handling**: Automatic MSW disabling, API docs, and development flags
- **Monorepo support**: HMR-enabled development aliases and package exclusions via `monorepoPackages`
- **Error suppression**: Built-in sourcemap warning filtering for cleaner builds
- **Applet integration**: Automatic version injection and base path configuration
- **Performance**: Pre-bundling optimization and cache configuration
- Simplified app configs from 130+ lines to ~40 lines with better maintainability
- Single vendor bundle strategy combines React, MUI, React Query, and tree-shaken icons for optimal caching