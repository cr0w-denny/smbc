# {{APPLET_DISPLAY_NAME}} Applet

{{APPLET_DESCRIPTION}}

## Getting Started

This is a comprehensive SMBC applet created with `@smbc/create-applet` using the full template.

### Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the applet:
   ```bash
   npm run build
   ```

3. Watch for changes during development:
   ```bash
   npm run dev:build
   ```

### Project Structure

```
src/
├── components/
│   ├── {{APPLET_PASCAL_CASE}}Applet.tsx     # Main applet with routing
│   ├── {{APPLET_PASCAL_CASE}}List.tsx       # List view component
│   └── {{APPLET_PASCAL_CASE}}Detail.tsx     # Detail view component
├── index.ts                          # Applet export
└── permissions.ts                    # Permission definitions
```

### Features

- **List View**: Complete data table with search, filtering, and actions
- **Detail View**: Comprehensive detail page with navigation
- **Routing**: Built-in navigation between list and detail views
- **Permissions**: Granular permission system
- **TypeScript**: Full type safety throughout

### Usage in Host App

1. Import the applet in your host application:
   ```typescript
   import {{APPLET_CAMEL_CASE}}Applet from '@smbc/{{APPLET_NAME}}-mui';
   ```

2. Add to your applet configuration:
   ```typescript
   export const APPLETS: HostAppletDefinition[] = [
     {
       id: '{{APPLET_NAME}}',
       label: '{{APPLET_DISPLAY_NAME}}',
       routes: [{
         path: '/{{APPLET_NAME}}',
         label: '{{APPLET_DISPLAY_NAME}}',
         component: () => {{APPLET_CAMEL_CASE}}Applet.component({ mountPath: '/{{APPLET_NAME}}' }),
         icon: YourIcon,
         requiredPermissions: [{{APPLET_CAMEL_CASE}}Applet.permissions.VIEW.id]
       }]
     }
   ];
   ```

3. Configure permissions:
   ```typescript
   export const roleConfig: RoleConfig = {
     roles: [...HOST_ROLES],
     permissionMappings: {
       '{{APPLET_NAME}}': {
         [{{APPLET_CAMEL_CASE}}Applet.permissions.VIEW.id]: ['User', 'Admin'],
         [{{APPLET_CAMEL_CASE}}Applet.permissions.CREATE.id]: ['Admin'],
         [{{APPLET_CAMEL_CASE}}Applet.permissions.EDIT.id]: ['Admin'],
         [{{APPLET_CAMEL_CASE}}Applet.permissions.DELETE.id]: ['Admin'],
         [{{APPLET_CAMEL_CASE}}Applet.permissions.MANAGE.id]: ['Admin'],
         [{{APPLET_CAMEL_CASE}}Applet.permissions.VIEW_ANALYTICS.id]: ['Admin'],
       }
     }
   };
   ```

### Customization

#### Replace Mock Data

1. Update `{{APPLET_PASCAL_CASE}}List.tsx` to use real API calls
2. Update `{{APPLET_PASCAL_CASE}}Detail.tsx` to fetch real data
3. Add proper TypeScript types for your data models

#### Add API Integration

If you created API packages, integrate them:

```typescript
import { {{APPLET_CAMEL_CASE}}Client } from '@smbc/{{APPLET_NAME}}-client';
import { useQuery } from '@tanstack/react-query';

// In your component
const { data, isLoading } = useQuery({
  queryKey: ['{{APPLET_NAME}}'],
  queryFn: () => {{APPLET_CAMEL_CASE}}Client.GET('/{{APPLET_NAME}}')
});
```

#### Add More Routes

Extend the applet with additional routes:

```typescript
const applet = {
  permissions: {{APPLET_UPPER_CASE}}_PERMISSIONS,
  routes: [
    // ... existing routes
    {
      path: '/settings',
      label: '{{APPLET_DISPLAY_NAME}} Settings',
      component: {{APPLET_PASCAL_CASE}}Settings,
    },
  ],
  // ...
};
```

### Available Scripts

- `npm run build` - Build the library
- `npm run dev:build` - Build and watch for changes
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Clean build artifacts

### Learn More

- [SMBC Documentation](https://github.com/your-org/smbc-docs)
- [MUI Documentation](https://mui.com/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [React Router Documentation](https://reactrouter.com/)