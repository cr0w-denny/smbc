# Role Manager & Applet Integration Architecture

This document explains how to connect the development console role manager with mounted applets and implement bidirectional synchronization between the role manager and user menu in the app shell.

## Overview

The role manager system provides a way to dynamically manage user roles during development and see real-time permission changes across applets. This integration connects:

1. **Development Console Role Manager** - Interactive role management in dev console
2. **Mounted Applets** - Live applet configurations with permissions
3. **User Menu** - App shell user menu with role toggles
4. **Global State** - Centralized role state management

## Architecture Components

### 1. Core State Management

#### usePersistedRoles Hook
Located: `/packages/applet-core/src/hooks/usePersistedRoles.ts`

```typescript
export interface UsePersistedRolesProps {
  userRoles: string[];
  availableRoles: string[];
  storageKey?: string;
  onRolesChange: (roles: string[]) => void;
}
```

**Features:**
- Manages role selection with localStorage persistence
- Automatic synchronization with user roles
- Bidirectional state updates via `onRolesChange` callback

**Key Implementation:**
- `toggleRole()` immediately calls `onRolesChange(newRoles)`
- State persists to localStorage with configurable key
- Validates roles against `availableRoles` list

#### useAppletPermissions Hook
Located: `/packages/applet-core/src/hooks/useAppletPermissions.ts`

```typescript
export interface UseAppletPermissionsProps {
  hostApplets: HostAppletConfig[];
  roleConfig: RoleConfiguration;
  selectedRoles: string[];
  hasPermission: (roles: string[], appletId: string, permissionId: string) => boolean;
}
```

**Features:**
- Maps host applet configurations to permission groups
- Real-time permission calculation based on selected roles
- Formats permission names (e.g., "VIEW_USERS" → "View Users")
- Handles applets without permissions

### 2. Role Manager Component

#### RoleManager Component
Located: `/packages/mui-applet-devtools/src/RoleManager/RoleManager.tsx`

```typescript
export interface RoleManagerProps {
  user?: User;
  availableRoles: string[];
  selectedRoles: string[];
  onRoleToggle: (role: string) => void;
  appletPermissions: PermissionGroup[];
  title?: string;
  showUserInfo?: boolean;
  persistRoles?: boolean;
  localStorageKey?: string;
}
```

**Features:**
- Interactive role selection with toggle buttons
- Real-time permission matrix showing access across applets
- Current user information display
- Optional localStorage persistence
- Customizable applet groupings with icons

### 3. Integration Pattern (mui-host-dev)

#### MuiAppletRouter Implementation
Located: `/packages/mui-applet-devtools/src/MuiAppletRouter.tsx`

```typescript
const DashboardComponent = () => {
  const { userRoles } = useRoleManagement();
  const { user, availableRoles, setRoles } = useUser();
  const { roleUtils } = useAppletCore();

  const { selectedRoles, toggleRole } = usePersistedRoles({
    userRoles,
    availableRoles,
    storageKey: "roleMapping-selectedRoles",
    onRolesChange: setRoles, // KEY: Updates global user state
  });

  const appletPermissions = useAppletPermissions({
    hostApplets: applets,
    roleConfig,
    selectedRoles,
    hasPermission: roleUtils.hasPermission,
  });

  return (
    <RoleManager
      user={user || undefined}
      availableRoles={availableRoles}
      selectedRoles={selectedRoles}
      onRoleToggle={toggleRole}
      appletPermissions={appletPermissions}
      localStorageKey="roleMapping-selectedRoles"
    />
  );
};
```

## Implementation Plan for mui-ewi

### Step 1: Connect Role Manager to Real Applets

Currently, the DevConsole uses mock permission data. To connect with real applets:

```typescript
// In DevConsole.tsx - Replace mock data with real applet integration
import { useAppletPermissions } from '@smbc/applet-core';
import { getAllApplets } from '@smbc/applet-host';

const DevConsole = ({ /* ... */ }) => {
  // Get real applets from registry
  const mountedApplets = getAllApplets();

  // Use real permission calculation
  const appletPermissions = useAppletPermissions({
    hostApplets: mountedApplets,
    roleConfig: ROLE_CONFIG, // From applet.config.ts
    selectedRoles,
    hasPermission: roleUtils.hasPermission,
  });

  return (
    <RoleManager
      appletPermissions={appletPermissions} // Real data instead of mock
      // ... other props
    />
  );
};
```

