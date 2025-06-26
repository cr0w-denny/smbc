# {{APPLET_DISPLAY_NAME}} Applet

{{APPLET_DESCRIPTION}}

## Getting Started

This is a basic SMBC applet created with `@smbc/create-applet`.

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
│   └── {{APPLET_PASCAL_CASE}}Component.tsx  # Main component
├── index.ts                          # Applet export
└── permissions.ts                    # Permission definitions
```

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
       routes: {{APPLET_CAMEL_CASE}}Applet.routes.map(route => ({
         ...route,
         path: '/{{APPLET_NAME}}' + (route.path === '/' ? '' : route.path),
         icon: YourIcon,
         requiredPermissions: [{{APPLET_CAMEL_CASE}}Applet.permissions.VIEW.id]
       }))
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
       }
     }
   };
   ```

### Next Steps

1. Customize the `{{APPLET_PASCAL_CASE}}Component` with your business logic
2. Add additional components as needed
3. Integrate with API if using backend services
4. Update permissions to match your requirements
5. Add TypeScript types for your data models

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