# SMBC Applets Platform

**Scalable, Type-Safe Architecture for Independent Business Modules**

A modern monorepo designed to scale enterprise applications through independent, self-contained **applets** while maintaining consistency, performance, and developer experience.

## 🏗️ Architecture Overview

### The Applet System

Each business domain is a complete, self-contained **applet** with standardized structure:

```
📱 Complete Business Domain
├── 📋 API Definition (TypeSpec)
├── 🔌 Generated Client (TypeScript + TanStack Query)
├── 🎨 UI Components (Material-UI + React)
├── ⚙️ Backend Service (Django/other)
└── 🎭 Development Mocks (MSW + Faker.js)
```

### Workspace Structure

```
smbc/
├── 📱 applets/                   # Business Domain Modules
│   ├── user-management/          # Complete user domain
│   │   ├── api/                  # TypeSpec API definition
│   │   ├── api-client/           # Generated TS client + mocks
│   │   ├── mui/                  # React components
│   │   └── django/               # Backend implementation
│   └── product-catalog/          # Complete product domain
│       └── ...                   # Same structure
├── 🏠 apps/                      # Host Applications
│   └── mui-host-dev/             # MUI-based host development environment
├── 📦 packages/                  # Shared Infrastructure
│   ├── shared-query-client/      # Single QueryClient for all applets
│   ├── mui-components/           # Shared MUI components
│   ├── mui-applet-core/          # Core utilities + hooks for React-based SMBC applications
│   ├── react-openapi-client/     # Shared API client utilities
│   ├── msw-utils/                # Mock generation tools
│   ├── design-tokens/            # Design token system
│   └── create-applet/            # Applet creation CLI
└── 📚 docs/                      # Architecture documentation
```

## 🚦 Quick Start

```bash
# Clone and install
git clone ...
cd smbc
npm install

# Start all development servers
npm run dev

# Or start just the host
npm run start:host
```

### Key Commands

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

## 📚 Package Documentation

### Core Infrastructure

- **[@smbc/applet-query-client](./packages/shared-query-client/README.md)** - Single QueryClient architecture
- **[@smbc/mui-components](./packages/mui-components/README.md)** - Shared MUI components
- **[@smbc/applet-core](./packages/applet-core/README.md)** - Core applet infrastructure
- **[@smbc/applet-dataview](./packages/react-dataview/README.md)** - Data view and transaction management
- **[@smbc/typespec-core](./packages/typespec-core/README.md)** - TypeSpec core utilities
- **[@smbc/design-tokens](./packages/design-tokens/README.md)** - Design token system
- **[@smbc/mui-applet-host](./packages/mui-applet-host/README.md)** - Easy setup for React apps with applet system
- **[create-applet script](./scripts/create-applet/README.md)** - Applet creation CLI

### Example Applets

- **[User Management](./applets/user-management/mui/README.md)** - Complete CRUD example
- **[Product Catalog](./applets/product-catalog/mui/README.md)** - Product management example
