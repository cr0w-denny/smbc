# @smbc/applet-host

Framework-agnostic applet host package with automated setup and configuration.

## Installation

```bash
npm install @smbc/applet-host
```

The postinstall script will automatically:
1. Detect your framework (MUI, etc.)
2. Show available applets
3. Generate `applet.config.ts` with your selections
4. Install selected applet packages

## Basic Navigation Menu

After installation, you can add navigation and routing to your app:

```tsx
import { AppletHost, AppletMenu, AppletRouter } from '@smbc/applet-host';
import { APPLETS } from './applet.config';

function App() {
  return (
    <AppletHost>
      <div style={{ display: 'flex' }}>
        {/* Sidebar navigation */}
        <div style={{ width: '240px', background: '#f5f5f5', padding: '1rem' }}>
          <h2>My App</h2>
          <AppletMenu applets={APPLETS} />
        </div>
        
        {/* Main content area */}
        <div style={{ flex: 1, padding: '2rem' }}>
          <AppletRouter applets={APPLETS} />
        </div>
      </div>
    </AppletHost>
  );
}
```

The `AppletHost` component provides all necessary context providers including:
- Feature flag management
- React Query client 
- Applet core context
- User and role management

### Horizontal Menu

For a horizontal menu (e.g., in a header):

```tsx
<AppletMenu 
  applets={APPLETS} 
  horizontal={true}
  className="header-menu"
/>
```

### With Default Component

You can provide a default component to render when no applets match:

```tsx
function Welcome() {
  return <h1>Welcome! Select an applet to get started.</h1>;
}

<AppletRouter applets={APPLETS} defaultComponent={Welcome} />
```

## Component Props

### AppletMenu Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `applets` | `AppletMount[]` | required | Array of applet configurations from `APPLETS` |
| `className` | `string` | `''` | Custom CSS class |
| `horizontal` | `boolean` | `false` | Render as horizontal menu |

### AppletRouter Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `applets` | `AppletMount[]` | required | Array of applet configurations from `APPLETS` |
| `defaultComponent` | `React.ComponentType` | `undefined` | Optional component to render when no routes match |

### AppletHost Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | required | Child components to render |
| `featureFlags` | `FeatureFlagConfig[]` | `[darkMode, mockData]` | Feature flag configurations |
| `initialUser` | `User \| null` | `null` | Initial user data |
| `initialRoleConfig` | `RoleConfig` | `Guest/User roles` | Role and permission configuration |
| `queryClient` | `QueryClient` | default instance | Custom React Query client |
| `storagePrefix` | `string` | `"smbcApplet"` | localStorage prefix for feature flags |

> **Note**: `AppletRouter` is a pure routing component with no visual output. It renders the matched applet component or the default component or null.

## Hash-Based Navigation

The AppletMenu component uses hash-based routing for navigation:
- URLs use the format `#/applet-path`
- Integrates with the `useHashNavigation()` hook from `@smbc/applet-core`
- Automatically highlights the current active applet
- Works with browser back/forward buttons

## Configuration

Your `applet.config.ts` file contains:
- `APPLETS`: Array of mounted applets
- `HOST`: Host configuration
- `ROLE_CONFIG`: Permission configuration
- Navigation helpers and comments

## Manual Configuration

You can also manually configure applets:

```tsx
import { mountApplet } from '@smbc/applet-core';
import usageStatsApplet from '@smbc/usage-stats-mui';
import { BarChart } from '@mui/icons-material';

export const APPLETS = [
  mountApplet(usageStatsApplet, {
    id: "usage-stats",
    label: "Usage Stats",
    path: "/usage-stats",
    icon: BarChart,
    permissions: [],
    version: usageStatsApplet.version,
  }),
];
```