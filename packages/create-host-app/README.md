# @smbc/create-host-app

Create a new SMBC host application with pre-configured applets, development tools, and mock data generation.

## Quick Start

```bash
npm create @smbc/host-app my-host-app
cd my-host-app
npm install
npm run setup  # For mui-devtools template
npm run dev
```

## Templates

### `mui-devtools` (Recommended)

Full-featured host application with:

- Complete MUI-themed interface with navigation drawer
- Mock Service Worker for API simulation
- Environment switching (mock/dev/staging/prod)
- Role-based permissions with live preview
- React Query dev tools for debugging
- API documentation modal for each applet
- Automatic mock generation from applet APIs

### `basic`

Minimal host application with:

- Basic MUI theming and CSS baseline
- React Query setup
- Simple applet mounting structure

## Usage

### Command Line

```bash
# Interactive mode
npm create @smbc/host-app

# Direct creation
npm create @smbc/host-app my-app

# Specify template
npm create @smbc/host-app my-app -- --template basic

# Custom directory
npm create @smbc/host-app my-app -- --dir custom-folder
```

### Programmatic

```javascript
import { createHostApp } from "@smbc/create-host-app";

await createHostApp({
  name: "my-host-app",
  template: "mui-devtools",
  directory: "./my-custom-dir",
});
```

## Version Management

This package automatically includes the correct versions of all `@smbc/*` packages that were available when it was built. This ensures consistent and compatible package installations.

### How Versions Are Determined

1. **Build Time Generation**: When `@smbc/applet-meta` is built, it scans the monorepo and generates a versions manifest
2. **Embedded Versions**: These versions are embedded in `@smbc/applet-meta` and imported by `create-host-app`
3. **Automatic Resolution**: When creating a host app, specific versions (e.g., `^0.0.1`) are used instead of `"latest"`

### Version Update Process

The version update process uses changesets to ensure coordinated releases:

#### 1. Regular Development

```bash
# Developer makes changes to @smbc/mui-components
git add .
git commit -m "feat: improve button styling"

# Add changeset for the changes
npx changeset
# Select @smbc/mui-components: patch
# Describe: "Improve button styling and hover effects"
```

#### 2. Release Applet Changes

```bash
# When ready to release
npx changeset version  # Bumps mui-components to 0.0.2
npx changeset publish  # Publishes mui-components@0.0.2
```

At this point, `create-host-app` still references the old version (`^0.0.1`) of `mui-components`.

#### 3. Update Package Versions (Periodic)

When you want `create-host-app` to include the latest versions:

```bash
# Step 1: Update applet-meta with current versions
cd packages/applet-meta
npm run build          # Regenerate versions from monorepo state
npx changeset          # Create changeset for applet-meta
# Select @smbc/applet-meta: patch
# Describe: "Update package versions to include mui-components@0.0.2"

# Step 2: Update create-host-app to use new applet-meta
cd ../create-host-app
npx changeset          # Create changeset for create-host-app
# Select @smbc/create-host-app: patch
# Describe: "Update to use latest package versions from applet-meta"

# Step 3: Release both packages
npx changeset version  # Bumps both packages
npx changeset publish  # Publishes both packages
```

#### 4. Result

Now when users run `npm create @smbc/host-app`, they get:

- `mui-components: ^0.0.2` (latest version)
- All other packages at their current versions
- Consistent, tested version combinations

### Update Frequency

**Recommended approach**: Update versions periodically rather than with every individual package change.

**Good times to update**:

- Before major announcements or releases
- Weekly/monthly on a schedule
- When users report compatibility issues
- After batches of related applet updates

**Why not automatic?**:

- Avoids constant churn and noise in releases
- Allows for batching related changes together
- Gives time to test version combinations
- Keeps the process predictable and manageable

## Generated Host App Structure

```
my-host-app/
├── public/
├── src/
│   ├── generated/          # Auto-generated mocks (mui-devtools only)
│   ├── App.tsx            # Main app component
│   ├── applet.config.ts   # Applet configuration
│   ├── main.tsx          # Entry point
│   └── vite-env.d.ts     # Type definitions
├── index.html
├── package.json          # With correct @smbc package versions
├── tsconfig.json
└── vite.config.ts
```

## Adding Applets to Your Host App

1. **Install applet packages**:

   ```bash
   npm install @smbc/usage-stats-mui @smbc/usage-stats-api
   ```

2. **Update `src/applet.config.ts`**:

   ```typescript
   import usageStatsApplet from "@smbc/usage-stats-mui";
   import { Analytics } from "@mui/icons-material";

   export const APPLETS = [
     mountApplet(usageStatsApplet, {
       id: "usage-stats",
       label: "Usage Analytics",
       path: "/usage-stats",
       icon: Analytics,
       permissions: [usageStatsApplet.permissions.VIEW_USAGE_STATS],
       version: "1.0.0",
     }),
   ];
   ```

3. **Generate mocks** (mui-devtools template):

   ```bash
   npm run generate-mocks
   ```

4. **Start development**:
   ```bash
   npm run dev
   ```

## Environment Configuration

Create a `.env` file to customize your development environment:

```bash
# Disable mock service worker to use real APIs
VITE_DISABLE_MSW=false

# Customize development port
VITE_PORT=3000
```

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run setup` - Install applets and generate mocks (mui-devtools)
- `npm run generate-mocks` - Generate fresh mock data (mui-devtools)
- `npm run lint` - Run ESLint
