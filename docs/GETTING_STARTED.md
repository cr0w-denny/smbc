# Getting Started

## Installation

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install @smbc/mui-applet-host @smbc/user-management-mui
```

## Configuration

```typescript
// src/main.ts
import { createApp } from "@smbc/mui-applet-host"

createApp({
  config: {
    applets: ["@smbc/user-management-mui"],
    roles: ["Guest", "Staff", "Admin"],
    app: { name: "My App" }
  }
})
```

```bash
npm run dev
```

## Integration with Existing Apps

### 1. Install Dependencies

```bash
npm install @smbc/mui-applet-host @smbc/user-management-mui
```

### 2. Provider Setup

```typescript
// App.tsx
import { AppletProvider } from '@smbc/mui-applet-host'

const roles = ['Guest', 'Staff', 'Admin']
const user = { id: '1', name: 'John', roles: ['Staff'] }

function App() {
  return (
    <AppletProvider applets={['@smbc/user-management-mui']} roles={roles} user={user}>
      <YourExistingApp />
    </AppletProvider>
  )
}
```

### 3. Add Routes

```typescript
import { AppletRoute } from '@smbc/mui-applet-host'
import { Routes, Route } from 'react-router-dom'

<Routes>
  <Route path="/users/*" element={<AppletRoute applet="user-management" />} />
  <Route path="/" element={<Home />} />
</Routes>
```

## API Configuration

### Custom API Base URL

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

### Permission Mappings

```typescript
const permissionMappings = {
  'user-management': {
    'VIEW_USERS': ['ADMIN', 'MANAGER'],
    'EDIT_USERS': ['ADMIN'],
    'DELETE_USERS': ['ADMIN']
  }
}

<AppletProvider permissionMappings={permissionMappings}>
```

## Development Commands

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run lint          # Run ESLint
npm run type-check    # Run TypeScript compiler
```