### Step 2: Bidirectional Synchronization Architecture

#### Global State Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Role Manager  │◄──►│   Global State   │◄──►│   User Menu     │
│  (Dev Console)  │    │ (AppletProvider) │    │  (App Shell)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌────────▼────────┐              │
         └──────────────►│ localStorage    │◄─────────────┘
                         │ Persistence     │
                         └─────────────────┘
```

#### Implementation Strategy

**1. Shared State Management**
```typescript
// AppletProvider already manages user state
const AppletProvider = ({ children, initialUser, initialRoleConfig }) => {
  const [user, setUser] = useState(initialUser);

  // This function is the bridge for role updates
  const updateUserRoles = (newRoles: string[]) => {
    setUser(prev => ({
      ...prev,
      roles: newRoles,
      permissions: calculatePermissionsFromRoles(newRoles, roleConfig)
    }));
  };

  // Provide the update function to children
  return (
    <AppletContext.Provider value={{
      user,
      setRoles: updateUserRoles, // KEY: Exposed for role updates
      // ... other values
    }}>
      {children}
    </AppletContext.Provider>
  );
};
```

**2. Role Manager Integration**
```typescript
// In DevConsole.tsx
const { user, setRoles } = useUser(); // From AppletProvider

const { selectedRoles, toggleRole } = usePersistedRoles({
  userRoles: user?.roles || [],
  availableRoles: HOST_ROLES,
  storageKey: "dev-console-roles",
  onRolesChange: setRoles, // Updates global state automatically
});
```

**3. User Menu Integration**
```typescript
// In app shell component that renders UserMenu
const { user } = useUser(); // Same state as role manager

const userRoles = user?.roles?.map(role => ({
  id: role,
  label: role,
  enabled: true // All user roles are enabled
})) || [];

const handleRoleToggle = (roleId: string, enabled: boolean) => {
  const newRoles = enabled
    ? [...user.roles, roleId]
    : user.roles.filter(r => r !== roleId);
  setRoles(newRoles); // Updates same global state
};

<UserMenu
  userRoles={userRoles}
  onToggleRole={handleRoleToggle}
  // ... other props
/>
```

### Step 3: Storage Synchronization

Both components use the same localStorage key for perfect sync:

```typescript
// Both role manager and user menu use same key
const STORAGE_KEY = "dev-user-roles";

// usePersistedRoles handles localStorage automatically
// When either component changes roles, both update immediately
```

## Benefits of This Architecture

### 1. **Real-time Synchronization**
- Changes in role manager immediately reflect in user menu
- Changes in user menu immediately reflect in role manager
- Both persist to localStorage with same key

### 2. **Centralized Permission Logic**
- Single source of truth for permission calculations
- Consistent behavior across all components
- Real applet permissions, not mock data

### 3. **Development Experience**
- Role changes instantly update applet permissions
- Visual feedback in both dev console and user menu
- Persistent across browser sessions

### 4. **Scalable Pattern**
- Easy to add new role-aware components
- Works with any number of applets
- Compatible with existing permission system

## Implementation Checklist

- [ ] Replace mock data in DevConsole with real applet integration
- [ ] Add `setRoles` function to AppletProvider context
- [ ] Update DevConsole to use `usePersistedRoles` with global state bridge
- [ ] Add UserMenu integration to app shell with same state management
- [ ] Ensure both components use same localStorage key
- [ ] Test bidirectional synchronization
- [ ] Verify permission updates reflect in real applets
- [ ] Add error handling for invalid role states

## Testing the Integration

1. **Open DevConsole** → Change roles → Verify user menu updates
2. **Open UserMenu** → Change roles → Verify dev console updates
3. **Refresh browser** → Verify roles persist correctly
4. **Navigate applets** → Verify permissions reflect current roles
5. **Invalid roles** → Verify graceful fallback behavior

This architecture provides a robust, scalable solution for role management that works seamlessly across the entire application while maintaining development ergonomics and production reliability.