# 🚀 Getting Started

Create a complete application in under 5 minutes:

```bash
# Create a new Vite React app
npm create vite@latest my-smbc-app -- --template react-ts
cd my-smbc-app

# Install SMBC dependencies
npm install @smbc/mui-host @smbc/user-management-mui

# Create your app
echo 'import { createApp } from "@smbc/mui-host"

createApp({
  config: {
    applets: ["@smbc/user-management-mui"],
    roles: ["Guest", "Staff", "Admin"],
    app: { name: "My SMBC App" }
  }
})' > src/main.ts

# Start development
npm run dev
```

🎉 **That's it!** Your app now includes:

- User management features
- Role-based permissions
- MUI design system
- Mock data for development
- Type-safe API client

## 🔧 Integration: Existing Application

Add SMBC applets to your existing React application:

### 1. Install Dependencies

```bash
npm install @smbc/mui-host @smbc/user-management-mui
```

### 2. Wrap Your App

```typescript
// App.tsx
import { AppletProvider } from '@smbc/mui-host'

function App() {
  return (
    <AppletProvider
      applets={['@smbc/user-management-mui']}
      roles={['Staff', 'Admin']}
      user={currentUser}
    >
      {/* Your existing app */}
      <YourExistingRoutes />
    </AppletProvider>
  )
}
```

### 3. Add Applet Routes

```typescript
// Routes.tsx
import { AppletRoute } from '@smbc/mui-host'

<Routes>
  {/* Your existing routes */}
  <Route path="/users/*" element={<AppletRoute applet="user-management" />} />
</Routes>
```

## 📦 Available Applets

| Package                     | Description              | Features                      |
| --------------------------- | ------------------------ | ----------------------------- |
| `@smbc/user-management-mui` | Complete user management | User CRUD, roles, permissions |

## 🎯 Configuration Options

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
  app: {
    name: 'My Enterprise App',
    version: '1.0.0',
    logo: '/logo.svg'
  },
  permissions: {
    permissionMappings: {
      'user-management': {
        'VIEW_USERS': ['Staff', 'Admin'],
        'EDIT_USERS': ['Admin']
      }
    }
  },
  // Uses @smbc/design-tokens for consistent styling
}
```

## 🛠️ Development Features

### Mock Data

All applets include realistic mock data powered by MSW (Mock Service Worker):

- No backend required for UI development
- Realistic API responses
- Automatic data generation

### Type Safety

Complete TypeScript support:

- Generated API types from OpenAPI schemas
- Type-safe component props
- IntelliSense for all applet features

### Hot Reload

Changes to your configuration automatically reload:

- Add/remove applets instantly
- Update permissions in real-time
- Design token updates apply immediately

## 🔐 Permission System

SMBC includes a powerful role-based permission system:

```typescript
// Define roles for your application
roles: ['Guest', 'Staff', 'Admin']

// Map permissions to roles per applet
permissionMappings: {
  'user-management': {
    'VIEW_USERS': ['Staff', 'Admin'],
    'EDIT_USERS': ['Admin'],
    'DELETE_USERS': ['Admin']
  }
}
```

Components automatically hide/show based on user permissions.

## 🎨 Design System

The SMBC Applets Platform uses a centralized design token system:

- **Colors, typography, spacing, borders** - Consistent visual elements
- **Light/dark mode support** - Automatic theme switching
- **Responsive breakpoints** - Mobile-first design approach

Design tokens are managed through `@smbc/design-tokens`.

All applets automatically use the design token system for consistency.

## 📱 Responsive Design

SMBC applets are mobile-first and responsive:

- Optimized for mobile, tablet, and desktop
- Touch-friendly interface elements
- Adaptive layouts for all screen sizes

## 🚀 Production Deployment

### Build Your App

```bash
npm run build
```

### Environment Variables

```bash
# Optional: Override API endpoints
VITE_API_BASE_URL=https://api.smbcgroup.com
```

## 🆘 Troubleshooting

### Build Errors?

- Ensure all peer dependencies are installed
- Check TypeScript version compatibility

### Getting Help

- Check the [Architecture docs](./ARCHITECTURE.md) for system overview
- Review [Integration guide](./INTEGRATION.md) for advanced patterns
- See [Development workflow](./DEVELOPMENT.md) for building custom applets
