# Monorepo Structure

- **Build System**: Turbo (pipeline-based builds with caching)
- **Package Manager**: npm with workspaces
- **Code Generation**: TypeSpec → OpenAPI → TypeScript clients
- **Mocking Strategy**: MSW (Mock Service Worker) with automated mock generation
- **UI Framework**: React 18 + MUI v7 + Emotion
- **State Management**: TanStack Query (React Query) v5
- **Development**: Vite + TypeScript + Storybook

---

## Directory Structure

```
├── 📁 packages/          # Shared utilities and components
├── 📁 applets/           # Domain-specific business modules
├── 📁 apps/              # Host applications
├── 📁 docs/              # Architecture and setup documentation
├── 📁 scripts/           # Build and maintenance scripts
├── 🔧 package.json       # Root workspace configuration
├── 🔧 turbo.json         # Build pipeline configuration
└── 🔧 tsconfig.json      # TypeScript base configuration
```

---

## Package Categories & Dependencies

### 1. 📦 Core Shared Packages (`packages/`)

#### `@smbc/mui-host`

- **Purpose**: Main host application package for SMBC applets
- **Technology**: React 18, MUI v7, TypeScript
- **Exports**: createApp, AppletProvider, AppletRoute
- **Key Feature**: Unified host for greenfield and existing apps
- **Dependencies**: React, MUI, TanStack Query
- **Build**: Vite with ESM exports

#### `@smbc/mui-applet-core`

- **Purpose**: Core applet infrastructure and utilities
- **Technology**: React 18, TypeScript
- **Exports**: Core applet types, permission hooks, base components
- **Dependencies**: React, TanStack Query
- **Build**: TypeScript compilation

#### `@smbc/mui-components`

- **Purpose**: Shared MUI React components library
- **Technology**: React 18, MUI v7, Emotion
- **Exports**: Common UI components, ApiDocsModal, shared components
- **Dependencies**: MUI ecosystem, design tokens
- **Build**: Vite with UMD/ESM dual exports

#### `@smbc/design-tokens`

- **Purpose**: Design token system for consistent theming
- **Technology**: TypeScript
- **Exports**: Color tokens, typography tokens, spacing tokens
- **Dependencies**: None (pure tokens)
- **Build**: TypeScript compilation

#### `@smbc/applet-query-client`

- **Purpose**: Centralized TanStack Query client provider
- **Technology**: TanStack Query v5, React 18
- **Exports**: Shared QueryClient configuration and providers
- **Key Feature**: Single query client across all applets
- **Dependencies**: TanStack Query
- **Build**: TypeScript compilation

#### `@smbc/react-openapi-client`

- **Purpose**: Base OpenAPI client utilities for React
- **Technology**: TypeScript, React
- **Exports**: API client utilities and base classes
- **Dependencies**: TanStack Query, React
- **Build**: TypeScript compilation

#### `@smbc/msw-utils`

- **Purpose**: MSW utilities and automated mock generation
- **Technology**: MSW v2, Faker.js, OpenAPI tooling
- **Exports**: Mock generators, MSW handlers, dev utilities
- **Dependencies**: MSW, Faker, OpenAPI tooling
- **Build**: TypeScript compilation

### 2. 🏗️ Business Domain Applets (`applets/`)

Each applet follows a 4-layer architecture:

```
applets/{domain}/
├── api/           # TypeSpec API definition
├── api-client/    # Generated TypeScript client + mocks
├── mui/           # React UI components
└── django/        # Python backend implementation
```

### 3. 🚀 Host Applications (`apps/`)

#### `@smbc/mui-host-dev`

- **Purpose**: Main host application that orchestrates all applets
- **Technology**: React 18, MUI v7, Vite
- **Features**:
  - Role-based permission system
  - Dynamic applet loading
  - Unified navigation
  - API documentation viewer
  - Built-in applet routing and navigation
- **Dependencies**: All SMBC packages and applets
- **Configuration**: `/apps/host-mui/src/app.config.ts`
