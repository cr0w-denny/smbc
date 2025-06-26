# Architecture Overview

The SMBC Applets Platform is a **scalable, type-safe architecture** for building enterprise applications through independent, self-contained **applets** while maintaining consistency, performance, and developer experience.

## 🏗️ Architecture Layers

### 1. Host Application Layer

The host application provides the shell and coordinates applets:

```mermaid
graph TB
    subgraph "Host App"
        HOST["Shell (Router, Theme)"]
    end

    subgraph "Applets"
        APPLETS[User • Catalog • Analytics]
    end

    subgraph "Shared Infrastructure"
        QUERY[Query Client]
        DESIGN[Design System]
        PERMS[Permissions]
        MOCKS[Mock Services]
    end

    HOST --> APPLETS
    APPLETS --> QUERY
    APPLETS --> DESIGN
    APPLETS --> PERMS
    QUERY --> MOCKS

```

### 2. Applet Layer

Each business domain is a complete, self-contained applet:

```mermaid
graph TB
    subgraph "Applet"
        API[📋 API Definition<br/>TypeSpec]
        CLIENT[🔌 Generated Client<br/>TypeScript + TanStack Query]
        UI[🎨 UI Components<br/>MUI + React]
        BACKEND[⚙️ Backend Service<br/>Django/any framework]
        MOCKS[🎭 Development Mocks<br/>MSW + Faker.js]
    end

    API --> CLIENT
    CLIENT --> UI
    CLIENT --> MOCKS
    BACKEND --> API

    UI --> HOST[Host Application]
    MOCKS --> DEV[Development Environment]
```

### 3. Shared Infrastructure Layer

Common utilities and systems shared across all applets:

```
├── @smbc/mui-applet-core          # Core applet infrastructure
├── @smbc/mui-components           # Shared MUI components
│   └── @smbc/design-tokens        # Design token system
└── @smbc/shared-query-client      # Single QueryClient architecture
    ├── @smbc/react-openapi-client # API client utilities
    └── @smbc/msw-utils            # Mock generation tools
```

## 📱 Applet Structure

Each applet follows a standardized structure:

```
applets/user-management/
├── api/                   # TypeSpec API definition
│   ├── main.tsp           # OpenAPI schema
│   └── tsp-output/        # Generated OpenAPI JSON
├── api-client/            # Generated TypeScript client
│   ├── src/generated/     # Auto-generated types
│   ├── src/mocks/         # MSW mock handlers
│   └── src/client.ts      # Client configuration
├── mui/                   # React UI components
│   ├── src/components/    # Business components
│   ├── src/permissions.ts # Permission definitions
│   └── src/index.ts       # Applet export
└── django/                # Backend implementation
    ├── models.py          # Data models
    ├── views.py           # API endpoints
    └── urls.py            # URL routing
```

## 🚀 Easy Integration Paths

### Greenfield Implementation

```mermaid
graph TB
    subgraph " "
        G1[npm create vite]
        G2[Install @smbc/mui-host]
        G3[createApp with config]
        G4[Full app shell provided]
    end
    G1 --> G2 --> G3 --> G4
```

```typescript
import { createApp } from "@smbc/mui-host";

createApp({
  config: {
    applets: ["@smbc/user-management-mui"],
    roles: ["Guest", "Staff", "Admin"],
    app: { name: "My SMBC App" },
  },
});
```

### Existing App Integration

```mermaid
graph TB
    subgraph " "
        E1[Existing React app]
        E2[Install @smbc/mui-host]
        E3[Use AppletProvider]
        E4[Mount applets in routes]
    end
    E1 --> E2 --> E3 --> E4
```

```typescript
import { AppletProvider, AppletRoute } from '@smbc/mui-host'

<AppletProvider applets={['@smbc/user-management-mui']} roles={roles} user={user}>
  <Routes>
    <Route path="/users/*" element={<AppletRoute applet="user-management" />} />
  </Routes>
</AppletProvider>
```

## 🔐 Permission System

Role-based permissions with applet-specific scoping:

```mermaid
graph TD
    ROLES[User Roles]
    APPLET[Applet Permissions]
    CORE[Core Mapping<br/>Roles → Permissions]
    ACCESS[Access Decision]

    ROLES --> CORE
    APPLET --> CORE
    CORE --> ACCESS

```

## 🔄 Data Flow Architecture

Single QueryClient pattern for optimal performance:

```mermaid
graph TB
    subgraph "Data Architecture"
        QP[Query Provider<br/>Single Instance]
        A1[Applet 1]
        A2[Applet 2]
        A3[Applet 3]

        QP --> A1
        QP --> A2
        QP --> A3

        A1 --> CACHE[Shared Cache]
        A2 --> CACHE
        A3 --> CACHE

        CACHE --> API1[API Service 1]
        CACHE --> API2[API Service 2]
        CACHE --> API3[API Service 3]
    end

    subgraph "Benefits"
        B1[No Prop Drilling]
        B2[Automatic Deduplication]
        B3[Cross-Applet Caching]
        B4[Optimistic Updates]
    end
```

## 🎭 Development Experience

API-first development with automatic mock generation:

```mermaid
graph LR
    subgraph "API-First Development"
        DEF[Define API<br/>TypeSpec]
        GEN[Generate<br/>Client & Mocks]
    end

    DEF --> GEN

    subgraph "Generated Assets"
        TYPES[TypeScript Types]
        CLIENT[API Client]
        MOCKS[MSW Handlers]
        DOCS[API Documentation]
    end

    GEN --> TYPES
    GEN --> CLIENT
    GEN --> MOCKS
    GEN --> DOCS
```

## 📦 Package Dependencies

Third party packages are externalized for optimal bundle management.
