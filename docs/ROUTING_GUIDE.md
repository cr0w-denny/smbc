# Applet Routing Guide

This guide covers the routing system for applet developers, explaining how navigation works within the micro-frontend architecture.

## Overview

The routing system uses hash-based navigation to manage both host-level and applet-level routes. Each applet operates within its own routing namespace while the host manages the overall navigation structure.

**Architectural Principle**: The URL hash reflects the current routing state but never drives it. Navigation occurs through the routing system (`navigateTo`), which updates state and then reflects that state in the hash.

## Core Concepts

### Hash-Based Routing

All navigation uses URL hashes (e.g., `#/user-management/analytics`). This approach ensures:
- No server configuration required
- Works in all deployment scenarios
- Clear separation between host and applet routes
- Browser history support

### Route Hierarchy

Routes follow a hierarchical structure:
```
#/                                  # Host root
#/applet-id                         # Applet root
#/applet-id/internal-route          # Applet internal route
#/applet-id/section/subsection      # Nested applet route
```

## For Applet Developers

### Basic Setup

Every applet must implement routing using the `useHashNavigation` hook:

```typescript
import { useHashNavigation } from '@smbc/applet-core';

export const Applet: FC<AppletProps> = ({ mountPath }) => {
  const { currentPath, navigateTo } = useHashNavigation(mountPath);
  
  // currentPath is relative to your applet's mount point
  // navigateTo handles navigation within your applet
};
```

### Route Handling

The `currentPath` value is always relative to your applet's mount point. If your applet is mounted at `/user-management`:

- Browser URL: `#/user-management` → `currentPath = "/"`
- Browser URL: `#/user-management/profile/123` → `currentPath = "/profile/123"`

### Navigation Patterns

#### Simple Route Matching

```typescript
const renderCurrentRoute = () => {
  switch (currentPath) {
    case '/':
      return <UserList />;
    case '/analytics':
      return <Analytics />;
    default:
      return <NotFound />;
  }
};
```

#### Dynamic Routes

For routes with parameters:

```typescript
if (currentPath.startsWith('/profile/')) {
  const userId = currentPath.replace('/profile/', '');
  return <UserProfile userId={userId} />;
}
```

#### Programmatic Navigation

```typescript
// Navigate to a route within your applet
navigateTo('/analytics');

// Navigate with state preservation
const previousPath = currentPath;
navigateTo(`/profile/${userId}`);
// Later: navigateTo(previousPath);
```

**Important**: Always use `navigateTo` for route changes. Never set `window.location.hash` directly - the hash should only reflect routing state, not drive it.

### Exposing Internal Navigation to Host

Applets can expose their internal navigation structure to the host application. The host uses the `useHostNavigation` hook to collect and display this navigation in drawers, menus, or other UI components.

#### Static Navigation

Define navigation in your applet definition:

```typescript
const appletDefinition = {
  id: 'user-management',
  displayName: 'User Management',
  navigation: {
    routes: [
      { path: '/', label: 'Users', icon: People },
      { path: '/analytics', label: 'Analytics', icon: BarChart }
    ]
  }
};

export default appletDefinition;
```

#### Dynamic Navigation Export

To expose internal routes that depend on permissions, use the `createNavigationExport` utility:

```typescript
import { createNavigationExport } from '@smbc/applet-core';
import permissions from './permissions';

// This function will be called by the host to get your applet's navigation
export const getHostNavigation = createNavigationExport({
  routes: [
    { 
      path: '/',  // Internal route within your applet
      label: 'Dashboard', 
      icon: Dashboard 
    },
    { 
      path: '/analytics',  // Another internal route
      label: 'Analytics',
      icon: BarChart,
      permission: permissions.VIEW_ANALYTICS  // Only visible to users with this permission
    }
  ]
});
```

The utility automatically:
- Adds the applet's mount path to all routes
- Filters routes based on user permissions
- Formats the navigation for host consumption

#### Hierarchical Navigation

For complex internal navigation with grouped routes:

```typescript
import { createNavigationExport } from '@smbc/applet-core';
import permissions from './permissions';

export const getHostNavigation = createNavigationExport({
  groups: [
    {
      id: 'users',
      label: 'User Management',
      icon: '👥',
      order: 1
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      order: 2
    }
  ],
  routes: [
    { path: '/users', label: 'All Users', group: 'users', permission: permissions.VIEW_USERS },
    { path: '/users/active', label: 'Active Users', group: 'users', permission: permissions.VIEW_USERS },
    { path: '/users/archived', label: 'Archived Users', group: 'users', permission: permissions.VIEW_USERS },
    { path: '/settings/roles', label: 'Roles', group: 'settings', permission: permissions.MANAGE_ROLES },
    { path: '/settings/permissions', label: 'Permissions', group: 'settings', permission: permissions.MANAGE_ROLES }
  ],
  homeRoute: {
    label: 'Home',
    icon: '🏠'
  }
});
```

