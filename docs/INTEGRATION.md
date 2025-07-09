# Integration Guide

## Adding to Existing Applications

### Basic Integration

```typescript
import { AppletProvider, AppletRoute } from '@smbc/mui-applet-host'

<AppletProvider applets={['@smbc/user-management-mui']} roles={roles} user={user}>
  <Routes>
    <Route path="/users/*" element={<AppletRoute applet="user-management" />} />
  </Routes>
</AppletProvider>
```

### Multiple Applets

```typescript
<AppletProvider
  applets={[
    '@smbc/user-management-mui',
    '@company/product-catalog-mui',
    '@company/analytics-mui'
  ]}
  roles={['Guest', 'Staff', 'Admin']}
  user={authenticatedUser}
>
  <Routes>
    <Route path="/users/*" element={<AppletRoute applet="user-management" />} />
    <Route path="/products/*" element={<AppletRoute applet="product-catalog" />} />
    <Route path="/analytics/*" element={<AppletRoute applet="analytics" />} />
  </Routes>
</AppletProvider>
```

## Custom API Configuration

### API Base URL

```typescript
<AppletProvider
  config={{
    api: {
      baseUrl: 'https://api.example.com',
      headers: { 'Authorization': `Bearer ${token}` }
    }
  }}
>
```

### Per-Applet API Configuration

```typescript
<AppletProvider
  config={{
    applets: {
      'user-management': {
        api: { baseUrl: 'https://users-api.example.com' }
      },
      'product-catalog': {
        api: { baseUrl: 'https://products-api.example.com' }
      }
    }
  }}
>
```

## Permission Integration

### Role Mappings

```typescript
const permissionMappings = {
  'user-management': {
    'VIEW_USERS': ['ADMIN', 'MANAGER'],
    'EDIT_USERS': ['ADMIN'],
    'DELETE_USERS': ['ADMIN']
  },
  'product-catalog': {
    'VIEW_PRODUCTS': ['ADMIN', 'MANAGER', 'STAFF'],
    'EDIT_PRODUCTS': ['ADMIN', 'MANAGER'],
    'DELETE_PRODUCTS': ['ADMIN']
  }
}

<AppletProvider permissionMappings={permissionMappings}>
```

### Custom Permission Logic

```typescript
function hasPermission(user, applet, permission) {
  const userRoles = user.roles
  const allowedRoles = permissionMappings[applet]?.[permission] || []
  return userRoles.some(role => allowedRoles.includes(role))
}

<AppletProvider customPermissionChecker={hasPermission}>
```

## Theme Integration

### Custom Theme

```typescript
import { createTheme } from '@mui/material/styles'

const customTheme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' }
  }
})

<ThemeProvider theme={customTheme}>
  <AppletProvider applets={applets}>
    <App />
  </AppletProvider>
</ThemeProvider>
```

### Design Token Override

```typescript
<AppletProvider
  config={{
    theme: {
      tokens: {
        'color-primary': '#custom-color',
        'spacing-base': '8px'
      }
    }
  }}
>
```

## State Management Integration

### Redux Integration

```typescript
import { useSelector, useDispatch } from 'react-redux'

function App() {
  const user = useSelector(state => state.auth.user)
  const roles = useSelector(state => state.auth.roles)
  
  return (
    <AppletProvider applets={applets} user={user} roles={roles}>
      <Routes />
    </AppletProvider>
  )
}
```

### Custom State

```typescript
function App() {
  const [user, setUser] = useState(null)
  const [roles, setRoles] = useState([])
  
  useEffect(() => {
    // Load user data
    authService.getCurrentUser().then(setUser)
    authService.getUserRoles().then(setRoles)
  }, [])
  
  return (
    <AppletProvider applets={applets} user={user} roles={roles}>
      <Routes />
    </AppletProvider>
  )
}
```

## Error Handling

### Global Error Boundary

```typescript
import { ErrorBoundary } from '@smbc/mui-components'

<ErrorBoundary>
  <AppletProvider applets={applets}>
    <App />
  </AppletProvider>
</ErrorBoundary>
```

### Custom Error Handler

```typescript
<AppletProvider
  onError={(error, applet) => {
    console.error(`Error in ${applet}:`, error)
    notificationService.error(`Failed to load ${applet}`)
  }}
>
```

## Performance Optimization

### Lazy Loading

```typescript
const UserManagement = lazy(() => import('@smbc/user-management-mui'))

<Route 
  path="/users/*" 
  element={
    <Suspense fallback={<Loading />}>
      <UserManagement />
    </Suspense>
  } 
/>
```

### Code Splitting

```typescript
// Dynamically import applets based on user permissions
const applets = useMemo(() => {
  const availableApplets = []
  
  if (hasPermission('VIEW_USERS')) {
    availableApplets.push('@smbc/user-management-mui')
  }
  
  if (hasPermission('VIEW_PRODUCTS')) {
    availableApplets.push('@company/product-catalog-mui')
  }
  
  return availableApplets
}, [user.permissions])
```