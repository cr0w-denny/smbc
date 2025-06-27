# @smbc/mui-applet-core

**Foundation utilities, context providers, types, and hooks for React-based SMBC applications**

Core React infrastructure for SMBC applets, providing type-safe permissions, routing helpers, shared context management, and feature flags.

## Purpose

This package provides essential React infrastructure for SMBC applets:

- **🔐 Type-Safe Permissions**: Define and validate permissions across applets
- **👤 Role-Based Access Control**: RBAC system with flexible role mapping
- **🧭 Applet Routing**: Hash routing and navigation helpers for micro-frontends
- **📦 Shared Context**: Common app state and configuration
- **🔧 React Hooks**: Reusable hooks for common patterns
- **🚩 Feature Flags**: Dynamic feature toggling system

## Architecture

```
@smbc/mui-applet-core
├── AppContext.tsx           # 📦 Shared application context
├── AppletRouter.tsx         # 🧭 Hash-based routing for applets
├── FeatureFlagProvider.tsx  # 🚩 Feature flag management
├── hooks.ts                 # 🔧 Common React hooks
├── permissions.ts           # 🔐 Permission definition system
├── types.ts                 # 📝 Shared TypeScript interfaces
├── useAppletPermissions.tsx # 🔐 Permission-specific hooks
├── usePersistedRoles.tsx    # 👤 Role persistence hooks
└── host.ts                  # 🏠 Host app utilities
```

## Quick Start

### Defining Permissions

```typescript
import { definePermissions } from "@smbc/mui-applet-core";

// Define typed permissions for your applet
export const USER_MANAGEMENT_PERMISSIONS = definePermissions(
  "user-management",
  {
    VIEW_USERS: "Can view user list and profiles",
    CREATE_USERS: "Can create new user accounts",
    EDIT_USERS: "Can modify existing user information",
    DELETE_USERS: "Can remove user accounts",
    MANAGE_ROLES: "Can assign and modify user roles",
  },
);

// Permissions are fully typed
const canEdit = USER_MANAGEMENT_PERMISSIONS.EDIT_USERS;
// Type: { id: 'user-management:edit_users', name: 'EDIT_USERS', description: '...' }
```

### Setting Up App Context

```typescript
import { AppContext, RoleConfig } from '@smbc/mui-applet-core';

const roleConfig: RoleConfig = {
  roles: ['Guest', 'User', 'Admin'],
  permissionMappings: {
    'user-management': {
      [USER_MANAGEMENT_PERMISSIONS.VIEW_USERS.id]: ['User', 'Admin'],
      [USER_MANAGEMENT_PERMISSIONS.EDIT_USERS.id]: ['Admin'],
    }
  }
};

const user = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@company.com',
  roles: ['Admin'],
};

function App() {
  return (
    <AppContext.Provider value={{ user, roleConfig }}>
      <YourApplet />
    </AppContext.Provider>
  );
}
```

### Applet Routing

```typescript
import { AppletRouter } from '@smbc/mui-applet-core';

const routes = [
  {
    path: '/users',
    component: UserList,
    permissions: [USER_MANAGEMENT_PERMISSIONS.VIEW_USERS.id],
  },
  {
    path: '/users/create',
    component: CreateUser,
    permissions: [USER_MANAGEMENT_PERMISSIONS.CREATE_USERS.id],
  },
];

function UserManagementApplet() {
  return (
    <AppletRouter
      routes={routes}
      fallback={<div>Access Denied</div>}
    />
  );
}
```

## Permission System

### Permission Definition

The `definePermissions` function creates a type-safe permission object:

```typescript
export const PRODUCT_PERMISSIONS = definePermissions("product-catalog", {
  VIEW_PRODUCTS: "Can view product listings",
  CREATE_PRODUCTS: "Can create new products",
  EDIT_PRODUCTS: "Can modify product information",
  DELETE_PRODUCTS: "Can remove products",
  MANAGE_CATEGORIES: "Can manage product categories",
  VIEW_ANALYTICS: "Can view sales analytics",
});

// Each permission has a structured ID, name, and description
console.log(PRODUCT_PERMISSIONS.VIEW_PRODUCTS);
// Output: {
//   id: 'product-catalog:view_products',
//   name: 'VIEW_PRODUCTS',
//   description: 'Can view product listings'
// }
```

### Permission Benefits

- **Type Safety**: Full TypeScript support with autocomplete
- **Namespace Isolation**: Permissions scoped to applet domains
- **Documentation**: Built-in descriptions for each permission
- **Validation**: Runtime validation of permission IDs
- **Refactoring Safety**: IDE support for renaming and finding usage

### Role Configuration

