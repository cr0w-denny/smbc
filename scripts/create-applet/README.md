# @smbc/create-applet

CLI tool to create SMBC MUI applets for the monorepo. This tool helps you quickly scaffold new applets with proper structure, TypeScript configuration, and optional API packages.

## Quick Start

```bash
# From the monorepo root
npm run create:applet
```

**Generated structure:**

```
applets/my-applet/
├── api/                    # TypeSpec API definition
│   ├── main.tsp
│   ├── package.json
│   └── tspconfig.yaml
├── api-client/             # Generated TypeScript client
│   ├── src/
│   │   ├── client.ts
│   │   ├── mocks/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── django/                 # Django backend template
│   ├── README.md
│   ├── requirements.txt
│   └── package.json
└── mui/
    ├── src/
    │   ├── components/
    │   │   ├── MyAppletComponent.tsx
    │   ├── index.ts
    │   └── permissions.ts
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
```

## Naming Conventions

The CLI enforces and generates proper naming conventions:

- **Applet name**: kebab-case (e.g., `user-management`)
- **Package name**: `@smbc/{applet-name}-mui`
- **Component names**: PascalCase (e.g., `UserManagementComponent`)
- **Permission constants**: UPPER_SNAKE_CASE (e.g., `USER_MANAGEMENT_PERMISSIONS`)

## Integration with Host Apps

After creating an applet, add it to your host application:

1. **Install the applet** (if publishing to npm):

   ```bash
   npm install @smbc/my-applet-mui
   ```

2. **Import in host app**:

   ```typescript
   import myAppletApplet from "@smbc/my-applet-mui";
   ```

3. **Configure in app.config.ts**:

   ```typescript
   export const APPLETS: HostAppletDefinition[] = [
     {
       id: "my-applet",
       label: "My Applet",
       routes: [
         {
           path: "/my-applet",
           label: "My Applet",
           component: () =>
             myAppletApplet.component({ mountPath: "/my-applet" }),
           icon: MyIcon,
           requiredPermissions: [myAppletApplet.permissions.VIEW.id],
         },
       ],
     },
   ];
   ```

4. **Configure permissions**:
   ```typescript
   export const roleConfig: RoleConfig = {
     roles: [...HOST_ROLES],
     permissionMappings: {
       "my-applet": {
         [myAppletApplet.permissions.VIEW.id]: ["User", "Admin"],
         [myAppletApplet.permissions.CREATE.id]: ["Admin"],
         // ... other permissions
       },
     },
   };
   ```
