# Manual Applet Setup Tutorial

This tutorial covers the bare minimum steps for configuring an applet and connecting it with mocks, AppletRouter, and the application shell.

## Prerequisites

- Existing monorepo with applet packages
- An applet already created in `/applets/` directory
- Core SMBC packages available (`@smbc/applet-core`, `@smbc/applet-host`, etc.)

## Step 1: Create App Directory Structure

Create your app directory with the following structure:

```
apps/your-app/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── public/
│   └── mockServiceWorker.js
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── applet.config.ts
    └── vite-env.d.ts
```

## Step 2: Configure package.json

Create `package.json` with essential dependencies and scripts:

```json
{
  "name": "@smbc/your-app",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "generate-mocks": "npx openapi-msw ../your-applet/api/api.yaml -o ./src/generated/mocks --base-url '/api/v1/your-applet'"
  },
  "dependencies": {
    "@mui/material": "^7.2.0",
    "@mui/icons-material": "^7.2.0",
    "@smbc/applet-core": "*",
    "@smbc/applet-host": "*",
    "@smbc/mui-applet-core": "*",
    "@smbc/mui-components": "*",
    "@smbc/dataview": "*",
    "@smbc/dataview-mui": "*",
    "@tanstack/react-query": "^5.65.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.4",
    "msw": "^2.8.2",
    "openapi-msw": "^6.0.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0"
  },
  "msw": {
    "workerDirectory": ["public"]
  }
}
```

## Step 3: Configure Vite

Create `vite.config.ts`:

```typescript
import { defineConfig, mergeConfig } from "vite";
import sharedConfig from "../../vite.shared.config";
import path from "path";

export default defineConfig(
  mergeConfig(sharedConfig, {
    server: {
      port: 3001,
    },
    resolve: {
      alias:
        process.env.NODE_ENV === "development"
          ? {
              // Add aliases for your applet during development
              "@smbc/your-applet": path.resolve(
                __dirname,
                "../../applets/your-applet/mui/src",
              ),
            }
          : {},
    },
  }),
);
```

## Step 4: Configure TypeScript

Create `tsconfig.json`:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"]
}
```

## Step 5: Create HTML Entry Point

Create `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## Step 6: Configure Applet Registration

Create `src/applet.config.ts`:

```typescript
import { AppletMount, mountApplet } from "@smbc/applet-host";
import yourApplet from "@smbc/your-applet";
import DashboardIcon from "@mui/icons-material/Dashboard";

// Define role hierarchy
const ROLES = {
  GUEST: 0,
  USER: 1,
  STAFF: 2,
  MANAGER: 3,
  ADMIN: 4,
} as const;

// Mount your applet with configuration
export const APPLETS: AppletMount[] = [
  mountApplet(yourApplet, {
    id: "your-applet",
    label: "Your Applet",
    path: "/your-applet",
    icon: DashboardIcon,
    permissions: [yourApplet.permissions.VIEW], // Use applet's defined permissions
    apiBaseUrl: "/api/v1/your-applet",
  }),
];

// Generate permission mappings based on minimum roles
export const PERMISSION_MAPPINGS = ...;
```

## Step 7: Set Up Bootstrap with MSW

Create `src/main.tsx`:

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

async function enableMocking() {
  if (import.meta.env.VITE_DISABLE_MSW === "true") {
    return;
  }

  if (import.meta.env.MODE !== "development") {
    return;
  }

  const { worker } = await import("./generated/mocks");

  return worker.start({
    onUnhandledRequest: "bypass",
  });
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
```

## Step 8: Create Main App Component

Create `src/App.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AppletProvider, AppletRouter } from "@smbc/applet-host";
import { FeatureFlagProvider } from "@smbc/applet-core";
import { DataViewProvider } from "@smbc/dataview";
import { AppShell } from "@smbc/mui-components";
import { useHashNavigation } from "@smbc/applet-core";
import { useState } from "react";
import { APPLETS, MENUS, PERMISSION_MAPPINGS, demoUser } from "./applet.config";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Create themes
  const appTheme = createTheme({
    palette: {
      mode: "dark", // App chrome is always dark
    },
  });

  const contentTheme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  // Set up hash navigation
  const { navigate, location } = useHashNavigation();

  // Default component for unmatched routes
  const DefaultComponent = () => (
    <div style={{ padding: 24 }}>
      <h1>Welcome</h1>
      <p>Select an applet from the navigation menu.</p>
    </div>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppletProvider applets={APPLETS} theme={contentTheme}>
        <FeatureFlagProvider
          configs={[
            {
              matcher: () => true,
              flags: {
                "dataview.enableTransactions": false,
              },
            },
          ]}
        >
          <DataViewProvider enableTransactions={false}>
            <ThemeProvider theme={appTheme}>
              <CssBaseline />
              <AppShell
                title="Your App"
                menus={MENUS}
                user={demoUser}
                permissionMappings={PERMISSION_MAPPINGS}
                darkMode={darkMode}
                onDarkModeToggle={() => setDarkMode(!darkMode)}
                currentPath={location.pathname}
                onNavigate={navigate}
              >
                <ThemeProvider theme={contentTheme}>
                  <AppletRouter defaultComponent={DefaultComponent} />
                </ThemeProvider>
              </AppShell>
            </ThemeProvider>
          </DataViewProvider>
        </FeatureFlagProvider>
      </AppletProvider>
    </QueryClientProvider>
  );
}

export default App;
```

## Step 9: Add Type Definitions

Create `src/vite-env.d.ts`:

```typescript
/// <reference types="vite/client" />
```

## Step 10: Set Up MSW Service Worker

Download the MSW service worker:

```bash
npx msw init public/ --save
```

This will create `public/mockServiceWorker.js`.

## Step 11: Generate Mock Handlers

If your applet has an OpenAPI specification, generate mock handlers:

```bash
npm run generate-mocks
```

This creates `src/generated/mocks/` directory with:

- `index.ts` - MSW worker setup with all handlers
- `your-applet.ts` - Generated mock handlers for your API

## Step 12: Connect Everything

Your applet should export a default object with this structure:

```typescript
// In your applet (e.g., applets/your-applet/mui/src/index.ts)
export default {
  permissions: {
    VIEW: "your-applet.view",
    EDIT: "your-applet.edit",
  },
  component: YourAppletComponent,
  apiSpec: apiSpec, // OpenAPI spec if available
};
```

## Configuration Summary

The setup flow:

1. **Applet Registration**: Mount applets in `applet.config.ts` with paths, permissions, and API URLs
2. **Provider Hierarchy**: Wrap app with QueryClient → AppletProvider → FeatureFlagProvider → DataViewProvider → ThemeProvider
3. **Navigation**: Use `useHashNavigation` hook and connect to AppShell
4. **Routing**: AppletRouter automatically routes to mounted applets based on path
5. **Mocking**: MSW intercepts API calls in development using generated handlers
6. **Theming**: Dual theme system - dark app chrome, toggleable content theme
7. **Permissions**: Role-based permission system with automatic mapping

## Running the App

1. Generate mocks (if API spec exists): `npm run generate-mocks`
2. Start development server: `npm run dev`
3. Build for production: `npm run build`

The app will:

- Load MSW in development for API mocking
- Route to applets based on URL hash
- Provide navigation via AppShell
- Handle permissions based on user role
- Support dark/light mode toggling for content

## Key Points

- AppletRouter handles routing automatically based on mounted applets
- MSW provides mock API responses without a backend
- Provider hierarchy ensures all applets have access to required context
- Hash navigation enables client-side routing
- Dual theme system separates app chrome from content styling
- Permission system controls feature access based on user roles
