# Architecture Overview

The platform uses a layered architecture with host applications coordinating independent applets.

## Architecture Layers

### 1. Host Application Layer

The host application provides routing, theme, and coordinates applets:

```
Host App (Shell)
├── Router
├── Theme Provider
├── Permission Context
└── Query Client
```

### 2. Applet Layer

Each business domain is a self-contained applet:

```
applets/domain-name/
├── api/           # TypeSpec API definition
├── api-client/    # Generated TypeScript client + mocks
├── mui/           # React UI components
└── django/        # Backend service
```

### 3. Shared Infrastructure

Common utilities shared across applets:

```
packages/
├── applet-query-client/  # Single QueryClient for all applets
├── mui-components/       # Shared MUI components
├── applet-core/          # Core utilities
├── applet-dataview/      # Data management and transactions
└── design-tokens/        # Design system tokens
```

## Package Architecture

### Core Packages

- **applet-query-client**: Centralized TanStack Query configuration
- **mui-components**: Shared React components using Material-UI
- **applet-core**: Authentication, permissions, navigation utilities
- **applet-dataview**: Data tables, forms, CRUD operations with transaction support
- **design-tokens**: CSS variables and design system definitions

### Applet Structure

Each applet follows this structure:

```
applets/business-domain/
├── api/              # TypeSpec schema definitions
│   ├── main.tsp      # API models and endpoints
│   └── tsp-output/   # Generated OpenAPI specs
├── api-client/       # TypeScript client
│   ├── src/
│   │   ├── client.ts     # API client configuration
│   │   ├── generated/    # Auto-generated types
│   │   └── mocks/        # MSW mock handlers
│   └── dist/         # Built client library
├── mui/              # React UI components
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── config/       # Applet configuration files
│   │   └── index.ts      # Main export
│   └── dist/         # Built UI library
└── django/           # Backend implementation
    ├── models.py     # Data models
    ├── views.py      # API endpoints
    └── urls.py       # URL routing
```

## Data Flow

1. **TypeSpec Definition**: Define API schema in `api/main.tsp`
2. **Code Generation**: Generate TypeScript types and OpenAPI spec
3. **Client Generation**: Create TanStack Query hooks and mock handlers
4. **UI Development**: Build React components using generated client
5. **Backend Implementation**: Implement API endpoints matching schema

## Permission System

Role-based permissions with applet-specific scoping:

- **Roles**: Defined at application level (e.g., Guest, Staff, Admin)
- **Permissions**: Defined per applet (e.g., VIEW_USERS, EDIT_USERS)
- **Mappings**: Configure which roles have which permissions per applet

```typescript
const permissionMappings = {
  'user-management': {
    'VIEW_USERS': ['Staff', 'Admin'],
    'EDIT_USERS': ['Admin']
  }
}
```

## Build System

The monorepo uses npm workspaces with TypeScript project references:

```bash
npm run build:libs        # Build shared packages first
npm run build:apis        # Generate API specifications
npm run build:api-clients # Build TypeScript clients
npm run build:applets     # Build React UI components
npm run build:apps        # Build host applications
```