# Integration Guide

This guide covers advanced integration patterns for adding SMBC applets to existing applications, enterprise scenarios, and custom implementations.

## 🏢 Integration Patterns

### Micro-Frontend Architecture

Use a microfrontend approach without the module federation complexity:

```typescript
// main-app/src/App.tsx
import { AppletProvider } from '@smbc/mui-host'
import { TeamARoutes, TeamBRoutes } from './routes'

function App() {
  return (
    <AppletProvider
      applets={[
        '@smbc/user-management-mui',
        '@company/team-a-applets',
        '@company/team-b-applets'
      ]}
      roles={enterpriseRoles}
      user={authenticatedUser}
    >
      <MainLayout>
        <Routes>
          <Route path="/admin/*" element={<TeamARoutes />} />
          <Route path="/operations/*" element={<TeamBRoutes />} />
          <Route path="/users/*" element={<AppletRoute applet="user-management" />} />
        </Routes>
      </MainLayout>
    </AppletProvider>
  )
}
```

### Gradual Migration

Migrate existing applications piece by piece:

```typescript
// Phase 1: Add user management only
<AppletProvider applets={['@smbc/user-management-mui']}>
  <Routes>
    {/* Existing routes */}
    <Route path="/legacy-dashboard" element={<LegacyDashboard />} />
    <Route path="/legacy-reports" element={<LegacyReports />} />

    {/* New applet route */}
    <Route path="/users/*" element={<AppletRoute applet="user-management" />} />
  </Routes>
</AppletProvider>

// Phase 2: Add more applets over time
```

### Multi-Tenant SaaS

Support multiple organizations with isolated data:

```typescript
function TenantApp({ tenantId }: { tenantId: string }) {
  return (
    <AppletProvider
      applets={['@smbc/user-management-mui']}
      roles={tenantRoles}
      user={tenantUser}
      config={{
        apiBaseUrl: `https://api.yourapp.com/tenant/${tenantId}`,
        tenant: { id: tenantId, name: tenantName }
      }}
    >
      <TenantLayout>
        <AppletRoute applet="user-management" />
      </TenantLayout>
    </AppletProvider>
  )
}
```

## 🔐 Permission Integration

### Custom Authentication

Integrate with your existing auth system:

```typescript
import { AppletProvider } from '@smbc/mui-host'
import { useAuth } from './auth'

function App() {
  const { user, login, logout, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />
  }

  return (
    <AppletProvider
      applets={['@smbc/user-management-mui']}
      roles={user.roles}
      user={user}
      config={{
        auth: {
          onLogout: logout,
          refreshToken: user.refreshToken
        }
      }}
    >
      <AuthenticatedApp />
    </AppletProvider>
  )
}
```

### Simple Role-Based Permissions

Applets use a straightforward role-based access control system:

```typescript
// Your existing role system
const userRoles = ['COMPANY_ADMIN', 'DEPT_MANAGER', 'EMPLOYEE']

// Map to applet permissions
const permissionMappings = {
  'user-management': {
    'VIEW_USERS': ['COMPANY_ADMIN', 'DEPT_MANAGER'],
    'EDIT_USERS': ['COMPANY_ADMIN', 'DEPT_MANAGER'],
    'DELETE_USERS': ['COMPANY_ADMIN'],
    'MANAGE_ROLES': ['COMPANY_ADMIN']
  }
}

<AppletProvider
  roles={userRoles}
  config={{ permissions: { permissionMappings } }}
>
```

### Dynamic Permissions

Load permissions from your backend:

```typescript
function App() {
  const [permissions, setPermissions] = useState(null)

  useEffect(() => {
    fetchUserPermissions(userId).then(setPermissions)
  }, [userId])

  if (!permissions) return <Loading />

  return (
    <AppletProvider
      roles={permissions.roles}
      config={{
        permissions: {
          permissionMappings: permissions.mappings
        }
      }}
    >
```

## 📊 Data Integration

### Custom API Configuration

Point to your existing backend services:

```typescript
<AppletProvider
  applets={['@smbc/user-management-mui']}
  config={{
    api: {
      baseUrl: 'https://api.smbcgroup.com',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Company-ID': companyId
      },
      endpoints: {
        'user-management': '/v2/users'
      }
    }
  }}
>
```

### Real-time Data Sync

Keep data synchronized across systems:

```typescript
import { useQueryClient } from "@tanstack/react-query";

function useDataSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const websocket = new WebSocket("wss://api.smbcgroup.com/sync");

    websocket.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);

      if (type === "user-updated") {
        queryClient.invalidateQueries(["users"]);
      }
    };

    return () => websocket.close();
  }, [queryClient]);
}
```

## 🎨 UI Integration

### Custom Layout Components

Wrap applets in your existing layout:

```typescript
import { AppletRoute } from '@smbc/mui-host'

function CompanyLayout({ children }) {
  return (
    <div className="company-layout">
      <CompanyHeader />
      <CompanySidebar />
      <main className="content">
        {children}
      </main>
    </div>
  )
}

<Routes>
  <Route path="/users/*" element={
    <CompanyLayout>
      <AppletRoute applet="user-management" />
    </CompanyLayout>
  } />
</Routes>
```

### Custom Navigation

Integrate with your existing navigation:

```typescript
import { useAppletNavigation } from '@smbc/mui-host'

function CompanySidebar() {
  const { getAppletRoutes } = useAppletNavigation()
  const userManagementRoutes = getAppletRoutes('user-management')

  return (
    <nav>
      {/* Your existing nav items */}
      <NavSection title="User Management">
        {userManagementRoutes.map(route => (
          <NavItem key={route.path} to={route.path}>
            {route.label}
          </NavItem>
        ))}
      </NavSection>
    </nav>
  )
}
```

## 🚀 Performance Optimization

### Code Splitting

Load applets on demand:

```typescript
import { lazy, Suspense } from 'react'

const UserManagement = lazy(() =>
  import('@smbc/user-management-mui').then(module => ({
    default: () => <AppletRoute applet="user-management" />
  }))
)

<Route path="/users/*" element={
  <Suspense fallback={<Loading />}>
    <UserManagement />
  </Suspense>
} />
```

### Caching Strategy

Optimize data fetching across applets:

```typescript
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  }
})

<AppletProvider queryClient={queryClient}>
```

## 🧪 Testing Integration

### E2E Testing

Test applet integration in your app:

```typescript
// cypress/integration/user-management.spec.ts
describe("User Management Integration", () => {
  beforeEach(() => {
    cy.login("admin@company.com");
    cy.visit("/users");
  });

  it("should load user management applet", () => {
    cy.get('[data-testid="user-table"]').should("be.visible");
    cy.get('[data-testid="add-user-button"]').should("be.visible");
  });

  it("should respect permissions", () => {
    cy.login("viewer@company.com");
    cy.visit("/users");
    cy.get('[data-testid="add-user-button"]').should("not.exist");
  });
});
```

### Component Testing

Test applet components in isolation:

```typescript
import { render } from '@testing-library/react'
import { AppletProvider } from '@smbc/mui-host'

function renderWithAppletProvider(component, options = {}) {
  return render(
    <AppletProvider
      applets={['@smbc/user-management-mui']}
      roles={['Admin']}
      {...options}
    >
      {component}
    </AppletProvider>
  )
}

test('user table renders correctly', () => {
  renderWithAppletProvider(<AppletRoute applet="user-management" />)
  // Test applet behavior
})
```
