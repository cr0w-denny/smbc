# My Host

My Host - SMBC applet host application

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:3000`

## Adding Applets

To add applets to your host application:

1. Import your applet in `src/app.config.ts`:
   ```typescript
   import myApplet from "@smbc/my-applet-mui";
   ```

2. Add it to the `mountApplets` configuration:
   ```typescript
   const { permissionRequirements, mountedApplets } = mountApplets({
     "my-applet": {
       applet: myApplet,
       label: "My Applet",
       path: "/my-applet", 
       icon: MyAppletIcon,
       permissions: {
         VIEW: "User",
         EDIT: "Admin",
       },
     },
   });
   ```

3. The applet will automatically be available in your host application with navigation and routing.

## Configuration

- **User roles**: Edit the `HOST_ROLES` array in `src/app.config.ts`
- **Demo user**: Modify the `demoUser` object in `src/app.config.ts`
- **App settings**: Update `APP_CONSTANTS` in `src/app.config.ts`

## Development Features

### Automatic Development Dashboard

When you install development tools, the home page automatically becomes a development dashboard:

```bash
npm install @smbc/mui-applet-devtools
```

The dashboard shows:
- Current user information and roles
- Available applets in your configuration  
- Development tools and controls

### Mock Data Support

Installing `@smbc/mui-applet-devtools` automatically sets up:
- **MSW Service Worker**: Auto-installed in your public directory
- **Mock Override System**: Per-applet mock files in `src/mocks/`
- **Easy Integration**: Ready-to-use setup helpers

#### Using Mock Overrides

After installation, you'll find:
- `src/mocks/setup.ts` - Integration helper
- `src/mocks/[applet-name].mocks.ts` - Per-applet override files
- `src/mocks/index.ts` - Aggregates all overrides

Example mock override:
```typescript
// src/mocks/user-management.mocks.ts
export const usermanagementMockOverrides = [
  http.get('/api/user-management/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'Custom User', email: 'custom@example.com' }
    ]);
  }),
];
```

#### Enabling Mocks in Your App

Add to your `App.tsx`:
```typescript
import { initializeMockOverrides } from './mocks/setup';

function App() {
  const mockEnabled = useFeatureFlag('mockData');
  
  React.useEffect(() => {
    if (mockEnabled) {
      initializeMockOverrides();
    }
  }, [mockEnabled]);
  
  // ... rest of your app
}
```

### Feature Flags

The template includes a `mockData` feature flag for toggling mock mode. Add more flags as needed:

```typescript
const featureFlags = [
  {
    key: "darkMode",
    defaultValue: false,
    description: "Enable dark mode theme",
    persist: true,
  },
  {
    key: "mockData", 
    defaultValue: false,
    description: "Enable mock data for development",
    persist: true,
  },
];
```

## Building for Production

```bash
npm run build
```

## Linting and Type Checking

```bash
npm run lint
npm run type-check
```