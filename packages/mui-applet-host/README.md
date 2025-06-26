# @smbc/mui-host

Easy setup for SMBC applets. Supports both greenfield apps and existing app integration.

## Quick Start

### Greenfield Apps (Complete App Shell)

```bash
npm create vite@latest my-react-app -- --template react-ts
cd my-react-app
npm install @smbc/mui-host @smbc/mui-user-management

# Install peer dependencies (see DEPENDENCIES.md for full list)
npm install react react-dom @mui/material @mui/icons-material @emotion/react @emotion/styled @tanstack/react-query msw

# Optional: Create config file
# echo 'export default { applets: ["@smbc/mui-user-management"], roles: ["Guest", "Staff", "Admin"] }' > smbc.config.js

npm run dev
```

Create your app:

```typescript
// src/main.tsx
import { createApp } from "@smbc/mui-host";

createApp({
  config: {
    applets: ["@smbc/mui-user-management"],
    roles: ["Guest", "Staff", "Admin"],
    app: { name: "My SMBC App" },
  },
});
```

### Existing Apps (Component Integration)

```bash
npm install @smbc/mui-host @smbc/mui-user-management
# Install peer dependencies...
```

Integrate with your existing app:

```typescript
// src/App.tsx
import { AppletProvider, AppletRoute } from '@smbc/mui-host'

function App() {
  return (
    <AppletProvider
      applets={['@smbc/mui-user-management']}
      roles={['Staff', 'Admin']}
      user={currentUser}
    >
      <Routes>
        <Route path="/users/*" element={<AppletRoute applet="user-management" />} />
      </Routes>
    </AppletProvider>
  )
}
```

## API Reference

### `createApp(options)`

Creates a complete SMBC app with full app shell.

```typescript
createApp({
  config?: HostConfig,           // Configuration object
  configPath?: string,           // Path to config file
  container?: string | HTMLElement // Mount container
})
```

### `<AppletProvider>`

Lightweight provider for existing apps.

```typescript
<AppletProvider
  applets={string[]}             // Applet package names
  roles={string[]}               // Available roles
  user={User}                    // Current user
  permissions={Record<string, string[]>} // Permission mappings
  features={Record<string, boolean>}     // Feature flags
  theme="light" | "dark" | "auto"        // Theme preference
>
```

### `<AppletRoute>`

Component for mounting applets in existing routing.

```typescript
<AppletRoute
  applet={string}                // Applet ID
  mountPath={string}             // Optional mount path override
  fallback={ComponentType}       // Optional fallback component
/>
```

## Configuration

### Config File (Optional)

Create `smbc.config.js` or `smbc.config.ts`:

```typescript
export default {
  applets: ["@smbc/mui-user-management"],
  roles: ["Guest", "Staff", "Admin"],
  app: {
    name: "My SMBC App",
    theme: "light",
  },
  permissions: {
    "user-management": {
      "view-users": ["Staff", "Admin"],
      "edit-users": ["Admin"],
    },
  },
  features: {
    darkMode: true,
    mockData: true,
  },
};
```

### Programmatic Configuration

```typescript
const config = {
  applets: [
    "@smbc/mui-user-management",
    {
      name: "@smbc/mui-product-catalog",
      mountPath: "/products",
      permissions: ["view-products"],
    },
  ],
  roles: ["Guest", "Staff", "Manager", "Admin"],
  user: {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    roles: ["Staff"],
  },
};
```

## Dependencies

This package externalizes all third-party dependencies as peer dependencies. See [DEPENDENCIES.md](./DEPENDENCIES.md) for the complete list and installation guide.

**Key dependencies you'll need:**

- `react` & `react-dom` (^18.0.0)
- `@mui/material` & `@mui/icons-material` (^7.0.0)
- `@emotion/react` & `@emotion/styled` (^11.10.0)
- `@tanstack/react-query` (^5.0.0)
- And more...

**Note:** If using API documentation features, add this CSS import to your main.tsx:

```typescript
import "swagger-ui-react/swagger-ui.css";
```

## Examples

### Basic User Management

```typescript
import { createApp } from "@smbc/mui-host";

createApp({
  config: {
    applets: ["@smbc/mui-user-management"],
    roles: ["Guest", "Staff", "Admin"],
    user: {
      id: "1",
      name: "Staff User",
      roles: ["Staff"],
    },
  },
});
```

### Multiple Applets

```typescript
import { AppletProvider, AppletRoute } from '@smbc/mui-host'

<AppletProvider
  applets={[
    '@smbc/mui-user-management',
    '@smbc/mui-product-catalog'
  ]}
  roles={['Guest', 'Staff', 'Manager', 'Admin']}
  user={currentUser}
>
  <Routes>
    <Route path="/users/*" element={<AppletRoute applet="user-management" />} />
    <Route path="/products/*" element={<AppletRoute applet="product-catalog" />} />
  </Routes>
</AppletProvider>
```

### Custom Permissions

```typescript
<AppletProvider
  applets={['@smbc/mui-user-management']}
  roles={['Viewer', 'Editor', 'Admin']}
  permissions={{
    'user-management': {
      'view-users': ['Viewer', 'Editor', 'Admin'],
      'edit-users': ['Editor', 'Admin'],
      'delete-users': ['Admin']
    }
  }}
>
```
