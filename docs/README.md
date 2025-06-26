# SMBC Applets Platform

Welcome to the SMBC Applets Platform - a scalable, type-safe architecture for building enterprise applications through independent, self-contained applets.

## 📚 Documentation Overview

### Quick Start

- **[Architecture Overview](./ARCHITECTURE.md)** - Understand the system design and patterns
- **[Getting Started](./GETTING_STARTED.md)** - Create your first app in 5 minutes

### For Developers

- **[Integration Guide](./INTEGRATION.md)** - Add applets to existing applications
- **[Applet Development](./APPLET_DEVELOPMENT.md)** - Build applets from scratch

### Implementation Details

- **[Implementation Guides](./implementation/README.md)** - Technical setup, dependencies, and tooling

## 🚀 Two-Minute Quick Start

### New Application

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install @smbc/mui-host @smbc/user-management-mui
```

```typescript
// src/main.ts
import { createApp } from "@smbc/mui-host";

createApp({
  config: {
    applets: ["@smbc/user-management-mui"],
    roles: ["Guest", "Staff", "Admin"],
    app: { name: "My SMBC App" },
  },
});
```

```bash
npm run dev
```

### Existing Application

```typescript
import { AppletProvider, AppletRoute } from '@smbc/mui-host'

<AppletProvider applets={['@smbc/user-management-mui']} roles={roles} user={user}>
  <Routes>
    <Route path="/users/*" element={<AppletRoute applet="user-management" />} />
  </Routes>
</AppletProvider>
```

## 🏗️ What You Get

- **Type-safe API client** generated from OpenAPI specifications
- **MUI components** that follow your design system
- **Mock data** for development without backend dependencies
- **Permission-based access control** built into every component
- **Hot reload** development experience with instant feedback

## 🎯 Key Benefits

### Independent Business Domains

Each applet is a complete business domain - API, UI, backend, and mocks - that can be developed and deployed independently.

### Enterprise-Ready

Built-in permissions, role-based access, type safety, and scalable architecture designed to accommodate multiple business domains.

### Developer Experience

API-first development with auto-generated clients, realistic mock data, and comprehensive tooling.

## 📦 Available Applets

| Package                     | Description                     | Features                                      |
| --------------------------- | ------------------------------- | --------------------------------------------- |
| `@smbc/user-management-mui` | Complete user management system | User CRUD, roles, permissions, authentication |

## 🛠️ Development Workflow

```bash
# Start all development servers
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Generate API clients
npm run generate
```

## 🔧 Configuration

### Basic Configuration

```typescript
{
  applets: ['@smbc/user-management-mui'],
  roles: ['Guest', 'Staff', 'Admin'],
  app: { name: 'My App' }
}
```

### Advanced Configuration

```typescript
{
  applets: ['@smbc/user-management-mui'],
  roles: ['Guest', 'Staff', 'Admin'],
  app: { name: 'My Enterprise App', version: '1.0.0' },
  permissions: {
    permissionMappings: {
      'user-management': {
        'VIEW_USERS': ['Staff', 'Admin'],
        'EDIT_USERS': ['Admin']
      }
    }
  }
}
```
