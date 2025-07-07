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

3. Open your browser to `http://localhost:5173`

## Adding Applets

To add applets to your host application:

1. Install the applet package:
   ```bash
   npm install @smbc/my-applet-mui
   ```

2. Import your applet in `src/app.config.ts`:
   ```typescript
   import myApplet from "@smbc/my-applet-mui";
   ```

3. Add it to the `APPLETS` array:
   ```typescript
   export const APPLETS: AppletMount[] = [
     mountApplet(myApplet, {
       id: "my-applet",
       label: "My Applet",
       path: "/my-applet", 
       icon: MyAppletIcon,
       permissions: [myApplet.permissions.VIEW],
     }),
   ];
   ```

## Configuration

- **User roles**: Edit the `HOST_ROLES` array in `src/app.config.ts`
- **Demo user**: Modify the `demoUser` object in `src/app.config.ts`
- **Host settings**: Update `HOST` constants in `src/app.config.ts`

## Building for Production

```bash
npm run build
```

## Linting and Type Checking

```bash
npm run lint
npm run type-check
```