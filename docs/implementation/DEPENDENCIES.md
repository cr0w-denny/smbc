# SMBC MUI Host - Required Dependencies

When using `@smbc/mui-host`, your application must provide the following peer dependencies. These are externalized to avoid duplication and ensure proper version management.

## Quick Install (All Dependencies)

For greenfield apps, install all required dependencies at once:

```bash
# Core framework
npm install react react-dom

# MUI ecosystem
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled

# Data fetching and API tools
npm install @tanstack/react-query @tanstack/react-query-devtools

# Development and utilities
npm install msw swagger-ui-react @faker-js/faker openapi-sampler

# API client tools (if using OpenAPI features)
npm install openapi-fetch openapi-react-query
```

## Dependency Categories

### **Required - Core Framework (Always needed)**

```bash
npm install react@^18.0.0 react-dom@^18.0.0
```

### **Required - MUI Ecosystem (For any MUI components)**

```bash
npm install @mui/material@^7.0.0 @mui/icons-material@^7.0.0
npm install @emotion/react@^11.10.0 @emotion/styled@^11.10.0
```

### **Required - Data Fetching (For any query features)**

```bash
npm install @tanstack/react-query@^5.0.0
npm install @tanstack/react-query-devtools@^5.0.0  # Development only
```

### **Optional - Development & Mocking**

```bash
npm install msw@^2.0.0                    # Mock Service Worker
npm install @faker-js/faker@^8.0.0        # Mock data generation
npm install openapi-sampler@^1.3.0        # OpenAPI mock data
```

### **Optional - Documentation**

```bash
npm install swagger-ui-react@^5.25.0      # API documentation UI
```

**Note:** If using API documentation features, add this CSS import to your main.tsx:

```typescript
import "swagger-ui-react/swagger-ui.css";
```

### **Optional - API Client Tools**

```bash
npm install openapi-fetch@^0.14.0         # OpenAPI HTTP client
npm install openapi-react-query@^0.5.0    # React Query + OpenAPI integration
```

## Minimal Setup Example

For a basic setup with user management:

```bash
# Create new React app
npm create vite@latest my-app -- --template react-ts
cd my-app

# Install SMBC packages
npm install @smbc/mui-host @smbc/mui-user-management

# Install required peer dependencies
npm install react@^18.0.0 react-dom@^18.0.0
npm install @mui/material@^7.0.0 @mui/icons-material@^7.0.0
npm install @emotion/react@^11.10.0 @emotion/styled@^11.10.0
npm install @tanstack/react-query@^5.0.0
npm install msw@^2.0.0

# Start development
npm run dev
```

## Usage Examples

### Greenfield App (Full App Shell)

```typescript
import { createApp } from "@smbc/mui-host";

createApp({
  config: {
    applets: ["@smbc/mui-user-management"],
    roles: ["Guest", "Staff", "Admin"],
    app: { name: "My SMBC App" },
  },
});
```

### Existing App Integration

```typescript
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

## Why These Dependencies Are Externalized

**Performance**: Avoids duplicate bundles when multiple SMBC packages are used together.

**Version Control**: Ensures consistent versions across your entire application.

**Bundle Size**: Reduces overall bundle size through shared dependencies.

## Troubleshooting

### Missing Peer Dependencies

If you see warnings like `WARN peer dep missing`, install the missing dependencies:

```bash
npm install <missing-dependency>
```

### Version Conflicts

If you see peer dependency warnings, check that your installed versions match the required ranges above.

### MSW Setup (Development)

For mock data to work properly, ensure MSW is set up in your app:

```typescript
// src/main.tsx
async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  const { worker } = await import('./mocks/browser')
  return worker.start()
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
})
```
