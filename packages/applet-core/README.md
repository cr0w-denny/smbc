# @smbc/applet-core

Foundation utilities, context providers, types, and hooks for React-based SMBC applications.

## Purpose

Core React infrastructure for SMBC applets:

- Type-safe permissions definition and validation
- Role-based access control with flexible mapping
- Hash routing and navigation helpers
- Shared context management
- React hooks for common patterns
- Feature flag system

## Usage

### Defining Permissions

```typescript
import { definePermissions } from "@smbc/applet-core";

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
```

### Using Permissions

```typescript
import { usePermissions } from "@smbc/applet-core";
import { USER_MANAGEMENT_PERMISSIONS } from "./permissions";

function UserTable() {
  const { hasPermission } = usePermissions();
  
  const canEdit = hasPermission("user-management", USER_MANAGEMENT_PERMISSIONS.EDIT_USERS);
  const canDelete = hasPermission("user-management", USER_MANAGEMENT_PERMISSIONS.DELETE_USERS);

  return (
    <Table>
      {canEdit && <EditButton />}
      {canDelete && <DeleteButton />}
    </Table>
  );
}
```

### Role-Based Access Control

```typescript
import { AppProvider } from "@smbc/applet-core";

const roleConfig = {
  roles: ["Guest", "Staff", "Admin"],
  permissionMappings: {
    "user-management": {
      "VIEW_USERS": ["Staff", "Admin"],
      "EDIT_USERS": ["Admin"],
      "DELETE_USERS": ["Admin"]
    }
  }
};

<AppProvider initialRoleConfig={roleConfig} initialUser={user}>
  <App />
</AppProvider>
```

### Hash Navigation

```typescript
import { useHashNavigation } from "@smbc/applet-core";

function Navigation() {
  const { navigate, currentPath } = useHashNavigation();
  
  return (
    <nav>
      <button onClick={() => navigate("/users")}>Users</button>
      <button onClick={() => navigate("/products")}>Products</button>
      <span>Current: {currentPath}</span>
    </nav>
  );
}
```

### Feature Flags

```typescript
import { FeatureFlagProvider, useFeatureFlag } from "@smbc/applet-core";

const featureFlags = [
  {
    key: "darkMode",
    defaultValue: false,
    description: "Enable dark mode theme"
  }
];

function App() {
  return (
    <FeatureFlagProvider configs={featureFlags}>
      <ThemeToggle />
    </FeatureFlagProvider>
  );
}

function ThemeToggle() {
  const isDarkMode = useFeatureFlag("darkMode");
  const toggleDarkMode = useFeatureFlagToggle("darkMode");
  
  return (
    <button onClick={toggleDarkMode}>
      {isDarkMode ? "Light" : "Dark"} Mode
    </button>
  );
}
```

## API Reference

### definePermissions

```typescript
function definePermissions<T extends Record<string, string>>(
  appletId: string,
  permissions: T
): PermissionDefinition<T>
```

### usePermissions

```typescript
function usePermissions(): {
  hasPermission: (appletId: string, permission: PermissionDefinition) => boolean;
  userRoles: string[];
  isReady: boolean;
}
```

### useHashNavigation

```typescript
function useHashNavigation(): {
  navigate: (path: string) => void;
  currentPath: string;
  isActive: (path: string) => boolean;
}
```

### useFeatureFlag

```typescript
function useFeatureFlag<T>(key: string): T | undefined;
function useFeatureFlagToggle(key: string): () => void;
```