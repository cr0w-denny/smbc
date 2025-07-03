# {{HOST_DISPLAY_NAME}}

{{HOST_DESCRIPTION}}

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
   import myApplet from "path/to/my-applet";
   ```

2. Add it to the `appletDefinitions` object:
   ```typescript
   export const appletDefinitions: Record<string, HostAppletDefinition> = {
     "my-applet": {
       applet: myApplet,
       permissions: {
         VIEW: "User",
         EDIT: "Admin",
       },
     },
   };
   ```

3. The applet will automatically be available in your host application.

## Configuration

- **User roles**: Edit the `HOST_ROLES` array in `src/app.config.ts`
- **Demo user**: Modify the `demoUser` object in `src/app.config.ts`
- **App settings**: Update `APP_CONSTANTS` in `src/app.config.ts`

## Building for Production

```bash
npm run build
```

## Linting and Type Checking

```bash
npm run lint
npm run type-check
```