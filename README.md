# SMBC Applets Platform

A monorepo containing React applets for business functionality. Each applet includes API definitions, generated TypeScript clients, UI components, and development mocks.

## Architecture

Each business domain is implemented as an applet with:

```
applets/domain-name/
├── api/           # TypeSpec API definition
├── api-client/    # Generated TypeScript client + mocks
├── mui/           # React UI components
└── django/        # Backend service
```

### Workspace Structure

```
smbc/
├── applets/                   # Business Domain Modules
│   ├── user-management/          
│   │   ├── api/                  # TypeSpec API definition
│   │   ├── api-client/           # Generated TS client + mocks
│   │   ├── mui/                  # React components
│   │   └── django/               # Backend implementation
│   └── product-catalog/          
│       └── ...                   # Same structure
├── apps/                      # Host Applications
│   └── mui-host-dev/             # Development environment
├── packages/                  # Shared Infrastructure
│   ├── applet-query-client/      # Single QueryClient for all applets
│   ├── mui-components/           # Shared MUI components
│   ├── mui-applet-core/          # Core utilities for React applications
│   ├── applet-dataview/          # Data view and transaction management
│   ├── design-tokens/            # Design token system
│   └── create-applet/            # Applet creation CLI
└── docs/                      # Documentation
```

## Installation

```bash
git clone <repository>
cd smbc
npm install
npm run dev
```

### Commands

```bash
# Development
npm run dev              # Start all development servers
npm run build            # Build all packages

# Code Quality
npm run lint             # ESLint checking
npm run format           # Prettier formatting
npm run type-check       # TypeScript validation

# Applet Creation
npm run create:applet
```

## Package Documentation

### Core Infrastructure

- **[@smbc/applet-query-client](./packages/applet-query-client/README.md)** - Single QueryClient architecture
- **[@smbc/mui-components](./packages/mui-components/README.md)** - Shared MUI components
- **[@smbc/applet-core](./packages/applet-core/README.md)** - Core applet infrastructure
- **[@smbc/applet-dataview](./packages/applet-dataview/README.md)** - Data view and transaction management
- **[@smbc/design-tokens](./packages/design-tokens/README.md)** - Design token system
- **[@smbc/mui-applet-host](./packages/mui-applet-host/README.md)** - Host application setup
- **[create-applet script](./scripts/create-applet/README.md)** - Applet creation CLI

### Example Applets

- **[User Management](./applets/user-management/mui/README.md)** - User CRUD operations
- **[Product Catalog](./applets/product-catalog/mui/README.md)** - Product management