#### Simple Navigation

For applets with just a few internal routes, use the simplified helper:

```typescript
import { createSimpleNavigationExport } from '@smbc/applet-core';
import permissions from './permissions';

export const getHostNavigation = createSimpleNavigationExport([
  { path: '/', label: 'Dashboard' },
  { path: '/settings', label: 'Settings', permission: permissions.MANAGE_SETTINGS }
]);
```

### Best Practices

#### Route Organization

1. Keep routes flat when possible
2. Use descriptive route names
3. Group related routes under common prefixes
4. Maintain consistent naming patterns

#### State Management

1. Use URL parameters for shareable state
2. Preserve query parameters when navigating
3. Store temporary UI state in React state, not routes
4. Use route state for navigation history

#### Performance

1. Lazy load route components
2. Implement route-level code splitting
3. Cache route data when appropriate
4. Clean up resources on route change

### Common Patterns

#### Tabs Within Applet

For tab-based navigation:

```typescript
import { Tabs, Tab } from '@mui/material';

export const Applet = ({ mountPath }) => {
  const { currentPath, navigateTo } = useHashNavigation(mountPath);
  
  return (
    <>
      <Tabs value={currentPath} onChange={(_, path) => navigateTo(path)}>
        <Tab label="Users" value="/" />
        <Tab label="Analytics" value="/analytics" />
      </Tabs>
      {renderCurrentRoute()}
    </>
  );
};
```

#### Nested Routes

For multi-level navigation:

```typescript
const getRouteSegments = (path: string) => {
  return path.split('/').filter(Boolean);
};

const renderRoute = () => {
  const segments = getRouteSegments(currentPath);
  
  if (segments[0] === 'users') {
    if (segments[1] === 'profile') {
      return <UserProfile userId={segments[2]} />;
    }
    return <UserList filter={segments[1]} />;
  }
  
  return <Dashboard />;
};
```

#### Route Guards

For permission-based routing:

```typescript
const ProtectedRoute = ({ children, permission }) => {
  const { hasPermission } = useRoleManagement();
  
  if (!hasPermission(permission)) {
    return <AccessDenied />;
  }
  
  return children;
};

// Usage
if (currentPath === '/admin') {
  return (
    <ProtectedRoute permission="admin-access">
      <AdminPanel />
    </ProtectedRoute>
  );
}
```

### Testing Routes

#### Unit Testing

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useHashNavigation } from '@smbc/applet-core';

test('navigation updates current path', () => {
  window.location.hash = '#/my-applet/test';
  
  const { result } = renderHook(() => 
    useHashNavigation('/my-applet')
  );
  
  expect(result.current.currentPath).toBe('/test');
  
  result.current.navigateTo('/new-route');
  expect(window.location.hash).toBe('#/my-applet/new-route');
});
```

#### Integration Testing

```typescript
test('applet handles route changes', async () => {
  render(<Applet mountPath="/my-applet" />);
  
  // Simulate navigation
  window.location.hash = '#/my-applet/users';
  
  await waitFor(() => {
    expect(screen.getByText('User List')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Common Issues

1. **Routes not updating**: Ensure you're using the `navigateTo` function exclusively for navigation
2. **Wrong current path**: Verify the `mountPath` prop matches your applet's actual mount point
3. **Navigation not showing**: Check that your applet definition exports navigation
4. **Deep links not working**: Ensure all route handlers account for direct navigation
5. **Hash conflicts**: Never set `window.location.hash` directly - this violates the architecture where hash reflects state rather than driving it

### Debugging

Enable route debugging:

```typescript
const { currentPath, navigateTo } = useHashNavigation(mountPath);

useEffect(() => {
  console.log('Route changed:', currentPath);
}, [currentPath]);
```

## Migration Considerations

When updating existing applets:

1. Replace any direct hash manipulation with `navigateTo` calls
2. Update route paths to be relative to mount point
3. Export navigation in applet definition for host integration
4. Test deep linking to all routes
5. Verify browser back/forward behavior
6. Ensure all navigation uses the routing system - hash should only reflect state, never drive it

## API Reference

### useHashNavigation

```typescript
interface UseHashNavigationResult {
  currentPath: string;
  navigateTo: (path: string) => void;
}

function useHashNavigation(mountPath: string): UseHashNavigationResult;
```

### Navigation Types

```typescript
interface NavigationRoute {
  path: string;
  label: string;
  icon?: React.ComponentType;
  requiredPermissions?: string[];
}

interface NavigationGroup {
  id: string;
  label: string;
  icon?: string;
  routes: NavigationRoute[];
}

interface AppletNavigation {
  homeRoute?: NavigationRoute;
  routes?: NavigationRoute[];
  groups?: NavigationGroup[];
}
```