```typescript
interface RoleConfig {
  roles: string[];
  permissionMappings?: Record<string, Record<string, string[]>>;
}

const roleConfig: RoleConfig = {
  roles: ["Guest", "Customer", "Staff", "Manager", "Admin", "SuperAdmin"],
  permissionMappings: {
    "user-management": {
      "user-management:view_users": ["Staff", "Manager", "Admin", "SuperAdmin"],
      "user-management:create_users": ["Manager", "Admin", "SuperAdmin"],
      "user-management:edit_users": ["Manager", "Admin", "SuperAdmin"],
      "user-management:delete_users": ["Admin", "SuperAdmin"],
      "user-management:manage_roles": ["SuperAdmin"],
    },
    "product-catalog": {
      "product-catalog:view_products": [
        "Customer",
        "Staff",
        "Manager",
        "Admin",
      ],
      "product-catalog:edit_products": ["Staff", "Manager", "Admin"],
      "product-catalog:delete_products": ["Manager", "Admin"],
    },
  },
};
```

## Feature Flags

### Feature Flag Provider

```typescript
import { FeatureFlagProvider } from '@smbc/mui-applet-core';

const featureFlags = {
  newUserInterface: true,
  advancedAnalytics: false,
  betaFeatures: process.env.NODE_ENV === 'development',
};

function App() {
  return (
    <FeatureFlagProvider flags={featureFlags}>
      <YourApp />
    </FeatureFlagProvider>
  );
}
```

### Using Feature Flags

```typescript
import { useFeatureFlags } from '@smbc/mui-applet-core';

function UserInterface() {
  const { isEnabled } = useFeatureFlags();

  return (
    <div>
      {isEnabled('newUserInterface') ? (
        <NewUserInterface />
      ) : (
        <LegacyUserInterface />
      )}

      {isEnabled('advancedAnalytics') && <AdvancedAnalytics />}
    </div>
  );
}
```

## Core Hooks

### useAppletPermissions

```typescript
import { useAppletPermissions } from '@smbc/mui-applet-core';

function ProtectedComponent() {
  const { hasPermission, userRoles } = useAppletPermissions();

  if (!hasPermission('user-management:view_users')) {
    return <AccessDenied />;
  }

  const isAdmin = userRoles.includes('Admin');

  return <UserManagement showAdvanced={isAdmin} />;
}
```

### usePersistedRoles

```typescript
import { usePersistedRoles } from '@smbc/mui-applet-core';

function RoleSelector() {
  const {
    currentRole,
    availableRoles,
    switchRole,
    persistRole
  } = usePersistedRoles();

  return (
    <Select
      value={currentRole}
      onChange={(role) => switchRole(role)}
    >
      {availableRoles.map(role => (
        <MenuItem key={role} value={role}>{role}</MenuItem>
      ))}
    </Select>
  );
}
```

## Types and Interfaces

### Core Types

```typescript
import type {
  User,
  UserWithPreferences,
  RoleConfig,
  PermissionDefinition,
  NavigationItem,
} from "@smbc/mui-applet-core";

// Minimal User interface
interface User {
  id: string;
  roles: string[];
  name: string;
  email?: string;
  avatar?: string;
  [key: string]: any;
}

// Extended User with preferences
interface UserWithPreferences extends User {
  preferences: {
    theme?: "light" | "dark" | "auto";
    language?: string;
    timezone?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      desktop?: boolean;
    };
    [key: string]: any;
  };
}
```

## Host Integration

### Host Utilities

```typescript
import { createHostAdapter } from "@smbc/mui-applet-core/host";

// Utilities for host apps to integrate applets
const hostAdapter = createHostAdapter({
  permissionValidator: (user, permission) => {
    // Custom permission validation logic
    return user.roles.some((role) =>
      roleConfig.permissionMappings[permission]?.includes(role),
    );
  },
});
```

## Best Practices

### Permission Naming

- Use clear, descriptive permission names in UPPER_CASE
- Group related permissions in the same applet namespace
- Use consistent naming patterns across applets

### Role Design

- Roles are simple string labels defined by the host application
- Use clear, memorable role names appropriate for your domain
- No inheritance or hierarchy - permissions are explicitly mapped

### Applet Structure

- Use AppletRouter for hash-based navigation within applets
- Implement permission checks at route level
- Keep applet state isolated and self-contained

### Feature Flag Usage

- Use feature flags for gradual rollouts and A/B testing
- Keep flag names descriptive and environment-aware
- Clean up unused flags regularly

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run in development mode
npm run dev

# Run linting
npm run lint

# Type checking
npm run type-check
```

## Package Structure

- **Main export** (`dist/index.js`): Core functionality
- **Host export** (`dist/host.js`): Host app utilities
- **Types**: Full TypeScript support with declaration files
- **ESM/CJS**: Supports both module systems
