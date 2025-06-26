# SMBC MUI Host Application

A MUI based host application that provides shared infrastructure for SMBC applets using a modular monolith architecture.

## Overview

This host application provides a unified foundation for SMBC applets by offering:

- **Shared Dependencies**: All MUI, React Query, MSW, and routing dependencies
- **Consistent Theme**: Unified MUI design system across all applets
- **Navigation & Routing**: Hash-based navigation with drawer UI
- **Permission System**: Role-based access control for applets
- **API Integration**: Shared query client with mock data support

## Architecture

### Modular Monolith Design

The host uses a **modular monolith** approach where:

- All applets are bundled together at build time
- Applets share common infrastructure and dependencies
- Clean separation of concerns with applet-specific modules
- Type-safe integration across all components

This provides the **benefits of modularity** (clean code organization, separation of concerns) with the **simplicity of monolithic deployment** (single bundle, no coordination complexity).

### Benefits

**For Applets:**
- Small bundle size (externalized dependencies)
- Consistent UI/UX via shared design system
- Shared infrastructure (routing, permissions, API client)

**For Host Application:**
- Central dependency management
- Performance optimization through shared bundles
- Simplified deployment and coordination

## Shared Dependencies

The host provides these dependencies that applets can externalize:

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0", 
  "@mui/material": "^7.1.2",
  "@mui/icons-material": "^7.1.2",
  "@emotion/react": "^11.10.5",
  "@emotion/styled": "^11.10.5",
  "@tanstack/react-query": "^5.0.0",
  "@tanstack/react-query-devtools": "^5.0.0",
  "msw": "^2.0.0"
}
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Build static assets (for hash-based routing)
npm run build:static

# From monorepo root
npm run start:host
```

## Adding New Applets

1. **Create the applet** in `/applets/your-applet/`
2. **Install the applet** as a dependency in this host
3. **Import and configure** the applet in `src/app.config.ts`
4. **Add routing** and navigation as needed

Example configuration:
```typescript
import yourApplet from '@smbc/your-applet-mui';

export const APPLETS = [
  {
    id: 'your-applet',
    label: 'Your Applet',
    routes: [{
      path: '/your-applet',
      component: () => yourApplet.component({ mountPath: '/your-applet' }),
      icon: YourIcon,
      requiredPermissions: [yourApplet.permissions.VIEW.id]
    }]
  }
];
```

## Configuration

### Environment Variables

- `VITE_API_BASE_URL`: Base URL for API endpoints
- Development defaults to mock data via MSW

