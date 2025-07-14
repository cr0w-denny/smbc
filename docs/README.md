# SMBC Applets Platform

React applet system for modular business functionality.

## Documentation

### Quick Start

- **[Architecture Overview](./ARCHITECTURE.md)** - System design and patterns
- **[Getting Started](./GETTING_STARTED.md)** - Installation and setup

### Development

- **[Integration Guide](./INTEGRATION.md)** - Adding applets to existing applications
- **[Applet Development](./APPLET_DEVELOPMENT.md)** - Building new applets
- **[Routing Guide](./ROUTING_GUIDE.md)** - In-depth guide to the applet routing system
- **[Publishing Test Guide](./PUBLISHING_TEST_GUIDE.md)** - Testing package publishing with Verdaccio

### Implementation Details

- **[Implementation Guides](./implementation/README.md)** - Technical setup and tooling

## Quick Start

### New Application

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install @smbc/mui-applet-host @smbc/user-management-mui
```

```typescript
// src/main.ts
import { createApp } from "@smbc/mui-applet-host";

createApp({
  config: {
    applets: ["@smbc/user-management-mui"],
    roles: ["Guest", "Staff", "Admin"],
    app: { name: "My App" },
  },
});
```

### Existing Application

```typescript
import { AppletProvider, AppletRoute } from '@smbc/mui-applet-host'

<AppletProvider applets={['@smbc/user-management-mui']} roles={roles} user={user}>
  <Routes>
    <Route path="/users/*" element={<AppletRoute applet="user-management" />} />
  </Routes>
</AppletProvider>
```

## Available Applets

| Package                     | Description                     |
| --------------------------- | ------------------------------- |
| `@smbc/user-management-mui` | User CRUD operations and roles  |

## Commands

```bash
# Development
npm run dev           # Start all development servers
npm run build         # Build for production
npm test             # Run tests
npm run generate     # Generate API clients
```

## Configuration

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